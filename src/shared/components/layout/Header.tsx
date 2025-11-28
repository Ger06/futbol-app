'use client'

import React from 'react'
import Link from 'next/link'
import { useLiveMatchesCount } from '@/matches/hooks'
import { LiveBadge } from '@/shared/components/ui/Badge'

/**
 * Header - Encabezado principal de la aplicación
 *
 * Incluye:
 * - Logo/Nombre del sitio
 * - Indicador de partidos en vivo
 * - Navegación principal (en mobile se puede colapsar)
 */
export function Header() {
  const liveCount = useLiveMatchesCount()
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Fútbol en Vivo'

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
              <span className="text-2xl font-bold text-white">⚽</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">{siteName}</h1>
              <p className="text-xs text-gray-500">Resultados en vivo</p>
            </div>
          </Link>

          {/* Live Indicator */}
          {liveCount > 0 && (
            <div className="flex items-center gap-2">
              <LiveBadge />
              <span className="hidden text-sm font-medium text-gray-700 sm:inline">
                {liveCount} {liveCount === 1 ? 'partido' : 'partidos'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
