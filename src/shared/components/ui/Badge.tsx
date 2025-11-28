import React from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
}

/**
 * Badge - Componente de etiqueta/insignia
 *
 * @param children - Contenido del badge
 * @param variant - Variante de color: default, success, warning, danger, info
 * @param size - Tamaño: sm, md, lg
 * @param className - Clases CSS adicionales
 *
 * @example
 * ```tsx
 * <Badge variant="success">En Vivo</Badge>
 * <Badge variant="warning">Entretiempo</Badge>
 * <Badge variant="danger">Cancelado</Badge>
 * ```
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  }

  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  )
}

/**
 * LiveBadge - Badge específico para partidos en vivo
 *
 * Incluye animación de pulso para llamar la atención
 *
 * @example
 * ```tsx
 * {match.status === 'LIVE' && <LiveBadge />}
 * ```
 */
export function LiveBadge() {
  return (
    <Badge variant="danger" size="sm" className="animate-pulse">
      <span className="mr-1">●</span>
      EN VIVO
    </Badge>
  )
}

/**
 * StatusBadge - Badge para mostrar el estado de un partido
 *
 * @param status - Estado del partido (NS, LIVE, HT, FT, etc.)
 *
 * @example
 * ```tsx
 * <StatusBadge status={match.status} />
 * ```
 */
export function StatusBadge({ status }: { status: string }) {
  const getVariantAndText = (
    status: string
  ): { variant: BadgeVariant; text: string } => {
    switch (status) {
      case 'NS':
        return { variant: 'default', text: 'Por Jugar' }
      case 'LIVE':
        return { variant: 'danger', text: '● EN VIVO' }
      case 'HT':
        return { variant: 'warning', text: 'Entretiempo' }
      case 'FT':
        return { variant: 'success', text: 'Finalizado' }
      case 'AET':
        return { variant: 'success', text: 'Final (Prórroga)' }
      case 'PEN':
        return { variant: 'success', text: 'Final (Penales)' }
      case 'PST':
        return { variant: 'warning', text: 'Pospuesto' }
      case 'CANC':
        return { variant: 'danger', text: 'Cancelado' }
      case 'ABD':
        return { variant: 'danger', text: 'Abandonado' }
      default:
        return { variant: 'default', text: status }
    }
  }

  const { variant, text } = getVariantAndText(status)

  return (
    <Badge
      variant={variant}
      size="sm"
      className={status === 'LIVE' ? 'animate-pulse' : ''}
    >
      {text}
    </Badge>
  )
}
