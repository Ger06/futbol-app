import dotenv from 'dotenv'
import path from 'path'
import { getFixturesByDate } from '../src/shared/lib/api-football'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

async function testApi() {
  const tomorrow = new Date('2026-01-23')
  const dateStr = tomorrow.toISOString().split('T')[0]
  console.log(`Checking fixtures for: ${dateStr}`)

  const res = await getFixturesByDate(dateStr)
  console.log(`Found ${res.response?.length || 0} fixtures`)
  
  const argMatches = res.response?.filter(f => f.league.id === 128) || []
  console.log(`Argentine matches: ${argMatches.length}`)
  argMatches.forEach(m => console.log(`- ${m.teams.home.name} vs ${m.teams.away.name}`))
}

testApi()
