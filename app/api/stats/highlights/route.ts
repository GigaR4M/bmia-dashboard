import { NextResponse } from 'next/server'
import { auth, validateGuildAccess } from '@/lib/auth'
import { getHighlights } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const session = await auth()
        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '5')
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

        const stats = await getHighlights(guildId, limit)

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Error fetching highlights:', error)
        return NextResponse.json(
            { error: 'Failed to fetch highlights' },
            { status: 500 }
        )
    }
}
