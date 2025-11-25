// Tipos para equipos (Teams)

export type Team = {
  id: number
  apiId: number
  name: string
  code?: string
  logo?: string
  country?: string
  founded?: number
  venue?: string
  createdAt: Date
  updatedAt: Date
}

export type TeamWithStats = Team & {
  stats?: TeamStatistics
}

// Información completa del equipo desde API-Football
export type ApiFootballTeam = {
  team: {
    id: number
    name: string
    code: string
    country: string
    founded: number
    national: boolean
    logo: string
  }
  venue: {
    id: number
    name: string
    address: string
    city: string
    capacity: number
    surface: string
    image: string
  }
}

// Estadísticas de equipo
export type TeamStatistics = {
  teamId: number
  leagueId: number
  season: number
  form: string // Últimos 5 partidos: "WWLDW"
  fixtures: {
    played: {
      home: number
      away: number
      total: number
    }
    wins: {
      home: number
      away: number
      total: number
    }
    draws: {
      home: number
      away: number
      total: number
    }
    loses: {
      home: number
      away: number
      total: number
    }
  }
  goals: {
    for: {
      total: {
        home: number
        away: number
        total: number
      }
      average: {
        home: string
        away: string
        total: string
      }
    }
    against: {
      total: {
        home: number
        away: number
        total: number
      }
      average: {
        home: string
        away: string
        total: string
      }
    }
  }
  biggest: {
    streak: {
      wins: number
      draws: number
      loses: number
    }
    wins: {
      home: string
      away: string
    }
    loses: {
      home: string
      away: string
    }
    goals: {
      for: {
        home: number
        away: number
      }
      against: {
        home: number
        away: number
      }
    }
  }
  clean_sheet: {
    home: number
    away: number
    total: number
  }
  failed_to_score: {
    home: number
    away: number
    total: number
  }
  penalty: {
    scored: {
      total: number
      percentage: string
    }
    missed: {
      total: number
      percentage: string
    }
    total: number
  }
  lineups: {
    formation: string
    played: number
  }[]
  cards: {
    yellow: {
      [key: string]: {
        total: number
        percentage: string
      }
    }
    red: {
      [key: string]: {
        total: number
        percentage: string
      }
    }
  }
}

// Posición en tabla
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
  form: string
  status: string
  description: string | null
  all: {
    played: number
    win: number
    draw: number
    lose: number
    goals: {
      for: number
      against: number
    }
  }
  home: {
    played: number
    win: number
    draw: number
    lose: number
    goals: {
      for: number
      against: number
    }
  }
  away: {
    played: number
    win: number
    draw: number
    lose: number
    goals: {
      for: number
      against: number
    }
  }
  update: string
}

// Jugadores destacados (top scorers, assists, etc.)
export type PlayerStatistics = {
  player: {
    id: number
    name: string
    firstname: string
    lastname: string
    age: number
    birth: {
      date: string
      place: string
      country: string
    }
    nationality: string
    height: string
    weight: string
    injured: boolean
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
      number: number | null
      position: string
      rating: string
      captain: boolean
    }
    substitutes: {
      in: number
      out: number
      bench: number
    }
    shots: {
      total: number
      on: number
    }
    goals: {
      total: number
      conceded: number
      assists: number
      saves: number
    }
    passes: {
      total: number
      key: number
      accuracy: number
    }
    tackles: {
      total: number
      blocks: number
      interceptions: number
    }
    duels: {
      total: number
      won: number
    }
    dribbles: {
      attempts: number
      success: number
      past: number | null
    }
    fouls: {
      drawn: number
      committed: number
    }
    cards: {
      yellow: number
      yellowred: number
      red: number
    }
    penalty: {
      won: number | null
      commited: number | null
      scored: number
      missed: number
      saved: number | null
    }
  }[]
}

export default Team
