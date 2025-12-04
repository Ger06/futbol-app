/**
 * Componente para mostrar una estadística individual en formato tarjeta
 * (ideal para estadísticas simples como corners, faltas, tarjetas)
 *
 * @example
 * ```tsx
 * <StatCard
 *   label="Corners"
 *   homeValue={7}
 *   awayValue={3}
 * />
 * ```
 */

interface StatCardProps {
  /** Nombre de la estadística (ej: "Corners", "Faltas") */
  label: string
  /** Valor del equipo local */
  homeValue: string | number | null
  /** Valor del equipo visitante */
  awayValue: string | number | null
  /** Icono opcional (emoji o componente) */
  icon?: React.ReactNode
  /** Resaltar si el valor local es mayor */
  highlightHigher?: boolean
}

export function StatCard({
  label,
  homeValue,
  awayValue,
  icon,
  highlightHigher = false,
}: StatCardProps) {
  // Formatear valores
  const homeDisplay = homeValue ?? 'N/A'
  const awayDisplay = awayValue ?? 'N/A'

  // Determinar cuál es mayor para resaltar
  const homeNum = typeof homeValue === 'number' ? homeValue : parseFloat(String(homeValue || '0'))
  const awayNum = typeof awayValue === 'number' ? awayValue : parseFloat(String(awayValue || '0'))

  const homeIsHigher = !isNaN(homeNum) && !isNaN(awayNum) && homeNum > awayNum
  const awayIsHigher = !isNaN(homeNum) && !isNaN(awayNum) && awayNum > homeNum

  return (
    <div className="flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      {/* Valor equipo local */}
      <div
        className={`flex-1 text-center text-sm sm:text-base ${
          highlightHigher && homeIsHigher
            ? 'font-bold text-blue-600'
            : 'font-medium text-gray-700'
        }`}
      >
        {homeDisplay}
      </div>

      {/* Label central con icono opcional */}
      <div className="flex-1 text-center px-2">
        <div className="flex items-center justify-center gap-1 sm:gap-1.5">
          {icon && <span className="text-sm sm:text-base">{icon}</span>}
          <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">{label}</span>
        </div>
      </div>

      {/* Valor equipo visitante */}
      <div
        className={`flex-1 text-center text-sm sm:text-base ${
          highlightHigher && awayIsHigher
            ? 'font-bold text-red-600'
            : 'font-medium text-gray-700'
        }`}
      >
        {awayDisplay}
      </div>
    </div>
  )
}
