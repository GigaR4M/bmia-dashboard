'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface UserAvatarProps {
    user?: {
        user_id?: string
        username?: string
        discriminator?: string
        avatar_url?: string | null
    }
    userId?: string
    username?: string
    discriminator?: string
    avatarUrl?: string | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

const SIZE_MAP = {
    xs: { px: 24, class: 'w-6 h-6 text-xs' },
    sm: { px: 32, class: 'w-8 h-8 text-xs' },
    md: { px: 40, class: 'w-10 h-10 text-sm' },
    lg: { px: 48, class: 'w-12 h-12 text-base' },
    xl: { px: 64, class: 'w-16 h-16 text-lg' },
}

export function getDiscordDefaultAvatar(userId?: string, discriminator?: string): string {
    if (discriminator && discriminator !== '0' && discriminator !== '0000') {
        const discNum = parseInt(discriminator, 10)
        if (!isNaN(discNum)) {
            return `https://cdn.discordapp.com/embed/avatars/${discNum % 5}.png`
        }
    }
    if (userId) {
        try {
            const index = Number((BigInt(userId) >> BigInt(22)) % BigInt(6))
            return `https://cdn.discordapp.com/embed/avatars/${index}.png`
        } catch {
            return `https://cdn.discordapp.com/embed/avatars/0.png`
        }
    }
    return `https://cdn.discordapp.com/embed/avatars/0.png`
}

export function UserAvatar({
    user,
    userId: propUserId,
    username: propUsername,
    discriminator: propDiscriminator,
    avatarUrl: propAvatarUrl,
    size = 'md',
    className = '',
}: UserAvatarProps) {
    const userId = propUserId || user?.user_id
    const username = propUsername || user?.username || 'User'
    const discriminator = propDiscriminator || user?.discriminator
    const avatarUrl = propAvatarUrl ?? user?.avatar_url

    const [imgSrc, setImgSrc] = useState<string | null>(() => {
        if (avatarUrl) return avatarUrl
        return getDiscordDefaultAvatar(userId, discriminator)
    })
    const [hasError, setHasError] = useState(false)

    React.useEffect(() => {
        setImgSrc(avatarUrl || getDiscordDefaultAvatar(userId, discriminator))
        setHasError(false)
    }, [avatarUrl, userId, discriminator])

    const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md
    const initials = username.substring(0, 2).toUpperCase() || 'U'

    const handleError = () => {
        if (!hasError && imgSrc !== getDiscordDefaultAvatar(userId, discriminator)) {
            setImgSrc(getDiscordDefaultAvatar(userId, discriminator))
            setHasError(true)
        } else {
            setImgSrc(null)
        }
    }

    if (!imgSrc) {
        return (
            <div
                className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 font-bold text-white shadow-sm overflow-hidden flex-shrink-0 ${sizeConfig.class} ${className}`}
            >
                <span>{initials}</span>
            </div>
        )
    }

    return (
        <div
            className={`relative inline-flex items-center justify-center rounded-full bg-slate-800 ring-1 ring-white/10 overflow-hidden flex-shrink-0 ${sizeConfig.class} ${className}`}
        >
            <Image
                src={imgSrc}
                alt={username}
                width={sizeConfig.px}
                height={sizeConfig.px}
                className="w-full h-full object-cover rounded-full"
                onError={handleError}
                unoptimized
            />
        </div>
    )
}
