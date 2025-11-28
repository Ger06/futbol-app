import dotenv from 'dotenv'
import path from 'path'
import { prisma } from '../src/shared/lib/prisma'

// Load .env.local file FIRST before importing Prisma Client
dotenv.config({ path: path.join(__dirname, '../.env.local') })

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local')
}

const leagues = [
  {
    apiId: 2,
    name: 'UEFA Champions League',
    country: 'World',
    season: 2023,
    logo: null,
  },
  {
    apiId: 39,
    name: 'Premier League',
    country: 'England',
    season: 2023,
    logo: null,
  },
  {
    apiId: 140,
    name: 'La Liga',
    country: 'Spain',
    season: 2023,
    logo: null,
  },
  {
    apiId: 135,
    name: 'Serie A',
    country: 'Italy',
    season: 2023,
    logo: null,
  },
  {
    apiId: 128,
    name: 'Liga Profesional Argentina',
    country: 'Argentina',
    season: 2023,
    logo: null,
  },
  {
    apiId: 71,
    name: 'Brasileirão Serie A',
    country: 'Brazil',
    season: 2023,
    logo: null,
  },
  {
    apiId: 253,
    name: 'MLS',
    country: 'USA',
    season: 2023,
    logo: null,
  },
]

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
