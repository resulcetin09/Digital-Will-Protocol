import { useState, useEffect, useCallback } from 'react'
import {
  setAllowed,
  isAllowed,
  getAddress,
  getNetwork,
} from '@stellar/freighter-api'

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
      // Step 1: Request permission from Freighter (shows popup if needed)
      const allowed = await setAllowed()
      if (!allowed) {
        throw new Error('Freighter bağlantı izni reddedildi.')
      }

      // Step 2: Get the public address
      const addressResult = await getAddress()
      if (addressResult.error) {
        throw new Error(addressResult.error)
      }

      // Step 3: Get the current network
      const networkResult = await getNetwork()
      if (networkResult.error) {
        throw new Error(networkResult.error)
      }

      setState({
        address: addressResult.address,
        network: networkResult.network,
        connected: true,
        connecting: false,
        error: null,
      })
    } catch (err) {
      setState(s => ({
        ...s,
        connecting: false,
        error:
          err instanceof Error
            ? err.message
            : 'Freighter bağlantı hatası oluştu.',
      }))
    }
  }, [])

  const disconnect = useCallback(() => {
    setState({ address: null, network: null, connected: false, connecting: false, error: null })
  }, [])

  // Auto-connect if Freighter has already granted permission
  useEffect(() => {
    const tryAutoConnect = async () => {
      try {
        const allowed = await isAllowed()
        if (allowed) {
          const addressResult = await getAddress()
          const networkResult = await getNetwork()
          if (!addressResult.error && !networkResult.error) {
            setState({
              address: addressResult.address,
              network: networkResult.network,
              connected: true,
              connecting: false,
              error: null,
            })
          }
        }
      } catch {
        // silent — user hasn't connected yet
      }
    }
    tryAutoConnect()
  }, [])

  return { ...state, connect, disconnect }
}
