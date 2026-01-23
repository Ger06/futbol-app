
import 'dotenv/config'
import { getFixtures } from './src/shared/lib/api-football'

async function main() {
  console.log('--- Fetching Fixtures 2026 ---')
  try {
    const res = await getFixtures(128, 2026)
    if (res.response && res.response.length > 0) {
      console.log('Total Fixtures:', res.response.length)
      // Sort by date desc
      const sorted = res.response.sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())
      
      console.log('Most recent fixture:', sorted[0].fixture.date, sorted[0].teams.home.name, 'vs', sorted[0].teams.away.name)
      console.log('Status:', sorted[0].fixture.status.long)
      
      // Check for yesterday's matches
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const dateStr = yesterday.toISOString().split('T')[0]
      console.log('Looking for matches on:', dateStr)
      
      const yesterdayMatches = res.response.filter(f => f.fixture.date.startsWith(dateStr))
      console.log('Found matches yesterday:', yesterdayMatches.length)
      yesterdayMatches.forEach(m => {
        console.log(`- [${m.league.round}] [${m.league.id}] ${m.teams.home.name} ${m.goals.home} - ${m.goals.away} ${m.teams.away.name} (${m.fixture.status.short})`)
      })

      const rounds = [...new Set(res.response.map(f => f.league.round))]
      console.log('All Rounds:', rounds)
      console.log('Total Rounds:', rounds.length)

    } else {
      console.log('No fixtures found for 2026')
    }
  } catch (e: any) {
    console.error('Error:', e.message)
  }
}

main()
