/**
 * Configuración de Ligas del Sitio
 *
 * Define las 7 competiciones principales con sus slugs para rutas dinámicas
 */

export interface LeagueConfig {
  id: number // API-Football league ID
  slug: string // URL slug para rutas dinámicas
  name: string // Nombre completo
  shortName: string // Nombre corto para sidebar
  country: string // País
  season: number // Temporada actual
  icon: string // Emoji o ícono
  color: string // Color primario para UI
  broadcasters?: string[] // Logos de broadcasters (URLs)
}

/**
 * Configuración de las 7 ligas principales
 *
 * IMPORTANTE: Los slugs deben coincidir con las rutas dinámicas en app/[league]
 */
export const LEAGUES_CONFIG: LeagueConfig[] = [
  {
    id: 2, // UEFA Champions League
    slug: 'champions-league',
    name: 'UEFA Champions League',
    shortName: 'Champions',
    country: 'Europa',
    season: 2025,
    icon: '🏆', // Trophy fits the user request for "Logo de la champions" as best as possible with emoji
    color: '#00338D',
    broadcasters: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/100px-ESPN_wordmark.svg.png',
      'https://commons.wikimedia.org/wiki/File:FOX_Sports_logo.svg#/media/File:FOX_Sports_logo.svg'
    ],
  },
  {
    id: 39, // Premier League
    slug: 'premier-league',
    name: 'Premier League',
    shortName: 'Premier',
    country: 'Inglaterra',
    season: 2025,
    icon: '🌹', // User request: Red Rose
    color: '#38003C',
    broadcasters: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/100px-ESPN_wordmark.svg.png'
    ],
  },
  {
    id: 140, // La Liga
    slug: 'la-liga',
    name: 'LaLiga Santander',
    shortName: 'La Liga',
    country: 'España',
    season: 2025,
    icon: '🐂', // Bull (Representative)
    color: '#FF4747',
    broadcasters: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/100px-ESPN_wordmark.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/DirecTV_Sports_logo_2018.png/250px-DirecTV_Sports_logo_2018.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Fox_Sports_Latin_America_2012.svg/100px-Fox_Sports_Latin_America_2012.svg.png'
    ],
  },
  {
    id: 78, // Bundesliga
    slug: 'bundesliga',
    name: 'Bundesliga',
    shortName: 'Bundesliga',
    country: 'Alemania',
    season: 2025,
    icon: '🍺', // Beer (Representative)
    color: '#D20515',
    broadcasters: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/100px-ESPN_wordmark.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/0/0c/FOX_Sports_logo.svg'
    ],
  },
  {
    id: 135, // Serie A
    slug: 'serie-a',
    name: 'Serie A',
    shortName: 'Serie A',
    country: 'Italia',
    season: 2025,
    icon: '🍝', // Pizza (Representative)
    color: '#024494',
    broadcasters: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/100px-ESPN_wordmark.svg.png'
    ],
  },
  {
    id: 128, // Liga Profesional Argentina
    slug: 'liga-argentina',
    name: 'Liga Profesional Argentina',
    shortName: 'Argentina',
    country: 'Argentina',
    season: 2025,
    icon: '🧉', // User request: Mate
    color: '#75AADB',
    broadcasters: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/TyC_Sports_logo.svg/100px-TyC_Sports_logo.svg.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/100px-ESPN_wordmark.svg.png'
    ],
  },
  {
    id: 71, // Brasileirão Serie A
    slug: 'brasileirao',
    name: 'Campeonato Brasileiro Série A',
    shortName: 'Brasileirão',
    country: 'Brasil',
    season: 2025,
    icon: '🌴', // Palm Tree (Representative)
    color: '#009C3B',
    broadcasters: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/100px-ESPN_wordmark.svg.png',
      // Adding Premiere/Globo generic placeholder
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Premiere_FC_logo.svg/100px-Premiere_FC_logo.svg.png'
    ],
  },
  {
    id: 253, // Major League Soccer
    slug: 'mls',
    name: 'Major League Soccer',
    shortName: 'MLS',
    country: 'Estados Unidos',
    season: 2025,
    icon: '🗽', // Statue of Liberty (Representative)
    color: '#C2C2C2',
    broadcasters: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Apple_TV_logo.svg/100px-Apple_TV_logo.svg.png'
    ],
  },
  {
    id: 61, // Ligue 1
    slug: 'ligue-1',
    name: 'Ligue 1',
    shortName: 'Ligue 1',
    country: 'Francia',
    season: 2025,
    icon: '🥐', // Croissant (Representative)
    color: '#DAE2F3',
    broadcasters: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/100px-ESPN_wordmark.svg.png'
    ],
  },
]

/**
 * Mapa de slugs a configuración de liga (para lookups rápidos)
 */
export const LEAGUES_BY_SLUG = LEAGUES_CONFIG.reduce(
  (acc, league) => {
    acc[league.slug] = league
    return acc
  },
  {} as Record<string, LeagueConfig>
)

/**
 * Mapa de IDs a configuración de liga (para lookups rápidos)
 */
export const LEAGUES_BY_ID = LEAGUES_CONFIG.reduce(
  (acc, league) => {
    acc[league.id] = league
    return acc
  },
  {} as Record<number, LeagueConfig>
)

/**
 * Obtener configuración de liga por slug
 */
export function getLeagueBySlug(slug: string): LeagueConfig | undefined {
  return LEAGUES_BY_SLUG[slug]
}

/**
 * Obtener configuración de liga por ID
 */
export function getLeagueById(id: number): LeagueConfig | undefined {
  return LEAGUES_BY_ID[id]
}

/**
 * Validar si un slug es válido
 */
export function isValidLeagueSlug(slug: string): boolean {
  return slug in LEAGUES_BY_SLUG
}
