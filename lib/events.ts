import { supabaseAdmin } from './supabase'
import type { EventStats, ScheduledEventItem } from '@/types'

export async function getEventsData(guildId: string, limit: number = 50): Promise<{
    stats: EventStats
    events: ScheduledEventItem[]
}> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    try {
        const { data, error } = await supabaseAdmin
            .rpc('get_events_list', {
                p_guild_id: guildId,
                p_limit: limit
            })

        if (error) {
            console.error('Error fetching events from RPC:', error)
            return {
                stats: { total_events: 0, upcoming_events: 0, active_events: 0, completed_events: 0, total_participants: 0 },
                events: []
            }
        }

        const rawList = data || []

        const events: ScheduledEventItem[] = rawList.map((row: any) => {
            const rawStatus = (row.status || 'SCHEDULED').toUpperCase()
            // Normalize EventStatus.completed / EventStatus.canceled / etc.
            let status = rawStatus
            if (rawStatus.includes('COMPLETED')) status = 'COMPLETED'
            else if (rawStatus.includes('CANCELED') || rawStatus.includes('CANCELLED')) status = 'CANCELED'
            else if (rawStatus.includes('ACTIVE')) status = 'ACTIVE'
            else if (rawStatus.includes('SCHEDULED')) status = 'SCHEDULED'

            return {
                event_id: String(row.event_id),
                guild_id: String(row.guild_id),
                name: row.name || 'Evento sem título',
                description: row.description || null,
                start_time: row.start_time,
                end_time: row.end_time || null,
                status,
                creator_id: row.creator_id ? String(row.creator_id) : null,
                creator_name: row.creator_name || null,
                creator_avatar: row.creator_avatar || null,
                entity_type: row.entity_type || null,
                location: row.location || null,
                participant_count: Number(row.participant_count) || 0,
                interested_count: Number(row.interested_count) || 0,
                attended_count: Number(row.attended_count) || 0,
                created_at: row.created_at
            }
        })

        const now = new Date()
        let upcoming = 0
        let active = 0
        let completed = 0
        let totalParts = 0

        events.forEach(e => {
            const statusUpper = e.status.toUpperCase()
            const startTime = new Date(e.start_time)
            const endTime = e.end_time ? new Date(e.end_time) : null

            if (statusUpper.includes('ACTIVE')) {
                active++
            } else if (statusUpper.includes('COMPLETED')) {
                completed++
            } else if (statusUpper.includes('SCHEDULED') || startTime > now) {
                upcoming++
            } else if (endTime && endTime < now) {
                completed++
            } else {
                upcoming++
            }
            totalParts += e.participant_count
        })

        const stats: EventStats = {
            total_events: events.length,
            upcoming_events: upcoming,
            active_events: active,
            completed_events: completed,
            total_participants: totalParts
        }

        return { stats, events }
    } catch (error) {
        console.error('Unexpected error in getEventsData:', error)
        return {
            stats: { total_events: 0, upcoming_events: 0, active_events: 0, completed_events: 0, total_participants: 0 },
            events: []
        }
    }
}
