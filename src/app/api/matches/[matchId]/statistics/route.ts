import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { getMatchStatistics } from '@/shared/lib/api-football'
import { getCache, setCache, getStatsCacheTTL } from '@/shared/lib/redis'
import type { MatchStatistics } from '@/matches/types'

/**
 * GET /api/matches/[matchId]/statistics
 *
 * Obtiene estadísticas detalladas de un partido:
 * - Posesión del balón
 * - Tiros totales y a puerta
 * - Corners
 * - Faltas
 * - Tarjetas amarillas/rojas
 * - Fuera de juego
 *
 * Estrategia de caching:
 * - Partidos finalizados (FT, AET, PEN): 30 días
 * - Partidos en vivo (LIVE, HT): 30 segundos
 * - Partidos no iniciados (NS): 1 hora
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params
    const matchIdNum = parseInt(matchId, 10)

    if (isNaN(matchIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Match ID inválido' },
        { status: 400 }
      )
    }

    // 1. Obtener datos básicos del partido desde DB
    const match = await prisma.match.findUnique({
      where: { id: matchIdNum },
      select: {
        id: true,
        apiId: true,
        status: true,
      },
    })

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    // 2. Buscar en cache Redis
    const cacheKey = `match:statistics:${matchIdNum}`
    const cachedData = await getCache<MatchStatistics[]>(cacheKey)

    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
      })
    }

    // 3. No hay cache, llamar a API-Football
    const apiResponse = await getMatchStatistics(match.apiId)

    // Verificar si hay datos
    if (
      !apiResponse.response ||
      !Array.isArray(apiResponse.response) ||
      apiResponse.response.length === 0
    ) {
      // No hay estadísticas disponibles (partido histórico o sin datos)
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Estadísticas no disponibles para este partido',
      })
    }

    // 4. Determinar TTL según status del partido
    const ttl = getStatsCacheTTL(match.status)

    // 5. Guardar en cache Redis
    await setCache(cacheKey, apiResponse.response, { ttl })

    // 6. Retornar datos
    return NextResponse.json({
      success: true,
      data: apiResponse.response as MatchStatistics[],
      cached: false,
    })
  } catch (error) {
    console.error('[API] Error in /api/matches/[matchId]/statistics:', error)

    // Manejar error de rate limit de API-Football
    if (error instanceof Error && error.message.includes('429')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Servicio temporalmente no disponible',
          message: 'Por favor, intenta nuevamente en 1 minuto',
        },
        { status: 429 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener estadísticas',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

