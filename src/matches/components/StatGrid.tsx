import { StatBar } from './StatBar'
import { StatCard } from './StatCard'
import type { MatchStatistics } from '@/matches/types'

/**
 * Componente que organiza y muestra todas las estadísticas de un partido
 * Maneja automáticamente qué estadísticas mostrar como barras y cuáles como tarjetas
 *
 * @example
 * ```tsx
 * <StatGrid statistics={matchStatistics} />
 * ```
 */

interface StatGridProps {
  /** Array de estadísticas de ambos equipos */
  statistics: MatchStatistics[]
}

// Estadísticas que se muestran como barras comparativas
const BAR_STATS = [
  'Ball Possession',
  'Total Shots',
  'Shots on Goal',
  'Total passes',
  'Passes accurate',
  'Passes %',
]

// Mapeo de nombres de estadísticas a iconos
const STAT_ICONS: Record<string, string> = {
  'Corner Kicks': '🚩',
  'Fouls': '🟨',
  'Yellow Cards': '🟨',
  'Red Cards': '🟥',
  'Offsides': '🚫',
  'Goalkeeper Saves': '🧤',
  'Shots off Goal': '🎯',
  'Blocked Shots': '🛡️',
  'Shots insidebox': '📦',
  'Shots outsidebox': '🎯',
}

// Nombres más amigables para el usuario
const STAT_LABELS: Record<string, string> = {
  'Ball Possession': 'Posesión',
  'Total Shots': 'Tiros totales',
  'Shots on Goal': 'Tiros a puerta',
  'Shots off Goal': 'Tiros fuera',
  'Blocked Shots': 'Tiros bloqueados',
  'Shots insidebox': 'Tiros dentro área',
  'Shots outsidebox': 'Tiros fuera área',
  'Corner Kicks': 'Corners',
  'Fouls': 'Faltas',
  'Yellow Cards': 'Tarjetas amarillas',
  'Red Cards': 'Tarjetas rojas',
  'Offsides': 'Fuera de juego',
  'Goalkeeper Saves': 'Atajadas',
  'Total passes': 'Pases totales',
  'Passes accurate': 'Pases completados',
  'Passes %': 'Precisión de pases',
}

export function StatGrid({ statistics }: StatGridProps) {
  if (!statistics || statistics.length !== 2) {
    return null
  }

  const [homeTeam, awayTeam] = statistics

  // Función helper para obtener valor de estadística
  const getStat = (team: MatchStatistics, statType: string) => {
    const stat = team.statistics.find((s) => s.type === statType)
    return stat?.value ?? null
  }

  // Obtener todas las estadísticas únicas disponibles
  const allStatTypes = Array.from(
    new Set([
      ...homeTeam.statistics.map((s) => s.type),
      ...awayTeam.statistics.map((s) => s.type),
    ])
  )

  // Separar en estadísticas de barra y de tarjeta
  const barStats = allStatTypes.filter((type) => BAR_STATS.includes(type))
  const cardStats = allStatTypes.filter((type) => !BAR_STATS.includes(type))

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Encabezado con nombres de equipos */}
      <div className="flex items-center justify-between px-2 sm:px-4">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
          {homeTeam.team.logo && (
            <img
              src={homeTeam.team.logo}
              alt={homeTeam.team.name}
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
            />
          )}
          <span className="font-semibold text-xs sm:text-sm text-gray-800 truncate">
            {homeTeam.team.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-end min-w-0">
          <span className="font-semibold text-xs sm:text-sm text-gray-800 truncate">
            {awayTeam.team.name}
          </span>
          {awayTeam.team.logo && (
            <img
              src={awayTeam.team.logo}
              alt={awayTeam.team.name}
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
            />
          )}
        </div>
      </div>

      {/* Estadísticas de barra (posesión, tiros, pases) */}
      {barStats.length > 0 && (
        <div className="space-y-3 sm:space-y-4 px-2 sm:px-4">
          {barStats.map((statType) => {
            const homeValue = getStat(homeTeam, statType)
            const awayValue = getStat(awayTeam, statType)
            const label = STAT_LABELS[statType] || statType

            return (
              <StatBar
                key={statType}
                label={label}
                homeValue={homeValue ?? 'N/A'}
                awayValue={awayValue ?? 'N/A'}
              />
            )
          })}
        </div>
      )}

      {/* Estadísticas de tarjeta (corners, faltas, tarjetas) */}
      {cardStats.length > 0 && (
        <div className="space-y-2 px-1 sm:px-2">
          {cardStats.map((statType) => {
            const homeValue = getStat(homeTeam, statType)
            const awayValue = getStat(awayTeam, statType)
            const label = STAT_LABELS[statType] || statType
            const icon = STAT_ICONS[statType]

            return (
              <StatCard
                key={statType}
                label={label}
                homeValue={homeValue}
                awayValue={awayValue}
                icon={icon}
                highlightHigher={true}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
