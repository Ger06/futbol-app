import dotenv from 'dotenv'
import path from 'path'
import { prisma } from '../src/shared/lib/prisma'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local')
}

async function findBestDate() {
  console.log('🔍 Finding dates with most matches...\n')

  const matches = await prisma.match.findMany({
    select: {
      matchDate: true,
    },
    orderBy: {
      matchDate: 'desc',
    },
  })

  // Group by date
  const dateCount = new Map<string, number>()

  matches.forEach((match) => {
    const date = match.matchDate.toISOString().split('T')[0]
    dateCount.set(date, (dateCount.get(date) || 0) + 1)
  })

  // Sort by count
  const sortedDates = Array.from(dateCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  console.log('📅 Top 10 dates with most matches:\n')
  sortedDates.forEach(([date, count], index) => {
    console.log(`${index + 1}. ${date}: ${count} matches`)
  })
}

async function main() {
  await findBestDate()
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
