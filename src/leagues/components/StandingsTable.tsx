'use client'

import React from 'react'
import Image from 'next/image'
import { useStandings } from '@/leagues/hooks'
import { LoadingSection } from '@/shared/components/ui/LoadingSpinner'
import { FormBadge } from './FormBadge'

interface StandingsTableProps {
  leagueId: number
  showForm?: boolean // Mostrar racha de últimos resultados
}

/**
 * StandingsTable - Tabla completa de posiciones
 *
 * Muestra la clasificación completa de una liga con:
 * - Posición
 * - Equipo (logo + nombre)
 * - Estadísticas (PJ, G, E, P, GF, GC, DG, Pts)
 * - Forma (últimos 5 resultados)
 *
 * @example
 * ```tsx
 * <StandingsTable leagueId={1} showForm />
 * ```
 */
export function StandingsTable({
  leagueId,
  showForm = true,
}: StandingsTableProps) {
  const { data: standings, isLoading, error } = useStandings(leagueId)

  if (isLoading) {
    return <LoadingSection />
  }

  if (error) {
    return (
      <div className="rounded-lg border-2 border-dashed border-red-200 bg-red-50 p-8 text-center">
        <p className="text-lg font-semibold text-red-800">
          Error al cargar la tabla
        </p>
        <p className="mt-1 text-sm text-red-600">
          {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      </div>
    )
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <p className="text-lg font-semibold text-gray-700">
          No hay datos de posiciones disponibles
        </p>
        <p className="mt-1 text-sm text-gray-500">
          No hay partidos finalizados en esta liga
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              #
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">
              Equipo
            </th>
            <th className="px-2 py-3 text-center font-semibold text-gray-700">
              PJ
            </th>
            <th className="px-2 py-3 text-center font-semibold text-gray-700">
              G
            </th>
            <th className="px-2 py-3 text-center font-semibold text-gray-700">
              E
            </th>
            <th className="px-2 py-3 text-center font-semibold text-gray-700">
              P
            </th>
            <th className="px-2 py-3 text-center font-semibold text-gray-700">
              GF
            </th>
            <th className="px-2 py-3 text-center font-semibold text-gray-700">
              GC
            </th>
            <th className="px-2 py-3 text-center font-semibold text-gray-700">
              DG
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">
              Pts
            </th>
            {showForm && (
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Forma
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {standings.map((entry, index) => {
            // Determinar color de fondo para zonas especiales
            let rowClass = 'hover:bg-gray-50'

            // Champions League (top 4 para ligas nacionales)
            if (entry.position <= 4) {
              rowClass = 'bg-blue-50/30 hover:bg-blue-50/50'
            }
            // Europa League (5-6)
            else if (entry.position <= 6) {
              rowClass = 'bg-green-50/30 hover:bg-green-50/50'
            }
            // Descenso (últimos 3)
            else if (entry.position > standings.length - 3) {
              rowClass = 'bg-red-50/30 hover:bg-red-50/50'
            }

            return (
              <tr
                key={entry.team.id}
                className={`border-b border-gray-100 transition-colors ${rowClass}`}
              >
                {/* Posición */}
                <td className="px-4 py-3">
                  <span className="font-semibold text-gray-900">
                    {entry.position}
                  </span>
                </td>

                {/* Equipo */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
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
                    <span className="font-medium text-gray-900">
                      {entry.team.name}
                    </span>
                  </div>
                </td>

                {/* Estadísticas */}
                <td className="px-2 py-3 text-center text-gray-700">
                  {entry.played}
                </td>
                <td className="px-2 py-3 text-center text-gray-700">
                  {entry.won}
                </td>
                <td className="px-2 py-3 text-center text-gray-700">
                  {entry.drawn}
                </td>
                <td className="px-2 py-3 text-center text-gray-700">
                  {entry.lost}
                </td>
                <td className="px-2 py-3 text-center text-gray-700">
                  {entry.goalsFor}
                </td>
                <td className="px-2 py-3 text-center text-gray-700">
                  {entry.goalsAgainst}
                </td>
                <td
                  className={`px-2 py-3 text-center font-semibold ${
                    entry.goalDifference > 0
                      ? 'text-green-600'
                      : entry.goalDifference < 0
                        ? 'text-red-600'
                        : 'text-gray-700'
                  }`}
                >
                  {entry.goalDifference > 0 ? '+' : ''}
                  {entry.goalDifference}
                </td>

                {/* Puntos */}
                <td className="px-4 py-3 text-center">
                  <span className="font-bold text-gray-900">
                    {entry.points}
                  </span>
                </td>

                {/* Forma */}
                {showForm && (
                  <td className="px-4 py-3">
                    <FormBadge form={entry.form} limit={5} />
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Leyenda de colores */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-200"></div>
            <span>Champions League</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-200"></div>
            <span>Europa League</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-200"></div>
            <span>Descenso</span>
          </div>
        </div>
      </div>
    </div>
  )
}
