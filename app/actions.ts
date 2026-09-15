'use server'

import { auth, validateGuildAccess } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function sendEmbedRequest(guildId: string, channelId: string, embedData: any) {
    const session = await auth()

    if (!session || !session.user?.isAdmin) {
        return { success: false, error: 'Unauthorized' }
    }

    if (!guildId || !validateGuildAccess(session, guildId)) {
        return { success: false, error: 'Forbidden' }
    }

    if (!supabaseAdmin) {
        return { success: false, error: 'Supabase admin client not initialized' }
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('embed_requests')
            .insert({
                guild_id: guildId,
                channel_id: channelId,
                message_data: embedData,
                status: 'pending'
            })
            .select()
            .single()

        if (error) {
            console.error('Error inserting embed request:', error)
            return { success: false, error: error.message }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Unexpected error in sendEmbedRequest:', error)
        return { success: false, error: 'Internal Server Error' }
    }
}
