'use client'

import { useState, useMemo } from 'react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { useTournaments } from '@/hooks/useStats'
import { Swords, Trophy, Flame, CheckCircle2, Users, Gamepad2, Award, Clock } from 'lucide-react'
import { formatNumber, cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { UserAvatar } from '@/components/ui/UserAvatar'

type TournamentFilter = 'all' | 'open' | 'active' | 'finished'

export default function TournamentsPage() {
    const [statusFilter, setStatusFilter] = useState<TournamentFilter>('all')
    const { stats, tournaments, loading, error } = useTournaments()

    const filteredTournaments = useMemo(() => {
        if (!tournaments) return []
        if (statusFilter === 'all') return tournaments
        return tournaments.filter(t => t.status === statusFilter)
    }, [tournaments, statusFilter])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Inscrições Abertas
                    </span>
                )
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Flame className="w-3 h-3 text-amber-400" />
                        Em Andamento
                    </span>
                )
            case 'finished':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        <CheckCircle2 className="w-3 h-3 text-purple-400" />
                        Finalizado
                    </span>
                )
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Cancelado
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                        {status}
                    </span>
                )
        }
    }

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr)
            return format(d, "dd 'de' MMM, yyyy", { locale: ptBR })
        } catch {
            return dateStr
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Torneios e Campeonatos</h1>
                    <p className="text-slate-400 text-sm">Histórico de torneios, pódios e jogadores</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 w-fit">
                    {(['all', 'open', 'active', 'finished'] as TournamentFilter[]).map((tab) => {
                        const labels: Record<TournamentFilter, string> = {
                            all: 'Todos',
                            open: 'Abertos',
                            active: 'Em Andamento',
                            finished: 'Finalizados'
                        }
                        const isActive = statusFilter === tab
                        return (
                            <button
                                key={tab}
                                onClick={() => setStatusFilter(tab)}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                                        : "text-slate-400 hover:text-white hover:bg-slate-700/40"
                                )}
                            >
                                {labels[tab]}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total de Torneios"
                    value={formatNumber(stats.total_tournaments)}
                    icon={<Swords className="w-7 h-7 text-purple-400" />}
                    loading={loading}
                />
                <StatsCard
                    title="Torneios Abertos"
                    value={formatNumber(stats.active_tournaments)}
                    icon={<Flame className="w-7 h-7 text-amber-400" />}
                    loading={loading}
                />
                <StatsCard
                    title="Torneios Concluídos"
                    value={formatNumber(stats.finished_tournaments)}
                    icon={<Trophy className="w-7 h-7 text-yellow-400" />}
                    loading={loading}
                />
                <StatsCard
                    title="Total de Inscrições"
                    value={formatNumber(stats.total_participants)}
                    icon={<Users className="w-7 h-7 text-pink-400" />}
                    loading={loading}
                />
            </div>

            {/* Tournaments Grid */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Lista de Torneios ({filteredTournaments.length})
                </h3>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 space-y-4">
                                <div className="h-6 bg-slate-700 rounded w-1/3"></div>
                                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                                <div className="h-20 bg-slate-700/40 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-6 rounded-xl text-center">
                        Erro ao carregar torneios: {error}
                    </div>
                ) : filteredTournaments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-700 text-slate-400 text-center space-y-2">
                        <Swords className="w-12 h-12 text-slate-600 mb-2" />
                        <p className="text-lg font-medium text-slate-300">Nenhum torneio encontrado</p>
                        <p className="text-sm text-slate-500">
                            {statusFilter === 'all'
                                ? 'Nenhum torneio foi criado ainda neste servidor.'
                                : `Não há torneios com status "${statusFilter}".`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredTournaments.map((tournament) => {
                            const percentFilled = Math.min(100, Math.round((tournament.participant_count / tournament.max_participants) * 100))
                            const hasWinners = tournament.winner || tournament.second_place || tournament.third_place

                            return (
                                <div
                                    key={tournament.id}
                                    className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/40 transition-all rounded-xl p-6 flex flex-col justify-between space-y-5 shadow-sm"
                                >
                                    {/* Header & Badges */}
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                                        <Gamepad2 className="w-3.5 h-3.5" />
                                                        {tournament.game_name}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-700/60 text-slate-300">
                                                        {tournament.format}
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-bold text-white leading-tight">
                                                    {tournament.name}
                                                </h4>
                                            </div>
                                            {getStatusBadge(tournament.status)}
                                        </div>

                                        {/* Prize & Info */}
                                        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-1">
                                            {tournament.prize && (
                                                <div className="flex items-center gap-1.5 text-yellow-400 font-medium bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 rounded-lg">
                                                    <Award className="w-4 h-4" />
                                                    <span>Prêmio: {tournament.prize}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Clock className="w-4 h-4 text-purple-400" />
                                                <span>Criado em {formatDate(tournament.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Capacity Progress Bar */}
                                        <div className="space-y-1.5 pt-2">
                                            <div className="flex justify-between text-xs text-slate-400">
                                                <span>Vagas preenchidas</span>
                                                <span className="font-semibold text-slate-200">
                                                    {tournament.participant_count} / {tournament.max_participants} ({percentFilled}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        percentFilled >= 100 ? "bg-emerald-500" : "bg-purple-600"
                                                    )}
                                                    style={{ width: `${percentFilled}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Podium / Winners Section */}
                                    {hasWinners && (() => {
                                        const winnerTeam = (tournament.winner_team && tournament.winner_team.length > 0)
                                            ? tournament.winner_team
                                            : (tournament.winner ? [tournament.winner] : [])

                                        const secondTeam = (tournament.second_place_team && tournament.second_place_team.length > 0)
                                            ? tournament.second_place_team
                                            : (tournament.second_place ? [tournament.second_place] : [])

                                        const thirdTeam = (tournament.third_place_team && tournament.third_place_team.length > 0)
                                            ? tournament.third_place_team
                                            : (tournament.third_place ? [tournament.third_place] : [])

                                        const getTeamLabel = (team: typeof winnerTeam, rank: 1 | 2 | 3) => {
                                            const isTeam = team.length > 1
                                            if (rank === 1) return isTeam ? (team.length === 2 ? 'Dupla Campeã' : 'Equipe Campeã') : 'Campeão'
                                            if (rank === 2) return isTeam ? (team.length === 2 ? '2º Lugar (Dupla)' : '2º Lugar (Equipe)') : '2º Lugar'
                                            return isTeam ? (team.length === 2 ? '3º Lugar (Dupla)' : '3º Lugar (Equipe)') : '3º Lugar'
                                        }

                                        return (
                                            <div className="bg-slate-900/60 rounded-lg p-3.5 border border-slate-700/40 space-y-2">
                                                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
                                                    <span className="flex items-center gap-1 text-yellow-400">
                                                        <Trophy className="w-3.5 h-3.5" /> Pódio do Torneio
                                                    </span>
                                                    {tournament.final_score && (
                                                        <span className="text-slate-300">
                                                            Placar: <strong className="text-white">{tournament.final_score}</strong>
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-3 gap-2">
                                                    {/* 1st Place */}
                                                    <div className="flex flex-col items-center text-center p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                                                        <div className="relative mb-1.5 flex items-center justify-center">
                                                            {winnerTeam.length > 1 ? (
                                                                <div className="flex -space-x-2 overflow-hidden py-0.5 px-1">
                                                                    {winnerTeam.map((member, idx) => (
                                                                        <UserAvatar
                                                                            key={member.user_id || idx}
                                                                            user={member}
                                                                            size="sm"
                                                                            className="ring-2 ring-yellow-400 bg-slate-900"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <UserAvatar
                                                                    user={winnerTeam[0] || tournament.winner || undefined}
                                                                    size="sm"
                                                                    className="ring-2 ring-yellow-400"
                                                                />
                                                            )}
                                                            <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-yellow-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow">
                                                                1
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-semibold text-yellow-300 truncate w-full" title={winnerTeam.map(m => m.username).join(' & ')}>
                                                            {winnerTeam.length > 0 ? winnerTeam.map(m => m.username).join(' & ') : '—'}
                                                        </span>
                                                        <span className="text-[10px] text-yellow-500 font-bold uppercase mt-0.5">
                                                            {getTeamLabel(winnerTeam, 1)}
                                                        </span>
                                                    </div>

                                                    {/* 2nd Place */}
                                                    <div className="flex flex-col items-center text-center p-2 rounded-lg bg-slate-700/30 border border-slate-600/40">
                                                        <div className="relative mb-1.5 flex items-center justify-center">
                                                            {secondTeam.length > 1 ? (
                                                                <div className="flex -space-x-2 overflow-hidden py-0.5 px-1">
                                                                    {secondTeam.map((member, idx) => (
                                                                        <UserAvatar
                                                                            key={member.user_id || idx}
                                                                            user={member}
                                                                            size="sm"
                                                                            className="ring-2 ring-slate-300 bg-slate-900"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <UserAvatar
                                                                    user={secondTeam[0] || tournament.second_place || undefined}
                                                                    size="sm"
                                                                    className="ring-2 ring-slate-300"
                                                                />
                                                            )}
                                                            <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-slate-300 text-slate-950 font-black text-[10px] flex items-center justify-center shadow">
                                                                2
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-200 truncate w-full" title={secondTeam.map(m => m.username).join(' & ')}>
                                                            {secondTeam.length > 0 ? secondTeam.map(m => m.username).join(' & ') : '—'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 uppercase mt-0.5">
                                                            {getTeamLabel(secondTeam, 2)}
                                                        </span>
                                                    </div>

                                                    {/* 3rd Place */}
                                                    <div className="flex flex-col items-center text-center p-2 rounded-lg bg-amber-950/20 border border-amber-700/30">
                                                        <div className="relative mb-1.5 flex items-center justify-center">
                                                            {thirdTeam.length > 1 ? (
                                                                <div className="flex -space-x-2 overflow-hidden py-0.5 px-1">
                                                                    {thirdTeam.map((member, idx) => (
                                                                        <UserAvatar
                                                                            key={member.user_id || idx}
                                                                            user={member}
                                                                            size="sm"
                                                                            className="ring-2 ring-amber-600 bg-slate-900"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <UserAvatar
                                                                    user={thirdTeam[0] || tournament.third_place || undefined}
                                                                    size="sm"
                                                                    className="ring-2 ring-amber-600"
                                                                />
                                                            )}
                                                            <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-amber-600 text-white font-black text-[10px] flex items-center justify-center shadow">
                                                                3
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-medium text-amber-200 truncate w-full" title={thirdTeam.map(m => m.username).join(' & ')}>
                                                            {thirdTeam.length > 0 ? thirdTeam.map(m => m.username).join(' & ') : '—'}
                                                        </span>
                                                        <span className="text-[10px] text-amber-600 uppercase mt-0.5">
                                                            {getTeamLabel(thirdTeam, 3)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })()}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                                        <span>ID: #{tournament.id}</span>
                                        <span>{tournament.participant_count} {tournament.participant_count === 1 ? 'inscrito' : 'inscritos'}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
