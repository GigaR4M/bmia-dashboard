'use client'

import React, { useState, useMemo } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import { formatNumber } from '@/lib/utils'

interface HistoryChartProps {
    data: any[]
    users: { user_id: string; username: string }[]
}

const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe',
    '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'
]

export function HistoryChart({ data, users }: HistoryChartProps) {
    const [mode, setMode] = useState<'daily' | 'cumulative'>('cumulative')
    const [hiddenUsers, setHiddenUsers] = useState<Set<string>>(new Set())

    // Transform data if cumulative or calculate deltas with forward-fill
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return []

        const sortedData = [...data].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )

        // 1. Forward-fill: dia sem registro herda o último total conhecido do usuário,
        //    nunca cai pra 0 artificialmente por snapshot nulo/zerado.
        const lastKnown: Record<string, number> = {}
        const filled = sortedData.map(day => {
            const newDay: any = { date: day.date }
            users.forEach(u => {
                const raw = day[u.user_id]
                if (raw !== undefined && raw !== null) {
                    const num = Number(raw)
                    // Ignora leituras inválidas ou zeradas se já temos um histórico acumulado para o usuário
                    if (!isNaN(num) && num > 0) {
                        if (lastKnown[u.user_id] === undefined || num >= lastKnown[u.user_id]) {
                            lastKnown[u.user_id] = num
                        }
                    }
                }
                // Se o usuário nunca apareceu ainda, o total real era 0 mesmo.
                newDay[u.user_id] = lastKnown[u.user_id] ?? 0
            })
            return newDay
        })

        if (mode === 'cumulative') return filled

        // 2. Deltas calculados sobre a série já preenchida e saneada
        const dailyData = []
        for (let i = 0; i < filled.length; i++) {
            const day = filled[i]
            const prevDay = i > 0 ? filled[i - 1] : null
            const newDay: any = { date: day.date }
            users.forEach(u => {
                const currentTotal = Number(day[u.user_id] || 0)
                const prevTotal = prevDay ? Number(prevDay[u.user_id] || 0) : currentTotal
                // Garante que deltas diários não fiquem negativos devido a ruídos
                newDay[u.user_id] = Math.max(0, currentTotal - prevTotal)
            })
            dailyData.push(newDay)
        }
        return dailyData
    }, [data, mode, users])

    const toggleUser = (userId: string) => {
        const next = new Set(hiddenUsers)
        if (next.has(userId)) {
            next.delete(userId)
        } else {
            next.add(userId)
        }
        setHiddenUsers(next)
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                Sem dados históricos disponíveis
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Histórico de Atividade</h3>
                <div className="flex items-center gap-2 rounded-lg border p-1">
                    <button
                        onClick={() => setMode('daily')}
                        className={`rounded px-3 py-1 text-sm ${mode === 'daily' ? 'bg-secondary font-medium' : 'text-muted-foreground'}`}
                    >
                        Diário
                    </button>
                    <button
                        onClick={() => setMode('cumulative')}
                        className={`rounded px-3 py-1 text-sm ${mode === 'cumulative' ? 'bg-secondary font-medium' : 'text-muted-foreground'}`}
                    >
                        Acumulado
                    </button>
                </div>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis
                            dataKey="date"
                            name="Data"
                            tickFormatter={(val) => {
                                const d = new Date(val);
                                const day = d.getUTCDate().toString().padStart(2, '0');
                                const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
                                return `${day}/${month}`;
                            }}
                            stroke="#888888"
                            fontSize={12}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickFormatter={(val) => formatNumber(val)}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '0.5rem'
                            }}
                            labelFormatter={(label) => {
                                const d = new Date(label);
                                const day = d.getUTCDate().toString().padStart(2, '0');
                                const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
                                const year = d.getUTCFullYear();
                                return `${day}/${month}/${year}`;
                            }}
                        />
                        <Legend
                            onClick={(e) => toggleUser(e.payload?.value as string || '')} // This payload access needs care, maybe better to loop buttons
                        />

                        {users.map((user, index) => (
                            <Line
                                key={user.user_id}
                                type="monotone"
                                dataKey={user.user_id}
                                name={user.username}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={2}
                                dot={false}
                                hide={hiddenUsers.has(user.user_id)}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {users.map((u, i) => (
                    <button
                        key={u.user_id}
                        onClick={() => toggleUser(u.user_id)}
                        className={`flex items-center gap-1 rounded-full border px-2 py-1 ${hiddenUsers.has(u.user_id) ? 'opacity-50' : ''}`}
                        style={{ borderColor: COLORS[i % COLORS.length] }}
                    >
                        <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        {u.username}
                    </button>
                ))}
            </div>
        </div>
    )
}
