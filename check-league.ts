
import 'dotenv/config'
import { prisma } from './src/shared/lib/prisma'

async function main() {
  const league = await prisma.league.findFirst({
    where: {
      apiId: 128 // Liga Profesional Argentina
    }
  })

  console.log('League found:', league)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
