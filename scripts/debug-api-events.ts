
import { config } from 'dotenv'
import path from 'path'
import { getFixturesByDate } from '../src/shared/lib/api-football'

// Cargar variables de entorno
config({ path: path.resolve(process.cwd(), '.env') })

async function main() {
  console.log('Fetching fixtures for 2022-10-09...')
  try {
    const response = await getFixturesByDate('2022-10-09')
    
    if (response.response.length === 0) {
      console.log('No fixtures found.')
      return
    }

    const firstFixture = response.response[0]
    console.log('First fixture ID:', firstFixture.fixture.id)
    console.log('Events present?', !!firstFixture.events)
    if (firstFixture.events) {
       console.log('Number of events:', firstFixture.events.length)
       console.log('First event:', JSON.stringify(firstFixture.events[0], null, 2))
    } else {
       console.log('Events array is undefined or null')
    }
  } catch (error) {
    console.error('Error fetching fixtures:', error)
  }
}

main()
