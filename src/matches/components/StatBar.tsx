/**
 * Componente para mostrar una estadística comparativa entre dos equipos
 * con barras visuales (ideal para posesión, tiros, etc.)
 *
 * @example
 * ```tsx
 * <StatBar
 *   label="Posesión del balón"
 *   homeValue="65%"
 *   awayValue="35%"
 *   homePercentage={65}
 *   awayPercentage={35}
 * />
 * ```
 */

interface StatBarProps {
  /** Nombre de la estadística (ej: "Posesión del balón") */
  label: string
  /** Valor del equipo local (puede incluir %, ej: "65%") */
  homeValue: string | number
  /** Valor del equipo visitante */
  awayValue: string | number
  /** Porcentaje del equipo local (0-100) para la barra visual */
  homePercentage?: number
  /** Porcentaje del equipo visitante (0-100) para la barra visual */
  awayPercentage?: number
  /** Color del equipo local (default: blue) */
  homeColor?: string
  /** Color del equipo visitante (default: red) */
  awayColor?: string
}

export function StatBar({
  label,
  homeValue,
  awayValue,
  homePercentage,
  awayPercentage,
  homeColor = 'bg-blue-500',
  awayColor = 'bg-red-500',
}: StatBarProps) {
  // Si no se proporcionan porcentajes, calcularlos desde valores numéricos
  let homePercent = homePercentage
  let awayPercent = awayPercentage

  if (homePercent === undefined || awayPercent === undefined) {
    const homeNum = typeof homeValue === 'string'
      ? parseFloat(homeValue.replace('%', '').trim())
      : homeValue
    const awayNum = typeof awayValue === 'string'
      ? parseFloat(awayValue.replace('%', '').trim())
      : awayValue

    if (!isNaN(homeNum) && !isNaN(awayNum)) {
      const total = homeNum + awayNum
      homePercent = total > 0 ? (homeNum / total) * 100 : 50
      awayPercent = total > 0 ? (awayNum / total) * 100 : 50
    } else {
      homePercent = 50
      awayPercent = 50
    }
  }

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {/* Label y valores */}
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="font-medium text-gray-700 min-w-[40px] text-left">{homeValue}</span>
        <span className="text-[10px] sm:text-xs text-gray-500 font-medium text-center px-2 truncate">
          {label}
        </span>
        <span className="font-medium text-gray-700 min-w-[40px] text-right">{awayValue}</span>
      </div>

      {/* Barras visuales */}
      <div className="relative h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* Barra del equipo local (desde la izquierda) */}
        <div
          className={`absolute left-0 top-0 h-full ${homeColor} transition-all duration-300`}
          style={{ width: `${homePercent}%` }}
        />

        {/* Barra del equipo visitante (desde la derecha) */}
        <div
          className={`absolute right-0 top-0 h-full ${awayColor} transition-all duration-300`}
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  )
}
