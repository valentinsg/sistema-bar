"use client"

import { motion } from "framer-motion"
import { RefreshCw, WifiOff } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const LOCAL_ID = process.env.NEXT_PUBLIC_LOCAL_ID!

// Singleton para manejar una única conexión SSE global
class SSEManager {
  private static instance: SSEManager
  private eventSource: EventSource | null = null
  private listeners: Set<(data: any) => void> = new Set()
  private reconnectTimeout: NodeJS.Timeout | null = null
  private isConnecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 3

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager()
    }
    return SSEManager.instance
  }

  subscribe(callback: (data: any) => void): () => void {
    this.listeners.add(callback)

    // Si ya hay datos, enviarlos inmediatamente
    if (this.eventSource?.readyState === EventSource.OPEN) {
      // Enviar estado actual si está disponible
    }

    return () => {
      this.listeners.delete(callback)
      // Si no hay más listeners, cerrar la conexión
      if (this.listeners.size === 0) {
        this.disconnect()
      }
    }
  }

  private notifyListeners(data: any) {
    this.listeners.forEach(callback => callback(data))
  }

  connect() {
    if (this.isConnecting || this.eventSource?.readyState === EventSource.OPEN) {
      return
    }

    if (!LOCAL_ID) {
      this.notifyListeners({ error: "Variables de entorno no configuradas" })
      return
    }

    this.isConnecting = true

    try {
      // Cerrar conexión existente si hay una
      if (this.eventSource) {
        this.eventSource.close()
      }

      const url = `/api/contador/sse?local_id=${encodeURIComponent(LOCAL_ID)}`
      this.eventSource = new EventSource(url)

      this.eventSource.onopen = () => {
        console.log("SSE conectado")
        this.isConnecting = false
        this.reconnectAttempts = 0
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

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000) // Backoff exponencial

          this.reconnectTimeout = setTimeout(() => {
            this.connect()
          }, delay)
        } else {
          this.notifyListeners({ error: "Error de conexión persistente" })
        }
      }

    } catch (error) {
      console.error("Error al conectar SSE:", error)
      this.isConnecting = false
      this.notifyListeners({ error: "Error al establecer conexión" })
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    this.isConnecting = false
    this.reconnectAttempts = 0
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN
  }
}

export default function LiveCounterSSE() {
  const [loading, setLoading] = useState(true)
  const [contador, setContador] = useState<number>(0)
  const [showCounter, setShowCounter] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const unsubscribeRef = useRef<(() => void) | null>(null)
  const sseManager = SSEManager.getInstance()

  useEffect(() => {
    setIsMounted(true)
    setIsHydrated(true)

    if (!LOCAL_ID) {
      setError("Variables de entorno no configuradas")
      setLoading(false)
      return
    }

    // Mostrar siempre el contador
    setShowCounter(true)

    // Suscribirse al SSE manager
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
      }
    })

    // Conectar SSE
    sseManager.connect()

    // Manejar cambios de visibilidad de manera más eficiente
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // No desconectar inmediatamente, solo marcar como inactivo
        setIsConnected(false)
      } else {
        // Reconectar solo si no está conectado
        if (!sseManager.isConnected()) {
          sseManager.connect()
        }
        setIsConnected(true)
      }
    }

    const handleOnline = () => {
      setError(null)
      if (!sseManager.isConnected()) {
        sseManager.connect()
      }
    }

    const handleOffline = () => {
      setError("Sin conexión a internet")
      setIsConnected(false)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleManualRefresh = () => {
    setError(null)
    sseManager.connect()
  }

  if (!isMounted || !isHydrated) return null
  if (!showCounter) return null

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
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-white text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Reintentar
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg mx-auto mb-16"
      >
        <div className="relative z-10 p-8 text-center rounded-3xl glass-effect border-glow">
          <div className="text-white mb-4">
            <div className="w-12 h-12 mx-auto mb-2 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-lg font-medium">Conectando...</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-md mx-auto mb-16"
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
            {isConnected ? 'Live' : 'Conectando...'}
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

