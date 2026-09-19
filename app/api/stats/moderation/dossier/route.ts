import { NextResponse } from 'next/server'
import { auth, validateGuildAccess } from '@/lib/auth'
import { getUserDossier } from '@/lib/reputation'

export async function GET(request: Request) {
    try {
        const session = await auth()
        const { searchParams } = new URL(request.url)
        const guildId = searchParams.get('guildId')
        const userId = searchParams.get('userId')

        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!guildId || !userId) {
            return NextResponse.json({ error: 'guildId and userId are required' }, { status: 400 })
        }

        if (!validateGuildAccess(session, guildId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const dossier = await getUserDossier(guildId, userId)
        if (!dossier) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(dossier)
    } catch (error) {
        console.error('Error fetching user dossier:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
