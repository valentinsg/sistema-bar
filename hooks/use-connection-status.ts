"use client"

import { useEffect, useState } from 'react'

export interface ConnectionStatus {
  isOnline: boolean
  isConnected: boolean
  lastPing: number | null
  latency: number | null
  error: string | null
}

// OPTIMIZACIÓN: Singleton para evitar múltiples pings simultáneos
class ConnectionManager {
  private static instance: ConnectionManager | null = null
  private listeners: Set<(status: ConnectionStatus) => void> = new Set()
  private currentStatus: ConnectionStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isConnected: false,
    lastPing: null,
    latency: null,
    error: null
  }
  private pingController: AbortController | null = null
  private pingInterval: NodeJS.Timeout | null = null
  private lastPingTime = 0
  private isInitialized = false

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager()
    }
    return ConnectionManager.instance
  }

  addListener(callback: (status: ConnectionStatus) => void) {
    this.listeners.add(callback)
    // Enviar estado actual inmediatamente
    callback(this.currentStatus)

    // Inicializar solo cuando hay listeners
    if (!this.isInitialized) {
      this.initialize()
    }

    return () => {
      this.listeners.delete(callback)
      // Si no hay más listeners, limpiar recursos
      if (this.listeners.size === 0) {
        this.cleanup()
      }
    }
  }

  private initialize() {
    if (typeof window === 'undefined' || this.isInitialized) return

    this.isInitialized = true

    // Ping inicial
    this.pingServer()

    // OPTIMIZACIÓN: Ping menos frecuente - cada 5 minutos
    this.pingInterval = setInterval(() => {
      this.pingServer()
    }, 300000) // 5 minutos en lugar de 2 minutos

    // Listeners de conectividad
    const updateOnlineStatus = () => {
      this.updateStatus({
        isOnline: navigator.onLine,
        error: navigator.onLine ? null : 'Sin conexión a internet'
      })
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // OPTIMIZACIÓN: Solo ping al volver si hace más de 2 minutos del último
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const timeSinceLastPing = Date.now() - this.lastPingTime
        if (timeSinceLastPing > 120000) { // Solo si hace más de 2 minutos
          setTimeout(() => this.pingServer(), 1000)
        }
      } else {
        if (this.pingController) {
          this.pingController.abort()
          this.pingController = null
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  private async pingServer() {
    // OPTIMIZACIÓN: Evitar pings concurrentes
    if (document.hidden || this.pingController) {
      return
    }

    if (!navigator.onLine) {
      this.updateStatus({
        isConnected: false,
        error: 'Sin conexión a internet'
      })
      return
    }

    this.pingController = new AbortController()
    const start = Date.now()
    this.lastPingTime = start

    try {
      // OPTIMIZACIÓN: Timeout más corto para evitar funciones colgadas
      const timeoutId = setTimeout(() => {
        this.pingController?.abort()
      }, 3000) // 3 segundos timeout

      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: this.pingController.signal,
        headers: {
          'Connection': 'close' // CRÍTICO: Cerrar conexión inmediatamente
        }
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const latency = Date.now() - start
        this.updateStatus({
          isConnected: true,
          lastPing: Date.now(),
          latency,
          error: null
        })
      } else {
        throw new Error(`Server responded with ${response.status}`)
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        // OPTIMIZACIÓN: Log solo en desarrollo
        if (process.env.NODE_ENV === 'development') {
          console.warn('Connection check failed:', error.message)
        }
        this.updateStatus({
          isConnected: false,
          error: 'Error de conexión al servidor'
        })
      }
    } finally {
      this.pingController = null
    }
  }

  private updateStatus(partial: Partial<ConnectionStatus>) {
    this.currentStatus = { ...this.currentStatus, ...partial }
    this.listeners.forEach(callback => callback(this.currentStatus))
  }

  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }

    if (this.pingController) {
      this.pingController.abort()
      this.pingController = null
    }

    this.isInitialized = false
    this.listeners.clear()

    // Limpiar event listeners si existen
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', () => {})
      window.removeEventListener('offline', () => {})
      document.removeEventListener('visibilitychange', () => {})
    }
  }
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

    const manager = ConnectionManager.getInstance()
    const unsubscribe = manager.addListener(setStatus)

    return unsubscribe
  }, [])

  return status
}
