import { useQuery } from '@tanstack/react-query'
import { queryKeys, STALE_TIME } from '@/shared/lib/query-client'
import type { MatchWithDetails } from '@/matches/types'

interface MatchDetailsResponse {
  success: boolean
  data: MatchWithDetails
  error?: string
}

/**
 * Hook para obtener los detalles completos de un partido
 *
 * Incluye:
 * - Información básica del partido
 * - Equipos con logos
 * - Liga
 * - Goles ordenados por minuto
 * - Tarjetas ordenadas por minuto
 *
 * Características:
 * - Cache de 30 minutos para partidos finalizados
 * - Cache de 30 segundos para partidos en vivo
 * - Refetch automático solo para partidos activos
 *
 * @param matchId - ID del partido
 *
 * @example
 * ```tsx
 * function MatchPage({ matchId }: Props) {
 *   const { data, isLoading, error } = useMatchDetails(matchId)
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *
 *   return (
 *     <div>
 *       <MatchHeader match={data} />
 *       <GoalsList goals={data.goals} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useMatchDetails(matchId: number) {
  return useQuery({
    queryKey: queryKeys.matches.detail(matchId),
    queryFn: async (): Promise<MatchWithDetails> => {
      const response = await fetch(`/api/matches/${matchId}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const json: MatchDetailsResponse = await response.json()

      if (!json.success) {
        throw new Error(json.error || 'Error al cargar detalles del partido')
      }

      return json.data
    },
    // Configuración de cache según status del partido
    staleTime: STALE_TIME.FINISHED_MATCHES, // 30 minutos por defecto
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
  })
}

/**
 * Hook helper para obtener solo los goles del equipo local
 */
export function useHomeGoals(match: MatchWithDetails | undefined) {
  if (!match) return []
  return match.goals.filter((goal) => goal.teamId === match.homeTeamId)
}

/**
 * Hook helper para obtener solo los goles del equipo visitante
 */
export function useAwayGoals(match: MatchWithDetails | undefined) {
  if (!match) return []
  return match.goals.filter((goal) => goal.teamId === match.awayTeamId)
}

/**
 * Hook helper para obtener las tarjetas de un equipo
 */
export function useTeamCards(match: MatchWithDetails | undefined, teamId: number) {
  if (!match) return []
  return match.cards.filter((card) => card.teamId === teamId)
}
