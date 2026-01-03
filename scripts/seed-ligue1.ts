import 'dotenv/config'
import { prisma } from '../src/shared/lib/prisma'

async function main() {
  console.log('Seeding Ligue 1...')

  const ligue1 = await prisma.league.upsert({
    where: { apiId: 61 },
    update: {
      name: 'Ligue 1',
      country: 'France',
      logo: 'https://media.api-sports.io/football/leagues/61.png',
      season: 2025,
      active: true,
    },
    create: {
      apiId: 61,
      name: 'Ligue 1',
      country: 'France',
      logo: 'https://media.api-sports.io/football/leagues/61.png',
      season: 2025,
      active: true,
    },
  })

  console.log({ ligue1 })
  console.log('Seed completed successfully.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
