import { PageLayout } from '@/shared/components/layout'
import { MatchesContainer } from '@/matches/components'

/**
 * Home Page - Página principal con partidos del día
 *
 * NOTA TEMPORAL: Mostrando partidos del 2022-10-09 porque estamos usando datos históricos
 * de la temporada 2022/23 (plan FREE de API-Football solo permite temporadas 2021-2023)
 */
export default function Home() {
  const today = new Date()
  const formattedDate = today.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <PageLayout
      title="Partidos de Hoy"
      description={`Mostrando partidos del ${formattedDate} - Múltiples ligas`}
    >
      <MatchesContainer groupByLeague />
    </PageLayout>
  )
}
