'use client'

import { useState, useEffect } from 'react'
import { Send, Eye, Edit3 } from 'lucide-react'
import EmbedBuilder, { EmbedData } from '@/components/dashboard/embed/EmbedBuilder'
import EmbedPreview from '@/components/dashboard/embed/EmbedPreview'
import ChannelSelector from '@/components/dashboard/embed/ChannelSelector'
import { sendEmbedRequest } from '@/app/actions'

export default function EmbedPage() {
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
    const [selectedChannelId, setSelectedChannelId] = useState('')
    const [sending, setSending] = useState(false)
    const [guildId, setGuildId] = useState('')

    useEffect(() => {
        const storedGuildId = localStorage.getItem('selectedGuildId')
        if (storedGuildId) {
            setGuildId(storedGuildId)
        }
    }, [])

    const [embed, setEmbed] = useState<EmbedData>({
        content: '',
        title: 'New Embed',
        description: 'This is a description.',
        url: '',
        color: '#3b82f6',
        timestamp: false,
        author: { name: '', url: '', icon_url: '' },
        footer: { text: '', icon_url: '' },
        image_url: '',
        thumbnail_url: '',
        fields: []
    })

    const handleSend = async () => {
        if (!selectedChannelId) {
            alert('Please select a channel first.')
            return
        }

        setSending(true)
        try {
            if (!guildId) throw new Error('No server selected')
            const result = await sendEmbedRequest(guildId, selectedChannelId, embed)

            if (!result.success) {
                throw new Error(result.error)
            }

            alert('Embed sent to queue! The bot will post it shortly.')
        } catch (error) {
            console.error('Error sending embed:', error)
            alert('Failed to send embed.')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Embed Builder</h1>
                <div className="flex gap-2">
                    {/* Mobile Tab Toggle */}
                    <div className="lg:hidden flex bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('edit')}
                            className={`px-3 py-1 rounded-md text-sm flex items-center gap-2 ${activeTab === 'edit' ? 'bg-blue-600 text-white' : 'text-gray-400'
                                }`}
                        >
                            <Edit3 size={16} /> Edit
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`px-3 py-1 rounded-md text-sm flex items-center gap-2 ${activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-400'
                                }`}
                        >
                            <Eye size={16} /> Preview
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Builder */}
                <div className={`space-y-6 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>
                    <EmbedBuilder embed={embed} onChange={setEmbed} />
                </div>

                {/* Right Column: Preview & Actions */}
                <div className={`space-y-6 ${activeTab === 'edit' ? 'hidden lg:block' : ''}`}>
                    <div className="sticky top-6 space-y-6">
                        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                <Eye size={20} /> Live Preview
                            </h2>
                            <div className="flex justify-center bg-[#36393f] p-8 rounded-lg border border-gray-700">
                                <EmbedPreview embed={embed} />
                            </div>
                        </div>

                        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
                            <h2 className="text-lg font-medium text-white flex items-center gap-2">
                                <Send size={20} /> Send Embed
                            </h2>

                            <ChannelSelector
                                guildId={guildId}
                                selectedChannelId={selectedChannelId}
                                onSelect={setSelectedChannelId}
                            />

                            <button
                                onClick={handleSend}
                                disabled={sending || !selectedChannelId}
                                className={`w-full py-3 px-4 rounded-md font-medium text-white flex items-center justify-center gap-2 transition-colors ${sending || !selectedChannelId
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {sending ? 'Sending...' : 'Send Embed'}
                                {!sending && <Send size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
