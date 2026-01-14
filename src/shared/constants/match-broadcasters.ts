/**
 * Configuración manual de "Broadcasters" (Canales de TV)
 * 
 * Aquí puedes agregar manualmente los logos de los canales para partidos específicos.
 * Se busca por ID del partido (apiId) o por código de equipos (HOME-AWAY).
 * 
 * Es útil cuando quieres anular la configuración por defecto de la liga
 * para un partido en concreto (ej: un partido va por Star+ en vez de ESPN).
 */

export const MATCH_BROADCASTERS: Record<string, string[]> = {
  // Ejemplo por ID de partido (prioridad alta)
  // '1035043': ['https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/100px-ESPN_wordmark.svg.png'],

  // Ejemplo por Código de Equipos (HOME-AWAY) (prioridad media)
  // 'LIV-MCI': ['https://...'],
}

/**
 * Función para obtener los broadcasters de un partido específico
 * si están definidos manualmente.
 * 
 * @param match El objeto del partido
 * @returns string[] | null
 */
export function getManualBroadcasters(match: any): string[] | null {
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
