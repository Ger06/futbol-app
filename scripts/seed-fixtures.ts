import dotenv from 'dotenv'
import path from 'path'
import { prisma } from '../src/shared/lib/prisma'
import { getFixtures, LEAGUE_IDS } from '../src/shared/lib/api-football'

// Load .env.local file FIRST before importing Prisma Client
dotenv.config({ path: path.join(__dirname, '../.env.local') })

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local')
}

//const TARGET_DATE = '2023-08-15' // Fecha de inicio de temporada 2023/24 en Europa
const DELAY_BETWEEN_REQUESTS = 1000 // 1 segundo entre requests para evitar rate limiting

// Función helper para esperar
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mapear status de API-Football a nuestro schema
function mapStatus(apiStatus: string): string {
  const statusMap: Record<string, string> = {
    TBD: 'NS',
    NS: 'NS',
    '1H': 'LIVE',
    HT: 'HT',
    '2H': 'LIVE',
    ET: 'LIVE',
    P: 'LIVE',
    FT: 'FT',
    AET: 'AET',
    PEN: 'PEN',
    PST: 'PST',
    CANC: 'CANC',
    ABD: 'ABD',
    AWD: 'FT',
    WO: 'FT',
  }
  return statusMap[apiStatus] || 'NS'
}

async function seedFixtures() {

  let totalMatches = 0
  let totalTeams = 0
  let totalGoals = 0

  const leagueEntries = Object.entries(LEAGUE_IDS)

  for (let i = 0; i < leagueEntries.length; i++) {
    const [leagueName, leagueApiId] = leagueEntries[i]

    console.log(`\n📥 [${i + 1}/${leagueEntries.length}] Fetching ${leagueName} (ID: ${leagueApiId})...`)

    try {
      // Obtener fixtures de API-Football
      const response = await getFixtures(leagueApiId, 2022)

      if (!response.response || response.response.length === 0) {
        console.log(`   ℹ️  No fixtures found for ${leagueName}`)

        // Esperar antes del siguiente request
        if (i < leagueEntries.length - 1) {
          await wait(DELAY_BETWEEN_REQUESTS)
        }
        continue
      }

      console.log(`   ✅ Found ${response.response.length} fixtures`)

      // Buscar la liga en la base de datos
      const league = await prisma.league.findFirst({
        where: { apiId: leagueApiId },
      })

      if (!league) {
        console.warn(`   ⚠️  League ${leagueName} not found in database, skipping...`)
        continue
      }

      // Procesar cada fixture
      for (const fixture of response.response) {
        try {
          // 1. Upsert equipos
          const homeTeam = await prisma.team.upsert({
            where: { apiId: fixture.teams.home.id },
            update: {
              name: fixture.teams.home.name,
              logo: fixture.teams.home.logo,
            },
            create: {
              apiId: fixture.teams.home.id,
              name: fixture.teams.home.name,
              logo: fixture.teams.home.logo,
              code: fixture.teams.home.name.substring(0, 3).toUpperCase(),
            },
          })

          const awayTeam = await prisma.team.upsert({
            where: { apiId: fixture.teams.away.id },
            update: {
              name: fixture.teams.away.name,
              logo: fixture.teams.away.logo,
            },
            create: {
              apiId: fixture.teams.away.id,
              name: fixture.teams.away.name,
              logo: fixture.teams.away.logo,
              code: fixture.teams.away.name.substring(0, 3).toUpperCase(),
            },
          })

          totalTeams += 2

          // 2. Upsert partido
          const match = await prisma.match.upsert({
            where: { apiId: fixture.fixture.id },
            update: {
              status: mapStatus(fixture.fixture.status.short),
              homeScore: fixture.goals.home,
              awayScore: fixture.goals.away,
              round: fixture.league.round,
              venue: fixture.fixture.venue?.name,
              referee: fixture.fixture.referee,
            },
            create: {
              apiId: fixture.fixture.id,
              leagueId: league.id,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              matchDate: new Date(fixture.fixture.date),
              status: mapStatus(fixture.fixture.status.short),
              homeScore: fixture.goals.home,
              awayScore: fixture.goals.away,
              round: fixture.league.round,
              venue: fixture.fixture.venue?.name,
              referee: fixture.fixture.referee,
            },
          })

          totalMatches++

          // 3. Procesar goles si existen
          if (fixture.events && fixture.events.length > 0) {
            const goalEvents = fixture.events.filter(
              (event: any) => event.type === 'Goal'
            )

            for (const goalEvent of goalEvents) {
              // Determinar qué equipo marcó
              const goalTeamId =
                goalEvent.team.id === homeTeam.apiId ? homeTeam.id : awayTeam.id

              // Determinar tipo de gol
              let goalType = 'Normal'
              if (goalEvent.detail === 'Penalty') goalType = 'Penalty'
              if (goalEvent.detail === 'Own Goal') goalType = 'Own Goal'

              await prisma.goal.create({
                data: {
                  matchId: match.id,
                  teamId: goalTeamId,
                  playerName: goalEvent.player.name,
                  minute: goalEvent.time.elapsed,
                  extraTime: goalEvent.time.extra,
                  type: goalType,
                },
              })

              totalGoals++
            }
          }

          console.log(`   💾 ${homeTeam.name} vs ${awayTeam.name} - ${mapStatus(fixture.fixture.status.short)}`)
        } catch (matchError) {
          console.error(`   ❌ Error processing match ${fixture.fixture.id}:`, matchError)
        }
      }

      // Esperar antes del siguiente request para respetar rate limit
      if (i < leagueEntries.length - 1) {
        console.log(`   ⏳ Waiting ${DELAY_BETWEEN_REQUESTS}ms before next request...`)
        await wait(DELAY_BETWEEN_REQUESTS)
      }
    } catch (error) {
      console.error(`   ❌ Error fetching ${leagueName}:`, error)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Seed completed!')
  console.log('='.repeat(60))
  console.log(`📊 Total matches: ${totalMatches}`)
  console.log(`👥 Total teams: ${totalTeams}`)
  console.log(`⚽ Total goals: ${totalGoals}`)
  console.log('='.repeat(60))
}

async function main() {
  await seedFixtures()
}

main()
  .catch((error) => {
    console.error('❌ Error seeding fixtures:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
