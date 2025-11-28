'use client'

import React from 'react'
import { useMatchesToday, useMatchesByDate } from '@/matches/hooks'
import { MatchList } from './MatchList'
import { LoadingSection } from '@/shared/components/ui/LoadingSpinner'

interface MatchesContainerProps {
  groupByLeague?: boolean
  onMatchClick?: (match: any) => void
  date?: string // Fecha opcional en formato YYYY-MM-DD
}

/**
 * MatchesContainer - Contenedor inteligente para partidos del día
 *
 * Maneja la lógica de carga de datos, estados de loading y error
 * Renderiza MatchList cuando los datos están disponibles
 *
 * @param groupByLeague - Si debe agrupar por liga
 * @param onMatchClick - Función al hacer click en un partido
 * @param date - Fecha opcional (si no se provee, usa hoy)
 *
 * @example
 * ```tsx
 * <MatchesContainer
 *   groupByLeague
 *   date="2022-10-09"
 *   onMatchClick={(match) => console.log(match)}
 * />
 * ```
 */
export function MatchesContainer({
  groupByLeague = true,
  onMatchClick,
  date,
}: MatchesContainerProps) {
  // Usar el hook apropiado según si hay fecha o no
  const todayQuery = useMatchesToday()
  const dateQuery = useMatchesByDate(date || '')

  const { data: matches, isLoading, error } = date ? dateQuery : todayQuery

  if (isLoading) {
    return <LoadingSection />
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-red-200 bg-red-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-800">
            Error al cargar los partidos
          </p>
          <p className="mt-1 text-sm text-red-600">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
        </div>
      </div>
    )
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">
            No hay partidos programados para hoy
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Revisa más tarde o consulta el calendario
          </p>
        </div>
      </div>
    )
  }

  return (
    <MatchList
      matches={matches}
      groupByLeague={groupByLeague}
      onMatchClick={onMatchClick}
    />
  )
}
