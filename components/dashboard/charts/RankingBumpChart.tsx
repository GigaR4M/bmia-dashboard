'use client'

import { useMemo } from 'react'
import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend
} from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RankingData {
    date: string
    user_id: number
    username: string
    rank: number
    total_points: number
}

interface RankingBumpChartProps {
    data: RankingData[]
    loading: boolean
}

const COLORS = [
    '#a855f7', // purple-500
    '#ec4899', // pink-500
    '#8b5cf6', // violet-500
    '#d946ef', // fuchsia-500
    '#6366f1', // indigo-500
    '#f43f5e', // rose-500
    '#3b82f6', // blue-500
    '#0ea5e9', // sky-500
    '#06b6d4', // cyan-500
    '#14b8a6', // teal-500
]

export function RankingBumpChart({ data, loading }: RankingBumpChartProps) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return []

        // Group by date
        const groupedByDate: Record<string, any> = {}
        const users = new Set<string>()

        data.forEach((item) => {
            const dateStr = format(new Date(item.date), 'dd/MM', { locale: ptBR })
            if (!groupedByDate[dateStr]) {
                groupedByDate[dateStr] = { name: dateStr }
            }
            groupedByDate[dateStr][item.username] = item.rank
            users.add(item.username)
        })

        return Object.values(groupedByDate)
    }, [data])

    const userList = useMemo(() => {
        if (!data) return []
        const uniqueUsers = Array.from(new Set(data.map(d => d.username)))
        return uniqueUsers
    }, [data])

    if (loading) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700/50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="w-full h-[400px] flex items-center justify-center bg-slate-800/50 rounded-xl border border-slate-700/50 text-slate-400">
                Sem dados de histórico disponíveis
            </div>
        )
    }

    return (
        <div className="w-full h-[400px] bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-6">Histórico de Ranking (Top 10)</h3>
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                        <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            reversed
                            stroke="#94a3b8"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={[1, 10]}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f8fafc'
                            }}
                            itemStyle={{ fontSize: '12px' }}
                            formatter={(value: number) => [`Rank ${value}`]}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        {userList.map((user, index) => (
                            <Line
                                key={user}
                                type="monotone"
                                dataKey={user}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={2}
                                dot={{ r: 3, strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
