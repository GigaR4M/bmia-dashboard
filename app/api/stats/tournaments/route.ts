import { NextResponse } from 'next/server'
import { auth, validateGuildAccess } from '@/lib/auth'
import { getTournamentsData } from '@/lib/tournaments'

export async function GET(request: Request) {
    try {
        const session = await auth()
        const { searchParams } = new URL(request.url)
        const guildId = searchParams.get('guildId')
        const limit = parseInt(searchParams.get('limit') || '50', 10)

        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!guildId) {
            return NextResponse.json({ error: 'Guild ID is required' }, { status: 400 })
        }

        if (!validateGuildAccess(session, guildId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const data = await getTournamentsData(guildId, limit)

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching tournament stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch tournament stats' },
            { status: 500 }
        )
    }
}
