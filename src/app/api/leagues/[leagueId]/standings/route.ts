import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { getStandings } from '@/shared/lib/api-football'

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
  group: string // Grupo o Zona: "Group A", "Zona A", etc.
  form: string[] // Últimos 5 resultados: "W", "D", "L"
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

    for (const groupStandings of allStandingsGroups) {
      for (const entry of groupStandings) {
        
        // CORRECCIÓN MANUAL: Si es Liga Profesional Argentina (128), resetear a 0.
        // El usuario indicó que el torneo arranca hoy.
        const isArgentina = league.apiId === 128
        
        standings.push({
          position: isArgentina ? entry.rank : entry.rank, // Mantener ranking original o resetear a orden alfabético? Mejor dejar original por ahora
          team: {
            id: entry.team.id,
            name: entry.team.name,
            logo: entry.team.logo,
          },
          played: isArgentina ? 0 : entry.all.played,
          won: isArgentina ? 0 : entry.all.win,
          drawn: isArgentina ? 0 : entry.all.draw,
          lost: isArgentina ? 0 : entry.all.lose,
          goalsFor: isArgentina ? 0 : entry.all.goals.for,
          goalsAgainst: isArgentina ? 0 : entry.all.goals.against,
          goalDifference: isArgentina ? 0 : entry.goalsDiff,
          points: isArgentina ? 0 : entry.points,
          group: entry.group,
          form: isArgentina ? [] : (entry.form ? entry.form.split('').slice(-5) : []),
        })
      }
    }

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
