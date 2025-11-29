import { NextResponse } from 'next/server'
import { auth, validateGuildAccess } from '@/lib/auth'
import { getTopVoiceUsers } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const session = await auth()
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const days = parseInt(searchParams.get('days') || '30')
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
