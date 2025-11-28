import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { cacheOrFetch, CACHE_TTL } from '@/shared/lib/redis'
import { getFixtures, LEAGUE_IDS } from '@/shared/lib/api-football'
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
        // Consultar base de datos
        const dbMatches = await prisma.match.findMany({
          where: {
            matchDate: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // +1 día
            },
          },
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
          orderBy: {
            matchDate: 'asc',
          },
        })

        // Si hay datos en DB, devolver
        if (dbMatches.length > 0) {
          return dbMatches as MatchWithTeams[]
        }

        // Si no hay datos, consultar API-Football para todas las ligas
        console.log(`[API] Fetching fixtures for today: ${todayStr}`)

        const allMatches: MatchWithTeams[] = []

        // Obtener fixtures de todas las ligas
        for (const [leagueName, leagueId] of Object.entries(LEAGUE_IDS)) {
          try {
            const response = await getFixtures({
              league: leagueId,
              date: todayStr,
              season: 2023,
            })

            if (!response.response || response.response.length === 0) {
              console.log(`[API] No fixtures found for ${leagueName} on ${todayStr}`)
              continue
            }

            // Procesar cada partido
            for (const fixture of response.response) {
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
                where: { apiId: leagueId },
              })

              if (!league) {
                console.warn(`[DB] League ${leagueId} not found in database`)
                continue
              }

              // Mapear status de API-Football a nuestro schema
              const mapStatus = (status: string): string => {
                const statusMap: Record<string, string> = {
                  TBD: 'NS',
                  NS: 'NS',
                  '1H': 'LIVE',
                  HT: 'HT',
                  '2H': 'LIVE',
                  ET: 'LIVE',
                  P: 'LIVE',
                  FT: 'FT',
                  AET: 'AET',
                  PEN: 'PEN',
                  PST: 'PST',
                  CANC: 'CANC',
                  ABD: 'ABD',
                  AWD: 'FT',
                  WO: 'FT',
                }
                return statusMap[status] || 'NS'
              }

              // Crear o actualizar partido
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
              })

              allMatches.push(match as MatchWithTeams)
            }
          } catch (error) {
            console.error(`[API] Error fetching fixtures for ${leagueName}:`, error)
            continue
          }
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
      {
        success: false,
        error: 'Error al obtener partidos del día',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
