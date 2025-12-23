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
    <footer className="border-t-4 border-[#8a6d3b] bg-[#1a120b] text-[#f4f1ea] relative overflow-hidden">
      {/* Texture Overlay */}
      <div className="absolute inset-0 bg-[url('/textures/grunge.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3">
          {/* Columna 1: Información */}
          <div>
            <h3 className="mb-4 text-xl font-bold font-marker text-[#c5a059] uppercase tracking-wide">
              {siteName}
            </h3>
            <p className="text-sm text-[#e6c885]/80 font-oswald tracking-wide">
              Resultados en vivo, fixtures, posiciones y estadísticas de fútbol.
            </p>
          </div>

          {/* Columna 2: Ligas */}
          <div>
            <h3 className="mb-4 text-lg font-bold font-oswald text-[#c5a059] uppercase tracking-wider">
              Competiciones
            </h3>
            <ul className="space-y-2 text-sm text-[#f4f1ea]/70 font-oswald">
              <li className="hover:text-[#c5a059] transition-colors cursor-pointer">Champions League</li>
              <li className="hover:text-[#c5a059] transition-colors cursor-pointer">Premier League</li>
              <li className="hover:text-[#c5a059] transition-colors cursor-pointer">La Liga</li>
              <li className="hover:text-[#c5a059] transition-colors cursor-pointer">Serie A</li>
              <li className="hover:text-[#c5a059] transition-colors cursor-pointer">Liga Profesional Argentina</li>
              <li className="hover:text-[#c5a059] transition-colors cursor-pointer">Brasileirão</li>
              <li className="hover:text-[#c5a059] transition-colors cursor-pointer">MLS</li>
            </ul>
          </div>

          {/* Columna 3: Info */}
          <div>
            <h3 className="mb-4 text-lg font-bold font-oswald text-[#c5a059] uppercase tracking-wider">
              Información
            </h3>
            <p className="text-sm text-[#f4f1ea]/70 font-oswald">
              Datos proporcionados por API-Football
            </p>
            <div className="mt-6 flex items-center space-x-2">
               <span className="text-2xl">⚽</span>
               <p className="text-xs text-[#8a6d3b] font-marker uppercase">
                © {currentYear} {siteName}. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
