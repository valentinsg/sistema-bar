"use client"

import { getContador } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import { Wifi, WifiOff } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

const LOCAL_ID = process.env.NEXT_PUBLIC_LOCAL_ID!

export default function LiveCounter() {
  const [loading, setLoading] = useState(true)
  const [contador, setContador] = useState<number>(0)
  const [showCounter, setShowCounter] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isRealtimeActive, setIsRealtimeActive] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const realtimeFailCount = useRef(0)

  useEffect(() => {
    // Marcar como montado y hidratado
    setIsMounted(true)
    setIsHydrated(true)

    // Verificar si las variables de entorno están configuradas
    if (!LOCAL_ID) {
      console.error("❌ NEXT_PUBLIC_LOCAL_ID no está configurado")
      setError("Configuración no encontrada")
      setLoading(false)
      return
    }

    const checkTime = () => {
      const now = new Date()
      const hour = now.getHours()

      // Mostrar siempre en desarrollo/localhost o desde las 19:00 hasta las 06:00
      const isDevelopment = process.env.NODE_ENV === 'development' ||
                           window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1'

      const isOperatingTime = hour >= 19 || hour < 6

      setShowCounter(isDevelopment || isOperatingTime)
    }

    const cargarContador = async () => {
      try {
        setError(null)
        console.log("🔄 Cargando contador para LOCAL_ID:", LOCAL_ID)
        const contadorData = await getContador(LOCAL_ID)
        console.log("📊 Cantidad recibida del servidor:", contadorData)
        setContador(contadorData)
        setLastUpdate(new Date())
        setIsConnected(true)
        realtimeFailCount.current = 0 // Reset fail count on success
        console.log("✅ Estado actualizado en frontend:", contadorData)
      } catch (error) {
        console.error("❌ Error al cargar contador:", error)
        setError("Error al cargar datos")
        setIsConnected(false)
        realtimeFailCount.current++
      } finally {
        setLoading(false)
      }
    }

    // Función para configurar polling dinámico
    const setupDynamicPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Polling más frecuente si real-time no funciona bien
      const pollingInterval = isRealtimeActive && realtimeFailCount.current < 3
        ? 10000 // 10 segundos si real-time funciona
        : 3000  // 3 segundos si real-time falla o no está activo

      console.log(`🔄 Configurando polling cada ${pollingInterval/1000} segundos`)

      intervalRef.current = setInterval(cargarContador, pollingInterval)
    }

    checkTime()
    cargarContador()

    // Verificar tiempo cada minuto
    const timeInterval = setInterval(checkTime, 60000)

    // Configurar polling dinámico inicial
    setupDynamicPolling()

    // Suscribirse a cambios en tiempo real de Supabase
    const contadorSubscription = supabase
      .channel('contador_personas_changes_front')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contador_personas',
          filter: `local_id=eq.${LOCAL_ID}`
        },
        (payload) => {
          console.log("🔄 Cambio en tiempo real recibido en frontend:", payload)
          if (payload.new && 'cantidad' in payload.new) {
            const nuevaCantidad = payload.new.cantidad as number
            console.log("✅ Actualizando contador frontend a:", nuevaCantidad)
            setContador(nuevaCantidad)
            setLastUpdate(new Date())
            setIsConnected(true)
            setError(null)
            setIsRealtimeActive(true)
            realtimeFailCount.current = 0

            // Reconfigurar polling para ser menos frecuente ya que real-time funciona
            setupDynamicPolling()
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Estado suscripción contador:", status)
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          setIsRealtimeActive(true)
          setupDynamicPolling()
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false)
          setIsRealtimeActive(false)
          realtimeFailCount.current++
          setupDynamicPolling()
        }
      })

    // Escuchar eventos de actualización del contador (para compatibilidad)
    const handleContadorUpdate = (event: CustomEvent) => {
      console.log("📡 Evento contador recibido:", event.detail.personas)
      setContador(event.detail.personas)
      setLastUpdate(new Date())
      setIsConnected(true)
      setError(null)
      setIsRealtimeActive(true)
      setupDynamicPolling()
    }

    window.addEventListener("contadorUpdated", handleContadorUpdate as EventListener)

    // Detectar cuando la pestaña vuelve a estar activa para actualizar inmediatamente
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("👁️ Pestaña activa, actualizando contador...")
        cargarContador()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(timeInterval)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      contadorSubscription.unsubscribe()
      window.removeEventListener("contadorUpdated", handleContadorUpdate as EventListener)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isRealtimeActive])

    // No mostrar si no está montado e hidratado para evitar problemas de SSR
  if (!isMounted || !isHydrated) return null

  // No mostrar si no está configurado o si no es el horario correcto
  if (!showCounter || !LOCAL_ID) return null

  const getConnectionStatus = () => {
    if (isRealtimeActive && isConnected) {
      return (
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-green-400" />
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-green-300 text-crisp">Tiempo real activo</span>
        </div>
      )
    } else if (isConnected) {
      return (
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
          <span className="text-yellow-300 text-crisp">Polling activo</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-red-400" />
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          <span className="text-red-300 text-crisp">Desconectado</span>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg mx-auto mb-16"
      >
        <div className="relative">
          {/* Fondo con imagen */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <Image
              src="/FONDOS-01.webp"
              alt="Eleven Club background"
              fill
              className="object-cover smooth-rendering gpu-accelerated"
              quality={90}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-orange-900/60 gradient-quality"></div>
          </div>

          {/* Efectos de brillo mejorados */}
          <div className="absolute inset-0 rounded-3xl shadow-premium"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/30 via-red-600/20 to-orange-600/30 rounded-3xl blur-lg opacity-50 shadow-glow gpu-accelerated"></div>

          {/* Contenido principal */}
          <div className="relative z-10 p-8 text-center rounded-3xl glass-effect border-glow">
            {/* Logo pequeño */}
            <div className="mb-6">
              <Image
                src="/logo-eleven.webp"
                alt="Eleven Club"
                width={80}
                height={80}
                className="mx-auto opacity-90 logo-quality gpu-accelerated"
                quality={100}
              />
            </div>

            {/* Título mejorado */}
            <div className="mb-6">
              <h2 className="font-legquinne text-2xl lg:text-3xl text-white mb-2 text-crisp">
                EN VIVO
              </h2>
              <p className="text-orange-300/90 text-sm font-medium tracking-wide text-crisp">
                • Actualizado hace {Math.floor((Date.now() - lastUpdate!.getTime()) / 1000)} segundos
              </p>
            </div>

            {/* Contador principal mejorado */}
            <div className="relative mb-6">
              {/* Círculo principal con mejor diseño */}
              <div className="relative mx-auto w-32 h-32 lg:w-40 lg:h-40">
                {/* Fondo del círculo */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-red-500/20 to-orange-500/30 rounded-full border-2 border-orange-400/40 shadow-glow gpu-accelerated">
                  <div className="absolute inset-2 bg-gradient-to-br from-black/60 to-black/40 rounded-full glass-effect-dark"></div>
                </div>

                {/* Número con tipografía mejorada */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-legquinne text-5xl lg:text-6xl font-bold text-white shadow-glow text-crisp gpu-accelerated">
                    {contador.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Texto descriptivo mejorado */}
              <div className="mt-4">
                <p className="text-white/90 text-lg font-medium text-crisp">
                  personas ahora mismo
                </p>
                <p className="text-orange-300/80 text-sm font-legquinne tracking-wider text-crisp">
                  en Eleven Club
                </p>
              </div>
            </div>

            {/* Estado de conexión mejorado */}
            <div className="flex items-center justify-center gap-2 text-xs">
              {getConnectionStatus()}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (error && !lastUpdate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg mx-auto mb-16"
      >
        <div className="relative">
          {/* Fondo con imagen */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <Image
              src="/FONDOS-01.webp"
              alt="Eleven Club background"
              fill
              className="object-cover smooth-rendering gpu-accelerated"
              quality={90}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-red-900/60 gradient-quality"></div>
          </div>

          {/* Efectos de brillo de error */}
          <div className="absolute inset-0 rounded-3xl shadow-premium"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600/30 via-red-600/20 to-red-600/30 rounded-3xl blur-lg opacity-50 shadow-glow gpu-accelerated"></div>

          {/* Contenido principal */}
          <div className="relative z-10 p-8 text-center rounded-3xl glass-effect border-glow">
            {/* Logo pequeño */}
            <div className="mb-6">
              <Image
                src="/logo-eleven.webp"
                alt="Eleven Club"
                width={80}
                height={80}
                className="mx-auto opacity-60 grayscale logo-quality gpu-accelerated"
                quality={100}
              />
            </div>

            {/* Título de error */}
            <div className="mb-6">
              <h2 className="font-legquinne text-2xl lg:text-3xl text-red-300 mb-2 text-crisp">
                ERROR
              </h2>
              <p className="text-red-300/90 text-sm font-medium tracking-wide text-crisp">
                Sin conexión
              </p>
            </div>

            {/* Contador con error */}
            <div className="relative mb-6">
              <div className="relative mx-auto w-32 h-32 lg:w-40 lg:h-40">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 via-red-500/20 to-red-500/30 rounded-full border-2 border-red-400/40 shadow-glow gpu-accelerated">
                  <div className="absolute inset-2 bg-gradient-to-br from-black/60 to-black/40 rounded-full glass-effect-dark"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-legquinne text-5xl lg:text-6xl font-bold text-red-300 shadow-glow text-crisp gpu-accelerated">
                    --
                  </span>
                </div>
              </div>
            </div>

            {/* Descripción de error */}
            <div className="space-y-2 mb-6">
              <p className="text-red-200/90 text-lg font-medium text-crisp">
                No disponible
              </p>
              <p className="text-red-300/80 text-sm font-legquinne tracking-wider text-crisp">
                {error}
              </p>
            </div>

            {/* Elemento decorativo opaco */}
            <div className="flex justify-center mb-4">
              <Image
                src="/detalle-texto-eleven.webp"
                alt="Eleven Club detail"
                width={120}
                height={40}
                className="opacity-20 grayscale"
              />
            </div>
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
      className="w-full max-w-lg mx-auto mb-16"
    >
      <div className="relative">
        {/* Fondo con imagen */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <Image
            src="/FONDOS-01.webp"
            alt="Eleven Club background"
            fill
            className="object-cover smooth-rendering gpu-accelerated"
            quality={90}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-orange-900/60 gradient-quality"></div>
        </div>

        {/* Efectos de brillo mejorados */}
        <div className="absolute inset-0 rounded-3xl shadow-premium"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/30 via-red-600/20 to-orange-600/30 rounded-3xl blur-lg opacity-50 shadow-glow gpu-accelerated"></div>

        {/* Contenido principal */}
        <div className="relative z-10 p-8 text-center rounded-3xl glass-effect border-glow">
          {/* Logo pequeño */}
          <div className="mb-6">
            <Image
              src="/logo-eleven.webp"
              alt="Eleven Club"
              width={80}
              height={80}
              className="mx-auto opacity-90 logo-quality gpu-accelerated"
              quality={100}
            />
          </div>

          {/* Título mejorado */}
          <div className="mb-6">
            <h2 className="font-legquinne text-2xl lg:text-3xl text-white mb-2 text-crisp">
              EN VIVO
            </h2>
            <p className="text-orange-300/90 text-sm font-medium tracking-wide text-crisp">
              • Actualizado hace {Math.floor((Date.now() - lastUpdate!.getTime()) / 1000)} segundos
            </p>
          </div>

          {/* Contador principal mejorado */}
          <div className="relative mb-6">
            {/* Círculo principal con mejor diseño */}
            <div className="relative mx-auto w-32 h-32 lg:w-40 lg:h-40">
              {/* Fondo del círculo */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-red-500/20 to-orange-500/30 rounded-full border-2 border-orange-400/40 shadow-glow gpu-accelerated">
                <div className="absolute inset-2 bg-gradient-to-br from-black/60 to-black/40 rounded-full glass-effect-dark"></div>
              </div>

              {/* Número con tipografía mejorada */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-legquinne text-5xl lg:text-6xl font-bold text-white shadow-glow text-crisp gpu-accelerated">
                  {contador.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Texto descriptivo mejorado */}
            <div className="mt-4">
              <p className="text-white/90 text-lg font-medium text-crisp">
                personas ahora mismo
              </p>
              <p className="text-orange-300/80 text-sm font-legquinne tracking-wider text-crisp">
                en Eleven Club
              </p>
            </div>
          </div>

          {/* Estado de conexión mejorado */}
          <div className="flex items-center justify-center gap-2 text-xs">
            {getConnectionStatus()}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
