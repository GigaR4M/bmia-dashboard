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

    if (!guildId) {
        return NextResponse.json({ error: 'Guild ID is required' }, { status: 400 })
    }

    try {
        const { data, error } = await supabase.rpc('get_ranking_history', {
            p_guild_id: BigInt(guildId),
            p_days: days,
            p_limit: limit
        })

        if (error) {
            console.error('Error fetching ranking history:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Internal server error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
