/**
 * Script de prueba para enriquecer datos de partidos via API.
 * 
 * Uso:
 * 1. Asegúrate de tener ADMIN_API_KEY en tu .env (o hardcodéalo aquí para probar)
 * 2. Ejecuta: node scripts/mock-enrichment.js
 */

const MATCH_ID = 1451139 // Slavia Praha vs Barcelona (LIVE)
const API_URL = 'http://127.0.0.1:3000/api/admin/enrich-matches'
const API_KEY = 'tu_clave_secreta_aqui' 

async function run() {
  const payload = {
    matches: [
      {
        apiId: MATCH_ID,
        broadcasters: [
          {
            url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/100px-ESPN_wordmark.svg.png',
            channel: 'Canal 10'
          },
          { 
            url: 'https://magistv.bio/wp-content/uploads/2024/07/magistv-logo.webp', 
            channel: 'Canal 600 (En Vivo)' 
          }
        ],
        highlight: '¡PARTIDAZO EN VIVO! Barcelona busca la victoria en Praga. Dato cargado automágicamente. 🤖'
      }
    ]
  }

  console.log('Enviando datos...', JSON.stringify(payload, null, 2))

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    console.log('Respuesta del servidor:', data)
  } catch (error) {
    console.error('Error:', error)
  }
}

run()
