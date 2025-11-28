import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import type { MatchWithTeams } from '@/matches/types'

interface FixturesByRound {
  round: string
  matches: MatchWithTeams[]
}

/**
 * GET /api/leagues/[leagueId]/fixtures?round=Jornada%2010
 *
 * Obtiene los fixtures de una liga, opcionalmente filtrados por jornada/round
 *
 * @param leagueId - ID de la liga en nuestra base de datos
 * @param round - (opcional) Jornada específica (ej: "Jornada 10", "Octavos de Final")
 * @returns Partidos agrupados por jornada o de una jornada específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const { leagueId } = await params
    const leagueIdNum = parseInt(leagueId, 10)

    if (isNaN(leagueIdNum)) {
      return NextResponse.json(
        { success: false, error: 'League ID inválido' },
        { status: 400 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const roundParam = searchParams.get('round')

    // Verificar que la liga existe
    const league = await prisma.league.findUnique({
      where: { id: leagueIdNum },
    })

    if (!league) {
      return NextResponse.json(
        { success: false, error: 'Liga no encontrada' },
        { status: 404 }
      )
    }

    // Construir filtro
    const whereClause: any = {
      leagueId: leagueIdNum,
    }

    if (roundParam) {
      whereClause.round = roundParam
    }

    // Obtener partidos
    const matches = await prisma.match.findMany({
      where: whereClause,
      include: {
        homeTeam: {
          select: {
            id: true,
            apiId: true,
            name: true,
            logo: true,
            code: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            apiId: true,
            name: true,
            logo: true,
            code: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
            country: true,
            logo: true,
          },
        },
      },
      orderBy: [
        { round: 'asc' },
        { matchDate: 'asc' },
      ],
    })

    // Si se pidió una jornada específica, devolverla directamente
    if (roundParam) {
      return NextResponse.json({
        success: true,
        data: matches as MatchWithTeams[],
        round: roundParam,
        count: matches.length,
        league: {
          id: league.id,
          name: league.name,
          season: league.season,
        },
      })
    }

    // Si no, agrupar por jornada
    const fixturesByRound: FixturesByRound[] = []
    const roundMap = new Map<string, MatchWithTeams[]>()

    matches.forEach((match) => {
      const round = match.round || 'Sin jornada'
      if (!roundMap.has(round)) {
        roundMap.set(round, [])
      }
      roundMap.get(round)!.push(match as MatchWithTeams)
    })

    // Convertir a array y ordenar por nombre de jornada
    roundMap.forEach((matches, round) => {
      fixturesByRound.push({
        round,
        matches,
      })
    })

    // Ordenar jornadas (intentar extraer número si es posible)
    fixturesByRound.sort((a, b) => {
      // Intentar extraer número de la jornada (ej: "Jornada 10" -> 10)
      const matchA = a.round.match(/\d+/)
      const matchB = b.round.match(/\d+/)

      if (matchA && matchB) {
        return parseInt(matchA[0], 10) - parseInt(matchB[0], 10)
      }

      // Si no hay número, ordenar alfabéticamente
      return a.round.localeCompare(b.round)
    })

    // Obtener lista de jornadas disponibles
    const availableRounds = fixturesByRound.map((f) => f.round)

    return NextResponse.json({
      success: true,
      data: fixturesByRound,
      league: {
        id: league.id,
        name: league.name,
        season: league.season,
      },
      totalRounds: fixturesByRound.length,
      availableRounds,
      totalMatches: matches.length,
    })
  } catch (error) {
    console.error('[API] Error in /api/leagues/[leagueId]/fixtures:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener fixtures',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
