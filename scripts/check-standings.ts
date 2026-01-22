import dotenv from 'dotenv'
import path from 'path'
import { getStandings } from '../src/shared/lib/api-football'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

async function checkStandings() {
  console.log('Checking standings for Liga Profesional (128) Season 2026...')
  
  try {
    const res = await getStandings(128, 2026)
    
    if (!res.response || res.response.length === 0) {
      console.log('No standings found.')
      return
    }

    const league = res.response[0].league
    console.log(`League: ${league.name}, Season: ${league.season}`)
    const standings = league.standings
    
    console.log(`Groups found: ${standings.length}`)
    standings.forEach((group, i) => {
      console.log(`[Group ${i+1}] ${group[0]?.group || 'Unknown'}: ${group.length} teams`)
      // Print top 3
      group.slice(0, 3).forEach(team => {
        console.log(`  ${team.rank}. ${team.team.name} - ${team.points} pts`)
      })
    })

  } catch (e) {
    console.error(e)
  }
}

checkStandings()
