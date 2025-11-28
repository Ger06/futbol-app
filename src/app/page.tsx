import { PageLayout } from '@/shared/components/layout'
import { MatchesContainer } from '@/matches/components'

/**
 * Home Page - Página principal con partidos del día
 *
 * NOTA TEMPORAL: Mostrando partidos del 2022-10-09 porque estamos usando datos históricos
 * de la temporada 2022/23 (plan FREE de API-Football solo permite temporadas 2021-2023)
 */
export default function Home() {
  // TEMPORAL: Usando fecha fija con datos disponibles
  const demoDate = '2022-10-09'
  const formattedDate = new Date(demoDate).toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <PageLayout
      title="Partidos del 9 de Octubre 2022"
      description={`Mostrando ${formattedDate} - 40 partidos de múltiples ligas (datos de demostración)`}
    >
      <MatchesContainer groupByLeague date={demoDate} />
    </PageLayout>
  )
}
