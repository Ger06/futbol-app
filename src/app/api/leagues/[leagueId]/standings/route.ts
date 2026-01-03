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

    // Consultar API-Football (usa la temporada configurada por defecto: 2025)
    // NOTA: Usamos league.apiId para consultar la API externa
    const apiResponse = await getStandings(league.apiId)

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

    // La API devuelve un array de arrays de standings (por grupos), tomamos el primero
    // Para ligas normales es standings[0], para torneos con grupos habría que manejarlos todos
    const apiStandings = apiResponse.response[0].league.standings[0]

    // Mapear respuesta de API al formato de nuestra UI
    const standings: StandingEntry[] = apiStandings.map((entry) => ({
      position: entry.rank,
      team: {
        id: entry.team.id, // Usamos el ID de la API temporalmente en la UI
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
      form: entry.form ? entry.form.split('').slice(-5) : [],
    }))

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
