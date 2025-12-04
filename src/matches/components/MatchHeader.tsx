import type { MatchWithDetails } from '@/matches/types'

/**
 * Componente de cabecera para la página de detalles del partido
 * Muestra equipos, resultado, estado, liga y fecha
 *
 * @example
 * ```tsx
 * <MatchHeader match={matchData} />
 * ```
 */

interface MatchHeaderProps {
  match: MatchWithDetails
}

// Mapeo de status a texto en español
const STATUS_LABELS: Record<string, string> = {
  'NS': 'No iniciado',
  'LIVE': 'En vivo',
  'HT': 'Medio tiempo',
  '1H': 'Primer tiempo',
  '2H': 'Segundo tiempo',
  'FT': 'Finalizado',
  'AET': 'Finalizado (T.E.)',
  'PEN': 'Finalizado (Penales)',
  'PST': 'Pospuesto',
  'CANC': 'Cancelado',
  'ABD': 'Abandonado',
}

// Colores de badge según status
const STATUS_COLORS: Record<string, string> = {
  'NS': 'bg-gray-100 text-gray-700',
  'LIVE': 'bg-red-500 text-white animate-pulse',
  'HT': 'bg-orange-500 text-white',
  '1H': 'bg-green-500 text-white',
  '2H': 'bg-green-500 text-white',
  'FT': 'bg-blue-100 text-blue-700',
  'AET': 'bg-blue-100 text-blue-700',
  'PEN': 'bg-blue-100 text-blue-700',
  'PST': 'bg-yellow-100 text-yellow-700',
  'CANC': 'bg-red-100 text-red-700',
  'ABD': 'bg-red-100 text-red-700',
}

export function MatchHeader({ match }: MatchHeaderProps) {
  const statusLabel = STATUS_LABELS[match.status] || match.status
  const statusColor = STATUS_COLORS[match.status] || 'bg-gray-100 text-gray-700'

  // Formatear fecha
  const matchDate = new Date(match.matchDate)
  const dateStr = matchDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = matchDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Liga y fecha */}
      <div className="border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
          <div className="flex items-center gap-2">
            {match.league.logo && (
              <img
                src={match.league.logo}
                alt={match.league.name}
                className="w-5 h-5 object-contain"
              />
            )}
            <span className="font-medium text-gray-700">{match.league.name}</span>
            {match.round && (
              <span className="text-gray-500 hidden sm:inline">• {match.round}</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            {match.round && (
              <span className="text-gray-500 text-xs sm:hidden">{match.round}</span>
            )}
            <span className="text-gray-500 text-xs sm:text-sm">
              {dateStr} • {timeStr}
            </span>
          </div>
        </div>
      </div>

      {/* Equipos y resultado */}
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6 md:gap-8">
          {/* Equipo local */}
          <div className="flex-1 flex flex-col items-center gap-2 sm:gap-3">
            {match.homeTeam.logo && (
              <img
                src={match.homeTeam.logo}
                alt={match.homeTeam.name}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
              />
            )}
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 text-center">
              {match.homeTeam.name}
            </h2>
          </div>

          {/* Resultado y status */}
          <div className="flex flex-col items-center gap-2 sm:gap-3 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]">
            {/* Status badge */}
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
              {statusLabel}
            </span>

            {/* Marcador */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
                {match.homeScore ?? '-'}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-gray-400">:</span>
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
                {match.awayScore ?? '-'}
              </span>
            </div>

            {/* Venue opcional */}
            {match.venue && (
              <div className="text-xs text-gray-500 text-center hidden sm:block">
                📍 {match.venue}
              </div>
            )}
          </div>

          {/* Equipo visitante */}
          <div className="flex-1 flex flex-col items-center gap-2 sm:gap-3">
            {match.awayTeam.logo && (
              <img
                src={match.awayTeam.logo}
                alt={match.awayTeam.name}
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
              />
            )}
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 text-center">
              {match.awayTeam.name}
            </h2>
          </div>
        </div>

        {/* Venue en mobile */}
        {match.venue && (
          <div className="mt-3 text-xs text-gray-500 text-center sm:hidden">
            📍 {match.venue}
          </div>
        )}

        {/* Árbitro opcional */}
        {match.referee && (
          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
            Árbitro: {match.referee}
          </div>
        )}
      </div>
    </div>
  )
}
