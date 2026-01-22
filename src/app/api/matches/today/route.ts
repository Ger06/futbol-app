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
// ... imports

export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD

    // Intentar obtener de cache
    const cacheKey = `matches:today:v7:${todayStr}`

    const matches = await cacheOrFetch<MatchWithTeams[]>(
      cacheKey,
      async () => {
        const allMatches: (MatchWithTeams & { elapsed?: number })[] = []
        let apiFetchSuccess = false

        // 1. Intentar consultar API-Football primero
        try {
          console.log(`[API] Fetching fixtures for today: ${todayStr}`)
          // Consultamos hoy y mañana para cubrir desfase horario (partidos nocturnos en Latam son mañana en UTC)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          const tomorrowStr = tomorrow.toISOString().split('T')[0]

          const [responseToday, responseTomorrow] = await Promise.all([
            getFixturesByDate(todayStr),
            getFixturesByDate(tomorrowStr)
          ])

          const fixtures = [
            ...(responseToday.response || []),
            ...(responseTomorrow.response || [])
          ]

          if (fixtures.length > 0) {
            const configuredLeagueIds = Object.values(LEAGUE_IDS) as number[]

            let relevantFixtures = fixtures.filter(fixture =>
              configuredLeagueIds.includes(fixture.league.id)
            )
            
            // FILTRAR DUPLICADOS (por si acaso)
            const seenIds = new Set()
            relevantFixtures = relevantFixtures.filter(f => {
              if (seenIds.has(f.fixture.id)) return false
              seenIds.add(f.fixture.id)
              return true
            })

            // FILTRAR POR CUESTIONES DE ZONA HORARIA
            // El usuario quiere ver "Partidos de Hoy". 
            // Si un partido se juega el 23/01 a las 01:15 UTC, en Argentina es el 22/01 a las 22:15.
            // Por lo tanto, pertenece a "Hoy".
            // Pero un partido el 23/01 a las 14:00 UTC, en Argentina es el 23/01 a las 11:00. Eso es "Mañana".
            
            const matchesToShow = relevantFixtures.filter(fixture => {
              const matchDate = new Date(fixture.fixture.date)
              // Ajustar a zona horaria "target" (aprox UTC-3 para Latam/Argentina)
              // No usamos librerías pesadas, simple offset
              const OFFSET_HOURS = -3
              
              const localMatchDate = new Date(matchDate.getTime() + (OFFSET_HOURS * 60 * 60 * 1000))
              const localToday = new Date(today.getTime() + (OFFSET_HOURS * 60 * 60 * 1000))
              
              const matchDayStr = localMatchDate.toISOString().split('T')[0]
              const todayDayStr = localToday.toISOString().split('T')[0]
              
              const isSameDay = matchDayStr === todayDayStr
              
              // Debug logging para entender qué se queda y qué se va
              if (!isSameDay) {
                //console.log(`[Filter] Excluding ${fixture.teams.home.name} vs ${fixture.teams.away.name} (${matchDayStr} local != ${todayDayStr})`)
              } else {
                //console.log(`[Filter] Including ${fixture.teams.home.name} vs ${fixture.teams.away.name} (${matchDayStr} local)`)
              }

              return isSameDay
            })
            
            relevantFixtures = matchesToShow

            if (relevantFixtures.length > 0) {
               // ... (lógica de fetching details igual)
               // (Mantener lógica de fetching details de arriba si es posible o simplificar)
               // COPIAR LOGICA DE DETAILS AQUI SI ES NECESARIO O SIMPLIFICAR
               // Por brevedad voy a asumir que el bloque anterior funciona, pero tengo que replicarlo si cambio el flujo.
               // Mejor simplifico:
               
               // ... fetching details logic ...
               try {
                const ids = relevantFixtures.map(f => f.fixture.id)
                // ... (mismo logica de chunks)
                const chunks = []
                for (let i = 0; i < ids.length; i += 20) { chunks.push(ids.slice(i, i + 20)) }
                const detailedResponses = await Promise.all(chunks.map(chunk => getFixturesByIds(chunk)))
                const detailedMap = new Map()
                detailedResponses.forEach(res => res?.response?.forEach(f => detailedMap.set(f.fixture.id, f)))
                relevantFixtures = relevantFixtures.map(f => detailedMap.get(f.fixture.id) || f)
               } catch (e) { console.error(e) }

               apiFetchSuccess = true

               for (const fixture of relevantFixtures) {
                 // ... upsert logic (MANTENER IGUAL) ...
                 // Para no reescribir todo el upsert gigantesco, 
                 // voy a confiar en que el usuario acepte que reescriba este bloque.
                 // Upsert de Teams y Match igual que antes.
                 
                // Obtener o crear equipos
                const homeTeam = await prisma.team.upsert({
                  where: { apiId: fixture.teams.home.id },
                  update: { name: fixture.teams.home.name, logo: fixture.teams.home.logo },
                  create: { apiId: fixture.teams.home.id, name: fixture.teams.home.name, logo: fixture.teams.home.logo, code: fixture.teams.home.name.substring(0, 3).toUpperCase() },
                })

                const awayTeam = await prisma.team.upsert({
                  where: { apiId: fixture.teams.away.id },
                  update: { name: fixture.teams.away.name, logo: fixture.teams.away.logo },
                  create: { apiId: fixture.teams.away.id, name: fixture.teams.away.name, logo: fixture.teams.away.logo, code: fixture.teams.away.name.substring(0, 3).toUpperCase() },
                })

                const league = await prisma.league.findFirst({ where: { apiId: fixture.league.id } })
                if (!league) continue

                 const mapStatus = (status: string): string => {
                   const statusMap: Record<string, string> = { TBD: 'NS', NS: 'NS', '1H': 'LIVE', HT: 'HT', '2H': 'LIVE', ET: 'LIVE', P: 'LIVE', FT: 'FT', AET: 'AET', PEN: 'PEN', PST: 'PST', CANC: 'CANC', ABD: 'ABD', AWD: 'FT', WO: 'FT' }
                   return statusMap[status] || 'NS'
                 }

                const match = await prisma.match.upsert({
                  where: { apiId: fixture.fixture.id },
                  update: { status: mapStatus(fixture.fixture.status.short), homeScore: fixture.goals.home, awayScore: fixture.goals.away },
                  create: { apiId: fixture.fixture.id, leagueId: league.id, homeTeamId: homeTeam.id, awayTeamId: awayTeam.id, matchDate: new Date(fixture.fixture.date), status: mapStatus(fixture.fixture.status.short), homeScore: fixture.goals.home, awayScore: fixture.goals.away },
                  include: { homeTeam: true, awayTeam: true, league: true },
                })
                
                // ... events logic ...
                 const events = fixture.events || []
                 const goals = events.filter((e: any) => e.type === 'Goal').map((e: any, index: number) => ({ id: index, matchId: match.id, teamId: e.team.id === homeTeam.apiId ? homeTeam.id : awayTeam.id, playerName: e.player.name || 'Unknown', minute: e.time.elapsed || 0, extraTime: e.time.extra || null, type: (e.detail && e.detail === 'Penalty') ? 'Penalty' : (e.detail && e.detail === 'Own Goal') ? 'Own Goal' : 'Normal', createdAt: new Date() }))
                 const cards = events.filter((e: any) => e.type === 'Card' && e.detail && (e.detail.includes('Red') || e.detail.includes('Yellow'))).map((e: any, index: number) => ({ id: index, matchId: match.id, teamId: e.team.id === homeTeam.apiId ? homeTeam.id : awayTeam.id, playerName: e.player.name || 'Unknown', minute: e.time.elapsed || 0, type: e.detail.includes('Yellow') ? 'Yellow' : 'Red', createdAt: new Date() }))
                
                const matchResponse = { ...match, elapsed: fixture.fixture.status.elapsed, goals, cards }
                allMatches.push(matchResponse as MatchWithTeams)
               }
            }
          }
        } catch (error) {
          console.error(`[API] Error fetching fixtures:`, error)
          apiFetchSuccess = false
        }

        // 2. Fallback DB
        if (!apiFetchSuccess || allMatches.length === 0) {
          console.log('[API] Fallback to database')
          const dbMatches = await prisma.match.findMany({
            where: {
              matchDate: {
                gte: today, // Hoy 00:00 UTC
                lt: new Date(today.getTime() + 48 * 60 * 60 * 1000), // Hoy + Mañana (48h) para cubrir TZ
              },
            },
            include: {
              homeTeam: { select: { id: true, apiId: true, name: true, logo: true, code: true } },
              awayTeam: { select: { id: true, apiId: true, name: true, logo: true, code: true } },
              league: { select: { id: true, apiId: true, name: true, country: true, logo: true } },
              goals: { orderBy: { minute: 'asc' } },
              cards: { orderBy: { minute: 'asc' } },
            },
            orderBy: { matchDate: 'asc' },
          })
          
          // Filtrar en memoria si es necesario, pero devolver más es mejor
          // El frontend puede filtrar por día si quiere, o mostramos todo como "Jornada Actual"
          return dbMatches as MatchWithTeams[]
        }
        
        return allMatches
      },
      { ttl: CACHE_TTL.LIVE_MATCHES }
    )

    return NextResponse.json({ success: true, data: matches, count: matches.length })
  } catch (error) {
    console.error('[API] Error in /api/matches/today:', error)
    return NextResponse.json({ success: false, error: 'Error al obtener partidos' }, { status: 500 })
  }
}
