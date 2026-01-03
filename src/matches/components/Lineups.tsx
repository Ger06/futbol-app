import React from 'react'
import { TeamLineup, Goal, Card, Substitution } from '@/matches/types'

interface LineupsProps {
  home: TeamLineup
  away: TeamLineup
  homeTeamName: string
  awayTeamName: string
  goals?: Goal[]
  cards?: Card[]
  substitutions?: Substitution[]
}

export function Lineups({ home, away, homeTeamName, awayTeamName, goals = [], cards = [], substitutions = [] }: LineupsProps) {
  
  const getPlayerIcons = (playerId: number, playerName: string) => {
    const icons: React.ReactNode[] = []
    
    // Helper para comparar nombres de manera flexible
    // Helper para comparar nombres de manera flexible. Maneja caracteres turcos (ı -> i)
    const normalize = (str: string) => str.toLowerCase().replace(/ı/g, 'i').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\./g, "").trim()
    
    const namesMatch = (n1: string, n2: string) => {
        if (!n1 || !n2) return false
        const norm1 = normalize(n1)
        const norm2 = normalize(n2)
        
        // 1. Coincidencia exacta o inclusión directa
        if (norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1)) return true
        
        // 2. Coincidencia por palabras clave (Apellidos)
        // Ejemplo: "A. Ratiu" vs "Andrei Ratiu" -> "ratiu" == "ratiu"
        const words1 = norm1.split(' ').filter(w => w.length > 2)
        const words2 = norm2.split(' ').filter(w => w.length > 2)
        
        // Si hay palabras suficientemente largas que coinciden, asumimos que es la misma persona
        return words1.some(w => words2.includes(w))
    }

    // Goals
    const playerGoals = goals.filter(g => namesMatch(g.playerName, playerName))
    playerGoals.forEach(g => {
        let icon = '⚽'
        if (g.type === 'Penalty') icon = '⚽(P)'
        if (g.type === 'Own Goal') icon = '⚽(AG)'
        icons.push(<span key={`g-${g.id}`} title={g.type} className="text-sm">{icon}</span>)
    })

    // Cards
    const playerCards = cards.filter(c => namesMatch(c.playerName, playerName))
    playerCards.forEach(c => {
        if (c.type === 'Yellow') icons.push(<span key={`c-${c.id}`} title="Yellow Card">🟨</span>)
        if (c.type === 'Red') icons.push(<span key={`c-${c.id}`} title="Red Card">🟥</span>)
    })

    // Substitutions
    // Player Out (Sale)
    const subOut = substitutions.filter(s => namesMatch(s.playerOut.name, playerName))
    subOut.forEach(s => icons.push(
      <span key={`so-${s.id}`} title={`Sub Out ${s.minute}'`} className="flex items-center justify-center h-4 w-4 bg-red-600/80 text-white text-[10px] rounded-full shadow-sm">
        ⬇
      </span>
    ))

    // Player In (Entra)
    const subIn = substitutions.filter(s => namesMatch(s.playerIn.name, playerName))
    subIn.forEach(s => icons.push(<span key={`si-${s.id}`} title={`Sub In ${s.minute}'`} className="text-xs text-green-400">⬆️</span>))

    return icons
  }

  const renderPlayer = (player: any, isHome: boolean) => (
    <li key={player.id} className="flex items-center gap-3 text-[#f4f1ea] hover:bg-[#c5a059]/10 p-1 rounded transition-colors">
        <span className={`font-mono font-bold w-6 text-right ${isHome ? 'text-[#c5a059]' : 'text-[#c5a059]'}`}>{player.number}</span>
        <div className="flex items-center gap-2 truncate">
            <span>{player.name}</span>
            <div className="flex items-center gap-0.5">
                {getPlayerIcons(player.id, player.name)}
            </div>
        </div>
        {player.pos && <span className="ml-auto text-[10px] bg-[#1a120b] px-1 rounded text-[#8a6d3b] border border-[#8a6d3b]/30">{player.pos}</span>}
    </li>
  )

  return (
    <div className="rounded-lg bg-[#2c241b] border-2 border-[#8a6d3b] shadow-lg overflow-hidden relative">
      <div className="bg-[#1a120b] border-b-2 border-[#8a6d3b] p-4 flex items-center gap-3">
        <span className="text-2xl">📋</span>
        <h3 className="font-marker text-[#c5a059] text-2xl uppercase tracking-wide skew-x-[-5deg]">
          Lineups
        </h3>
      </div>

      <div className="p-6 grid gap-8 md:grid-cols-2">
        {/* Home Team */}
        <div>
          <div className="mb-4 flex items-center justify-between border-b border-[#8a6d3b] pb-2">
            <h4 className="font-oswald text-xl font-bold text-[#f4f1ea] uppercase">{homeTeamName}</h4>
            <span className="font-mono text-[#c5a059]">{home.formation}</span>
          </div>

           {/* Coach */}
           <div className="mb-4 text-sm text-[#e6c885]">
            <span className="font-bold uppercase tracking-wider text-[#8a6d3b]">Coach:</span> {home.coach.name}
          </div>

          {/* Starting XI */}
          <div className="space-y-2 mb-6">
            <h5 className="text-xs uppercase tracking-[0.2em] text-[#8a6d3b] font-bold">Starting XI</h5>
            <ul className="space-y-1">
                {home.startXI.map(p => renderPlayer(p, true))}
            </ul>
          </div>

          {/* Substitutes */}
          <div className="space-y-2">
            <h5 className="text-xs uppercase tracking-[0.2em] text-[#8a6d3b] font-bold">Substitutes</h5>
             <ul className="space-y-1 opacity-80">
                {home.substitutes.map(p => renderPlayer(p, true))}
            </ul>
          </div>
        </div>

        {/* Away Team */}
        <div>
           <div className="mb-4 flex items-center justify-between border-b border-[#8a6d3b] pb-2">
            <h4 className="font-oswald text-xl font-bold text-[#f4f1ea] uppercase">{awayTeamName}</h4>
            <span className="font-mono text-[#c5a059]">{away.formation}</span>
          </div>

           {/* Coach */}
           <div className="mb-4 text-sm text-[#e6c885]">
            <span className="font-bold uppercase tracking-wider text-[#8a6d3b]">Coach:</span> {away.coach.name}
          </div>

          {/* Starting XI */}
           <div className="space-y-2 mb-6">
            <h5 className="text-xs uppercase tracking-[0.2em] text-[#8a6d3b] font-bold">Starting XI</h5>
            <ul className="space-y-1">
                {away.startXI.map(p => renderPlayer(p, false))}
            </ul>
          </div>

          {/* Substitutes */}
           <div className="space-y-2">
            <h5 className="text-xs uppercase tracking-[0.2em] text-[#8a6d3b] font-bold">Substitutes</h5>
             <ul className="space-y-1 opacity-80">
                {away.substitutes.map(p => renderPlayer(p, false))}
            </ul>
          </div>
        </div>

      </div>
       <div className="absolute inset-0 bg-[url('/textures/grunge.png')] bg-cover mix-blend-overlay opacity-10 pointer-events-none" />
    </div>
  )
}
