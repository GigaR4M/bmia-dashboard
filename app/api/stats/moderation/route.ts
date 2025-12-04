import { NextResponse } from 'next/server'
import { auth, validateGuildAccess } from '@/lib/auth'
import { getModerationStats } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const session = await auth()
        const { searchParams } = new URL(request.url)
        const guildId = searchParams.get('guildId')
        const days = parseInt(searchParams.get('days') || '30')
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

        const stats = await getModerationStats(guildId, days, startDate)

        return NextResponse.json(stats || { total_moderated: 0, last_24h: 0 })
    } catch (error) {
        console.error('Error fetching moderation stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch moderation stats' },
            { status: 500 }
        )
    }
}
