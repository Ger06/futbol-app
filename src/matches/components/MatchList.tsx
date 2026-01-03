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
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-4 border-dashed border-[#8a6d3b]/50 bg-[#1a120b]/50 p-8 text-center">
        <span className="mb-4 text-4xl opacity-50">⚽</span>
        <p className="text-xl font-marker text-[#8a6d3b]">{emptyMessage}</p>
        <p className="mt-2 font-oswald text-sm text-[#e6c885]/60 uppercase tracking-widest">Available Next Update</p>
      </div>
    )
  }

  // Si no se agrupa, renderizar lista simple
  if (!groupByLeague) {
    return (
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
    <div className="space-y-12">
      {Object.entries(groupedMatches).map(([leagueName, leagueMatches]) => (
        <div key={leagueName} className="relative">
          {/* Header de Liga */}
          <div className="mb-6 flex items-end gap-3 border-b-4 border-[#8a6d3b] pb-2 pl-2">
           {/*{leagueMatches[0].league.logo && (
              <div className="relative -mb-4 mr-2 rounded-full border-2 border-[#c5a059] bg-[#f4f1ea] p-1 shadow-lg">
                 <img
                  src={leagueMatches[0].league.logo}
                  alt={leagueName}
                  className="h-10 w-10 object-contain"
                /> 
              </div>
            )}*/}
            <div>
              <h2 className="text-3xl font-bold font-marker text-[#c5a059] uppercase tracking-wide drop-shadow-md skew-x-[-10deg]">
                {leagueName}
              </h2>
              <span className="text-xs font-oswald font-bold text-[#e6c885] uppercase tracking-widest bg-[#8a6d3b]/20 px-2 py-0.5 rounded-sm">
                {leagueMatches.length}{' '}
                {leagueMatches.length === 1 ? 'MATCH' : 'MATCHES'}
              </span>
            </div>
          </div>

          {/* Grid de Partidos */}
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
