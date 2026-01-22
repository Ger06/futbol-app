'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/shared/components/ui/Card'
import { StatusBadge } from '@/shared/components/ui/Badge'
import { EventsList } from './EventsList'
import type { MatchWithTeams, MatchWithDetails } from '@/matches/types'
import { MATCH_HIGHLIGHTS, getAutomatedHighlight } from '@/shared/constants/match-highlights'

interface MatchCardProps {
  match: MatchWithTeams | MatchWithDetails
  onClick?: () => void
  /** Si es false, el card no será clickeable (default: true) */
  clickable?: boolean
}

import { getLeagueById } from '@/shared/constants/leagues'
import { getManualBroadcasters } from '@/shared/constants/match-broadcasters'

/**
 * MatchCard - Tarjeta individual de partido
 *
 * Muestra información del partido:
 * - Equipos con escudos
 * - Resultado actual
 * - Estado del partido (badge)
 * - Liga
 * - Hora del partido
 *
 * Por defecto, el card es clickeable y navega a /match/[id]
 *
 * @param match - Datos del partido con equipos y liga
 * @param onClick - Función opcional al hacer click (sobrescribe navegación por defecto)
 * @param clickable - Si es false, el card no será clickeable (default: true)
 *
 * @example
 * ```tsx
 * <MatchCard match={match} />
 * ```
 */
export function MatchCard({ match, onClick, clickable = true }: MatchCardProps) {
  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const isLive = match.status === 'LIVE'
  const hasStarted = match.status !== 'NS'
  const hasGoals = 'goals' in match && match.goals && match.goals.length > 0
  
  // Debug log
  if (isLive || hasStarted) {
      // console.log(`Match ${match.id} events:`, { goals: match.goals, cards: match.cards })
  }

  // Si es clickeable y no hay onClick custom, usar Link de Next.js
  const isClickable = clickable && !onClick

  // 1. Intentar obtener broadcasters manuales
  const manualBroadcasters = getManualBroadcasters(match)

  // 2. Si no hay manuales, obtener de la liga (usando apiId si existe, o id como fallback)
  // IMPORTANTE: match.league.apiId es el ID que usamos en constants/leagues.ts
  const leagueId = match.league.apiId || match.league.id
  const leagueConfig = getLeagueById(leagueId)
  
  // 3. Prioridad: BD > Manual > Liga
  // Cast a any para evitar conflictos de tipo si match es de un tipo que aún no tiene broadcasters strict
  const dbBroadcasters = (match as any).broadcasters as any[] | null
  const broadcasters = dbBroadcasters || manualBroadcasters || leagueConfig?.broadcasters


  const cardContent = (
    <Card
      hoverable={clickable}
      onClick={onClick}
      className={`${isLive ? 'border-red-900 bg-red-950/40 relative overflow-hidden' : ''} ${
        isClickable ? 'cursor-pointer transition-transform hover:scale-[1.02]' : ''
      }`}
    >
      {isLive && (
         <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-transparent pointer-events-none" />
      )}
      <div className="pl-2 relative z-10 flex gap-1">
        
        {/* Main Content Info */}
        <div className="flex-1">
          {/* Header con Liga y Status */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                 const logo = match.league.logo || leagueConfig?.icon
                 if (!logo) return null

                 const isUrl = logo.startsWith('http') || logo.startsWith('/')
                 
                 if (isUrl) {
                   return (
                    <img
                      src={logo}
                      alt={match.league.name}
                      className="h-4 w-4 object-contain"
                    />
                   )
                 }

                 return (
                   <span className="text-sm leading-none" role="img" aria-label={match.league.name}>
                     {logo}
                   </span>
                 )
              })()}
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c5a059]">
                {match.league.name}
              </span>
            </div>
            <StatusBadge status={match.status} theme="retro" elapsed={(match as MatchWithDetails).elapsed} />
          </div>

          {/* Equipos y Resultado */}
          <div className="space-y-2">
            {/* Equipo Local */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {match.homeTeam.logo && (
                  <img
                    src={match.homeTeam.logo}
                    alt={match.homeTeam.name}
                    className="h-8 w-8 object-contain"
                  />
                )}
                <span className="font-bold text-gray-100">
                  {match.homeTeam.name}
                </span>
              </div>
              {hasStarted && (
                <span className={`text-2xl font-bold ${isLive ? 'text-red-500' : 'text-gray-100'}`}>
                  {match.homeScore ?? 0}
                </span>
              )}
            </div>

            {/* Equipo Visitante */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {match.awayTeam.logo && (
                  <img
                    src={match.awayTeam.logo}
                    alt={match.awayTeam.name}
                    className="h-8 w-8 object-contain"
                  />
                )}
                <span className="font-bold text-gray-100">
                  {match.awayTeam.name}
                </span>
              </div>
              {hasStarted && (
                <span className={`text-2xl font-bold ${isLive ? 'text-red-500' : 'text-gray-100'}`}>
                  {match.awayScore ?? 0}
                </span>
              )}
            </div>
          </div>

          {/* Eventos (Goles y Rojas) */}
          {hasStarted && (match.goals?.length! > 0 || match.cards?.length! > 0) && (
            <EventsList
              goals={(match as MatchWithDetails).goals}
              cards={(match as MatchWithDetails).cards}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
            />
          )}

          {!hasStarted && (
            <div className="mt-3 border-t border-gray-100 pt-2 text-center">
              <span className="text-sm font-medium text-[#8a6d3b]">
                {formatTime(match.matchDate)}
              </span>
            </div>
          )}

          {/* Sección Ojo al Dato */}
          {(() => {
            const dbHighlight = (match as any).highlight
            const manualHighlight = MATCH_HIGHLIGHTS[match.apiId?.toString()] || 
                                  MATCH_HIGHLIGHTS[`${match.homeTeam.code}-${match.awayTeam.code}`]
            const highlight = dbHighlight || manualHighlight || getAutomatedHighlight(match)
            
            // Ocultar si ya hay eventos VISIBLES (goles o tarjetas rojas) que ocupen espacio
            const hasEvents = (match.goals && match.goals.length > 0) || 
                            (match.cards && match.cards.some((c: any) => c.type === 'Red'))
            const isFinished = ['FT', 'AET', 'PEN'].includes(match.status)

            if (!highlight || hasEvents || isFinished) return null

            return (
              <div className="mt-3 rounded-sm border border-[#c5a059]/30 bg-[#c5a059]/10 p-2">
                <div className="flex items-start gap-2">
                  <span className="text-lg">🧐</span>
                  <div>
                    <h4 className="font-marker text-[14px] uppercase text-[#c5a059] opacity-80">
                      Ojo al dato
                    </h4>
                    <p className="font-oswald text-sm leading-tight text-[#f4f1ea]/90">
                      {highlight.split(/(\d+%?|\d+\.\d+)/g).map((part: string, i: number) => 
                        part.match(/(\d+%?|\d+\.\d+)/) ? <span key={i} className="font-bold text-[#f4f1ea]">{part}</span> : part
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Broadcaster Column (Right Side) */}
        {match.status !== 'FT' && broadcasters && broadcasters.length > 0 && (
          <div className="flex flex-col justify-center items-center gap-2 border-l border-white/10 pl-4 min-w-[40px]">
             {broadcasters.map((item, index) => {
               const isObject = typeof item === 'object'
               const logoUrl = isObject ? item.url : item
               const channel = isObject ? item.channel : null

               return (
                <div key={index} className="flex flex-col items-center gap-0.5">
                  <div className="bg-white/90 p-1 rounded-sm shadow-sm w-8 h-8 flex items-center justify-center">
                     <img 
                        src={logoUrl} 
                        alt="Broadcaster" 
                        className="max-w-full max-h-full object-contain"
                     />
                  </div>
                  {channel && (
                    <span className="text-[10px] font-bold text-white/90 leading-none shadow-black drop-shadow-md">
                      {channel}
                    </span>
                  )}
                </div>
               )
             })}
          </div>
        )}
      </div>
    </Card>
  )

  // Si es clickeable sin onClick custom, envolver en Link
  if (isClickable) {
    return (
      <Link href={`/match/${match.id}`} className="block">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}

