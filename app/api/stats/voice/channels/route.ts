import { NextResponse } from 'next/server'
import { getTopVoiceChannels } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const days = parseInt(searchParams.get('days') || '30')

        // Default guild ID
        const guildId = '1327836427915886643'

        const channels = await getTopVoiceChannels(guildId, limit, days)

        return NextResponse.json(channels)
    } catch (error) {
        console.error('Error fetching top voice channels:', error)
        return NextResponse.json(
            { error: 'Failed to fetch top voice channels' },
            { status: 500 }
        )
    }
}
