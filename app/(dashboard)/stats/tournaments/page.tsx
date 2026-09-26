'use client'

import { useState, useMemo } from 'react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { useTournaments } from '@/hooks/useStats'
import { Swords, Trophy, Flame, CheckCircle2, Users, Gamepad2, Award, Clock, Sparkles } from 'lucide-react'
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold font-orbitron bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        INSCRIÇÕES ABERTAS
                    </span>
                )
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold font-orbitron bg-amber-950/70 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                        <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                        EM ANDAMENTO
                    </span>
                )
            case 'finished':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold font-orbitron bg-purple-950/70 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(176,38,255,0.25)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                        FINALIZADO
                    </span>
                )
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold font-orbitron bg-rose-950/70 text-rose-400 border border-rose-500/40">
                        CANCELADO
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold font-orbitron bg-slate-800 text-slate-300 border border-slate-700">
                        {status.toUpperCase()}
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-orbitron tracking-widest uppercase mb-2">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        ARENA DE ESPORTS & CHAVEAMENTOS
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white font-orbitron tracking-tight">Torneios e Campeonatos</h1>
                    <p className="text-slate-400 text-sm font-rajdhani font-medium">Histórico de confrontos, chaves de eliminatórias, pódios e campeões</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/60 backdrop-blur-xl w-fit">
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
                                    "px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold font-orbitron transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
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
                    icon={<Swords className="w-7 h-7 text-cyan-400" />}
                    loading={loading}
                    accentColor="cyan"
                />
                <StatsCard
                    title="Torneios Abertos"
                    value={formatNumber(stats.active_tournaments)}
                    icon={<Flame className="w-7 h-7 text-amber-400" />}
                    loading={loading}
                    accentColor="gold"
                />
                <StatsCard
                    title="Torneios Concluídos"
                    value={formatNumber(stats.finished_tournaments)}
                    icon={<Trophy className="w-7 h-7 text-yellow-400" />}
                    loading={loading}
                    accentColor="gold"
                />
                <StatsCard
                    title="Total de Inscrições"
                    value={formatNumber(stats.total_participants)}
                    icon={<Users className="w-7 h-7 text-purple-400" />}
                    loading={loading}
                    accentColor="purple"
                />
            </div>

            {/* Tournaments Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white font-orbitron flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        Chaves de Torneio ({filteredTournaments.length})
                    </h3>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse cyber-card rounded-2xl p-6 space-y-4 border border-slate-800">
                                <div className="h-6 bg-slate-800 rounded w-1/3"></div>
                                <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                                <div className="h-24 bg-slate-800/40 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-6 rounded-2xl text-center font-rajdhani">
                        Erro ao carregar torneios: {error}
                    </div>
                ) : filteredTournaments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 cyber-card rounded-2xl border border-dashed border-slate-700 text-slate-400 text-center space-y-2">
                        <Swords className="w-12 h-12 text-slate-600 mb-2" />
                        <p className="text-lg font-bold font-orbitron text-slate-300">Nenhum torneio encontrado</p>
                        <p className="text-sm font-rajdhani text-slate-500">
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
                            const isFinished = tournament.status === 'finished' || !!tournament.winner

                            return (
                                <div
                                    key={tournament.id}
                                    className={cn(
                                        "cyber-card rounded-2xl p-6 flex flex-col justify-between space-y-5 relative overflow-hidden group",
                                        isFinished ? "laser-top-gold hover:border-yellow-500/50" : "laser-top-cyan hover:border-cyan-500/50"
                                    )}
                                >
                                    {/* Header & Badges */}
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="px-2.5 py-1 rounded-md text-xs font-bold font-orbitron bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                                                        <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                                                        {tournament.game_name.toUpperCase()}
                                                    </span>
                                                    <span className="px-2.5 py-1 rounded-md text-xs font-bold font-orbitron bg-purple-950/60 text-purple-300 border border-purple-500/40">
                                                        {tournament.format}
                                                    </span>
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-md text-xs font-bold font-orbitron border",
                                                        tournament.tournament_type === 'round_robin'
                                                            ? "bg-amber-950/60 text-amber-300 border-amber-500/40"
                                                            : "bg-indigo-950/60 text-indigo-300 border-indigo-500/40"
                                                    )}>
                                                        {tournament.tournament_type === 'round_robin' ? 'PONTOS CORRIDOS' : 'MATA-MATA'}
                                                    </span>
                                                </div>
                                                <h4 className="text-xl sm:text-2xl font-black text-white font-orbitron tracking-wide leading-tight group-hover:text-cyan-300 transition-colors">
                                                    {tournament.name}
                                                </h4>
                                            </div>
                                            {getStatusBadge(tournament.status)}
                                        </div>

                                        {/* Prize & Creation Date */}
                                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm pt-1">
                                            {tournament.prize && (
                                                <div className="flex items-center gap-2 text-yellow-300 font-bold font-orbitron bg-gradient-to-r from-yellow-950/80 to-amber-950/60 border border-yellow-500/50 px-3 py-1 rounded-lg shadow-[0_0_15px_rgba(255,215,0,0.15)]">
                                                    <Award className="w-4 h-4 text-yellow-400" />
                                                    <span>PRÊMIO: {tournament.prize}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 text-slate-400 font-rajdhani font-medium">
                                                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                                <span>Criado em {formatDate(tournament.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Capacity Progress Bar */}
                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex justify-between text-xs font-rajdhani font-semibold">
                                                <span className="text-slate-400">Vagas Preenchidas</span>
                                                <span className="text-cyan-300 font-orbitron">
                                                    {tournament.participant_count} / {tournament.max_participants} ({percentFilled}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-900/90 h-2.5 rounded-full overflow-hidden border border-slate-800">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500 bg-gradient-to-r",
                                                        percentFilled >= 100
                                                            ? "from-emerald-500 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                                            : "from-cyan-500 via-purple-500 to-pink-500 shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                                                    )}
                                                    style={{ width: `${percentFilled}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Podium / Winners Section matching image_generator styles */}
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
                                            if (rank === 2) return isTeam ? (team.length === 2 ? 'Vice (Dupla)' : 'Vice (Equipe)') : '2º Lugar'
                                            return isTeam ? (team.length === 2 ? '3º (Dupla)' : '3º (Equipe)') : '3º Lugar'
                                        }

                                        return (
                                            <div className="bg-slate-950/80 rounded-xl p-4 border border-yellow-500/30 shadow-[inset_0_0_20px_rgba(255,215,0,0.05)] space-y-3">
                                                <div className="flex items-center justify-between text-xs font-orbitron font-bold">
                                                    <span className="flex items-center gap-1.5 text-yellow-400">
                                                        <Trophy className="w-4 h-4 text-yellow-400" /> PÓDIO DO CONFRONTO
                                                    </span>
                                                    {tournament.final_score && (
                                                        <span className="text-slate-300 font-mono bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700">
                                                            PLACAR: <strong className="text-cyan-400">{tournament.final_score}</strong>
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-3 gap-2.5">
                                                    {/* 1st Place - Gold */}
                                                    <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-gradient-to-b from-yellow-950/60 to-amber-950/30 border border-yellow-500/50 shadow-[0_0_15px_rgba(255,215,0,0.15)] relative">
                                                        <div className="relative mb-2 flex items-center justify-center">
                                                            {winnerTeam.length > 1 ? (
                                                                <div className="flex -space-x-2 overflow-hidden py-0.5 px-1">
                                                                    {winnerTeam.map((member, idx) => (
                                                                        <UserAvatar
                                                                            key={member.user_id || idx}
                                                                            user={member}
                                                                            size="sm"
                                                                            className="ring-2 ring-yellow-400 bg-slate-900 shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <UserAvatar
                                                                    user={winnerTeam[0] || tournament.winner || undefined}
                                                                    size="sm"
                                                                    className="ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(255,215,0,0.6)]"
                                                                />
                                                            )}
                                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-yellow-400 text-slate-950 font-black font-orbitron text-[10px] flex items-center justify-center shadow-lg">
                                                                1
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-bold font-rajdhani text-yellow-300 truncate w-full" title={winnerTeam.map(m => m.username).join(' & ')}>
                                                            {winnerTeam.length > 0 ? winnerTeam.map(m => m.username).join(' & ') : '—'}
                                                        </span>
                                                        <span className="text-[10px] font-bold font-orbitron text-yellow-500 uppercase mt-0.5 tracking-wider">
                                                            {getTeamLabel(winnerTeam, 1)}
                                                        </span>
                                                    </div>

                                                    {/* 2nd Place - Silver */}
                                                    <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-500/40">
                                                        <div className="relative mb-2 flex items-center justify-center">
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
                                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-300 text-slate-950 font-black font-orbitron text-[10px] flex items-center justify-center shadow">
                                                                2
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-semibold font-rajdhani text-slate-200 truncate w-full" title={secondTeam.map(m => m.username).join(' & ')}>
                                                            {secondTeam.length > 0 ? secondTeam.map(m => m.username).join(' & ') : '—'}
                                                        </span>
                                                        <span className="text-[10px] font-bold font-orbitron text-slate-400 uppercase mt-0.5">
                                                            {getTeamLabel(secondTeam, 2)}
                                                        </span>
                                                    </div>

                                                    {/* 3rd Place - Bronze */}
                                                    <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-amber-950/20 border border-amber-700/40">
                                                        <div className="relative mb-2 flex items-center justify-center">
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
                                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-600 text-white font-black font-orbitron text-[10px] flex items-center justify-center shadow">
                                                                3
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-semibold font-rajdhani text-amber-200 truncate w-full" title={thirdTeam.map(m => m.username).join(' & ')}>
                                                            {thirdTeam.length > 0 ? thirdTeam.map(m => m.username).join(' & ') : '—'}
                                                        </span>
                                                        <span className="text-[10px] font-bold font-orbitron text-amber-600 uppercase mt-0.5">
                                                            {getTeamLabel(thirdTeam, 3)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })()}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs font-mono text-slate-500 pt-2 border-t border-slate-800">
                                        <span className="text-cyan-400/80">#TORNEIO-{tournament.id}</span>
                                        <span className="font-rajdhani font-semibold text-slate-400">{tournament.participant_count} {tournament.participant_count === 1 ? 'competidor' : 'competidores'}</span>
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
