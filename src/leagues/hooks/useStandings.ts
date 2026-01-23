import { useQuery } from '@tanstack/react-query'

export interface StandingEntry {
  position: number
  team: {
    id: number
    name: string
    logo: string | null
  }
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  group: string // Grupo o Zona: "Group A", "Zona A", etc.
  form: string[] // "W", "D", "L"
}

interface StandingsResponse {
  success: boolean
  data: StandingEntry[]
  league: {
    id: number
    name: string
    season: number
  }
  totalTeams: number
  totalMatches: number
}

export interface UseStandingsOptions {
  staleTime?: number
  refetchInterval?: number | false
}

/**
 * Hook para obtener la tabla de posiciones de una liga
 *
 * @param leagueId - ID de la liga (de nuestra DB, no API-Football)
 * @param options - Opciones de configuración (staleTime, refetchInterval, etc.)
 *
 * @example
 * ```tsx
 * const { data: standings } = useStandings(1, { refetchInterval: 60000 })
 * ```
 */
export function useStandings(leagueId: number, options: UseStandingsOptions = {}) {
  const { staleTime = 1000 * 60 * 60, refetchInterval = false } = options

  return useQuery<StandingEntry[], Error>({
    queryKey: ['standings', leagueId],
    queryFn: async () => {
      const response = await fetch(`/api/leagues/${leagueId}/standings`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al obtener posiciones')
      }

      const json: StandingsResponse = await response.json()
      return json.data
    },
    enabled: leagueId > 0,
    staleTime, 
    gcTime: 1000 * 60 * 60 * 2, // 2 horas en cache
    refetchInterval,
  })
}

/**
 * Hook para obtener solo el top N de la tabla de posiciones
 *
 * @param leagueId - ID de la liga
 * @param limit - Número de equipos a mostrar (por defecto 5)
 *
 * @example
 * ```tsx
 * const { data: topFive } = useStandingsPreview(1, 5)
 * ```
 */
export function useStandingsPreview(leagueId: number, limit = 5) {
  const { data, ...rest } = useStandings(leagueId, {
    staleTime: 1000 * 60 * 60 // Keep 1 hour for preview, no need for live updates there
  })

  return {
    data: data?.slice(0, limit),
    ...rest,
  }
}
