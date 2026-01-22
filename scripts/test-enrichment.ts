
import { POST } from '../src/app/api/admin/enrich-matches/route'
// We mock Request if usage matches standard fetch Request, which Node 22 provides.

const API_KEY = process.env.ADMIN_API_KEY || 'tu_clave_secreta_aqui'

async function main() {
  console.log('Testing Enrichment API...')

  const payload = {
    matches: [
      {
        apiId: 1451139,
        broadcasters: [
          {
            url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/100px-ESPN_wordmark.svg.png',
            channel: 'Canal 10'
          },
          {
            url: 'https://magistv.bio/wp-content/uploads/2024/07/magistv-logo.webp',
            channel: 'Canal 600'
          }
        ],
        highlight: '¡Dato actualizado con DOS canales! 📺✅'
      }
    ]
  }

  const req = new Request('http://localhost:3000/api/admin/enrich-matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify(payload)
  })

  try {
    const response = await POST(req as any)
    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))

    if (response.status === 200) {
      console.log('✅ Update successful!')
    } else {
      console.error('❌ Update failed.')
      process.exit(1)
    }
  } catch (err) {
    console.error('❌ Error invoking handler:', err)
    process.exit(1)
  }
}

main()
