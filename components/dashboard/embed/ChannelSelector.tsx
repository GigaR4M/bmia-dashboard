'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Channel {
    channel_id: string
    channel_name: string
    channel_type: string
}

interface ChannelSelectorProps {
    guildId: string
    selectedChannelId: string
    onSelect: (channelId: string) => void
}

export default function ChannelSelector({ guildId, selectedChannelId, onSelect }: ChannelSelectorProps) {
    const [channels, setChannels] = useState<Channel[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchChannels() {
            if (!guildId) return

            setLoading(true)
            try {
                // Fetch text channels only
                const { data, error } = await supabase!
                    .from('channels')
                    .select('channel_id::text, channel_name, channel_type')
                    .eq('guild_id', guildId)
                    .in('channel_type', ['text', 'news']) // Only text-based channels
                    .order('channel_name')

                if (error) throw error
                setChannels(data || [])

                // Auto-select first channel if none selected
                if (!selectedChannelId && data && data.length > 0) {
                    onSelect(data[0].channel_id)
                }
            } catch (error) {
                console.error('Error fetching channels:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchChannels()
    }, [guildId])

    if (loading) {
        return <div className="animate-pulse h-10 bg-gray-700 rounded w-full"></div>
    }

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-400 mb-1">
                Destination Channel
            </label>
            <select
                value={selectedChannelId}
                onChange={(e) => onSelect(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="" disabled>Select a channel</option>
                {channels.map((channel) => (
                    <option key={channel.channel_id} value={channel.channel_id}>
                        #{channel.channel_name}
                    </option>
                ))}
            </select>
        </div>
    )
}
