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

// Helper function to get top users (adapted for BMIA bot schema)
export async function getTopUsers(guildId: string, limit: number = 10, days: number = 30) {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    // Get message counts per user in period
    const { data: messageCounts } = await supabaseAdmin
        .from('messages')
        .select('user_id')
        .eq('guild_id', guildId)
        .gte('created_at', cutoffDate.toISOString())

    if (!messageCounts || messageCounts.length === 0) return []

    // Count messages per user
    const userMessageMap = new Map<number, number>()
    messageCounts.forEach(msg => {
        const userId = typeof msg.user_id === 'string' ? parseInt(msg.user_id) : msg.user_id
        const count = userMessageMap.get(userId) || 0
        userMessageMap.set(userId, count + 1)
    })

    // Sort by message count
    const sortedUsers = Array.from(userMessageMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)

    // Get user details
    const userIds = sortedUsers.map(([userId]) => userId)
    const { data: users } = await supabaseAdmin
        .from('users')
        .select('user_id, username, discriminator, last_seen')
        .in('user_id', userIds)

    if (!users) return []

    // Combine data
    return sortedUsers.map(([userId, messageCount]) => {
        const user = users.find(u => {
            const dbUserId = typeof u.user_id === 'string' ? parseInt(u.user_id) : u.user_id
            return dbUserId === userId
        })

        return {
            user_id: userId.toString(),
            guild_id: guildId,
            username: user?.username || 'Usuário Desconhecido',
            discriminator: user?.discriminator || '0000',
            avatar_url: null,
            message_count: messageCount,
            last_message_at: user?.last_seen || new Date().toISOString()
        }
    })
}

// Helper function to get top channels (adapted for BMIA bot schema)
export async function getTopChannels(guildId: string, limit: number = 10, days: number = 30, includeVoice: boolean = false) {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    // Get message counts per channel in period
    const { data: messageCounts } = await supabaseAdmin
        .from('messages')
        .select('channel_id')
        .eq('guild_id', guildId)
        .gte('created_at', cutoffDate.toISOString())

    const channelMessageMap = new Map<number, number>()

    if (messageCounts) {
        messageCounts.forEach(msg => {
            const channelId = typeof msg.channel_id === 'string' ? parseInt(msg.channel_id) : msg.channel_id
            const count = channelMessageMap.get(channelId) || 0
            channelMessageMap.set(channelId, count + 1)
        })
    }

    // Get voice activity if requested
    if (includeVoice) {
        const { data: voiceActivity } = await supabaseAdmin
            .from('voice_activity')
            .select('channel_id')
            .eq('guild_id', guildId)
            .gte('joined_at', cutoffDate.toISOString())

        if (voiceActivity) {
            voiceActivity.forEach(activity => {
                const channelId = typeof activity.channel_id === 'string' ? parseInt(activity.channel_id) : activity.channel_id
                const count = channelMessageMap.get(channelId) || 0
                channelMessageMap.set(channelId, count + 1)
            })
        }
    }

    if (channelMessageMap.size === 0) return []

    // Sort by activity count
    const sortedChannels = Array.from(channelMessageMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)

    // Get channel details
    const channelIds = sortedChannels.map(([channelId]) => channelId)
    const { data: channels } = await supabaseAdmin
        .from('channels')
        .select('channel_id, channel_name, channel_type')
        .in('channel_id', channelIds)

    if (!channels) return []

    // Get last activity timestamp for each channel
    const lastActivityPromises = channelIds.map(async (channelId) => {
        // Check messages
        const { data: lastMessage } = await supabaseAdmin
            .from('messages')
            .select('created_at')
            .eq('channel_id', channelId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        // Check voice activity
        const { data: lastVoice } = await supabaseAdmin
            .from('voice_activity')
            .select('joined_at')
            .eq('channel_id', channelId)
            .order('joined_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        const messageTime = lastMessage?.created_at ? new Date(lastMessage.created_at).getTime() : 0
        const voiceTime = lastVoice?.joined_at ? new Date(lastVoice.joined_at).getTime() : 0
        const lastActivity = Math.max(messageTime, voiceTime)

        return {
            channelId,
            lastActivity: lastActivity > 0 ? new Date(lastActivity).toISOString() : new Date().toISOString()
        }
    })

    const lastActivities = await Promise.all(lastActivityPromises)
    const lastActivityMap = new Map(
        lastActivities.map(({ channelId, lastActivity }) => [channelId, lastActivity])
    )

    // Combine data
    return sortedChannels.map(([channelId, activityCount]) => {
        const channel = channels.find(c => {
            const dbChannelId = typeof c.channel_id === 'string' ? parseInt(c.channel_id) : c.channel_id
            return dbChannelId === channelId
        })

        const channelType = channel?.channel_type || 'text'
        const isVoice = channelType === 'voice' || channelType.includes('voice')

        return {
            channel_id: channelId.toString(),
            guild_id: guildId,
            channel_name: channel?.channel_name || 'Canal Desconhecido',
            channel_type: channelType,
            message_count: activityCount,
            is_voice: isVoice,
            last_message_at: lastActivityMap.get(channelId) || new Date().toISOString()
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
    const dateMap = new Map<string, { messages: number, users: Set<number> }>()

    data.forEach(msg => {
        const date = msg.created_at.split('T')[0]
        const userId = typeof msg.user_id === 'string' ? parseInt(msg.user_id) : msg.user_id

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
