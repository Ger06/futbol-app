// Tipos para ligas (Leagues)

export type League = {
  id: number
  apiId: number
  name: string
  country: string
  logo?: string
  season: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// Liga con información completa desde API-Football
export type ApiFootballLeague = {
  league: {
    id: number
    name: string
    type: string // 'League' | 'Cup'
    logo: string
  }
  country: {
    name: string
    code: string | null
    flag: string | null
  }
  seasons: {
    year: number
    start: string
    end: string
    current: boolean
    coverage: {
      fixtures: {
        events: boolean
        lineups: boolean
        statistics_fixtures: boolean
        statistics_players: boolean
      }
      standings: boolean
      players: boolean
      top_scorers: boolean
      top_assists: boolean
      top_cards: boolean
      injuries: boolean
      predictions: boolean
      odds: boolean
    }
  }[]
}

// Standings (tabla de posiciones) de una liga
export type LeagueStandings = {
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string | null
    season: number
    standings: TeamStanding[][]
  }
}

export type TeamStanding = {
  rank: number
  team: {
    id: number
    name: string
    logo: string
  }
  points: number
  goalsDiff: number
  group: string
  form: string // Últimos 5: "WWLDL"
  status: string // "same" | "up" | "down"
  description: string | null // Descripción zona (Champions, Europa, descenso)
  all: StandingRecord
  home: StandingRecord
  away: StandingRecord
  update: string
}

export type StandingRecord = {
  played: number
  win: number
  draw: number
  lose: number
  goals: {
    for: number
    against: number
  }
}

// Top scorers de una liga
export type TopScorer = {
  player: {
    id: number
    name: string
    firstname: string
    lastname: string
    age: number
    nationality: string
    photo: string
  }
  statistics: {
    team: {
      id: number
      name: string
      logo: string
    }
    league: {
      id: number
      name: string
      country: string
      logo: string
      flag: string
      season: number
    }
    games: {
      appearences: number
      lineups: number
      minutes: number
      position: string
    }
    goals: {
      total: number
      assists: number | null
    }
  }[]
}

// Top asistencias de una liga
export type TopAssist = TopScorer

// Tarjetas por liga
export type TopCards = {
  player: {
    id: number
    name: string
    photo: string
  }
  statistics: {
    team: {
      id: number
      name: string
      logo: string
    }
    cards: {
      yellow: number
      red: number
    }
  }[]
}

// Configuración de ligas activas
export const CONFIGURED_LEAGUES = [
  {
    apiId: 2,
    name: 'UEFA Champions League',
    country: 'World',
    season: 2024,
  },
  {
    apiId: 39,
    name: 'Premier League',
    country: 'England',
    season: 2024,
  },
  {
    apiId: 140,
    name: 'La Liga',
    country: 'Spain',
    season: 2024,
  },
  {
    apiId: 135,
    name: 'Serie A',
    country: 'Italy',
    season: 2024,
  },
  {
    apiId: 128,
    name: 'Liga Profesional Argentina',
    country: 'Argentina',
    season: 2024,
  },
  {
    apiId: 71,
    name: 'Brasileirão Serie A',
    country: 'Brazil',
    season: 2024,
  },
  {
    apiId: 253,
    name: 'Major League Soccer',
    country: 'USA',
    season: 2024,
  },
] as const

// Filtros para búsqueda de ligas
export type LeagueFilters = {
  active?: boolean
  country?: string
  season?: number
}

// Round (jornada) info
export type LeagueRound = {
  league: number
  season: number
  round: string
  current: boolean
}

export default League
