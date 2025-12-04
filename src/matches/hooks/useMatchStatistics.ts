import { useQuery } from '@tanstack/react-query'
import { queryKeys, STALE_TIME } from '@/shared/lib/query-client'
import type { MatchStatistics, MatchStatisticsResponse, MatchStatus } from '@/matches/types'

/**
 * Hook para obtener estadísticas detalladas de un partido
 *
 * Características:
 * - Refetch automático cada 30 segundos para partidos en vivo
 * - Cache prolongado (30 días) para partidos finalizados
 * - No refetch para partidos finalizados (datos inmutables)
 * - Refetch al volver a ventana solo para partidos activos
 *
 * @param matchId - ID del partido
 * @param matchStatus - Status del partido (para determinar estrategia de refetch)
 *
 * @example
 * ```tsx
 * function MatchStatisticsPanel({ matchId, status }: Props) {
 *   const { data, isLoading, error } = useMatchStatistics(matchId, status)
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *   if (!data) return <NoStatsAvailable />
 *
 *   return <StatisticsGrid statistics={data} />
 * }
 * ```
 */
export function useMatchStatistics(matchId: number, matchStatus?: MatchStatus) {
  // Determinar si el partido está finalizado
  const isFinished = matchStatus === 'FT' || matchStatus === 'AET' || matchStatus === 'PEN'

  // Determinar si el partido está en vivo
  const isLive = matchStatus === 'LIVE' || matchStatus === 'HT'

  return useQuery({
    queryKey: queryKeys.matches.statistics(matchId),
    queryFn: async (): Promise<MatchStatistics[] | null> => {
      const response = await fetch(`/api/matches/${matchId}/statistics`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const json: MatchStatisticsResponse = await response.json()

      if (!json.success) {
        throw new Error(json.message || 'Error al cargar estadísticas')
      }

      return json.data
    },
    // Configuración de cache según status del partido
    staleTime: isFinished
      ? 30 * 24 * 60 * 60 * 1000 // 30 días para partidos finalizados
      : isLive
        ? STALE_TIME.LIVE_MATCHES // 30 segundos para partidos en vivo
        : 60 * 60 * 1000, // 1 hora para otros estados

    // Refetch automático solo para partidos en vivo
    refetchInterval: isLive ? STALE_TIME.LIVE_MATCHES : false,

    // Refetch al volver a ventana solo si no está finalizado
    refetchOnWindowFocus: !isFinished,

    // Retry solo una vez para evitar gastar API calls
    retry: 1,

    // No hacer refetch automático en mount para partidos finalizados
    refetchOnMount: !isFinished,
  })
}

/**
 * Hook helper para obtener una estadística específica de un equipo
 *
 * @param statistics - Array de estadísticas del partido
 * @param teamId - ID del equipo
 * @param statType - Tipo de estadística a buscar
 *
 * @example
 * ```tsx
 * function BallPossession({ stats, teamId }: Props) {
 *   const possession = useTeamStatistic(stats, teamId, 'Ball Possession')
 *   return <div>{possession || 'N/A'}</div>
 * }
 * ```
 */
export function useTeamStatistic(
  statistics: MatchStatistics[] | null,
  teamId: number,
  statType: string
): string | number | null {
  if (!statistics) return null

  const teamStats = statistics.find((s) => s.team.id === teamId)
  if (!teamStats) return null

  const stat = teamStats.statistics.find((s) => s.type === statType)
  return stat?.value ?? null
}

/**
 * Hook helper para verificar si hay estadísticas disponibles
 *
 * @param statistics - Array de estadísticas del partido
 * @returns true si hay al menos una estadística disponible
 *
 * @example
 * ```tsx
 * function MatchDetails({ matchId, status }: Props) {
 *   const { data } = useMatchStatistics(matchId, status)
 *   const hasStats = useHasStatistics(data)
 *
 *   if (!hasStats) {
 *     return <NoStatsMessage />
 *   }
 *
 *   return <StatisticsPanel data={data} />
 * }
 * ```
 */
export function useHasStatistics(statistics: MatchStatistics[] | null): boolean {
  if (!statistics || statistics.length === 0) return false

  // Verificar que al menos un equipo tenga estadísticas
  return statistics.some((team) => team.statistics.length > 0)
}
