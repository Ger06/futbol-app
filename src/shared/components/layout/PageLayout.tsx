import React from 'react'
import { Footer } from './Footer'

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

/**
 * PageLayout - Layout principal de páginas
 *
 * Versión simplificada sin Header/Navigation (ahora manejados por MainLayout/Sidebar)
 * Incluye solo título/descripción y Footer
 *
 * @param children - Contenido de la página
 * @param title - Título opcional a mostrar en la página
 * @param description - Descripción opcional
 *
 * @example
 * ```tsx
 * <PageLayout title="Partidos de Hoy">
 *   <MatchesContainer />
 * </PageLayout>
 * ```
 */
export function PageLayout({
  children,
  title,
  description,
}: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Page Header */}
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            )}
            {description && (
              <p className="mt-2 text-gray-600">{description}</p>
            )}
          </div>
        )}

        {/* Page Content */}
        {children}
      </main>

      <Footer />
    </div>
  )
}
