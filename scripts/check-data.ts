import dotenv from 'dotenv'
import path from 'path'
import { prisma } from '../src/shared/lib/prisma'

// Load .env.local file FIRST before importing Prisma Client
dotenv.config({ path: path.join(__dirname, '../.env.local') })

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local')
}

async function checkData() {
  console.log('🔍 Checking database data...\n')

  // Count leagues
  const leaguesCount = await prisma.league.count()
  console.log(`📊 Leagues: ${leaguesCount}`)

  if (leaguesCount > 0) {
    const leagues = await prisma.league.findMany()
    leagues.forEach((league) => {
      console.log(`   - ${league.name} (${league.country}) - Season ${league.season}`)
    })
  }

  console.log()

  // Count teams
  const teamsCount = await prisma.team.count()
  console.log(`👥 Teams: ${teamsCount}`)

  console.log()

  // Count matches
  const matchesCount = await prisma.match.count()
  console.log(`⚽ Matches: ${matchesCount}`)

  if (matchesCount > 0) {
    // Get date range of matches
    const oldestMatch = await prisma.match.findFirst({
      orderBy: { matchDate: 'asc' },
      select: { matchDate: true },
    })

    const newestMatch = await prisma.match.findFirst({
      orderBy: { matchDate: 'desc' },
      select: { matchDate: true },
    })

    console.log(`   📅 Date range: ${oldestMatch?.matchDate.toISOString().split('T')[0]} to ${newestMatch?.matchDate.toISOString().split('T')[0]}`)

    // Get a sample match
    const sampleMatch = await prisma.match.findFirst({
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true,
      },
    })

    if (sampleMatch) {
      console.log(`\n   Sample match:`)
      console.log(`   ${sampleMatch.homeTeam.name} vs ${sampleMatch.awayTeam.name}`)
      console.log(`   ${sampleMatch.homeScore} - ${sampleMatch.awayScore}`)
      console.log(`   Status: ${sampleMatch.status}`)
      console.log(`   Date: ${sampleMatch.matchDate.toISOString().split('T')[0]}`)
      console.log(`   League: ${sampleMatch.league.name}`)
    }
  }

  console.log()

  // Count goals
  const goalsCount = await prisma.goal.count()
  console.log(`⚽ Goals: ${goalsCount}`)
}

async function main() {
  await checkData()
}

main()
  .catch((error) => {
    console.error('❌ Error checking data:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
