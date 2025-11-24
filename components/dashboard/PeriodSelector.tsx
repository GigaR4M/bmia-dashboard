'use client'

interface PeriodSelectorProps {
    value: number
    onChange: (days: number) => void
}

const PERIOD_OPTIONS = [
    { label: '7 dias', value: 7 },
    { label: '30 dias', value: 30 },
    { label: '60 dias', value: 60 },
    { label: '90 dias', value: 90 },
]

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Período:</span>
            <div className="flex gap-2">
                {PERIOD_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${value === option.value
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'
                            }
            `}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
