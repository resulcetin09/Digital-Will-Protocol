import { useState, useEffect, useCallback } from 'react'

interface WalletState {
  address: string | null
  network: string | null
  connected: boolean
  connecting: boolean
  error: string | null
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    network: null,
    connected: false,
    connecting: false,
    error: null,
  })

  const connect = useCallback(async () => {
    setState(s => ({ ...s, connecting: true, error: null }))
    try {
      // @ts-expect-error — freighter injects window.freighter
      const freighter = window.freighter
      if (!freighter) {
        throw new Error('Freighter cüzdanı bulunamadı. Lütfen Freighter eklentisini yükleyin.')
      }
      const { address } = await freighter.getAddress()
      const { network } = await freighter.getNetwork()
      setState({ address, network, connected: true, connecting: false, error: null })
    } catch (err) {
      setState(s => ({
        ...s,
        connecting: false,
        error: err instanceof Error ? err.message : 'Bağlantı hatası',
      }))
    }
  }, [])

  const disconnect = useCallback(() => {
    setState({ address: null, network: null, connected: false, connecting: false, error: null })
  }, [])

  // Auto-connect if freighter is already authorized
  useEffect(() => {
    const tryAutoConnect = async () => {
      try {
        // @ts-expect-error
        const freighter = window.freighter
        if (!freighter) return
        const isAllowed = await freighter.isAllowed()
        if (isAllowed) {
          const { address } = await freighter.getAddress()
          const { network } = await freighter.getNetwork()
          setState({ address, network, connected: true, connecting: false, error: null })
        }
      } catch {
        // silent — user hasn't connected yet
      }
    }
    tryAutoConnect()
  }, [])

  return { ...state, connect, disconnect }
}
