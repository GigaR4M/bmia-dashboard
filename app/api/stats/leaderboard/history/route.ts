import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const guildId = searchParams.get('guildId')
    const days = parseInt(searchParams.get('days') || '30')
    const limit = parseInt(searchParams.get('limit') || '10')
    const startDate = searchParams.get('startDate')

    if (!guildId) {
        return NextResponse.json({ error: 'Guild ID is required' }, { status: 400 })
    }

    console.log('[API] Rate History - Request:', { guildId, days, limit, startDate })

    try {
        const { data, error } = await supabase.rpc('get_ranking_history', {
            p_guild_id: guildId, // Pass as string, PostgREST handles it
            p_days: days,
            p_limit: limit,
            p_start_date: startDate || null
        })

        if (error) {
            console.error('[API] Error fetching ranking history:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        console.log(`[API] Ranking History fetched: ${data?.length || 0} rows`)

        // Debug: Log first row if exists
        if (data && data.length > 0) {
            console.log('[API] First row sample:', data[0])
        } else {
            console.log('[API] No data returned from RPC')
        }

        // Convert BigInts to strings/numbers for JSON serialization
        // user_id is a snowflake (too big for JS number), so string
        // rank is small, number is fine
        // total_points can be big, string is safer
        const serializedData = data?.map((row: any) => ({
            ...row,
            user_id: row.user_id.toString(),
            rank: Number(row.rank),
            total_points: Number(row.total_points || 0) // Points usually fit in number, but string is safer if very huge. UI uses formatNumber.
        }))

        return NextResponse.json(serializedData)
    } catch (error) {
        console.error('Internal server error:', error)
        return NextResponse.json({
            error: `Failed to fetch ranking history: ${error instanceof Error ? error.message : JSON.stringify(error)}`
        }, { status: 500 })
    }
}
