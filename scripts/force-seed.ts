import prisma from '../src/shared/lib/prisma'

async function main() {
  console.log('Seeding data...')

  // 1. League (UCL)
  const league = await prisma.league.upsert({
    where: { apiId: 2 },
    update: {},
    create: {
      apiId: 2,
      name: 'UEFA Champions League',
      country: 'World',
      season: 2025,
      active: true,
      logo: 'https://media.api-sports.io/football/leagues/2.png'
    }
  })
  console.log('League ensured:', league.name)

  // 2. Teams (Slavia & Barca)
  const homeTeam = await prisma.team.upsert({
    where: { apiId: 560 },
    update: {},
    create: {
      apiId: 560,
      name: 'Slavia Praha',
      logo: 'https://media.api-sports.io/football/teams/560.png',
      code: 'SLA'
    }
  })

  const awayTeam = await prisma.team.upsert({
    where: { apiId: 529 },
    update: {},
    create: {
      apiId: 529,
      name: 'Barcelona',
      logo: 'https://media.api-sports.io/football/teams/529.png',
      code: 'BAR'
    }
  })
  console.log('Teams ensured:', homeTeam.name, awayTeam.name)

  // 3. Match
  const match = await prisma.match.upsert({
    where: { apiId: 1451139 },
    update: {
      status: 'LIVE',
      homeScore: 1,
      awayScore: 0
    },
    create: {
      apiId: 1451139,
      leagueId: league.id,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      matchDate: new Date('2026-01-21T20:00:00Z'),
      status: 'LIVE',
      homeScore: 1,
      awayScore: 0
    }
  })
  console.log('Match ensured:', match.apiId)
}

main()
  .then(async () => {
    // No need to disconnect explicitly as the singleton handles it or nextjs
    // But for a script we might want to? 
    // prisma.$disconnect() is not available on the singleton proxy directly unless cast?
    // Actually the proxy forwards everything.
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
