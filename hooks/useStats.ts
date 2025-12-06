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
    VoiceChannelStats,
    EventStats,
    ModerationStats
} from '@/types'

export function useServerStats(days: number = 30, startDate?: string) {
    const [data, setData] = useState<ServerStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true)
                const guildId = localStorage.getItem('selectedGuildId')
                if (!guildId) throw new Error('No server selected')

                let url = `/api/stats/server?days=${days}&guildId=${guildId}`
                if (startDate) url += `&startDate=${startDate}`
                const response = await fetch(url)
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
    }, [days, startDate])

    return { data, loading, error }
}

export function useTopUsers(limit: number = 10, days: number = 30, startDate?: string) {
    const [data, setData] = useState<UserStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true)
                const guildId = localStorage.getItem('selectedGuildId')
                if (!guildId) throw new Error('No server selected')

                let url = `/api/stats/users?limit=${limit}&days=${days}&guildId=${guildId}`
                if (startDate) url += `&startDate=${startDate}`
                const response = await fetch(url)
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
    }, [limit, days, startDate])

    return { data, loading, error }
}

export function useTopChannels(limit: number = 10, days: number = 30, startDate?: string) {
    const [data, setData] = useState<ChannelStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let ignore = false
        async function fetchChannels() {
            try {
                setLoading(true)
                const guildId = localStorage.getItem('selectedGuildId')
                if (!guildId) throw new Error('No server selected')

                let url = `/api/stats/channels?limit=${limit}&days=${days}&guildId=${guildId}`
                if (startDate) url += `&startDate=${startDate}`
                const response = await fetch(url)
                if (!response.ok) throw new Error('Failed to fetch top channels')
                const channels = await response.json()
                console.log(`[useTopChannels] Fetched ${channels.length} channels for days=${days}`)
                if (!ignore) setData(channels)
            } catch (err) {
                if (!ignore) setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        fetchChannels()
        return () => { ignore = true }
    }, [limit, days, startDate])

    return { data, loading, error }
}

export function useActivityOverTime(days: number = 30, startDate?: string) {
    const [data, setData] = useState<DailyActivity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchActivity() {
            try {
                setLoading(true)
                const guildId = localStorage.getItem('selectedGuildId')
                if (!guildId) throw new Error('No server selected')

                let url = `/api/stats/activity?days=${days}&guildId=${guildId}`
                if (startDate) url += `&startDate=${startDate}`
                const response = await fetch(url)
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
    }, [days, startDate])

    return { data, loading, error }
}

export function useVoiceActivityOverTime(days: number = 30, startDate?: string) {
    const [data, setData] = useState<DailyVoiceActivity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchActivity() {
            try {
                setLoading(true)
                const guildId = localStorage.getItem('selectedGuildId')
                if (!guildId) throw new Error('No server selected')

                let url = `/api/stats/voice?days=${days}&guildId=${guildId}`
                if (startDate) url += `&startDate=${startDate}`
                const response = await fetch(url)
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
    }, [days, startDate])

    return { data, loading, error }
}

export function useMemberStats(days: number = 30, startDate?: string) {
    const [data, setData] = useState<DailyMemberStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true)
                const guildId = localStorage.getItem('selectedGuildId')
                if (!guildId) throw new Error('No server selected')

                let url = `/api/stats/members?days=${days}&guildId=${guildId}`
                if (startDate) url += `&startDate=${startDate}`
                const response = await fetch(url)
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
    }, [days, startDate])

    return { data, loading, error }
}

export function useTopVoiceUsers(limit: number = 10, days: number = 30, startDate?: string) {
    const [data, setData] = useState<VoiceUserStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true)
                const guildId = localStorage.getItem('selectedGuildId')
                if (!guildId) throw new Error('No server selected')

                let url = `/api/stats/voice/users?limit=${limit}&days=${days}&guildId=${guildId}`
                if (startDate) url += `&startDate=${startDate}`
                const response = await fetch(url)
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
    }, [limit, days, startDate])

    return { data, loading, error }
}

export function useTopVoiceChannels(limit: number = 10, days: number = 30, startDate?: string) {
    const [data, setData] = useState<VoiceChannelStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let ignore = false
        async function fetchChannels() {
            try {
                setLoading(true)
                const guildId = localStorage.getItem('selectedGuildId')
                if (!guildId) throw new Error('No server selected')

                let url = `/api/stats/voice/channels?limit=${limit}&days=${days}&guildId=${guildId}`
                if (startDate) url += `&startDate=${startDate}`
                const response = await fetch(url)
                if (!response.ok) throw new Error('Failed to fetch top voice channels')
                const channels = await response.json()
                if (!ignore) setData(channels)
            } catch (err) {
                if (!ignore) setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                if (!ignore) setLoading(false)
            }
        }

        fetchChannels()
        return () => { ignore = true }
    }, [limit, days, startDate])

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
                const guildId = localStorage.getItem('selectedGuildId')
                if (!guildId) throw new Error('No server selected')

                const response = await fetch(`/api/stats/activities?days=${days}&limit=${limit}&guildId=${guildId}`)
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
                const guildId = localStorage.getItem('selectedGuildId')
                if (!guildId) throw new Error('No server selected')

                const response = await fetch(`/api/stats/giveaways?days=${days}&limit=${limit}&active=${activeOnly}&guildId=${guildId}`)
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

export function useLeaderboard(limit: number = 50, period?: number, startDate?: string) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                setLoading(true);
                const queryParams = new URLSearchParams({ limit: limit.toString() });
                if (period) queryParams.append('days', period.toString());
                if (startDate) queryParams.append('startDate', startDate);

                const response = await fetch(`/api/stats/leaderboard?${queryParams}`);
                if (!response.ok) throw new Error('Failed to fetch leaderboard');
                const leaderboard = await response.json();
                setData(leaderboard);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderboard();
    }, [limit, period, startDate]);

    return { data, loading, error };
}

export function useEventStats(startDate?: string) {
    const [data, setData] = useState<EventStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true)
                const guildId = localStorage.getItem('selectedGuildId')
                if (!guildId) throw new Error('No server selected')

                let url = `/api/stats/events?guildId=${guildId}`
                if (startDate) url += `&startDate=${startDate}`

                const response = await fetch(url)
                if (!response.ok) throw new Error('Failed to fetch event stats')
                const stats = await response.json()
                setData(stats)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [startDate])

    return { data, loading, error }
}

export function useModerationStats(days: number = 30, startDate?: string) {
    const [data, setData] = useState<ModerationStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true)
                const guildId = localStorage.getItem('selectedGuildId')
                if (!guildId) throw new Error('No server selected')

                let url = `/api/stats/moderation?days=${days}&guildId=${guildId}`
                if (startDate) url += `&startDate=${startDate}`

                const response = await fetch(url)
                if (!response.ok) throw new Error('Failed to fetch moderation stats')
                const stats = await response.json()
                setData(stats)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [days, startDate])

    return { data, loading, error }
}

export function useHighlights(limit: number = 5) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true)
                const guildId = localStorage.getItem('selectedGuildId')
                if (!guildId) throw new Error('No server selected')

                const response = await fetch(`/api/stats/highlights?limit=${limit}&guildId=${guildId}`)
                if (!response.ok) throw new Error('Failed to fetch highlights')
                const stats = await response.json()
                setData(stats)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [limit])

    return { data, loading, error }
}
