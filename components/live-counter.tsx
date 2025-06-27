"use client"

import { getContador } from "@/lib/storage"
import { motion } from "framer-motion"
import { WifiOff } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const LOCAL_ID = process.env.NEXT_PUBLIC_LOCAL_ID!

export default function LiveCounter() {
  const [loading, setLoading] = useState(true)
  const [contador, setContador] = useState<number>(0)
  const [showCounter, setShowCounter] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [requestCount, setRequestCount] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(true)

  // Configuración simple: 6 segundos entre requests
  const POLLING_INTERVAL = 10000

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const cargarContador = async () => {
    if (!LOCAL_ID || !isActiveRef.current) return

    try {
      const contadorData = await getContador(LOCAL_ID)
      setContador(contadorData)
      setLastUpdate(new Date())
      setRequestCount(prev => prev + 1)
    } catch (error) {
      console.error("Error al cargar contador:", error)
      setError("Error al cargar datos")
    } finally {
      setLoading(false)
    }
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
    cargarContador()
    intervalRef.current = setInterval(cargarContador, POLLING_INTERVAL)
    const timeInterval = setInterval(checkTime, 60000)

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false
        cleanup()
      } else {
        isActiveRef.current = true
        setTimeout(() => {
          if (isActiveRef.current && !intervalRef.current) {
            cargarContador()
            intervalRef.current = setInterval(cargarContador, POLLING_INTERVAL)
          }
        }, 1000)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      isActiveRef.current = false
      cleanup()
      clearInterval(timeInterval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

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
            <p className="text-lg font-medium">Error</p>
            <p className="text-sm text-red-300 mt-2">{error || "Configuración requerida"}</p>
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
            <p className="text-lg font-medium">Cargando...</p>
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
            Live
          </span>
        </div>

        <motion.div
          className="mb-8"

        >
          <div className="text-6xl my-8 lg:text-9xl font-bold font-legquinne text-white tracking-tighter leading-none text-crisp">
            {contador} | 111
          </div>

        </motion.div>
        <p className="text-orange-300 text-lg font-medium font-source-sans tracking-wide text-crisp">
          Now Inside
        </p>
      </motion.div>
    </motion.div>
  )
}
