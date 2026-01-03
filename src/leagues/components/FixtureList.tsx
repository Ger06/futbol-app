'use client'

import React from 'react'
import { useFixtures } from '@/leagues/hooks'
import { LoadingSection } from '@/shared/components/ui/LoadingSpinner'
import { FixtureCard } from './FixtureCard'
import type { MatchWithTeams } from '@/matches/types'

interface FixtureListProps {
  leagueId: number
  onMatchClick?: (match: MatchWithTeams) => void
}

/**
 * FixtureList - Lista completa de fixtures agrupados por jornada
 *
 * Muestra todas las jornadas de una liga con sus partidos
 * en formato de acordeón/secciones expandibles
 *
 * @example
 * ```tsx
 * <FixtureList leagueId={1} />
 * ```
 */
export function FixtureList({ leagueId, onMatchClick }: FixtureListProps) {
  const { data: allFixtures, isLoading, error } = useFixtures(leagueId)

  if (isLoading) {
    return <LoadingSection />
  }

  if (error) {
    return (
      <div className="rounded-lg border-2 border-dashed border-red-200 bg-red-50 p-8 text-center">
        <p className="text-lg font-semibold text-red-800">
          Error al cargar fixture
        </p>
        <p className="mt-1 text-sm text-red-600">
          {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      </div>
    )
  }

  if (!allFixtures || allFixtures.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <p className="text-lg font-semibold text-gray-700">
          No hay fixtures disponibles
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {allFixtures.map((fixture) => (
        <div
          key={fixture.round}
          className="rounded-lg border-2 border-[#8a6d3b] bg-[#1a120b] shadow-lg relative overflow-hidden"
        >
          {/* Header de la jornada */}
          <div className="border-b border-[#8a6d3b] bg-[#1a120b] px-6 py-4 relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-marker text-[#c5a059] uppercase tracking-wide">
                {fixture.round}
              </h3>
            </div>
          </div>

          {/* Grid de partidos */}
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fixture.matches.map((match) => (
                <FixtureCard
                  key={match.id}
                  match={match}
                  onClick={onMatchClick}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
