import { supabaseAdmin } from './supabase'

export interface GiveawayStats {
    total_giveaways: number
    active_giveaways: number
    ended_giveaways: number
    total_participants: number
    avg_participants_per_giveaway: number
}

export interface GiveawayItem {
    giveaway_id: number
    prize: string
    winner_count: number
    host_user_id: string
    ends_at: string
    ended: boolean
    created_at: string
    participant_count: number
}

export interface TopParticipant {
    user_id: string
    username: string
    discriminator: string
    entry_count: number
    wins_count: number
}

export interface DailyParticipation {
    date: string
    new_giveaways: number
    total_entries: number
    unique_participants: number
}

// Get giveaway statistics
export async function getGiveawayStats(
    guildId: string,
    days: number = 30
): Promise<GiveawayStats | null> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_giveaway_stats', {
            p_guild_id: guildId,
            p_days: days
        })

    if (error) {
        console.error('Error fetching giveaway stats:', error)
        return null
    }

    if (!data || data.length === 0) return null

    const row = data[0]
    return {
        total_giveaways: Number(row.total_giveaways),
        active_giveaways: Number(row.active_giveaways),
        ended_giveaways: Number(row.ended_giveaways),
        total_participants: Number(row.total_participants),
        avg_participants_per_giveaway: Number(row.avg_participants_per_giveaway)
    }
}

// Get giveaway list
export async function getGiveawayList(
    guildId: string,
    limit: number = 20,
    activeOnly: boolean = false
): Promise<GiveawayItem[]> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_giveaway_list', {
            p_guild_id: guildId,
            p_limit: limit,
            p_active_only: activeOnly
        })

    if (error) {
        console.error('Error fetching giveaway list:', error)
        return []
    }

    if (!data) return []

    return data.map((row: any) => ({
        giveaway_id: Number(row.giveaway_id),
        prize: row.prize || 'Unknown Prize',
        winner_count: Number(row.winner_count),
        host_user_id: String(row.host_user_id),
        ends_at: row.ends_at,
        ended: Boolean(row.ended),
        created_at: row.created_at,
        participant_count: Number(row.participant_count)
    }))
}

// Get top participants
export async function getTopParticipants(
    guildId: string,
    days: number = 30,
    limit: number = 10
): Promise<TopParticipant[]> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_top_giveaway_participants', {
            p_guild_id: guildId,
            p_days: days,
            p_limit: limit
        })

    if (error) {
        console.error('Error fetching top participants:', error)
        return []
    }

    if (!data) return []

    return data.map((row: any) => ({
        user_id: String(row.user_id),
        username: row.username || 'Unknown User',
        discriminator: row.discriminator || '0000',
        entry_count: Number(row.entry_count),
        wins_count: Number(row.wins_count)
    }))
}

// Get daily participation
export async function getDailyParticipation(
    guildId: string,
    days: number = 30
): Promise<DailyParticipation[]> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
        .rpc('get_daily_giveaway_participation', {
            p_guild_id: guildId,
            p_days: days,
            p_timezone: 'America/Sao_Paulo'
        })

    if (error) {
        console.error('Error fetching daily participation:', error)
        return []
    }

    if (!data) return []

    return data.map((row: any) => ({
        date: row.date,
        new_giveaways: Number(row.new_giveaways),
        total_entries: Number(row.total_entries),
        unique_participants: Number(row.unique_participants)
    }))
}
