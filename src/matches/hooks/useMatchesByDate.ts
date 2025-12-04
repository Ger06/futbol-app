import { useQuery } from '@tanstack/react-query'
import { queryKeys, STALE_TIME } from '@/shared/lib/query-client'
import type { MatchWithTeams } from '@/matches/types'

interface MatchesResponse {
  success: boolean
  data: MatchWithTeams[]
  count: number
  error?: string
}

/**
 * Hook para obtener partidos de una fecha específica
 *
 * Determina automáticamente el staleTime y refetchInterval según:
 * - Fecha futura: 5 minutos (fixtures cambian poco)
 * - Fecha de hoy: 30 segundos (partidos en vivo)
 * - Fecha pasada: 30 minutos (resultados no cambian)
 *
 * @param date - Fecha en formato YYYY-MM-DD
 *
 * @example
 * ```tsx
 * function MatchesByDate({ date }: { date: string }) {
 *   const { data, isLoading, error } = useMatchesByDate(date)
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *
 *   return <MatchList matches={data} />
 * }
 * ```
 */
export function useMatchesByDate(date: string) {
  // Determinar si es hoy, pasado o futuro
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const queryDate = new Date(date)
  queryDate.setHours(0, 0, 0, 0)

  const isToday = queryDate.getTime() === today.getTime()
  const isPast = queryDate < today
  const isFuture = queryDate > today

  // Configurar staleTime y refetch según el tipo de fecha
  let staleTime: number
  let refetchInterval: number | false

  if (isToday) {
    // Hoy: actualizar cada 30 segundos (partidos en vivo)
    staleTime = STALE_TIME.LIVE_MATCHES
    refetchInterval = STALE_TIME.LIVE_MATCHES
  } else if (isPast) {
    // Pasado: datos estáticos, cache largo
    staleTime = STALE_TIME.FINISHED_MATCHES
    refetchInterval = false // No refetch automático
  } else {
    // Futuro: fixtures cambian poco
    staleTime = STALE_TIME.FIXTURES
    refetchInterval = false // No refetch automático
  }

  return useQuery({
    queryKey: queryKeys.matches.byDate(date),
    queryFn: async (): Promise<MatchWithTeams[]> => {
      const response = await fetch(`/api/matches?date=${date}`)

      if (!response.ok) {
        throw new Error('Error al cargar los partidos')
      }

      const json: MatchesResponse = await response.json()

      if (!json.success) {
        throw new Error(json.error || 'Error desconocido')
      }

      return json.data
    },
    staleTime,
    refetchInterval,
    refetchOnWindowFocus: isToday, // Solo refetch al enfocar si es hoy
  })
}

/**
 * Hook para obtener partidos en vivo de una fecha específica
 *
 * Filtra los partidos de useMatchesByDate para mostrar solo
 * los que están actualmente en vivo (status === 'LIVE')
 *
 * @param date - Fecha en formato YYYY-MM-DD
 *
 * @example
 * ```tsx
 * function LiveMatches({ date }: { date: string }) {
 *   const { data: liveMatches, isLoading } = useLiveMatches(date)
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (!liveMatches || liveMatches.length === 0) {
 *     return <p>No hay partidos en vivo</p>
 *   }
 *
 *   return <MatchList matches={liveMatches} />
 * }
 * ```
 */
export function useLiveMatches(date: string) {
  const query = useMatchesByDate(date)

  return {
    ...query,
    data: query.data?.filter((match) => match.status === 'LIVE'),
  }
}
