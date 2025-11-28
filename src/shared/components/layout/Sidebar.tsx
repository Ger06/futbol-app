'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LEAGUES_CONFIG } from '@/shared/constants/leagues'

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
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-lg lg:hidden"
        aria-label="Toggle sidebar"
      >
        <svg
          className="h-6 w-6 text-gray-700"
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
          fixed left-0 top-0 z-40 h-screen w-64
          transform bg-gradient-to-b from-gray-900 to-gray-800
          text-white shadow-2xl transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${className}
        `}
      >
        {/* Header del Sidebar */}
        <div className="border-b border-gray-700 p-6">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 transition-opacity hover:opacity-80"
          >
            <span className="text-3xl">⚽</span>
            <div>
              <h1 className="text-xl font-bold">Futbol Live</h1>
              <p className="text-xs text-gray-400">Partidos en vivo</p>
            </div>
          </Link>
        </div>

        {/* Navegación de Ligas */}
        <nav className="overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Competiciones
          </div>

          <ul className="space-y-1">
            {LEAGUES_CONFIG.map((league) => {
              const isActive = activeLeagueSlug === league.slug

              return (
                <li key={league.slug}>
                  <Link
                    href={`/${league.slug}`}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group flex items-center space-x-3 rounded-lg px-3 py-3
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-white/10 font-semibold text-white shadow-lg'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }
                    `}
                    style={
                      isActive
                        ? {
                            borderLeft: `4px solid ${league.color}`,
                            paddingLeft: 'calc(0.75rem - 4px)',
                          }
                        : {}
                    }
                  >
                    {/* Ícono */}
                    <span className="text-2xl transition-transform group-hover:scale-110">
                      {league.icon}
                    </span>

                    {/* Nombre */}
                    <div className="flex-1">
                      <div className="text-sm leading-tight">{league.shortName}</div>
                      <div className="text-xs text-gray-400">{league.country}</div>
                    </div>

                    {/* Indicador activo */}
                    {isActive && (
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Link a "Todos los partidos" */}
          <div className="mt-6 border-t border-gray-700 pt-4">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center space-x-3 rounded-lg px-3 py-3
                transition-all duration-200
                ${
                  pathname === '/'
                    ? 'bg-white/10 font-semibold text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <span className="text-2xl">📅</span>
              <div className="flex-1">
                <div className="text-sm leading-tight">Todos los partidos</div>
                <div className="text-xs text-gray-400">Hoy</div>
              </div>
            </Link>
          </div>
        </nav>

        {/* Footer del Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-700 bg-gray-900/50 p-4">
          <p className="text-center text-xs text-gray-500">
            Temporada 2022/23
          </p>
        </div>
      </aside>
    </>
  )
}
