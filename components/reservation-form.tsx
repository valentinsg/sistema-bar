"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getDisponibilidad, saveReserva } from "@/lib/storage"
import { Calendar, Clock, Loader2, MessageSquare, Phone, User, Users } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"

const LOCAL_ID = process.env.NEXT_PUBLIC_LOCAL_ID!

export default function ReservationForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    fecha: new Date().toISOString().split("T")[0], // Auto-completar con fecha de hoy
    horario: "",
    cantidad_personas: "",
    notas: "", // Nuevo campo para notas
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
      <Card className="w-full max-w-md mx-auto bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">✓</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white">¡Reserva Confirmada!</h3>
            <p className="text-gray-300">
              Tu reserva ha sido registrada exitosamente. Te contactaremos pronto para confirmar los detalles.
            </p>
            <Button onClick={() => setShowSuccess(false)} className="bg-purple-600 hover:bg-purple-700">
              Hacer otra reserva
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900/90 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-white">Reservá tu Mesa</CardTitle>
        <CardDescription className="text-center text-gray-300">
          Asegurate tu lugar para vivir la experiencia completa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-white flex items-center gap-2">
              <User className="w-4 h-4" />
              Nombre completo
            </Label>
            <Input
              id="nombre"
              type="text"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              className={`bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 ${
                errors.nombre ? 'border-red-500 focus:border-red-500' : ''
              }`}
              placeholder="Tu nombre completo"
              onKeyDown={(e) => handleKeyDown(e, "nombre")}
            />
            {errors.nombre && <p className="text-red-400 text-sm font-medium">{errors.nombre}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contacto" className="text-white flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contacto
            </Label>
            <Input
              id="contacto"
              type="text"
              value={formData.contacto}
              onChange={(e) => handleInputChange("contacto", e.target.value)}
              className={`bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 ${
                errors.contacto ? 'border-red-500 focus:border-red-500' : ''
              }`}
              placeholder="Teléfono o email"
              onKeyDown={(e) => handleKeyDown(e, "contacto")}
            />
            {errors.contacto && <p className="text-red-400 text-sm font-medium">{errors.contacto}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha" className="text-white flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha
            </Label>
            <Input
              id="fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) => handleInputChange("fecha", e.target.value)}
              className={`bg-gray-800 border-gray-600 text-white ${
                errors.fecha ? 'border-red-500 focus:border-red-500' : ''
              }`}
              min={new Date().toISOString().split("T")[0]}
              onKeyDown={(e) => handleKeyDown(e, "fecha")}
            />
            {errors.fecha && <p className="text-red-400 text-sm font-medium">{errors.fecha}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario" className="text-white flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horario
            </Label>
            <Select value={formData.horario} onValueChange={(value) => handleInputChange("horario", value)}>
              <SelectTrigger className={`bg-gray-800 border-gray-600 text-white ${
                errors.horario ? 'border-red-500 focus:border-red-500' : ''
              }`}>
                <SelectValue placeholder="Selecciona un horario" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {horarios.map((horario) => {
                  const disponibles = disponibilidad[horario] || 0
                  return (
                    <SelectItem key={horario} value={horario} className="text-white hover:bg-gray-700">
                      <div className="flex justify-between items-center w-full">
                        <span>{horario}</span>
                        <span className="text-xs text-gray-400 ml-2 flex items-center gap-1">
                          {loadingDisponibilidad ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Cargando...
                            </>
                          ) : (
                            `${disponibles} mesas disponibles`
                          )}
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors.horario && <p className="text-red-400 text-sm font-medium">{errors.horario}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cantidad" className="text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              Cantidad de personas <span className="text-gray-400 text-sm">(máximo 20)</span>
            </Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              max="20"
              value={formData.cantidad_personas}
              onChange={(e) => handleInputChange("cantidad_personas", e.target.value)}
              className={`bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 ${
                errors.cantidad_personas ? 'border-red-500 focus:border-red-500' : ''
              }`}
              placeholder="¿Cuántas personas?"
              onKeyDown={(e) => handleKeyDown(e, "cantidad_personas")}
            />
            {formData.cantidad_personas && Number.parseInt(formData.cantidad_personas) > 0 && !errors.cantidad_personas && (
              <p className="text-xs text-purple-300">
                Esta reserva ocupará {Math.ceil(Number.parseInt(formData.cantidad_personas) / 4)} mesa{Math.ceil(Number.parseInt(formData.cantidad_personas) / 4) !== 1 ? 's' : ''}
                (máximo 4 personas por mesa)
              </p>
            )}
            {errors.cantidad_personas && <p className="text-red-400 text-sm font-medium">{errors.cantidad_personas}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas" className="text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Notas adicionales <span className="text-gray-400 text-sm">(opcional)</span>
            </Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => handleInputChange("notas", e.target.value)}
              className={`bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 resize-none ${
                errors.notas ? 'border-red-500 focus:border-red-500' : ''
              }`}
              placeholder="Solicitudes especiales, alergias, celebraciones, etc."
              rows={3}
              maxLength={500}
              onKeyDown={(e) => handleKeyDown(e, "notas")}
            />
            <div className="flex justify-between items-center">
              {errors.notas && <p className="text-red-400 text-sm font-medium">{errors.notas}</p>}
              <p className="text-xs text-gray-400 ml-auto">
                {formData.notas.length}/500 caracteres
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className={`w-full font-semibold py-3 transition-all duration-200 ${
              isFormComplete
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300 cursor-not-allowed'
            }`}
            disabled={isSubmitting || loadingDisponibilidad || !isFormComplete}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </div>
            ) : !isFormComplete ? (
              "Completa todos los campos obligatorios"
            ) : (
              "Confirmar Reserva"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
