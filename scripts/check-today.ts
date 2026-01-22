import dotenv from 'dotenv'
import path from 'path'
import { prisma } from '../src/shared/lib/prisma'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

async function checkTodayMatches() {
  const today = new Date('2026-01-22T00:00:00.000Z')
  const tomorrow = new Date('2026-01-24T00:00:00.000Z')

  console.log(`Checking matches between ${today.toISOString()} and ${tomorrow.toISOString()}...`)

  const matches = await prisma.match.findMany({
    where: {
      matchDate: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
    },
  })

  console.log(`Found ${matches.length} matches:`)
  matches.forEach(m => {
    console.log(`- [${m.league.name}] ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.matchDate.toISOString()})`)
  })
}

checkTodayMatches()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
