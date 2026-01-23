import dotenv from 'dotenv'
import path from 'path'
import { getStandings, getFixturesByDate } from '../src/shared/lib/api-football'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

async function checkLeagueStatus() {
  console.log('Checking Yesterday\'s Matches (Argentina)...')
  
  // Yesterday: 2026-01-22 (Matches played)
  // Today: 2026-01-23
  
  const yesterday = '2026-01-22'
  
  try {
    const fixturesRes = await getFixturesByDate(yesterday)
    const fixtures = fixturesRes.response || []
    
    // Filter for Argentina (check ID 128)
    const argFixtures = fixtures.filter(f => f.league.id === 128)
    
    if (argFixtures.length === 0) {
        console.log('No matches found for League 128 on ' + yesterday)
        // Check filtering all leagues to see if they are under another ID
        const allArg = fixtures.filter(f => f.league.country === 'Argentina')
        console.log('Matches in Argentina (any league):', allArg.map(f => `${f.teams.home.name} vs ${f.teams.away.name} (${f.league.name} ID:${f.league.id})`))
    } else {
        console.log(`Found ${argFixtures.length} matches for League 128:`)
        argFixtures.forEach(f => {
            console.log(`- ${f.teams.home.name} ${f.goals.home}-${f.goals.away} ${f.teams.away.name} (Status: ${f.fixture.status.short})`)
        })
    }

    console.log('\nChecking Standings for League 128 (Season 2026)...')
    const standingsRes = await getStandings(128, 2026)
    
    if (standingsRes.response && standingsRes.response.length > 0) {
        const standings = standingsRes.response[0].league.standings
        console.log('Standings Trace:')
        standings.forEach(group => {
            group.slice(0, 5).forEach(team => {
                console.log(`${team.rank}. ${team.team.name} - Played: ${team.all.played}, Pts: ${team.points}`)
            })
        })
    } else {
        console.log('No standings data returned.')
    }

  } catch (e) {
    console.error(e)
  }
}

checkLeagueStatus()
