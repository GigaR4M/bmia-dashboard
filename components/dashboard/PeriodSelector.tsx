'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'

export interface DateFilter {
    type: 'days' | 'month' | 'year' | 'custom'
    days?: number
    startDate?: string
    endDate?: string
}

interface PeriodSelectorProps {
    value: DateFilter
    onChange: (filter: DateFilter) => void
}

const PERIOD_OPTIONS = [
    { label: '7 dias', value: 7 },
    { label: '30 dias', value: 30 },
    { label: '60 dias', value: 60 },
    { label: '90 dias', value: 90 },
]

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
    const [showCustom, setShowCustom] = useState(false)
    const [customStart, setCustomStart] = useState('')
    const [customEnd, setCustomEnd] = useState('')

    const handleDaysClick = (days: number) => {
        onChange({ type: 'days', days })
        setShowCustom(false)
    }

    const handleMonthClick = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`
        const endDate = now.toISOString().split('T')[0]

        onChange({ type: 'month', startDate, endDate })
        setShowCustom(false)
    }

    const handleYearClick = () => {
        const now = new Date()
        const year = now.getFullYear()
        const startDate = `${year}-01-01`
        const endDate = now.toISOString().split('T')[0]

        onChange({ type: 'year', startDate, endDate })
        setShowCustom(false)
    }

    const handleCustomClick = () => {
        setShowCustom(!showCustom)
    }

    const applyCustomRange = () => {
        if (customStart && customEnd) {
            onChange({ type: 'custom', startDate: customStart, endDate: customEnd })
            setShowCustom(false)
        }
    }

    const isActive = (type: string, days?: number) => {
        if (type === 'days' && value.type === 'days' && value.days === days) return true
        if (type === value.type && type !== 'days') return true
        return false
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 text-sm">Período:</span>
                <div className="flex gap-2 flex-wrap">
                    {PERIOD_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleDaysClick(option.value)}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${isActive('days', option.value)
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                                }
                            `}
                        >
                            {option.label}
                        </button>
                    ))}

                    <button
                        onClick={handleMonthClick}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${isActive('month')
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                            }
                        `}
                    >
                        Mês Atual
                    </button>

                    <button
                        onClick={handleYearClick}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${isActive('year')
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                            }
                        `}
                    >
                        Ano Atual
                    </button>

                    <button
                        onClick={handleCustomClick}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                            ${isActive('custom') || showCustom
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                            }
                        `}
                    >
                        <Calendar size={16} />
                        Personalizado
                    </button>
                </div>
            </div>

            {showCustom && (
                <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                    <div className="flex items-center gap-2">
                        <label className="text-slate-400 text-sm">De:</label>
                        <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm border border-slate-600 focus:border-purple-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-slate-400 text-sm">Até:</label>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            min={customStart}
                            className="bg-slate-700 text-white px-3 py-2 rounded-lg text-sm border border-slate-600 focus:border-purple-500 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={applyCustomRange}
                        disabled={!customStart || !customEnd}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Aplicar
                    </button>
                </div>
            )}
        </div>
    )
}
