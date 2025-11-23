'use client'

import { useTopUsers } from '@/hooks/useStats'
import { formatNumber, formatDateTime } from '@/lib/utils'

export default function UsersPage() {
    const { data: users, loading } = useTopUsers(20)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Estatísticas de Usuários</h1>
                <p className="text-slate-400">Top usuários mais ativos do servidor</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50 border-b border-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Rank</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Usuário</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Mensagens</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Última Mensagem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                [...Array(10)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-8"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-24"></div></td>
                                    </tr>
                                ))
                            ) : (
                                users.map((user, index) => (
                                    <tr key={user.user_id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm">
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-white font-medium">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white font-semibold">{formatNumber(user.message_count)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-400 text-sm">{formatDateTime(user.last_message_at)}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
