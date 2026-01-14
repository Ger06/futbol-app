// Tipos para partidos (Matches)

export type MatchStatus =
  | 'NS'    // Not Started
  | 'LIVE'  // Live
  | 'HT'    // Half Time
  | 'FT'    // Full Time
  | 'AET'   // After Extra Time
  | 'PEN'   // Penalties
  | 'PST'   // Postponed
  | 'CANC'  // Cancelled
  | 'ABD'   // Abandoned

export type Match = {
  id: number
  apiId: number
  leagueId: number
  homeTeamId: number
  awayTeamId: number
  matchDate: Date
  status: MatchStatus
  round?: string
  homeScore?: number
  awayScore?: number
  venue?: string
  referee?: string
  createdAt: Date
  updatedAt: Date
}

export type MatchWithTeams = Match & {
  homeTeam: {
    id: number
    apiId: number
    name: string
    logo?: string
    code?: string
  }
  awayTeam: {
    id: number
    apiId: number
    name: string
    logo?: string
    code?: string
  }
  league: {
    id: number
    apiId?: number // Added for reliable lookup
    name: string
    country: string
    logo?: string
  }
  goals?: Goal[]
  cards?: Card[]
  elapsed?: number
}

export type MatchWithDetails = MatchWithTeams & {
  goals: Goal[]
  cards: Card[]
  substitutions?: Substitution[]
  elapsed?: number
  stats?: {
    home: TeamStatsDetails
    away: TeamStatsDetails
  }
  lineups?: {
    home?: TeamLineup
    away?: TeamLineup
  }
}

export type TeamLineup = {
  formation: string
  coach: {
    name: string
    photo?: string
  }
  startXI: PlayerLineup[]
  substitutes: PlayerLineup[]
}

export type PlayerLineup = {
  id: number
  name: string
  number: number
  pos: string
  grid: string | null
}

export type TeamStatsDetails = {
  possession: number
  shotsOnTarget: number
  totalShots: number
  corners: number
  fouls: number
}

export type Goal = {
  id: number
  matchId: number
  teamId: number
  playerName: string
  minute: number
  extraTime?: number
  type: GoalType
  createdAt: Date
}

export type GoalType = 'Normal' | 'Penalty' | 'Own Goal'

export type Card = {
  id: number
  matchId: number
  teamId: number
  playerName: string
  minute: number
  type: CardType
  createdAt: Date
}

export type CardType = 'Yellow' | 'Red'

export type Substitution = {
  id: number
  minute: number
  teamId: number
  playerOut: {
    id: number
    name: string
  }
  playerIn: {
    id: number
    name: string
  }
}

// Tipos para respuestas de API-Football
export type ApiFootballFixture = {
  fixture: {
    id: number
    referee: string | null
    timezone: string
    date: string
    timestamp: number
    periods: {
      first: number | null
      second: number | null
    }
    venue: {
      id: number | null
      name: string | null
      city: string | null
    }
    status: {
      long: string
      short: MatchStatus
      elapsed: number | null
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string | null
    season: number
    round: string
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
      winner: boolean | null
    }
    away: {
      id: number
      name: string
      logo: string
      winner: boolean | null
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime: {
      home: number | null
      away: number | null
    }
    fulltime: {
      home: number | null
      away: number | null
    }
    extratime: {
      home: number | null
      away: number | null
    }
    penalty: {
      home: number | null
      away: number | null
    }
  }
}

export type ApiFootballEvents = {
  time: {
    elapsed: number
    extra: number | null
  }
  team: {
    id: number
    name: string
    logo: string
  }
  player: {
    id: number
    name: string
  }
  assist: {
    id: number | null
    name: string | null
  }
  type: string // 'Goal', 'Card', 'subst', etc.
  detail: string // 'Normal Goal', 'Penalty', 'Yellow Card', 'Red Card', etc.
  comments: string | null
}

// Filtros para búsqueda de partidos
export type MatchFilters = {
  leagueId?: number
  date?: string
  status?: MatchStatus
  teamId?: number
  limit?: number
  offset?: number
}

// Estadísticas de partido
export type MatchStatistics = {
  team: {
    id: number
    name: string
    logo: string
  }
  statistics: {
    type: string
    value: number | string | null
  }[]
}

// Respuesta del endpoint de estadísticas
export type MatchStatisticsResponse = {
  success: boolean
  data: MatchStatistics[] | null
  cached?: boolean
  message?: string
}

// Tipos de estadísticas disponibles en API-Football
export type StatisticType =
  | 'Shots on Goal'
  | 'Shots off Goal'
  | 'Total Shots'
  | 'Blocked Shots'
  | 'Shots insidebox'
  | 'Shots outsidebox'
  | 'Fouls'
  | 'Corner Kicks'
  | 'Offsides'
  | 'Ball Possession'
  | 'Yellow Cards'
  | 'Red Cards'
  | 'Goalkeeper Saves'
  | 'Total passes'
  | 'Passes accurate'
  | 'Passes %'

export default Match
