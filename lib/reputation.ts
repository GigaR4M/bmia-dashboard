// lib/reputation.ts - Helper functions for moderation, dossiers and user reports
import { supabaseAdmin } from './supabase'

export interface Infraction {
    id: number
    guild_id: string
    user_id: string
    moderator_id: string
    action_type: string
    reason?: string
    duration_seconds?: number
    created_at: string
    moderator_username?: string
}

export interface UserReport {
    id: number
    guild_id: string
    target_user_id: string
    reporter_user_id: string
    category: string
    reason: string
    message_content?: string
    message_id?: string
    channel_id?: string
    attachment_urls?: string[]
    status: 'pending' | 'approved' | 'rejected'
    handled_by?: string
    handled_at?: string
    created_at: string
    target_username?: string
    target_avatar_url?: string
    reporter_username?: string
    handler_username?: string
}

export interface UserDossier {
    user: {
        user_id: string
        username: string
        discriminator: string
        avatar_url: string
        registered_at: string
    } | null
    join_source: {
        inviter_id?: string
        invite_code?: string
        joined_at: string
        inviter_username?: string
    } | null
    infractions: Infraction[]
    infractions_summary: Record<string, { count: number; total_duration: number }>
    reports: UserReport[]
    moderated_messages_count: number
    total_points: number
    trust_score: {
        score: number
        tier: 'EXCELLENT' | 'GOOD' | 'OBSERVATION' | 'HIGH_RISK'
        label: string
        penalties: [string, number][]
        bonuses: [string, number][]
    }
}

export function calculateTrustScore(
    accountAgeDays: number,
    serverMembershipDays: number,
    infractionsSummary: Record<string, { count: number; total_duration: number }>,
    reportsCount: number = 0,
    approvedReportsCount: number = 0,
    moderatedMessagesCount: number = 0
) {
    let score = 100
    const penalties: [string, number][] = []
    const bonuses: [string, number][] = []

    if (accountAgeDays > 1095) bonuses.push(['Conta veterana (> 3 anos)', 5])
    else if (accountAgeDays > 365) bonuses.push(['Conta estabelecida (> 1 ano)', 3])
    else if (accountAgeDays < 7) {
        penalties.push(['Conta recém-criada (< 7 dias)', 25])
        score -= 25
    } else if (accountAgeDays < 30) {
        penalties.push(['Conta recente (< 30 dias)', 10])
        score -= 10
    }

    if (serverMembershipDays > 180) bonuses.push(['Membro há mais de 6 meses', 5])
    else if (serverMembershipDays > 60) bonuses.push(['Membro há mais de 2 meses', 2])

    const warns = infractionsSummary.warn?.count || 0
    if (warns > 0) {
        const p = Math.min(20, warns * 5)
        penalties.push([`${warns}x Advertência(s)`, p])
        score -= p
    }

    const timeouts = infractionsSummary.timeout?.count || 0
    if (timeouts > 0) {
        const p = Math.min(30, timeouts * 10)
        penalties.push([`${timeouts}x Castigo/Timeout`, p])
        score -= p
    }

    const mutes = (infractionsSummary.mute?.count || 0) + (infractionsSummary.hardmute?.count || 0)
    if (mutes > 0) {
        const p = Math.min(30, mutes * 15)
        penalties.push([`${mutes}x Mute/Hardmute`, p])
        score -= p
    }

    const kicks = (infractionsSummary.kick?.count || 0) + (infractionsSummary.softban?.count || 0)
    if (kicks > 0) {
        const p = Math.min(40, kicks * 25)
        penalties.push([`${kicks}x Expulsão/Kick`, p])
        score -= p
    }

    const bans = (infractionsSummary.ban?.count || 0) + (infractionsSummary.tempban?.count || 0)
    if (bans > 0) {
        const p = Math.min(50, bans * 40)
        penalties.push([`${bans}x Ban/Tempban anterior`, p])
        score -= p
    }

    if (moderatedMessagesCount > 0) {
        const p = Math.min(20, moderatedMessagesCount * 4)
        penalties.push([`${moderatedMessagesCount}x Mensagens Ofensivas (IA)`, p])
        score -= p
    }

    if (approvedReportsCount > 0) {
        const p = Math.min(30, approvedReportsCount * 15)
        penalties.push([`${approvedReportsCount}x Denúncia(s) confirmada(s)`, p])
        score -= p
    }

    const totalBonus = bonuses.reduce((acc, b) => acc + b[1], 0)
    score = Math.min(100, Math.max(0, score + totalBonus))

    let tier: 'EXCELLENT' | 'GOOD' | 'OBSERVATION' | 'HIGH_RISK' = 'EXCELLENT'
    let label = '🟢 Confiável / Excelente'

    if (score >= 90) {
        tier = 'EXCELLENT'
        label = '🟢 Confiável / Excelente'
    } else if (score >= 70) {
        tier = 'GOOD'
        label = '🟡 Regular / Bom'
    } else if (score >= 50) {
        tier = 'OBSERVATION'
        label = '🟠 Sob Observação'
    } else {
        tier = 'HIGH_RISK'
        label = '🔴 Alto Risco / Suspeito'
    }

    return { score, tier, label, penalties, bonuses }
}

export function getDiscordAccountCreatedAt(snowflakeStr: string): Date {
    try {
        const idBig = BigInt(snowflakeStr)
        const timestamp = Number((idBig >> BigInt(22)) + BigInt("1420070400000"))
        return new Date(timestamp)
    } catch {
        return new Date()
    }
}

export async function getUserDossier(guildId: string, userId: string): Promise<UserDossier | null> {
    if (!supabaseAdmin) throw new Error('Supabase client not initialized')

    // 1. User basic info (cast user_id to text to prevent BigInt truncation)
    const { data: userData, error: userErr } = await supabaseAdmin
        .from('users')
        .select('user_id::text, username, discriminator, avatar_url, first_seen')
        .eq('user_id', userId)
        .maybeSingle()

    // 2. Join source from member_join_sources
    const { data: joinData } = await supabaseAdmin
        .from('member_join_sources')
        .select('guild_id::text, user_id::text, inviter_id::text, invite_code, joined_at')
        .eq('guild_id', guildId)
        .eq('user_id', userId)
        .maybeSingle()

    // 2.1 Fallback join date from member_join_dates if joinData not present
    let fallbackJoinDate: string | null = null
    if (!joinData?.joined_at) {
        const { data: memberDate } = await supabaseAdmin
            .from('member_join_dates')
            .select('joined_at')
            .eq('guild_id', guildId)
            .eq('user_id', userId)
            .maybeSingle()
        if (memberDate?.joined_at) {
            fallbackJoinDate = memberDate.joined_at
        }
    }

    // 2.2 Inviter username if available
    let inviterUsername: string | undefined = undefined
    if (joinData?.inviter_id) {
        if (String(joinData.inviter_id) === String(userId)) {
            inviterUsername = 'Criador deste link'
        } else {
            const { data: inviterUser } = await supabaseAdmin
                .from('users')
                .select('username')
                .eq('user_id', joinData.inviter_id)
                .maybeSingle()
            inviterUsername = inviterUser?.username
        }
    }

    // 3. Infractions
    const { data: infractionsData } = await supabaseAdmin
        .from('user_infractions')
        .select('id, guild_id::text, user_id::text, moderator_id::text, action_type, reason, duration_seconds, created_at')
        .eq('guild_id', guildId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    // 4. Reports
    const { data: reportsData } = await supabaseAdmin
        .from('user_reports')
        .select('id, guild_id::text, target_user_id::text, reporter_user_id::text, category, reason, message_content, message_id::text, channel_id::text, attachment_urls, status, handled_by::text, handled_at, created_at')
        .eq('guild_id', guildId)
        .eq('target_user_id', userId)
        .order('created_at', { ascending: false })

    // 5. Moderated messages
    const { count: moderatedCount } = await supabaseAdmin
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('guild_id', guildId)
        .eq('user_id', userId)
        .eq('was_moderated', true)

    // 6. Interaction points (total all-time XP)
    let totalPoints = 0
    // Try getting latest total_points snapshot from daily_user_stats
    const { data: latestDaily } = await supabaseAdmin
        .from('daily_user_stats')
        .select('total_points')
        .eq('guild_id', guildId)
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (latestDaily?.total_points && Number(latestDaily.total_points) > 0) {
        totalPoints = Number(latestDaily.total_points)
    } else {
        // Fallback to sum of interaction points
        const { data: pointsData } = await supabaseAdmin
            .from('interaction_points')
            .select('points')
            .eq('guild_id', guildId)
            .eq('user_id', userId)
            .limit(100000)
        totalPoints = pointsData?.reduce((sum, p) => sum + (Number(p.points) || 0), 0) || 0
    }

    // Compute summary
    const summary: Record<string, { count: number; total_duration: number }> = {}
    ;(infractionsData || []).forEach((inf: any) => {
        if (!summary[inf.action_type]) {
            summary[inf.action_type] = { count: 0, total_duration: 0 }
        }
        summary[inf.action_type].count += 1
        summary[inf.action_type].total_duration += inf.duration_seconds || 0
    })

    const now = new Date()
    // Exact Discord account creation date from Discord snowflake ID
    const discordCreatedAt = getDiscordAccountCreatedAt(userId)
    const accountAgeDays = Math.floor((now.getTime() - discordCreatedAt.getTime()) / (1000 * 60 * 60 * 24))

    const joinDateStr = joinData?.joined_at || fallbackJoinDate
    const joinDate = joinDateStr ? new Date(joinDateStr) : now
    const serverMembershipDays = joinDateStr ? Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)) : 0

    const approvedReports = (reportsData || []).filter((r: any) => r.status === 'approved').length

    const trustScore = calculateTrustScore(
        accountAgeDays,
        serverMembershipDays,
        summary,
        reportsData?.length || 0,
        approvedReports,
        moderatedCount || 0
    )

    return {
        user: {
            user_id: userId,
            username: userData?.username || `Usuário (${userId.slice(-4)})`,
            discriminator: userData?.discriminator || '0',
            avatar_url: userData?.avatar_url || '',
            registered_at: discordCreatedAt.toISOString()
        },
        join_source: {
            inviter_id: joinData?.inviter_id,
            invite_code: joinData?.invite_code,
            joined_at: joinDateStr || '',
            inviter_username: inviterUsername
        },
        infractions: infractionsData || [],
        infractions_summary: summary,
        reports: reportsData || [],
        moderated_messages_count: moderatedCount || 0,
        total_points: totalPoints,
        trust_score: trustScore
    }
}

export async function getGuildReports(guildId: string, status?: string): Promise<UserReport[]> {
    if (!supabaseAdmin) throw new Error('Supabase client not initialized')

    let query = supabaseAdmin
        .from('user_reports')
        .select('*')
        .eq('guild_id', guildId)
        .order('created_at', { ascending: false })

    if (status) {
        query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) {
        console.error('Error fetching reports:', error)
        return []
    }
    return data || []
}

export async function updateReportStatus(reportId: number, status: 'approved' | 'rejected', handledBy: string): Promise<boolean> {
    if (!supabaseAdmin) throw new Error('Supabase client not initialized')

    const { error } = await supabaseAdmin
        .from('user_reports')
        .update({
            status,
            handled_by: handledBy,
            handled_at: new Date().toISOString()
        })
        .eq('id', reportId)

    return !error
}
