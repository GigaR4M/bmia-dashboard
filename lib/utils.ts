import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

export function formatDateTime(date: Date | string): string {
    let d: Date
    if (typeof date === 'string') {
        // If string doesn't have timezone info (Z or + or -), assume UTC
        // Also handle potential space instead of T from some DB drivers
        const cleanDate = date.replace(' ', 'T')
        if (!cleanDate.includes('Z') && !cleanDate.match(/[+-]\d{2}:?\d{2}$/)) {
            d = new Date(cleanDate + 'Z')
        } else {
            d = new Date(cleanDate)
        }
    } else {
        d = date
    }

    return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
    })
}

export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${Math.round(minutes)}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return `${hours}h ${remainingMinutes}m`
}
