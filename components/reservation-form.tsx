"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getDisponibilidad, saveReserva } from "@/lib/storage"
import { motion } from "framer-motion"
import { AlertCircle, Calendar, Clock, Loader2, MessageSquare, Phone, User, Users } from "lucide-react"
import Image from "next/image"
import type React from "react"
import { useEffect, useState } from "react"

const LOCAL_ID = process.env.NEXT_PUBLIC_LOCAL_ID!

export default function ReservationForm() {
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

  const horarios = [
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
    "22:00", "22:30", "23:00", "23:30", "00:00", "00:30",
  ]

  // Cargar disponibilidad cuando cambia la fecha
  useEffect(() => {
    const cargarDisponibilidad = async () => {
      if (!formData.fecha) {
        setDisponibilidad({})
        return
      }

      setLoadingDisponibilidad(true)
      const nuevaDisponibilidad: Record<string, number> = {}

      try {
        for (const horario of horarios) {
          const disponibles = await getDisponibilidad(LOCAL_ID, formData.fecha, horario)
          nuevaDisponibilidad[horario] = disponibles
        }
        setDisponibilidad(nuevaDisponibilidad)
      } catch (error) {
        console.error("Error al cargar disponibilidad:", error)
        // En caso de error, asignar disponibilidad por defecto
        horarios.forEach(horario => {
          nuevaDisponibilidad[horario] = 50
        })
        setDisponibilidad(nuevaDisponibilidad)
      } finally {
        setLoadingDisponibilidad(false)
      }
    }

    cargarDisponibilidad()
  }, [formData.fecha])

  const validateForm = async () => {
    const newErrors: Record<string, string> = {}

    // Validar nombre (más estricto)
    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres"
    }

    // Validar contacto (más estricto)
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

    // Validar disponibilidad si todos los campos están completos
    if (formData.fecha && formData.horario && formData.cantidad_personas && !newErrors.horario && !newErrors.cantidad_personas) {
      const disponibles = disponibilidad[formData.horario] || 0
      const mesasNecesarias = Math.ceil(Number.parseInt(formData.cantidad_personas) / 4)
      if (mesasNecesarias > disponibles) {
        newErrors.horario = `Solo quedan ${disponibles} mesas disponibles en este horario`
      }
    }

    // Validar longitud de notas (opcional)
    if (formData.notas && formData.notas.length > 500) {
      newErrors.notas = "Las notas no pueden exceder los 500 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar antes de proceder
    const isValid = await validateForm()
    if (!isValid) {
      // Hacer scroll al primer error
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

      setShowSuccess(true)
      setFormData({
        nombre: "",
        contacto: "",
        fecha: new Date().toISOString().split("T")[0],
        horario: "",
        cantidad_personas: "",
        notas: ""
      })
      setErrors({}) // Limpiar errores
      setTimeout(() => setShowSuccess(false), 5000)
    } catch (error) {
      console.error("Error al guardar reserva:", error)
      alert("Error al procesar la reserva. Intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // Limitar cantidad de personas a máximo 20
    if (field === "cantidad_personas" && value !== "") {
      const numValue = Number.parseInt(value)
      if (numValue > 20) {
        value = "20"
      } else if (numValue < 0) {
        value = "1"
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Función para manejar Enter en campos individuales
  const handleKeyDown = async (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      // Validar el campo actual primero
      const fieldErrors: Record<string, string> = {}

      switch (field) {
        case 'nombre':
          if (!formData.nombre.trim()) {
            fieldErrors.nombre = "El nombre es requerido"
          } else if (formData.nombre.trim().length < 2) {
            fieldErrors.nombre = "El nombre debe tener al menos 2 caracteres"
          }
          break
        case 'contacto':
          if (!formData.contacto.trim()) {
            fieldErrors.contacto = "El contacto es requerido"
          } else if (formData.contacto.trim().length < 8) {
            fieldErrors.contacto = "Ingresa un contacto válido (teléfono o email)"
          }
          break
        case 'fecha':
          if (!formData.fecha) {
            fieldErrors.fecha = "La fecha es requerida"
          }
          break
        case 'cantidad_personas':
          if (!formData.cantidad_personas) {
            fieldErrors.cantidad_personas = "La cantidad de personas es requerida"
          }
          break
      }

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...fieldErrors }))
        return
      }

      // Si el campo actual está bien, intentar enviar el formulario completo
      const isFormValid = await validateForm()
      if (isFormValid) {
        handleSubmit(e as any)
      } else {
        // Enfocar el siguiente campo con error
        const errorFields = Object.keys(errors)
        if (errorFields.length > 0) {
          const nextErrorField = errorFields[0]
          const element = document.getElementById(nextErrorField)
          element?.focus()
        }
      }
    }
  }

  // Verificar si el formulario está completo (excepto notas)
  const isFormComplete = formData.nombre.trim() &&
                        formData.contacto.trim() &&
                        formData.fecha &&
                        formData.horario &&
                        formData.cantidad_personas

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-md mx-auto"
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
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 via-red-600/15 to-orange-600/20 rounded-xl blur-lg opacity-40 shadow-glow gpu-accelerated"></div>

      <Card className="relative overflow-hidden bg-transparent border-glow backdrop-blur-xl shadow-2xl">
        <CardHeader className="relative z-10 glass-effect-dark border-b border-orange-500/30">
          <div className="flex items-center gap-4">
            {/* Logo pequeño */}
            <Image
              src="/logo-eleven.webp"
              alt="Eleven Club"
              width={40}
              height={40}
              className="opacity-90 logo-quality gpu-accelerated"
              quality={100}
            />
            <div>
              <CardTitle className="text-white flex items-center gap-3 text-xl font-legquinne font-normal text-crisp">
                <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-400/30">
                  <MessageSquare className="w-6 h-6 text-orange-300" />
                </div>
                Reserva tu Mesa
              </CardTitle>
              <CardDescription className="text-white/80 text-base text-crisp">
                Asegura tu lugar para vivir la experiencia completa en Eleven Club
              </CardDescription>
            </div>
          </div>
          {/* Elemento decorativo */}
          <Image
            src="/detalle-texto-eleven.webp"
            alt="Eleven Club detail"
            width={100}
            height={30}
            className="opacity-40 hidden md:block absolute top-4 right-4 logo-quality"
          />
        </CardHeader>

        <CardContent className="relative z-10 p-6 glass-effect-dark">
          <form onSubmit={handleSubmit} className="space-y-6"
            style={{
              backdropFilter: "blur(10px)",
              background: "rgba(0, 0, 0, 0.2)"
            }}
          >
            {/* Campos del formulario con mejor estilo */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Label htmlFor="nombre" className="text-orange-200 font-medium flex items-center gap-2 text-crisp">
                <User className="w-4 h-4" />
                Nombre completo
              </Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Tu nombre completo"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "nombre")}
                onBlur={() => validateForm()}
                className={`glass-effect border-glow text-white placeholder-white/50 text-crisp ${
                  errors.nombre ? 'border-red-500/50 shadow-glow-red' : 'focus:border-orange-400/50 focus:shadow-glow'
                }`}
                style={{
                  background: "rgba(0, 0, 0, 0.3)",
                  backdropFilter: "blur(10px)"
                }}
              />
              {errors.nombre && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm flex items-center gap-1 text-crisp"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.nombre}
                </motion.p>
              )}
            </motion.div>

                         <motion.div
               className="space-y-2"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.4, delay: 0.2 }}
             >
               <Label htmlFor="contacto" className="text-orange-200 font-medium flex items-center gap-2 text-crisp">
                 <Phone className="w-4 h-4" />
                 Contacto
               </Label>
               <Input
                 id="contacto"
                 type="text"
                 placeholder="Teléfono o email"
                 value={formData.contacto}
                 onChange={(e) => handleInputChange("contacto", e.target.value)}
                 onKeyDown={(e) => handleKeyDown(e, "contacto")}
                 onBlur={() => validateForm()}
                 className={`glass-effect border-glow text-white placeholder-white/50 text-crisp ${
                   errors.contacto ? 'border-red-500/50 shadow-glow-red' : 'focus:border-orange-400/50 focus:shadow-glow'
                 }`}
                 style={{
                   background: "rgba(0, 0, 0, 0.3)",
                   backdropFilter: "blur(10px)"
                 }}
               />
               {errors.contacto && (
                 <motion.p
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="text-red-400 text-sm flex items-center gap-1 text-crisp"
                 >
                   <AlertCircle className="w-4 h-4" />
                   {errors.contacto}
                 </motion.p>
               )}
             </motion.div>

                         <motion.div
               className="space-y-2"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.4, delay: 0.3 }}
             >
               <Label htmlFor="fecha" className="text-orange-200 font-medium flex items-center gap-2 text-crisp">
                 <Calendar className="w-4 h-4" />
                 Fecha
               </Label>
               <Input
                 id="fecha"
                 type="date"
                 value={formData.fecha}
                 onChange={(e) => handleInputChange("fecha", e.target.value)}
                 onKeyDown={(e) => handleKeyDown(e, "fecha")}
                 onBlur={() => validateForm()}
                 className={`glass-effect border-glow text-white text-crisp ${
                   errors.fecha ? 'border-red-500/50 shadow-glow-red' : 'focus:border-orange-400/50 focus:shadow-glow'
                 }`}
                 style={{
                   background: "rgba(0, 0, 0, 0.3)",
                   backdropFilter: "blur(10px)"
                 }}
                 min={new Date().toISOString().split("T")[0]}
               />
               {errors.fecha && (
                 <motion.p
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="text-red-400 text-sm flex items-center gap-1 text-crisp"
                 >
                   <AlertCircle className="w-4 h-4" />
                   {errors.fecha}
                 </motion.p>
               )}
             </motion.div>

            <div className="space-y-2">
                <Label htmlFor="horario" className="text-white flex items-center gap-2 font-medium">
                  <Clock className="w-4 h-4 text-orange-400" />
                Horario
              </Label>
              <Select value={formData.horario} onValueChange={(value) => handleInputChange("horario", value)}>
                  <SelectTrigger className={`bg-black/60 border-orange-500/30 text-white focus:border-orange-400 focus:ring-orange-500/20 backdrop-blur-sm transition-all duration-200 ${
                  errors.horario ? 'border-red-500 focus:border-red-500' : ''
                }`}>
                  <SelectValue placeholder="Selecciona un horario" />
                </SelectTrigger>
                  <SelectContent className="bg-black/95 border-orange-500/30 backdrop-blur-xl shadow-2xl">
                  {horarios.map((horario) => {
                    const disponibles = disponibilidad[horario] || 0
                    const isLowAvailability = disponibles <= 3
                    const isNoAvailability = disponibles === 0

                    return (
                      <SelectItem
                        key={horario}
                        value={horario}
                        disabled={isNoAvailability}
                          className="text-white hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 focus:bg-gradient-to-r focus:from-orange-500/20 focus:to-red-500/20 transition-all duration-200 border-b border-orange-500/20 last:border-b-0"
                      >
                        <div className="flex justify-between items-center w-full py-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              isNoAvailability ? 'bg-red-500' :
                              isLowAvailability ? 'bg-yellow-500 animate-pulse' :
                              'bg-green-500'
                            }`}></div>
                            <span className="font-medium">{horario}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {loadingDisponibilidad ? (
                                <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full">
                                <Loader2 className="w-3 h-3 animate-spin text-orange-400" />
                                  <span className="text-xs text-orange-300">Cargando...</span>
                              </div>
                            ) : (
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isNoAvailability ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                isLowAvailability ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                'bg-green-500/20 text-green-300 border border-green-500/30'
                              }`}>
                                {isNoAvailability ? 'Sin disponibilidad' : `${disponibles} mesas`}
                              </div>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {errors.horario && <p className="text-red-400 text-sm font-medium">{errors.horario}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="cantidad" className="text-white flex items-center gap-2 font-medium">
                  <Users className="w-4 h-4 text-orange-400" />
                  Cantidad de personas <span className="text-white/60 text-sm">(máximo 20)</span>
              </Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                max="20"
                value={formData.cantidad_personas}
                onChange={(e) => handleInputChange("cantidad_personas", e.target.value)}
                  className={`bg-black/60 border-orange-500/30 text-white placeholder:text-white/50 focus:border-orange-400 focus:ring-orange-500/20 backdrop-blur-sm transition-all duration-200 ${
                  errors.cantidad_personas ? 'border-red-500 focus:border-red-500' : ''
                }`}
                placeholder="¿Cuántas personas?"
                onKeyDown={(e) => handleKeyDown(e, "cantidad_personas")}
              />
              {formData.cantidad_personas && Number.parseInt(formData.cantidad_personas) > 0 && !errors.cantidad_personas && (
                <p className="text-xs text-orange-300">
                  Esta reserva ocupará {Math.ceil(Number.parseInt(formData.cantidad_personas) / 4)} mesa{Math.ceil(Number.parseInt(formData.cantidad_personas) / 4) !== 1 ? 's' : ''}
                  (máximo 4 personas por mesa)
                </p>
              )}
              {errors.cantidad_personas && <p className="text-red-400 text-sm font-medium">{errors.cantidad_personas}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="notas" className="text-white flex items-center gap-2 font-medium">
                  <MessageSquare className="w-4 h-4 text-orange-400" />
                  Notas adicionales <span className="text-white/60 text-sm">(opcional)</span>
              </Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => handleInputChange("notas", e.target.value)}
                  className={`bg-black/60 border-orange-500/30 text-white placeholder:text-white/50 resize-none focus:border-orange-400 focus:ring-orange-500/20 backdrop-blur-sm transition-all duration-200 ${
                  errors.notas ? 'border-red-500 focus:border-red-500' : ''
                }`}
                placeholder="Solicitudes especiales, alergias, celebraciones, etc."
                rows={3}
                maxLength={500}
                onKeyDown={(e) => handleKeyDown(e, "notas")}
              />
              <div className="flex justify-between items-center">
                {errors.notas && <p className="text-red-400 text-sm font-medium">{errors.notas}</p>}
                  <p className="text-xs text-white/50 ml-auto">
                  {formData.notas.length}/500 caracteres
                </p>
              </div>
            </div>

            <Button
              type="submit"
                className={`w-full font-semibold py-3 transition-all duration-300 group relative overflow-hidden ${
                isFormComplete
                    ? 'bg-gradient-to-r from-orange-500/80 to-red-500/80 backdrop-blur-md border border-orange-400/30 rounded-full text-white hover:from-orange-600/90 hover:to-red-600/90 shadow-xl hover:shadow-2xl hover:border-orange-300/50 hover:scale-105'
                    : 'bg-gray-700/60 hover:bg-gray-600/60 text-gray-300 cursor-not-allowed border border-gray-600/30 rounded-full backdrop-blur-sm'
                }`}
                style={isFormComplete ? {
                  background: "linear-gradient(135deg, rgba(249, 115, 22, 0.8) 0%, rgba(234, 88, 12, 0.7) 50%, rgba(239, 68, 68, 0.8) 100%)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 32px rgba(249, 115, 22, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                } : {}}
                disabled={isSubmitting || loadingDisponibilidad || !isFormComplete}
            >
              {isSubmitting ? (
                  <div className="flex items-center gap-2 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </div>
              ) : !isFormComplete ? (
                "Completa todos los campos obligatorios"
              ) : (
                  <>
                    <span className="relative z-10">Confirmar Reserva</span>
                    {isFormComplete && (
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-300/20 via-orange-400/15 to-red-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    )}
                  </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
