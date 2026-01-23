
import { Fixture } from './api-football'

// Types for internal calculation
export interface ComputedStanding {
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
 * Computes standings from a list of fixtures
 */
export function computeStandingsFromFixtures(fixtures: Fixture[]): ComputedStanding[] {
  const stats: Record<number, ComputedStanding> = {}

  const getStats = (team: { id: number, name: string, logo: string }) => {
    if (!stats[team.id]) {
      stats[team.id] = {
        position: 0,
        team: {
          id: team.id,
          name: team.name,
          logo: team.logo,
        },
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        group: 'Liga Profesional', // Default for now
        form: []
      }
    }
    return stats[team.id]
  }

  const validStatuses = ['1H', 'HT', '2H', 'ET', 'P', 'FT', 'AET', 'PEN']

  // Sort fixtures by date ascending to build form correctly
  const sortedFixtures = [...fixtures].sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())

  for (const match of sortedFixtures) {
    if (!validStatuses.includes(match.fixture.status.short)) continue

    const home = getStats(match.teams.home)
    const away = getStats(match.teams.away)

    const goalsHome = match.goals.home ?? 0
    const goalsAway = match.goals.away ?? 0

    home.played++
    away.played++
    
    home.goalsFor += goalsHome
    home.goalsAgainst += goalsAway
    away.goalsFor += goalsAway
    away.goalsAgainst += goalsHome

    home.goalDifference = home.goalsFor - home.goalsAgainst
    away.goalDifference = away.goalsFor - away.goalsAgainst

    if (goalsHome > goalsAway) {
      home.won++
      home.points += 3
      away.lost++
      home.form.push('W')
      away.form.push('L')
    } else if (goalsHome < goalsAway) {
      away.won++
      away.points += 3
      home.lost++
      away.form.push('W')
      home.form.push('L')
    } else {
      home.drawn++
      home.points += 1
      away.drawn++
      away.points += 1
      home.form.push('D')
      away.form.push('D')
    }
  }

  // Convert to array
  const standings = Object.values(stats)

  // Sort: Points DESC, GD DESC, GF DESC
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })

  // Assign positions
  standings.forEach((s, idx) => {
    s.position = idx + 1
    // Slice form to last 5
    s.form = s.form.slice(-5)
  })

  return standings
}
