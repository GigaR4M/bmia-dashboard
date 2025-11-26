'use client'

import { useState, useMemo } from 'react'
import { PeriodSelector, type DateFilter } from '@/components/dashboard/PeriodSelector'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { useActivityStats } from '@/hooks/useStats'
import { Gamepad2, Users, Clock, TrendingUp } from 'lucide-react'
import { formatNumber } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const COLORS = ['#9333ea', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1']

export default function ActivitiesPage() {
    const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'days', days: 30 })

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

    const { data, loading } = useActivityStats(period, 10)

    const totalSessions = data?.topActivities?.reduce((sum: number, a: any) => sum + a.session_count, 0) || 0
    const totalHours = data?.topActivities?.reduce((sum: number, a: any) => sum + a.total_hours, 0) || 0
    const uniqueUsers = data?.totalUniqueUsers || 0
    const topActivity = data?.topActivities?.[0]?.activity_name || 'N/A'

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Atividades de Usuários</h1>
                    <p className="text-slate-400 text-sm">Jogos e presenças rastreadas</p>
                </div>
                <PeriodSelector value={dateFilter} onChange={setDateFilter} />
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total de Sessões"
                    value={formatNumber(totalSessions)}
                    icon={<Gamepad2 className="w-8 h-8" />}
                    loading={loading}
                />
                <StatsCard
                    title="Horas Totais"
                    value={totalHours.toFixed(1)}
                    icon={<Clock className="w-8 h-8" />}
                    loading={loading}
                />
                <StatsCard
                    title="Usuários Únicos"
                    value={formatNumber(uniqueUsers)}
                    icon={<Users className="w-8 h-8" />}
                    loading={loading}
                />
                <StatsCard
                    title="Atividade Top"
                    value={topActivity}
                    icon={<TrendingUp className="w-8 h-8" />}
                    loading={loading}
                />
            </div>

            {/* Top Activities Chart */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Top 10 Atividades (por tempo total)</h3>
                {loading ? (
                    <div className="h-[400px] flex items-center justify-center">
                        <div className="text-slate-500">Carregando...</div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data?.topActivities || []} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                            <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                            <YAxis type="category" dataKey="activity_name" stroke="#94a3b8" fontSize={12} width={140} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                                formatter={(value: number, name: string) => {
                                    if (name === 'total_hours') return [value.toFixed(1) + 'h', 'Horas Totais']
                                    return [value, name]
                                }}
                            />
                            <Legend />
                            <Bar dataKey="total_hours" name="Horas Totais" fill="#9333ea" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Type Distribution */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-bold text-white mb-4">Distribuição por Tipo</h3>
                    {loading ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <div className="text-slate-500">Carregando...</div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data?.typeDistribution || []}
                                    dataKey="total_hours"
                                    nameKey="activity_type"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={(entry: any) => `${entry.activity_type}: ${entry.total_hours.toFixed(1)}h`}
                                >
                                    {(data?.typeDistribution || []).map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                                    formatter={(value: number) => value.toFixed(1) + 'h'}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Top Users */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-bold text-white mb-4">Top Usuários (Tempo Total)</h3>
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
                            {(data?.topUsers || []).map((user: any, index: number) => (
                                <div key={user.user_id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-700/30">
                                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium text-sm">{user.username}</p>
                                        <p className="text-slate-400 text-xs">{user.total_hours.toFixed(1)}h • {user.session_count} sessões</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Daily Activity Stats */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Atividade ao Longo do Tempo</h3>
                {loading ? (
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="text-slate-500">Carregando...</div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data?.dailyStats || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                                formatter={(value: number, name: string) => {
                                    if (name === 'total_hours') return [value.toFixed(1) + 'h', 'Horas']
                                    return [value, name]
                                }}
                            />
                            <Legend />
                            <Bar dataKey="total_hours" name="Horas" fill="#9333ea" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="unique_users" name="Usuários" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}
