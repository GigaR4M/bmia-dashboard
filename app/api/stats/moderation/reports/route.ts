import { NextResponse } from 'next/server'
import { auth, validateGuildAccess } from '@/lib/auth'
import { getGuildReports, updateReportStatus } from '@/lib/reputation'

export async function GET(request: Request) {
    try {
        const session = await auth()
        const { searchParams } = new URL(request.url)
        const guildId = searchParams.get('guildId')
        const status = searchParams.get('status') || undefined

        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!guildId) {
            return NextResponse.json({ error: 'guildId is required' }, { status: 400 })
        }

        if (!validateGuildAccess(session, guildId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const reports = await getGuildReports(guildId, status)
        return NextResponse.json(reports)
    } catch (error) {
        console.error('Error fetching reports:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth()
        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { reportId, status, guildId } = body

        if (!reportId || !status || !guildId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (!validateGuildAccess(session, guildId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const success = await updateReportStatus(reportId, status, session.user.id)
        if (!success) {
            return NextResponse.json({ error: 'Failed to update report status' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating report status:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
