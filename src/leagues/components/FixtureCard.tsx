import React from 'react'
import Image from 'next/image'
import type { MatchWithTeams } from '@/matches/types'

interface FixtureCardProps {
  match: MatchWithTeams
  onClick?: (match: MatchWithTeams) => void
}

/**
 * FixtureCard - Tarjeta de un partido individual
 *
 * Muestra:
 * - Equipos con logos
 * - Resultado o hora
 * - Estado del partido (NS, LIVE, FT)
 * - Fecha
 *
 * @example
 * ```tsx
 * <FixtureCard
 *   match={match}
 *   onClick={(match) => console.log(match)}
 * />
 * ```
 */
export function FixtureCard({ match, onClick }: FixtureCardProps) {
  const isFinished = match.status === 'FT'
  const isLive = match.status === 'LIVE'
  const isNotStarted = match.status === 'NS'

  // Formatear fecha y hora
  const matchDate = new Date(match.matchDate)
  const dateStr = matchDate.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  })
  const timeStr = matchDate.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleClick = () => {
    if (onClick) {
      onClick(match)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`rounded-lg border border-[#8a6d3b] bg-[#2c241b] p-4 shadow-sm transition-all ${
        onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-md' : ''
      }`}
    >
      {/* Fecha y estado */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">{dateStr}</span>
        {isLive && (
          <span className="animate-pulse rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
            EN VIVO
          </span>
        )}
        {isFinished && (
          <span className="rounded-full bg-gray-500 px-2 py-1 text-xs font-semibold text-white">
            FINALIZADO
          </span>
        )}
        {isNotStarted && (
          <span className="text-xs font-medium text-gray-600">{timeStr}</span>
        )}
      </div>

      {/* Equipos y resultado */}
      <div className="space-y-3">
        {/* Equipo Local */}
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-3">
            {match.homeTeam.logo && (
              <div className="relative h-8 w-8 flex-shrink-0">
                <Image
                  src={match.homeTeam.logo}
                  alt={match.homeTeam.name}
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </div>
            )}
            <span className="font-medium text-[#e6c885]">
              {match.homeTeam.name}
            </span>
          </div>
          {(isFinished || isLive) && match.homeScore !== null && (
            <span className="text-2xl font-bold text-[#e6c885]">
              {match.homeScore}
            </span>
          )}
        </div>

        {/* Equipo Visitante */}
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-3">
            {match.awayTeam.logo && (
              <div className="relative h-8 w-8 flex-shrink-0">
                <Image
                  src={match.awayTeam.logo}
                  alt={match.awayTeam.name}
                  fill
                  className="object-contain"
                  sizes="32px"
                />
              </div>
            )}
            <span className="font-medium text-[#e6c885]">
              {match.awayTeam.name}
            </span>
          </div>
          {(isFinished || isLive) && match.awayScore !== null && (
            <span className="text-2xl font-bold text-[#e6c885]">
              {match.awayScore}
            </span>
          )}
        </div>
      </div>

      {/* Información adicional */}
      {match.venue && (
        <div className="mt-3 border-t border-gray-100 pt-2">
          <p className="text-xs text-gray-500">
            📍 {match.venue}
          </p>
        </div>
      )}
    </div>
  )
}
