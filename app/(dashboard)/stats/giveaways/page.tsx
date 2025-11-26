'use client'

import { useState, useMemo } from 'react'
import { PeriodSelector, type DateFilter } from '@/components/dashboard/PeriodSelector'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { useGiveawayStats } from '@/hooks/useStats'
import { Gift, Users, TrendingUp, Award } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function GiveawaysPage() {
    const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'days', days: 30 })
    const [showActiveOnly, setShowActiveOnly] = useState(false)

    const period = useMemo(() => {
        if (dateFilter.type === 'days' && dateFilter.days) return dateFilter.days
        if (dateFilter.startDate && dateFilter.endDate) {
            const start = new Date(dateFilter.startDate)
            const end = new Date(dateFilter.endDate)
            const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
            return diffDays || 30
        }
        return 30
    }, [dateFilter])

    const { data, loading } = useGiveawayStats(period, 20, showActiveOnly)

    const stats = data?.stats || {
        total_giveaways: 0,
        active_giveaways: 0,
        ended_giveaways: 0,
        total_participants: 0,
        avg_participants_per_giveaway: 0
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Sorteios</h1>
                    <p className="text-slate-400 text-sm">Estatísticas e histórico de giveaways</p>
                </div>
                <PeriodSelector value={dateFilter} onChange={setDateFilter} />
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total de Sorteios"
                    value={formatNumber(stats.total_giveaways)}
                    icon={<Gift className="w-8 h-8" />}
                    loading={loading}
                />
                <StatsCard
                    title="Sorteios Ativos"
                    value={formatNumber(stats.active_giveaways)}
                    icon={<TrendingUp className="w-8 h-8" />}
                    loading={loading}
                />
                <StatsCard
                    title="Total de Participantes"
                    value={formatNumber(stats.total_participants)}
                    icon={<Users className="w-8 h-8" />}
                    loading={loading}
                />
                <StatsCard
                    title="Média de Participantes"
                    value={stats.avg_participants_per_giveaway.toFixed(1)}
                    icon={<Award className="w-8 h-8" />}
                    loading={loading}
                />
            </div>

            {/* Daily Participation Chart */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Participação ao Longo do Tempo</h3>
                {loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="text-slate-500">Carregando...</div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data?.dailyParticipation || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickFormatter={(value) => {
                                    const [year, month, day] = value.split('-').map(Number)
                                    const date = new Date(year, month - 1, day)
                                    return format(date, 'dd/MM', { locale: ptBR })
                                }}
                                tickMargin={10}
                            />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                                labelFormatter={(value) => {
                                    const [year, month, day] = value.split('-').map(Number)
                                    const date = new Date(year, month - 1, day)
                                    return format(date, "d 'de' MMMM", { locale: ptBR })
                                }}
                            />
                            <Legend />
                            <Bar dataKey="new_giveaways" name="Novos Sorteios" fill="#9333ea" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="total_entries" name="Participações" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Participants */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-bold text-white mb-4">Top Participantes</h3>
                    {loading ? (
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
                            {(data?.topParticipants || []).map((user: any, index: number) => (
                                <div key={user.user_id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-700/30">
                                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium text-sm">{user.username}</p>
                                        <p className="text-slate-400 text-xs">{user.entry_count} participações</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Giveaways */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Sorteios Recentes</h3>
                        <button
                            onClick={() => setShowActiveOnly(!showActiveOnly)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${showActiveOnly
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {showActiveOnly ? 'Apenas Ativos' : 'Todos'}
                        </button>
                    </div>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="animate-pulse p-3 bg-slate-700/30 rounded-lg">
                                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {(data?.giveaways || []).map((giveaway: any) => (
                                <div
                                    key={giveaway.giveaway_id}
                                    className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <p className="text-white font-medium text-sm mb-1">{giveaway.prize}</p>
                                            <p className="text-slate-400 text-xs">
                                                {giveaway.participant_count} participantes • {giveaway.winner_count} vencedor(es)
                                            </p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${giveaway.ended
                                                    ? 'bg-slate-600 text-slate-300'
                                                    : 'bg-green-600 text-white'
                                                }`}
                                        >
                                            {giveaway.ended ? 'Finalizado' : 'Ativo'}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-xs mt-2">
                                        {giveaway.ended
                                            ? `Finalizado ${formatDistanceToNow(new Date(giveaway.ends_at), { addSuffix: true, locale: ptBR })}`
                                            : `Termina ${formatDistanceToNow(new Date(giveaway.ends_at), { addSuffix: true, locale: ptBR })}`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
