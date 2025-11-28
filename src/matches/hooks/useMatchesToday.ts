import { useQuery } from '@tanstack/react-query'
import { queryKeys, STALE_TIME } from '@/shared/lib/query-client'
import type { MatchWithTeams } from '@/matches/types'

interface MatchesResponse {
  success: boolean
  data: MatchWithTeams[]
  count: number
}

/**
 * Hook para obtener los partidos del día actual
 *
 * Características:
 * - Refetch automático cada 30 segundos para partidos en vivo
 * - Refetch al volver a la ventana
 * - Cache de 30 segundos
 *
 * @example
 * ```tsx
 * function MatchesToday() {
 *   const { data, isLoading, error } = useMatchesToday()
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *
 *   return <MatchList matches={data} />
 * }
 * ```
 */
export function useMatchesToday() {
  return useQuery({
    queryKey: queryKeys.matches.today(),
    queryFn: async (): Promise<MatchWithTeams[]> => {
      const response = await fetch('/api/matches/today')

      if (!response.ok) {
        throw new Error('Error al cargar los partidos del día')
      }

      const json: MatchesResponse = await response.json()

      if (!json.success) {
        throw new Error(json.error || 'Error desconocido')
      }

      return json.data
    },
    staleTime: STALE_TIME.LIVE_MATCHES, // 30 segundos
    refetchInterval: STALE_TIME.LIVE_MATCHES, // Refetch automático cada 30s
    refetchOnWindowFocus: true, // Refetch al volver a la ventana
  })
}

/**
 * Hook para obtener el conteo de partidos en vivo
 *
 * Usa los mismos datos que useMatchesToday pero solo extrae
 * la cantidad de partidos con status LIVE
 *
 * @example
 * ```tsx
 * function LiveMatchesIndicator() {
 *   const count = useLiveMatchesCount()
 *   if (count === 0) return null
 *   return <Badge>{count} en vivo</Badge>
 * }
 * ```
 */
export function useLiveMatchesCount() {
  const { data } = useMatchesToday()

  if (!data) return 0

  return data.filter((match) => match.status === 'LIVE').length
}
