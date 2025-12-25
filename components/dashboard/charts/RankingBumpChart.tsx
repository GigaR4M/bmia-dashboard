'use client'

import { useMemo, useState } from 'react'
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
    const [hoveredUser, setHoveredUser] = useState<string | null>(null)

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
            // Only plot rank if user has points to avoid 0-point ties at Rank 1
            if (item.total_points > 0) {
                groupedByDate[dateStr][item.username] = item.rank
            } else {
                groupedByDate[dateStr][item.username] = null
            }
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
            <h3 className="text-lg font-bold text-white mb-6">Histórico de Ranking (Top 10 Atual)</h3>
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
                            domain={[1, 'auto']}
                            allowDecimals={false}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (!active || !payload || payload.length === 0) return null

                                // Filter payload if a user is hovered
                                const filteredPayload = hoveredUser
                                    ? payload.filter(item => item.name === hoveredUser)
                                    : payload // Option: Sort by rank? payload.sort((a, b) => (a.value as number) - (b.value as number))

                                if (filteredPayload.length === 0) return null

                                return (
                                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
                                        <p className="text-slate-400 text-xs mb-2">{label}</p>
                                        <div className="space-y-1">
                                            {filteredPayload.map((item: any) => (
                                                <div key={item.name} className="flex items-center gap-2 text-sm">
                                                    <span
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="font-semibold text-white">#{item.value}</span>
                                                    <span className="text-slate-300">{item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            }}
                            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '10px' }}
                            onMouseEnter={(e) => setHoveredUser(e.value)}
                            onMouseLeave={() => setHoveredUser(null)}
                        />
                        {userList.map((user, index) => (
                            <Line
                                key={user}
                                type="monotone"
                                dataKey={user}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={hoveredUser === user ? 3 : 2}
                                strokeOpacity={hoveredUser && hoveredUser !== user ? 0.1 : 1}
                                dot={{ r: 3, strokeWidth: 0, fill: COLORS[index % COLORS.length] }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                connectNulls={false} // Do not connect if there are gaps (e.g. 0 points)
                                onMouseEnter={() => setHoveredUser(user)}
                                onMouseLeave={() => setHoveredUser(null)}
                                animationDuration={300}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
