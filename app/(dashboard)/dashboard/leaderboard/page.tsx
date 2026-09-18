'use client'

import { useState, useMemo } from 'react'
import { useLeaderboard, useRankingHistory } from '@/hooks/useStats'
import { formatNumber } from '@/lib/utils'
import { getLevelProgress } from '@/lib/levels'
import { PeriodSelector, type DateFilter } from '@/components/dashboard/PeriodSelector'
import { HistoryChart } from '@/components/HistoryChart'
import { UserAvatar } from '@/components/ui/UserAvatar'

export default function LeaderboardPage() {
    const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'year' })

    const { period, startDate } = useMemo(() => {
        if (dateFilter.type === 'days' && dateFilter.days) {
            return { period: dateFilter.days, startDate: undefined }
        }
        if (dateFilter.type === 'year') {
            const now = new Date()
            const startOfYear = new Date(now.getFullYear(), 0, 1)
            const diffTime = Math.abs(now.getTime() - startOfYear.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return { period: diffDays, startDate: startOfYear.toISOString() }
        }
        if (dateFilter.startDate && dateFilter.endDate) {
            const start = new Date(dateFilter.startDate)
            const end = new Date(dateFilter.endDate)
            const diffTime = Math.abs(end.getTime() - start.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return { period: diffDays || 30, startDate: new Date(dateFilter.startDate).toISOString() }
        }
        return { period: 30, startDate: undefined }
    }, [dateFilter])

    const { data: leaderboard, loading, error } = useLeaderboard(50, period, startDate)

    // Fetch history for the chart
    const { data: historyData, loading: historyLoading } = useRankingHistory(period, startDate)

    // Prepare users list for the chart legend
    const topUsers = useMemo(() => {
        return leaderboard.slice(0, 10).map(u => ({
            user_id: u.user_id,
            username: u.username
        }))
    }, [leaderboard])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Leaderboard de XP & Níveis</h1>
                <p className="text-slate-400">Ranking oficial de interação e progressão do servidor</p>
            </div>

            <div className="flex justify-end">
                <PeriodSelector value={dateFilter} onChange={setDateFilter} />
            </div>

            {/* History Chart Section */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6">
                {historyLoading ? (
                    <div className="h-[400px] w-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <HistoryChart data={historyData} users={topUsers} />
                )}
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50 border-b border-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Rank</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Usuário</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Nível & Progresso</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">Total de XP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                [...Array(10)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="w-8 h-8 bg-slate-700 rounded-full"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-24"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-700 rounded w-16 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-red-400">
                                        Erro ao carregar leaderboard: {error}
                                    </td>
                                </tr>
                            ) : leaderboard.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                        Nenhum dado disponível.
                                    </td>
                                </tr>
                            ) : (
                                leaderboard.map((user) => {
                                    const progress = getLevelProgress(user.all_time_points ?? user.total_points)
                                    return (
                                        <tr key={user.user_id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                                    ${user.rank === 1 ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20' :
                                                        user.rank === 2 ? 'bg-slate-300 text-slate-900 shadow-lg shadow-slate-300/20' :
                                                            user.rank === 3 ? 'bg-amber-700 text-white shadow-lg shadow-amber-700/20' :
                                                                'bg-purple-600 text-white'}`}>
                                                    {user.rank}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar user={user} size="md" />
                                                    <div>
                                                        <p className="text-white font-medium">{user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5 min-w-[140px] max-w-[200px]">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                                                            Nv. {progress.level}
                                                        </span>
                                                        <span className="text-slate-400 font-medium">{progress.progressPct}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden">
                                                        <div 
                                                            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all duration-300"
                                                            style={{ width: `${progress.progressPct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-white font-semibold font-mono">
                                                    {formatNumber(user.total_points)} <span className="text-purple-400 text-xs font-sans">XP</span>
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}



