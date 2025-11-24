import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    try {
        // Check users table
        const { data: users, error: usersError } = await supabaseAdmin
            .from('users')
            .select('user_id, username')
            .limit(10)

        // Check channels table
        const { data: channels, error: channelsError } = await supabaseAdmin
            .from('channels')
            .select('channel_id, channel_name')
            .limit(10)

        // Check messages table
        const { data: messages, error: messagesError } = await supabaseAdmin
            .from('messages')
            .select('user_id, channel_id')
            .limit(5)

        return NextResponse.json({
            users: {
                data: users,
                error: usersError?.message
            },
            channels: {
                data: channels,
                error: channelsError?.message
            },
            messages: {
                data: messages,
                error: messagesError?.message
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
