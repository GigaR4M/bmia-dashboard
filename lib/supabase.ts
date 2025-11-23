import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser/client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations with elevated permissions
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// Helper function to get server stats
export async function getServerStats(guildId: string) {
    const { data, error } = await supabaseAdmin
        .from('server_stats')
        .select('*')
        .eq('guild_id', guildId)
        .single()

    if (error) throw error
    return data
}

// Helper function to get top users
export async function getTopUsers(guildId: string, limit: number = 10) {
    const { data, error } = await supabaseAdmin
        .from('user_stats')
        .select('*')
        .eq('guild_id', guildId)
        .order('message_count', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data
}

// Helper function to get top channels
export async function getTopChannels(guildId: string, limit: number = 10) {
    const { data, error } = await supabaseAdmin
        .from('channel_stats')
        .select('*')
        .eq('guild_id', guildId)
        .order('message_count', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data
}

// Helper function to get activity over time
export async function getActivityOverTime(guildId: string, days: number = 7) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabaseAdmin
        .from('daily_activity')
        .select('*')
        .eq('guild_id', guildId)
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true })

    if (error) throw error
    return data
}
