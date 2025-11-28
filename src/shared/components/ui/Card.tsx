import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

/**
 * Card - Contenedor de contenido con estilo de tarjeta
 *
 * @param children - Contenido de la tarjeta
 * @param className - Clases CSS adicionales
 * @param onClick - Función a ejecutar al hacer click
 * @param hoverable - Si debe tener efecto hover
 *
 * @example
 * ```tsx
 * <Card hoverable onClick={() => router.push('/match/123')}>
 *   <h3>Real Madrid vs Barcelona</h3>
 *   <p>2-1</p>
 * </Card>
 * ```
 */
export function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
}: CardProps) {
  const hoverClass = hoverable
    ? 'hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer'
    : ''

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${hoverClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

/**
 * CardHeader - Encabezado de tarjeta
 */
export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-3 border-b border-gray-100 pb-2 ${className}`}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

/**
 * CardTitle - Título de tarjeta
 */
export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

/**
 * CardContent - Contenido principal de tarjeta
 */
export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

/**
 * CardFooter - Pie de tarjeta
 */
export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-3 border-t border-gray-100 pt-2 ${className}`}>
      {children}
    </div>
  )
}
