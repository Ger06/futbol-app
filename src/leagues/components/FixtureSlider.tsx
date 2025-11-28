'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useFixtures, useAvailableRounds } from '@/leagues/hooks'
import { LoadingSection } from '@/shared/components/ui/LoadingSpinner'
import { RoundSelector } from './RoundSelector'
import { FixtureCard } from './FixtureCard'
import type { MatchWithTeams } from '@/matches/types'

interface FixtureSliderProps {
  leagueId: number
  leagueSlug: string
  initialRound?: string // Jornada inicial (opcional)
  showAllLink?: boolean // Mostrar link "Ver fixture completo"
  onMatchClick?: (match: MatchWithTeams) => void
}

/**
 * FixtureSlider - Slider de fixtures por jornada
 *
 * Combina RoundSelector + lista de partidos de la jornada seleccionada
 *
 * Características:
 * - Navegación entre jornadas con flechas
 * - Grid responsive de partidos
 * - Link a fixture completo
 * - Auto-selecciona jornada más reciente si no se especifica
 *
 * @example
 * ```tsx
 * <FixtureSlider
 *   leagueId={1}
 *   leagueSlug="premier-league"
 *   showAllLink
 * />
 * ```
 */
export function FixtureSlider({
  leagueId,
  leagueSlug,
  initialRound,
  showAllLink = true,
  onMatchClick,
}: FixtureSliderProps) {
  const { data: allFixtures, isLoading, error } = useFixtures(leagueId)
  const { data: availableRounds } = useAvailableRounds(leagueId)

  const [selectedRound, setSelectedRound] = useState<string>('')

  // Auto-seleccionar jornada inicial
  useEffect(() => {
    if (initialRound) {
      setSelectedRound(initialRound)
    } else if (availableRounds && availableRounds.length > 0 && !selectedRound) {
      // Seleccionar la jornada más reciente (última del array)
      setSelectedRound(availableRounds[availableRounds.length - 1])
    }
  }, [initialRound, availableRounds, selectedRound])

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="text-lg font-bold text-gray-900">Fixture</h2>
        </div>
        <LoadingSection />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="text-lg font-bold text-gray-900">Fixture</h2>
        </div>
        <div className="rounded-lg border-2 border-dashed border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-800">
            Error al cargar fixture
          </p>
        </div>
      </div>
    )
  }

  if (!allFixtures || allFixtures.length === 0 || !availableRounds) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="text-lg font-bold text-gray-900">Fixture</h2>
        </div>
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-600">No hay fixtures disponibles</p>
        </div>
      </div>
    )
  }

  // Obtener partidos de la jornada seleccionada
  const currentFixture = allFixtures.find((f) => f.round === selectedRound)
  const matches = currentFixture?.matches || []

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Fixture</h2>
          {showAllLink && (
            <Link
              href={`/${leagueSlug}/fixture`}
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Ver fixture completo →
            </Link>
          )}
        </div>
      </div>

      {/* Selector de jornada */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <RoundSelector
          rounds={availableRounds}
          currentRound={selectedRound}
          onRoundChange={setSelectedRound}
        />
      </div>

      {/* Lista de partidos */}
      <div className="p-6">
        {matches.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-600">
              No hay partidos en esta jornada
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <FixtureCard
                key={match.id}
                match={match}
                onClick={onMatchClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer con estadísticas */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            {matches.length} {matches.length === 1 ? 'partido' : 'partidos'}
          </span>
          {showAllLink && (
            <Link
              href={`/${leagueSlug}/fixture`}
              className="font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Ver todas las jornadas
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
