'use server'

import { supabaseAdmin } from '@/lib/supabase'

export async function sendEmbedRequest(guildId: string, channelId: string, embedData: any) {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client not initialized')
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
