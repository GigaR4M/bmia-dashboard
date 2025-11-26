import { NextResponse } from 'next/server'
import { getTopActivities, getDailyActivityStats, getTopUsersByActivity, getActivityTypeDistribution, getTotalUniqueUsers } from '@/lib/activities'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')
        const limit = parseInt(searchParams.get('limit') || '10')
        const activityName = searchParams.get('activity') || null

        // Default guild ID
        const guildId = '1327836427915886643'

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
