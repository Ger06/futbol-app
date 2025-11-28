import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import type { MatchWithDetails } from '@/matches/types'

/**
 * GET /api/matches?date=YYYY-MM-DD
 *
 * Obtiene partidos de una fecha específica desde la base de datos
 *
 * @returns Array de partidos con información de equipos y liga
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date')

    if (!dateParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parámetro "date" es requerido (formato: YYYY-MM-DD)',
        },
        { status: 400 }
      )
    }

    // Parsear la fecha
    const targetDate = new Date(dateParam)
    targetDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // Consultar base de datos
    const matches = await prisma.match.findMany({
      where: {
        matchDate: {
          gte: targetDate,
          lt: nextDay,
        },
      },
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
          select: {
            id: true,
            teamId: true,
            playerName: true,
            minute: true,
            extraTime: true,
            type: true,
          },
          orderBy: {
            minute: 'asc',
          },
        },
      },
      orderBy: {
        matchDate: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: matches as MatchWithDetails[],
      count: matches.length,
      date: dateParam,
    })
  } catch (error) {
    console.error('[API] Error in /api/matches:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener partidos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
