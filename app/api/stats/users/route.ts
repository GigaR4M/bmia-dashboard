import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getTopUsers } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const session = await auth()

        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')

        const guildId = process.env.DISCORD_GUILD_ID!
        const users = await getTopUsers(guildId, limit)

        return NextResponse.json(users)
    } catch (error) {
        console.error('Error fetching user stats:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user stats' },
            { status: 500 }
        )
    }
}
