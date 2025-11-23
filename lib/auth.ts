import NextAuth, { DefaultSession } from "next-auth"
import Discord from "next-auth/providers/discord"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            isAdmin: boolean
        } & DefaultSession["user"]
    }
}

// Function to check if user is admin in the Discord server
async function isUserAdmin(userId: string): Promise<boolean> {
    const guildId = process.env.DISCORD_GUILD_ID!
    const botToken = process.env.DISCORD_BOT_TOKEN!

    try {
        const response = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
            {
                headers: {
                    Authorization: `Bot ${botToken}`,
                },
            }
        )

        if (!response.ok) {
            console.error('Failed to fetch member:', await response.text())
            return false
        }

        const member = await response.json()

        // Check if user has administrator permission
        // Permission value 8 = ADMINISTRATOR
        const hasAdminRole = member.roles?.some(async (roleId: string) => {
            const roleResponse = await fetch(
                `https://discord.com/api/v10/guilds/${guildId}/roles`,
                {
                    headers: {
                        Authorization: `Bot ${botToken}`,
                    },
                }
            )

            if (!roleResponse.ok) return false

            const roles = await roleResponse.json()
            const role = roles.find((r: any) => r.id === roleId)

            // Check if role has ADMINISTRATOR permission (bit 3)
            return role && (BigInt(role.permissions) & BigInt(0x8)) === BigInt(0x8)
        })

        return hasAdminRole || false
    } catch (error) {
        console.error('Error checking admin status:', error)
        return false
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
        async signIn({ user, account, profile }) {
            // Check if user is admin
            if (account?.provider === "discord" && user.id) {
                const isAdmin = await isUserAdmin(user.id)

                if (!isAdmin) {
                    // Deny access if not admin
                    return false
                }
            }

            return true
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id

                // Check admin status
                if (account?.provider === "discord") {
                    const isAdmin = await isUserAdmin(user.id)
                    token.isAdmin = isAdmin
                }
            }

            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.isAdmin = token.isAdmin as boolean
            }

            return session
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
})
