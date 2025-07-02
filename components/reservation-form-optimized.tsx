"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveReserva } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Calendar, Clock, Info, Loader2, MessageSquare, Phone, User, Users } from "lucide-react"
import Image from "next/image"
import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

const LOCAL_ID = process.env.NEXT_PUBLIC_LOCAL_ID!

// Cache en memoria para disponibilidad
const disponibilidadCache = new Map<string, { data: Record<string, number>, timestamp: number }>()
const CACHE_TTL = 30 * 1000 // 30 segundos (aumentado de 5 minutos)

// Función optimizada para calcular disponibilidad localmente
const calcularDisponibilidadLocal = (reservas: any[], horarios: string[]) => {
  const MESAS_TOTALES = 50
  const disponibilidad: Record<string, number> = {}

  // Calcular mesas ocupadas para todo el día
  const mesasOcupadasDelDia = reservas.reduce((acc, r) => {
    return acc + Math.ceil(r.cantidad_personas / 4)
  }, 0)

  const mesasDisponibles = Math.max(0, MESAS_TOTALES - mesasOcupadasDelDia)

  // Misma disponibilidad para todos los horarios del día
  horarios.forEach(horario => {
    disponibilidad[horario] = mesasDisponibles
  })

  return disponibilidad
}

// Hook personalizado para debounce
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook personalizado para throttle
const useThrottle = (callback: Function, delay: number) => {
  const lastRun = useRef(Date.now())

  return useCallback((...args: any[]) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args)
      lastRun.current = Date.now()
    }
  }, [callback, delay])
}

export default function ReservationFormOptimized() {
  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    fecha: new Date().toISOString().split("T")[0],
    horario: "",
    cantidad_personas: "",
    notas: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [disponibilidad, setDisponibilidad] = useState<Record<string, number>>({})
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false)
  const [triedSubmit, setTriedSubmit] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [privacyPosition, setPrivacyPosition] = useState({ top: 0, left: 0, width: 0 })
  const privacyButtonRef = useRef<HTMLButtonElement>(null)
  const privacyPopoverRef = useRef<HTMLDivElement>(null)

  // Memoizar horarios para evitar recreación
  const horarios = useMemo(() => [
    "19:30", "20:00", "20:30", "21:00", "21:30",
    "22:00", "22:30", "23:00", "23:30", "00:00", "00:30",
  ], [])

  // Debounce para cambios de fecha (aumentado a 500ms para reducir llamadas)
  const debouncedFecha = useDebounce(formData.fecha, 500)

  // Cargar disponibilidad optimizada
  useEffect(() => {
    const cargarDisponibilidad = async () => {
      if (!debouncedFecha) {
        setDisponibilidad({})
        return
      }

      // Verificar cache
      const cacheKey = `${LOCAL_ID}-${debouncedFecha}`
      const cached = disponibilidadCache.get(cacheKey)

      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        setDisponibilidad(cached.data)
        return
      }

      setLoadingDisponibilidad(true)

      try {
        // Una sola llamada para obtener todas las reservas del día
        const { data: reservasDelDia, error } = await supabase
          .from("reservas")
          .select("cantidad_personas")
          .eq("local_id", LOCAL_ID)
          .eq("fecha", debouncedFecha)

        if (error) {
          console.error("Error al obtener reservas del día:", error)
          return
        }

        // Calcular disponibilidad localmente
        const nuevaDisponibilidad = calcularDisponibilidadLocal(reservasDelDia || [], horarios)

        setDisponibilidad(nuevaDisponibilidad)

        // Guardar en cache
        disponibilidadCache.set(cacheKey, {
          data: nuevaDisponibilidad,
          timestamp: Date.now()
        })

        // Limpiar cache viejo (reducido a 20 entradas)
        if (disponibilidadCache.size > 20) {
          const cutoff = Date.now() - CACHE_TTL
          for (const [key, value] of disponibilidadCache.entries()) {
            if (value.timestamp < cutoff) {
              disponibilidadCache.delete(key)
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar disponibilidad:", error)
        // En caso de error, asignar disponibilidad por defecto
        const defaultDisponibilidad: Record<string, number> = {}
        horarios.forEach(horario => {
          defaultDisponibilidad[horario] = 50
        })
        setDisponibilidad(defaultDisponibilidad)
      } finally {
        setLoadingDisponibilidad(false)
      }
    }

    cargarDisponibilidad()
  }, [debouncedFecha, horarios])

  // Memoizar validación del formulario
  const validateForm = useCallback(async () => {
    const newErrors: Record<string, string> = {}

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres"
    }

    // Validar contacto
    if (!formData.contacto.trim()) {
      newErrors.contacto = "El contacto es requerido"
    } else if (formData.contacto.trim().length < 8) {
      newErrors.contacto = "Ingresa un contacto válido (teléfono o email)"
    }

    // Validar fecha
    if (!formData.fecha) {
      newErrors.fecha = "La fecha es requerida"
    } else {
      const today = new Date()
      const todayStr = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0')

      if (formData.fecha < todayStr) {
        newErrors.fecha = "La fecha no puede ser en el pasado"
      }
    }

    // Validar horario
    if (!formData.horario) {
      newErrors.horario = "El horario es requerido"
    }

    // Validar cantidad de personas
    if (!formData.cantidad_personas) {
      newErrors.cantidad_personas = "La cantidad de personas es requerida"
    } else {
      const cantidad = Number.parseInt(formData.cantidad_personas)
      if (isNaN(cantidad) || cantidad < 1) {
        newErrors.cantidad_personas = "Debe ser al menos 1 persona"
      } else if (cantidad > 20) {
        newErrors.cantidad_personas = "Máximo 20 personas por reserva"
      }
    }

    // Validar disponibilidad
    if (formData.fecha && formData.horario && formData.cantidad_personas && !newErrors.horario && !newErrors.cantidad_personas) {
      const disponibles = disponibilidad[formData.horario] || 0
      const mesasNecesarias = Math.ceil(Number.parseInt(formData.cantidad_personas) / 4)
      if (mesasNecesarias > disponibles) {
        newErrors.horario = `Solo quedan ${disponibles} mesas disponibles en este horario`
      }
    }

    // Validar longitud de notas
    if (formData.notas && formData.notas.length > 500) {
      newErrors.notas = "Las notas no pueden exceder los 500 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, disponibilidad])

  // Memoizar handleSubmit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setTriedSubmit(true)

    const isValid = await validateForm()
    if (!isValid) {
      const firstErrorField = Object.keys(errors)[0]
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField)
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element?.focus()
      }
      return
    }

    setIsSubmitting(true)

    try {
      await saveReserva({
        local_id: LOCAL_ID,
        nombre: formData.nombre.trim(),
        contacto: formData.contacto.trim(),
        fecha: formData.fecha,
        horario: formData.horario,
        cantidad_personas: Number.parseInt(formData.cantidad_personas),
        notas: formData.notas.trim() || null,
      })

      // Limpiar cache después de guardar
      disponibilidadCache.clear()

      setShowSuccess(true)
      setFormData({
        nombre: "",
        contacto: "",
        fecha: new Date().toISOString().split("T")[0],
        horario: "",
        cantidad_personas: "",
        notas: ""
      })
      setErrors({})
      setTimeout(() => setShowSuccess(false), 5000)
    } catch (error) {
      console.error("Error al guardar reserva:", error)
      alert("Error al procesar la reserva. Intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, errors, validateForm])

  // Memoizar handleInputChange
  const handleInputChange = useCallback((field: string, value: string) => {
    if (field === "cantidad_personas" && value !== "") {
      const numValue = Number.parseInt(value)
      if (numValue > 20) {
        value = "20"
      } else if (numValue < 0) {
        value = "1"
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }, [errors])

  // Memoizar horarios con disponibilidad
  const horariosConDisponibilidad = useMemo(() => {
    return horarios.map((horario) => {
      const disponibles = disponibilidad[horario] || 0
      const isNoAvailability = disponibles === 0
      return {
        horario,
        disponibles,
        isNoAvailability
      }
    })
  }, [horarios, disponibilidad])

  // Memoizar si el formulario está completo
  const isFormComplete = useMemo(() => {
    return formData.nombre.trim() &&
      formData.contacto.trim() &&
      formData.fecha &&
      formData.horario &&
      formData.cantidad_personas
  }, [formData])

  // Throttle para actualizar posición del popover
  const throttledUpdatePosition = useThrottle(() => {
    if (privacyButtonRef.current) {
      const rect = privacyButtonRef.current.getBoundingClientRect()
      setPrivacyPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + rect.width / 2 + window.scrollX,
        width: rect.width
      })
    }
  }, 100)

  // Actualizar posición cuando se muestra el popover
  useEffect(() => {
    if (showPrivacy) {
      throttledUpdatePosition()
      const handleResize = () => throttledUpdatePosition()
      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleResize)
      }
    }
  }, [showPrivacy, throttledUpdatePosition])

// Componente del popover que se renderiza en el portal
const PrivacyPopover = () => {
  if (!showPrivacy) return null
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600
  return createPortal(
    <motion.div
      ref={privacyPopoverRef}
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{ duration: 0.2 }}
      className={
        `fixed font-source-sans z-[9999] pointer-events-none ${isMobile ? 'w-[95vw] max-w-xs font-source-sans' : ''}`
      }
      style={{
        top: privacyPosition.top,
        left: isMobile ? undefined : privacyPosition.left,
        transform: isMobile ? undefined : 'translateX(-50%)',
      }}
    >
      <div className="bg-black/95 backdrop-blur-md text-white border border-orange-400/40 max-w-xs w-full text-sm p-4 rounded-lg shadow-2xl pointer-events-auto relative">
        {/* Flecha hacia arriba */}
        {!isMobile && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/95"></div>
        )}
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-gradient-to-br from-orange-500/20 to-red-500/15 rounded border border-orange-400/20 flex-shrink-0">
            <Info className="w-4 h-4 text-orange-200" />
          </div>
          <div>
            <h3 className="font-bold text-orange-400 mb-2 text-base">Política de Reservas</h3>
            <p className="text-white/90 text-sm leading-relaxed">
              El <span className="text-orange-300 font-semibold">50% de nuestra capacidad</span> está disponible para miembros que reserven con anticipación.
            </p>
            <p className="text-white/90 text-sm leading-relaxed mt-2">
              El resto queda reservado para quienes llegan a tiempo.
            </p>
          </div>
        </div>
      </div>
    </motion.div>,
    document.body
  )
}

if (showSuccess) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative font-source-sans"
    >
      {/* Fondo con imagen */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <Image
          src="/FONDOS-01.webp"
          alt="Eleven Club background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-orange-900/50"></div>
      </div>

      <Card className="relative overflow-hidden w-full max-w-md mx-auto border-orange-500/30 backdrop-blur-xl shadow-2xl bg-transparent">
        <CardContent className="pt-6 relative z-10">
          <div className="text-center space-y-6">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Image
                src="/logo-eleven.webp"
                alt="Eleven Club"
                width={80}
                height={80}
                className="mx-auto"
              />
            </motion.div>

            <motion.div
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto border border-orange-500/30">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6, type: "spring", stiffness: 300 }}
                >
                  <motion.span
                    className="text-white text-2xl font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                  >
                    ✓
                  </motion.span>
                </motion.div>
              </div>
            </motion.div>

            <motion.h3
              className="font-legquinne text-3xl font-normal text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              ¡Reserva Confirmada!
            </motion.h3>

            <motion.p
              className="text-white/90 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Tu reserva ha sido registrada exitosamente en <span className="text-orange-400 font-legquinne font-medium">Eleven Club</span>. Te contactaremos pronto para confirmar los detalles.
            </motion.p>

            {/* Elemento decorativo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex justify-center"
            >
              <Image
                src="/detalle-texto-eleven.webp"
                alt="Eleven Club detail"
                width={150}
                height={50}
                className="opacity-60"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Button
                onClick={() => setShowSuccess(false)}
                className="group relative overflow-hidden px-8 py-3 bg-gradient-to-r from-orange-500/80 to-red-500/80 backdrop-blur-md border border-orange-400/30 rounded-full text-white font-medium transition-all duration-500 hover:from-orange-600/90 hover:to-red-600/90 shadow-xl hover:shadow-2xl hover:border-orange-300/50 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, rgba(249, 115, 22, 0.8) 0%, rgba(234, 88, 12, 0.7) 50%, rgba(239, 68, 68, 0.8) 100%)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 32px rgba(249, 115, 22, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                }}
              >
                <span className="relative z-10">Hacer otra reserva</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-300/20 via-orange-400/15 to-red-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

return (
  <>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-lg mx-auto px-1 md:px-4"
    >
      {/* Fondo con imagen */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <Image
          src="/FONDOS-01.webp"
          alt="Eleven Club background"
          fill
          className="object-cover smooth-rendering gpu-accelerated"
          quality={90}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-orange-900/50 gradient-quality"></div>
      </div>

      {/* Efectos de brillo mejorados */}
      <div className="absolute inset-0 rounded-xl shadow-premium"></div>
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 via-red-600/15 to-orange-600/20 rounded-xl blur-lg opacity-40"></div>

      <Card className="relative overflow-hidden bg-transparent border border-orange-500/20 backdrop-blur-xl shadow-xl">
        <CardHeader className="relative z-10 glass-effect-dark border-b border-orange-500/20 pb-4 sm:pb-8 px-2 sm:px-8">
          <div className="mb-2 sm:mb-4 flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2">
              <Image
                src="/logo-eleven.webp"
                alt="Eleven Club"
                width={80}
                height={80}
                className="opacity-90"
                priority
              />
            </div>
            <div className="relative">
              <Button
                ref={privacyButtonRef}
                size="sm"
                className="bg-gradient-to-r from-orange-500/80 to-red-500/80 text-white px-3 py-1 rounded font-bold text-xs flex items-center gap-1 border border-orange-400/30 hover:from-orange-600/90 hover:to-red-600/90 transition-all duration-300"
                style={{ minWidth: 0 }}
                onClick={() => setShowPrivacy(!showPrivacy)}
              >
                <Info className="w-4 h-4 text-orange-200" />
                Capacidad
              </Button>
            </div>
          </div>
          <h2 className="font-legquinne text-2xl sm:text-4xl font-normal text-white mb-1 sm:mb-3 bg-gradient-to-r from-orange-200 via-orange-100 to-yellow-200 bg-clip-text text-transparent leading-tight">
            Reserva tu lugar
          </h2>
          <p className="text-white/80 text-sm sm:text-lg font-medium tracking-wide">
            Asegura tu espacio en Eleven Club
          </p>
        </CardHeader>

        <CardContent className="relative z-10 p-2 sm:p-8 glass-effect-dark">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8"
          >
            {/* Nombre */}
            <motion.div className="space-y-2 sm:space-y-4">
              <Label htmlFor="nombre" className="text-white font-bold flex items-center gap-2 sm:gap-4 text-base sm:text-xl">
                <div className="p-1 bg-gradient-to-br from-orange-500/20 to-red-500/15 rounded border border-orange-400/20 shadow flex-shrink-0">
                  <User className="w-4 h-4 text-orange-200" />
                </div>
                <span className="min-w-0">Nombre completo <span className="text-orange-400">*</span></span>
              </Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Tu nombre completo"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                onBlur={() => validateForm()}
                className="glass-effect border border-orange-400/20 text-white placeholder-white/60 text-sm sm:text-lg py-2 sm:py-4 px-5 sm:px-6 transition-all duration-300 rounded font-medium bg-black/60 focus:border-orange-400/60 focus:shadow-glow hover:border-orange-300/50"
              />
              {triedSubmit && errors.nombre && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-300 text-xs sm:text-base flex items-center gap-2 sm:gap-3 font-semibold bg-red-500/10 border border-red-400/20 rounded px-2 sm:px-4 py-1 sm:py-3 backdrop-blur-md"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="min-w-0">{errors.nombre}</span>
                </motion.p>
              )}
            </motion.div>

            {/* Contacto */}
            <motion.div className="space-y-2 sm:space-y-4">
              <Label htmlFor="contacto" className="text-white font-bold flex items-center gap-2 sm:gap-4 text-base sm:text-xl">
                <div className="p-1 bg-gradient-to-br from-orange-500/20 to-red-500/15 rounded border border-orange-400/20 shadow flex-shrink-0">
                  <Phone className="w-4 h-4 text-orange-200" />
                </div>
                <span className="min-w-0">Contacto <span className="text-orange-400">*</span></span>
              </Label>
              <Input
                id="contacto"
                type="text"
                placeholder="Teléfono o email"
                value={formData.contacto}
                onChange={(e) => handleInputChange("contacto", e.target.value)}
                onBlur={() => validateForm()}
                className="glass-effect border border-orange-400/20 text-white placeholder-white/60 text-sm sm:text-lg py-2 sm:py-4 px-5 sm:px-6 transition-all duration-300 rounded font-medium bg-black/60 focus:border-orange-400/60 focus:shadow-glow hover:border-orange-300/50"
              />
              {triedSubmit && errors.contacto && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-300 text-xs sm:text-base flex items-center gap-2 sm:gap-3 font-semibold bg-red-500/10 border border-red-400/20 rounded px-2 sm:px-4 py-1 sm:py-3 backdrop-blur-md"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="min-w-0">{errors.contacto}</span>
                </motion.p>
              )}
            </motion.div>

            {/* Fecha */}
            <motion.div className="space-y-2 sm:space-y-4">
              <Label htmlFor="fecha" className="text-white font-bold flex items-center gap-2 sm:gap-4 text-base sm:text-xl">
                <div className="p-1 bg-gradient-to-br from-orange-500/20 to-red-500/15 rounded border border-orange-400/20 shadow flex-shrink-0">
                  <Calendar className="w-4 h-4 text-orange-200" />
                </div>
                <span className="min-w-0">Fecha <span className="text-orange-400">*</span></span>
              </Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => handleInputChange("fecha", e.target.value)}
                onBlur={() => validateForm()}
                className="glass-effect border border-orange-400/20 text-white text-sm sm:text-lg py-2 sm:py-4 px-5 sm:px-6 transition-all duration-300 rounded font-medium bg-black/60 focus:border-orange-400/60 focus:shadow-glow hover:border-orange-300/50"
                min={new Date().toISOString().split("T")[0]}
              />
              {triedSubmit && errors.fecha && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-300 text-xs sm:text-base flex items-center gap-2 sm:gap-3 font-semibold bg-red-500/10 border border-red-400/20 rounded px-2 sm:px-4 py-1 sm:py-3 backdrop-blur-md"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="min-w-0">{errors.fecha}</span>
                </motion.p>
              )}
            </motion.div>

            {/* Horario */}
            <motion.div className="space-y-2 sm:space-y-4">
              <Label htmlFor="horario" className="text-white font-bold flex items-center gap-2 sm:gap-4 text-base sm:text-xl">
                <div className="p-1 bg-gradient-to-br from-orange-500/20 to-red-500/15 rounded border border-orange-400/20 shadow flex-shrink-0">
                  <Clock className="w-4 h-4 text-orange-200" />
                </div>
                <span className="min-w-0">Horario <span className="text-orange-400">*</span></span>
              </Label>
              <select
                id="horario"
                value={formData.horario}
                onChange={e => handleInputChange("horario", e.target.value)}
                className="glass-effect border border-orange-400/10 text-white focus:border-orange-400/30 focus:shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-orange-300/20 text-sm sm:text-lg py-2 sm:py-4 px-5 sm:px-6 rounded font-medium bg-[#2d1a0b] w-full placeholder:text-orange-100/40"
                style={{ colorScheme: 'dark' }}
              >
                <option value="" disabled className="bg-[#2d1a0b] text-orange-100/60">Selecciona un horario</option>
                {horarios.map((horario) => {
                  const disponibles = disponibilidad[horario] || 0
                  const isNoAvailability = disponibles === 0
                  return (
                    <option
                      key={horario}
                      value={horario}
                      disabled={isNoAvailability}
                      className="bg-[#2d1a0b] text-orange-100 hover:bg-orange-200 hover:text-orange-900 focus:bg-orange-200 focus:text-orange-900 transition-colors"
                    >
                      {horario} {isNoAvailability ? ' - Sin disponibilidad' : `- ${disponibles} plazas`}
                    </option>
                  )
                })}
              </select>
              {triedSubmit && errors.horario && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-300 text-xs sm:text-base flex items-center gap-2 sm:gap-3 font-semibold bg-red-500/10 border border-red-400/20 rounded px-2 sm:px-4 py-1 sm:py-3 backdrop-blur-md"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="min-w-0">{errors.horario}</span>
                </motion.p>
              )}
            </motion.div>

            {/* Cantidad de personas */}
            <motion.div className="space-y-2 sm:space-y-4">
              <Label htmlFor="cantidad" className="text-white font-bold flex items-center gap-2 sm:gap-4 text-base sm:text-xl">
                <div className="p-1 bg-gradient-to-br from-orange-500/20 to-red-500/15 rounded border border-orange-400/20 shadow flex-shrink-0">
                  <Users className="w-4 h-4 text-orange-200" />
                </div>
                <div className="min-w-0">
                  <span>Cantidad de personas <span className="text-orange-400">*</span></span>
                  <span className="text-white/70 text-xs sm:text-lg font-normal block sm:inline sm:ml-2">(máximo 20)</span>
                </div>
              </Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                max="20"
                value={formData.cantidad_personas}
                onChange={(e) => handleInputChange("cantidad_personas", e.target.value)}
                className="glass-effect border border-orange-400/20 text-white placeholder:text-white/60 focus:border-orange-400/60 focus:shadow-glow backdrop-blur-sm transition-all duration-300 hover:border-orange-300/50 text-sm sm:text-lg py-2 sm:py-4 px-5 sm:px-6 rounded font-medium bg-black/60 w-full"
                placeholder="¿Cuántas personas?"
              />
              {triedSubmit && errors.cantidad_personas && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-300 text-xs sm:text-base flex items-center gap-2 sm:gap-3 font-semibold bg-red-500/10 border border-red-400/20 rounded px-2 sm:px-4 py-1 sm:py-3 backdrop-blur-md"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="min-w-0">{errors.cantidad_personas}</span>
                </motion.p>
              )}
            </motion.div>

            {/* Notas */}
            <motion.div className="space-y-2 sm:space-y-4">
              <Label htmlFor="notas" className="text-white font-bold flex items-center gap-2 sm:gap-4 text-base sm:text-xl">
                <div className="p-1 bg-gradient-to-br from-orange-500/20 to-red-500/15 rounded border border-orange-400/20 shadow flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-orange-200" />
                </div>
                <div className="min-w-0">
                  <span>Notas adicionales</span>
                  <span className="text-white/70 text-xs sm:text-lg font-normal block sm:inline sm:ml-2">(opcional)</span>
                </div>
              </Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => handleInputChange("notas", e.target.value)}
                className="glass-effect border border-orange-400/20 text-white placeholder:text-white/60 resize-none focus:border-orange-400/60 focus:shadow-glow backdrop-blur-sm transition-all duration-300 hover:border-orange-300/50 text-xs sm:text-base py-2 sm:py-5 px-5 sm:px-6 rounded font-medium bg-black/60 w-full"
                placeholder="Solicitudes especiales, alergias, celebraciones, etc."
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                {triedSubmit && errors.notas && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-300 text-xs sm:text-base flex items-center gap-2 sm:gap-3 font-semibold bg-red-500/10 border border-red-400/20 rounded px-2 sm:px-4 py-1 sm:py-3 backdrop-blur-md"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="min-w-0">{errors.notas}</span>
                  </motion.p>
                )}
                <p className="text-xs sm:text-base text-white/70 ml-auto font-semibold">
                  {formData.notas.length}/500 caracteres
                </p>
              </div>
            </motion.div>

            {/* Botón de enviar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.7 }}>
              <Button
                type="submit"
                className={`w-full font-bold py-3 sm:py-7 text-base sm:text-xl transition-all duration-500 group relative overflow-hidden rounded bg-gradient-to-r from-orange-500/80 to-red-500/80 backdrop-blur-md border border-orange-400/40 text-white hover:from-orange-600/90 hover:to-red-600/90 shadow hover:shadow-2xl hover:border-orange-300/70 hover:scale-105 active:scale-95` + (!isFormComplete ? ' bg-gray-700/60 hover:bg-gray-600/60 text-gray-300 cursor-not-allowed border-gray-600/30' : '')}
                style={isFormComplete ? {
                  background: "linear-gradient(135deg, rgba(249, 115, 22, 0.8) 0%, rgba(234, 88, 12, 0.7) 50%, rgba(239, 68, 68, 0.8) 100%)",
                  backdropFilter: "blur(15px) saturate(1.1)",
                  boxShadow: "0 4px 16px rgba(249, 115, 22, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                } : {}}
                disabled={isSubmitting || loadingDisponibilidad || !isFormComplete}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2 sm:gap-3 justify-center">
                    <Loader2 className="w-4 h-4 sm:w-7 sm:h-7 animate-spin" />
                    <span className="text-xs sm:text-lg">Procesando reserva...</span>
                  </div>
                ) : !isFormComplete ? (
                  <span className="text-xs sm:text-lg">Completa todos los campos obligatorios</span>
                ) : (
                  <>
                    <span className="relative z-10 flex items-center gap-2 sm:gap-4 justify-center">
                      <MessageSquare className="w-4 h-4 sm:w-7 sm:h-7" />
                      <span className="text-xs sm:text-lg">Confirmar Reserva</span>
                    </span>
                    {isFormComplete && (
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-300/20 via-orange-400/15 to-red-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    )}
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>

    {/* Popover renderizado en el portal */}
    <AnimatePresence>
      <PrivacyPopover />
    </AnimatePresence>

    {/* Overlay para cerrar el popover al hacer clic fuera */}
    {showPrivacy && (
      <div
        className="fixed inset-0 z-[9998]"
        onClick={() => setShowPrivacy(false)}
      />
    )}
  </>
)
}
