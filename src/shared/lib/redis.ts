import { Redis } from '@upstash/redis'

// Cliente de Upstash Redis para cache
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Tipos para cache
export type CacheOptions = {
  ttl?: number // Time to live en segundos
}

/**
 * Obtiene un valor del cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key)
    return data
  } catch (error) {
    console.error('Error getting cache:', error)
    return null
  }
}

/**
 * Guarda un valor en cache con TTL opcional
 */
export async function setCache<T>(
  key: string,
  value: T,
  options?: CacheOptions
): Promise<void> {
  try {
    if (options?.ttl) {
      await redis.setex(key, options.ttl, JSON.stringify(value))
    } else {
      await redis.set(key, JSON.stringify(value))
    }
  } catch (error) {
    console.error('Error setting cache:', error)
  }
}

/**
 * Elimina una key del cache
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Error deleting cache:', error)
  }
}

/**
 * Elimina múltiples keys por patrón
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Error deleting cache pattern:', error)
  }
}

/**
 * Helper para cache con función fallback
 * Si no existe en cache, ejecuta la función y guarda el resultado
 */
export async function cacheOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  // Intentar obtener del cache
  const cached = await getCache<T>(key)
  if (cached !== null) {
    return cached
  }

  // Si no está en cache, ejecutar función
  const data = await fetchFn()

  // Guardar en cache
  await setCache(key, data, options)

  return data
}

// Configuración de TTLs desde variables de entorno
export const CACHE_TTL = {
  LIVE_MATCHES: parseInt(process.env.CACHE_LIVE_MATCHES || '30'),
  FIXTURES: parseInt(process.env.CACHE_FIXTURES || '86400'),
  STANDINGS: parseInt(process.env.CACHE_STANDINGS || '3600'),
  FINISHED_MATCHES: parseInt(process.env.CACHE_FINISHED_MATCHES || '2592000'),
} as const

/**
 * TTL específicos para estadísticas de partidos según su status
 */
export const STATS_CACHE_TTL = {
  'FT': 30 * 24 * 60 * 60,   // 30 días - Partidos finalizados
  'AET': 30 * 24 * 60 * 60,  // 30 días - Después de tiempo extra
  'PEN': 30 * 24 * 60 * 60,  // 30 días - Después de penales
  'LIVE': 30,                 // 30 segundos - Partidos en vivo
  'HT': 30,                   // 30 segundos - Medio tiempo
  '1H': 30,                   // 30 segundos - Primer tiempo
  '2H': 30,                   // 30 segundos - Segundo tiempo
  'NS': 60 * 60,              // 1 hora - No iniciado
  'TBD': 60 * 60,             // 1 hora - Por definir
  'PST': 24 * 60 * 60,        // 24 horas - Pospuesto
  'CANC': 24 * 60 * 60,       // 24 horas - Cancelado
  'ABD': 24 * 60 * 60,        // 24 horas - Abandonado
} as const

/**
 * Helper: Obtiene el TTL apropiado para estadísticas según status del partido
 */
export function getStatsCacheTTL(status: string): number {
  return STATS_CACHE_TTL[status as keyof typeof STATS_CACHE_TTL] || 60 * 60 // Default: 1 hora
}

export default redis
