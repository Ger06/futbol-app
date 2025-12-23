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
  hoverable = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden bg-[#2c241b] /* Fondo oscuro grunge */
        border-l-4 border-[#c5a059] /* Borde dorado a la izquierda */
        p-5 shadow-lg
        transition-all duration-200
        ${
          hoverable
            ? 'cursor-pointer hover:-translate-y-1 hover:bg-[#3d3226] hover:shadow-[4px_4px_0px_#8a6d3b] hover:border-[#e6c885]'
            : ''
        }
        ${className}
      `}
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%)'
      }}
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
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-[#8a6d3b] opacity-50" />
      
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
