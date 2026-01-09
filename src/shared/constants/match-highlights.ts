/**
 * Configuración manual de "Ojo al dato"
 * 
 * Aquí puedes agregar manualmente datos curiosos para partidos específicos.
 * Se busca por ID del partido (apiId) o por código de equipos (HOME-AWAY).
 */

export const MATCH_HIGHLIGHTS: Record<string, string> = {
  // Ejemplo por ID de partido (prioridad alta)
  // '1035043': 'El Liverpool ha ganado sus últimos 5 partidos contra el City en Anfield.',
  '1391001': 'Getafe lleva 5 partidos sin ganar.',

  // Ejemplo por Código de Equipos (HOME-AWAY) (prioridad media)
  // 'LIV-MCI': 'Duelo directo por el liderato de la Premier League.',
  // 'RMA-BAR': 'El clásico mundial. Barcelona busca romper la racha de 3 derrotas seguidas.',
}

/**
 * Función para intentar generar un dato automáticamente si no hay manual.
 * 
 * @param match El objeto del partido
 * @returns string | null
 */
export function getAutomatedHighlight(match: any): string | null {
  // Aquí podemos agregar lógica básica
  // Por ejemplo, si es una final:
  if (match.league?.name?.includes('Champions League') && match.league?.round?.includes('Final')) {
    return '¡La gran final de la UEFA Champions League!'
  }

  return null
}
