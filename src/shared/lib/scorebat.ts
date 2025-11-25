/**
 * Cliente para Scorebat API - Videos de goles y highlights
 * API completamente gratuita sin autenticación
 * Documentación: https://www.scorebat.com/video-api/
 */

const SCOREBAT_API_URL = 'https://www.scorebat.com/video-api/v3'

export type ScorebatVideo = {
  title: string
  embed: string // URL del video embed
  url: string // URL de la página del video
  thumbnail: string
  date: string
  competition: {
    name: string
    id: number
    url: string
  }
  videos: {
    title: string
    embed: string
  }[]
}

export type ScorebatResponse = ScorebatVideo[]

/**
 * Cliente HTTP para Scorebat API
 */
class ScorebatClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = SCOREBAT_API_URL
  }

  /**
   * Realiza una petición GET a Scorebat
   */
  async get<T>(endpoint: string = ''): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Scorebat API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching Scorebat API:', error)
      throw error
    }
  }
}

export const scorebatClient = new ScorebatClient()

/**
 * Obtiene todos los videos de highlights disponibles
 */
export async function getAllHighlights(): Promise<ScorebatResponse> {
  return scorebatClient.get<ScorebatResponse>('/')
}

/**
 * Obtiene videos filtrados por competición
 */
export async function getHighlightsByCompetition(
  competitionName: string
): Promise<ScorebatVideo[]> {
  const allHighlights = await getAllHighlights()

  return allHighlights.filter((video) =>
    video.competition.name.toLowerCase().includes(competitionName.toLowerCase())
  )
}

/**
 * Obtiene videos filtrados por equipo
 */
export async function getHighlightsByTeam(teamName: string): Promise<ScorebatVideo[]> {
  const allHighlights = await getAllHighlights()

  return allHighlights.filter((video) =>
    video.title.toLowerCase().includes(teamName.toLowerCase())
  )
}

/**
 * Obtiene videos de las últimas 24 horas
 */
export async function getRecentHighlights(): Promise<ScorebatVideo[]> {
  const allHighlights = await getAllHighlights()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

  return allHighlights.filter((video) => {
    const videoDate = new Date(video.date)
    return videoDate >= yesterday
  })
}

/**
 * Mapea nombres de competiciones de API-Football a Scorebat
 */
export const COMPETITION_MAPPING: Record<string, string> = {
  'UEFA Champions League': 'champions',
  'Premier League': 'premier',
  'La Liga': 'la liga',
  'Serie A': 'serie a',
  'Liga Profesional Argentina': 'argentina',
  'Brasileirão Serie A': 'brasileirao',
  'Major League Soccer': 'mls',
}

/**
 * Obtiene videos para nuestras ligas configuradas
 */
export async function getHighlightsForConfiguredLeagues(): Promise<{
  [key: string]: ScorebatVideo[]
}> {
  const allHighlights = await getAllHighlights()
  const result: { [key: string]: ScorebatVideo[] } = {}

  Object.entries(COMPETITION_MAPPING).forEach(([leagueName, searchTerm]) => {
    result[leagueName] = allHighlights.filter((video) =>
      video.competition.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return result
}

export default scorebatClient
