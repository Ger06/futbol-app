import { MatchDetailClient } from '@/matches/components'

/**
 * Página de detalles de un partido
 * Ruta: /match/[id]
 *
 * Muestra:
 * - Cabecera con equipos, resultado y estado
 * - Lista de goles con autores y minutos
 * - Panel de estadísticas completas
 */

interface MatchPageProps {
  params: Promise<{
    id: string
  }>
}

// Metadata dinámica para SEO
export async function generateMetadata({ params }: MatchPageProps) {
  const { id } = await params
  const matchId = parseInt(id, 10)

  try {
    // Fetch match data para metadata
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/matches/${matchId}`)

    if (!response.ok) {
      return {
        title: 'Partido no encontrado',
        description: 'El partido que buscas no existe o fue eliminado.',
      }
    }

    const { data: match } = await response.json()

    const title = `${match.homeTeam.name} vs ${match.awayTeam.name} - ${match.league.name}`
    const description = match.status === 'FT'
      ? `${match.homeTeam.name} ${match.homeScore} - ${match.awayScore} ${match.awayTeam.name}. Resultado final, estadísticas y goles del partido.`
      : `Sigue en vivo ${match.homeTeam.name} vs ${match.awayTeam.name} - ${match.league.name}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    }
  } catch (error) {
    return {
      title: 'Detalles del partido',
      description: 'Ver estadísticas, goles y detalles completos del partido.',
    }
  }
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params
  const matchId = parseInt(id, 10)

  return <MatchDetailClient matchId={matchId} />
}
