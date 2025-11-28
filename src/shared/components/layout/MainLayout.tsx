'use client'

import React from 'react'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

/**
 * MainLayout - Layout principal con Sidebar
 *
 * Estructura de la aplicación:
 * - Sidebar fijo a la izquierda (64px de ancho en desktop)
 * - Contenido principal con padding automático
 * - Responsive: sidebar colapsable en mobile
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido Principal */}
      <main className="flex-1 lg:ml-64">
        {/* Padding superior en mobile para evitar overlap con botón hamburguesa */}
        <div className="container mx-auto min-h-screen px-4 pb-8 pt-16 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
