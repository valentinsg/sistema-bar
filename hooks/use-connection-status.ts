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

    const pingServer = async () => {
      const start = Date.now()
      try {
        const response = await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-cache'
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
          throw new Error('Server error')
        }
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          isConnected: false,
          error: 'Error de conexión al servidor'
        }))
      }
    }

    // Ping inicial
    pingServer()

    // Ping cada 30 segundos
    const pingInterval = setInterval(pingServer, 30000)

    // Event listeners
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      clearInterval(pingInterval)
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return status
}
