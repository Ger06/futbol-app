import React from 'react'

/**
 * Footer - Pie de página de la aplicación
 *
 * Muestra información básica y links útiles
 */
export function Footer() {
  const currentYear = new Date().getFullYear()
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Fútbol en Vivo'

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3">
          {/* Columna 1: Información */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">
              {siteName}
            </h3>
            <p className="text-sm text-gray-600">
              Resultados en vivo, fixtures, posiciones y estadísticas de fútbol.
            </p>
          </div>

          {/* Columna 2: Ligas */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">
              Competiciones
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Champions League</li>
              <li>Premier League</li>
              <li>La Liga</li>
              <li>Serie A</li>
              <li>Liga Profesional Argentina</li>
              <li>Brasileirão</li>
              <li>MLS</li>
            </ul>
          </div>

          {/* Columna 3: Info */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">
              Información
            </h3>
            <p className="text-sm text-gray-600">
              Datos proporcionados por API-Football
            </p>
            <p className="mt-4 text-xs text-gray-500">
              © {currentYear} {siteName}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
