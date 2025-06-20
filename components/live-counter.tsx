"use client"

import { Card, CardContent } from "@/components/ui/card"
import { getContador } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import { AlertCircle, Loader2, Users, Wifi, WifiOff } from "lucide-react"
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
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const realtimeFailCount = useRef(0)

  useEffect(() => {
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

  // No mostrar si no está configurado o si no es el horario correcto
  if (!showCounter || !LOCAL_ID) return null

  if (loading) {
    return (
      <Card className="w-full max-w-sm mx-auto bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-purple-500/30 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-6 h-6 text-purple-300" />
              <span className="text-purple-300 font-medium">EN VIVO</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <p className="text-purple-200 text-sm">Cargando contador...</p>
            </div>
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !lastUpdate) {
    return (
      <Card className="w-full max-w-sm mx-auto bg-gradient-to-r from-red-900/80 to-pink-900/80 border-red-500/30 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-300" />
              <span className="text-red-300 font-medium">ERROR</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-white">---</div>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getConnectionStatus = () => {
    if (isRealtimeActive && isConnected) {
      return { icon: Wifi, color: 'text-green-400', text: 'Tiempo real activo' }
    } else if (isConnected) {
      return { icon: Wifi, color: 'text-yellow-400', text: 'Polling activo' }
    } else {
      return { icon: WifiOff, color: 'text-red-400', text: 'Desconectado' }
    }
  }

  const connectionStatus = getConnectionStatus()

  return (
    <Card className="w-full max-w-sm mx-auto mb-12 bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-purple-500/30 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Users className="w-6 h-6 text-purple-300" />
            <span className="text-purple-300 font-medium">EN VIVO</span>
            <connectionStatus.icon className={`w-4 h-4 ${connectionStatus.color}`} />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-white">{contador}</div>
            <p className="text-purple-200 text-sm">
              {contador === 1 ? "persona" : "personas"} ahora mismo en el local
            </p>
            {lastUpdate && (
              <p className="text-purple-300 text-xs">
                Actualizado: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
            <p className="text-purple-400 text-xs">
              {connectionStatus.text}
            </p>
            {error && (
              <p className="text-red-300 text-xs">
                ⚠️ {error} (mostrando último valor)
              </p>
            )}
          </div>
          <div className="flex justify-center">
            <div className={`w-2 h-2 rounded-full ${
              isRealtimeActive ? 'animate-pulse bg-green-400' :
              isConnected ? 'animate-pulse bg-yellow-400' : 'bg-red-400'
            }`}></div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
