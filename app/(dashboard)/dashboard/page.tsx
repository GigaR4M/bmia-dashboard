'use client'

import { useState, useMemo } from 'react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { PeriodSelector, type DateFilter } from '@/components/dashboard/PeriodSelector'
import { MemberGrowthChart } from '@/components/dashboard/charts/MemberGrowthChart'
import { MessageActivityChart } from '@/components/dashboard/charts/MessageActivityChart'
import { VoiceActivityChart } from '@/components/dashboard/charts/VoiceActivityChart'
import {
    useServerStats,
    useTopUsers,
    useTopChannels,
    useActivityOverTime,
    useVoiceActivityOverTime,
    useMemberStats,
    useTopVoiceUsers,
    useTopVoiceChannels,
    useEventStats,
    useModerationStats
} from '@/hooks/useStats'
import { Users, MessageSquare, Hash, TrendingUp, Mic, Calendar, ShieldAlert } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export default function DashboardPage() {
    const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'days', days: 30 })

    // Convert DateFilter to days for backward compatibility with existing hooks
    const period = useMemo(() => {
        if (dateFilter.type === 'days' && dateFilter.days) {
            return dateFilter.days
        }
        // For custom date ranges, calculate days difference
        if (dateFilter.startDate && dateFilter.endDate) {
            const start = new Date(dateFilter.startDate)
            const end = new Date(dateFilter.endDate)
            const diffTime = Math.abs(end.getTime() - start.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays || 30
        }
        return 30
    }, [dateFilter])

    const startDate = useMemo(() => {
        if (dateFilter.type === 'month' && dateFilter.startDate) {
            return dateFilter.startDate
        }
        if (dateFilter.type === 'custom' && dateFilter.startDate) {
            return dateFilter.startDate
        }
        if (dateFilter.type === 'year' && dateFilter.startDate) {
            return dateFilter.startDate
        }
        return undefined
    }, [dateFilter])

    // Server Stats
    const { data: serverStats, loading: serverLoading } = useServerStats(period, startDate)

    // Member Stats
    const { data: memberStats, loading: memberLoading } = useMemberStats(period, startDate)

    // Message Stats
    const { data: messageActivity, loading: messageActivityLoading } = useActivityOverTime(period, startDate)
    const { data: topUsers, loading: usersLoading } = useTopUsers(5, period, startDate)
    const { data: topChannels, loading: channelsLoading } = useTopChannels(5, period, startDate)

    // Voice Stats
    const { data: voiceActivity, loading: voiceActivityLoading } = useVoiceActivityOverTime(period, startDate)
    const { data: topVoiceUsers, loading: voiceUsersLoading } = useTopVoiceUsers(5, period, startDate)
    const { data: topVoiceChannels, loading: voiceChannelsLoading } = useTopVoiceChannels(5, period, startDate)

    // New Stats (Events & Moderation)
    const { data: eventStats, loading: eventLoading } = useEventStats(startDate)
    const { data: moderationStats, loading: moderationLoading } = useModerationStats(period, startDate)

    return (
        <div className="space-y-12">
            {/* Header & Period Selector */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Visão Geral</h1>
                    <p className="text-slate-400 text-sm">Estatísticas do servidor</p>
                </div>
                <PeriodSelector value={dateFilter} onChange={setDateFilter} />
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title={`Mensagens (${period}d)`}
                    value={serverStats ? formatNumber(serverStats.total_messages) : '0'}
                    icon={<MessageSquare className="w-8 h-8" />}
                    loading={serverLoading}
                />
                <StatsCard
                    title="Membros Totais"
                    value={serverStats ? formatNumber(serverStats.total_members) : '0'}
                    icon={<Users className="w-8 h-8" />}
                    loading={serverLoading}
                />
                <StatsCard
                    title={`Membros Ativos (${period}d)`}
                    value={serverStats ? formatNumber(serverStats.active_members) : '0'}
                    icon={<TrendingUp className="w-8 h-8" />}
                    loading={serverLoading}
                />
                <StatsCard
                    title="Total de Canais"
                    value={serverStats ? formatNumber(serverStats.total_channels) : '0'}
                    icon={<Hash className="w-8 h-8" />}
                    loading={serverLoading}
                />
                <StatsCard
                    title="Eventos (Total)"
                    value={eventStats ? formatNumber(eventStats.total_events) : '0'}
                    icon={<Calendar className="w-8 h-8" />}
                    loading={eventLoading}
                />
                <StatsCard
                    title={`Moderação (${period}d)`}
                    value={moderationStats ? formatNumber(moderationStats.total_moderated) : '0'}
                    icon={<ShieldAlert className="w-8 h-8" />}
                    loading={moderationLoading}
                />
            </div>

            {/* MEMBERS SECTION */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    Membros
                </h2>
                <MemberGrowthChart data={memberStats} loading={memberLoading} />
            </section>

            {/* MESSAGES SECTION */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                    Mensagens
                </h2>
                <MessageActivityChart data={messageActivity} loading={messageActivityLoading} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Message Users */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                        <h3 className="text-lg font-bold text-white mb-4">Top Usuários (Mensagens)</h3>
                        {usersLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                                            <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {topUsers.map((user, index) => (
                                    <div key={user.user_id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-700/30">
                                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium text-sm">{user.username}</p>
                                            <p className="text-slate-400 text-xs">{formatNumber(user.message_count)} msgs</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Message Channels */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                        <h3 className="text-lg font-bold text-white mb-4">Top Canais (Mensagens)</h3>
                        {channelsLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-700 rounded"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                                            <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {topChannels.map((channel, index) => (
                                    <div key={channel.channel_id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-700/30">
                                        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium text-sm">#{channel.channel_name}</p>
                                            <p className="text-slate-400 text-xs">{formatNumber(channel.message_count)} msgs</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* VOICE SECTION */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Mic className="w-5 h-5 text-blue-500" />
                    Voz
                </h2>
                <VoiceActivityChart data={voiceActivity} loading={voiceActivityLoading} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Voice Users */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                        <h3 className="text-lg font-bold text-white mb-4">Top Usuários (Tempo em Voz)</h3>
                        {voiceUsersLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                                            <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {topVoiceUsers.map((user, index) => (
                                    <div key={user.user_id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-700/30">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium text-sm">{user.username}</p>
                                            <p className="text-slate-400 text-xs">{formatNumber(user.total_minutes)} min</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Voice Channels */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                        <h3 className="text-lg font-bold text-white mb-4">Top Canais (Tempo em Voz)</h3>
                        {voiceChannelsLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="animate-pulse flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-700 rounded"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                                            <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {topVoiceChannels.map((channel, index) => (
                                    <div key={channel.channel_id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-700/30">
                                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium text-sm">#{channel.channel_name}</p>
                                            <p className="text-slate-400 text-xs">{formatNumber(channel.total_minutes)} min</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
