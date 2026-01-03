import React from 'react'
import type { Goal } from '@/matches/types'

interface GoalsListProps {
  goals: Goal[]
  homeTeamId: number
  awayTeamId: number
}

/**
 * GoalsList - Lista de goles de un partido
 *
 * Muestra los goles agrupados por equipo con:
 * - Nombre del jugador
 * - Minuto del gol (con tiempo adicional si aplica)
 * - Tipo de gol (Normal, Penalty, Own Goal)
 *
 * @example
 * ```tsx
 * <GoalsList
 *   goals={match.goals}
 *   homeTeamId={match.homeTeamId}
 *   awayTeamId={match.awayTeamId}
 * />
 * ```
 */
export function GoalsList({ goals, homeTeamId, awayTeamId }: GoalsListProps) {
  if (!goals || goals.length === 0) {
    return null
  }

  const homeGoals = goals.filter((goal) => goal.teamId === homeTeamId)
  const awayGoals = goals.filter((goal) => goal.teamId === awayTeamId)

  const formatMinute = (minute: number, extraTime?: number | null) => {
    if (extraTime) {
      return `${minute}+${extraTime}'`
    }
    return `${minute}'`
  }

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'Penalty':
        return '⚽(P)'
      case 'Own Goal':
        return '⚽(AG)'
      default:
        return '⚽'
    }
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-8 border-t border-[#8a6d3b]/30 pt-3">
      {/* Goles del equipo local (Izquierda) */}
      <div className="space-y-1">
        {homeGoals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-center gap-2 text-sm text-[#f4f1ea] justify-start"
          >
            <span className="text-base">{getGoalIcon(goal.type)}</span>
            <span className="font-medium font-oswald tracking-wide">{goal.playerName}</span>
            <span className="text-xs text-[#c5a059] font-mono">
              {formatMinute(goal.minute, goal.extraTime)}
            </span>
          </div>
        ))}
      </div>

      {/* Goles del equipo visitante (Derecha) */}
      <div className="space-y-1">
        {awayGoals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-center gap-2 text-sm text-[#f4f1ea] justify-end"
          >
            <span className="text-xs text-[#c5a059] font-mono">
              {formatMinute(goal.minute, goal.extraTime)}
            </span>
            <span className="font-medium font-oswald tracking-wide text-right">{goal.playerName}</span>
            <span className="text-base">{getGoalIcon(goal.type)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
