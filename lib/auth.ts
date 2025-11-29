import NextAuth, { DefaultSession } from "next-auth"
import Discord from "next-auth/providers/discord"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            isAdmin: boolean
            guilds: {
                id: string
                name: string
                icon: string | null
            }[]
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        guilds?: {
            id: string
            name: string
            icon: string | null
        }[]
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        id?: string
        isAdmin?: boolean
        guilds?: {
            id: string
            name: string
            icon: string | null
        }[]
    }
}

// Function to fetch user's guilds where they have admin permissions
async function getUserAdminGuilds(accessToken: string): Promise<any[]> {
    try {
        const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (!response.ok) {
            console.error('Failed to fetch user guilds:', await response.text())
            return []
        }

        const guilds = await response.json()

        // Filter guilds where user has ADMINISTRATOR (0x8) or MANAGE_GUILD (0x20) permission
        // Permissions are returned as a string integer
        return guilds.filter((guild: any) => {
            const permissions = BigInt(guild.permissions)
            const hasAdmin = (permissions & BigInt(0x8)) === BigInt(0x8)
            const hasManageGuild = (permissions & BigInt(0x20)) === BigInt(0x20)
            return hasAdmin || hasManageGuild
        }).map((guild: any) => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon
        }))
    } catch (error) {
        console.error('Error fetching user guilds:', error)
        return []
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "identify email guilds",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            // Initial sign in
            if (account?.provider === "discord" && account?.access_token) {
                token.id = account.providerAccountId

                // Fetch user's admin guilds using the access token
                const adminGuilds = await getUserAdminGuilds(account.access_token)
                token.guilds = adminGuilds
                token.isAdmin = adminGuilds.length > 0
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string
                session.user.isAdmin = token.isAdmin || false
                session.user.guilds = token.guilds || []
            }
            return session
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
})

export function validateGuildAccess(session: any, guildId: string): boolean {
    if (!session?.user?.guilds) return false
    return session.user.guilds.some((g: any) => g.id === guildId)
}
