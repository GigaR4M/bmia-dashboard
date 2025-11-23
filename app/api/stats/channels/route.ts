import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getTopChannels } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')

        const guildId = process.env.DISCORD_GUILD_ID!
        const channels = await getTopChannels(guildId, limit)

        return NextResponse.json(channels)
    } catch (error) {
        console.error('Error fetching channel stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch channel stats' },
            { status: 500 }
        )
    }
}
