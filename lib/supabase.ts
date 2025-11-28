import { createClient } from '@supabase/supabase-js'
import type { DailyActivity, DailyVoiceActivity, DailyMemberStats, VoiceUserStats, VoiceChannelStats } from '@/types'

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

// Helper function to get server stats
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
export async function getTopChannels(guildId: string, limit: number = 10, days: number = 30) {
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

// Helper function to get activity over time using RPC (Timezone aware)
export async function getActivityOverTime(guildId: string, days: number = 30): Promise<DailyActivity[]> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_daily_message_stats', {
            p_guild_id: guildId,
            p_days: days,
            p_timezone: 'America/Sao_Paulo'
        })

    if (error) {
        console.error('Error fetching activity stats:', error)
        return []
    }

    if (!data) return []

    return data.map((row: any) => ({
        id: row.date,
        guild_id: guildId,
        date: row.date,
        message_count: Number(row.message_count),
        active_users: Number(row.active_users)
    }))
}

// Helper function to get voice activity over time
export async function getVoiceActivityOverTime(guildId: string, days: number = 30): Promise<DailyVoiceActivity[]> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_daily_voice_stats', {
            p_guild_id: guildId,
            p_days: days,
            p_timezone: 'America/Sao_Paulo'
        })

    if (error) {
        console.error('Error fetching voice stats:', error)
        return []
    }

    if (!data) return []

    return data.map((row: any) => ({
        id: row.date,
        guild_id: guildId,
        date: row.date,
        total_minutes: Number(row.total_minutes),
        active_users: Number(row.active_users)
    }))
}

// Helper function to get member stats (Joins)
export async function getMemberStats(guildId: string, days: number = 30): Promise<DailyMemberStats[]> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_daily_member_stats', {
            p_guild_id: guildId,
            p_days: days,
            p_timezone: 'America/Sao_Paulo'
        })

    if (error) {
        console.error('Error fetching member stats:', error)
        return []
    }

    if (!data) return []

    return data.map((row: any) => ({
        id: row.date,
        date: row.date,
        joins: Number(row.joins),
        leaves: Number(row.leaves),
        total_members: Number(row.total_members)
    }))
}

// Helper function to get top users by voice
export async function getTopVoiceUsers(guildId: string, limit: number = 10, days: number = 30): Promise<VoiceUserStats[]> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_top_users_by_voice', {
            p_guild_id: guildId,
            p_days: days,
            p_limit: limit
        })

    if (error) {
        console.error('Error fetching top voice users:', error)
        return []
    }

    if (!data) return []

    return data.map((user: any) => ({
        user_id: String(user.user_id),
        username: user.username || 'Usuário Desconhecido',
        discriminator: user.discriminator || '0000',
        total_minutes: Number(user.total_minutes),
        last_seen: user.last_seen || new Date().toISOString()
    }))
}

// Helper function to get top channels by voice
export async function getTopVoiceChannels(guildId: string, limit: number = 10, days: number = 30): Promise<VoiceChannelStats[]> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_top_channels_by_voice', {
            p_guild_id: guildId,
            p_days: days,
            p_limit: limit
        })

    if (error) {
        console.error('Error fetching top voice channels:', error)
        return []
    }

    if (!data) return []

    return data
        .filter((channel: any) => Number(channel.total_minutes) > 0)
        .map((channel: any) => ({
            channel_id: String(channel.channel_id),
            channel_name: channel.channel_name || 'Canal Desconhecido',
            channel_type: channel.channel_type || 'voice',
            total_minutes: Number(channel.total_minutes),
            join_count: Number(channel.join_count)
        }))
}
