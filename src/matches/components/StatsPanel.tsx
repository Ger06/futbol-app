'use client'

import { useMatchStatistics, useHasStatistics } from '@/matches/hooks'
import { StatGrid } from './StatGrid'
import type { MatchStatus } from '@/matches/types'

/**
 * Panel completo de estadísticas de un partido
 * Maneja carga, errores, y casos sin datos
 *
 * @example
 * ```tsx
 * <StatsPanel matchId={123} matchStatus="FT" />
 * ```
 */

interface StatsPanelProps {
  /** ID del partido */
  matchId: number
  /** Status del partido (para optimizar caching) */
  matchStatus?: MatchStatus
  /** Clase CSS adicional para el contenedor */
  className?: string
}

export function StatsPanel({ matchId, matchStatus, className = '' }: StatsPanelProps) {
  const { data, isLoading, error } = useMatchStatistics(matchId, matchStatus)
  const hasStats = useHasStatistics(data ?? null)

  // Estado de carga
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="space-y-6 animate-pulse">
          {/* Skeleton para encabezado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
            </div>
          </div>

          {/* Skeleton para estadísticas */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-2 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-red-200 p-8 ${className}`}>
        <div className="text-center space-y-3">
          <div className="text-4xl">⚠️</div>
          <h3 className="font-semibold text-red-900">Error al cargar estadísticas</h3>
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
        </div>
      </div>
    )
  }

  // Sin estadísticas disponibles
  if (!hasStats) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="text-center space-y-3">
          <div className="text-4xl">📊</div>
          <h3 className="font-semibold text-gray-700">Estadísticas no disponibles</h3>
          <p className="text-sm text-gray-500">
            No hay estadísticas disponibles para este partido
          </p>
        </div>
      </div>
    )
  }

  // Mostrar estadísticas
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 py-6 ${className}`}>
      <div className="px-6 mb-4">
        <h2 className="text-lg font-bold text-gray-800">Estadísticas del partido</h2>
      </div>
      <StatGrid statistics={data!} />
    </div>
  )
}

/**
 * Versión compacta del panel de estadísticas (sin título)
 * Útil para mostrar en modales o tarjetas pequeñas
 */
export function StatsPanelCompact({ matchId, matchStatus, className = '' }: StatsPanelProps) {
  const { data, isLoading, error } = useMatchStatistics(matchId, matchStatus)
  const hasStats = useHasStatistics(data ?? null)

  if (isLoading) {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-2 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (error || !hasStats) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-gray-500">Estadísticas no disponibles</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <StatGrid statistics={data!} />
    </div>
  )
}
