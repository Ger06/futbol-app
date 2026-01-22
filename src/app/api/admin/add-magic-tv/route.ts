import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'

function verifyAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const adminKey = process.env.ADMIN_API_KEY

  if (!adminKey) {
    console.error('ADMIN_API_KEY not configured')
    return false
  }

  return authHeader === `Bearer ${adminKey}`
}

interface MagicTvRequest {
  homeTeam: string
  awayTeam: string
  channel: string
}

/**
 * POST /api/admin/add-magic-tv
 * Agrega un canal de Magic TV a un partido específico
 *
 * Body:
 * - homeTeam: nombre del equipo local (búsqueda parcial)
 * - awayTeam: nombre del equipo visitante (búsqueda parcial)
 * - channel: número o nombre del canal Magic TV (ej: "336", "ESPN Magic")
 */
export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body: MagicTvRequest = await request.json()

    if (!body.homeTeam || !body.awayTeam || !body.channel) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: homeTeam, awayTeam, channel' },
        { status: 400 }
      )
    }

    // Obtener fecha de hoy (inicio y fin del día)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Buscar el partido por nombres de equipos (búsqueda parcial, case insensitive)
    const match = await prisma.match.findFirst({
      where: {
        matchDate: {
          gte: startOfDay,
          lt: endOfDay
        },
        homeTeam: {
          name: {
            contains: body.homeTeam,
            mode: 'insensitive'
          }
        },
        awayTeam: {
          name: {
            contains: body.awayTeam,
            mode: 'insensitive'
          }
        }
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        league: true
      }
    })

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          error: `No se encontró partido de hoy con ${body.homeTeam} vs ${body.awayTeam}`
        },
        { status: 404 }
      )
    }

    // Obtener broadcasters existentes
    const existingBroadcasters = (match.broadcasters as any[]) || []

    // Verificar si ya existe este canal Magic TV
    const magicChannel = {
      channel: `Magic TV ${body.channel}`,
      type: 'magic' as const
    }

    const alreadyExists = existingBroadcasters.some(
      (b: any) => b.type === 'magic' && b.channel === magicChannel.channel
    )

    if (alreadyExists) {
      return NextResponse.json({
        success: true,
        message: `El canal ${magicChannel.channel} ya estaba agregado`,
        match: {
          id: match.id,
          apiId: match.apiId,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          league: match.league.name
        },
        broadcasters: existingBroadcasters
      })
    }

    // Agregar el nuevo canal Magic TV (sin reemplazar los existentes)
    const updatedBroadcasters = [...existingBroadcasters, magicChannel]

    await prisma.match.update({
      where: { id: match.id },
      data: {
        broadcasters: updatedBroadcasters
      }
    })

    return NextResponse.json({
      success: true,
      message: `Canal ${magicChannel.channel} agregado a ${match.homeTeam.name} vs ${match.awayTeam.name}`,
      match: {
        id: match.id,
        apiId: match.apiId,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        league: match.league.name,
        matchDate: match.matchDate
      },
      broadcasters: updatedBroadcasters
    })
  } catch (error) {
    console.error('[API] Error in /api/admin/add-magic-tv:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
