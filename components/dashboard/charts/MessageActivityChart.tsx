'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DailyActivity } from '@/types'

interface MessageActivityChartProps {
    data: DailyActivity[]
    loading?: boolean
}

export function MessageActivityChart({ data, loading }: MessageActivityChartProps) {
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
                <div className="text-slate-500">Sem dados de mensagens no período</div>
            </div>
        )
    }

    return (
        <div className="h-[300px] w-full bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-xl font-bold text-white mb-4">Mensagens por Dia</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickFormatter={(value) => format(new Date(value + 'T12:00:00'), 'dd/MM', { locale: ptBR })}
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
                        labelFormatter={(value) => format(new Date(value + 'T12:00:00'), "d 'de' MMMM", { locale: ptBR })}
                        cursor={{ fill: '#334155', opacity: 0.4 }}
                    />
                    <Legend />
                    <Bar
                        dataKey="message_count"
                        name="Mensagens"
                        fill="#9333ea"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
