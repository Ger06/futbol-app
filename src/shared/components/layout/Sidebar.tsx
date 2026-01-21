'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

  // Bloquear scroll del body cuando el sidebar está abierto en mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      {/* Header Mobile - Muestra logo y botón hamburguesa */}
      <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b-2 border-[#8a6d3b] bg-[#1a120b] px-4 shadow-lg lg:hidden">
        {/* Botón hamburguesa */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 text-[#c5a059] hover:bg-[#c5a059]/10"
          aria-label="Open sidebar"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo Centrado */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
          <Link href="/" onClick={() => setIsOpen(false)} className="block h-10 w-auto">
            <Image 
              src="/logos/hagangol-icon-dark.jpg" 
              alt="HaganGol Icon" 
              width={40}
              height={40}
              className="h-full w-auto object-contain drop-shadow-lg rounded-full"
              priority
            />
          </Link>
        </div>

        {/* Spacer para balancear el layout */}
        <div className="w-10"></div>
      </header>

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
          fixed inset-y-0 left-0 z-40 h-screen w-64 overflow-y-auto
          transform bg-[#1a120b] border-r-4 border-[#8a6d3b]
          text-[#f4f1ea] shadow-2xl transition-transform duration-300 ease-in-out
          lg:sticky lg:top-0 lg:translate-x-0 lg:h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${className}
          pt-4
        `}
      >
        <div className="border-b-2 border-[#8a6d3b] p-6 bg-[url('/textures/grunge.png')] bg-cover relative overflow-hidden">
            <div className="absolute inset-0 bg-[#c5a059]/10 pointer-events-none" />
            
            {/* Botón Cerrar (Mobile) */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-2 top-2 z-20 rounded-full p-2 text-[#c5a059] hover:bg-[#c5a059]/20 lg:hidden"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 transition-transform relative z-10"
          >
            <div className="relative z-10">
               <Image 
                 src="/logos/newhagangol.png" 
                 alt="HaganGol Logo" 
                 width={180} 
                 height={60} 
                 className="drop-shadow-lg transition-transform"
                 priority
               />
            </div>
          </Link>
        </div>

        {/* Navegación de Ligas */}
        <nav className="p-4 font-oswald">
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
          <div className="mt-6 border-t-2 border-[#8a6d3b] pt-4 space-y-2">
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

            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center space-x-3 px-3 py-3
                transition-all duration-200 uppercase tracking-wide font-oswald
                ${
                  pathname === '/contact'
                    ? 'bg-[#2c241b] text-[#c5a059] font-bold skew-x-[-10deg] border-2 border-[#c5a059]'
                    : 'text-[#e6c885] hover:text-[#c5a059] hover:bg-[#c5a059]/10 hover:skew-x-[-5deg]'
                }
              `}
            >
              <span className="text-2xl">📩</span>
              <div className={`flex-1 ${pathname === '/contact' ? 'skew-x-[10deg]' : 'group-hover:skew-x-[5deg]'}`}>
                <div className="text-sm leading-tight text-[#f4f1ea]">¿Tenés dudas?</div>
                <div className="text-[10px] text-[#c5a059]">Mejoras? Escribime</div>
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
