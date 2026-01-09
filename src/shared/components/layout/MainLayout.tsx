'use client'

import React from 'react'
import { Sidebar } from './Sidebar'
import { BackgroundController } from './BackgroundController'

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
    <div className="flex min-h-screen max-w-1440 justify-center">
      <BackgroundController />
      
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido Principal */}
      <main className="flex w-full flex-1 flex-col">
        {/* Padding superior en mobile para evitar overlap con botón hamburguesa */}
        <div className="container mx-auto px-4 pt-16 lg:px-8 lg:pt-4">
          {children}
        </div>
      </main>
    </div>
  )
}
