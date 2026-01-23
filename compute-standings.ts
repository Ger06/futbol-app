
import 'dotenv/config'
import { getFixtures } from './src/shared/lib/api-football'

interface TeamStats {
  id: number
  name: string
  logo: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
  form: string[]
}

async function main() {
  console.log('Fetching fixtures for 128/2026...')
  const res = await getFixtures(128, 2026)
  
  if (!res.response || res.response.length === 0) {
    console.log('No fixtures.')
    return
  }

  const stats: Record<number, TeamStats> = {}

  const getStats = (team: { id: number, name: string, logo: string }) => {
    if (!stats[team.id]) {
      stats[team.id] = {
        id: team.id,
        name: team.name,
        logo: team.logo,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
        form: []
      }
    }
    return stats[team.id]
  }

  // Filter for finished or live matches that have a score
  // Actually, standings usually only count FINISHED matches? Or live too?
  // API-Football standings usually update after match? Or during?
  // "Live" standings = update during.
  // Code mentions "Interactive / Live".
  // Let's include '1H', '2H', 'HT', 'ET', 'P', 'FT', 'AET', 'PEN'.
  const validStatuses = ['1H', 'HT', '2H', 'ET', 'P', 'FT', 'AET', 'PEN']
  
  // Sort fixtures by date ascending to build form correctly
  const sortedFixtures = res.response.sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())

  for (const match of sortedFixtures) {
    if (!validStatuses.includes(match.fixture.status.short)) continue

    const home = getStats(match.teams.home)
    const away = getStats(match.teams.away)

    const goalsHome = match.goals.home ?? 0
    const goalsAway = match.goals.away ?? 0

    // Only count as 'played' if verify status
    // For now, if goals are present and status implies start, we count.
    
    home.played++
    away.played++
    
    home.goalsFor += goalsHome
    home.goalsAgainst += goalsAway
    away.goalsFor += goalsAway
    away.goalsAgainst += goalsHome

    if (goalsHome > goalsAway) {
      home.won++
      home.points += 3
      away.lost++
      home.form.push('W')
      away.form.push('L')
    } else if (goalsHome < goalsAway) {
      away.won++
      away.points += 3
      home.lost++
      away.form.push('W')
      home.form.push('L')
    } else {
      home.drawn++
      home.points += 1
      away.drawn++
      away.points += 1
      home.form.push('D')
      away.form.push('D')
    }
  }

  const standings = Object.values(stats).map(s => ({
     ...s,
     goalDifference: s.goalsFor - s.goalsAgainst
  }))

  // Sort: Points DESC, GD DESC, GF DESC
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })

  // Assign positions
  standings.forEach((s, idx) => {
    console.log(`${idx + 1}. ${s.name} - Pts: ${s.points} (P: ${s.played} W:${s.won} D:${s.drawn} L:${s.lost})`)
  })
}

main()
