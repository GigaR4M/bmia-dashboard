'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'

export function Header() {
    const { data: session } = useSession()

    return (
        <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 px-8 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Bem-vindo de volta!</h2>
                    <p className="text-slate-400 text-sm">Aqui estão as estatísticas do seu servidor</p>
                </div>

                {session?.user && (
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-white font-medium">{session.user.name}</p>
                            <p className="text-slate-400 text-sm">Administrador</p>
                        </div>
                        {session.user.image && (
                            <Image
                                src={session.user.image}
                                alt={session.user.name || 'User'}
                                width={40}
                                height={40}
                                className="rounded-full border-2 border-purple-500"
                            />
                        )}
                    </div>
                )}
            </div>
        </header>
    )
}
