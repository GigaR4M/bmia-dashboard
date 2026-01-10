'use client'

import { useHighlights } from '@/hooks/useStats'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
    Zap,
    Library,
    Timer,
    Sparkles,
    Moon,
    Image,
    Globe,

} from 'lucide-react'

export default function HighlightsPage() {
    const { data: stats, loading, error } = useHighlights(5)

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-red-500">
                Erro ao carregar destaques: {error}
            </div>
        )
    }

    if (!stats) return null

    // Formatters
    const formatNumber = (val: number) => val.toLocaleString('pt-BR')
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return `${hours}h ${minutes}m`
    }

    const sections = [
        {
            title: 'Maior Pontuação',
            icon: Trophy,
            data: stats.highestScore,
            format: formatNumber,
            unit: 'pontos',
            color: 'text-yellow-500'
        },
        {
            title: 'Mais Mensagens de Texto',
            icon: MessageSquare,
            data: stats.mostMessages,
            format: formatNumber,
            unit: 'msgs',
            color: 'text-blue-500'
        },
        {
            title: 'Mais Tempo em Voz',
            icon: Mic,
            data: stats.mostVoice,
            format: (v: number) => formatTime(v),
            unit: '',
            color: 'text-green-500'
        },
        {
            title: 'Mais Mensagens Ofensivas',
            icon: AlertTriangle,
            data: stats.mostOffensive,
            format: formatNumber,
            unit: 'msgs',
            color: 'text-red-500'
        },
        {
            title: 'Mais Tempo em Atividade',
            icon: Activity,
            data: stats.mostActivity,
            format: (v: number) => formatTime(v),
            unit: '',
            color: 'text-purple-500'
        },
        {
            title: 'Maior Tempo em Live',
            icon: Video,
            data: stats.longestStreaming,
            format: (v: number) => formatTime(v),
            unit: '',
            color: 'text-pink-500'
        },
        {
            title: 'Mais Participações em Eventos',
            icon: Calendar,
            data: stats.mostEvents,
            format: formatNumber,
            unit: 'eventos',
            color: 'text-orange-500'
        },
        {
            title: 'Top Jogadores (Tempo Jogado)',
            icon: Gamepad2,
            data: stats.topGamers,
            format: (v: number) => formatTime(v),
            unit: '',
            color: 'text-indigo-500'
        },
        {
            title: 'Imã da Galera (Reações Recebidas)',
            icon: Heart,
            data: stats.mostReactionsReceived,
            format: formatNumber,
            unit: 'reações',
            color: 'text-rose-500'
        },
        {
            title: 'O Reativo (Reações Dadas)',
            icon: Zap,
            data: stats.mostReactionsGiven,
            format: formatNumber,
            unit: 'reações',
            color: 'text-amber-500'
        },
        {
            title: 'Gamer Variado (Jogos Distintos)',
            icon: Library,
            data: stats.mostDistinctGames,
            format: formatNumber,
            unit: 'jogos',
            color: 'text-cyan-500'
        },
        {
            title: 'O Maratonista (Maior Sessão)',
            icon: Timer,
            data: stats.longestSession,
            format: (v: number) => formatTime(v),
            unit: '',
            color: 'text-indigo-600'
        },
        {
            title: 'Jogo do Ano',
            icon: Sparkles,
            data: stats.gameOfTheYear,
            format: (v: number) => formatTime(v),
            unit: '',
            color: 'text-amber-400'
        },
        {
            title: 'O Corujão (Voz na Madrugada)',
            icon: Moon,
            data: stats.nightOwl,
            format: (v: number) => formatTime(v),
            unit: '',
            color: 'text-indigo-900 dark:text-indigo-300'
        },
        {
            title: 'O Mídia (Arquivos Enviados)',
            icon: Image,
            data: stats.mediaKing,
            format: formatNumber,
            unit: 'anexos',
            color: 'text-pink-500'
        },
        {
            title: 'O Onipresente (Dias Ativos)',
            icon: Globe,
            data: stats.omnipresent,
            format: formatNumber,
            unit: 'dias',
            color: 'text-emerald-500'
        }
    ]

    return (
        <div className="space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Destaques do Ano</h2>
                    <p className="text-muted-foreground">
                        Os membros que mais se destacaram no servidor este ano.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {sections.map((section, index) => (
                    <Card key={index} className="overflow-hidden border-t-4" style={{ borderTopColor: 'currentColor' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {section.title}
                            </CardTitle>
                            <section.icon className={`h-4 w-4 ${section.color}`} />
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                {section.data && section.data.length > 0 ? (
                                    section.data.map((item: any, i: number) => (
                                        <div key={item.user_id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2 overflow-hidden">
                                                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' :
                                                    i === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                                                        i === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-500' :
                                                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                                    }`}>
                                                    {i + 1}
                                                </div>
                                                <span className="truncate text-sm font-medium">
                                                    {item.username || item.activity_name}
                                                </span>
                                            </div>
                                            <div className="shrink-0 text-sm text-muted-foreground">
                                                {section.format(item.value || item.value_seconds)} {section.unit}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-muted-foreground">Nenhum dado disponível</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
