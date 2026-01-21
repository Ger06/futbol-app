/**
 * Configuración manual de "Broadcasters" (Canales de TV)
 * 
 * Aquí puedes agregar manualmente los logos de los canales para partidos específicos.
 * Se busca por ID del partido (apiId) o por código de equipos (HOME-AWAY).
 * 
 * Es útil cuando quieres anular la configuración por defecto de la liga
 * para un partido en concreto (ej: un partido va por Star+ en vez de ESPN).
 */

export type Broadcaster = string | { url: string; channel: string }

export const MATCH_BROADCASTERS: Record<string, Broadcaster[]> = {
  // Ejemplo por ID (apiId) de partido (prioridad alta)
  // Ejemplo por ID (apiId) de partido (prioridad alta)
  '1451137': [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/100px-ESPN_wordmark.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/b/b2/Fox_Sports_Argentina_2023.svg',
    { 
      url: 'https://magistv.bio/wp-content/uploads/2024/07/magistv-logo.webp', 
      channel: '336' 
    }
  ],
  // '1451137': ['https://upload.wikimedia.org/wikipedia/commons/b/b2/Fox_Sports_Argentina_2023.svg']
  // '11241': ['https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/DirecTV_Sports_logo_2018.png/250px-DirecTV_Sports_logo_2018.png']


  // Ejemplo por Código de Equipos (HOME-AWAY) (prioridad media)
  'QAR-EIN': [{ 
      url: 'https://magistv.bio/wp-content/uploads/2024/07/magistv-logo.webp', 
      channel: '687' 
    }],
}

/**
 * Función para obtener los broadcasters de un partido específico
 * si están definidos manualmente.
 * 
 * @param match El objeto del partido
 * @returns Broadcaster[] | null
 */
export function getManualBroadcasters(match: any): Broadcaster[] | null {
  // 1. Buscar por API ID
  if (match.apiId) {
    const byId = MATCH_BROADCASTERS[match.apiId.toString()]
    if (byId) return byId
  }

  // 2. Buscar por HOME-AWAY code
  if (match.homeTeam?.code && match.awayTeam?.code) {
    const key = `${match.homeTeam.code}-${match.awayTeam.code}`
    const byCode = MATCH_BROADCASTERS[key]
    if (byCode) return byCode
  }

  return null
}
