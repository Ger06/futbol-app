import { notFound } from 'next/navigation'
import { PageLayout } from '@/shared/components/layout'
import { StandingsTable } from '@/leagues/components/StandingsTable'
import { FixtureSlider } from '@/leagues/components/FixtureSlider'
import { getLeagueBySlug } from '@/shared/constants/leagues'
import { prisma } from '@/shared/lib/prisma'

interface LeaguePageProps {
  params: Promise<{
    league: string
  }>
}

/**
 * Página de Liga - /[league]
 *
 * Muestra vista completa de una liga con:
 * - Tabla completa de posiciones
 * - Slider de fixtures por jornada
 *
 * Ejemplos:
 * - /premier-league
 * - /champions-league
 * - /la-liga
 */
export default async function LeaguePage({ params }: LeaguePageProps) {
  const { league: leagueSlug } = await params

  // Obtener configuración de la liga
  const leagueConfig = getLeagueBySlug(leagueSlug)

  if (!leagueConfig) {
    notFound()
  }

  // Verificar que la liga existe en la base de datos
  const league = await prisma.league.findUnique({
    where: { apiId: leagueConfig.id },
  })

  if (!league) {
    notFound()
  }

  return (
    <PageLayout
      title={leagueConfig.name}
      description={`Posiciones y fixture de ${leagueConfig.name} - Temporada ${leagueConfig.season}`}
    >
      <div className="space-y-8">
        {/* Tabla de Posiciones Completa */}
        <StandingsTable leagueId={league.id} showForm />

        {/* Slider de Fixtures */}
        <FixtureSlider
          leagueId={league.id}
          leagueSlug={leagueConfig.slug}
          showAllLink
        />
      </div>
    </PageLayout>
  )
}

/**
 * Generar metadata dinámica para SEO
 */
export async function generateMetadata({ params }: LeaguePageProps) {
  const { league: leagueSlug } = await params
  const leagueConfig = getLeagueBySlug(leagueSlug)

  if (!leagueConfig) {
    return {
      title: 'Liga no encontrada',
    }
  }

  return {
    title: `${leagueConfig.name} - Posiciones y Fixture`,
    description: `Tabla de posiciones, fixture y resultados de ${leagueConfig.name}. Temporada ${leagueConfig.season}.`,
  }
}

/**
 * Generar rutas estáticas en build time
 */
export async function generateStaticParams() {
  // Importar la configuración de ligas
  const { LEAGUES_CONFIG } = await import('@/shared/constants/leagues')

  return LEAGUES_CONFIG.map((league) => ({
    league: league.slug,
  }))
}
