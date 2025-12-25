import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient'
import { SessionProvider } from 'next-auth/react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SessionProvider>
            <DashboardLayoutClient>
                {children}
            </DashboardLayoutClient>
        </SessionProvider>
    )
}
