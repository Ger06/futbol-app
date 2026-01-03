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

  // Auto-seleccionar jornada actual o más cercana
  useEffect(() => {
    if (initialRound) {
      setSelectedRound(initialRound)
    } else if (allFixtures && allFixtures.length > 0 && availableRounds && availableRounds.length > 0 && !selectedRound) {
      // Estrategia: Buscar la jornada cuyo partido sea más cercano a la fecha actual.
      // Esto evita quedarse "pegado" en jornadas viejas (ej: Jornada 16) solo porque tienen un partido postergado en el futuro,
      // priorizando la jornada que se juega REALMENTE esta semana (ej: Jornada 18).
      
      const now = new Date().getTime()
      
      let closestMatchRound = availableRounds[availableRounds.length - 1]
      let minDiff = Infinity
      
      allFixtures.forEach(fixtureRound => {
        fixtureRound.matches.forEach(match => {
           const matchTime = new Date(match.matchDate).getTime()
           const diff = Math.abs(matchTime - now)
           
           if (diff < minDiff) {
               minDiff = diff
               closestMatchRound = fixtureRound.round
           }
        })
      })

      setSelectedRound(closestMatchRound)
    }
  }, [initialRound, availableRounds, selectedRound, allFixtures])

  if (isLoading) {
    return (
      <div className="rounded-lg border-2 border-[#8a6d3b] bg-[#1a120b] p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold font-marker text-[#c5a059] uppercase">Fixture</h2>
        </div>
        <LoadingSection />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border-2 border-[#8a6d3b] bg-[#1a120b] p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold font-marker text-[#c5a059] uppercase">Fixture</h2>
        </div>
        <div className="rounded-lg border-2 border-dashed border-red-900/50 bg-red-900/20 p-6 text-center">
          <p className="text-sm font-semibold text-red-400">
            Error al cargar fixture
          </p>
        </div>
      </div>
    )
  }

  if (!allFixtures || allFixtures.length === 0 || !availableRounds) {
    return (
      <div className="rounded-lg border-2 border-[#8a6d3b] bg-[#1a120b] p-6 shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold font-marker text-[#c5a059] uppercase">Fixture</h2>
        </div>
        <div className="rounded-lg border-2 border-dashed border-[#8a6d3b]/50 bg-[#2c241b] p-6 text-center">
          <p className="text-sm text-[#e6c885]">No hay fixtures disponibles</p>
        </div>
      </div>
    )
  }

  // Obtener partidos de la jornada seleccionada
  const currentFixture = allFixtures.find((f) => f.round === selectedRound)
  const matches = currentFixture?.matches || []

  return (
    <div className="rounded-lg border-2 border-[#8a6d3b] bg-[#1a120b] shadow-lg relative overflow-hidden">
       {/* Texture Overlay */}
       <div className="absolute inset-0 bg-[url('/textures/grunge.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>

      {/* Header */}
      <div className="border-b border-[#8a6d3b] px-6 py-4 relative z-10 bg-[#2c241b]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-marker text-[#c5a059] uppercase tracking-wide">Fixture</h2>
          {showAllLink && (
            <Link
              href={`/${leagueSlug}/fixture`}
              className="text-sm font-bold font-oswald text-[#e6c885] transition-colors hover:text-[#c5a059] uppercase tracking-wider"
            >
              Ver fixture completo →
            </Link>
          )}
        </div>
      </div>

      {/* Selector de jornada */}
      <div className="border-b border-[#8a6d3b] bg-[#1a120b] px-6 py-4 relative z-10">
        <RoundSelector
          rounds={availableRounds}
          currentRound={selectedRound}
          onRoundChange={setSelectedRound}
        />
      </div>

      {/* Lista de partidos */}
      <div className="p-6 relative z-10">
        {matches.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-[#8a6d3b]/50 p-6 text-center">
            <p className="text-sm text-[#e6c885]">
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
      <div className="border-t border-[#8a6d3b] bg-[#2c241b] px-6 py-3 relative z-10">
        <div className="flex items-center justify-between text-xs font-oswald text-[#e6c885]/80">
          <span>
            {matches.length} {matches.length === 1 ? 'partido' : 'partidos'}
          </span>
          {showAllLink && (
            <Link
              href={`/${leagueSlug}/fixture`}
              className="font-bold text-[#e6c885] transition-colors hover:text-[#c5a059] uppercase"
            >
              Ver todas las jornadas
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
