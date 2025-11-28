'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { makeQueryClient } from '@/shared/lib/query-client'
import { useState } from 'react'

/**
 * QueryProvider - Proveedor de TanStack Query para la aplicación
 *
 * Este componente debe envolver toda la app para habilitar React Query.
 * Incluye React Query DevTools en desarrollo para debugging.
 *
 * Importante: Usa el patrón de crear el QueryClient dentro del componente
 * para evitar compartir el mismo cliente entre diferentes requests en SSR.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Crear QueryClient dentro del componente (no fuera)
  // Esto previene compartir el mismo cliente entre requests en el servidor
  const [queryClient] = useState(() => makeQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools solo visible en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}
