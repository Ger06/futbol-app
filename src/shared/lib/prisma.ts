import { PrismaClient } from '@/generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool } from '@neondatabase/serverless'

// PrismaClient es attached al objeto `global` en desarrollo para prevenir
// exhaustar el límite de conexiones a la base de datos.
// Aprende más: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Función para crear el cliente de Prisma con lazy initialization
function createPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  // Obtener DATABASE_URL en runtime, no en import time
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    throw new Error('DATABASE_URL no está definida en las variables de entorno')
  }

  const adapter = new PrismaNeon({ connectionString })

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }

  return client
}

// Exportar un Proxy que crea el cliente solo cuando se accede
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = createPrismaClient()
    return (client as any)[prop]
  },
})

export default prisma
