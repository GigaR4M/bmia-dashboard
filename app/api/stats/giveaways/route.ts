import { NextResponse } from 'next/server'
import { auth, validateGuildAccess } from '@/lib/auth'
import { getGiveawayStats, getGiveawayList, getTopParticipants, getDailyParticipation } from '@/lib/giveaways'

export async function GET(request: Request) {
    try {
        const session = await auth()
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')
        const limit = parseInt(searchParams.get('limit') || '20')
        const activeOnly = searchParams.get('active') === 'true'
        const guildId = searchParams.get('guildId')

        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!guildId) {
            return NextResponse.json({ error: 'Guild ID is required' }, { status: 400 })
        }

        if (!validateGuildAccess(session, guildId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Fetch all giveaway data in parallel
        const [stats, giveaways, topParticipants, dailyParticipation] = await Promise.all([
            getGiveawayStats(guildId, days),
            getGiveawayList(guildId, limit, activeOnly),
            getTopParticipants(guildId, days, 10),
            getDailyParticipation(guildId, days)
        ])

        return NextResponse.json({
            stats,
            giveaways,
            topParticipants,
            dailyParticipation
        })
    } catch (error) {
        console.error('Error fetching giveaway stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch giveaway stats' },
            { status: 500 }
        )
    }
}
