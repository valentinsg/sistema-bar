"use client"

import { useEffect, useState } from 'react'

export interface ConnectionStatus {
  isOnline: boolean
  isConnected: boolean
  lastPing: number | null
  latency: number | null
  error: string | null
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isConnected: false,
    lastPing: null,
    latency: null,
    error: null
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateOnlineStatus = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine,
        error: navigator.onLine ? null : 'Sin conexión a internet'
      }))
    }

    let pingController: AbortController | null = null

    const pingServer = async () => {
      if (document.hidden || pingController) {
        return
      }

      if (!navigator.onLine) {
        setStatus(prev => ({
          ...prev,
          isConnected: false,
          error: 'Sin conexión a internet'
        }))
        return
      }

      pingController = new AbortController()
      const start = Date.now()

      try {
        const response = await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: pingController.signal,
          headers: {
            'Connection': 'keep-alive'
          }
        })

        if (response.ok) {
          const latency = Date.now() - start
          setStatus(prev => ({
            ...prev,
            isConnected: true,
            lastPing: Date.now(),
            latency,
            error: null
          }))
        } else {
          throw new Error(`Server responded with ${response.status}`)
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setStatus(prev => ({
            ...prev,
            isConnected: false,
            error: 'Error de conexión al servidor'
          }))
        }
      } finally {
        pingController = null
      }
    }

    pingServer()

    const pingInterval = setInterval(pingServer, 120000)

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(pingServer, 1000)
      } else {
        if (pingController) {
          pingController.abort()
          pingController = null
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(pingInterval)
      if (pingController) {
        pingController.abort()
      }
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return status
}
