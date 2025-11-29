import { NextResponse } from 'next/server'
import { auth, validateGuildAccess } from '@/lib/auth'
import { getTopActivities, getDailyActivityStats, getTopUsersByActivity, getActivityTypeDistribution, getTotalUniqueUsers } from '@/lib/activities'

export async function GET(request: Request) {
    try {
        const session = await auth()
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')
        const limit = parseInt(searchParams.get('limit') || '10')
        const activityName = searchParams.get('activity') || null
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

        // Fetch all activity data in parallel
        const [topActivities, dailyStats, topUsers, typeDistribution, totalUniqueUsers] = await Promise.all([
            getTopActivities(guildId, days, limit),
            getDailyActivityStats(guildId, days),
            getTopUsersByActivity(guildId, activityName, days, limit),
            getActivityTypeDistribution(guildId, days),
            getTotalUniqueUsers(guildId, days)
        ])

        return NextResponse.json({
            topActivities,
            dailyStats,
            topUsers,
            typeDistribution,
            totalUniqueUsers
        })
    } catch (error) {
        console.error('Error fetching activity stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch activity stats' },
            { status: 500 }
        )
    }
}
