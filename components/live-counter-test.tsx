"use client"

import { getContador } from "@/lib/storage"
import { motion } from "framer-motion"
import { RefreshCw, WifiOff } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

const LOCAL_ID = process.env.NEXT_PUBLIC_LOCAL_ID!

export default function LiveCounterTest() {
  const [loading, setLoading] = useState(true)
  const [contador, setContador] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(true)
  const isVisibleRef = useRef(true)

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const cargarContador = useCallback(async () => {
    if (!LOCAL_ID || !isActiveRef.current || !isVisibleRef.current) {
      console.log("❌ No LOCAL_ID, no activo, o pestaña oculta:", {
        LOCAL_ID,
        isActive: isActiveRef.current,
        isVisible: isVisibleRef.current
      })
      return
    }

    try {
      console.log("🔄 Cargando contador para:", LOCAL_ID)
      const contadorData = await getContador(LOCAL_ID)
      console.log("✅ Contador cargado:", contadorData)
      setContador(contadorData)
      setLastUpdate(new Date())
      setError(null)
    } catch (error) {
      console.error("❌ Error al cargar contador:", error)
      setError(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
    setIsHydrated(true)

    // Debug info
    const debug = {
      LOCAL_ID: LOCAL_ID,
      hasLocalId: !!LOCAL_ID,
      nodeEnv: process.env.NODE_ENV,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      currentHour: new Date().getHours(),
      timestamp: new Date().toISOString()
    }
    setDebugInfo(debug)
    console.log("🔍 Debug info:", debug)

    if (!LOCAL_ID) {
      console.error("❌ LOCAL_ID no configurado")
      setError("LOCAL_ID no configurado")
      setLoading(false)
      return
    }

    console.log("🚀 Iniciando live counter test")
    cargarContador()

    // OPTIMIZACIÓN: Cambiar de 10 segundos a 30 segundos para reducir llamadas
    intervalRef.current = setInterval(cargarContador, 30000)

    // Manejar cambios de visibilidad para pausar polling cuando la pestaña no está activa
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden
      console.log("👁️ Cambio de visibilidad:", isVisibleRef.current ? "visible" : "oculta")
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      isActiveRef.current = false
      cleanup()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [cargarContador, cleanup])

  const handleManualRefresh = () => {
    console.log("🔄 Refresh manual")
    setError(null)
    cargarContador()
  }

  if (!isMounted || !isHydrated) {
    console.log("⏳ No montado o no hidratado")
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-md mx-auto mb-16"
    >
      <motion.div
        className="relative px-8 z-10 text-center rounded-3xl p-6 backdrop-blur-xs bg-white/5 border border-white/10 shadow-2xl"
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
        {/* Debug Info */}
        <div className="mb-4 p-2 bg-black/20 rounded text-xs text-white/70">
          <div>LOCAL_ID: {LOCAL_ID ? '✅ Configurado' : '❌ No configurado'}</div>
          <div>Env: {process.env.NODE_ENV}</div>
          <div>Hora: {new Date().getHours()}:{new Date().getMinutes()}</div>
          <div>Polling: 30s (optimizado)</div>
          <div>Visible: {isVisibleRef.current ? '✅' : '❌'}</div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            className="w-3 h-3 rounded-full bg-emerald-400 shadow-emerald-400/50 shadow-glow"
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
          <span className="text-sm font-medium font-source-sans text-emerald-300">
            TEST MODE
          </span>
        </div>

        {loading ? (
          <div className="text-white mb-4">
            <div className="w-8 h-8 mx-auto mb-2 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-sm">Cargando...</p>
          </div>
        ) : error ? (
          <div className="text-red-400 mb-4">
            <WifiOff className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Error</p>
            <p className="text-xs text-red-300 mt-1">{error}</p>
            <button
              onClick={handleManualRefresh}
              className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-white text-xs transition-colors"
            >
              <RefreshCw className="w-3 h-3 inline mr-1" />
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <div className="text-4xl my-4 font-bold font-legquinne text-white tracking-tighter leading-none text-crisp">
              {contador} | 111
            </div>
            <p className="text-orange-300 text-sm font-medium font-source-sans tracking-wide text-crisp">
              Now Inside
            </p>
            {lastUpdate && (
              <p className="text-xs text-white/50 mt-2">
                Última: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
