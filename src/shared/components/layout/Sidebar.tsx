'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LEAGUES_CONFIG } from '@/shared/constants/leagues'
import { WorldCupCountdown } from './WorldCupCountdown'

interface SidebarProps {
  className?: string
}

/**
 * Sidebar - Navegación lateral con ligas
 *
 * Muestra las 7 competiciones principales con:
 * - Íconos y nombres de liga
 * - Resaltado de liga activa
 * - Versión colapsable en mobile
 * - Link a Home en la parte superior
 */
export function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Determinar qué liga está activa basado en la URL
  const activeLeagueSlug = pathname.split('/')[1] || null

  return (
    <>
      {/* Botón hamburguesa - Solo visible en mobile */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-[#c5a059] p-2 shadow-lg lg:hidden"
        aria-label="Toggle sidebar"
      >
        <svg
          className="h-6 w-6 text-[#2c241b]"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay para mobile - Click fuera cierra el sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 h-screen w-64
          transform bg-[#1a120b] border-r-4 border-[#8a6d3b]
          text-[#f4f1ea] shadow-2xl transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${className}
          pt-4
        `}
      >
        {/* Header del Sidebar */}
        <div className="border-b-2 border-[#8a6d3b] p-6 bg-[url('/textures/grunge.png')] bg-cover relative overflow-hidden">
            <div className="absolute inset-0 bg-[#c5a059]/10 pointer-events-none" />
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 transition-transform hover:scale-105 relative z-10"
          >
            <span className="text-3xl drop-shadow-md">⚽</span>
            <div>
              <h1 className="text-2xl font-bold font-marker text-[#c5a059] tracking-wider drop-shadow-sm uppercase skew-x-[-10deg]">Futbol Live</h1>
              <p className="text-xs text-[#e6c885] font-oswald uppercase tracking-widest">Road to Cup</p>
            </div>
          </Link>
        </div>

        {/* Navegación de Ligas */}
        <nav className="overflow-y-auto p-4 font-oswald" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <WorldCupCountdown />
          <div className="mb-3 px-3 text-sm font-bold uppercase tracking-widest text-[#8a6d3b] border-b border-[#8a6d3b]/30 pb-1">
            Competiciones
          </div>

          <ul className="space-y-2">
            {LEAGUES_CONFIG.map((league) => {
              const isActive = activeLeagueSlug === league.slug

              return (
                <li key={league.slug}>
                  <Link
                    href={`/${league.slug}`}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group flex items-center space-x-3 px-3 py-3
                      transition-all duration-200 uppercase tracking-wide
                      ${
                        isActive
                          ? 'bg-[#c5a059] text-[#1a120b] font-bold skew-x-[-10deg] shadow-[2px_2px_0px_#8a6d3b]'
                          : 'text-[#e6c885] hover:text-white hover:bg-[#c5a059]/20 hover:skew-x-[-5deg]'
                      }
                    `}
                    style={
                      isActive
                        ? {
                            borderLeft: `none`, // Removed default border, using full highlight
                            clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0% 100%)' 
                          }
                        : {}
                    }
                  >
                    {/* Ícono */}
                    <span className={`text-2xl transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                      {league.icon}
                    </span>

                    {/* Nombre */}
                    <div className={`flex-1 ${isActive ? 'skew-x-[10deg]' : 'group-hover:skew-x-[5deg]'}`}> {/* Counter-skew text */}
                      <div className="text-sm leading-tight">{league.shortName}</div>
                      <div className={`text-[10px] ${isActive ? 'text-[#2c241b]' : 'text-[#8a6d3b]'}`}>{league.country}</div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Link a "Todos los partidos" */}
          <div className="mt-6 border-t-2 border-[#8a6d3b] pt-4">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center space-x-3 px-3 py-3
                transition-all duration-200 uppercase tracking-wide font-oswald
                ${
                  pathname === '/'
                    ? 'bg-[#e63946] text-white font-bold skew-x-[-10deg] shadow-[2px_2px_0px_#1a120b]'
                    : 'text-[#e6c885] hover:text-white hover:bg-[#e63946]/20 hover:skew-x-[-5deg]'
                }
              `}
              style={pathname === '/' ? { clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0% 100%)' } : {}}
            >
              <span className="text-2xl">📅</span>
              <div className={`flex-1 ${pathname === '/' ? 'skew-x-[10deg]' : 'group-hover:skew-x-[5deg]'}`}>
                <div className="text-sm leading-tight">Todos los partidos</div>
                <div className={`text-[10px] ${pathname === '/' ? 'text-white/80' : 'text-[#8a6d3b]'}`}>Hoy</div>
              </div>
            </Link>
          </div>
        </nav>

        {/* Footer del Sidebar */}
        {/*<div className="absolute bottom-0 left-0 right-0 border-t-2 border-[#8a6d3b] bg-[#2c241b] p-4">
          <p className="text-center text-xs text-[#8a6d3b] font-marker uppercase">
            Temporada 98/99
          </p>
        </div>*/}
      </aside>
    </>
  )
}
