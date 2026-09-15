'use client'

import { useState, useMemo } from 'react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { useEventStats } from '@/hooks/useStats'
import { Calendar, CalendarDays, CheckCircle2, Users, MapPin, Radio, Clock } from 'lucide-react'
import { formatNumber, cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { UserAvatar } from '@/components/ui/UserAvatar'

type EventFilterStatus = 'all' | 'scheduled' | 'active' | 'completed'

export default function EventsPage() {
    const [statusFilter, setStatusFilter] = useState<EventFilterStatus>('all')
    const { data: stats, events, loading, error } = useEventStats()

    const filteredEvents = useMemo(() => {
        if (!events) return []
        if (statusFilter === 'all') return events

        const now = new Date()
        return events.filter(event => {
            const st = event.status.toUpperCase()
            const startTime = new Date(event.start_time)
            const endTime = event.end_time ? new Date(event.end_time) : null

            if (statusFilter === 'active') {
                return st.includes('ACTIVE')
            }
            if (statusFilter === 'completed') {
                return st.includes('COMPLETED') || (endTime && endTime < now)
            }
            if (statusFilter === 'scheduled') {
                return st.includes('SCHEDULED') || (!st.includes('COMPLETED') && !st.includes('ACTIVE') && startTime > now)
            }
            return true
        })
    }, [events, statusFilter])

    const getStatusBadge = (status: string, startTimeStr: string, endTimeStr?: string | null) => {
        const st = status.toUpperCase()
        const now = new Date()
        const startTime = new Date(startTimeStr)
        const endTime = endTimeStr ? new Date(endTimeStr) : null

        if (st.includes('ACTIVE')) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Ao Vivo
                </span>
            )
        }
        if (st.includes('COMPLETED') || (endTime && endTime < now)) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                    <CheckCircle2 className="w-3 h-3 text-slate-400" />
                    Concluído
                </span>
            )
        }
        if (st.includes('CANCELED')) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Cancelado
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                <Clock className="w-3 h-3 text-purple-400" />
                Agendado
            </span>
        )
    }

    const formatEventDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr)
            return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
        } catch {
            return dateStr
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Eventos do Servidor</h1>
                    <p className="text-slate-400 text-sm">Histórico de eventos agendados, presenças e engajamento</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 w-fit">
                    {(['all', 'scheduled', 'active', 'completed'] as EventFilterStatus[]).map((tab) => {
                        const labels: Record<EventFilterStatus, string> = {
                            all: 'Todos',
                            scheduled: 'Agendados',
                            active: 'Ao Vivo',
                            completed: 'Concluídos'
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

            {/* Overview Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total de Eventos"
                    value={formatNumber(stats?.total_events || 0)}
                    icon={<Calendar className="w-7 h-7 text-purple-400" />}
                    loading={loading}
                />
                <StatsCard
                    title="Próximos / Agendados"
                    value={formatNumber(stats?.upcoming_events || 0)}
                    icon={<CalendarDays className="w-7 h-7 text-blue-400" />}
                    loading={loading}
                />
                <StatsCard
                    title="Concluídos"
                    value={formatNumber(stats?.completed_events || 0)}
                    icon={<CheckCircle2 className="w-7 h-7 text-emerald-400" />}
                    loading={loading}
                />
                <StatsCard
                    title="Total de Participações"
                    value={formatNumber(stats?.total_participants || 0)}
                    icon={<Users className="w-7 h-7 text-pink-400" />}
                    loading={loading}
                />
            </div>

            {/* Event List / Cards */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-purple-400" />
                    Lista de Eventos ({filteredEvents.length})
                </h3>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-slate-800/40 rounded-xl p-6 border border-slate-700/50 space-y-4">
                                <div className="h-5 bg-slate-700 rounded w-1/3"></div>
                                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                                <div className="h-10 bg-slate-700/50 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-6 rounded-xl text-center">
                        Erro ao carregar eventos: {error}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-700 text-slate-400 text-center space-y-2">
                        <Calendar className="w-12 h-12 text-slate-600 mb-2" />
                        <p className="text-lg font-medium text-slate-300">Nenhum evento encontrado</p>
                        <p className="text-sm text-slate-500">
                            {statusFilter === 'all'
                                ? 'Não há registros de eventos sincronizados para este servidor.'
                                : `Não há eventos com status "${statusFilter}" no momento.`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredEvents.map((event) => (
                            <div
                                key={event.event_id}
                                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-purple-500/40 transition-all rounded-xl p-6 flex flex-col justify-between space-y-4 shadow-sm"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <h4 className="text-lg font-bold text-white leading-tight">
                                            {event.name}
                                        </h4>
                                        {getStatusBadge(event.status, event.start_time, event.end_time)}
                                    </div>

                                    {event.description && (
                                        <p className="text-slate-400 text-sm line-clamp-2">
                                            {event.description}
                                        </p>
                                    )}

                                    <div className="space-y-1.5 pt-2 text-xs sm:text-sm text-slate-300">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                            <span>{formatEventDate(event.start_time)}</span>
                                        </div>

                                        {(event.location || event.entity_type) && (
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <MapPin className="w-4 h-4 text-pink-400 flex-shrink-0" />
                                                <span className="truncate">{event.location || event.entity_type}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between gap-4">
                                    {event.creator_name ? (
                                        <div className="flex items-center gap-2">
                                            <UserAvatar
                                                userId={event.creator_id || undefined}
                                                username={event.creator_name}
                                                avatarUrl={event.creator_avatar}
                                                size="xs"
                                            />
                                            <span className="text-xs text-slate-400 truncate max-w-[120px]">
                                                Por <strong className="text-slate-200">{event.creator_name}</strong>
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-500">Organizador Discord</span>
                                    )}

                                    <div className="flex items-center gap-3">
                                        {event.attended_count > 0 && (
                                            <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center gap-1 font-medium">
                                                <Users className="w-3.5 h-3.5" />
                                                {event.attended_count} presentes
                                            </span>
                                        )}
                                        {event.interested_count > 0 && (
                                            <span className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-md flex items-center gap-1 font-medium">
                                                {event.interested_count} interessados
                                            </span>
                                        )}
                                        {event.participant_count === 0 && (
                                            <span className="text-xs text-slate-500">Sem inscritos</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
