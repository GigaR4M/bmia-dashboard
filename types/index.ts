export interface ServerStats {
    guild_id: string
    total_messages: number
    total_members: number
    active_members: number
    total_channels: number
    period_days: number
    last_updated: string
}

export interface UserStats {
    user_id: string
    guild_id: string
    username: string
    discriminator: string
    avatar_url?: string | null
    message_count: number
    last_message_at: string
}

export interface ChannelStats {
    channel_id: string
    guild_id: string
    channel_name: string
    channel_type: string
    message_count: number
    is_voice: boolean
    last_message_at: string
}

export interface DailyActivity {
    date: string
    message_count: number
    active_users: number
}

export interface DailyVoiceActivity {
    date: string
    total_minutes: number
    active_users: number
}

export interface DailyMemberStats {
    date: string
    total_members: number
    joins: number
    leaves: number
}

export interface VoiceUserStats {
    user_id: string
    username: string
    discriminator: string
    avatar_url?: string | null
    total_minutes: number
    last_seen: string
}

export interface LeaderboardUser {
    user_id: string
    username: string
    discriminator: string
    total_points: number
    rank: number
    avatar_url?: string | null
}

export interface VoiceChannelStats {
    channel_id: string
    channel_name: string
    total_minutes: number
    join_count: number
}

export interface EventStats {
    total_events: number
    upcoming_events: number
    total_participants: number
    active_events?: number
    completed_events?: number
}

export interface ScheduledEventItem {
    event_id: string
    guild_id: string
    name: string
    description?: string | null
    start_time: string
    end_time?: string | null
    status: string
    creator_id?: string | null
    creator_name?: string | null
    creator_avatar?: string | null
    entity_type?: string | null
    location?: string | null
    participant_count: number
    interested_count: number
    attended_count: number
    created_at?: string
}

export interface TournamentStats {
    total_tournaments: number
    active_tournaments: number
    finished_tournaments: number
    total_participants: number
}

export interface TournamentParticipant {
    user_id: string
    username: string
    discriminator?: string
    avatar_url?: string | null
    status: string
}

export interface TournamentItem {
    id: number
    guild_id: string
    name: string
    game_name: string
    format: string
    max_participants: number
    participant_count: number
    prize?: string | null
    start_time?: string | null
    status: 'open' | 'active' | 'finished' | 'cancelled' | string
    final_score?: string | null
    created_at: string
    winner?: {
        user_id: string
        username: string
        avatar_url?: string | null
    } | null
    second_place?: {
        user_id: string
        username: string
        avatar_url?: string | null
    } | null
    third_place?: {
        user_id: string
        username: string
        avatar_url?: string | null
    } | null
    winner_team?: TournamentParticipant[]
    second_place_team?: TournamentParticipant[]
    third_place_team?: TournamentParticipant[]
    participants?: TournamentParticipant[]
}

export interface ModerationStats {
    total_moderated: number
    last_24h: number
}
