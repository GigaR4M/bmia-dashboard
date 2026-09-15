import { supabaseAdmin } from './supabase'
import type { TournamentItem, TournamentStats, TournamentParticipant } from '@/types'

export async function getTournamentsData(guildId: string, limit: number = 50): Promise<{
    stats: TournamentStats
    tournaments: TournamentItem[]
}> {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
    }

    try {
        const { data, error } = await supabaseAdmin
            .rpc('get_tournaments_list', {
                p_guild_id: guildId,
                p_limit: limit
            })

        if (error) {
            console.error('Error fetching tournaments from RPC:', error)
            return {
                stats: { total_tournaments: 0, active_tournaments: 0, finished_tournaments: 0, total_participants: 0 },
                tournaments: []
            }
        }

        const rawList = data || []

        const tournaments: TournamentItem[] = rawList.map((row: any) => {
            const rawStatus = (row.status || 'open').toLowerCase()
            const status = rawStatus === 'completed' ? 'finished' : rawStatus

            const winner = row.winner_id ? {
                user_id: String(row.winner_id),
                username: row.winner_name || `Jogador (${String(row.winner_id).slice(-4)})`,
                avatar_url: row.winner_avatar || null
            } : null

            const secondPlace = row.second_place_id ? {
                user_id: String(row.second_place_id),
                username: row.second_place_name || `Jogador (${String(row.second_place_id).slice(-4)})`,
                avatar_url: row.second_place_avatar || null
            } : null

            const thirdPlace = row.third_place_id ? {
                user_id: String(row.third_place_id),
                username: row.third_place_name || `Jogador (${String(row.third_place_id).slice(-4)})`,
                avatar_url: row.third_place_avatar || null
            } : null

            const participants: TournamentParticipant[] = Array.isArray(row.participants)
                ? row.participants.map((p: any) => ({
                    user_id: String(p.user_id),
                    username: p.username || 'Jogador',
                    discriminator: p.discriminator || '0000',
                    avatar_url: p.avatar_url || null,
                    status: p.status || 'registered'
                }))
                : []

            const winnerTeam = participants.filter(p => p.status === 'winner')
            if (winnerTeam.length === 0 && winner) {
                winnerTeam.push({
                    user_id: winner.user_id,
                    username: winner.username,
                    avatar_url: winner.avatar_url,
                    status: 'winner'
                })
            }

            const secondPlaceTeam = participants.filter(p => p.status === 'runner_up')
            if (secondPlaceTeam.length === 0 && secondPlace) {
                secondPlaceTeam.push({
                    user_id: secondPlace.user_id,
                    username: secondPlace.username,
                    avatar_url: secondPlace.avatar_url,
                    status: 'runner_up'
                })
            }

            const thirdPlaceTeam = participants.filter(p => p.status === 'third_place')
            if (thirdPlaceTeam.length === 0 && thirdPlace) {
                thirdPlaceTeam.push({
                    user_id: thirdPlace.user_id,
                    username: thirdPlace.username,
                    avatar_url: thirdPlace.avatar_url,
                    status: 'third_place'
                })
            }

            return {
                id: Number(row.id),
                guild_id: String(row.guild_id),
                name: row.name || 'Torneio',
                game_name: row.game_name || 'Geral',
                format: row.format || '1v1',
                tournament_type: row.tournament_type || 'bracket',
                max_participants: Number(row.max_participants) || 16,
                participant_count: Number(row.participant_count) || participants.length,
                prize: row.prize || null,
                start_time: row.start_time || null,
                status,
                final_score: row.final_score || null,
                created_at: row.created_at || new Date().toISOString(),
                winner,
                second_place: secondPlace,
                third_place: thirdPlace,
                winner_team: winnerTeam,
                second_place_team: secondPlaceTeam,
                third_place_team: thirdPlaceTeam,
                participants
            }
        })

        let activeCount = 0
        let finishedCount = 0
        let totalPartsCount = 0

        tournaments.forEach(t => {
            if (t.status === 'open' || t.status === 'active') {
                activeCount++
            } else if (t.status === 'finished' || t.status === 'completed') {
                finishedCount++
            }
            totalPartsCount += t.participant_count
        })

        const stats: TournamentStats = {
            total_tournaments: tournaments.length,
            active_tournaments: activeCount,
            finished_tournaments: finishedCount,
            total_participants: totalPartsCount
        }

        return { stats, tournaments }
    } catch (error) {
        console.error('Unexpected error in getTournamentsData:', error)
        return {
            stats: { total_tournaments: 0, active_tournaments: 0, finished_tournaments: 0, total_participants: 0 },
            tournaments: []
        }
    }
}
