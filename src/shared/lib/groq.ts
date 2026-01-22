import Groq from 'groq-sdk'

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Llama 3.3 70B - muy bueno para texto
const MODEL = 'llama-3.3-70b-versatile'

interface MatchInfo {
  homeTeam: string
  awayTeam: string
  league: string
  matchDate: string
}

/**
 * Genera un "Ojo al dato" (dato curioso) para un partido
 */
export async function generateHighlight(match: MatchInfo): Promise<string | null> {
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `Genera UN dato estadístico breve (UNA sola oración corta) sobre ${match.homeTeam} vs ${match.awayTeam}.

El dato debe ser útil para apostadores. Elegí UNO de estos enfoques:
- Últimos enfrentamientos entre ambos (ej: "El local ganó 4 de los últimos 5 cruces")
- Racha actual de uno de los equipos (ej: "Boca lleva 6 partidos sin perder")
- Goleador en racha (ej: "Cavani marcó en sus últimos 4 partidos")

IMPORTANTE:
- Solo jugadores ACTIVOS en 2025-2026
- Una sola oración, máximo 15 palabras
- Sin introducción, solo el dato
- Incluí números concretos`
        }
      ]
    })

    return response.choices[0]?.message?.content?.trim() || null
  } catch (error) {
    console.error(`Error generando highlight para ${match.homeTeam} vs ${match.awayTeam}:`, error)
    return null
  }
}

interface Broadcaster {
  channel: string
  type: 'official' | 'magic'
}

/**
 * Genera highlight para un partido
 * Nota: Groq no tiene web search, así que solo generamos el highlight
 * Los broadcasters se manejan manualmente o por configuración de liga
 */
export async function enrichMatch(match: MatchInfo): Promise<{
  highlight: string | null
  broadcasters: Broadcaster[]
}> {
  const highlight = await generateHighlight(match)

  // Sin web search, retornamos array vacío de broadcasters
  // Se pueden agregar manualmente con el endpoint add-magic-tv
  return { highlight, broadcasters: [] }
}
