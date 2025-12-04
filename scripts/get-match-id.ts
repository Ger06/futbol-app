import dotenv from 'dotenv'
import path from 'path'
import { prisma } from '../src/shared/lib/prisma'

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') })

async function main() {
  const match = await prisma.match.findFirst({
    select: {
      id: true,
      apiId: true,
      status: true,
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
    },
  })

  if (match) {
    console.log('Match encontrado:')
    console.log(JSON.stringify(match, null, 2))
  } else {
    console.log('No se encontraron partidos en la base de datos')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
