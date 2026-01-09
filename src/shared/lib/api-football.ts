import prisma from './prisma'

const API_BASE_URL = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io'
const API_KEY = process.env.API_FOOTBALL_KEY || ''

// IDs de las ligas configuradas (API-Football)
export const LEAGUE_IDS = {
  CHAMPIONS_LEAGUE: 2,      // UEFA Champions League
  PREMIER_LEAGUE: 39,       // Premier League (Inglaterra)
  LA_LIGA: 140,             // La Liga (España)
  SERIE_A: 135,             // Serie A (Italia)
  LIGA_PROFESIONAL: 128,    // Liga Profesional Argentina
  BRASILEIRAO: 71,          // Brasileirão Serie A
  BUNDESLIGA: 78,           // Bundesliga (Alemania)
  MLS: 253,                 // MLS (Estados Unidos)
  LIGUE_1: 61,              // Ligue 1 (Francia)
} as const

// Tipos base de API-Football
export type ApiFootballResponse<T> = {
  get: string
  parameters: Record<string, unknown>
  errors: unknown[]
  results: number
  paging: {
    current: number
    total: number
  }
  response: T
}

const CURRENT_SEASON = 2025

/**
 * Cliente HTTP para API-Football
 */
class ApiFootballClient {
  private baseUrl: string
  // private apiKey: string // Removed to use lazy loading

  constructor() {
    this.baseUrl = API_BASE_URL
    // this.apiKey = API_KEY // Removed
  }

  /**
   * Realiza una petición GET a API-Football
   * Registra el log en la base de datos
   */
  async get<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })

    const startTime = Date.now()

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-apisports-key': process.env.API_FOOTBALL_KEY || API_KEY,
        },
      })

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        // Log error
        await this.logApiCall(endpoint, 'GET', response.status, responseTime, false, response.statusText)
        throw new Error(`API-Football error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Log success
      await this.logApiCall(endpoint, 'GET', response.status, responseTime, false)

      return data
    } catch (error) {
      const responseTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      await this.logApiCall(endpoint, 'GET', 500, responseTime, false, errorMessage)
      throw error
    }
  }

  /**
   * Registra la llamada a la API en la base de datos
   */
  private async logApiCall(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    cached: boolean,
    errorMessage?: string
  ) {
    try {
      await prisma.apiLog.create({
        data: {
          endpoint,
          method,
          statusCode,
          responseTime,
          cached,
          errorMessage: errorMessage || null,
        },
      })
    } catch (error) {
      console.error('Error logging API call:', error)
    }
  }
}

export const apiFootballClient = new ApiFootballClient()

// Tipos para Fixtures
export interface Fixture {
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
      name: string
      city: string
    }
    status: {
      long: string
      short: string
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
  events?: any[]
  lineups?: {
    team: {
      id: number
      name: string
      logo: string
      colors?: any
    }
    coach: {
      id: number
      name: string
      photo?: string
    }
    formation: string
    startXI: {
      player: {
        id: number
        name: string
        number: number
        pos: string
        grid: string | null
      }
    }[]
    substitutes: {
      player: {
        id: number
        name: string
        number: number
        pos: string
        grid: string | null
      }
    }[]
  }[]
}

// Tipos para Standings/Leagues
export interface LeagueResponse {
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string | null
    season: number
    standings: Array<Array<{
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
    }>>
  }
}

/**
 * Obtiene fixtures (partidos) de una liga
 */
export async function getFixtures(leagueId: number, season: number = CURRENT_SEASON) {
  return apiFootballClient.get<ApiFootballResponse<Fixture[]>>('/fixtures', {
    league: leagueId,
    season,
  })
}

/**
 * Obtiene un fixture por ID (incluyendo eventos, alineaciones, estadísticas si están disponibles en el endpoint standard, aunque stats suele ser aparte)
 */
export async function getFixtureById(fixtureId: number) {
  return apiFootballClient.get<ApiFootballResponse<Fixture[]>>('/fixtures', {
    id: fixtureId,
  })
}

/**
 * Obtiene la tabla de posiciones de una liga
 */
export async function getStandings(leagueId: number, season: number = CURRENT_SEASON) {
  return apiFootballClient.get<ApiFootballResponse<LeagueResponse[]>>('/standings', {
    league: leagueId,
    season,
  })
}

/**
 * Obtiene fixtures por fecha
 */
export async function getFixturesByDate(date: string) {
  return apiFootballClient.get<ApiFootballResponse<Fixture[]>>('/fixtures', {
    date, // Formato: YYYY-MM-DD
  })
}

/**
 * Obtiene fixtures en vivo
 */
export async function getLiveFixtures() {
  return apiFootballClient.get<ApiFootballResponse<Fixture[]>>('/fixtures', {
    live: 'all',
  })
}

/**
 * Obtiene múltiples fixtures por IDs (útil para obtener detalles como eventos de varios partidos)
 * Nota: API-Football permite max 20 IDs por llamada.
 */
export async function getFixturesByIds(ids: number[]) {
  if (ids.length === 0) return { response: [] }
  // La API usa guiones para separar IDs: "id1-id2-id3"
  const idsStr = ids.join('-')
  return apiFootballClient.get<ApiFootballResponse<Fixture[]>>('/fixtures', {
    ids: idsStr,
  })
}

/**
 * Obtiene estadísticas de un partido
 */
export async function getMatchStatistics(fixtureId: number) {
  return apiFootballClient.get<ApiFootballResponse<unknown[]>>('/fixtures/statistics', {
    fixture: fixtureId,
  })
}

/**
 * Obtiene información de una liga
 */
export async function getLeague(leagueId: number, season: number = CURRENT_SEASON) {
  return apiFootballClient.get<ApiFootballResponse<LeagueResponse[]>>('/standings', {
    league: leagueId,
    season,
  })
}

/**
 * Obtiene información de un equipo
 */
export async function getTeam(teamId: number) {
  return apiFootballClient.get<ApiFootballResponse<unknown[]>>('/teams', {
    id: teamId,
  })
}

export default apiFootballClient
