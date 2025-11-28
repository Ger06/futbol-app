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
    season: 2023,
    icon: '🏆',
    color: '#00338D', // Azul UEFA
  },
  {
    id: 39, // Premier League
    slug: 'premier-league',
    name: 'Premier League',
    shortName: 'Premier',
    country: 'Inglaterra',
    season: 2023,
    icon: '🦁',
    color: '#38003C', // Púrpura Premier
  },
  {
    id: 140, // La Liga
    slug: 'la-liga',
    name: 'LaLiga Santander',
    shortName: 'La Liga',
    country: 'España',
    season: 2023,
    icon: '⚽',
    color: '#FF4747', // Rojo LaLiga
  },
  {
    id: 135, // Serie A
    slug: 'serie-a',
    name: 'Serie A',
    shortName: 'Serie A',
    country: 'Italia',
    season: 2023,
    icon: '🇮🇹',
    color: '#024494', // Azul Serie A
  },
  {
    id: 128, // Liga Profesional Argentina
    slug: 'liga-argentina',
    name: 'Liga Profesional Argentina',
    shortName: 'Argentina',
    country: 'Argentina',
    season: 2023,
    icon: '🇦🇷',
    color: '#75AADB', // Celeste argentino
  },
  {
    id: 71, // Brasileirão Serie A
    slug: 'brasileirao',
    name: 'Campeonato Brasileiro Série A',
    shortName: 'Brasileirão',
    country: 'Brasil',
    season: 2023,
    icon: '🇧🇷',
    color: '#009C3B', // Verde brasileño
  },
  {
    id: 253, // Major League Soccer
    slug: 'mls',
    name: 'Major League Soccer',
    shortName: 'MLS',
    country: 'Estados Unidos',
    season: 2023,
    icon: '🇺🇸',
    color: '#C2C2C2', // Gris MLS
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
