import { useQuery } from '@tanstack/react-query'
import type { MatchWithTeams } from '@/matches/types'

export interface FixturesByRound {
  round: string
  matches: MatchWithTeams[]
}

interface FixturesAllResponse {
  success: boolean
  data: FixturesByRound[]
  league: {
    id: number
    name: string
    season: number
  }
  totalRounds: number
  availableRounds: string[]
  totalMatches: number
}

interface FixturesRoundResponse {
  success: boolean
  data: MatchWithTeams[]
  round: string
  count: number
  league: {
    id: number
    name: string
    season: number
  }
}

/**
 * Hook para obtener todos los fixtures de una liga agrupados por jornada
 *
 * @param leagueId - ID de la liga (de nuestra DB, no API-Football)
 * @param enabled - Si la query debe ejecutarse (por defecto true)
 *
 * @example
 * ```tsx
 * const { data: fixtures, isLoading } = useFixtures(1)
 * // fixtures = [{ round: "Jornada 1", matches: [...] }, ...]
 * ```
 */
export function useFixtures(leagueId: number, enabled = true) {
  return useQuery<FixturesByRound[], Error>({
    queryKey: ['fixtures', leagueId],
    queryFn: async () => {
      const response = await fetch(`/api/leagues/${leagueId}/fixtures`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al obtener fixtures')
      }

      const json: FixturesAllResponse = await response.json()
      return json.data
    },
    enabled: enabled && leagueId > 0,
    staleTime: 1000 * 60 * 30, // 30 minutos (fixtures cambian ocasionalmente)
    gcTime: 1000 * 60 * 60, // 1 hora en cache
  })
}

/**
 * Hook para obtener fixtures de una jornada específica
 *
 * @param leagueId - ID de la liga
 * @param round - Nombre de la jornada (ej: "Jornada 10", "Octavos de Final")
 * @param enabled - Si la query debe ejecutarse (por defecto true)
 *
 * @example
 * ```tsx
 * const { data: matches } = useFixturesByRound(1, "Jornada 10")
 * ```
 */
export function useFixturesByRound(
  leagueId: number,
  round: string,
  enabled = true
) {
  return useQuery<MatchWithTeams[], Error>({
    queryKey: ['fixtures', leagueId, round],
    queryFn: async () => {
      const params = new URLSearchParams({ round })
      const response = await fetch(
        `/api/leagues/${leagueId}/fixtures?${params}`
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al obtener fixtures de la jornada')
      }

      const json: FixturesRoundResponse = await response.json()
      return json.data
    },
    enabled: enabled && leagueId > 0 && round.length > 0,
    staleTime: 1000 * 60 * 30, // 30 minutos
    gcTime: 1000 * 60 * 60, // 1 hora en cache
  })
}

/**
 * Hook para obtener la lista de jornadas disponibles de una liga
 *
 * @param leagueId - ID de la liga
 *
 * @example
 * ```tsx
 * const { data: rounds } = useAvailableRounds(1)
 * // rounds = ["Jornada 1", "Jornada 2", ...]
 * ```
 */
export function useAvailableRounds(leagueId: number) {
  return useQuery<string[], Error>({
    queryKey: ['fixtures', leagueId, 'rounds'],
    queryFn: async () => {
      const response = await fetch(`/api/leagues/${leagueId}/fixtures`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al obtener jornadas')
      }

      const json: FixturesAllResponse = await response.json()
      return json.availableRounds
    },
    enabled: leagueId > 0,
    staleTime: 1000 * 60 * 60, // 1 hora (jornadas raramente cambian)
    gcTime: 1000 * 60 * 60 * 2, // 2 horas en cache
  })
}
