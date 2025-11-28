'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href: string
  icon?: string
}

const navItems: NavItem[] = [
  { label: 'Inicio', href: '/', icon: '🏠' },
  { label: 'Resultados', href: '/results', icon: '📊' },
  { label: 'Fixtures', href: '/fixtures', icon: '📅' },
  { label: 'Posiciones', href: '/standings', icon: '🏆' },
  { label: 'Videos', href: '/videos', icon: '🎥' },
]

/**
 * Navigation - Barra de navegación principal
 *
 * Muestra links de navegación con indicador de página activa
 */
export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
