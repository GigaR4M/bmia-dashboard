import { supabaseAdmin } from './supabase'

export interface TopActivity {
    activity_name: string
    unique_users: number
    session_count: number
    total_seconds: number
    avg_seconds: number
    total_hours: number
}

export interface DailyActivityStats {
    date: string
    total_sessions: number
    unique_users: number
    total_hours: number
    avg_session_minutes: number
}

export interface TopUserByActivity {
    user_id: string
    username: string
    discriminator: string
    session_count: number
    total_seconds: number
    total_hours: number
    avg_session_minutes: number
}

export interface ActivityTypeDistribution {
    activity_type: string
    session_count: number
    unique_users: number
    total_hours: number
}

// Get top activities by total time
export async function getTopActivities(
    guildId: string,
    days: number = 30,
    limit: number = 10
): Promise<TopActivity[]> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_top_activities', {
            p_guild_id: guildId,
            p_days: days,
            p_limit: limit,
            p_timezone: 'America/Sao_Paulo'
        })

    if (error) {
        console.error('Error fetching top activities:', error)
        return []
    }

    if (!data) return []

    return data.map((row: any) => ({
        activity_name: row.activity_name || 'Unknown',
        unique_users: Number(row.unique_users),
        session_count: Number(row.session_count),
        total_seconds: Number(row.total_seconds),
        avg_seconds: Number(row.avg_seconds),
        total_hours: Number(row.total_hours)
    }))
}

// Get daily activity statistics
export async function getDailyActivityStats(
    guildId: string,
    days: number = 30
): Promise<DailyActivityStats[]> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_daily_activity_stats', {
            p_guild_id: guildId,
            p_days: days,
            p_timezone: 'America/Sao_Paulo'
        })

    if (error) {
        console.error('Error fetching daily activity stats:', error)
        return []
    }

    if (!data) return []

    return data.map((row: any) => ({
        date: row.date,
        total_sessions: Number(row.total_sessions),
        unique_users: Number(row.unique_users),
        total_hours: Number(row.total_hours),
        avg_session_minutes: Number(row.avg_session_minutes)
    }))
}

// Get top users by activity time
export async function getTopUsersByActivity(
    guildId: string,
    activityName: string | null = null,
    days: number = 30,
    limit: number = 10
): Promise<TopUserByActivity[]> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_top_users_by_activity', {
            p_guild_id: guildId,
            p_activity_name: activityName,
            p_days: days,
            p_limit: limit
        })

    if (error) {
        console.error('Error fetching top users by activity:', error)
        return []
    }

    if (!data) return []

    return data.map((row: any) => ({
        user_id: String(row.user_id),
        username: row.username || 'Unknown User',
        discriminator: row.discriminator || '0000',
        session_count: Number(row.session_count),
        total_seconds: Number(row.total_seconds),
        total_hours: Number(row.total_hours),
        avg_session_minutes: Number(row.avg_session_minutes)
    }))
}

// Get activity type distribution
export async function getActivityTypeDistribution(
    guildId: string,
    days: number = 30
): Promise<ActivityTypeDistribution[]> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_activity_type_distribution', {
            p_guild_id: guildId,
            p_days: days
        })

    if (error) {
        console.error('Error fetching activity type distribution:', error)
        return []
    }

    if (!data) return []

    return data.map((row: any) => ({
        activity_type: row.activity_type || 'Unknown',
        session_count: Number(row.session_count),
        unique_users: Number(row.unique_users),
        total_hours: Number(row.total_hours)
    }))
}

// Get total unique active users
export async function getTotalUniqueUsers(
    guildId: string,
    days: number = 30
): Promise<number> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_total_unique_active_users', {
            p_guild_id: guildId,
            p_days: days
        })

    if (error) {
        console.error('Error fetching total unique users:', error)
        return 0
    }

    return Number(data)
}
