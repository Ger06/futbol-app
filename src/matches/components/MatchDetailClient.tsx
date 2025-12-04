'use client'

import { useMatchDetails } from '@/matches/hooks'
import { MatchHeader, GoalsList, StatsPanel } from '@/matches/components'

interface MatchDetailClientProps {
  matchId: number
}

export default function MatchDetailClient({ matchId }: MatchDetailClientProps) {
  const { data: match, isLoading, error } = useMatchDetails(matchId)

  // Estado de carga
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
        {/* Skeleton para header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-pulse">
          <div className="flex items-center justify-between gap-8">
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="w-24 h-24 bg-gray-200 rounded-full" />
              <div className="h-8 w-32 bg-gray-200 rounded" />
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-20 bg-gray-200 rounded-full" />
              <div className="h-16 w-32 bg-gray-200 rounded" />
            </div>
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="w-24 h-24 bg-gray-200 rounded-full" />
              <div className="h-8 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        {/* Skeleton para contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-900 mb-2">
            Error al cargar el partido
          </h1>
          <p className="text-red-600 mb-6">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  // Sin datos
  if (!match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Partido no encontrado
          </h1>
          <p className="text-gray-600 mb-6">
            El partido que buscas no existe o fue eliminado.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  // Mostrar partido
  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
      {/* Cabecera del partido */}
      <MatchHeader match={match} />

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Columna principal (2/3) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Goles */}
          {match.goals.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
                ⚽ Goles ({match.goals.length})
              </h2>
              <GoalsList
                goals={match.goals}
                homeTeamId={match.homeTeamId}
                awayTeamId={match.awayTeamId}
              />
            </div>
          )}

          {/* Tarjetas */}
          {match.cards.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">
                🟨 Tarjetas ({match.cards.length})
              </h2>
              <div className="space-y-2">
                {match.cards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={card.type === 'Yellow' ? 'text-yellow-500' : 'text-red-500'}>
                        {card.type === 'Yellow' ? '🟨' : '🟥'}
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0">
                        <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {card.playerName}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {card.teamId === match.homeTeamId ? match.homeTeam.name : match.awayTeam.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 ml-2">
                      {card.minute}'
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna lateral (1/3) */}
        <div className="lg:col-span-1">
          {/* Panel de estadísticas */}
          <StatsPanel matchId={match.id} matchStatus={match.status} />
        </div>
      </div>
    </div>
  )
}
