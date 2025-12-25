'use client'

import { useState, createContext, useContext } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { cn } from '@/lib/utils'

interface DashboardContextType {
    isSidebarOpen: boolean
    toggleSidebar: () => void
    closeSidebar: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function useDashboard() {
    const context = useContext(DashboardContext)
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider')
    }
    return context
}

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    // Default open on desktop (md+), closed on mobile
    // We can't easily detect "desktop" on server, so we start closed or use CSS media queries
    // But we want a toggle state.
    // Let's start with TRUE (open) and let CSS handle the initial "hidden on mobile"
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev)
    const closeSidebar = () => setIsSidebarOpen(false)

    return (
        <DashboardContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
            <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-hidden">
                {/* Mobile Overlay */}
                <div
                    className={cn(
                        "fixed inset-0 z-[45] bg-black/80 backdrop-blur-sm transition-opacity md:hidden",
                        isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                    onClick={closeSidebar}
                    aria-hidden="true"
                />

                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-[50] w-64 bg-slate-900 border-r border-slate-700/50 shadow-xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-none",
                        !isSidebarOpen && "-translate-x-full md:w-0 md:border-none md:overflow-hidden"
                    )}
                >
                    <Sidebar onClose={closeSidebar} />
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden w-full transition-all duration-300">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </DashboardContext.Provider>
    )
}
