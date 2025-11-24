import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Client for browser/client-side operations
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// Admin client for server-side operations with elevated permissions
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null

// Helper function to get server stats (adapted for BMIA bot schema)
export async function getServerStats(guildId: string, days: number = 30) {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    // Get total messages in period
    const { count: totalMessages } = await supabaseAdmin
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('guild_id', guildId)
        .gte('created_at', cutoffDate.toISOString())

    // Get active members (users who sent messages in period)
    const { data: activeUsersData } = await supabaseAdmin
        .from('messages')
        .select('user_id')
        .eq('guild_id', guildId)
        .gte('created_at', cutoffDate.toISOString())

    const activeMembers = activeUsersData
        ? new Set(activeUsersData.map(m => m.user_id)).size
        : 0

    // Get total members (all time)
    const { count: totalMembers } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })

    // Get total channels
    const { count: totalChannels } = await supabaseAdmin
        .from('channels')
        .select('*', { count: 'exact', head: true })
        .eq('guild_id', guildId)

    return {
        guild_id: guildId,
        total_messages: totalMessages || 0,
        total_members: totalMembers || 0,
        active_members: activeMembers,
        total_channels: totalChannels || 0,
        period_days: days,
        last_updated: new Date().toISOString()
    }
}

// Helper function to get top users using RPC function
export async function getTopUsers(guildId: string, limit: number = 10, days: number = 30) {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_top_users_by_messages', {
            p_guild_id: guildId,
            p_days: days,
            p_limit: limit
        })

    if (error) {
        console.error('Error fetching top users:', error)
        return []
    }

    if (!data) return []

    // Transform the data to match expected format
    return data.map((user: any) => ({
        user_id: String(user.user_id),
        guild_id: guildId,
        username: user.username || 'Usuário Desconhecido',
        discriminator: user.discriminator || '0000',
        avatar_url: null,
        message_count: Number(user.message_count),
        last_message_at: user.last_seen || new Date().toISOString()
    }))
}

// Helper function to get top channels using RPC function
export async function getTopChannels(guildId: string, limit: number = 10, days: number = 30, includeVoice: boolean = false) {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_top_channels_by_messages', {
            p_guild_id: guildId,
            p_days: days,
            p_limit: limit
        })

    if (error) {
        console.error('Error fetching top channels:', error)
        return []
    }

    if (!data) return []

    // Transform the data to match expected format
    return data.map((channel: any) => {
        const channelType = channel.channel_type || 'text'
        const isVoice = channelType === 'voice' || channelType.includes('voice')

        return {
            channel_id: String(channel.channel_id),
            guild_id: guildId,
            channel_name: channel.channel_name || 'Canal Desconhecido',
            channel_type: channelType,
            message_count: Number(channel.message_count),
            is_voice: isVoice,
            last_message_at: channel.last_activity || new Date().toISOString()
        }
    })
}

// Helper function to get activity over time (adapted for BMIA bot schema)
export async function getActivityOverTime(guildId: string, days: number = 7) {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data } = await supabaseAdmin
        .from('messages')
        .select('created_at, user_id')
        .eq('guild_id', guildId)
        .gte('created_at', startDate.toISOString())

    if (!data) return []

    // Group by date
    const dateMap = new Map<string, { messages: number, users: Set<string> }>()

    data.forEach(msg => {
        const date = msg.created_at.split('T')[0]
        const userId = String(msg.user_id)

        if (!dateMap.has(date)) {
            dateMap.set(date, { messages: 0, users: new Set() })
        }

        const dayData = dateMap.get(date)!
        dayData.messages++
        dayData.users.add(userId)
    })

    // Convert to array and sort
    return Array.from(dateMap.entries())
        .map(([date, data]) => ({
            id: date,
            guild_id: guildId,
            date,
            message_count: data.messages,
            active_users: data.users.size
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
}
