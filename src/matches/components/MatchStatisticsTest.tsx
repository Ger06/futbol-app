'use client'

import { useMatchStatistics, useHasStatistics } from '@/matches/hooks'

/**
 * Componente de prueba para el hook useMatchStatistics
 *
 * Este componente es temporal para testear que el hook funciona correctamente.
 * Se puede eliminar después de la integración completa.
 */
export function MatchStatisticsTest({ matchId }: { matchId: number }) {
  const { data, isLoading, error } = useMatchStatistics(matchId, 'FT')
  const hasStats = useHasStatistics(data)

  if (isLoading) {
    return (
      <div className="p-4 border rounded">
        <p className="text-sm text-gray-500">Cargando estadísticas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50">
        <p className="text-sm text-red-600">
          Error: {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      </div>
    )
  }

  if (!hasStats) {
    return (
      <div className="p-4 border border-yellow-300 rounded bg-yellow-50">
        <p className="text-sm text-yellow-700">
          No hay estadísticas disponibles para este partido
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded space-y-4">
      <h3 className="font-bold text-lg">Estadísticas del Partido (Test)</h3>

      {data?.map((teamStats, index) => (
        <div key={teamStats.team.id} className="space-y-2">
          <div className="flex items-center gap-2">
            {teamStats.team.logo && (
              <img
                src={teamStats.team.logo}
                alt={teamStats.team.name}
                className="w-6 h-6"
              />
            )}
            <h4 className="font-semibold">{teamStats.team.name}</h4>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            {teamStats.statistics.slice(0, 5).map((stat) => (
              <div key={stat.type} className="flex justify-between">
                <span className="text-gray-600">{stat.type}:</span>
                <span className="font-medium">{stat.value ?? 'N/A'}</span>
              </div>
            ))}
          </div>

          {index === 0 && data.length > 1 && (
            <hr className="my-2" />
          )}
        </div>
      ))}

      <p className="text-xs text-gray-500 mt-4">
        ✅ Hook funcionando correctamente
      </p>
    </div>
  )
}
