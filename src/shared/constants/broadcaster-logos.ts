/**
 * Mapeo de nombres de canales a sus logos
 * Las keys son en minúsculas para búsqueda case-insensitive
 *
 * Para agregar logos locales, guardalos en /public/images/broadcasters/
 * y usá la ruta '/images/broadcasters/nombre.png'
 */
export const BROADCASTER_LOGOS: Record<string, string> = {
  // ESPN
  'espn': '/images/broadcasters/espn.png',
  'espn premium': '/images/broadcasters/espn-premium.png',
  'espn 2': '/images/broadcasters/espn2.png',
  'espn 3': '/images/broadcasters/espn3.png',

  // TNT Sports
  'tnt sports': '/images/broadcasters/tnt-sports.png',
  'tnt': '/images/broadcasters/tnt-sports.png',

  // Fox Sports
  'fox sports': '/images/broadcasters/fox-sports.png',
  'fox': '/images/broadcasters/fox-sports.png',
  'fox sports premium': '/images/broadcasters/fox-sports.png',

  // Star+
  'star+': '/images/broadcasters/star-plus.png',
  'star plus': '/images/broadcasters/star-plus.png',

  // Disney+
  'disney+': '/images/broadcasters/disney+.png',
  'disney plus': '/images/broadcasters/disney+.png',

  // TyC Sports
  'tyc sports': '/images/broadcasters/tyc-sports.png',
  'tyc': '/images/broadcasters/tyc-sports.png',

  // TV Pública
  'tv publica': '/images/broadcasters/tv-publica.png',
  'tv pública': '/images/broadcasters/tv-publica.png',
  'television publica': '/images/broadcasters/tv-publica.png',

  // AFA Play
  'afa play': '/images/broadcasters/afa-play.png',

  // Paramount+
  'paramount+': '/images/broadcasters/paramount.png',
  'paramount plus': '/images/broadcasters/paramount.png',

  // Telefe
  'telefe': '/images/broadcasters/telefe.png',

  // Magic TV (genérico para cualquier canal Magic)
  'magic': '/images/broadcasters/magic-tv.png',

  // DirecTV
  'directv': '/images/broadcasters/directv.png',

  // TV5Monde
  'tv5monde': '/images/broadcasters/tv5monde.png',

  // Premiere
  'premiere': '/images/broadcasters/premiere.png',
}

/**
 * Obtiene el logo de un canal por su nombre
 * Busca coincidencias parciales case-insensitive
 */
export function getBroadcasterLogo(channelName: string): string | null {
  const normalizedName = channelName.toLowerCase().trim()

  // Búsqueda exacta primero
  if (BROADCASTER_LOGOS[normalizedName]) {
    return BROADCASTER_LOGOS[normalizedName]
  }

  // Si contiene "magic", usar logo de Magic TV
  if (normalizedName.includes('magic')) {
    return BROADCASTER_LOGOS['magic']
  }

  // Búsqueda parcial
  for (const [key, logo] of Object.entries(BROADCASTER_LOGOS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return logo
    }
  }

  return null
}
