import { NextResponse } from 'next/server'
import { auth, validateGuildAccess } from '@/lib/auth'
import { getEventStats } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const session = await auth()
        const { searchParams } = new URL(request.url)
        const guildId = searchParams.get('guildId')
        const startDate = searchParams.get('startDate')

        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!guildId) {
            return NextResponse.json({ error: 'Guild ID is required' }, { status: 400 })
        }

        if (!validateGuildAccess(session, guildId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const stats = await getEventStats(guildId, startDate)

        return NextResponse.json(stats || { total_events: 0, upcoming_events: 0, total_participants: 0 })
    } catch (error) {
        console.error('Error fetching event stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch event stats' },
            { status: 500 }
        )
    }
}
