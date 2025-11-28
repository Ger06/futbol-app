'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useStandingsPreview } from '@/leagues/hooks'
import { LoadingSection } from '@/shared/components/ui/LoadingSpinner'

interface StandingsPreviewProps {
  leagueId: number
  leagueSlug: string // Para el link "Ver tabla completa"
  limit?: number // Cuántos equipos mostrar (por defecto 5)
}

/**
 * StandingsPreview - Vista previa de la tabla de posiciones
 *
 * Muestra el top N de equipos con información simplificada:
 * - Posición
 * - Equipo
 * - Puntos
 * - Link para ver tabla completa
 *
 * @example
 * ```tsx
 * <StandingsPreview leagueId={1} leagueSlug="premier-league" limit={5} />
 * ```
 */
export function StandingsPreview({
  leagueId,
  leagueSlug,
  limit = 5,
}: StandingsPreviewProps) {
  const { data: standings, isLoading, error } = useStandingsPreview(leagueId, limit)

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Posiciones</h2>
        </div>
        <LoadingSection />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Posiciones</h2>
        </div>
        <div className="rounded-lg border-2 border-dashed border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-semibold text-red-800">
            Error al cargar posiciones
          </p>
        </div>
      </div>
    )
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Posiciones</h2>
        </div>
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-600">
            No hay datos disponibles
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Posiciones</h2>
          <Link
            href={`/${leagueSlug}/posiciones`}
            className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Ver tabla completa →
          </Link>
        </div>
      </div>

      {/* Tabla simplificada */}
      <div className="divide-y divide-gray-100">
        {standings.map((entry) => {
          // Determinar color de posición
          let positionColor = 'text-gray-700'
          let positionBg = 'bg-gray-100'

          if (entry.position <= 4) {
            positionColor = 'text-blue-700'
            positionBg = 'bg-blue-100'
          } else if (entry.position <= 6) {
            positionColor = 'text-green-700'
            positionBg = 'bg-green-100'
          }

          return (
            <div
              key={entry.team.id}
              className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
            >
              {/* Posición + Equipo */}
              <div className="flex flex-1 items-center gap-4">
                {/* Posición */}
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${positionBg}`}
                >
                  <span className={`text-sm font-bold ${positionColor}`}>
                    {entry.position}
                  </span>
                </div>

                {/* Logo */}
                {entry.team.logo && (
                  <div className="relative h-6 w-6 flex-shrink-0">
                    <Image
                      src={entry.team.logo}
                      alt={entry.team.name}
                      fill
                      className="object-contain"
                      sizes="24px"
                    />
                  </div>
                )}

                {/* Nombre del equipo */}
                <span className="font-medium text-gray-900">
                  {entry.team.name}
                </span>
              </div>

              {/* Estadísticas resumidas */}
              <div className="flex items-center gap-6 text-sm">
                {/* PJ */}
                <div className="text-center">
                  <div className="text-xs text-gray-500">PJ</div>
                  <div className="font-semibold text-gray-900">
                    {entry.played}
                  </div>
                </div>

                {/* DG */}
                <div className="text-center">
                  <div className="text-xs text-gray-500">DG</div>
                  <div
                    className={`font-semibold ${
                      entry.goalDifference > 0
                        ? 'text-green-600'
                        : entry.goalDifference < 0
                          ? 'text-red-600'
                          : 'text-gray-900'
                    }`}
                  >
                    {entry.goalDifference > 0 ? '+' : ''}
                    {entry.goalDifference}
                  </div>
                </div>

                {/* Puntos */}
                <div className="text-center">
                  <div className="text-xs text-gray-500">Pts</div>
                  <div className="text-lg font-bold text-gray-900">
                    {entry.points}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer con link */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <Link
          href={`/${leagueSlug}/posiciones`}
          className="block text-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          Ver tabla completa con {limit}+ equipos
        </Link>
      </div>
    </div>
  )
}
