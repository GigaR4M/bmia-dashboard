import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getServerStats } from '@/lib/supabase'

export async function GET() {
    try {
        const session = await auth()

        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const guildId = process.env.DISCORD_GUILD_ID!
        const stats = await getServerStats(guildId)

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Error fetching server stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch server stats' },
            { status: 500 }
        )
    }
}
