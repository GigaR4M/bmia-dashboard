import { NextResponse } from 'next/server'
import { getLeaderboard, getLeaderboardHistory } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const guildId = searchParams.get('guildId')
        const days = Number(searchParams.get('days') || 30)
        const startDate = searchParams.get('startDate') || undefined

        if (!guildId) {
            return NextResponse.json({ error: 'Guild ID required' }, { status: 400 })
        }

        // 1. Get Top Users to track (Top 10 by default)
        // We only show history for the top users currently on the leaderboard
        const leaderboard = await getLeaderboard(guildId, 10, days, startDate)
        const topUserIds = leaderboard.map((u: any) => u.user_id)
        console.log('[LeaderboardAPI] Top User IDs:', topUserIds)

        if (topUserIds.length === 0) {
            return NextResponse.json([], { status: 200 })
        }

        // 2. Fetch History for these users
        const history = await getLeaderboardHistory(guildId, topUserIds, days, startDate)
        console.log('[LeaderboardAPI] History Data Points:', history.length)
        if (history.length > 0) console.log('[LeaderboardAPI] Sample History:', history[0])

        return NextResponse.json(history)
    } catch (error) {
        console.error('Error fetching leaderboard history:', error)
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard history' },
            { status: 500 }
        )
    }
}
