import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'

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
 * Calcula la tabla de posiciones de una liga basándose en los resultados
 * de los partidos finalizados
 *
 * @param leagueId - ID de la liga en nuestra base de datos (no API-Football)
 * @returns Tabla de posiciones ordenada por puntos
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

    // Obtener todos los partidos finalizados de la liga
    const matches = await prisma.match.findMany({
      where: {
        leagueId: leagueIdNum,
        status: 'FT', // Solo partidos finalizados
        homeScore: { not: null },
        awayScore: { not: null },
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: {
        matchDate: 'asc',
      },
    })

    // Calcular estadísticas por equipo
    const teamStats = new Map<number, StandingEntry>()

    matches.forEach((match) => {
      const homeScore = match.homeScore!
      const awayScore = match.awayScore!

      // Inicializar home team si no existe
      if (!teamStats.has(match.homeTeamId)) {
        teamStats.set(match.homeTeamId, {
          position: 0,
          team: {
            id: match.homeTeam.id,
            name: match.homeTeam.name,
            logo: match.homeTeam.logo,
          },
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          form: [],
        })
      }

      // Inicializar away team si no existe
      if (!teamStats.has(match.awayTeamId)) {
        teamStats.set(match.awayTeamId, {
          position: 0,
          team: {
            id: match.awayTeam.id,
            name: match.awayTeam.name,
            logo: match.awayTeam.logo,
          },
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          form: [],
        })
      }

      const homeTeamStats = teamStats.get(match.homeTeamId)!
      const awayTeamStats = teamStats.get(match.awayTeamId)!

      // Actualizar partidos jugados
      homeTeamStats.played++
      awayTeamStats.played++

      // Actualizar goles
      homeTeamStats.goalsFor += homeScore
      homeTeamStats.goalsAgainst += awayScore
      awayTeamStats.goalsFor += awayScore
      awayTeamStats.goalsAgainst += homeScore

      // Determinar resultado
      if (homeScore > awayScore) {
        // Victoria local
        homeTeamStats.won++
        homeTeamStats.points += 3
        homeTeamStats.form.push('W')
        awayTeamStats.lost++
        awayTeamStats.form.push('L')
      } else if (homeScore < awayScore) {
        // Victoria visitante
        awayTeamStats.won++
        awayTeamStats.points += 3
        awayTeamStats.form.push('W')
        homeTeamStats.lost++
        homeTeamStats.form.push('L')
      } else {
        // Empate
        homeTeamStats.drawn++
        homeTeamStats.points++
        homeTeamStats.form.push('D')
        awayTeamStats.drawn++
        awayTeamStats.points++
        awayTeamStats.form.push('D')
      }

      // Actualizar diferencia de goles
      homeTeamStats.goalDifference =
        homeTeamStats.goalsFor - homeTeamStats.goalsAgainst
      awayTeamStats.goalDifference =
        awayTeamStats.goalsFor - awayTeamStats.goalsAgainst
    })

    // Convertir a array y ordenar
    const standings = Array.from(teamStats.values())
      .sort((a, b) => {
        // 1. Más puntos
        if (b.points !== a.points) return b.points - a.points
        // 2. Mejor diferencia de goles
        if (b.goalDifference !== a.goalDifference)
          return b.goalDifference - a.goalDifference
        // 3. Más goles a favor
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
        // 4. Orden alfabético
        return a.team.name.localeCompare(b.team.name)
      })
      .map((entry, index) => ({
        ...entry,
        position: index + 1,
        form: entry.form.slice(-5), // Solo últimos 5 partidos
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
      totalMatches: matches.length,
    })
  } catch (error) {
    console.error('[API] Error in /api/leagues/[leagueId]/standings:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Error al calcular posiciones',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
