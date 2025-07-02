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
  const { data, error } = await supabase
    .from("reservas")
    .insert([reserva])
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    ...reserva,
    created_at: data.created_at,
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
  const { error } = await supabase
    .from("reservas")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error al eliminar reserva:", error.message)
    return false
  }

  return true
}

// Cache en memoria para evitar llamadas excesivas
const memoryCache = new Map<string, { data: number, timestamp: number }>()
// OPTIMIZACIÓN: Aumentar TTL de 10 segundos a 30 segundos para reducir llamadas significativamente
const CACHE_TTL = 30000 // 30 segundos de cache para reducir llamadas significativamente

export const getContador = async (local_id: string): Promise<number> => {
  const fechaHoy = new Date().toISOString().split("T")[0]
  const cacheKey = `${local_id}-${fechaHoy}`
  const now = Date.now()

  // Verificar cache primero
  const cached = memoryCache.get(cacheKey)
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    // Devolver datos del cache sin logs
    return cached.data
  }

  // Solo log en desarrollo y con throttling
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (isDevelopment) {
    console.log("📊 getContador - Parámetros:", { local_id, fecha: fechaHoy })
  }

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
    if (isDevelopment) {
      console.log("ℹ️ getContador - No hay datos para hoy, retornando 0")
    }
    result = 0
  } else {
    if (isDevelopment) {
      console.log("✅ getContador - Cantidad encontrada:", data.cantidad)
    }
    result = data.cantidad
  }

  // Guardar en cache
  memoryCache.set(cacheKey, { data: result, timestamp: now })

  // OPTIMIZACIÓN: Limpiar cache viejo cada 50 llamadas (reducido de 100)
  if (memoryCache.size > 50) {
    const cutoff = now - (CACHE_TTL * 2)
    for (const [key, value] of memoryCache.entries()) {
      if (value.timestamp < cutoff) {
        memoryCache.delete(key)
      }
    }
  }

  return result
}

export const updateContador = async (local_id: string, cantidad: number): Promise<boolean> => {
  const fechaHoy = new Date().toISOString().split("T")[0]

  try {
    console.log("🔄 Actualizando contador en BD:", { local_id, fecha: fechaHoy, cantidad })

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

    console.log("✅ Contador actualizado exitosamente en BD")

    // Disparar evento solo si estamos en el cliente
    if (typeof window !== 'undefined') {
      console.log("📡 Disparando evento contadorUpdated")
      window.dispatchEvent(new CustomEvent("contadorUpdated", { detail: { personas: cantidad } }))
    }

    return true
  } catch (error) {
    console.error("❌ Error al actualizar contador:", error)
    return false
  }
}

export const getDisponibilidad = async (local_id: string, fecha: string, horario: string): Promise<number> => {
  const PLAZAS_TOTALES = 30

  try {
    // Obtener todas las reservas del día para calcular plazas ocupadas totales
    const { data: reservasDelDia, error } = await supabase
      .from("reservas")
      .select("cantidad_personas")
      .eq("local_id", local_id)
      .eq("fecha", fecha)

    if (error) {
      console.error("Error al obtener reservas:", error)
      return PLAZAS_TOTALES
    }

    if (!reservasDelDia || reservasDelDia.length === 0) {
      return PLAZAS_TOTALES
    }

    // Calcular plazas ocupadas para todo el día: sumar directamente las personas
    const plazasOcupadasDelDia = reservasDelDia.reduce((acc: number, r: { cantidad_personas: number }) => {
      return acc + r.cantidad_personas
    }, 0)

    const plazasDisponibles = Math.max(0, PLAZAS_TOTALES - plazasOcupadasDelDia)

    return plazasDisponibles

  } catch (error) {
    console.error("Error en getDisponibilidad:", error)
    return PLAZAS_TOTALES
  }
}

export const getPlazasEstadisticas = async (local_id: string, fecha: string): Promise<{
  plazasTotales: number
  plazasOcupadas: number
  plazasDisponibles: number
  personasTotales: number
}> => {
  const PLAZAS_TOTALES = 30

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

  const personasTotales = data.reduce((acc: number, r: { cantidad_personas: number }) => acc + r.cantidad_personas, 0)
  const plazasOcupadas = data.reduce((acc: number, r: { cantidad_personas: number }) => {
    return acc + r.cantidad_personas
  }, 0)

  return {
    plazasTotales: PLAZAS_TOTALES,
    plazasOcupadas,
    plazasDisponibles: Math.max(0, PLAZAS_TOTALES - plazasOcupadas),
    personasTotales
  }
}
