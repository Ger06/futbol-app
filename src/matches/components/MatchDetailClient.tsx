'use client'

import React from 'react'
import { useMatchDetails } from '@/matches/hooks'
import { GoalsList } from '@/matches/components'
import { StatusBadge } from '@/shared/components/ui/Badge'
import Link from 'next/link'

interface MatchDetailClientProps {
  matchId: number
}

export default function MatchDetailClient({ matchId }: MatchDetailClientProps) {
  const { data: match, isLoading, error } = useMatchDetails(matchId)

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#8a6d3b] border-t-[#c5a059]" />
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-center text-[#e6c885]">
        <div className="text-4xl">⚠️</div>
        <h1 className="mt-4 font-marker text-2xl">Match Unavailable</h1>
        <Link href="/" className="mt-4 border-b-2 border-[#c5a059] font-oswald uppercase hover:text-[#c5a059]">
          Return to Menu
        </Link>
      </div>
    )
  }

  // Calculate stats explicitly if available or default
  const homePossession = match.stats?.home.possession ?? 50
  const awayPossession = match.stats?.away.possession ?? 50

  return (
    <div className="space-y-8 animate-pulse-slow p-4">
      {/* HEADER CARD */}
      <div className="relative overflow-hidden rounded-lg bg-[#2c241b] shadow-[0px_10px_20px_rgba(0,0,0,0.5)] border-4 border-[#c5a059]">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/textures/grunge.png')] bg-cover opacity-10 mix-blend-overlay pointer-events-none" />

        {/* League Banner */}
        <div className="relative z-10 flex items-center justify-between border-b-4 border-[#8a6d3b] bg-[#1a120b]/90 p-4">
          <div className="flex items-center gap-4">
            {match.league.logo && (
               <div className="bg-[#f4f1ea] rounded-full p-1 border border-[#c5a059]">
                <img
                    src={match.league.logo}
                    alt={match.league.name}
                    className="h-8 w-8 object-contain"
                />
               </div>
            )}
            <div>
              <h1 className="text-xl font-bold font-marker text-[#c5a059] uppercase tracking-wider skew-x-[-5deg] drop-shadow-md">
                {match.league.name}
              </h1>
              <p className="text-xs font-oswald text-[#e6c885] uppercase tracking-[0.2em]">{match.league.country}</p>
            </div>
          </div>
          <StatusBadge status={match.status} theme="retro" />
        </div>

        {/* SCOREBOARD */}
        <div className="relative z-10 p-8 lg:p-12 text-center">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            {/* Home Team */}
            <div className="flex flex-1 flex-col items-center gap-4">
              {match.homeTeam.logo && (
                <div className="relative group">
                   <div className="absolute inset-0 animate-pulse rounded-full bg-[#c5a059]/30 blur-xl group-hover:bg-[#c5a059]/50 transition-all" />
                  <img
                    src={match.homeTeam.logo}
                    alt={match.homeTeam.name}
                    className="relative h-24 w-24 md:h-32 md:w-32 object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <h2 className="text-2xl md:text-3xl font-bold font-oswald text-[#f4f1ea] uppercase tracking-wide drop-shadow-lg">{match.homeTeam.name}</h2>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-6 text-6xl md:text-8xl font-black font-marker text-[#c5a059] drop-shadow-[4px_4px_0px_#1a120b]">
                <span className="skew-x-[-5deg]">{match.homeScore ?? 0}</span>
                <span className="text-[#8a6d3b]">-</span>
                <span className="skew-x-[-5deg]">{match.awayScore ?? 0}</span>
              </div>
              <div className="rounded border border-[#8a6d3b] bg-[#1a120b]/80 px-4 py-1.5 shadow-inner">
                <span className="font-mono text-xl font-bold text-[#e6c885] tracking-widest">
                    {match.elapsed ? `${match.elapsed}'` : '00:00'}
                </span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-1 flex-col items-center gap-4">
              {match.awayTeam.logo && (
                 <div className="relative group">
                   <div className="absolute inset-0 animate-pulse rounded-full bg-[#c5a059]/30 blur-xl group-hover:bg-[#c5a059]/50 transition-all" />
                  <img
                    src={match.awayTeam.logo}
                    alt={match.awayTeam.name}
                    className="relative h-24 w-24 md:h-32 md:w-32 object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <h2 className="text-2xl md:text-3xl font-bold font-oswald text-[#f4f1ea] uppercase tracking-wide drop-shadow-lg">{match.awayTeam.name}</h2>
            </div>
          </div>

          {/* Goals Scored */}
          {(match.goals?.length ?? 0) > 0 && (
            <div className="mt-12 border-t-2 border-[#8a6d3b]/50 pt-8">
              <div className="rounded-lg bg-[#1a120b]/40 p-4 backdrop-blur-sm">
                <GoalsList
                    goals={match.goals!}
                    homeTeamId={match.homeTeamId}
                    awayTeamId={match.awayTeamId}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Game Stats */}
        <div className="rounded-lg bg-[#2c241b] border-2 border-[#8a6d3b] shadow-lg overflow-hidden relative">
            <div className="bg-[#1a120b] border-b-2 border-[#8a6d3b] p-4 flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <h3 className="font-marker text-[#c5a059] text-2xl uppercase tracking-wide skew-x-[-5deg]">Game Stats</h3>
            </div>
            
            <div className="p-6 space-y-8 font-oswald">
                 {/* Possession Bar */}
                <div>
                  <div className="mb-2 flex justify-between text-base uppercase tracking-wider font-bold text-[#f4f1ea]">
                    <span>{match.homeTeam.name}</span>
                    <span className="text-[#c5a059]">Possession</span>
                    <span>{match.awayTeam.name}</span>
                  </div>
                  <div className="flex h-5 overflow-hidden border-2 border-[#8a6d3b] bg-[#1a120b] shadow-inner">
                    <div
                      className="bg-[#c5a059] relative transition-all duration-1000"
                      style={{ width: `${homePossession}%` }}
                    >
                         <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.2)_50%,transparent_75%)] bg-[length:10px_10px]" />
                    </div>
                    <div
                      className="bg-[#e63946] relative transition-all duration-1000"
                      style={{ width: `${awayPossession}%` }}
                    >
                         <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.2)_50%,transparent_75%)] bg-[length:10px_10px]" />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-sm font-mono text-[#e6c885]">
                    <span>{homePossession}%</span>
                    <span>{awayPossession}%</span>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="space-y-4">
                     <StatRow label="Shots on Target" home={match.stats?.home.shotsOnTarget} away={match.stats?.away.shotsOnTarget} />
                     <StatRow label="Total Shots" home={match.stats?.home.totalShots} away={match.stats?.away.totalShots} />
                     <StatRow label="Corner Kicks" home={match.stats?.home.corners} away={match.stats?.away.corners} />
                     <StatRow label="Fouls" home={match.stats?.home.fouls} away={match.stats?.away.fouls} />
                     <StatRow label="Cards" home={(match.cards?.filter(c => c.teamId === match.homeTeamId).length) ?? 0} away={(match.cards?.filter(c => c.teamId === match.awayTeamId).length) ?? 0} />
                </div>
            </div>
        </div>

        {/* Lineups Placeholder */}
        <div className="rounded-lg bg-[#2c241b] border-2 border-[#8a6d3b] shadow-lg overflow-hidden relative flex flex-col">
           <div className="bg-[#1a120b] border-b-2 border-[#8a6d3b] p-4 flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <h3 className="font-marker text-[#c5a059] text-2xl uppercase tracking-wide skew-x-[-5deg]">Lineups</h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-[#8a6d3b] bg-[url('/textures/grunge.png')] bg-cover bg-blend-multiply opacity-80">
                <p className="font-marker text-3xl opacity-50 skew-x-[-5deg] drop-shadow-md">Data Locked</p>
                <p className="text-sm uppercase tracking-[0.3em] mt-3 font-oswald text-[#e6c885]">Check back before kickoff</p>
            </div>
        </div>
      </div>
    </div>
  )
}

function StatRow({ label, home, away }: { label: string, home?: number, away?: number }) {
    return (
        <div className="flex items-center justify-between border-b border-[#8a6d3b]/20 py-3 last:border-0 hover:bg-[#c5a059]/5 transition-colors">
             <span className="font-mono font-bold w-12 text-center text-[#f4f1ea] text-lg">{home ?? 0}</span>
             <span className="text-xs md:text-sm uppercase tracking-widest text-[#8a6d3b] font-bold">{label}</span>
             <span className="font-mono font-bold w-12 text-center text-[#f4f1ea] text-lg">{away ?? 0}</span>
        </div>
    )
}
