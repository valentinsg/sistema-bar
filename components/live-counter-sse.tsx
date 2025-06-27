"use client"

import { motion } from "framer-motion"
import { RefreshCw, WifiOff } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const LOCAL_ID = process.env.NEXT_PUBLIC_LOCAL_ID!

export default function LiveCounterSSE() {
  const [loading, setLoading] = useState(true)
  const [contador, setContador] = useState<number>(0)
  const [showCounter, setShowCounter] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(true)

  const connectSSE = () => {
    if (!LOCAL_ID || !isActiveRef.current) return

    try {
      // Cerrar conexión existente si hay una
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const url = `/api/contador/sse?local_id=${encodeURIComponent(LOCAL_ID)}`
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log("SSE conectado")
        setIsConnected(true)
        setError(null)
        setLoading(false)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.error) {
            setError(data.error)
          } else {
            setContador(data.contador)
            setLastUpdate(new Date(data.timestamp))
            setError(null)
          }
        } catch (error) {
          console.error("Error al parsear datos SSE:", error)
        }
      }

      eventSource.onerror = (error) => {
        console.error("Error en SSE:", error)
        setIsConnected(false)
        setError("Error de conexión")

        // Reintentar conexión después de 5 segundos
        if (isActiveRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isActiveRef.current) {
              connectSSE()
            }
          }, 5000)
        }
      }

    } catch (error) {
      console.error("Error al conectar SSE:", error)
      setError("Error al establecer conexión")
      setLoading(false)
    }
  }

  const disconnectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    setIsConnected(false)
  }

  useEffect(() => {
    setIsMounted(true)
    setIsHydrated(true)

    if (!LOCAL_ID) {
      setError("Variables de entorno no configuradas")
      setLoading(false)
      return
    }

    const checkTime = () => {
      const now = new Date()
      const hour = now.getHours()
      const isDevelopment = process.env.NODE_ENV === "development" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      const isOperatingTime = hour >= 19 || hour < 6
      setShowCounter(isDevelopment || isOperatingTime)
    }

    checkTime()
    connectSSE()
    const timeInterval = setInterval(checkTime, 60000)

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false
        disconnectSSE()
      } else {
        isActiveRef.current = true
        setTimeout(() => {
          if (isActiveRef.current) {
            connectSSE()
          }
        }, 1000)
      }
    }

    const handleOnline = () => {
      if (isActiveRef.current) {
        setError(null)
        connectSSE()
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
      isActiveRef.current = false
      disconnectSSE()
      clearInterval(timeInterval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleManualRefresh = () => {
    setError(null)
    connectSSE()
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
