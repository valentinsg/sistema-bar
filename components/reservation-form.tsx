"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { saveReserva } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import { AlertCircle, Calendar, Clock, Info, Loader2, MessageSquare, Minus, Phone, Plus, User, Users } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"

const LOCAL_ID = process.env.NEXT_PUBLIC_LOCAL_ID!

// Cache optimizado
const disponibilidadCache = new Map<string, { data: Record<string, number>, timestamp: number }>()
const CACHE_TTL = 30 * 1000 // 30 segundos

// Hook de debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

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

// Función para calcular disponibilidad
const calcularDisponibilidadLocal = (reservas: any[], horarios: string[]) => {
  const LIMITE_POR_TURNO = 30
  const disponibilidad: Record<string, number> = {}

  horarios.forEach(horario => {
    const reservasEnHorario = reservas.filter(r => r.horario === horario)
    const personasEnHorario = reservasEnHorario.reduce((acc, r) => acc + r.cantidad_personas, 0)
    disponibilidad[horario] = Math.max(0, LIMITE_POR_TURNO - personasEnHorario)
  })

  return disponibilidad
}

// Función para verificar días cerrados
const isClosedDay = (dateStr: string) => {
  const date = new Date(dateStr + 'T12:00:00')
  const day = date.getDay()

  // Excepción: abierto el domingo 20 de julio de 2025 por el Día del Amigo
  if (dateStr === '2025-07-20') {
    return false
  }

  return day === 0 // Cerrado domingos
}

interface ReservationFormProps {
  selectedDate?: string
  selectedTime?: string
  onDateChange?: (date: string) => void
  onTimeChange?: (time: string) => void
}

export default function ReservationForm({
  selectedDate: externalSelectedDate,
  selectedTime: externalSelectedTime,
  onDateChange,
  onTimeChange
}: ReservationFormProps = {}) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    whatsapp: "",
    contacto: "", // Campo legacy - mantener por compatibilidad
    fecha: externalSelectedDate || new Date().toISOString().split("T")[0],
    horario: externalSelectedTime || "",
    cantidad_personas: 1,
    notas: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [disponibilidad, setDisponibilidad] = useState<Record<string, number>>({})
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false)
  const [triedSubmit, setTriedSubmit] = useState(false)
  const [showCapacityInfo, setShowCapacityInfo] = useState(false)
  const [totalPersonasReservadas, setTotalPersonasReservadas] = useState(0)
  const [quiereNovedades, setQuiereNovedades] = useState(false)

  // Horarios disponibles - Solo dos turnos
  const horarios = useMemo(() => [
    "20:15", "22:30"
  ], [])

  // Sincronizar con props externas
  useEffect(() => {
    if (externalSelectedDate && externalSelectedDate !== formData.fecha) {
      setFormData(prev => ({ ...prev, fecha: externalSelectedDate }))
    }
  }, [externalSelectedDate])

  useEffect(() => {
    if (externalSelectedTime && externalSelectedTime !== formData.horario) {
      setFormData(prev => ({ ...prev, horario: externalSelectedTime }))
    }
  }, [externalSelectedTime])

  // Debounce para la fecha
  const debouncedFecha = useDebounce(formData.fecha, 500)

  // Cargar disponibilidad optimizada
  useEffect(() => {
    const cargarDisponibilidad = async () => {
      if (!debouncedFecha) {
        setDisponibilidad({})
        setTotalPersonasReservadas(0)
        return
      }

      // Verificar cache
      const cacheKey = `${LOCAL_ID}-${debouncedFecha}`
      const cached = disponibilidadCache.get(cacheKey)

      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        setDisponibilidad(cached.data)
        let total = 0
        Object.values(cached.data).forEach(val => {
          total += (30 - val)
        })
        setTotalPersonasReservadas(total)
        return
      }

      setLoadingDisponibilidad(true)

      try {
        const { data: reservasDelDia, error } = await supabase
          .from("reservas")
          .select("cantidad_personas, horario")
          .eq("local_id", LOCAL_ID)
          .eq("fecha", debouncedFecha)

        if (error) {
          console.error("Error al obtener reservas:", error)
          setTotalPersonasReservadas(0)
          return
        }

        const nuevaDisponibilidad = calcularDisponibilidadLocal(reservasDelDia || [], horarios)
        setDisponibilidad(nuevaDisponibilidad)

        const totalPersonas = (reservasDelDia || []).reduce((acc, r) => acc + (r.cantidad_personas || 0), 0)
        setTotalPersonasReservadas(totalPersonas)

        // Guardar en cache
        disponibilidadCache.set(cacheKey, {
          data: nuevaDisponibilidad,
          timestamp: Date.now()
        })

        // Limpiar cache viejo
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
        setTotalPersonasReservadas(0)
        const defaultDisponibilidad: Record<string, number> = {}
        horarios.forEach(horario => {
          defaultDisponibilidad[horario] = 30
        })
        setDisponibilidad(defaultDisponibilidad)
      } finally {
        setLoadingDisponibilidad(false)
      }
    }

    cargarDisponibilidad()
  }, [debouncedFecha, horarios])

  // Validación del formulario
  const validateForm = useCallback(async () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres"
    }

    // Validación de email
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Ingresa un email válido"
      }
    }

    // Validación de WhatsApp
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "El WhatsApp es requerido"
    } else {
      const whatsappRegex = /^[0-9\-\+\s\(\)]{8,20}$/
      if (!whatsappRegex.test(formData.whatsapp.trim())) {
        newErrors.whatsapp = "Ingresa un número de WhatsApp válido (ej: +54 223 123-4567)"
      }
    }

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

      if (isClosedDay(formData.fecha)) {
        newErrors.fecha = "El restaurante está cerrado los domingos"
      }
    }

    if (!formData.horario) {
      newErrors.horario = "El horario es requerido"
    }

    if (!formData.cantidad_personas || formData.cantidad_personas < 1) {
      newErrors.cantidad_personas = "La cantidad de personas es requerida"
    } else if (formData.cantidad_personas > 6) {
      newErrors.cantidad_personas = "Hasta 6 reservas por personas. Para reservas de más personas comunicarse al: 0223-5357224"
    }

    if (formData.fecha && formData.horario && !newErrors.horario && !newErrors.cantidad_personas) {
      const disponibles = disponibilidad[formData.horario] || 0
      if (disponibles < formData.cantidad_personas) {
        newErrors.horario = `No hay suficientes plazas disponibles. Disponibles: ${disponibles}`
      }
    }

    if (formData.notas && formData.notas.length > 500) {
      newErrors.notas = "Las notas no pueden exceder los 500 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, disponibilidad])

  // Manejar envío del formulario
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
        email: formData.email.trim(),
        whatsapp: formData.whatsapp.trim(),
        contacto: formData.email.trim(), // Campo legacy - usar email como principal
        fecha: formData.fecha,
        horario: formData.horario,
        cantidad_personas: formData.cantidad_personas,
        quiere_newsletter: quiereNovedades,
        notas: formData.notas.trim() || null,
      })

      if (quiereNovedades) {
        console.log('Usuario quiere recibir novedades:', formData.email)
      }

      disponibilidadCache.clear()

      setShowSuccess(true)
      setFormData({
        nombre: "",
        email: "",
        whatsapp: "",
        contacto: "",
        fecha: new Date().toISOString().split("T")[0],
        horario: "",
        cantidad_personas: 1,
        notas: ""
      })
      setQuiereNovedades(false)
      setErrors({})
      setTimeout(() => setShowSuccess(false), 5000)
    } catch (error) {
      console.error("Error al guardar reserva:", error)
      alert("Error al procesar la reserva. Intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, errors, validateForm, quiereNovedades])

  // Manejar cambios en inputs
  const handleInputChange = useCallback((field: string, value: string | number) => {
    if (field === "cantidad_personas") {
      const numValue = typeof value === 'string' ? parseInt(value) : value
      if (numValue > 6) {
        setFormData(prev => ({ ...prev, [field]: 6 }))
      } else if (numValue < 1 || isNaN(numValue)) {
        setFormData(prev => ({ ...prev, [field]: 1 }))
      } else {
        setFormData(prev => ({ ...prev, [field]: numValue }))
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }

    // Notificar cambios al componente padre
    if (field === 'fecha' && onDateChange) {
      onDateChange(value as string)
    }
    if (field === 'horario' && onTimeChange) {
      onTimeChange(value as string)
    }
  }, [errors, onDateChange, onTimeChange])

  // Verificar si el formulario está completo
  const isFormComplete = useMemo(() => {
    return formData.nombre.trim() &&
      formData.email.trim() &&
      formData.whatsapp.trim() &&
      formData.fecha &&
      formData.horario &&
      formData.cantidad_personas > 0
  }, [formData])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg mx-auto"
      >
        <Card className="bg-gradient-to-br from-amber-950/90 to-orange-950/90 border-2 border-amber-600/50 shadow-2xl">
          <CardHeader className="border-b border-amber-600/30 pb-4 sm:pb-6 bg-gradient-to-r from-amber-900/30 to-orange-900/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-amber-800/40 rounded-full border-2 border-amber-600/70">
                  <Image
                    src="/eleven_club_logo.webp"
                    alt="Eleven Club"
                    width={32}
                    height={32}
                    className="opacity-90 sm:w-10 sm:h-10"
                  />
                </div>
                <div>
                  <h2 className="font-legquinne text-xl sm:text-2xl lg:text-3xl text-amber-100 mb-1">
                    Reserva tu lugar
                  </h2>
                  <p className="text-amber-200 text-xs sm:text-sm">
                    Asegura tu espacio en Eleven Club
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCapacityInfo(true)}
                className="bg-amber-800/40 px-3 py-1 rounded-full border border-amber-600/60 self-start sm:self-auto hover:bg-amber-700/50 transition-colors duration-200 flex items-center gap-2"
              >
                <span className="font-source-sans text-amber-200 text-xs font-medium">Capacidad</span>
                <Info className="w-3 h-3 text-amber-300" />
              </button>
            </div>
            <div className="bg-amber-950/70 border-2 border-amber-700/50 rounded-lg p-3">
              <p className="font-source-sans text-amber-100 text-xs sm:text-sm text-center">
                <span className="font-medium text-amber-200">20:15 - 22:30</span> <span className="hidden sm:inline">(2 turnos) • </span><span className="font-medium text-amber-200">30 plazas por turno</span><span className="hidden sm:inline"> • Barra libre</span>
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 " >
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="font-source-sans text-amber-100 font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  Nombre completo <span className="text-amber-400">*</span>
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  onBlur={validateForm}
                  className="bg-amber-950/80 border-2 border-amber-800/60 text-amber-100 placeholder-amber-400/70 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/30"
                />
                {triedSubmit && errors.nombre && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-300 text-sm flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded px-3 py-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.nombre}
                  </motion.p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-source-sans text-amber-100 font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  Email <span className="text-amber-400">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={validateForm}
                  className="bg-amber-950/80 border-2 border-amber-800/60 text-amber-100 placeholder-amber-400/70 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/30"
                />
                {triedSubmit && errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-300 text-sm flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded px-3 py-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="font-source-sans text-amber-100 font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400" />
                  Teléfono <span className="text-amber-400">*</span>
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+54 223 123-4567"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                  onBlur={validateForm}
                  className="bg-amber-950/80 border-2 border-amber-800/60 text-amber-100 placeholder-amber-400/70 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/30"
                />
                {triedSubmit && errors.whatsapp && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-300 text-sm flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded px-3 py-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.whatsapp}
                  </motion.p>
                )}
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="fecha" className="font-source-sans text-amber-100 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Fecha <span className="text-amber-400">*</span>
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange("fecha", e.target.value)}
                  onBlur={validateForm}
                  className="bg-amber-950/80 border-2 border-amber-800/60 text-amber-100 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/30"
                  min={new Date().toISOString().split("T")[0]}
                />
                {triedSubmit && errors.fecha && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-300 text-sm flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded px-3 py-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.fecha}
                  </motion.p>
                )}
              </div>

              {/* Horario */}
              <div className="space-y-3">
                <Label className="font-source-sans text-amber-100 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Horario <span className="text-amber-400">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {horarios.map((horario) => {
                    const disponibles = disponibilidad[horario] || 0
                    const isNoAvailability = disponibles === 0
                    const isSelected = formData.horario === horario
                    return (
                      <button
                        key={horario}
                        type="button"
                        onClick={() => handleInputChange("horario", horario)}
                        disabled={isNoAvailability}
                        className={`
                          relative p-3 sm:p-5 rounded-xl border-2 transition-all duration-300 font-medium
                          ${isSelected
                            ? 'border-amber-600 bg-gradient-to-br from-amber-700/40 to-orange-700/40 text-amber-100 shadow-lg shadow-amber-600/20'
                            : isNoAvailability
                              ? 'border-amber-900/60 bg-amber-950/40 text-amber-700 cursor-not-allowed'
                              : 'border-amber-800/70 bg-gradient-to-br from-amber-950/80 to-amber-900/60 text-amber-200 hover:border-amber-600 hover:bg-gradient-to-br hover:from-amber-900/90 hover:to-amber-800/70 hover:shadow-md hover:shadow-amber-600/10'
                          }
                        `}
                      >
                        <div className="text-center">
                          <div className="font-legquinne text-lg sm:text-xl font-bold mb-1">{horario}</div>
                          <div className="font-source-sans text-xs">
                            {isNoAvailability ? (
                              <span className="text-red-400 font-medium">Sin cupos</span>
                            ) : (
                              <span className="text-amber-300 font-medium">
                                {disponibles}/30 libres
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-2 h-2 sm:w-3 sm:h-3 bg-amber-400 rounded-full border-2 border-amber-200"></div>
                        )}
                      </button>
                    )
                  })}
                </div>
                {triedSubmit && errors.horario && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-300 text-sm flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded px-3 py-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.horario}
                  </motion.p>
                )}
              </div>

              {/* Cantidad de personas */}
              <div className="space-y-3">
                <Label htmlFor="cantidad_personas" className="font-source-sans text-amber-100 font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  Cantidad de personas <span className="text-amber-400">*</span>
                </Label>

                {/* Selector móvil optimizado */}
                <div className="flex items-center justify-center gap-3 sm:gap-4 p-3 sm:p-4 bg-amber-950/80 border-2 border-amber-800/60 rounded-lg">
                  <Button
                    type="button"
                    onClick={() => handleInputChange("cantidad_personas", Math.max(1, formData.cantidad_personas - 1))}
                    disabled={formData.cantidad_personas <= 1}
                    className="w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-amber-800/60 hover:bg-amber-700/80 active:bg-amber-600/80 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-amber-600/50 p-0 flex items-center justify-center transition-all duration-200 touch-manipulation"
                  >
                    <Minus className="w-6 h-6 sm:w-5 sm:h-5 text-amber-100" />
                  </Button>

                  <div className="flex-1 text-center min-w-0">
                    <div className="text-4xl sm:text-3xl font-bold text-amber-100 mb-1 leading-none">
                      {formData.cantidad_personas}
                    </div>
                    <div className="text-amber-300 text-sm sm:text-xs font-medium">
                      {formData.cantidad_personas === 1 ? 'persona' : 'personas'}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleInputChange("cantidad_personas", Math.min(6, formData.cantidad_personas + 1))}
                    disabled={formData.cantidad_personas >= 6}
                    className="w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-amber-800/60 hover:bg-amber-700/80 active:bg-amber-600/80 disabled:opacity-30 disabled:cursor-not-allowed border-2 border-amber-600/50 p-0 flex items-center justify-center transition-all duration-200 touch-manipulation"
                  >
                    <Plus className="w-6 h-6 sm:w-5 sm:h-5 text-amber-100" />
                  </Button>
                </div>

                {/* Indicador visual del límite máximo */}
                {formData.cantidad_personas >= 6 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-3 bg-amber-800/30 border border-amber-600/40 rounded-lg"
                  >
                    <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <p className="text-amber-200 text-sm">
                      Has alcanzado el límite máximo de 6 personas
                    </p>
                  </motion.div>
                )}

                {/* Input hidden para validación del formulario */}
                <input
                  id="cantidad_personas"
                  type="hidden"
                  value={formData.cantidad_personas}
                />

                <p className="text-amber-300 text-xs">
                  Para reservas de más de 6 personas, contactar al: <strong>0223-5357224</strong>
                </p>
                {triedSubmit && errors.cantidad_personas && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-300 text-sm flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded px-3 py-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.cantidad_personas}
                  </motion.p>
                )}
              </div>

              {/* Botones de selección rápida */}
              <div className="space-y-2">
                <p className="text-amber-300 text-sm font-medium text-center">
                  O selecciona directamente:
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((numero) => (
                    <Button
                      key={numero}
                      type="button"
                      onClick={() => handleInputChange("cantidad_personas", numero)}
                      className={`
                        h-12 rounded-lg border-2 transition-all duration-200 font-bold text-lg
                        ${formData.cantidad_personas === numero
                          ? 'border-amber-500 bg-amber-600/80 text-white shadow-lg'
                          : 'border-amber-800/60 bg-amber-950/60 text-amber-300 hover:border-amber-600/80 hover:bg-amber-800/40'
                        }
                      `}
                    >
                      {numero}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-4 mt-2">
                <Label htmlFor="notas" className="font-source-sans text-amber-100 mt-2 font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  Notas adicionales (opcional)
                </Label>
                <Textarea
                  id="notas"
                  value={formData.notas}
                  onChange={(e) => handleInputChange("notas", e.target.value)}
                  className="bg-amber-950/80 border-2 border-amber-800/60 text-amber-100 placeholder-amber-400/70 resize-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/30"
                  placeholder="Solicitudes especiales, alergias, celebraciones, etc."
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  {triedSubmit && errors.notas && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-300 text-sm flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded px-3 py-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.notas}
                    </motion.p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">
                    {formData.notas.length}/500
                  </p>
                </div>
              </div>

              {/* Checkbox novedades */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    id="novedades"
                    type="checkbox"
                    checked={quiereNovedades}
                    onChange={e => setQuiereNovedades(e.target.checked)}
                    className="accent-amber-500 w-4 h-4"
                  />
                  <Label htmlFor="novedades" className="font-source-sans text-amber-200 text-sm cursor-pointer">
                    Quiero recibir novedades sobre Eleven Club
                  </Label>
                </div>
              </div>

              {/* Botón enviar */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl border-2 border-amber-500/50"
                disabled={isSubmitting || loadingDisponibilidad || !isFormComplete}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2 justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </div>
                ) : !isFormComplete ? (
                  "Completa todos los campos"
                ) : (
                  <div className="flex items-center gap-2 justify-center">
                    <MessageSquare className="w-5 h-5" />
                    Confirmar Reserva
                  </div>
                )}
              </Button>
              <p className="text-amber-300 text-xs pl-7">
                Recibirás confirmación de tu reserva por WhatsApp
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal de información de capacidad */}
      {showCapacityInfo && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowCapacityInfo(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-orange-500/30 rounded-lg p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Información de Capacidad</h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-300">
                <strong>Total reservado hoy:</strong> {totalPersonasReservadas} personas
              </p>
              <div className="text-gray-300">
                <strong>Sistema de turnos:</strong>
                <ul className="mt-2 space-y-1 text-xs text-gray-400 ml-4">
                  <li>• Primer turno (20:15-21:45): 30 plazas</li>
                  <li>• Segundo turno (22:00-22:15): 30 plazas</li>
                  <li>• Tolerancia: 15 minutos por reserva</li>
                  <li>• Barra disponible por orden de llegada</li>
                </ul>
              </div>
            </div>
            <Button
              onClick={() => setShowCapacityInfo(false)}
              className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              Entendido
            </Button>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Modal de éxito */}
      {showSuccess && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-900 border border-green-500/30 rounded-lg p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-2">¡Reserva Confirmada!</h3>
            <p className="text-green-200 text-sm mb-4">
              Tu reserva ha sido procesada exitosamente. Te enviaremos la confirmación por WhatsApp y email.
            </p>
            <Button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Cerrar
            </Button>
          </motion.div>
        </div>,
        document.body
      )}
    </>
  )
}
