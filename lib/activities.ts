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

const KNOWN_GAMES: Record<string, string> = {
    'roblox': 'Roblox',
    'ea sports fc 24': 'EA Sports FC 24',
    'ea sports fc 25': 'EA Sports FC 25',
    'ea sports fc 26': 'EA Sports FC 26',
    'valorant': 'VALORANT',
    'counter-strike 2': 'Counter-Strike 2',
    'cs2': 'Counter-Strike 2',
    'league of legends': 'League of Legends',
    'rocket league': 'Rocket League',
    'dead by daylight': 'Dead by Daylight',
    'visual studio code': 'Visual Studio Code',
    'tlauncher': 'TLauncher',
    'curseforge': 'CurseForge',
    'no man\'s sky': 'No Man\'s Sky',
    'project zomboid': 'Project Zomboid',
    'valheim': 'Valheim'
}

function normalizeGameName(name: string): string {
    if (!name) return 'Unknown'
    const clean = name.trim().replace(/\s+/g, ' ')
    const lower = clean.toLowerCase()
    return KNOWN_GAMES[lower] || clean
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

    // Filtra Hang Status / Spotify e consolida case-insensitive
    const rawRows = (data || []).filter((row: any) => {
        const name = (row.activity_name || '').trim().toLowerCase()
        return name !== 'hang status' && name !== 'spotify' && name !== ''
    })

    const map = new Map<string, TopActivity>()
    for (const row of rawRows) {
        const normName = normalizeGameName(row.activity_name)
        const key = normName.toLowerCase()
        const totalSeconds = Number(row.total_seconds) || 0
        const sessionCount = Number(row.session_count) || 0
        const uniqueUsers = Number(row.unique_users) || 0
        const totalHours = Number(row.total_hours) || (totalSeconds / 3600)

        if (map.has(key)) {
            const existing = map.get(key)!
            existing.session_count += sessionCount
            existing.total_seconds += totalSeconds
            existing.total_hours = Math.round((existing.total_seconds / 3600) * 100) / 100
            existing.unique_users = Math.max(existing.unique_users, uniqueUsers)
            existing.avg_seconds = existing.session_count > 0 ? existing.total_seconds / existing.session_count : 0
        } else {
            map.set(key, {
                activity_name: normName,
                unique_users: uniqueUsers,
                session_count: sessionCount,
                total_seconds: totalSeconds,
                avg_seconds: Number(row.avg_seconds) || (sessionCount > 0 ? totalSeconds / sessionCount : 0),
                total_hours: totalHours
            })
        }
    }

    const aggregated = Array.from(map.values()).sort((a, b) => b.total_seconds - a.total_seconds)
    return aggregated.slice(0, limit)
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
