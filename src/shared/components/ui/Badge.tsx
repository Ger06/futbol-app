import React from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  style?: React.CSSProperties
}

/**
 * Badge - Componente de etiqueta/insignia
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  style,
}: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-400 text-red-800 border-red-200',
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
      style={style}
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
      VIVO
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
export function StatusBadge({ status, theme = 'default', elapsed }: { status: string; theme?: 'default' | 'retro'; elapsed?: number }) {
  const getVariantAndText = (
    status: string
  ): { variant: BadgeVariant; text: string; className?: string; style?: React.CSSProperties } => {
    if (theme === 'retro') {
      const retroPadding = { padding: '4px 12px' }
      switch (status) {
        case 'NS':
          return { variant: 'default', text: 'Por Jugar', className: 'bg-[#1a120b] text-[#c5a059] border-[#8a6d3b]', style: retroPadding }
        case 'LIVE':
          const liveText = elapsed ? `EN VIVO ${elapsed}'` : 'EN VIVO'
          return { variant: 'danger', text: liveText, className: 'bg-[#ef4444] text-white border-[#991b1b] animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]', style: retroPadding }
        case 'HT':
          return { variant: 'warning', text: 'Entretiempo', className: 'bg-[#8a6d3b] text-[#f4f1ea] border-[#c5a059]', style: retroPadding }
        case 'FT':
          return { variant: 'success', text: 'Finalizado', className: 'bg-[#c5a059] text-[#1a120b] border-[#8a6d3b] font-bold shadow-md', style: retroPadding }
        case 'AET':
          return { variant: 'success', text: 'Final (Prórroga)', className: 'bg-[#c5a059] text-[#1a120b] border-[#8a6d3b] font-bold', style: retroPadding }
        case 'PEN':
          return { variant: 'success', text: 'Final (Penales)', className: 'bg-[#c5a059] text-[#1a120b] border-[#8a6d3b] font-bold', style: retroPadding }
        case 'PST':
          return { variant: 'warning', text: 'Pospuesto', className: 'bg-[#1a120b] text-[#c5a059] border-[#8a6d3b] opacity-80', style: retroPadding }
        case 'CANC':
          return { variant: 'danger', text: 'Cancelado', className: 'bg-[#1a120b] text-red-500 border-red-900 opacity-80', style: retroPadding }
        case 'ABD':
          return { variant: 'danger', text: 'Abandonado', className: 'bg-[#1a120b] text-red-500 border-red-900 opacity-80', style: retroPadding }
        default:
          return { variant: 'default', text: status, className: 'bg-[#1a120b] text-[#c5a059] border-[#8a6d3b]', style: retroPadding }
      }
    }

    // Default theme logic
    switch (status) {
      case 'NS':
        return { variant: 'default', text: 'Por Jugar' }
      case 'LIVE':
        return { variant: 'danger', text: elapsed ? `● EN VIVO ${elapsed}'` : '● EN VIVO' }
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

  const { variant, text, className, style } = getVariantAndText(status)

  return (
    <Badge
      variant={variant}
      size="sm"
      className={`${status === 'LIVE' ? 'animate-pulse' : ''} ${className || ''}`}
      style={style}
    >
      {text}
    </Badge>
  )
}
