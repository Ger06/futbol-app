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

interface Broadcaster {
  channel: string
  type: 'official' | 'magic'
}

interface MatchBroadcasters {
  homeTeam: string
  awayTeam: string
  broadcasters: Broadcaster[]
}

/**
 * Parsea un string con formato:
 * "River vs Boca: ESPN, Magic 503 | Racing vs Independiente: Fox, Magic 340"
 */
function parseInput(input: string): MatchBroadcasters[] {
  const results: MatchBroadcasters[] = []

  // Separar por | para múltiples partidos
  const matchParts = input.split('|').map(s => s.trim()).filter(s => s.length > 0)

  for (const part of matchParts) {
    // Separar equipos de canales por :
    const [teamsPart, channelsPart] = part.split(':').map(s => s.trim())

    if (!teamsPart || !channelsPart) continue

    // Parsear equipos (separados por "vs")
    const teamsMatch = teamsPart.match(/(.+?)\s+vs\s+(.+)/i)
    if (!teamsMatch) continue

    const homeTeam = teamsMatch[1].trim()
    const awayTeam = teamsMatch[2].trim()

    // Parsear canales (separados por ,)
    const channels = channelsPart.split(',').map(s => s.trim()).filter(s => s.length > 0)

    const broadcasters: Broadcaster[] = channels.map(channel => ({
      channel,
      type: channel.toLowerCase().includes('magic') ? 'magic' : 'official'
    }))

    results.push({ homeTeam, awayTeam, broadcasters })
  }

  return results
}

/**
 * POST /api/admin/add-broadcasters
 * Agrega broadcasters a partidos
 *
 * Body puede ser:
 * 1. Formato simple (un partido):
 *    { "homeTeam": "River", "awayTeam": "Boca", "channel": "Magic 503" }
 *
 * 2. Formato bulk (múltiples partidos):
 *    { "input": "River vs Boca: ESPN, Magic 503 | Racing vs Independiente: Fox, Magic 340" }
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

    let matchesToProcess: MatchBroadcasters[] = []

    // Detectar formato del input
    if (body.input) {
      // Formato bulk: parsear string
      matchesToProcess = parseInput(body.input)
    } else if (body.homeTeam && body.awayTeam && body.channel) {
      // Formato simple: un solo partido
      matchesToProcess = [{
        homeTeam: body.homeTeam,
        awayTeam: body.awayTeam,
        broadcasters: [{
          channel: body.channel,
          type: body.channel.toLowerCase().includes('magic') ? 'magic' : 'official'
        }]
      }]
    } else {
      return NextResponse.json(
        { success: false, error: 'Formato inválido. Usar { "input": "Equipo1 vs Equipo2: Canal1, Canal2" } o { "homeTeam", "awayTeam", "channel" }' },
        { status: 400 }
      )
    }

    if (matchesToProcess.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se pudo parsear ningún partido del input' },
        { status: 400 }
      )
    }

    // Obtener fecha de hoy
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

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

        // Obtener broadcasters existentes
        const existingBroadcasters = (match.broadcasters as unknown as Broadcaster[]) || []

        // Combinar: mantener existentes que no se estén agregando de nuevo
        const newChannelNames = matchInput.broadcasters.map(b => b.channel.toLowerCase())
        const filteredExisting = existingBroadcasters.filter(
          b => !newChannelNames.includes(b.channel.toLowerCase())
        )

        const updatedBroadcasters = [...filteredExisting, ...matchInput.broadcasters]

        await prisma.match.update({
          where: { id: match.id },
          data: {
            broadcasters: updatedBroadcasters as unknown as any
          }
        })

        results.push({
          match: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
          broadcasters: updatedBroadcasters
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
    console.error('[API] Error in /api/admin/add-broadcasters:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
