'use client'

import { useState, useEffect } from 'react'
import type { ServerStats, UserStats, ChannelStats } from '@/types'

export function useServerStats() {
    const [data, setData] = useState<ServerStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch('/api/stats/server')
                if (!response.ok) throw new Error('Failed to fetch stats')
                const data = await response.json()
                setData(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [])

    return { data, loading, error }
}

export function useTopUsers(limit: number = 10) {
    const [data, setData] = useState<UserStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch(`/api/stats/users?limit=${limit}`)
                if (!response.ok) throw new Error('Failed to fetch users')
                const data = await response.json()
                setData(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [limit])

    return { data, loading, error }
}

export function useTopChannels(limit: number = 10) {
    const [data, setData] = useState<ChannelStats[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchChannels() {
            try {
                const response = await fetch(`/api/stats/channels?limit=${limit}`)
                if (!response.ok) throw new Error('Failed to fetch channels')
                const data = await response.json()
                setData(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }

        fetchChannels()
    }, [limit])

    return { data, loading, error }
}
