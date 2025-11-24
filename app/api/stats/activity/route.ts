import { NextResponse } from 'next/server'
import { getActivityOverTime } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')

        // Default guild ID - in a real app this would come from auth or context
        const guildId = '1327836427915886643'

        const activity = await getActivityOverTime(guildId, days)

        return NextResponse.json(activity)
    } catch (error) {
        console.error('Error fetching activity stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch activity stats' },
            { status: 500 }
        )
    }
}
