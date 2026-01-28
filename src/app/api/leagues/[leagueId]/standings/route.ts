import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { getStandings, getFixtures } from '@/shared/lib/api-football'
import { computeStandingsFromFixtures } from '@/shared/lib/standings-calculator'

interface StandingEntry {
  position: number
  team: {
    id: number
    name: string
    logo: string | null
  }
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  group: string
  form: string[]
}

/**
 * GET /api/leagues/[leagueId]/standings
 *
 * Obtiene la tabla de posiciones directamente de API-Football
 * para asegurar datos actualizados y oficiales.
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

    // Verificar que la liga existe y obtener su API ID
    const league = await prisma.league.findUnique({
      where: { id: leagueIdNum },
    })

    if (!league) {
      return NextResponse.json(
        { success: false, error: 'Liga no encontrada' },
        { status: 404 }
      )
    }

    // SPECIAL CASE: Liga Profesional Argentina (128)
    // La API devuelve datos de la temporada anterior a veces.
    // Calculamos la tabla en base a los fixtures para tener datos en tiempo real.
    // También útil para "Live Standings".
    if (league.apiId === 128) {
      const fixturesResponse = await getFixtures(league.apiId, league.season)
      
      if (fixturesResponse && fixturesResponse.response) {
        // ... calculation logic ...
        const computedStandings = computeStandingsFromFixtures(fixturesResponse.response)
        
        return NextResponse.json({
          success: true,
          data: computedStandings,
          league: {
            id: league.id,
            name: league.name,
            season: league.season,
          },
          totalTeams: computedStandings.length,
          totalMatches: 0,
        })
      }
    }

    // Consultar API-Football (usa la temporada configurada en la BD)
    const apiResponse = await getStandings(league.apiId, league.season)

    // Validar respuesta de la API
    if (
      !apiResponse ||
      !apiResponse.response ||
      apiResponse.response.length === 0 ||
      !apiResponse.response[0].league.standings
    ) {
      // Si falla la API, devolvemos array vacío pero éxito (para no romper la UI)
      console.warn(`[API] No standings found for league ${league.name} (${league.apiId})`)
      return NextResponse.json({
        success: true,
        data: [],
        league: {
          id: league.id,
          name: league.name,
          season: league.season,
        },
        totalTeams: 0,
        totalMatches: 0,
      })
    }

    // La API devuelve un array de arrays de standings, donde cada sub-array es un grupo/zona
    // Iteramos sobre todos los grupos y los aplanamos en una sola lista
    const allStandingsGroups = apiResponse.response[0].league.standings
    const standings: StandingEntry[] = []

    allStandingsGroups.forEach((groupStandings, index) => {
      for (const entry of groupStandings) {
        
        let groupName = entry.group
        // Corregir nombres de zona para Argentina si la API devuelve nombres genéricos "Apertura"
        if (league.apiId === 128 && allStandingsGroups.length > 1) {
           // Asumimos que el primer grupo es Zona A y el segundo Zona B
           if (index === 0) groupName = 'Zona A'
           if (index === 1) groupName = 'Zona B'
        }

        standings.push({
          position: entry.rank,
          team: {
            id: entry.team.id,
            name: entry.team.name,
            logo: entry.team.logo,
          },
          played: entry.all.played,
          won: entry.all.win,
          drawn: entry.all.draw,
          lost: entry.all.lose,
          goalsFor: entry.all.goals.for,
          goalsAgainst: entry.all.goals.against,
          goalDifference: entry.goalsDiff,
          points: entry.points,
          group: groupName,
          form: entry.form ? entry.form.split('').slice(-5) : [],
        })
      }
    })

    return NextResponse.json({
      success: true,
      data: standings,
      league: {
        id: league.id,
        name: league.name,
        season: league.season,
      },
      totalTeams: standings.length,
      totalMatches: 0, // No relevante cuando viene de API
    })

  } catch (error) {
    console.error('[API] Error in /api/leagues/[leagueId]/standings:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener posiciones de la API',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
