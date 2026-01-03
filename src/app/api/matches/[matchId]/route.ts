import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { getFixtureById, getMatchStatistics } from '@/shared/lib/api-football'

/**
 * GET /api/matches/[matchId]
 *
 * Obtiene los detalles completos de un partido:
 * - Prioriza datos en vivo de API-Football
 * - Fallback a base de datos si falla la API
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

    // 1. Obtener datos básicos de DB (necesitamos el apiId)
    const dbMatch = await prisma.match.findUnique({
      where: { id: matchIdNum },
      include: {
        homeTeam: { select: { id: true, apiId: true, name: true, logo: true, code: true } },
        awayTeam: { select: { id: true, apiId: true, name: true, logo: true, code: true } },
        league: { select: { id: true, name: true, country: true, logo: true } },
        goals: { orderBy: { minute: 'asc' } }, // Fallback goals
        cards: { orderBy: { minute: 'asc' } }, // Fallback cards
      },
    })

    if (!dbMatch) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    // 2. Intentar obtener datos en vivo de la API
    try {
      if (dbMatch.apiId) {
        const [fixtureResponse, statsResponse] = await Promise.all([
          getFixtureById(dbMatch.apiId),
          getMatchStatistics(dbMatch.apiId),
        ])

        if (fixtureResponse.response && fixtureResponse.response[0]) {
          const apiFixture = fixtureResponse.response[0]
          
          // Mapear eventos a Goles y Tarjetas
          const events = apiFixture.events || []
          
          const goals = events
            .filter((e: any) => e.type === 'Goal')
            .map((e: any, index: number) => ({
              id: index, // ID temporal
              matchId: dbMatch.id,
              teamId: e.team.id === dbMatch.homeTeam?.apiId ? dbMatch.homeTeam.id : dbMatch.awayTeam.id,
              playerName: e.player.name,
              minute: e.time.elapsed,
              extraTime: e.time.extra,
              type: e.detail === 'Penalty' ? 'Penalty' : e.detail === 'Own Goal' ? 'Own Goal' : 'Normal',
              createdAt: new Date(),
            }))

          const cards = events
            .filter((e: any) => e.type === 'Card')
            .map((e: any, index: number) => ({
              id: index, // ID temporal
              matchId: dbMatch.id,
              teamId: e.team.id === dbMatch.homeTeam?.apiId ? dbMatch.homeTeam.id : dbMatch.awayTeam.id,
              playerName: e.player.name,
              minute: e.time.elapsed,
              type: e.detail.includes('Yellow') ? 'Yellow' : 'Red',
              createdAt: new Date(),
            }))

          const substitutions = events
            .filter((e: any) => e.type === 'subst')
            .map((e: any, index: number) => ({
              id: index,
              minute: e.time.elapsed,
              teamId: e.team.id === dbMatch.homeTeam?.apiId ? dbMatch.homeTeam.id : dbMatch.awayTeam.id,
              playerOut: { id: e.player.id, name: e.player.name },
              playerIn: { id: e.assist.id, name: e.assist.name }
            }))

          // Mapear Estadísticas
          const mapStats = (teamStats: any[]) => {
            const getStat = (type: string) => {
              const stat = teamStats.find((s: any) => s.type === type)
              return typeof stat?.value === 'number' ? stat.value : typeof stat?.value === 'string' ? parseInt(stat.value) : 0
            }
            return {
              possession: parseInt(getStat('Ball Possession') || '0'),
              shotsOnTarget: getStat('Shots on Goal'),
              totalShots: getStat('Total Shots'),
              corners: getStat('Corner Kicks'),
              fouls: getStat('Fouls'),
            }
          }

          let stats = {
            home: { possession: 50, shotsOnTarget: 0, totalShots: 0, corners: 0, fouls: 0 },
            away: { possession: 50, shotsOnTarget: 0, totalShots: 0, corners: 0, fouls: 0 },
          }

          if (statsResponse.response && statsResponse.response.length === 2) {
            const homeStatsRaw = (statsResponse.response.find((r: any) => r.team.id === dbMatch.homeTeam?.apiId) as any)?.statistics || []
            const awayStatsRaw = (statsResponse.response.find((r: any) => r.team.id === dbMatch.awayTeam?.apiId) as any)?.statistics || []
            
            stats = {
              home: mapStats(homeStatsRaw),
              away: mapStats(awayStatsRaw),
            }
          }

          // Mapear Alineaciones
          let lineups = undefined
          if (apiFixture.lineups && apiFixture.lineups.length > 0) {
             const mapLineup = (lineupData: any) => ({
                formation: lineupData.formation,
                coach: {
                    name: lineupData.coach.name,
                    photo: lineupData.coach.photo
                },
                startXI: lineupData.startXI.map((item: any) => ({
                    id: item.player.id,
                    name: item.player.name,
                    number: item.player.number,
                    pos: item.player.pos,
                    grid: item.player.grid
                })),
                substitutes: lineupData.substitutes.map((item: any) => ({
                    id: item.player.id,
                    name: item.player.name,
                    number: item.player.number,
                    pos: item.player.pos,
                    grid: item.player.grid
                }))
             })

             const homeLineupData = apiFixture.lineups.find((l: any) => l.team.id === dbMatch.homeTeam?.apiId)
             const awayLineupData = apiFixture.lineups.find((l: any) => l.team.id === dbMatch.awayTeam?.apiId)

             if (homeLineupData || awayLineupData) {
                 lineups = {
                     home: homeLineupData ? mapLineup(homeLineupData) : undefined,
                     away: awayLineupData ? mapLineup(awayLineupData) : undefined
                 }
             }
          }

          // Construir respuesta con datos LIVE
          // Mapear status
           const mapStatus = (status: string): any => {
              const statusMap: Record<string, string> = {
                TBD: 'NS', NS: 'NS', '1H': 'LIVE', HT: 'HT', '2H': 'LIVE',
                ET: 'LIVE', P: 'LIVE', FT: 'FT', AET: 'AET', PEN: 'PEN',
                PST: 'PST', CANC: 'CANC', ABD: 'ABD', AWD: 'FT', WO: 'FT',
              }
              return statusMap[status] || 'NS'
            }

          const liveMatch = {
            ...dbMatch,
            status: mapStatus(apiFixture.fixture.status.short),
            homeScore: apiFixture.goals.home,
            awayScore: apiFixture.goals.away,
            elapsed: apiFixture.fixture.status.elapsed,
            goals: goals,
            cards: cards,
            substitutions: substitutions,
            stats: stats,
            lineups: lineups,
          }

          return NextResponse.json({
            success: true,
            data: liveMatch,
          })
        }
      }
    } catch (error) {
      console.error('[API] Failed to fetch live details, falling back to DB', error)
    }

    // Fallback: Retornar datos de DB tal cual
    return NextResponse.json({
      success: true,
      data: dbMatch,
    })

  } catch (error) {
    console.error('[API] Error in /api/matches/[matchId]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener detalles del partido',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
