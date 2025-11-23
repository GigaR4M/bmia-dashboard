import NextAuth, { DefaultSession } from "next-auth"
import Discord from "next-auth/providers/discord"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            isAdmin: boolean
        } & DefaultSession["user"]
    }

    interface User {
        id: string
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        id?: string
        isAdmin?: boolean
    }
}

// Function to check if user is admin in the Discord server
async function isUserAdmin(userId: string): Promise<boolean> {
    const guildId = process.env.DISCORD_GUILD_ID!
    const botToken = process.env.DISCORD_BOT_TOKEN!

    try {
        // Fetch member info
        const memberResponse = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
            {
                headers: {
                    Authorization: `Bot ${botToken}`,
                },
            }
        )

        if (!memberResponse.ok) {
            console.error('Failed to fetch member:', await memberResponse.text())
            return false
        }

        const member = await memberResponse.json()

        // Fetch all guild roles
        const rolesResponse = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/roles`,
            {
                headers: {
                    Authorization: `Bot ${botToken}`,
                },
            }
        )

        if (!rolesResponse.ok) {
            console.error('Failed to fetch roles:', await rolesResponse.text())
            return false
        }

        const allRoles = await rolesResponse.json()

        // Check if any of the member's roles has ADMINISTRATOR permission
        const memberRoleIds = member.roles || []

        for (const roleId of memberRoleIds) {
            const role = allRoles.find((r: any) => r.id === roleId)

            if (role) {
                // Check if role has ADMINISTRATOR permission (bit 3 = 0x8)
                const permissions = BigInt(role.permissions)
                const hasAdmin = (permissions & BigInt(0x8)) === BigInt(0x8)

                if (hasAdmin) {
                    return true
                }
            }
        }

        return false
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
            // Check if user is admin using Discord ID from account
            if (account?.provider === "discord" && account?.providerAccountId) {
                const discordId = account.providerAccountId
                const isAdmin = await isUserAdmin(discordId)

                if (!isAdmin) {
                    // Deny access if not admin
                    return false
                }
            }

            return true
        },
        async jwt({ token, user, account, profile }) {
            // Store Discord ID in token
            if (account?.provider === "discord" && account?.providerAccountId) {
                token.id = account.providerAccountId

                // Check admin status using Discord ID
                const isAdmin = await isUserAdmin(account.providerAccountId)
                token.isAdmin = isAdmin
            }

            return token
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string
                session.user.isAdmin = token.isAdmin || false
            }

            return session
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
})
