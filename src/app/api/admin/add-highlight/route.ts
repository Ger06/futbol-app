import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const adminKey = process.env.ADMIN_API_KEY

  if (!adminKey) {
    console.error('ADMIN_API_KEY not configured')
    return false
  }

  return authHeader === `Bearer ${adminKey}`
}

interface MatchHighlight {
  homeTeam: string
  awayTeam: string
  highlight: string
}

/**
 * Parsea un string con formato:
 * "River vs Boca: El local ganó 4 de los últimos 5 | Racing vs Independiente: Clásico de Avellaneda"
 */
function parseInput(input: string): MatchHighlight[] {
  const results: MatchHighlight[] = []

  // Separar por | para múltiples partidos
  const matchParts = input.split('|').map(s => s.trim()).filter(s => s.length > 0)

  for (const part of matchParts) {
    // Separar equipos del highlight por :
    const colonIndex = part.indexOf(':')
    if (colonIndex === -1) continue

    const teamsPart = part.substring(0, colonIndex).trim()
    const highlight = part.substring(colonIndex + 1).trim()

    if (!teamsPart || !highlight) continue

    // Parsear equipos (separados por "vs")
    const teamsMatch = teamsPart.match(/(.+?)\s+vs\s+(.+)/i)
    if (!teamsMatch) continue

    const homeTeam = teamsMatch[1].trim()
    const awayTeam = teamsMatch[2].trim()

    results.push({ homeTeam, awayTeam, highlight })
  }

  return results
}

/**
 * POST /api/admin/add-highlight
 * Agrega "Ojo al dato" a partidos manualmente
 *
 * Body puede ser:
 * 1. Formato simple (un partido):
 *    { "homeTeam": "River", "awayTeam": "Boca", "highlight": "El local ganó 4 de los últimos 5" }
 *
 * 2. Formato bulk (múltiples partidos):
 *    { "input": "River vs Boca: Dato 1 | Racing vs Independiente: Dato 2" }
 */
export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    let matchesToProcess: MatchHighlight[] = []

    // Detectar formato del input
    if (body.input) {
      // Formato bulk: parsear string
      matchesToProcess = parseInput(body.input)
    } else if (body.homeTeam && body.awayTeam && body.highlight) {
      // Formato simple: un solo partido
      matchesToProcess = [{
        homeTeam: body.homeTeam,
        awayTeam: body.awayTeam,
        highlight: body.highlight
      }]
    } else {
      return NextResponse.json(
        { success: false, error: 'Formato inválido. Usar { "input": "Equipo1 vs Equipo2: Dato" } o { "homeTeam", "awayTeam", "highlight" }' },
        { status: 400 }
      )
    }

    if (matchesToProcess.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se pudo parsear ningún partido del input' },
        { status: 400 }
      )
    }

    // Obtener fecha de hoy en hora Argentina (UTC-3)
    const now = new Date()
    const argentinaNow = new Date(now.getTime() - 3 * 60 * 60 * 1000)

    const today = new Date(argentinaNow)
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    // Rango del día en hora Argentina
    const startOfDay = new Date(todayStr + 'T03:00:00.000Z')
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)

    const results: any[] = []
    const errors: any[] = []

    for (const matchInput of matchesToProcess) {
      try {
        // Buscar el partido por nombres de equipos
        const match = await prisma.match.findFirst({
          where: {
            matchDate: {
              gte: startOfDay,
              lt: endOfDay
            },
            homeTeam: {
              name: {
                contains: matchInput.homeTeam,
                mode: 'insensitive'
              }
            },
            awayTeam: {
              name: {
                contains: matchInput.awayTeam,
                mode: 'insensitive'
              }
            }
          },
          include: {
            homeTeam: true,
            awayTeam: true,
            league: true
          }
        })

        if (!match) {
          errors.push({
            match: `${matchInput.homeTeam} vs ${matchInput.awayTeam}`,
            error: 'Partido no encontrado'
          })
          continue
        }

        await prisma.match.update({
          where: { id: match.id },
          data: {
            highlight: matchInput.highlight,
            highlightType: 'MANUAL'
          }
        })

        results.push({
          match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
          highlight: matchInput.highlight
        })
      } catch (error) {
        errors.push({
          match: `${matchInput.homeTeam} vs ${matchInput.awayTeam}`,
          error: error instanceof Error ? error.message : 'Error desconocido'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Actualizados ${results.length} partidos, ${errors.length} errores`,
      results,
      errors
    })
  } catch (error) {
    console.error('[API] Error in /api/admin/add-highlight:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
