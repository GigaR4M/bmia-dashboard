'use client'

import { useState, useMemo } from 'react'
import { useLeaderboard, useRankingHistory } from '@/hooks/useStats'
import { formatNumber } from '@/lib/utils'
import { getLevelProgress } from '@/lib/levels'
import { PeriodSelector, type DateFilter } from '@/components/dashboard/PeriodSelector'
import { HistoryChart } from '@/components/HistoryChart'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Trophy, Crown, Medal, Sparkles, Flame, Award } from 'lucide-react'

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

    const top1 = leaderboard[0]
    const top2 = leaderboard[1]
    const top3 = leaderboard[2]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-950/60 border border-yellow-500/40 text-yellow-300 text-xs font-bold font-orbitron tracking-widest uppercase mb-2">
                        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                        HALL DA FAMA & CLASSIFICAÇÃO
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white font-orbitron tracking-tight">Leaderboard de XP & Níveis</h1>
                    <p className="text-slate-400 text-sm font-rajdhani font-medium">Ranking oficial de interação, engajamento e progressão do servidor</p>
                </div>

                <div className="flex justify-end">
                    <PeriodSelector value={dateFilter} onChange={setDateFilter} />
                </div>
            </div>

            {/* Top 3 Podium Showcase (Estilo Esports / image_generator) */}
            {!loading && leaderboard.length >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-4">
                    {/* Top 2 - Silver */}
                    <div className="order-2 md:order-1 cyber-card rounded-2xl p-6 border-slate-700/60 laser-top relative overflow-hidden flex flex-col items-center text-center group hover:border-slate-400 transition-all">
                        <div className="relative mb-3">
                            <UserAvatar user={top2} size="lg" className="ring-4 ring-slate-300 bg-slate-900 shadow-[0_0_20px_rgba(203,213,225,0.4)]" />
                            <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-300 text-slate-950 font-black font-orbitron text-xs flex items-center justify-center shadow-lg">
                                #2
                            </span>
                        </div>
                        <h4 className="text-lg font-bold font-orbitron text-white truncate max-w-full group-hover:text-slate-200 transition-colors">
                            {top2.username}
                        </h4>
                        <span className="text-xs font-bold font-orbitron text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-600/50 mt-1 mb-3">
                            NÍVEL {getLevelProgress(top2.all_time_points ?? top2.total_points).level}
                        </span>
                        <div className="w-full bg-slate-900/90 rounded-xl p-2.5 border border-slate-700/50 font-orbitron">
                            <span className="text-sm font-bold text-slate-200">{formatNumber(top2.total_points)}</span>
                            <span className="text-slate-400 text-xs ml-1">XP</span>
                        </div>
                    </div>

                    {/* Top 1 - Gold (Destaque Principal) */}
                    <div className="order-1 md:order-2 cyber-card rounded-2xl p-7 border-yellow-500/50 laser-top-gold relative overflow-hidden flex flex-col items-center text-center bg-gradient-to-b from-yellow-950/40 via-slate-900/90 to-slate-950 shadow-[0_0_35px_rgba(255,215,0,0.15)] group scale-105 z-10">
                        <div className="absolute top-2 right-3 flex items-center gap-1 text-yellow-400 font-bold font-orbitron text-xs tracking-wider">
                            <Crown className="w-4 h-4 text-yellow-400 animate-pulse" />
                            TOP #1
                        </div>
                        <div className="relative mb-3 mt-1">
                            <UserAvatar user={top1} size="xl" className="ring-4 ring-yellow-400 bg-slate-900 shadow-[0_0_25px_rgba(255,215,0,0.6)]" />
                            <span className="absolute -top-3 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black font-orbitron text-sm flex items-center justify-center shadow-xl border border-yellow-200">
                                👑
                            </span>
                        </div>
                        <h4 className="text-xl font-black font-orbitron text-yellow-300 truncate max-w-full group-hover:text-yellow-200 transition-colors">
                            {top1.username}
                        </h4>
                        <span className="text-xs font-black font-orbitron text-yellow-400 bg-yellow-950/80 px-3 py-1 rounded-full border border-yellow-500/50 mt-1 mb-3 shadow-[0_0_10px_rgba(255,215,0,0.2)]">
                            NÍVEL {getLevelProgress(top1.all_time_points ?? top1.total_points).level} • LÍDER
                        </span>
                        <div className="w-full bg-yellow-950/50 rounded-xl p-3 border border-yellow-500/40 font-orbitron">
                            <span className="text-lg font-black text-yellow-300">{formatNumber(top1.total_points)}</span>
                            <span className="text-yellow-500 text-xs ml-1 font-bold">XP TOTAL</span>
                        </div>
                    </div>

                    {/* Top 3 - Bronze */}
                    <div className="order-3 cyber-card rounded-2xl p-6 border-amber-800/60 laser-top relative overflow-hidden flex flex-col items-center text-center group hover:border-amber-600 transition-all">
                        <div className="relative mb-3">
                            <UserAvatar user={top3} size="lg" className="ring-4 ring-amber-600 bg-slate-900 shadow-[0_0_20px_rgba(217,119,6,0.3)]" />
                            <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-600 text-white font-black font-orbitron text-xs flex items-center justify-center shadow-lg">
                                #3
                            </span>
                        </div>
                        <h4 className="text-lg font-bold font-orbitron text-white truncate max-w-full group-hover:text-amber-200 transition-colors">
                            {top3.username}
                        </h4>
                        <span className="text-xs font-bold font-orbitron text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-700/50 mt-1 mb-3">
                            NÍVEL {getLevelProgress(top3.all_time_points ?? top3.total_points).level}
                        </span>
                        <div className="w-full bg-slate-900/90 rounded-xl p-2.5 border border-slate-700/50 font-orbitron">
                            <span className="text-sm font-bold text-amber-300">{formatNumber(top3.total_points)}</span>
                            <span className="text-slate-400 text-xs ml-1">XP</span>
                        </div>
                    </div>
                </div>
            )}

            {/* History Chart Section */}
            <div className="cyber-card laser-top-purple rounded-2xl p-6 relative overflow-hidden">
                {historyLoading ? (
                    <div className="h-[400px] w-full flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <HistoryChart data={historyData} users={topUsers} />
                )}
            </div>

            {/* Table Section */}
            <div className="cyber-card laser-top-cyan rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold font-orbitron text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-cyan-400" />
                        Tabela de Classificação Completa
                    </h3>
                    <span className="text-xs font-mono text-slate-400">{leaderboard.length} membros rankeados</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-950/60 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold font-orbitron text-slate-400 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-4 text-left text-xs font-bold font-orbitron text-slate-400 uppercase tracking-wider">Membro</th>
                                <th className="px-6 py-4 text-left text-xs font-bold font-orbitron text-slate-400 uppercase tracking-wider">Nível & Progresso</th>
                                <th className="px-6 py-4 text-right text-xs font-bold font-orbitron text-slate-400 uppercase tracking-wider">Total de XP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-rajdhani">
                            {loading ? (
                                [...Array(10)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="w-8 h-8 bg-slate-800 rounded-full"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-800 rounded w-24"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 bg-slate-800 rounded w-16 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-rose-400 font-medium">
                                        Erro ao carregar leaderboard: {error}
                                    </td>
                                </tr>
                            ) : leaderboard.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                        Nenhum dado disponível para o período selecionado.
                                    </td>
                                </tr>
                            ) : (
                                leaderboard.map((user) => {
                                    const progress = getLevelProgress(user.all_time_points ?? user.total_points)
                                    const isTop1 = user.rank === 1
                                    const isTop2 = user.rank === 2
                                    const isTop3 = user.rank === 3

                                    return (
                                        <tr key={user.user_id} className="hover:bg-slate-800/40 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black font-orbitron text-xs
                                                    ${isTop1 ? 'bg-yellow-400 text-slate-950 shadow-[0_0_12px_rgba(255,215,0,0.6)] border border-yellow-200' :
                                                        isTop2 ? 'bg-slate-300 text-slate-950 shadow-[0_0_10px_rgba(203,213,225,0.4)]' :
                                                            isTop3 ? 'bg-amber-600 text-white shadow-[0_0_10px_rgba(217,119,6,0.4)]' :
                                                                'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                                                    {user.rank}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <UserAvatar
                                                        user={user}
                                                        size="md"
                                                        className={isTop1 ? "ring-2 ring-yellow-400" : isTop2 ? "ring-2 ring-slate-300" : isTop3 ? "ring-2 ring-amber-600" : ""}
                                                    />
                                                    <div>
                                                        <p className="text-white font-bold font-orbitron text-sm group-hover:text-cyan-300 transition-colors">{user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1.5 min-w-[150px] max-w-[220px]">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-bold font-orbitron text-cyan-300 bg-cyan-950/70 px-2.5 py-0.5 rounded border border-cyan-500/40">
                                                            Nv. {progress.level}
                                                        </span>
                                                        <span className="text-slate-400 font-mono font-medium">{progress.progressPct}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                                                        <div 
                                                            className="bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                                                            style={{ width: `${progress.progressPct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-white font-extrabold font-orbitron text-base">
                                                    {formatNumber(user.total_points)} <span className="text-cyan-400 text-xs font-mono">XP</span>
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
