import { useState, useEffect, useCallback } from 'react'
import type { WillInfo } from '../contract/types'
import { getWillInfo } from '../contract/client'

interface UseWillResult {
  info: WillInfo | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useWill(contractAddress: string): UseWillResult {
  const [info, setInfo] = useState<WillInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!contractAddress) return
    try {
      const data = await getWillInfo(contractAddress)
      setInfo(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kontrat verisi alınamadı')
    } finally {
      setLoading(false)
    }
  }, [contractAddress])

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, 5000)
    return () => clearInterval(interval)
  }, [fetch])

  return { info, loading, error, refresh: fetch }
}
