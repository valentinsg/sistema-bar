"use client"

import { motion } from "framer-motion"
import { RefreshCw, WifiOff } from "lucide-react"
import { useEffect, useState } from "react"

const LOCAL_ID = process.env.NEXT_PUBLIC_LOCAL_ID!

export default function SimpleCounter() {
  const [loading, setLoading] = useState(true)
  const [contador, setContador] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Función simple para obtener el contador
  const fetchContador = async () => {
    if (!LOCAL_ID) {
      setError("Variables de entorno no configuradas")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/contador/sse?local_id=${encodeURIComponent(LOCAL_ID)}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setContador(data.contador || 0)
      setLastUpdate(new Date(data.timestamp))
      setError(null)
    } catch (err: any) {
      console.error('Error fetching contador:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  // Cargar una sola vez al montar
  useEffect(() => {
    setIsHydrated(true)
    fetchContador()
  }, [])

  const handleManualRefresh = () => {
    setLoading(true)
    fetchContador()
  }

  if (!isHydrated) return null

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
                {loading ? 'Cargando...' : 'Reintentar'}
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
            className="w-3 h-3 rounded-full shadow-glow bg-blue-400 shadow-blue-400/50"
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
          <span className="text-sm font-medium font-source-sans text-blue-300">
            {loading ? 'Cargando...' : 'Actualizado'}
          </span>
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="ml-2 p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
            title="Actualizar contador"
          >
            <RefreshCw className={`w-4 h-4 text-white/70 ${loading ? 'animate-spin' : ''}`} />
          </button>
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
