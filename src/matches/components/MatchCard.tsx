'use client'

import React from 'react'
import { Card } from '@/shared/components/ui/Card'
import { StatusBadge } from '@/shared/components/ui/Badge'
import { GoalsList } from './GoalsList'
import type { MatchWithTeams, MatchWithDetails } from '@/matches/types'

interface MatchCardProps {
  match: MatchWithTeams | MatchWithDetails
  onClick?: () => void
}

/**
 * MatchCard - Tarjeta individual de partido
 *
 * Muestra información del partido:
 * - Equipos con escudos
 * - Resultado actual
 * - Estado del partido (badge)
 * - Liga
 * - Hora del partido
 *
 * @param match - Datos del partido con equipos y liga
 * @param onClick - Función opcional al hacer click
 *
 * @example
 * ```tsx
 * <MatchCard
 *   match={match}
 *   onClick={() => router.push(`/match/${match.id}`)}
 * />
 * ```
 */
export function MatchCard({ match, onClick }: MatchCardProps) {
  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const isLive = match.status === 'LIVE'
  const hasStarted = match.status !== 'NS'
  const hasGoals = 'goals' in match && match.goals && match.goals.length > 0

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={isLive ? 'border-red-300 bg-red-50/30' : ''}
    >
      {/* Header con Liga y Status */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {match.league.logo && (
            <img
              src={match.league.logo}
              alt={match.league.name}
              className="h-4 w-4 object-contain"
            />
          )}
          <span className="text-xs font-medium text-gray-600">
            {match.league.name}
          </span>
        </div>
        <StatusBadge status={match.status} />
      </div>

      {/* Equipos y Resultado */}
      <div className="space-y-2">
        {/* Equipo Local */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {match.homeTeam.logo && (
              <img
                src={match.homeTeam.logo}
                alt={match.homeTeam.name}
                className="h-8 w-8 object-contain"
              />
            )}
            <span className="font-medium text-gray-900">
              {match.homeTeam.name}
            </span>
          </div>
          {hasStarted && (
            <span
              className={`text-2xl font-bold ${isLive ? 'text-red-600' : 'text-gray-900'}`}
            >
              {match.homeScore ?? 0}
            </span>
          )}
        </div>

        {/* Equipo Visitante */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {match.awayTeam.logo && (
              <img
                src={match.awayTeam.logo}
                alt={match.awayTeam.name}
                className="h-8 w-8 object-contain"
              />
            )}
            <span className="font-medium text-gray-900">
              {match.awayTeam.name}
            </span>
          </div>
          {hasStarted && (
            <span
              className={`text-2xl font-bold ${isLive ? 'text-red-600' : 'text-gray-900'}`}
            >
              {match.awayScore ?? 0}
            </span>
          )}
        </div>
      </div>

      {/* Goles */}
      {hasGoals && hasStarted && (
        <GoalsList
          goals={(match as MatchWithDetails).goals}
          homeTeamId={match.homeTeamId}
          awayTeamId={match.awayTeamId}
        />
      )}

      {/* Footer con Hora */}
      {!hasStarted && (
        <div className="mt-3 border-t border-gray-100 pt-2 text-center">
          <span className="text-sm text-gray-600">
            {formatTime(match.matchDate)}
          </span>
        </div>
      )}
    </Card>
  )
}
