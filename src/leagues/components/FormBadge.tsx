import React from 'react'

interface FormBadgeProps {
  form: string[] // Array de "W", "D", "L"
  limit?: number // Cuántos resultados mostrar (por defecto 5)
}

/**
 * FormBadge - Muestra los últimos resultados de un equipo
 *
 * W = Win (Victoria) - Verde
 * D = Draw (Empate) - Gris
 * L = Loss (Derrota) - Rojo
 *
 * @example
 * ```tsx
 * <FormBadge form={["W", "W", "D", "L", "W"]} />
 * ```
 */
export function FormBadge({ form, limit = 5 }: FormBadgeProps) {
  const recentForm = form.slice(-limit) // Últimos N resultados, sin invertir (si API ya viene ordenada o ajustando a peticion)

  if (recentForm.length === 0) {
    return (
      <div className="text-xs text-gray-400">
        Sin datos
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {recentForm.map((result, index) => {
        let bgColor = 'bg-gray-300'
        let textColor = 'text-gray-700'
        let label = result

        if (result === 'W') {
          bgColor = 'bg-green-500'
          textColor = 'text-white'
          label = 'G' // Ganado
        } else if (result === 'D') {
          bgColor = 'bg-gray-400'
          textColor = 'text-white'
          label = 'E' // Empate
        } else if (result === 'L') {
          bgColor = 'bg-red-500'
          textColor = 'text-white'
          label = 'P' // Perdido
        }

        return (
          <div
            key={index}
            className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${bgColor} ${textColor}`}
            title={
              result === 'W'
                ? 'Victoria'
                : result === 'D'
                  ? 'Empate'
                  : result === 'L'
                    ? 'Derrota'
                    : result
            }
          >
            {label}
          </div>
        )
      })}
    </div>
  )
}
