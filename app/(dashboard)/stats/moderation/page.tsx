'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { ShieldAlert, ShieldCheck, AlertTriangle, UserCheck, Flag, Search, CheckCircle, XCircle, Clock, Link2, ExternalLink } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import type { UserReport, UserDossier } from '@/lib/reputation'

export default function ModerationPage() {
    const { data: session } = useSession()
    const [guildId, setGuildId] = useState<string>('')
    const [activeTab, setActiveTab] = useState<'reports' | 'search'>('reports')
    const [reports, setReports] = useState<UserReport[]>([])
    const [loadingReports, setLoadingReports] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>('pending')

    useEffect(() => {
        if (session?.user?.guilds && session.user.guilds.length > 0) {
            const stored = localStorage.getItem('selectedGuildId')
            setGuildId(stored || session.user.guilds[0].id)
        }
    }, [session])

    // Member search and dossier state
    const [searchQuery, setSearchQuery] = useState('')
    const [dossierUserId, setDossierUserId] = useState<string>('')
    const [dossier, setDossier] = useState<UserDossier | null>(null)
    const [loadingDossier, setLoadingDossier] = useState(false)
    const [dossierError, setDossierError] = useState<string | null>(null)

    const fetchReports = async () => {
        if (!guildId) return
        setLoadingReports(true)
        try {
            const url = `/api/stats/moderation/reports?guildId=${guildId}${statusFilter ? `&status=${statusFilter}` : ''}`
            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setReports(data)
            }
        } catch (err) {
            console.error('Error fetching reports:', err)
        } finally {
            setLoadingReports(false)
        }
    }

    useEffect(() => {
        if (guildId && activeTab === 'reports') {
            fetchReports()
        }
    }, [guildId, activeTab, statusFilter])

    const handleReportAction = async (reportId: number, status: 'approved' | 'rejected') => {
        if (!guildId) return
        try {
            const res = await fetch('/api/stats/moderation/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportId, status, guildId })
            })
            if (res.ok) {
                fetchReports()
            }
        } catch (err) {
            console.error('Error updating report status:', err)
        }
    }

    const fetchDossier = async (userId: string) => {
        if (!guildId || !userId) return
        setLoadingDossier(true)
        setDossierError(null)
        try {
            const res = await fetch(`/api/stats/moderation/dossier?guildId=${guildId}&userId=${userId}`)
            if (res.ok) {
                const data = await res.json()
                setDossier(data)
                setDossierUserId(userId)
            } else {
                setDossierError('Usuário não encontrado ou sem dados no servidor.')
                setDossier(null)
            }
        } catch (err) {
            setDossierError('Erro ao carregar dossiê do usuário.')
            setDossier(null)
        } finally {
            setLoadingDossier(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-purple-400" />
                        Moderação, Dossiês & Reputação
                    </h1>
                    <p className="text-slate-400">
                        Painel exclusivo da Staff para análise de risco, Trust Score e fila de denúncias
                    </p>
                </div>

                <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 h-fit">
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === 'reports'
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                        )}
                    >
                        <Flag className="w-4 h-4" />
                        Denúncias ({reports.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('search')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === 'search'
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                                : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                        )}
                    >
                        <UserCheck className="w-4 h-4" />
                        Consultar Dossiê
                    </button>
                </div>
            </div>

            {/* ABA 1: FILA DE DENÚNCIAS */}
            {activeTab === 'reports' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400 font-medium">Status:</span>
                        {['pending', 'approved', 'rejected', ''].map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border",
                                    statusFilter === st
                                        ? "bg-purple-500/20 border-purple-500 text-purple-300"
                                        : "bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white"
                                )}
                            >
                                {st === 'pending' ? 'Pendentes' : st === 'approved' ? 'Aprovadas' : st === 'rejected' ? 'Rejeitadas' : 'Todas'}
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
                        {loadingReports ? (
                            <div className="p-12 text-center text-slate-400 animate-pulse">
                                Carregando fila de denúncias...
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="p-12 text-center text-slate-400">
                                Nenhuma denúncia encontrada para o filtro selecionado.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700/50">
                                {reports.map((report) => (
                                    <div key={report.id} className="p-6 space-y-4 hover:bg-slate-750/30 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-mono font-bold bg-slate-900 px-2.5 py-1 rounded border border-slate-700 text-purple-400">
                                                    #{report.id}
                                                </span>
                                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                                                    {report.category.toUpperCase()}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {formatDateTime(report.created_at)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSearchQuery(report.target_user_id)
                                                        setActiveTab('search')
                                                        fetchDossier(report.target_user_id)
                                                    }}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/60 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Ver Dossiê do Acusado
                                                </button>

                                                {report.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleReportAction(report.id, 'approved')}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600/80 hover:bg-green-600 text-white flex items-center gap-1.5 shadow-sm"
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            Aprovar & Punir
                                                        </button>
                                                        <button
                                                            onClick={() => handleReportAction(report.id, 'rejected')}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center gap-1.5"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            Descartar
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className={cn(
                                                        "text-xs font-bold px-3 py-1 rounded-full border",
                                                        report.status === 'approved' ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-slate-700 border-slate-600 text-slate-400"
                                                    )}>
                                                        {report.status === 'approved' ? 'APROVADA' : 'REJEITADA'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-900/40 p-4 rounded-lg border border-slate-700/40">
                                            <div>
                                                <p className="text-slate-400 text-xs mb-1">Acusado (Target):</p>
                                                <div className="flex items-center gap-2 text-white font-medium">
                                                    <UserAvatar userId={report.target_user_id} username={report.target_username || report.target_user_id} avatarUrl={report.target_avatar_url} size="sm" />
                                                    <span>{report.target_username || report.target_user_id}</span>
                                                    <span className="text-xs text-slate-500 font-mono">({report.target_user_id})</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs mb-1">Denunciante (Reporter):</p>
                                                <p className="text-slate-200 font-medium">
                                                    {report.reporter_username || report.reporter_user_id}
                                                    <span className="text-xs text-slate-500 font-mono ml-1">({report.reporter_user_id})</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xs font-medium text-slate-400">Motivo / Relato:</p>
                                            <p className="text-sm text-slate-200 bg-slate-900/60 p-3 rounded-lg border border-slate-700/50 whitespace-pre-wrap">
                                                {report.reason}
                                            </p>
                                        </div>

                                        {report.message_content && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-slate-400">Mensagem Anexada:</p>
                                                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800 font-mono">
                                                    {report.message_content}
                                                </p>
                                            </div>
                                        )}

                                        {report.attachment_urls && report.attachment_urls.length > 0 && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-slate-400">Provas e Links:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {report.attachment_urls.map((url, i) => (
                                                        <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs text-purple-400 hover:text-purple-300 underline flex items-center gap-1 bg-purple-950/40 px-2.5 py-1 rounded border border-purple-800/40">
                                                            <Link2 className="w-3 h-3" /> Link de Prova #{i + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ABA 2: CONSULTA DE DOSSIÊ */}
            {activeTab === 'search' && (
                <div className="space-y-6">
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 space-y-4">
                        <label className="text-sm font-semibold text-slate-200">Consultar Membro por ID do Discord</label>
                        <div className="flex gap-3 max-w-xl">
                            <div className="relative flex-1">
                                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Ex: 443557642670178334"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchDossier(searchQuery.trim())}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <button
                                onClick={() => fetchDossier(searchQuery.trim())}
                                disabled={!searchQuery.trim() || loadingDossier}
                                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loadingDossier ? 'Consultando...' : 'Buscar Dossiê'}
                            </button>
                        </div>
                    </div>

                    {dossierError && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
                            {dossierError}
                        </div>
                    )}

                    {dossier && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Card de Identificação & Trust Score */}
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 space-y-6 h-fit">
                                <div className="flex items-center gap-4">
                                    <UserAvatar
                                        userId={dossier.user?.user_id || dossierUserId}
                                        username={dossier.user?.username || dossierUserId}
                                        avatarUrl={dossier.user?.avatar_url}
                                        size="lg"
                                    />
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{dossier.user?.username || 'Usuário'}</h3>
                                        <p className="text-xs text-slate-400 font-mono">ID: {dossier.user?.user_id || dossierUserId}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-400 font-medium">ÍNDICE DE CONFIANÇA</span>
                                        <span className="text-sm font-bold text-white">{dossier.trust_score.label}</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-extrabold text-white">{dossier.trust_score.score}</span>
                                        <span className="text-sm text-slate-400">/ 100 pts</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500",
                                                dossier.trust_score.score >= 90 ? "bg-green-500" :
                                                dossier.trust_score.score >= 70 ? "bg-yellow-500" :
                                                dossier.trust_score.score >= 50 ? "bg-orange-500" : "bg-red-500"
                                            )}
                                            style={{ width: `${dossier.trust_score.score}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 text-xs text-slate-300">
                                    <div className="flex justify-between border-b border-slate-700/50 pb-2">
                                        <span className="text-slate-400">Convite Utilizado:</span>
                                        <span className="font-mono text-purple-400">
                                            {dossier.join_source?.invite_code ? `gg/${dossier.join_source.invite_code}` : 'Desconhecido'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-700/50 pb-2">
                                        <span className="text-slate-400">Convidado por:</span>
                                        <span>{dossier.join_source?.inviter_username || 'Direto / N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-700/50 pb-2">
                                        <span className="text-slate-400">Entrou no Servidor:</span>
                                        <span>{dossier.join_source?.joined_at ? formatDateTime(dossier.join_source.joined_at) : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between pb-1">
                                        <span className="text-slate-400">XP Acumulado:</span>
                                        <span className="font-semibold text-white">{dossier.total_points.toLocaleString()} XP</span>
                                    </div>
                                </div>

                                {dossier.trust_score.bonuses.length > 0 && (
                                    <div className="space-y-1.5 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                        <p className="text-xs font-bold text-green-400">Bônus Positivos:</p>
                                        {dossier.trust_score.bonuses.map((b, i) => (
                                            <p key={i} className="text-xs text-green-300 flex justify-between">
                                                <span>• {b[0]}</span>
                                                <span className="font-mono font-bold">+{b[1]} pts</span>
                                            </p>
                                        ))}
                                    </div>
                                )}

                                {dossier.trust_score.penalties.length > 0 && (
                                    <div className="space-y-1.5 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                        <p className="text-xs font-bold text-red-400">Penalidades Aplicadas:</p>
                                        {dossier.trust_score.penalties.map((p, i) => (
                                            <p key={i} className="text-xs text-red-300 flex justify-between">
                                                <span>• {p[0]}</span>
                                                <span className="font-mono font-bold">-{p[1]} pts</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Histórico de Infrações & Denúncias */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Resumo Numérico de Punições */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 text-center">
                                        <p className="text-2xl font-bold text-white">{dossier.infractions_summary.timeout?.count || 0}</p>
                                        <p className="text-xs text-slate-400 mt-1">Castigos (Timeouts)</p>
                                    </div>
                                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 text-center">
                                        <p className="text-2xl font-bold text-white">{dossier.infractions_summary.warn?.count || 0}</p>
                                        <p className="text-xs text-slate-400 mt-1">Advertências</p>
                                    </div>
                                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 text-center">
                                        <p className="text-2xl font-bold text-white">{dossier.moderated_messages_count || 0}</p>
                                        <p className="text-xs text-slate-400 mt-1">Msgs Ofensivas (IA)</p>
                                    </div>
                                    <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 text-center">
                                        <p className="text-2xl font-bold text-white">{dossier.reports.length || 0}</p>
                                        <p className="text-xs text-slate-400 mt-1">Denúncias</p>
                                    </div>
                                </div>

                                {/* Lista de Infrações Recentes */}
                                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 space-y-4">
                                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-purple-400" />
                                        Histórico Recente de Infrações
                                    </h4>

                                    {dossier.infractions.length === 0 ? (
                                        <p className="text-xs text-slate-400 py-4 text-center">Nenhuma infração registrada no histórico.</p>
                                    ) : (
                                        <div className="divide-y divide-slate-700/40">
                                            {dossier.infractions.map((inf) => (
                                                <div key={inf.id} className="py-3 flex items-center justify-between text-xs">
                                                    <div>
                                                        <span className="font-semibold text-red-400 uppercase tracking-wider">{inf.action_type}</span>
                                                        <p className="text-slate-300 mt-0.5">{inf.reason || 'Sem motivo especificado'}</p>
                                                    </div>
                                                    <span className="text-slate-500">{formatDateTime(inf.created_at)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
