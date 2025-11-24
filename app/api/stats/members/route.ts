import { NextResponse } from 'next/server'
import { getMemberStats } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')

        // Default guild ID
        const guildId = '1327836427915886643'

        const stats = await getMemberStats(guildId, days)

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Error fetching member stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch member stats' },
            { status: 500 }
        )
    }
}
