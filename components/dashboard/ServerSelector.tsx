'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ServerSelector() {
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [selectedGuild, setSelectedGuild] = useState<{ id: string, name: string, icon: string | null } | null>(null)

    useEffect(() => {
        if (session?.user?.guilds && session.user.guilds.length > 0) {
            // Try to recover from localStorage
            const storedGuildId = localStorage.getItem('selectedGuildId')
            const foundGuild = session.user.guilds.find(g => g.id === storedGuildId)

            if (foundGuild) {
                setSelectedGuild(foundGuild)
            } else {
                // Default to first guild
                const first = session.user.guilds[0]
                setSelectedGuild(first)
                localStorage.setItem('selectedGuildId', first.id)
            }
        }
    }, [session])

    const handleSelect = (guild: { id: string, name: string, icon: string | null }) => {
        setSelectedGuild(guild)
        localStorage.setItem('selectedGuildId', guild.id)
        setIsOpen(false)
        // Force reload to update all components that might rely on localStorage directly or trigger a re-fetch
        // In a more complex app we'd use a Context, but this ensures data consistency for now
        window.location.reload()
    }

    if (!session?.user?.guilds || session.user.guilds.length === 0) {
        return null
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {selectedGuild?.icon ? (
                        <img
                            src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`}
                            alt={selectedGuild.name}
                            className="w-6 h-6 rounded-full"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                            {selectedGuild?.name.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                    <span className="truncate text-sm font-medium text-slate-200">
                        {selectedGuild?.name || 'Select Server'}
                    </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                        {session.user.guilds.map((guild) => (
                            <button
                                key={guild.id}
                                onClick={() => handleSelect(guild)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700 transition-colors text-left",
                                    selectedGuild?.id === guild.id && "bg-slate-700/50"
                                )}
                            >
                                {guild.icon ? (
                                    <img
                                        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                                        alt={guild.name}
                                        className="w-6 h-6 rounded-full"
                                    />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold">
                                        {guild.name.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <span className="flex-1 truncate text-sm text-slate-200">
                                    {guild.name}
                                </span>
                                {selectedGuild?.id === guild.id && (
                                    <Check className="w-4 h-4 text-purple-400" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
