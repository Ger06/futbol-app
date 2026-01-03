import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { cacheOrFetch, CACHE_TTL } from '@/shared/lib/redis'
import {
  getFixturesByDate,
  getLiveFixtures,
  getFixturesByIds,
  LEAGUE_IDS,
} from '@/shared/lib/api-football'
import type { MatchWithTeams } from '@/matches/types'

/**
 * GET /api/matches/today
 *
 * Obtiene los partidos del día actual de todas las ligas configuradas
 *
 * Estrategia:
 * 1. Verifica en cache Redis (TTL: 30 segundos para partidos en vivo)
 * 2. Si no está en cache, consulta la base de datos
 * 3. Si no hay datos recientes, consulta API-Football
 * 4. Guarda en base de datos y cache
 *
 * @returns Array de partidos con información de equipos y liga
 */
export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD

    // Intentar obtener de cache
    const cacheKey = `matches:today:${todayStr}`

    const matches = await cacheOrFetch<MatchWithTeams[]>(
      cacheKey,
      async () => {
        const allMatches: (MatchWithTeams & { elapsed?: number })[] = []
        let apiFetchSuccess = false

        // 1. Intentar consultar API-Football primero para tener datos LIVE
        try {
          console.log(`[API] Fetching fixtures for today: ${todayStr}`)
          const response = await getFixturesByDate(todayStr)

          if (response.response && response.response.length > 0) {
            const configuredLeagueIds = Object.values(LEAGUE_IDS) as number[]

            let relevantFixtures = response.response.filter(fixture =>
              configuredLeagueIds.includes(fixture.league.id)
            )

            if (relevantFixtures.length > 0) {
              console.log(`[API] Found ${relevantFixtures.length} relevant fixtures for today`)
              
              // NEW: Fetch details (events) for relevant matches
              // API-Football bulk endpoint does not return events, so we must fetch by ID
              try {
                const ids = relevantFixtures.map(f => f.fixture.id)
                console.log(`[API] Fetching details for IDs: ${ids.length}`)
                
                const chunks = []
                for (let i = 0; i < ids.length; i += 20) {
                  chunks.push(ids.slice(i, i + 20))
                }

                const detailedPromises = chunks.map(chunk => getFixturesByIds(chunk))
                const detailedResponses = await Promise.all(detailedPromises)
                
                const detailedMap = new Map()
                detailedResponses.forEach(res => {
                  if (res && res.response) {
                    res.response.forEach(f => detailedMap.set(f.fixture.id, f))
                  }
                })

                // Update relevantFixtures with detailed versions
                relevantFixtures = relevantFixtures.map(f => detailedMap.get(f.fixture.id) || f)
                console.log(`[API] Enhanced ${detailedMap.size} fixtures with details`)
              } catch (err) {
                console.error('[API] Error fetching match details:', err)
                // Continue with basic info if details fail
              }

              apiFetchSuccess = true

              for (const fixture of relevantFixtures) {
                // Obtener o crear equipos
                const homeTeam = await prisma.team.upsert({
                  where: { apiId: fixture.teams.home.id },
                  update: {
                    name: fixture.teams.home.name,
                    logo: fixture.teams.home.logo,
                  },
                  create: {
                    apiId: fixture.teams.home.id,
                    name: fixture.teams.home.name,
                    logo: fixture.teams.home.logo,
                    code: fixture.teams.home.name.substring(0, 3).toUpperCase(),
                  },
                })

                const awayTeam = await prisma.team.upsert({
                  where: { apiId: fixture.teams.away.id },
                  update: {
                    name: fixture.teams.away.name,
                    logo: fixture.teams.away.logo,
                  },
                  create: {
                    apiId: fixture.teams.away.id,
                    name: fixture.teams.away.name,
                    logo: fixture.teams.away.logo,
                    code: fixture.teams.away.name.substring(0, 3).toUpperCase(),
                  },
                })

                // Obtener liga de la base de datos
                const league = await prisma.league.findFirst({
                  where: { apiId: fixture.league.id },
                })

                if (!league) {
                  // Si no está en DB (ej: Ligue 1 antes del seed), la ignoramos para DB
                  // pero podríamos querer devolverla en memoria si es crítico.
                  // Por ahora mantenemos consistencia con DB.
                  console.warn(`[DB] League ${fixture.league.id} not found in database`)
                  continue
                }

                // Mapear status
                const mapStatus = (status: string): string => {
                  const statusMap: Record<string, string> = {
                    TBD: 'NS', NS: 'NS', '1H': 'LIVE', HT: 'HT', '2H': 'LIVE',
                    ET: 'LIVE', P: 'LIVE', FT: 'FT', AET: 'AET', PEN: 'PEN',
                    PST: 'PST', CANC: 'CANC', ABD: 'ABD', AWD: 'FT', WO: 'FT',
                  }
                  return statusMap[status] || 'NS'
                }

                // Crear o actualizar partido en DB
                const match = await prisma.match.upsert({
                  where: { apiId: fixture.fixture.id },
                  update: {
                    status: mapStatus(fixture.fixture.status.short),
                    homeScore: fixture.goals.home,
                    awayScore: fixture.goals.away,
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
                  },
                  include: {
                    homeTeam: { select: { id: true, apiId: true, name: true, logo: true, code: true } },
                    awayTeam: { select: { id: true, apiId: true, name: true, logo: true, code: true } },
                    league: { select: { id: true, name: true, country: true, logo: true } },
                  },
                })

                // Mapear eventos a Goles y Tarjetas
                const events = fixture.events || []
                
                const goals = events
                  .filter((e: any) => e.type === 'Goal')
                  .map((e: any, index: number) => ({
                    id: index, // ID temporal
                    matchId: match.id,
                    teamId: e.team.id === homeTeam.apiId ? homeTeam.id : awayTeam.id,
                    playerName: e.player.name || 'Unknown',
                    minute: e.time.elapsed || 0,
                    extraTime: e.time.extra || null,
                    type: (e.detail && e.detail === 'Penalty') ? 'Penalty' : (e.detail && e.detail === 'Own Goal') ? 'Own Goal' : 'Normal',
                    createdAt: new Date(),
                  }))

                const cards = events
                  .filter((e: any) => e.type === 'Card' && e.detail && (e.detail.includes('Red') || e.detail.includes('Yellow'))) 
                  .map((e: any, index: number) => ({
                    id: index,
                    matchId: match.id,
                    teamId: e.team.id === homeTeam.apiId ? homeTeam.id : awayTeam.id,
                    playerName: e.player.name || 'Unknown',
                    minute: e.time.elapsed || 0,
                    type: e.detail.includes('Yellow') ? 'Yellow' : 'Red',
                    createdAt: new Date(),
                  }))

                // Log debug info
                if (goals.length > 0 || cards.length > 0) {
                     console.log(`[API] Match ${match.id} has ${goals.length} goals and ${cards.length} cards`)
                }

                // Inyectar 'elapsed' time temporalmente en el objeto de respuesta
                // (No se guarda en DB, pero se envía al frontend)
                const matchResponse = {
                  ...match,
                  elapsed: fixture.fixture.status.elapsed,
                  goals: goals,
                  cards: cards
                }

                allMatches.push(matchResponse as MatchWithTeams)
              }
            }
          }
        } catch (error) {
          console.error(`[API] Error fetching fixtures for today:`, error)
          apiFetchSuccess = false
        }

        // 2. Si falló la API o no trajo nada (y dudamos), hacemos fallback a DB
        // Pero si apiFetchSuccess es true y allMatches tiene datos, usamos eso.
        if (!apiFetchSuccess || allMatches.length === 0) {
          console.log('[API] Fallback to database')
          const dbMatches = await prisma.match.findMany({
            where: {
              matchDate: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
              },
            },
            include: {
              homeTeam: { select: { id: true, apiId: true, name: true, logo: true, code: true } },
              awayTeam: { select: { id: true, apiId: true, name: true, logo: true, code: true } },
              league: { select: { id: true, name: true, country: true, logo: true } },
              goals: { orderBy: { minute: 'asc' } },
              cards: { orderBy: { minute: 'asc' } },
            },
            orderBy: { matchDate: 'asc' },
          })
          return dbMatches as MatchWithTeams[]
        }

        return allMatches
      },
      {
        ttl: CACHE_TTL.LIVE_MATCHES, // 30 segundos
      }
    )

    return NextResponse.json({
      success: true,
      data: matches,
      count: matches.length,
    })
  } catch (error) {
    console.error('[API] Error in /api/matches/today:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener partidos del día' },
      { status: 500 }
    )
  }
}
