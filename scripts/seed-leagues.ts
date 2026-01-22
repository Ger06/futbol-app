import dotenv from 'dotenv'
import path from 'path'
import { prisma } from '../src/shared/lib/prisma'

// Load .env.local file FIRST before importing Prisma Client
dotenv.config({ path: path.join(__dirname, '../.env.local') })

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local')
}

import { LEAGUES_CONFIG } from '../src/shared/constants/leagues'

const leagues = LEAGUES_CONFIG.map(l => ({
  apiId: l.id,
  name: l.name,
  country: l.country,
  season: l.season,
  logo: l.icon, // Using icon as logo placeholder if needed, or null if schema expects URL
}))

async function main() {
  console.log('🌱 Seeding leagues...\n')

  for (const league of leagues) {
    const created = await prisma.league.upsert({
      where: { apiId: league.apiId },
      update: league,
      create: league,
    })
    console.log(`✅ ${created.name} (${created.country})`)
  }

  console.log('\n✅ Done! Seeded', leagues.length, 'leagues')
}

main()
  .catch((error) => {
    console.error('❌ Error seeding leagues:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
