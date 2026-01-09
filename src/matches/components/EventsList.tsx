import React from 'react'
import type { Goal, Card } from '@/matches/types'

interface EventsListProps {
  goals: Goal[]
  cards: Card[]
  homeTeam: { id: number; name: string; logo?: string }
  awayTeam: { id: number; name: string; logo?: string }
}

interface DisplayEvent {
  id: string
  teamId: number
  playerName: string
  minute: number
  extraTime?: number | null
  type: 'Goal' | 'Card'
  detail: string
  icon: string
}

/**
 * EventsList - Lista de eventos (goles y tarjetas rojas) de un partido
 */
export function EventsList({ goals, cards, homeTeam, awayTeam }: EventsListProps) {
  const hasGoals = goals && goals.length > 0
  const hasCards = cards && cards.length > 0
  
  if (!hasGoals && !hasCards) {
    return null
  }

  // Combinar y mapear eventos
  const allEvents: DisplayEvent[] = []

  if (goals) {
    goals.forEach(g => {
      let icon = '⚽'
      if (g.type === 'Penalty') icon = '⚽(P)'
      if (g.type === 'Own Goal') icon = '⚽(AG)'
      
      allEvents.push({
        id: `g-${g.id}`,
        teamId: g.teamId,
        playerName: g.playerName,
        minute: g.minute,
        extraTime: g.extraTime,
        type: 'Goal',
        detail: g.type,
        icon
      })
    })
  }

  if (cards) {
    cards.forEach(c => {
      // Solo mostramos rojas en la tarjeta según request
      if (c.type === 'Red') {
        allEvents.push({
           id: `c-${c.id}`,
           teamId: c.teamId,
           playerName: c.playerName,
           minute: c.minute,
           type: 'Card',
           detail: c.type,
           icon: '🟥'
        })
      }
    })
  }

  // Ordenar por minuto
  allEvents.sort((a, b) => {
    const timeA = a.minute + (a.extraTime || 0)
    const timeB = b.minute + (b.extraTime || 0)
    return timeA - timeB
  })

  // Usar los IDs de los equipos props
  const homeEvents = allEvents.filter(e => e.teamId === homeTeam.id)
  const awayEvents = allEvents.filter(e => e.teamId === awayTeam.id)

  if (allEvents.length === 0) {
    return null
  }

  const formatMinute = (minute: number, extraTime?: number | null) => {
    if (extraTime) {
      return `${minute}+${extraTime}'`
    }
    return `${minute}'`
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#8a6d3b]/30 pt-3 bg-black/20 rounded px-2 pb-2">
      {/* Eventos Local */}
      <div className="space-y-1">
        {homeEvents.map((event) => (
          <div key={event.id} className="flex items-center gap-1.5 text-xs text-[#f4f1ea]">
             {/* Logo Equipo Local */}
             {homeTeam.logo && (
               <img src={homeTeam.logo} alt={homeTeam.name} className="h-3 w-3 object-contain opacity-80" />
             )}
             <span className="text-sm">{event.icon}</span>
             <span className="truncate max-w-[80px] font-medium" title={event.playerName}>{event.playerName}</span>
             <span className="text-[10px] text-[#c5a059] font-mono">
               {formatMinute(event.minute, event.extraTime)}
             </span>
          </div>
        ))}
      </div>

      {/* Eventos Visitante */}
      <div className="space-y-1 text-right">
        {awayEvents.map((event) => (
           <div key={event.id} className="flex items-center justify-end gap-1.5 text-xs text-[#f4f1ea]">
             <span className="text-[10px] text-[#c5a059] font-mono">
               {formatMinute(event.minute, event.extraTime)}
             </span>
             <span className="truncate max-w-[80px] font-medium" title={event.playerName}>{event.playerName}</span>
             <span className="text-sm">{event.icon}</span>
             {/* Logo Equipo Visitante */}
             {awayTeam.logo && (
               <img src={awayTeam.logo} alt={awayTeam.name} className="h-3 w-3 object-contain opacity-80" />
             )}
          </div>
        ))}
      </div>
    </div>
  )
}
