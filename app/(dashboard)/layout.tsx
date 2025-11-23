import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { SessionProvider } from 'next-auth/react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SessionProvider>
            <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0">
                    <Sidebar />
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-8">
                        {children}
                    </main>
                </div>
            </div>
        </SessionProvider>
    )
}
