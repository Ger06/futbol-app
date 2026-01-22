import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

// Modelo Gemini 2.0 Flash (rápido y económico)
const MODEL = 'gemini-2.0-flash'

interface MatchInfo {
  homeTeam: string
  awayTeam: string
  league: string
  matchDate: string
}

/**
 * Genera un "Ojo al dato" (dato curioso) para un partido
 * Usa el conocimiento interno de Gemini
 */
export async function generateHighlight(match: MatchInfo): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL })

    const prompt = `Genera UN SOLO dato curioso breve (máximo 2 oraciones) sobre el partido ${match.homeTeam} vs ${match.awayTeam} de ${match.league}.

El dato debe ser interesante para un aficionado al fútbol. Puede ser sobre:
- Historial de enfrentamientos
- Récords de algún jugador
- Estadísticas curiosas
- Datos históricos del clásico/rivalidad
- Jugadores destacados actuales

Responde SOLO con el dato, sin introducción ni explicación adicional. Usa español latinoamericano.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return text?.trim() || null
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
 * Busca qué canales transmiten un partido usando Google Search (grounding)
 * Retorna array de broadcasters oficiales
 */
export async function searchBroadcasters(match: MatchInfo): Promise<Broadcaster[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      tools: [
        {
          googleSearch: {}
        } as any
      ]
    })

    const prompt = `Busca qué canales de TV transmiten el partido ${match.homeTeam} vs ${match.awayTeam} de ${match.league} el ${match.matchDate} en Argentina y Latinoamérica.

Canales comunes: ESPN, Fox Sports, TNT Sports, Star+, Paramount+, TyC Sports, TV Pública, AFA Play, Disney+.

Responde SOLO con una lista de canales separados por comas, sin explicación. Si no encuentras información específica, responde "No encontrado".

Ejemplo de respuesta: ESPN, Star+, TNT Sports`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    if (!text) {
      return []
    }

    const trimmedText = text.trim()
    if (trimmedText.toLowerCase().includes('no encontrado') || trimmedText.toLowerCase().includes('no information')) {
      return []
    }

    // Parsear la lista de canales
    const channels = trimmedText
      .split(/[,\n]/)
      .map(ch => ch.trim().replace(/^[-•*]\s*/, '')) // Limpiar bullets
      .filter(ch => ch.length > 0 && ch.length < 50) // Filtrar basura

    return channels.map(channel => ({
      channel,
      type: 'official' as const
    }))
  } catch (error) {
    console.error(`Error buscando broadcasters para ${match.homeTeam} vs ${match.awayTeam}:`, error)
    return []
  }
}

/**
 * Genera highlight y busca broadcasters para un partido
 */
export async function enrichMatch(match: MatchInfo): Promise<{
  highlight: string | null
  broadcasters: Broadcaster[]
}> {
  // Ejecutar ambas operaciones en paralelo
  const [highlight, broadcasters] = await Promise.all([
    generateHighlight(match),
    searchBroadcasters(match)
  ])

  return { highlight, broadcasters }
}
