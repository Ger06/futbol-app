'use client'

// ... imports ...
import React, { useMemo } from 'react'
import Image from 'next/image'
import { useStandings } from '@/leagues/hooks'
import { LoadingSection } from '@/shared/components/ui/LoadingSpinner'
import { FormBadge } from './FormBadge'

interface StandingsTableProps {
  leagueId: number
  showForm?: boolean // Mostrar racha de últimos resultados
}

export function StandingsTable({
  leagueId,
  showForm = true,
}: StandingsTableProps) {
  const { data: standings, isLoading, error } = useStandings(leagueId, {
    staleTime: 1000 * 60, // 1 minuto
    refetchInterval: 1000 * 60 // 1 minuto
  })

  const groupedStandings = useMemo(() => {
    if (!standings) return {}
    
    // Agrupar por zona/grupo
    // API devuelve nombres como "Liga Profesional Argentina - 1st Phase - Group A"
    // Vamos a simplificarlo a "Zona A", "Zona B" si es posible, o usar el nombre completo
    const groups: Record<string, typeof standings> = {}
    
    standings.forEach(entry => {
      // Simplificar nombre del grupo si es muy largo y contiene "Group"
      let groupName = entry.group || 'General'
      if (groupName.includes('Group A')) groupName = 'Zona A'
      if (groupName.includes('Group B')) groupName = 'Zona B'
      
      if (!groups[groupName]) {
        groups[groupName] = []
      }
      groups[groupName].push(entry)
    })
    
    return groups
  }, [standings])

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
    <div className="space-y-8">
      {Object.entries(groupedStandings).map(([groupName, groupStandings]) => (
        <div key={groupName} className="overflow-x-auto rounded-lg border border-[#8a6d3b] bg-[#1a120b] shadow-lg relative">
          {/* Texture Overlay for Table */}
          <div className="absolute inset-0 bg-[url('/textures/grunge.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
          
          {/* Header de Grupo si hay más de uno o si no es General */}
          {Object.keys(groupedStandings).length > 1 && (
            <div className="bg-[#2c241b] px-4 py-2 border-b border-[#8a6d3b]">
              <h3 className="font-oswald font-bold text-[#e6c885] text-lg uppercase tracking-wider">
                {groupName}
              </h3>
            </div>
          )}

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
              {groupStandings.map((entry, index) => {
                // Determinar color de fondo para zonas especiales
                let rowClass = 'hover:bg-[#2c241b]/50 border-b border-[#8a6d3b]/20 transition-colors'
                
                // Champions League: Dorado translúcido
                if (entry.position <= 4) {
                  rowClass = 'bg-[#c5a059]/10 hover:bg-[#c5a059]/20 border-b border-[#8a6d3b]/30 transition-colors'
                }
                // Europa League: Verde translúcido
                else if (entry.position <= 6) {
                  rowClass = 'bg-[#1a472a]/20 hover:bg-[#1a472a]/30 border-b border-[#8a6d3b]/20 transition-colors'
                }
                // Descenso: Rojo oscuro translúcido
                else if (entry.position > groupStandings.length - 3) {
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
          
          {/* Leyenda solo en el último grupo o fuera del loop */}
        </div>
      ))}
      
        {/* Leyenda de colores adaptada (Global) */}
        <div className="border border-[#8a6d3b] bg-[#2c241b] px-4 py-3 rounded-lg">
          <div className="flex flex-wrap gap-4 text-xs font-oswald text-[#e6c885]/80">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[#c5a059]/40 border border-[#c5a059]"></div>
              <span>Champions League / Play-off</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-[#1a472a]/60 border border-[#1a472a]"></div>
              <span>Copas Internacionales</span>
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
