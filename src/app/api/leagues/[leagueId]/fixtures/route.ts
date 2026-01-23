import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { getFixtures } from '@/shared/lib/api-football'
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
    let league = await prisma.league.findUnique({
      where: { id: leagueIdNum },
    })

    if (!league) {
      return NextResponse.json(
        { success: false, error: 'Liga no encontrada' },
        { status: 404 }
      )
    }

    // [AUTO-FIX] Sincronizar temporada con la configuración (src/shared/constants/leagues.ts)
    // Si la DB tiene una temporada vieja (ej: 2023) y la config dice 2025, actualizamos.
    const { getLeagueById } = await import('@/shared/constants/leagues')
    const leagueConfig = getLeagueById(league.apiId)

    if (leagueConfig && league.season !== leagueConfig.season) {
        console.log(`[API] Updating league ${league.name} season from ${league.season} to ${leagueConfig.season}`)
        
        // 1. Actualizar temporada en League
        league = await prisma.league.update({
            where: { id: league.id },
            data: { season: leagueConfig.season }
        })
        
        // 2. BORRAR partidos viejos de la temporada anterior para forzar recarga limpia
        const deleted = await prisma.match.deleteMany({
            where: { leagueId: league.id }
        })
        console.log(`[API] Cleared ${deleted.count} old matches for league ${league.name} to force refresh.`)
    }

    // Construir filtro
    const whereClause: any = {
      leagueId: leagueIdNum,
    }

    if (roundParam) {
      whereClause.round = roundParam
    }

    // Checking if we need to fetch from API (Self-healing & Freshness)
    const matchesCount = await prisma.match.count({
      where: { leagueId: leagueIdNum }
    })

    const lastUpdatedMatch = await prisma.match.findFirst({
      where: { leagueId: leagueIdNum },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    })

    const isStale = !lastUpdatedMatch || (Date.now() - lastUpdatedMatch.updatedAt.getTime() > 1000 * 60 * 5) // 5 minutes
    const isArgentina = league.apiId === 128 // Prioritize freshness for active requested league

    if ((matchesCount < 20 || (isArgentina && isStale)) && league.apiId) {
       console.log(`[API] League ${leagueIdNum} fixtures outdated (Count: ${matchesCount}, Stale: ${isStale}). Syncing full season...`)
       try {
         const response = await getFixtures(league.apiId, league.season)
         
         if (response && response.response) {
            const fixtures = response.response
            
            // Sync in a transaction or batch to ensure consistency? 
            // Loop is fine for now but let's prevent timeout by not awaiting every single upsert strictly if we can, 
            // BUT we want to return fresh data, so we must await.
            
            // Optimization: Fetch all existing teams to minimize upserts?
            // For now, keep logic simple but reliable.
            
            const mapStatus = (status: string): string => {
                const statusMap: Record<string, string> = {
                  TBD: 'NS', NS: 'NS', '1H': 'LIVE', HT: 'HT', '2H': 'LIVE',
                  ET: 'LIVE', P: 'LIVE', FT: 'FT', AET: 'AET', PEN: 'PEN',
                  PST: 'PST', CANC: 'CANC', ABD: 'ABD', AWD: 'FT', WO: 'FT',
                }
                return statusMap[status] || 'NS'
            }

            // We use a transaction for matches to succeed or fail together? 
            // Upserting 480 records one by one is slow.
            // Prisma `createMany` specific for 'skipDuplicates' might not work for updates.
            // We'll stick to loop but maybe parallelize chunks.
            
            const chunks = [];
            const chunkSize = 50; 
            for (let i = 0; i < fixtures.length; i += chunkSize) {
                chunks.push(fixtures.slice(i, i + chunkSize));
            }

            for (const chunk of chunks) {
                await Promise.all(chunk.map(async (fixture) => {
                     // Upsert Teams (cached locally or upserted) - simplifying to avoid complexity in this snippet
                     // We assume teams exist or we upsert them. 
                     // To speed up, we can ignore team updates if name matches?
                     // Let's just do the upsert, it's safer.
                     
                     const homeTeam = await prisma.team.upsert({
                        where: { apiId: fixture.teams.home.id },
                        update: { name: fixture.teams.home.name, logo: fixture.teams.home.logo },
                        create: {
                            apiId: fixture.teams.home.id,
                            name: fixture.teams.home.name,
                            logo: fixture.teams.home.logo,
                            code: fixture.teams.home.name.substring(0, 3).toUpperCase()
                        }
                     })

                     const awayTeam = await prisma.team.upsert({
                        where: { apiId: fixture.teams.away.id },
                        update: { name: fixture.teams.away.name, logo: fixture.teams.away.logo },
                        create: {
                            apiId: fixture.teams.away.id,
                            name: fixture.teams.away.name,
                            logo: fixture.teams.away.logo,
                            code: fixture.teams.away.name.substring(0, 3).toUpperCase()
                        }
                     })

                     await prisma.match.upsert({
                        where: { apiId: fixture.fixture.id },
                        update: {
                            status: mapStatus(fixture.fixture.status.short),
                            homeScore: fixture.goals.home,
                            awayScore: fixture.goals.away,
                            round: fixture.league.round,
                            updatedAt: new Date() // Force update timestamp
                        },
                        create: {
                            apiId: fixture.fixture.id,
                            leagueId: league.id,
                            homeTeamId: homeTeam.id,
                            awayTeamId: awayTeam.id,
                            matchDate: new Date(fixture.fixture.date),
                            status: mapStatus(fixture.fixture.status.short),
                            homeScore: fixture.goals.home,
                            awayScore: fixture.goals.away,
                            round: fixture.league.round
                        }
                     })
                }))
            }
            console.log(`[API] Successfully synced ${fixtures.length} fixtures for league ${leagueIdNum}`)
         }
       } catch (error) {
           console.error('[API] Failed to sync fixtures:', error)
       }
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

    // Ordenar jornadas por fecha del primer partido
    fixturesByRound.sort((a, b) => {
      const dateA = a.matches.length > 0 ? new Date(a.matches[0].matchDate).getTime() : 0
      const dateB = b.matches.length > 0 ? new Date(b.matches[0].matchDate).getTime() : 0
      
      if (dateA !== dateB) {
        return dateA - dateB
      }
      
      // Fallback a orden alfabético si las fechas son idénticas
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
