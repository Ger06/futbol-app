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
      <div className="rounded-lg border-2 border-dashed border-red-900/50 bg-red-900/20 p-8 text-center">
        <p className="text-lg font-semibold text-red-400">
          Error al cargar la tabla
        </p>
        <p className="mt-1 text-sm text-red-300">
          {error instanceof Error ? error.message : 'Error desconocido'}
        </p>
      </div>
    )
  }

  if (!standings || standings.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-[#8a6d3b]/50 bg-[#1a120b] p-8 text-center">
        <p className="text-lg font-semibold text-[#c5a059]">
          No hay datos de posiciones disponibles
        </p>
        <p className="mt-1 text-sm text-[#e6c885]/70">
          No hay partidos finalizados en esta liga
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#8a6d3b] bg-[#1a120b] shadow-lg relative">
      {/* Texture Overlay for Table */}
      <div className="absolute inset-0 bg-[url('/textures/grunge.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      
      <table className="w-full text-sm relative z-10">
        <thead className="bg-[#2c241b] border-b border-[#8a6d3b]">
          <tr>
            <th className="px-4 py-3 text-left font-bold font-oswald text-[#c5a059] uppercase tracking-wider">
              #
            </th>
            <th className="px-4 py-3 text-left font-bold font-oswald text-[#c5a059] uppercase tracking-wider">
              Equipo
            </th>
            <th className="px-2 py-3 text-center font-bold font-oswald text-[#c5a059] uppercase tracking-wider">
              PJ
            </th>
            <th className="px-2 py-3 text-center font-bold font-oswald text-[#c5a059] uppercase tracking-wider">
              G
            </th>
            <th className="px-2 py-3 text-center font-bold font-oswald text-[#c5a059] uppercase tracking-wider">
              E
            </th>
            <th className="px-2 py-3 text-center font-bold font-oswald text-[#c5a059] uppercase tracking-wider">
              P
            </th>
            <th className="px-2 py-3 text-center font-bold font-oswald text-[#c5a059] uppercase tracking-wider">
              GF
            </th>
            <th className="px-2 py-3 text-center font-bold font-oswald text-[#c5a059] uppercase tracking-wider">
              GC
            </th>
            <th className="px-2 py-3 text-center font-bold font-oswald text-[#c5a059] uppercase tracking-wider">
              DG
            </th>
            <th className="px-4 py-3 text-center font-bold font-oswald text-[#c5a059] uppercase tracking-wider">
              Pts
            </th>
            {showForm && (
              <th className="px-4 py-3 text-left font-bold font-oswald text-[#c5a059] uppercase tracking-wider">
                Forma
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {standings.map((entry, index) => {
            // Determinar color de fondo para zonas especiales
            let rowClass = 'hover:bg-[#2c241b]/50 border-b border-[#8a6d3b]/20 transition-colors'
            
            // Champions League: Dorado translúcido
            if (entry.position <= 4) {
              rowClass = 'bg-[#c5a059]/10 hover:bg-[#c5a059]/20 border-b border-[#8a6d3b]/30 transition-colors'
            }
            // Europa League: Verde translúcido (adaptado a retro si es necesario, pero verde está ok para Europa)
            else if (entry.position <= 6) {
              rowClass = 'bg-[#1a472a]/20 hover:bg-[#1a472a]/30 border-b border-[#8a6d3b]/20 transition-colors'
            }
            // Descenso: Rojo oscuro translúcido
            else if (entry.position > standings.length - 3) {
              rowClass = 'bg-[#4a1c1c]/30 hover:bg-[#4a1c1c]/40 border-b border-[#8a6d3b]/20 transition-colors'
            }

            return (
              <tr
                key={entry.team.id}
                className={rowClass}
              >
                {/* Posición */}
                <td className="px-4 py-3">
                  <span className="font-bold font-oswald text-[#e6c885]">
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
                    <span className="font-medium text-[#f4f1ea] font-sans">
                      {entry.team.name}
                    </span>
                  </div>
                </td>

                {/* Estadísticas */}
                <td className="px-2 py-3 text-center text-[#e6c885]/80 font-mono">
                  {entry.played}
                </td>
                <td className="px-2 py-3 text-center text-[#e6c885]/80 font-mono">
                  {entry.won}
                </td>
                <td className="px-2 py-3 text-center text-[#e6c885]/80 font-mono">
                  {entry.drawn}
                </td>
                <td className="px-2 py-3 text-center text-[#e6c885]/80 font-mono">
                  {entry.lost}
                </td>
                <td className="px-2 py-3 text-center text-[#e6c885]/80 font-mono">
                  {entry.goalsFor}
                </td>
                <td className="px-2 py-3 text-center text-[#e6c885]/80 font-mono">
                  {entry.goalsAgainst}
                </td>
                <td
                  className={`px-2 py-3 text-center font-bold font-mono ${
                    entry.goalDifference > 0
                      ? 'text-[#2e7d32]' // Verde más oscuro/apropiado
                      : entry.goalDifference < 0
                        ? 'text-[#c62828]' // Rojo más oscuro
                        : 'text-[#e6c885]/80'
                  }`}
                >
                  {entry.goalDifference > 0 ? '+' : ''}
                  {entry.goalDifference}
                </td>

                {/* Puntos */}
                <td className="px-4 py-3 text-center">
                  <span className="font-bold font-oswald text-[#c5a059] text-lg">
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

      {/* Leyenda de colores adaptada */}
      <div className="border-t border-[#8a6d3b] bg-[#2c241b] px-4 py-3">
        <div className="flex flex-wrap gap-4 text-xs font-oswald text-[#e6c885]/80">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#c5a059]/40 border border-[#c5a059]"></div>
            <span>Champions League</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#1a472a]/60 border border-[#1a472a]"></div>
            <span>Europa League</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#4a1c1c]/60 border border-[#4a1c1c]"></div>
            <span>Descenso</span>
          </div>
        </div>
      </div>
    </div>
  )
}
