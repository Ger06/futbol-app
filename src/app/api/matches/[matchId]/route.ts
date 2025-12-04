import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'

/**
 * GET /api/matches/[matchId]
 *
 * Obtiene los detalles completos de un partido:
 * - Información básica del partido
 * - Equipos (local y visitante) con logos
 * - Liga
 * - Goles con jugadores y minutos
 * - Tarjetas con jugadores y minutos
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params
    const matchIdNum = parseInt(matchId, 10)

    if (isNaN(matchIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Match ID inválido' },
        { status: 400 }
      )
    }

    // Obtener partido completo con relaciones
    const match = await prisma.match.findUnique({
      where: { id: matchIdNum },
      include: {
        homeTeam: {
          select: {
            id: true,
            apiId: true,
            name: true,
            logo: true,
            code: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            apiId: true,
            name: true,
            logo: true,
            code: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
            country: true,
            logo: true,
          },
        },
        goals: {
          orderBy: {
            minute: 'asc',
          },
          select: {
            id: true,
            playerName: true,
            minute: true,
            extraTime: true,
            type: true,
            teamId: true,
          },
        },
        cards: {
          orderBy: {
            minute: 'asc',
          },
          select: {
            id: true,
            playerName: true,
            minute: true,
            type: true,
            teamId: true,
          },
        },
      },
    })

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: match,
    })
  } catch (error) {
    console.error('[API] Error in /api/matches/[matchId]:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener detalles del partido',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
