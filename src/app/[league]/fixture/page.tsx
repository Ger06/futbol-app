import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PageLayout } from '@/shared/components/layout'
import { FixtureList } from '@/leagues/components/FixtureList'
import { getLeagueBySlug } from '@/shared/constants/leagues'
import { prisma } from '@/shared/lib/prisma'

interface FixturePageProps {
  params: Promise<{
    league: string
  }>
}

/**
 * Página de Fixture Completo - /[league]/fixture
 *
 * Muestra todas las jornadas de una liga con sus partidos
 * organizados por fecha/round
 *
 * Ejemplos:
 * - /premier-league/fixture
 * - /champions-league/fixture
 */
export default async function FixturePage({ params }: FixturePageProps) {
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
      title={`Fixture Completo - ${leagueConfig.name}`}
      description={`Calendario completo de partidos de ${leagueConfig.name} - Temporada ${leagueConfig.season}`}
    >
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link
            href={`/${leagueConfig.slug}`}
            className="transition-colors hover:text-blue-600"
          >
            {leagueConfig.shortName}
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-900">Fixture</span>
        </nav>
      </div>

      {/* Lista de Fixtures */}
      <FixtureList leagueId={league.id} />
    </PageLayout>
  )
}

/**
 * Generar metadata dinámica para SEO
 */
export async function generateMetadata({ params }: FixturePageProps) {
  const { league: leagueSlug } = await params
  const leagueConfig = getLeagueBySlug(leagueSlug)

  if (!leagueConfig) {
    return {
      title: 'Fixture - Liga no encontrada',
    }
  }

  return {
    title: `Fixture Completo - ${leagueConfig.name}`,
    description: `Calendario completo de partidos de ${leagueConfig.name}. Todas las jornadas y resultados - Temporada ${leagueConfig.season}.`,
  }
}

/**
 * Generar rutas estáticas en build time
 */
export async function generateStaticParams() {
  const { LEAGUES_CONFIG } = await import('@/shared/constants/leagues')

  return LEAGUES_CONFIG.map((league) => ({
    league: league.slug,
  }))
}
