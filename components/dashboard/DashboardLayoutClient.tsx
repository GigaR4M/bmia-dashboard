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
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border-r border-slate-700/50",
                        !isSidebarOpen && "md:-translate-x-full md:w-0 md:border-none duration-300",
                        // Mobile specific: Handled by MobileNav mostly, but we are unifying.
                        // If we want ONE sidebar for all, we need to handle mobile overlay here too.
                        // Currently MobileNav has its own Portal. Let's keep MobileNav for mobile for now to avoid breaking it,
                        // AND add this collapsible behavior for desktop.
                        "hidden md:block"
                    )}
                >
                    <Sidebar onClose={closeSidebar} />
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden w-full transition-all duration-300">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-8">
                        {children}
                    </main>
                </div>
            </div>
        </DashboardContext.Provider>
    )
}
