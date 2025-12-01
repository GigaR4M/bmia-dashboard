'use client'

import { useState, useMemo } from 'react'
import { useTopChannels, useTopVoiceChannels } from '@/hooks/useStats'
import { formatNumber, formatDateTime, formatDuration, cn } from '@/lib/utils'
import { Hash, MessageSquare, Mic } from 'lucide-react'
import { PeriodSelector, type DateFilter } from '@/components/dashboard/PeriodSelector'

type ViewType = 'messages' | 'voice'

export default function ChannelsPage() {
    const [view, setView] = useState<ViewType>('messages')
    const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'days', days: 30 })

    const period = useMemo(() => {
        if (dateFilter.type === 'days' && dateFilter.days) {
            return dateFilter.days
        }
        if (dateFilter.type === 'year') {
            const now = new Date()
            const startOfYear = new Date(now.getFullYear(), 0, 1)
            const diffTime = Math.abs(now.getTime() - startOfYear.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays
        }
        if (dateFilter.startDate && dateFilter.endDate) {
            const start = new Date(dateFilter.startDate)
            const end = new Date(dateFilter.endDate)
            const diffTime = Math.abs(end.getTime() - start.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays || 30
        }
        return 30
    }, [dateFilter])

    const { data: messageChannels, loading: loadingMessages } = useTopChannels(20, period)
    const { data: voiceChannels, loading: loadingVoice } = useTopVoiceChannels(20, period)

    const loading = view === 'messages' ? loadingMessages : loadingVoice
    const data = view === 'messages' ? messageChannels : voiceChannels

    console.log(`[ChannelsPage] Render: view=${view}, data.length=${data.length}`)

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Estatísticas de Canais</h1>
                    <p className="text-slate-400">Top canais mais ativos do servidor</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <PeriodSelector value={dateFilter} onChange={setDateFilter} />
                    <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 h-fit">
                        <button
                            onClick={() => setView('messages')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                                view === 'messages'
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                            )}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Mensagens
                        </button>
                        <button
                            onClick={() => setView('voice')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                                view === 'voice'
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                            )}
                        >
                            <Mic className="w-4 h-4" />
                            Tempo em Voz
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full" key={view}>
                        <thead className="bg-slate-900/50 border-b border-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Rank</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Canal</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                                    {view === 'messages' ? 'Mensagens' : 'Tempo em Voz'}
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                                    {view === 'messages' ? 'Última Mensagem' : 'Entradas'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                [...Array(10)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-8"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-24"></div></td>
                                    </tr>
                                ))
                            ) : (
                                data.map((channel: any, index: number) => (
                                    <tr key={channel.channel_id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm">
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                                                    {view === 'messages' ? <Hash className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                                </div>
                                                <span className="text-white font-medium">
                                                    {view === 'messages' ? '#' : ''}{channel.channel_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white font-semibold">
                                                {view === 'messages'
                                                    ? formatNumber(channel.message_count)
                                                    : formatDuration(channel.total_minutes)
                                                }
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-400 text-sm">
                                                {view === 'messages'
                                                    ? formatDateTime(channel.last_message_at)
                                                    : `${formatNumber(channel.join_count)} vezes`
                                                }
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
