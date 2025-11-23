'use client'

import { StatsCard } from '@/components/dashboard/StatsCard'
import { useServerStats, useTopUsers, useTopChannels } from '@/hooks/useStats'
import { Users, MessageSquare, Hash, TrendingUp } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export default function DashboardPage() {
    const { data: serverStats, loading: serverLoading } = useServerStats()
    const { data: topUsers, loading: usersLoading } = useTopUsers(5)
    const { data: topChannels, loading: channelsLoading } = useTopChannels(5)

    const periodDays = serverStats?.period_days || 30

    return (
        <div className="space-y-8">
            {/* Period Info */}
            <div className="text-slate-400 text-sm">
                📊 Estatísticas dos últimos <span className="font-semibold text-white">{periodDays} dias</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title={`Mensagens (${periodDays}d)`}
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
                    title={`Membros Ativos (${periodDays}d)`}
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
            </div>

            {/* Top Users and Channels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Users */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-bold text-white mb-4">Top Usuários ({periodDays}d)</h3>
                    {usersLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
                                        <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : topUsers.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">Nenhum dado disponível</p>
                    ) : (
                        <div className="space-y-3">
                            {topUsers.map((user, index) => (
                                <div
                                    key={user.user_id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{user.username}</p>
                                        <p className="text-slate-400 text-sm">
                                            {formatNumber(user.message_count)} mensagens
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Channels */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-xl font-bold text-white mb-4">Top Canais ({periodDays}d)</h3>
                    {channelsLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-700 rounded"></div>
                                    <div className="flex-1">
                                        <div className="h-4 bg-slate-700 rounded w-1/2 mb-2"></div>
                                        <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : topChannels.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">Nenhum dado disponível</p>
                    ) : (
                        <div className="space-y-3">
                            {topChannels.map((channel, index) => (
                                <div
                                    key={channel.channel_id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-purple-600 rounded flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium flex items-center gap-2">
                                            #{channel.channel_name}
                                            {channel.is_voice && (
                                                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                                    🎤 Voz
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-slate-400 text-sm">
                                            {formatNumber(channel.message_count)} {channel.is_voice ? 'atividades' : 'mensagens'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
