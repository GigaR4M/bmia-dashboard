export interface ServerStats {
    guild_id: string
    total_messages: number
    total_members: number
    active_members: number
    total_channels: number
    last_updated: string
}

export interface UserStats {
    user_id: string
    guild_id: string
    username: string
    discriminator: string
    avatar_url?: string
    message_count: number
    last_message_at: string
}

export interface ChannelStats {
    channel_id: string
    guild_id: string
    channel_name: string
    message_count: number
    last_message_at: string
}

export interface DailyActivity {
    id: string
    guild_id: string
    date: string
    message_count: number
    active_users: number
}
