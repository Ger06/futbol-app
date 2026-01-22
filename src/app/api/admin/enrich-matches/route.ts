import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { enrichMatch } from '@/shared/lib/gemini'

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const adminKey = process.env.ADMIN_API_KEY

  if (!adminKey) {
    console.error('ADMIN_API_KEY not configured')
    return false
  }

  return authHeader === `Bearer ${adminKey}`
}

/**
 * GET /api/admin/enrich-matches
 * Obtiene partidos del día y genera highlights + broadcasters automáticamente con Claude
 */
export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Obtener fecha de hoy (inicio y fin del día)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Buscar partidos del día que aún no han empezado
    const matches = await prisma.match.findMany({
      where: {
        matchDate: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: 'NS', // Not Started
        // Solo partidos que aún no tienen highlight automático
        OR: [
          { highlight: null },
          { highlightType: { not: 'AUTO' } }
        ]
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true
      },
      take: 50 // Limitar para no exceder rate limits de Claude
    })

    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay partidos para enriquecer hoy',
        enriched: 0
      })
    }

    const results: { apiId: number; success: boolean; error?: string }[] = []

    // Procesar partidos secuencialmente para evitar rate limits
    for (const match of matches) {
      try {
        const matchInfo = {
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          league: match.league.name,
          matchDate: match.matchDate.toISOString().split('T')[0]
        }

        console.log(`Enriqueciendo: ${matchInfo.homeTeam} vs ${matchInfo.awayTeam}`)

        const { highlight, broadcasters } = await enrichMatch(matchInfo)

        // Combinar broadcasters nuevos con existentes (si los hay)
        const existingBroadcasters = (match.broadcasters as any[]) || []
        const allBroadcasters = [
          ...existingBroadcasters.filter((b: any) => b.type === 'magic'), // Mantener Magic TV
          ...broadcasters // Agregar oficiales nuevos
        ]

        await prisma.match.update({
          where: { id: match.id },
          data: {
            highlight: highlight || undefined,
            highlightType: highlight ? 'AUTO' : undefined,
            broadcasters: allBroadcasters.length > 0 ? allBroadcasters : undefined
          }
        })

        results.push({ apiId: match.apiId, success: true })

        // Pequeña pausa entre partidos para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Error enriqueciendo partido ${match.apiId}:`, error)
        results.push({
          apiId: match.apiId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Enriquecidos ${successCount} partidos, ${failCount} errores`,
      enriched: successCount,
      failed: failCount,
      results
    })
  } catch (error) {
    console.error('[API] Error in GET /api/admin/enrich-matches:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/enrich-matches
 * Actualiza partidos con highlights/broadcasters proporcionados manualmente
 */
export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { matches } = await request.json()

    if (!Array.isArray(matches)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: matches must be an array' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    for (const match of matches) {
      if (!match.apiId) {
        errors.push({ match, error: 'Missing apiId' })
        continue
      }

      try {
        const updated = await prisma.match.update({
          where: { apiId: match.apiId },
          data: {
            broadcasters: match.broadcasters, // Expecting Json array
            highlight: match.highlight,
            highlightType: 'AUTO',
          },
        })
        results.push(updated.apiId)
      } catch (e) {
        console.error(`Error updating match ${match.apiId}:`, e)
        errors.push({ apiId: match.apiId, error: 'Match not found or update failed' })
      }
    }

    return NextResponse.json({
      success: true,
      updated: results.length,
      failed: errors.length,
      results,
      errors,
    })
  } catch (error) {
    console.error('[API] Error in POST /api/admin/enrich-matches:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
