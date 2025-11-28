/**
 * Script para testear conexiones a todos los servicios externos
 * Ejecutar con: npx dotenv -e .env.local -- npx tsx scripts/test-connections.ts
 */

import prisma from '../src/shared/lib/prisma'
import { redis } from '../src/shared/lib/redis'
import { apiFootballClient, getLeague, getFixtures } from '../src/shared/lib/api-football'
import { getAllHighlights } from '../src/shared/lib/scorebat'

// Verificar que las variables de entorno estén cargadas
function checkEnvVars() {
  const required = ['DATABASE_URL', 'API_FOOTBALL_KEY', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN']
  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missing.join(', '))
    console.error('💡 Ejecuta: npx dotenv -e .env.local -- npx tsx scripts/test-connections.ts')
    process.exit(1)
  }

  console.log('✅ Variables de entorno cargadas correctamente')
}

async function testDatabaseConnection() {
  console.log('\n🔍 Testeando conexión a Neon PostgreSQL...')
  try {
    await prisma.$connect()
    console.log('✅ Neon PostgreSQL: Conexión exitosa')

    // Intentar crear una liga de prueba
    const testLeague = await prisma.league.findFirst()
    if (!testLeague) {
      console.log('📝 Base de datos vacía (sin ligas aún)')
    } else {
      console.log(`📊 Base de datos con datos: ${testLeague.name}`)
    }

    await prisma.$disconnect()
    return true
  } catch (error) {
    console.error('❌ Error con Neon PostgreSQL:', error)
    return false
  }
}

async function testRedisConnection() {
  console.log('\n🔍 Testeando conexión a Upstash Redis...')
  try {
    // Escribir un valor de prueba
    await redis.set('test-connection', 'OK')

    // Leer el valor
    const value = await redis.get('test-connection')

    if (value === 'OK') {
      console.log('✅ Upstash Redis: Conexión exitosa')

      // Limpiar
      await redis.del('test-connection')
      return true
    } else {
      console.error('❌ Upstash Redis: Valor no coincide')
      return false
    }
  } catch (error) {
    console.error('❌ Error con Upstash Redis:', error)
    return false
  }
}

async function testApiFootballConnection() {
  console.log('\n🔍 Testeando conexión a API-Football...')
  try {
    // Intentar obtener información de la Premier League (season 2023 para plan FREE)
    const response = await getLeague(39, 2022)

    if (response && response.results > 0) {
      console.log('✅ API-Football: Conexión exitosa')
      console.log(`📊 Liga obtenida: ${response.response[0].league.standings[0].map(item => item.team.name).join(', ')}`)
      
      console.log(`📅 Temporada: 2023 (Plan FREE solo 2021-2023)`)

      // Test fixtures
      console.log('   Testing fixtures endpoint...')
      const fixtures = await getFixtures(39, 2022)
      if (fixtures && fixtures.results > 0) {
        console.log(`   ✅ Fixtures obtained: ${fixtures.results}`)
      } else {
        console.error('   ❌ Fixtures: No results')
      }

      return true
    } else {
      console.error('❌ API-Football: Sin resultados')
      return false
    }
  } catch (error: any) {
    console.error('❌ Error con API-Football:', error?.message || error)
    if (error?.message?.includes('401')) {
      console.error('   💡 Verifica que tu API_FOOTBALL_KEY sea correcta')
    }
    if (error?.message?.includes('429')) {
      console.error('   💡 Has excedido el límite de requests (100/día en plan free)')
    }
    if (error?.message?.includes('403')) {
      console.error('   💡 Plan FREE: Solo temporadas 2021-2023 disponibles')
    }
    return false
  }
}

async function testScorebatConnection() {
  console.log('\n🔍 Testeando conexión a Scorebat API...')
  try {
    const highlights = await getAllHighlights()

    if (highlights && highlights.length > 0) {
      console.log('✅ Scorebat API: Conexión exitosa')
      console.log(`📺 Videos disponibles: ${highlights.length}`)
      console.log(`📹 Último video: ${highlights[0]?.title || 'N/A'}`)
      return true
    } else {
      console.error('❌ Scorebat API: Sin videos disponibles')
      return false
    }
  } catch (error) {
    console.error('❌ Error con Scorebat API:', error)
    return false
  }
}

async function main() {
  checkEnvVars()

  console.log('🚀 Iniciando pruebas de conexión a servicios externos...')
  console.log('=' .repeat(60))

  const results = {
    database: await testDatabaseConnection(),
    redis: await testRedisConnection(),
    apiFootball: await testApiFootballConnection(),
    scorebat: await testScorebatConnection(),
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE PRUEBAS')
  console.log('='.repeat(60))
  console.log(`Neon PostgreSQL:  ${results.database ? '✅ OK' : '❌ FALLO'}`)
  console.log(`Upstash Redis:    ${results.redis ? '✅ OK' : '❌ FALLO'}`)
  console.log(`API-Football:     ${results.apiFootball ? '✅ OK' : '❌ FALLO'}`)
  console.log(`Scorebat API:     ${results.scorebat ? '✅ OK' : '❌ FALLO'}`)
  console.log('='.repeat(60))

  const allPassed = Object.values(results).every(result => result === true)

  if (allPassed) {
    console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! El sistema está listo.')
    console.log('✅ Puedes empezar a desarrollar las páginas y componentes.\n')
  } else {
    console.log('\n⚠️  ALGUNAS PRUEBAS FALLARON')
    console.log('📝 Revisa los errores arriba y verifica tus credenciales en .env.local\n')
    process.exit(1)
  }
}

main()
  .catch((error) => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
