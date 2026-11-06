import { handlers } from "@/lib/auth"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
    // Workaround for NextAuth v5 beta + Discord OAuth2 RFC 9207 `iss` parameter:
    // Discord sends `iss` in the callback query string, while @auth/core defaults
    // non-OIDC providers' expected issuer to "https://authjs.dev", causing
    // `oauth4webapi` to throw `unexpected "iss" (issuer) response parameter value`.
    if (req.nextUrl.searchParams.has("iss")) {
        const url = new URL(req.url)
        url.searchParams.delete("iss")
        req = new NextRequest(url, req)
    }
    return handlers.GET(req)
}

export const { POST } = handlers
