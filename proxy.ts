import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
    const session = await auth()

    // Public paths that don't require authentication
    const publicPaths = ['/login', '/api/auth']
    const isPublicPath = publicPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    // If trying to access protected route without authentication
    if (!session && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If authenticated but not admin, deny access to dashboard
    if (session && !session.user.isAdmin && !isPublicPath) {
        return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
    }

    // If authenticated and trying to access login page, redirect to dashboard
    if (session && request.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
