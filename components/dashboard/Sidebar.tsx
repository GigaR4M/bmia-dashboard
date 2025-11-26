'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Hash, LogOut, Gamepad2, Gift } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Usuários', href: '/stats/users', icon: Users },
    { name: 'Canais', href: '/stats/channels', icon: Hash },
    { name: 'Atividades', href: '/stats/activities', icon: Gamepad2 },
    { name: 'Sorteios', href: '/stats/giveaways', icon: Gift },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-xl border-r border-slate-700/50">
            {/* Logo */}
            <div className="p-6 border-b border-slate-700/50">
                <h1 className="text-2xl font-bold text-white">BMIA</h1>
                <p className="text-sm text-slate-400">Dashboard</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-slate-700/50">
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-200 w-full"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sair</span>
                </button>
            </div>
        </div>
    )
}
