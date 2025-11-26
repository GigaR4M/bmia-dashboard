'use client'

import { useState, useEffect } from 'react'
import type {
    ServerStats,
    UserStats,
    ChannelStats,
    DailyActivity,
    DailyVoiceActivity,
    DailyMemberStats,
    VoiceUserStats,
    VoiceChannelStats
} from '@/types'

export function useServerStats(days: number = 30) {
    const [data, setData] = useState<ServerStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true)
                const response = await fetch(`/api/stats/server?days=${days}`)
                if (!response.ok) throw new Error('Failed to fetch server stats')
                const stats = await response.json()
                setData(stats)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [days])

    return { data, loading, error }
}

export function useTopUsers(limit: number = 10, days: number = 30) {
    const [data, setData] = useState<UserStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true)
                const response = await fetch(`/api/stats/users?limit=${limit}&days=${days}`)
                if (!response.ok) throw new Error('Failed to fetch top users')
                const users = await response.json()
                setData(users)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [limit, days])

    return { data, loading, error }
}

export function useTopChannels(limit: number = 10, days: number = 30) {
    const [data, setData] = useState<ChannelStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchChannels() {
            try {
                setLoading(true)
                const response = await fetch(`/api/stats/channels?limit=${limit}&days=${days}`)
                if (!response.ok) throw new Error('Failed to fetch top channels')
                const channels = await response.json()
                setData(channels)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchChannels()
    }, [limit, days])

    return { data, loading, error }
}

export function useActivityOverTime(days: number = 30) {
    const [data, setData] = useState<DailyActivity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchActivity() {
            try {
                setLoading(true)
                const response = await fetch(`/api/stats/activity?days=${days}`)
                if (!response.ok) throw new Error('Failed to fetch activity stats')
                const activity = await response.json()
                setData(activity)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchActivity()
    }, [days])

    return { data, loading, error }
}

export function useVoiceActivityOverTime(days: number = 30) {
    const [data, setData] = useState<DailyVoiceActivity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchActivity() {
            try {
                setLoading(true)
                const response = await fetch(`/api/stats/voice?days=${days}`)
                if (!response.ok) throw new Error('Failed to fetch voice stats')
                const activity = await response.json()
                setData(activity)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchActivity()
    }, [days])

    return { data, loading, error }
}

export function useMemberStats(days: number = 30) {
    const [data, setData] = useState<DailyMemberStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true)
                const response = await fetch(`/api/stats/members?days=${days}`)
                if (!response.ok) throw new Error('Failed to fetch member stats')
                const stats = await response.json()
                setData(stats)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [days])

    return { data, loading, error }
}

export function useTopVoiceUsers(limit: number = 10, days: number = 30) {
    const [data, setData] = useState<VoiceUserStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true)
                const response = await fetch(`/api/stats/voice/users?limit=${limit}&days=${days}`)
                if (!response.ok) throw new Error('Failed to fetch top voice users')
                const users = await response.json()
                setData(users)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [limit, days])

    return { data, loading, error }
}

export function useTopVoiceChannels(limit: number = 10, days: number = 30) {
    const [data, setData] = useState<VoiceChannelStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchChannels() {
            try {
                setLoading(true)
                const response = await fetch(`/api/stats/voice/channels?limit=${limit}&days=${days}`)
                if (!response.ok) throw new Error('Failed to fetch top voice channels')
                const channels = await response.json()
                setData(channels)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchChannels()
    }, [limit, days])

    return { data, loading, error }
}

export function useActivityStats(days: number = 30, limit: number = 10) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true)
                const response = await fetch(`/api/stats/activities?days=${days}&limit=${limit}`)
                if (!response.ok) throw new Error('Failed to fetch activity stats')
                const stats = await response.json()
                setData(stats)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [days, limit])

    return { data, loading, error }
}

export function useGiveawayStats(days: number = 30, limit: number = 20, activeOnly: boolean = false) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true)
                const response = await fetch(`/api/stats/giveaways?days=${days}&limit=${limit}&active=${activeOnly}`)
                if (!response.ok) throw new Error('Failed to fetch giveaway stats')
                const stats = await response.json()
                setData(stats)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [days, limit, activeOnly])

    return { data, loading, error }
}
