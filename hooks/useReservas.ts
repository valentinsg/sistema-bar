"use client"

import { deleteReserva, getReservas, type Reserva } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import { useCallback, useEffect, useRef, useState } from "react"

// Cache en memoria para evitar llamadas repetidas
const calendarCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_TTL = 120 * 1000 // OPTIMIZACIÓN: Aumentado a 2 minutos para reducir requests

// OPTIMIZACIÓN: Singleton para gestionar suscripciones únicas por local_id
class ReservasSubscriptionManager {
  private static instance: ReservasSubscriptionManager | null = null
  private subscriptions = new Map<string, {
    subscription: any,
    listeners: Set<() => Promise<void>>,
    lastActivity: number
  }>()
  private cleanupInterval: NodeJS.Timeout | null = null

  static getInstance(): ReservasSubscriptionManager {
    if (!ReservasSubscriptionManager.instance) {
      ReservasSubscriptionManager.instance = new ReservasSubscriptionManager()
    }
    return ReservasSubscriptionManager.instance
  }

  constructor() {
    // OPTIMIZACIÓN: Cleanup automático de suscripciones inactivas cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSubscriptions()
    }, 300000) // 5 minutos
  }

  subscribe(localId: string, callback: () => Promise<void>): () => void {
    if (!localId) return () => {}

    const existing = this.subscriptions.get(localId)

    if (existing) {
      // Agregar listener a suscripción existente
      existing.listeners.add(callback)
      existing.lastActivity = Date.now()

      return () => {
        existing.listeners.delete(callback)
        // Si no hay más listeners, marcar para cleanup
        if (existing.listeners.size === 0) {
          existing.lastActivity = Date.now() - 600000 // Marcar como inactivo
        }
      }
    }

    // Crear nueva suscripción
    try {
      const subscription = supabase
        .channel(`reservas_${localId}`) // CRÍTICO: Canal fijo, no con timestamp
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reservas',
            filter: `local_id=eq.${localId}`
          },
          () => {
            const sub = this.subscriptions.get(localId)
            if (sub) {
              sub.lastActivity = Date.now()
              // OPTIMIZACIÓN: Throttling para evitar updates excesivos
              this.throttledNotify(localId, Array.from(sub.listeners))
            }
          }
        )
        .subscribe()

      const listeners = new Set<() => Promise<void>>()
      listeners.add(callback)

      this.subscriptions.set(localId, {
        subscription,
        listeners,
        lastActivity: Date.now()
      })

      return () => {
        listeners.delete(callback)
        if (listeners.size === 0) {
          // Marcar para cleanup en lugar de eliminar inmediatamente
          const sub = this.subscriptions.get(localId)
          if (sub) {
            sub.lastActivity = Date.now() - 600000 // Marcar como inactivo
          }
        }
      }
    } catch (error) {
      console.error("Error al crear suscripción realtime:", error)
      return () => {}
    }
  }

  private throttledNotify = (() => {
    const throttleMap = new Map<string, number>()
    const THROTTLE_MS = 2000 // 2 segundos

    return (localId: string, listeners: (() => Promise<void>)[]) => {
      const now = Date.now()
      const lastCall = throttleMap.get(localId) || 0

      if (now - lastCall < THROTTLE_MS) {
        return // Throttled
      }

      throttleMap.set(localId, now)

      // Limpiar cache y notificar listeners
      calendarCache.clear()
      listeners.forEach(callback => {
        callback().catch(console.error)
      })
    }
  })()

  private cleanupInactiveSubscriptions() {
    const cutoff = Date.now() - 600000 // 10 minutos de inactividad

    for (const [localId, sub] of this.subscriptions.entries()) {
      if (sub.lastActivity < cutoff && sub.listeners.size === 0) {
        try {
          sub.subscription.unsubscribe()
          this.subscriptions.delete(localId)
          console.log(`Cleaned up inactive subscription for localId: ${localId}`)
        } catch (error) {
          console.error(`Error cleaning up subscription for ${localId}:`, error)
        }
      }
    }
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    for (const [localId, sub] of this.subscriptions.entries()) {
      try {
        sub.subscription.unsubscribe()
      } catch (error) {
        console.error(`Error destroying subscription for ${localId}:`, error)
      }
    }

    this.subscriptions.clear()
    ReservasSubscriptionManager.instance = null
  }
}

export function useReservas(localId: string) {
  const [allReservas, setAllReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función optimizada para cargar todas las reservas una sola vez
  const loadAllReservas = useCallback(async () => {
    if (!localId) {
      console.error("No se proporcionó localId")
      setError("No se proporcionó localId")
      return
    }

    const cacheKey = `reservas-${localId}`
    const cached = calendarCache.get(cacheKey)

    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      setAllReservas(cached.data)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const reservas = await getReservas(localId)

      // Validar que reservas es un array
      if (!Array.isArray(reservas)) {
        throw new Error("Los datos de reservas no son válidos")
      }

      setAllReservas(reservas)

      // Guardar en cache
      calendarCache.set(cacheKey, {
        data: reservas,
        timestamp: Date.now()
      })
    } catch (error) {
      console.error("Error al cargar reservas:", error)
      setError("Error al cargar las reservas")
      setAllReservas([])
    } finally {
      setLoading(false)
    }
  }, [localId])

  const handleDeleteReserva = async (id: string, nombre: string) => {
    if (!id) {
      console.error("No se proporcionó ID de reserva")
      return
    }

    try {
      const success = await deleteReserva(id)
      if (success) {
        // Limpiar cache y recargar
        calendarCache.clear()
        await loadAllReservas()
      } else {
        alert("Error al eliminar la reserva. Intenta nuevamente.")
      }
    } catch (error) {
      console.error("Error al eliminar reserva:", error)
      alert("Error al eliminar la reserva. Intenta nuevamente.")
    }
  }

  // Cargar datos solo una vez al montar el componente
  useEffect(() => {
    if (localId) {
      loadAllReservas()
    }
  }, [loadAllReservas, localId])

  return {
    allReservas,
    setAllReservas,
    loading,
    error,
    loadAllReservas,
    handleDeleteReserva
  }
}

// Hook para suscripción en tiempo real (solo para admin)
export function useReservasRealtime(localId: string, loadAllReservas: () => Promise<void>) {
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!localId || !loadAllReservas) {
      return
    }

    // OPTIMIZACIÓN: Solo suscribirse si la pestaña está activa
    if (document.hidden) {
      return
    }

    try {
      const manager = ReservasSubscriptionManager.getInstance()
      const unsubscribe = manager.subscribe(localId, loadAllReservas)
      unsubscribeRef.current = unsubscribe

      return unsubscribe
    } catch (error) {
      console.error("Error al configurar suscripción en tiempo real:", error)
    }
  }, [localId, loadAllReservas])

  // OPTIMIZACIÓN: Pausar/reanudar suscripción basado en visibilidad
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pausar no desuscribir - la suscripción se mantiene
        return
      } else {
        // Al volver, recargar datos si hace más de 1 minuto
        const cacheKey = `reservas-${localId}`
        const cached = calendarCache.get(cacheKey)
        const shouldRefresh = !cached || (Date.now() - cached.timestamp) > 60000

        if (shouldRefresh) {
          loadAllReservas().catch(console.error)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [localId, loadAllReservas])
}
