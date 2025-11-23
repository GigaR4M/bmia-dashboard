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
}

export function StatsCard({ title, value, icon, trend, loading }: StatsCardProps) {
    if (loading) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-700 rounded w-3/4"></div>
            </div>
        )
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>

                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 mt-2 text-sm font-medium",
                            trend.isPositive ? "text-green-400" : "text-red-400"
                        )}>
                            <span>{trend.isPositive ? "↑" : "↓"}</span>
                            <span>{Math.abs(trend.value)}%</span>
                        </div>
                    )}
                </div>

                {icon && (
                    <div className="text-purple-400 opacity-80">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    )
}
