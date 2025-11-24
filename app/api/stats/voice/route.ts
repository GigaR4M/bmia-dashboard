import { NextResponse } from 'next/server'
import { getVoiceActivityOverTime } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')

        // Default guild ID
        const guildId = '1327836427915886643'

        const stats = await getVoiceActivityOverTime(guildId, days)

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Error fetching voice stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch voice stats' },
            { status: 500 }
        )
    }
}
