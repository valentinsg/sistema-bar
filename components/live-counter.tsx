"use client"

import { motion } from "framer-motion"
import { RefreshCw, WifiOff } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const LOCAL_ID = process.env.NEXT_PUBLIC_LOCAL_ID!

// Singleton para manejar una única conexión SSE global
class OptimizedSSEManager {
  private static instance: OptimizedSSEManager
  private eventSource: EventSource | null = null
  private listeners: Set<(data: any) => void> = new Set()
  private reconnectTimeout: NodeJS.Timeout | null = null
  private isConnecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3 // CRÍTICO: Reducido de más intentos
  private lastData: any = null
  private connectionStartTime: number = 0
  private isManuallyDisconnected = false

  static getInstance(): OptimizedSSEManager {
    if (!OptimizedSSEManager.instance) {
      OptimizedSSEManager.instance = new OptimizedSSEManager()
    }
    return OptimizedSSEManager.instance
  }

  subscribe(callback: (data: any) => void): () => void {
    this.listeners.add(callback)

    // Enviar datos actuales si están disponibles
    if (this.lastData) {
      callback(this.lastData)
    }

    return () => {
      this.listeners.delete(callback)
      // Si no hay más listeners, cerrar la conexión después de un delay
      if (this.listeners.size === 0) {
        setTimeout(() => {
          if (this.listeners.size === 0) {
            this.disconnect()
          }
        }, 5000) // 5 segundos de gracia antes de desconectar
      }
    }
  }

  private notifyListeners(data: any) {
    this.lastData = data
    this.listeners.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Error en callback SSE:', error)
      }
    })
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN
  }

  connect() {
    // CRÍTICO: No conectar si fue desconectado manualmente
    if (this.isManuallyDisconnected) return

    if (this.isConnecting || this.eventSource?.readyState === EventSource.OPEN) {
      return
    }

    if (!LOCAL_ID) {
      this.notifyListeners({ error: "Variables de entorno no configuradas" })
      return
    }

    // CRÍTICO: Verificar conectividad antes de intentar
    if (!navigator.onLine) {
      this.notifyListeners({ error: "Sin conexión a internet" })
      return
    }

    this.isConnecting = true
    this.connectionStartTime = Date.now()

    try {
      // Cerrar conexión existente si hay una
      if (this.eventSource) {
        this.eventSource.close()
      }

      const url = `/api/contador/sse?local_id=${encodeURIComponent(LOCAL_ID)}`
      this.eventSource = new EventSource(url)

      this.eventSource.onopen = () => {
        console.log("🔗 SSE conectado (optimizado)")
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.isManuallyDisconnected = false
        this.notifyListeners({ connected: true, error: null })
      }

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.notifyListeners(data)
        } catch (error) {
          console.error("Error al parsear datos SSE:", error)
        }
      }

      this.eventSource.onerror = (error) => {
        console.error("Error en SSE:", error)
        this.isConnecting = false

        // CRÍTICO: Solo reconectar si:
        // 1. Hay listeners activos
        // 2. No se excedió el límite de intentos
        // 3. No fue desconectado manualmente
        // 4. La conexión duró más de 5 segundos (evitar loops)
        const connectionDuration = Date.now() - this.connectionStartTime
        const shouldReconnect = this.listeners.size > 0 &&
                               this.reconnectAttempts < this.maxReconnectAttempts &&
                               !this.isManuallyDisconnected &&
                               connectionDuration > 5000

        if (shouldReconnect) {
          this.reconnectAttempts++
          // OPTIMIZACIÓN: Backoff exponencial con jitter
          const baseDelay = Math.min(5000 * Math.pow(2, this.reconnectAttempts), 30000)
          const jitter = Math.random() * 1000
          const delay = baseDelay + jitter

          this.reconnectTimeout = setTimeout(() => {
            this.connect()
          }, delay)
        } else {
          this.notifyListeners({
            error: this.reconnectAttempts >= this.maxReconnectAttempts ?
              "Error de conexión persistente" :
              "Conexión perdida"
          })
        }
      }

    } catch (error) {
      console.error("Error al conectar SSE:", error)
      this.isConnecting = false
      this.notifyListeners({ error: "Error al establecer conexión" })
    }
  }

  disconnect() {
    this.isManuallyDisconnected = true

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    this.isConnecting = false
    this.lastData = null
  }

  // CRÍTICO: Método para reconectar manualmente
  reconnect() {
    this.isManuallyDisconnected = false
    this.reconnectAttempts = 0
    this.disconnect()
    setTimeout(() => this.connect(), 1000)
  }
}

export default function LiveCounterOptimized() {
  const [loading, setLoading] = useState(true)
  const [contador, setContador] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const unsubscribeRef = useRef<(() => void) | null>(null)
  const sseManager = OptimizedSSEManager.getInstance()

  useEffect(() => {
    setIsMounted(true)
    setIsHydrated(true)

    if (!LOCAL_ID) {
      setError("Variables de entorno no configuradas")
      setLoading(false)
      return
    }

    // Suscribirse al SSE manager optimizado
    unsubscribeRef.current = sseManager.subscribe((data) => {
      if (data.error) {
        setError(data.error)
        setIsConnected(false)
      } else if (data.connected) {
        setIsConnected(true)
        setError(null)
        setLoading(false)
      } else if (data.contador !== undefined) {
        setContador(data.contador)
        setLastUpdate(new Date(data.timestamp))
        setError(null)
        setLoading(false)
        setIsConnected(true)
      }
    })

    // Conectar SSE
    sseManager.connect()

    // OPTIMIZACIÓN: Manejo más eficiente de visibilidad
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Solo marcar como inactivo visualmente, no desconectar
        setIsConnected(false)
      } else {
        // Verificar estado real y reconectar si es necesario
        if (!sseManager.isConnected()) {
          sseManager.reconnect()
        } else {
          setIsConnected(true)
        }
      }
    }

    const handleOnline = () => {
      setError(null)
      if (!sseManager.isConnected()) {
        sseManager.reconnect()
      }
    }

    const handleOffline = () => {
      setError("Sin conexión a internet")
      setIsConnected(false)
    }

    // CRÍTICO: Throttle de event listeners
    let visibilityTimeout: NodeJS.Timeout
    const throttledVisibilityChange = () => {
      clearTimeout(visibilityTimeout)
      visibilityTimeout = setTimeout(handleVisibilityChange, 500)
    }

    document.addEventListener("visibilitychange", throttledVisibilityChange)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      clearTimeout(visibilityTimeout)
      document.removeEventListener("visibilitychange", throttledVisibilityChange)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleManualRefresh = () => {
    setError(null)
    setLoading(true)
    sseManager.reconnect()
  }

  if (!isMounted || !isHydrated) return null

  if (!LOCAL_ID || error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg mx-auto mb-16"
      >
        <div className="relative z-10 p-8 text-center rounded-3xl glass-effect border-glow">
          <div className="text-red-400 mb-4">
            <WifiOff className="w-12 h-12 mx-auto mb-2" />
            <p className="text-lg font-medium">Error de Conexión</p>
            <p className="text-sm text-red-300 mt-2">{error || "Configuración requerida"}</p>
            {error && !error.includes("Variables de entorno") && (
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
              >
                <RefreshCw className={`w-4 h-4 inline mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Conectando...' : 'Reintentar'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-lg mx-auto mb-16"
    >
      <motion.div
        className="relative px-16 z-10 text-center rounded-3xl p-4 backdrop-blur-xs bg-white/5 border border-white/10 shadow-2xl"
        animate={{
          scale: [1, 1.02, 1],
          boxShadow: [
            "0 0 20px rgba(16, 185, 129, 0.1), 0 0 40px rgba(16, 185, 129, 0.05)",
            "0 0 30px rgba(16, 185, 129, 0.2), 0 0 60px rgba(16, 185, 129, 0.1)",
            "0 0 20px rgba(16, 185, 129, 0.1), 0 0 40px rgba(16, 185, 129, 0.05)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="flex items-center justify-center gap-3">
          <motion.div
            className={`w-3 h-3 rounded-full shadow-glow ${
              isConnected ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-yellow-400 shadow-yellow-400/50'
            }`}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <span className={`text-sm font-medium font-source-sans ${
            isConnected ? 'text-emerald-300' : 'text-yellow-300'
          }`}>
            {loading ? 'Conectando...' : isConnected ? 'Live' : 'Reconectando...'}
          </span>
        </div>

        <motion.div className="mb-8">
          <div className="text-6xl my-8 lg:text-9xl font-bold font-legquinne text-white tracking-tighter leading-none text-crisp">
            {contador} | 111
          </div>
        </motion.div>

        <p className="text-orange-300 text-lg font-medium font-source-sans tracking-wide text-crisp">
          Now Inside
        </p>

        {lastUpdate && (
          <p className="text-xs text-white/50 mt-2">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
