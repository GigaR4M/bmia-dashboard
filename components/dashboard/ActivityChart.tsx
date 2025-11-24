'use client'

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ActivityData {
    date: string
    message_count: number
    active_users: number
}

interface ActivityChartProps {
    data: ActivityData[]
    loading?: boolean
}

export function ActivityChart({ data, loading }: ActivityChartProps) {
    if (loading) {
        return (
            <div className="h-[300px] w-full bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 animate-pulse flex items-center justify-center">
                <div className="text-slate-500">Carregando gráfico...</div>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 flex items-center justify-center">
                <div className="text-slate-500">Sem dados de atividade no período</div>
            </div>
        )
    }

    return (
        <div className="h-[300px] w-full bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-xl font-bold text-white mb-4">Atividade do Servidor</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
                        tickMargin={10}
                    />
                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `${value}`} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#f8fafc'
                        }}
                        labelFormatter={(value) => format(new Date(value), "d 'de' MMMM", { locale: ptBR })}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="message_count"
                        name="Mensagens"
                        stroke="#9333ea"
                        fillOpacity={1}
                        fill="url(#colorMessages)"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="active_users"
                        name="Usuários Ativos"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorUsers)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
