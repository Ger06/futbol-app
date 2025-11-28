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
    <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
      {/* Goles del equipo local */}
      {homeGoals.length > 0 && (
        <div className="space-y-1">
          {homeGoals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <span className="text-base">{getGoalIcon(goal.type)}</span>
              <span className="font-medium">{goal.playerName}</span>
              <span className="text-xs text-gray-500">
                {formatMinute(goal.minute, goal.extraTime)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Goles del equipo visitante */}
      {awayGoals.length > 0 && (
        <div className="space-y-1">
          {awayGoals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <span className="text-base">{getGoalIcon(goal.type)}</span>
              <span className="font-medium">{goal.playerName}</span>
              <span className="text-xs text-gray-500">
                {formatMinute(goal.minute, goal.extraTime)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
