import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

/**
 * LoadingSpinner - Indicador de carga animado
 *
 * @param size - Tamaño del spinner: sm (16px), md (24px), lg (40px)
 * @param className - Clases CSS adicionales
 * @param text - Texto opcional a mostrar debajo del spinner
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" text="Cargando partidos..." />
 * ```
 */
export function LoadingSpinner({
  size = 'md',
  className = '',
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-4',
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-gray-300 border-t-blue-600`}
        role="status"
        aria-label="Cargando"
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  )
}

/**
 * LoadingPage - Spinner de página completa
 *
 * Útil para mostrar mientras se carga una página completa
 *
 * @example
 * ```tsx
 * if (isLoading) return <LoadingPage />
 * ```
 */
export function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner size="lg" text="Cargando..." />
    </div>
  )
}

/**
 * LoadingSection - Spinner para secciones
 *
 * Útil para mostrar mientras se carga una sección específica
 *
 * @example
 * ```tsx
 * if (isLoading) return <LoadingSection />
 * ```
 */
export function LoadingSection() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <LoadingSpinner size="md" />
    </div>
  )
}
