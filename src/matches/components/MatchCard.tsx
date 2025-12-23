'use client'

import React from 'react'
import Link from 'next/link'
import { Card } from '@/shared/components/ui/Card'
import { StatusBadge } from '@/shared/components/ui/Badge'
import { GoalsList } from './GoalsList'
import type { MatchWithTeams, MatchWithDetails } from '@/matches/types'

interface MatchCardProps {
  match: MatchWithTeams | MatchWithDetails
  onClick?: () => void
  /** Si es false, el card no será clickeable (default: true) */
  clickable?: boolean
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
 * Por defecto, el card es clickeable y navega a /match/[id]
 *
 * @param match - Datos del partido con equipos y liga
 * @param onClick - Función opcional al hacer click (sobrescribe navegación por defecto)
 * @param clickable - Si es false, el card no será clickeable (default: true)
 *
 * @example
 * ```tsx
 * <MatchCard match={match} />
 * ```
 */
export function MatchCard({ match, onClick, clickable = true }: MatchCardProps) {
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

  // Si es clickeable y no hay onClick custom, usar Link de Next.js
  const isClickable = clickable && !onClick

  const cardContent = (
    <Card
      hoverable={clickable}
      onClick={onClick}
      className={`${isLive ? 'border-red-300 bg-red-50/30' : ''} ${
        isClickable ? 'cursor-pointer transition-transform hover:scale-[1.02]' : ''
      }`}
    >
      <div className="px-2">
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
          <span className="text-xs font-semibold uppercase tracking-wider text-[#c5a059]">
            {match.league.name}
          </span>
        </div>
        <StatusBadge status={match.status} theme="retro" />
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
            <span className="font-bold text-gray-100">
              {match.homeTeam.name}
            </span>
          </div>
          {hasStarted && (
            <span className={`text-2xl font-bold ${isLive ? 'text-red-500' : 'text-gray-100'}`}>
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
            <span className="font-bold text-gray-100">
              {match.awayTeam.name}
            </span>
          </div>
          {hasStarted && (
            <span className={`text-2xl font-bold ${isLive ? 'text-red-500' : 'text-gray-100'}`}>
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
          <span className="text-sm font-medium text-[#8a6d3b]">
            {formatTime(match.matchDate)}
          </span>
        </div>
      )}
      </div>
    </Card>
  )

  // Si es clickeable sin onClick custom, envolver en Link
  if (isClickable) {
    return (
      <Link href={`/match/${match.id}`} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
