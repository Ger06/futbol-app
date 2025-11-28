'use client'

import React from 'react'
import { MatchCard } from './MatchCard'
import type { MatchWithTeams } from '@/matches/types'

interface MatchListProps {
  matches: MatchWithTeams[]
  onMatchClick?: (match: MatchWithTeams) => void
  groupByLeague?: boolean
  emptyMessage?: string
}

/**
 * MatchList - Lista de partidos
 *
 * Renderiza múltiples MatchCards con opciones de agrupamiento
 *
 * @param matches - Array de partidos a mostrar
 * @param onMatchClick - Función opcional al hacer click en un partido
 * @param groupByLeague - Si debe agrupar por liga (default: false)
 * @param emptyMessage - Mensaje a mostrar cuando no hay partidos
 *
 * @example
 * ```tsx
 * <MatchList
 *   matches={matches}
 *   groupByLeague
 *   onMatchClick={(match) => router.push(`/match/${match.id}`)}
 * />
 * ```
 */
export function MatchList({
  matches,
  onMatchClick,
  groupByLeague = false,
  emptyMessage = 'No hay partidos programados',
}: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  // Si no se agrupa, renderizar lista simple
  if (!groupByLeague) {
    return (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onClick={onMatchClick ? () => onMatchClick(match) : undefined}
          />
        ))}
      </div>
    )
  }

  // Agrupar por liga
  const groupedMatches = matches.reduce(
    (acc, match) => {
      const leagueName = match.league.name
      if (!acc[leagueName]) {
        acc[leagueName] = []
      }
      acc[leagueName].push(match)
      return acc
    },
    {} as Record<string, MatchWithTeams[]>
  )

  return (
    <div className="space-y-8">
      {Object.entries(groupedMatches).map(([leagueName, leagueMatches]) => (
        <div key={leagueName}>
          {/* Header de Liga */}
          <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-2">
            {leagueMatches[0].league.logo && (
              <img
                src={leagueMatches[0].league.logo}
                alt={leagueName}
                className="h-6 w-6 object-contain"
              />
            )}
            <h2 className="text-xl font-bold text-gray-900">{leagueName}</h2>
            <span className="text-sm text-gray-500">
              ({leagueMatches.length}{' '}
              {leagueMatches.length === 1 ? 'partido' : 'partidos'})
            </span>
          </div>

          {/* Grid de Partidos */}
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {leagueMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onClick={onMatchClick ? () => onMatchClick(match) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
