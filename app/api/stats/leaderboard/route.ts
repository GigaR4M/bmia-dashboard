import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getLeaderboard } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const guildId = searchParams.get('guildId')

        if (!guildId) {
            return NextResponse.json({ error: 'Guild ID is required' }, { status: 400 })
        }

        const limit = parseInt(searchParams.get('limit') || '50')
        const daysParam = searchParams.get('days')
        const days = daysParam ? parseInt(daysParam) : null
        const startDate = searchParams.get('startDate')

        const leaderboard = await getLeaderboard(guildId, limit, days, startDate)

        return NextResponse.json(leaderboard)
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return NextResponse.json(
            { error: `Failed to fetch leaderboard: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        )
    }
}
