import { cn } from "@/lib/utils"

interface StatsCardProps {
    title: string
    value: string | number
    icon?: React.ReactNode
    trend?: {
        value: number
        isPositive: boolean
    }
    loading?: boolean
    accentColor?: 'cyan' | 'purple' | 'gold' | 'rose'
}

export function StatsCard({ title, value, icon, trend, loading, accentColor = 'cyan' }: StatsCardProps) {
    if (loading) {
        return (
            <div className="cyber-card rounded-2xl p-6 border border-slate-800 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-800 rounded w-3/4"></div>
            </div>
        )
    }

    const accentClasses = {
        cyan: 'laser-top-cyan hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(0,240,255,0.15)]',
        purple: 'laser-top-purple hover:border-purple-500/40 hover:shadow-[0_0_25px_rgba(176,38,255,0.15)]',
        gold: 'laser-top-gold hover:border-yellow-500/40 hover:shadow-[0_0_25px_rgba(255,215,0,0.15)]',
        rose: 'laser-top hover:border-rose-500/40 hover:shadow-[0_0_25px_rgba(255,0,85,0.15)]'
    }

    return (
        <div className={cn(
            "cyber-card rounded-2xl p-6 laser-top transition-all duration-300 relative overflow-hidden group",
            accentClasses[accentColor]
        )}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 font-rajdhani">{title}</p>
                    <p className="text-3xl font-extrabold text-white font-orbitron tracking-tight">{value}</p>

                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 mt-2.5 text-xs font-bold font-rajdhani",
                            trend.isPositive ? "text-emerald-400" : "text-rose-400"
                        )}>
                            <span>{trend.isPositive ? "▲" : "▼"}</span>
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-slate-500 font-normal ml-1">vs período anterior</span>
                        </div>
                    )}
                </div>

                {icon && (
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/50 group-hover:border-cyan-500/30 group-hover:scale-105 transition-all shadow-inner">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    )
}

