import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind con conflictos resueltos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha en formato legible
 */
export function formatDate(date: Date | string, locale: string = 'es-AR'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formatea una hora
 */
export function formatTime(date: Date | string, locale: string = 'es-AR'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formatea fecha y hora juntos
 */
export function formatDateTime(date: Date | string, locale: string = 'es-AR'): string {
  return `${formatDate(date, locale)} - ${formatTime(date, locale)}`
}

/**
 * Obtiene el día de hoy en formato YYYY-MM-DD
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Obtiene fecha relativa (ayer, hoy, mañana)
 */
export function getRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dateStr = dateObj.toDateString()
  const todayStr = today.toDateString()
  const yesterdayStr = yesterday.toDateString()
  const tomorrowStr = tomorrow.toDateString()

  if (dateStr === todayStr) return 'Hoy'
  if (dateStr === yesterdayStr) return 'Ayer'
  if (dateStr === tomorrowStr) return 'Mañana'

  return formatDate(dateObj)
}

/**
 * Calcula días entre dos fechas
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay))
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return dateObj.toDateString() === today.toDateString()
}

/**
 * Genera un rango de fechas
 */
export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(start)

  while (currentDate <= end) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

/**
 * Convierte minutos a formato MM:SS
 */
export function formatMinutes(minutes: number, extraTime?: number): string {
  if (extraTime) {
    return `${minutes}+${extraTime}'`
  }
  return `${minutes}'`
}

/**
 * Obtiene color para el tipo de tarjeta
 */
export function getCardColor(cardType: string): string {
  switch (cardType.toLowerCase()) {
    case 'yellow':
      return 'bg-yellow-400'
    case 'red':
      return 'bg-red-600'
    default:
      return 'bg-gray-400'
  }
}

/**
 * Obtiene texto del status del partido
 */
export function getMatchStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'NS': 'Por jugar',
    'LIVE': 'En vivo',
    'HT': 'Descanso',
    'FT': 'Finalizado',
    'AET': 'Finalizado (Alargue)',
    'PEN': 'Finalizado (Penales)',
    'PST': 'Pospuesto',
    'CANC': 'Cancelado',
    'ABD': 'Abandonado',
  }

  return statusMap[status] || status
}

/**
 * Obtiene color para el status del partido
 */
export function getMatchStatusColor(status: string): string {
  switch (status) {
    case 'LIVE':
    case 'HT':
      return 'text-red-600 font-bold animate-pulse'
    case 'FT':
    case 'AET':
    case 'PEN':
      return 'text-gray-600'
    case 'NS':
      return 'text-blue-600'
    default:
      return 'text-gray-500'
  }
}

/**
 * Abrevia nombre de equipo si es muy largo
 */
export function abbreviateTeamName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) return name
  return `${name.substring(0, maxLength)}...`
}

/**
 * Genera clave de cache para Redis
 */
export function getCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`
}

/**
 * Delay helper para testing
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Manejo de errores genérico
 */
export function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'Ha ocurrido un error desconocido'
}

/**
 * Valida si una string es una URL válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
