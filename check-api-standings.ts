
import 'dotenv/config'
import { getStandings } from './src/shared/lib/api-football'

async function main() {
  console.log('--- Fetching configured season (2026) ---')
  try {
    const res2026 = await getStandings(128, 2026)
    if (res2026.response && res2026.response.length > 0) {
      console.log('2026 Data found:', res2026.response[0].league.id)
      const firstGroup = res2026.response[0].league.standings[0]
      const firstTeam = firstGroup[0]
      console.log('First Team 2026:', firstTeam.team.name)
      console.log('Played:', firstTeam.all.played)
      console.log('Points:', firstTeam.points)
      
      // Check a team that played yesterday: Banfield
      const banfield = res2026.response[0].league.standings.flat().find((t: any) => t.team.name === 'Banfield')
      if (banfield) {
        console.log('Banfield 2026:', banfield.all.played, 'games,', banfield.points, 'points.')
      } else {
        console.log('Banfield not found in standings')
      }
    } else {
      console.log('2026 Data is empty or invalid')
    }
  } catch (e) {
    console.error('Error fetching 2026:', e.message)
  }

  console.log('\n--- Fetching previous season (2025) ---')
  try {
    const res2025 = await getStandings(128, 2025)
    if (res2025.response && res2025.response.length > 0) {
      console.log('2025 Data found:', res2025.response[0].league)
      console.log('Standings count:', res2025.response[0].league.standings.flat().length)
    } else {
      console.log('2025 Data is empty or invalid')
    }
  } catch (e) {
    console.error('Error fetching 2025:', e.message)
  }
}

main()
