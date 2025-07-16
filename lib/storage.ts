// 📁 lib/storage.ts (Versión conectada a Supabase)

import { supabase } from "./supabase"

export interface Reserva {
  id: string
  local_id: string
  nombre: string
  contacto: string
  fecha: string
  horario: string
  cantidad_personas: number
  notas?: string | null
  created_at: string
}

export const saveReserva = async (reserva: Omit<Reserva, "id" | "created_at">): Promise<Reserva> => {
  try {
    // CRÍTICO: Timeout para queries de escritura
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), 8000)
    )

    const queryPromise = supabase
      .from("reservas")
      .insert([reserva])
      .select()
      .single()

    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

    if (error) throw error

    return {
      id: data.id,
      ...reserva,
      created_at: data.created_at,
    }
  } catch (error) {
    console.error("Error al guardar reserva:", error)
    throw error
  }
}

export const getReservas = async (local_id: string): Promise<Reserva[]> => {
  try {
    const { data, error } = await supabase
      .from("reservas")
      .select("*")
      .eq("local_id", local_id)
      .order("fecha", { ascending: true })

    if (error) {
      console.error("Error al obtener reservas:", error)
      return []
    }

    return data as Reserva[]
  } catch (error) {
    console.error("Error al obtener reservas:", error)
    return []
  }
}

export const deleteReserva = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("reservas")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error al eliminar reserva:", error.message)
      return false
    }

    return true
  } catch (error) {
    console.error("Error al eliminar reserva:", error)
    return false
  }
}

// OPTIMIZACIÓN: Aumentar TTL para reducir requests
const CACHE_TTL = 60 * 1000 // Aumentado a 1 minuto
const memoryCache = new Map<string, { data: any, timestamp: number }>()

// OPTIMIZACIÓN: Auto-cleanup más eficiente del cache
const cleanCache = () => {
  const now = Date.now()
  const cutoff = now - CACHE_TTL * 2 // Eliminar cache más viejo que 2x TTL

  for (const [key, value] of memoryCache.entries()) {
    if (value.timestamp < cutoff) {
      memoryCache.delete(key)
    }
  }
}

// OPTIMIZACIÓN: Cleanup automático cada 5 minutos
let cleanupInterval: NodeJS.Timeout | null = null
if (typeof window === 'undefined') { // Solo en servidor
  cleanupInterval = setInterval(cleanCache, 300000)
}

export const getContador = async (local_id: string): Promise<number> => {
  const fechaHoy = new Date().toISOString().split("T")[0]
  const cacheKey = `${local_id}-${fechaHoy}`
  const now = Date.now()

  // Verificar cache primero
  const cached = memoryCache.get(cacheKey)
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data
  }

  // CRÍTICO: Solo logs en desarrollo
  const isDevelopment = process.env.NODE_ENV === 'development'

  try {
    const { data, error } = await supabase
      .from("contador_personas")
      .select("cantidad")
      .eq("local_id", local_id)
      .eq("fecha", fechaHoy)
      .single()

    let result = 0

    if (error) {
      if (isDevelopment) {
        console.log("ℹ️ getContador - Error (puede ser normal si no existe):", error.message)
      }
      result = 0
    } else if (!data) {
      result = 0
    } else {
      result = data.cantidad || 0
    }

    // OPTIMIZACIÓN: Guardar en cache y limpiar automáticamente
    memoryCache.set(cacheKey, { data: result, timestamp: now })

    // OPTIMIZACIÓN: Cleanup menos frecuente - cada 20 llamadas
    if (memoryCache.size % 20 === 0) {
      cleanCache()
    }

    return result
  } catch (error) {
    if (isDevelopment) {
      console.error("Error en getContador:", error)
    }
    return 0
  }
}

export const updateContador = async (local_id: string, cantidad: number): Promise<boolean> => {
  const fechaHoy = new Date().toISOString().split("T")[0]

  try {
    const { error } = await supabase
      .from("contador_personas")
      .upsert({
        local_id,
        fecha: fechaHoy,
        cantidad,
      }, {
        onConflict: 'local_id,fecha'
      })

    if (error) {
      console.error("❌ Error al actualizar contador:", error)
      return false
    }

    // OPTIMIZACIÓN: Invalidar cache después de actualizar
    const cacheKey = `${local_id}-${fechaHoy}`
    memoryCache.delete(cacheKey)

    // Disparar evento solo si estamos en el cliente
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent("contadorUpdated", { detail: { personas: cantidad } }))
    }

    return true
  } catch (error) {
    console.error("❌ Error al actualizar contador:", error)
    return false
  }
}

export const getDisponibilidad = async (local_id: string, fecha: string, horario: string): Promise<number> => {
  const LIMITE_POR_TURNO = 30

  try {
    const { data: reservasEnHorario, error } = await supabase
      .from("reservas")
      .select("cantidad_personas")
      .eq("local_id", local_id)
      .eq("fecha", fecha)
      .eq("horario", horario)

    if (error) {
      console.error("Error al obtener reservas:", error)
      return LIMITE_POR_TURNO
    }

    if (!reservasEnHorario || reservasEnHorario.length === 0) {
      return LIMITE_POR_TURNO
    }

    const personasOcupadas = reservasEnHorario.reduce((acc: number, r: { cantidad_personas: number }) => {
      return acc + (r.cantidad_personas || 0)
    }, 0)

    return Math.max(0, LIMITE_POR_TURNO - personasOcupadas)

  } catch (error) {
    console.error("Error en getDisponibilidad:", error)
    return LIMITE_POR_TURNO
  }
}

export const getPlazasEstadisticas = async (local_id: string, fecha: string): Promise<{
  plazasTotales: number
  plazasOcupadas: number
  plazasDisponibles: number
  personasTotales: number
}> => {
  const LIMITE_POR_TURNO = 30
  const NUM_TURNOS = 2
  const PLAZAS_TOTALES = LIMITE_POR_TURNO * NUM_TURNOS

  try {
    const { data, error } = await supabase
      .from("reservas")
      .select("cantidad_personas")
      .eq("local_id", local_id)
      .eq("fecha", fecha)

    if (error || !data) {
      return {
        plazasTotales: PLAZAS_TOTALES,
        plazasOcupadas: 0,
        plazasDisponibles: PLAZAS_TOTALES,
        personasTotales: 0
      }
    }

    const personasTotales = data.reduce((acc: number, r: { cantidad_personas: number }) =>
      acc + (r.cantidad_personas || 0), 0)
    const plazasOcupadas = personasTotales

    return {
      plazasTotales: PLAZAS_TOTALES,
      plazasOcupadas,
      plazasDisponibles: Math.max(0, PLAZAS_TOTALES - plazasOcupadas),
      personasTotales
    }
  } catch (error) {
    console.error("Error en getPlazasEstadisticas:", error)
    return {
      plazasTotales: PLAZAS_TOTALES,
      plazasOcupadas: 0,
      plazasDisponibles: PLAZAS_TOTALES,
      personasTotales: 0
    }
  }
}
