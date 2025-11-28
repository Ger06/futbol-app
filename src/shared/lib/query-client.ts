import { QueryClient, DefaultOptions } from '@tanstack/react-query'

/**
 * Configuración de TanStack Query optimizada para datos de fútbol
 *
 * Estrategia de staleTime basada en tipo de dato:
 * - Partidos en vivo: 30 segundos
 * - Fixtures futuros: 5 minutos
 * - Partidos finalizados: 30 minutos
 * - Standings/Estadísticas: 5 minutos
 */

const queryConfig: DefaultOptions = {
  queries: {
    // Tiempo que los datos se consideran "frescos" antes de refetch
    staleTime: 5 * 60 * 1000, // 5 minutos (default para la mayoría de datos)

    // Tiempo que los datos se mantienen en cache
    gcTime: 10 * 60 * 1000, // 10 minutos (antes llamado cacheTime en v4)

    // Reintentos en caso de error
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Refetch automático
    refetchOnWindowFocus: false, // No refetch automático al volver al tab
    refetchOnReconnect: true,    // Sí refetch al reconectar internet
    refetchOnMount: true,        // Sí refetch al montar componente

    // Configuración de red
    networkMode: 'online',
  },
  mutations: {
    retry: 1,
    networkMode: 'online',
  },
}

/**
 * Crea una nueva instancia de QueryClient con la configuración por defecto
 *
 * Esta función debe usarse en lugar de crear instancias directamente
 * para mantener configuración consistente en toda la aplicación
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: queryConfig,
  })
}

/**
 * Query keys para consistencia en toda la aplicación
 *
 * Usar estos keys garantiza que el caching y la invalidación
 * funcionen correctamente en toda la app
 */
export const queryKeys = {
  // Matches
  matches: {
    all: ['matches'] as const,
    today: () => [...queryKeys.matches.all, 'today'] as const,
    byDate: (date: string) => [...queryKeys.matches.all, 'date', date] as const,
    byLeague: (leagueId: number) => [...queryKeys.matches.all, 'league', leagueId] as const,
    byTeam: (teamId: number) => [...queryKeys.matches.all, 'team', teamId] as const,
    live: () => [...queryKeys.matches.all, 'live'] as const,
    detail: (matchId: number) => [...queryKeys.matches.all, matchId] as const,
  },

  // Standings
  standings: {
    all: ['standings'] as const,
    byLeague: (leagueId: number, season: number) =>
      [...queryKeys.standings.all, leagueId, season] as const,
  },

  // Teams
  teams: {
    all: ['teams'] as const,
    detail: (teamId: number) => [...queryKeys.teams.all, teamId] as const,
    statistics: (teamId: number, season: number) =>
      [...queryKeys.teams.all, teamId, 'statistics', season] as const,
  },

  // Players
  players: {
    all: ['players'] as const,
    detail: (playerId: number) => [...queryKeys.players.all, playerId] as const,
    statistics: (playerId: number, season: number) =>
      [...queryKeys.players.all, playerId, 'statistics', season] as const,
  },

  // Leagues
  leagues: {
    all: ['leagues'] as const,
    detail: (leagueId: number) => [...queryKeys.leagues.all, leagueId] as const,
    topScorers: (leagueId: number, season: number) =>
      [...queryKeys.leagues.all, leagueId, 'topScorers', season] as const,
  },

  // Videos
  videos: {
    all: ['videos'] as const,
    recent: () => [...queryKeys.videos.all, 'recent'] as const,
    byMatch: (matchId: number) => [...queryKeys.videos.all, 'match', matchId] as const,
  },
} as const

/**
 * Tiempos de staleTime personalizados por tipo de dato
 *
 * Usar estos valores en queries específicas cuando se necesite
 * un comportamiento diferente al default
 */
export const STALE_TIME = {
  // Datos que cambian muy rápido
  LIVE_MATCHES: 30 * 1000,           // 30 segundos

  // Datos que cambian ocasionalmente
  FIXTURES: 5 * 60 * 1000,           // 5 minutos
  STANDINGS: 5 * 60 * 1000,          // 5 minutos
  TEAM_STATISTICS: 10 * 60 * 1000,   // 10 minutos

  // Datos que casi no cambian
  FINISHED_MATCHES: 30 * 60 * 1000,  // 30 minutos
  PLAYER_STATISTICS: 30 * 60 * 1000, // 30 minutos

  // Datos estáticos
  TEAM_INFO: 60 * 60 * 1000,         // 1 hora
  LEAGUE_INFO: 60 * 60 * 1000,       // 1 hora
} as const
