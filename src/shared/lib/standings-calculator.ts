
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
// Manual Zone Mapping for Argentina (League 128)
// User provided specific lists for Zona A and Zona B
const ARGENTINA_ZONES = {
  'Zona A': [
    'Boca Juniors', 'Independiente', 'San Lorenzo', 'Deportivo Riestra', 'Talleres', 
    'Instituto', 'Platense', 'Velez', 'Vélez', 'Estudiantes L.P.', 'Gimnasia M', 'Gimnasia y Esgrima',
    'Lanus', 'Lanús', 'Newell', "Newell's", 'Defensa', 'Central Cordoba', 'Central Córdoba', 'Union'
  ],
  'Zona B': [
    'River Plate', 'Racing', 'Huracan', 'Huracán', 'Barracas', 'Belgrano', 
    'Estudiantes de Rio', 'Estudiantes de Río', 'Argentinos', 'Tigre', 'Gimnasia L', 'Gimnasia La Plata',
    'Independiente Riv', 'Banfield', 'Rosario Central', 'Aldosivi', 'Atletico Tucuman', 'Atlético Tucumán', 'Sarmiento'
  ]
}

// Helper to determine group based on team name for Argentina
const getArgentinaGroup = (teamName: string): string => {
  const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const name = normalize(teamName)

  // Specific checks for ambiguous names or API variations
  if (name.includes('estudiantes l.p') || (name.includes('estudiantes') && !name.includes('cuarto'))) return 'Zona A'
  if (name.includes('gimnasia m')) return 'Zona A'
  
  // Check Zona A
  for (const key of ARGENTINA_ZONES['Zona A']) {
    if (name.includes(normalize(key))) return 'Zona A'
  }

  // Check Zona B
  for (const key of ARGENTINA_ZONES['Zona B']) {
    if (name.includes(normalize(key))) return 'Zona B'
  }
  
  // Fallbacks for tricky API names
  if (name.includes('talleres')) return 'Zona A'
  if (name.includes('velez')) return 'Zona A'
  if (name.includes('newell')) return 'Zona A'
  if (name.includes('defensa')) return 'Zona A'
  
  return 'Zona B' // Default fallback if not matched (most remaining are likely B if A list is exhaustive)
}

export function computeStandingsFromFixtures(fixtures: Fixture[]): ComputedStanding[] {
  const stats: Record<number, ComputedStanding> = {}

  // Helper to extract group from round string
  // Examples: "Regular Season - 1", "2nd Phase - Group A - 1", "Group A - 1"
  /* const getGroupFromRound = (round: string): string => {
    if (!round) return 'Liga Profesional'
    
    if (round.includes('Group A') || round.includes('Zone A') || round.includes('Zona A')) return 'Zona A'
    if (round.includes('Group B') || round.includes('Zone B') || round.includes('Zona B')) return 'Zona B'
    
    return 'Liga Profesional'
  } */

  const getStats = (team: { id: number, name: string, logo: string }) => {
    if (!stats[team.id]) {
      // Determine group manually for Argentina context
      // (This calculator is primarily for Argentina right now based on usage)
      const group = getArgentinaGroup(team.name)
      
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
        group: group,
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

    // Use team name mapping instead of round
    // const group = getGroupFromRound(match.league.round)
    
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

  // Sort: Group ASC (A then B), Points DESC, GD DESC, GF DESC
  standings.sort((a, b) => {
    // Sort by Group first
    if (a.group !== b.group) return a.group.localeCompare(b.group)
    
    // Then standard standing sort
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })

  // Assign positions per group
  let currentGroup = ''
  let currentPosition = 1
  
  standings.forEach((s) => {
    if (s.group !== currentGroup) {
      currentGroup = s.group
      currentPosition = 1
    }
    s.position = currentPosition++
    // Slice form to last 5
    s.form = s.form.slice(-5)
  })

  return standings
}
