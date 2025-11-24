import { NextResponse } from 'next/server'
import { getTopVoiceUsers } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const days = parseInt(searchParams.get('days') || '30')

        // Default guild ID
        const guildId = '1327836427915886643'

        const users = await getTopVoiceUsers(guildId, limit, days)

        return NextResponse.json(users)
    } catch (error) {
        console.error('Error fetching top voice users:', error)
        return NextResponse.json(
            { error: 'Failed to fetch top voice users' },
            { status: 500 }
        )
    }
}
