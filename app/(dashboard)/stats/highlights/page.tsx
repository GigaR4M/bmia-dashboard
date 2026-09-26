'use client'

import { useHighlights } from '@/hooks/useStats'
import {
    Trophy,
    MessageSquare,
    Mic,
    AlertTriangle,
    Activity,
    Video,
    Calendar,
    Gamepad2,
    Loader2,
    Heart,
    Disc,
    Library,
    Timer,
    Sparkles,
    Moon,
    Image as ImageIcon,
    Globe,
    Crown
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HighlightsPage() {
    const { data: stats, loading, error } = useHighlights(5)

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
                    <span className="text-xs font-bold font-orbitron text-slate-400 uppercase tracking-widest">Carregando Destaques...</span>
                </div>
            </div>
        )
    }

    if (error || !stats) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="cyber-card p-6 rounded-2xl border-rose-500/30 text-rose-400 font-rajdhani font-semibold">
                    Erro ao carregar os destaques do servidor.
                </div>
            </div>
        )
    }

    // Formatters
    const formatNumber = (val: number) => val.toLocaleString('pt-BR')
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return `${hours}h ${minutes}m`
    }

    const sections = [
        {
            title: 'Maior Total de XP',
            icon: Trophy,
            data: stats.highestScore,
            format: formatNumber,
            unit: 'XP',
            color: 'text-yellow-400',
            accent: 'gold' as const
        },
        {
            title: 'Mais Mensagens de Texto',
            icon: MessageSquare,
            data: stats.mostMessages,
            format: formatNumber,
            unit: 'msgs',
            color: 'text-cyan-400',
            accent: 'cyan' as const
        },
        {
            title: 'Mais Tempo em Voz',
            icon: Mic,
            data: stats.mostVoice,
            format: (v: number) => formatTime(v),
            unit: '',
            color: 'text-emerald-400',
            accent: 'cyan' as const
        },
        {
            title: 'Mais Mensagens Ofensivas',
            icon: AlertTriangle,
            data: stats.mostOffensive,
            format: formatNumber,
            unit: 'msgs',
            color: 'text-rose-400',
            accent: 'rose' as const
        },
        {
            title: 'Mais Tempo em Atividade',
            icon: Activity,
            data: stats.mostActivity,
            format: (v: number) => formatTime(v),
            unit: '',
            color: 'text-purple-400',
            accent: 'purple' as const
        },
        {
            title: 'Maior Tempo em Live',
            icon: Video,
            data: stats.longestStreaming,
            format: (v: number) => formatTime(v),
            unit: '',
            color: 'text-pink-400',
            accent: 'purple' as const
        },
        {
            title: 'Mais Eventos Participados',
            icon: Calendar,
            data: stats.mostEvents,
            format: formatNumber,
            unit: 'eventos',
            color: 'text-amber-400',
            accent: 'gold' as const
        },
        {
            title: 'Top Gamers (Tempo em Jogo)',
            icon: Gamepad2,
            data: stats.topGamers,
            format: (v: number) => formatTime(v),
            unit: '',
            color: 'text-indigo-400',
            accent: 'cyan' as const
        },
        {
            title: 'Ímã da Galera (Reações)',
            icon: Heart,
            data: stats.mostReactionsReceived,
            format: formatNumber,
            unit: 'reações',
            color: 'text-rose-400',
            accent: 'rose' as const
        },
        {
            title: 'Rei das Demos (Jogos Demo)',
            icon: Disc,
            data: stats.demoKing,
            format: formatNumber,
            unit: 'demos',
            color: 'text-violet-400',
            accent: 'purple' as const
        },
        {
            title: 'Gamer Eclético (Jogos Distintos)',
            icon: Library,
            data: stats.mostDistinctGames,
            format: formatNumber,
            unit: 'jogos',
            color: 'text-cyan-400',
            accent: 'cyan' as const
        },
        {
            title: 'O Maratonista (Maior Sessão)',
            icon: Timer,
            data: stats.longestSession,
            format: (v: number) => formatTime(v),
            unit: '',
            color: 'text-blue-400',
            accent: 'cyan' as const
        },
        {
            title: 'Jogo do Ano',
            icon: Sparkles,
            data: stats.gameOfTheYear,
            format: (v: number) => formatTime(v),
            unit: '',
            color: 'text-amber-300',
            accent: 'gold' as const
        },
        {
            title: 'O Corujão (Madrugada)',
            icon: Moon,
            data: stats.nightOwl,
            format: (v: number) => formatTime(v),
            unit: '',
            color: 'text-purple-300',
            accent: 'purple' as const
        },
        {
            title: 'O Mídia (Arquivos Enviados)',
            icon: ImageIcon,
            data: stats.mediaKing,
            format: formatNumber,
            unit: 'anexos',
            color: 'text-pink-400',
            accent: 'purple' as const
        },
        {
            title: 'O Onipresente (Dias Ativos)',
            icon: Globe,
            data: stats.omnipresent,
            format: formatNumber,
            unit: 'dias',
            color: 'text-emerald-400',
            accent: 'cyan' as const
        }
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold font-orbitron tracking-widest uppercase mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    RETROSPECTIVA & DESTAQUES OFICIAIS
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white font-orbitron tracking-tight">Destaques do Servidor</h1>
                <p className="text-slate-400 text-sm font-rajdhani font-medium">Os membros e registros que dominaram cada categoria no servidor</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {sections.map((section, index) => {
                    const topItem = section.data && section.data.length > 0 ? section.data[0] : null
                    const accentClass = 
                        section.accent === 'gold' ? 'laser-top-gold hover:border-yellow-500/40' :
                        section.accent === 'purple' ? 'laser-top-purple hover:border-purple-500/40' :
                        section.accent === 'rose' ? 'laser-top hover:border-rose-500/40' :
                        'laser-top-cyan hover:border-cyan-500/40'

                    return (
                        <div
                            key={index}
                            className={cn(
                                "cyber-card rounded-2xl p-5 laser-top flex flex-col justify-between space-y-4 group relative overflow-hidden transition-all duration-300",
                                accentClass
                            )}
                        >
                            {/* Card Top */}
                            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                                <span className="text-xs font-bold font-orbitron text-slate-300 tracking-wide uppercase truncate">
                                    {section.title}
                                </span>
                                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-700/60 group-hover:scale-110 transition-transform">
                                    <section.icon className={`h-4 w-4 ${section.color}`} />
                                </div>
                            </div>

                            {/* List of 5 */}
                            <div className="space-y-2.5 font-rajdhani">
                                {section.data && section.data.length > 0 ? (
                                    section.data.map((item: any, i: number) => {
                                        const isFirst = i === 0
                                        const isSecond = i === 1
                                        const isThird = i === 2

                                        return (
                                            <div
                                                key={`${section.title}-${item.user_id || item.activity_name || i}-${i}`}
                                                className={cn(
                                                    "flex items-center justify-between p-2 rounded-xl transition-colors",
                                                    isFirst
                                                        ? "bg-yellow-950/30 border border-yellow-500/30 shadow-[0_0_10px_rgba(255,215,0,0.08)]"
                                                        : "hover:bg-slate-800/40"
                                                )}
                                            >
                                                <div className="flex items-center space-x-2.5 overflow-hidden">
                                                    <div className={cn(
                                                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black font-orbitron",
                                                        isFirst
                                                            ? "bg-yellow-400 text-slate-950 shadow-[0_0_8px_rgba(255,215,0,0.5)] border border-yellow-200"
                                                            : isSecond
                                                                ? "bg-slate-300 text-slate-950"
                                                                : isThird
                                                                    ? "bg-amber-600 text-white"
                                                                    : "bg-slate-800 text-slate-400 border border-slate-700"
                                                    )}>
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        {isFirst && <Crown className="w-3 h-3 text-yellow-400 shrink-0" />}
                                                        <span className={cn(
                                                            "truncate text-sm font-semibold",
                                                            isFirst ? "text-yellow-300 font-orbitron text-xs" : "text-slate-200"
                                                        )}>
                                                            {item.username || item.activity_name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 text-xs font-mono font-bold text-cyan-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                                                    {section.format(item.value || item.value_seconds)} {section.unit}
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-xs text-slate-500 text-center py-4 font-medium">Nenhum dado registrado</div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
