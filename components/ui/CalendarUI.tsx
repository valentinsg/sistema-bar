"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type Reserva } from "@/lib/storage"
import { motion } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight, Clock, Copy, Info, Loader2, Phone, User, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

interface CalendarUIProps {
  isAdmin: boolean
  allReservas: Reserva[]
  loading: boolean
  onDeleteReserva?: (id: string, nombre: string) => Promise<void>
  selectedDate?: string
  selectedTime?: string
  onDateSelect?: (date: string) => void
  onTimeSelect?: (time: string) => void
}

export function CalendarUI({
  isAdmin,
  allReservas,
  loading,
  onDeleteReserva,
  selectedDate: externalSelectedDate,
  selectedTime: externalSelectedTime,
  onDateSelect,
  onTimeSelect
}: CalendarUIProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (externalSelectedDate) return externalSelectedDate
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  const horarios = useMemo(() => ["20:15", "22:30"], [])

  // Sincronizar con fecha externa
  useEffect(() => {
    if (externalSelectedDate && externalSelectedDate !== selectedDate) {
      setSelectedDate(externalSelectedDate)
    }
  }, [externalSelectedDate, selectedDate])

  // Función para copiar al portapapeles
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("¡Copiado al portapapeles!", {
        description: text,
        duration: 2000,
      })
    } catch (err) {
      console.error('Error al copiar:', err)
      toast.error("Error al copiar", {
        description: "No se pudo copiar al portapapeles",
        duration: 2000,
      })
    }
  }

  // Función para truncar email
  const truncateEmail = (email: string, maxLength: number = 20) => {
    if (email.length <= maxLength) return email
    return email.substring(0, maxLength) + '...'
  }

  // Funciones auxiliares
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null)
    for (let day = 1; day <= daysInMonth; day++) days.push(day)

    return days
  }

  const formatDateString = (day: number) => {
    const year = currentDate.getFullYear()
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0")
    const dayStr = day.toString().padStart(2, "0")
    return `${year}-${month}-${dayStr}`
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isPastDate = (day: number) => {
    const today = new Date()
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const dayNormalized = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate())

    return dayNormalized < todayNormalized
  }

  // Función para determinar el turno de un horario
  const getTurno = (horario: string): 'primer' | 'segundo' => {
    const hora = parseInt(horario.split(':')[0])

    // Primer turno: 20:00 a 21:59
    if (hora >= 20 && hora < 22) {
      return 'primer'
    }
    // Segundo turno: 22:00 a 00:00
    if (hora >= 22 || hora === 0) {
      return 'segundo'
    }

    return 'primer' // fallback
  }

  // Memoizar datos calculados para evitar recálculos innecesarios
  const reservasPorDia = useMemo(() => {
    const fechasEnMes = getDaysInMonth(currentDate)
      .filter((d): d is number => d !== null)
      .map((day) => formatDateString(day))

    const nuevasReservas: Record<string, number> = {}
    fechasEnMes.forEach((fecha) => {
      nuevasReservas[fecha] = allReservas.filter((r) => r.fecha === fecha).length
    })
    return nuevasReservas
  }, [allReservas, currentDate])

  const reservasDelDia = useMemo(() => {
    return allReservas.filter((r) => r.fecha === selectedDate)
  }, [allReservas, selectedDate])

  const isClosedDay = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00'); // Agregar hora para evitar problemas de zona horaria
    const day = date.getDay();
    console.log(`Fecha: ${dateStr}, Día de semana: ${day}, ¿Es domingo? ${day === 0}`);
    return day === 0; // Cerrado domingos (0 = domingo)
  }

  const disponibilidadPorHorario = useMemo(() => {
    const LIMITE_POR_TURNO = 30

    const nuevaDisponibilidad: Record<string, number> = {}
    horarios.forEach(horario => {
      const reservasEnHorario = reservasDelDia.filter(r => r.horario === horario)
      const personasEnHorario = reservasEnHorario.reduce((acc, r) => acc + (r.cantidad_personas || 0), 0)
      nuevaDisponibilidad[horario] = Math.max(0, LIMITE_POR_TURNO - personasEnHorario)
    })
    return nuevaDisponibilidad
  }, [reservasDelDia, horarios])

  const diaSinPlazas = horarios.every(horario => disponibilidadPorHorario[horario] <= 0)

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  return (
    <TooltipProvider>
      <div className="space-y-6 p-2 sm:p-4 w-full max-w-none">
        {/* Calendario Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="bg-gradient-to-br from-amber-950/90 to-orange-950/90 border-2 border-amber-600/50 shadow-2xl">
            <CardHeader className="border-b border-amber-600/30 px-4 py-3 bg-gradient-to-r from-amber-900/30 to-orange-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-600/30 rounded-lg border border-amber-500/50">
                    <Calendar className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="font-legquinne text-amber-100 text-lg sm:text-xl font-semibold">
                      Calendario de Reservas
                      {loading && <Loader2 className="w-5 h-5 animate-spin text-amber-400 inline ml-2" />}
                    </CardTitle>
                    <CardDescription className="font-source-sans text-amber-300 text-sm">
                      Selecciona una fecha para ver disponibilidad{isAdmin ? " y gestionar reservas" : ""}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {/* Navegación del mes */}
              <div className="flex items-center justify-between mb-6">
                <Button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="bg-amber-950/70 border-2 border-amber-700/50 text-amber-300 hover:bg-amber-900/70 hover:text-amber-100 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={loading}
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="font-legquinne text-xl sm:text-2xl font-bold text-amber-100">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <Button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="bg-amber-950/70 border-2 border-amber-700/50 text-amber-300 hover:bg-amber-900/70 hover:text-amber-100 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={loading}
                  size="sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map((day) => (
                  <div key={day} className="font-source-sans text-center text-sm font-semibold text-amber-300 py-2 bg-amber-950/50 border border-amber-700/40 rounded-lg">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth(currentDate).map((day, index) => {
                  if (day === null) return <div key={`empty-${index}`} className="h-10 sm:h-16" />
                  const dateStr = formatDateString(day)
                  const reservasCount = reservasPorDia[dateStr] || 0
                  const isSelected = selectedDate === dateStr
                  const todayClass = isToday(day)
                  const pastDate = isPastDate(day)

                  // Calcular si el día está lleno usando la nueva lógica de turnos
                  const reservasDelDiaSeleccionada = allReservas.filter(r => r.fecha === dateStr) || []
                  const disponibilidadDelDia: Record<string, number> = {}
                  horarios.forEach(horario => {
                    const reservasEnHorario = reservasDelDiaSeleccionada.filter(r => r.horario === horario)
                    const personasEnHorario = reservasEnHorario.reduce((acc, r) => acc + (r.cantidad_personas || 0), 0)
                    disponibilidadDelDia[horario] = Math.max(0, 30 - personasEnHorario)
                  })
                  const diaSinPlazas = horarios.every(horario => disponibilidadDelDia[horario] <= 0)
                  const isDayClosed = isClosedDay(dateStr)

                  return (
                    <button
                      key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`}
                      onClick={() => {
                        setSelectedDate(dateStr)
                        onDateSelect?.(dateStr)
                      }}
                      disabled={pastDate || loading || diaSinPlazas || isDayClosed}
                      className={`font-source-sans h-12 sm:h-16 rounded-lg text-sm font-semibold transition-all duration-200 relative
                        ${isSelected ?
                          "bg-gradient-to-br from-amber-600 to-orange-600 text-white border-2 border-amber-400 shadow-lg" :
                          pastDate || isDayClosed ?
                            "text-amber-700 cursor-not-allowed bg-amber-950/30 border border-amber-800/50" :
                            diaSinPlazas ?
                              "text-amber-700 cursor-not-allowed bg-amber-950/30 border border-amber-800/50 opacity-50" :
                              todayClass ?
                                "bg-amber-600/30 text-amber-100 border-2 border-amber-500 shadow-md" :
                                "text-amber-200 bg-amber-950/60 hover:bg-amber-900/70 border border-amber-700/60 hover:border-amber-500"
                        }`}>
                      <span>{day}</span>

                      {/* Indicador de reservas */}
                      {reservasCount > 0 && !pastDate && !isDayClosed && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-xs flex items-center justify-center text-white font-bold">
                          {reservasCount}
                        </div>
                      )}

                      {/* Indicador de sin plazas */}
                      {diaSinPlazas && !pastDate && !isDayClosed && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-red-400 bg-gray-900 rounded px-1">Sin plazas</span>
                        </div>
                      )}

                      {/* Indicador de cerrado */}
                      {isDayClosed && !pastDate && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-gray-400 bg-gray-900 rounded px-1">Cerrado</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detalles del día seleccionado */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >

            <Card className="bg-gradient-to-br from-amber-950/90 to-orange-950/90 border-2 border-amber-600/50 shadow-2xl">
              <CardHeader className="border-b border-amber-600/30 bg-gradient-to-r from-amber-900/30 to-orange-900/30">
                <CardTitle className="text-amber-100 flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 bg-amber-600/30 rounded-lg border border-amber-500/50">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-AR", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric"
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {reservasDelDia.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-amber-600/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500/50">
                      <Calendar className="w-8 h-8 text-amber-400" />
                    </div>
                    <p className="text-amber-100 text-lg font-semibold mb-2">No hay reservas para esta fecha</p>
                    <p className="text-amber-300">¡Perfecto para nuevas reservas!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Info para usuarios no admin */}
                    {!isAdmin && (
                      <div className="flex justify-center">
                        <div className="bg-gradient-to-r from-amber-600/30 to-orange-600/30 border-2 border-amber-500/50 rounded-xl px-6 py-3 text-sm text-amber-100 shadow-lg">
                          <Info className="w-4 h-4 inline mr-2" />
                          <span className="font-source-sans font-medium">Turnos: 20:15 y 22:30</span> • 30 plazas por turno • Barra libre
                        </div>
                      </div>
                    )}

                    {/* Disponibilidad por horario */}
                    <div>
                      <h4 className="font-legquinne text-amber-100 font-semibold text-lg mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-amber-500 rounded"></div>
                        Disponibilidad por horario
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
                        {horarios.map((horario) => {
                          const disponibles = disponibilidadPorHorario[horario] ?? "-"
                          const reservasEnHorario = reservasDelDia.filter(r => r.horario === horario)
                          const personasEnHorario = reservasEnHorario.reduce((acc, r) => acc + r.cantidad_personas, 0)
                          const limiteTotal = 30
                          const ocupacion = typeof disponibles === "number" ? ((limiteTotal - disponibles) / limiteTotal) * 100 : 0

                          return (
                                                        <button
                              key={horario}
                              className={`w-full text-left rounded-xl p-5 border-2 transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                                externalSelectedTime === horario
                                  ? 'bg-gradient-to-br from-amber-700/60 to-orange-700/60 border-amber-400 shadow-lg shadow-amber-500/30'
                                  : 'bg-gradient-to-br from-amber-950/80 to-amber-900/60 border-amber-600/50 hover:border-amber-500/70 hover:shadow-amber-500/20'
                              }`}
                              onClick={() => onTimeSelect?.(horario)}
                              disabled={typeof disponibles === "number" && disponibles === 0}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <span className="font-legquinne text-amber-100 font-bold text-xl">{horario}</span>
                                <Badge
                                  className={`text-sm font-bold px-4 py-2 rounded-lg shadow-lg ${typeof disponibles === "number" && disponibles > (limiteTotal * 0.7) ?
                                    "bg-green-600/30 text-green-200 border-2 border-green-500/50" :
                                    typeof disponibles === "number" && disponibles > (limiteTotal * 0.3) ?
                                      "bg-yellow-600/30 text-yellow-200 border-2 border-yellow-500/50" :
                                      "bg-red-600/30 text-red-200 border-2 border-red-500/50"
                                    }`}
                                >
                                  {disponibles}/{limiteTotal} libres
                                </Badge>
                              </div>

                              {/* Barra de ocupación */}
                              <div className="w-full bg-amber-950/60 rounded-full h-3 mb-4 overflow-hidden border-2 border-amber-600/40 shadow-inner">
                                <div
                                  className={`h-full transition-all duration-700 shadow-lg ${ocupacion > 70 ? "bg-gradient-to-r from-red-500 to-red-600" :
                                    ocupacion > 40 ? "bg-gradient-to-r from-yellow-500 to-yellow-600" :
                                      "bg-gradient-to-r from-green-500 to-green-600"
                                    }`}
                                  style={{ width: `${ocupacion}%` }}
                                />
                              </div>

                              {reservasEnHorario.length > 0 ? (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3 text-base">
                                    <div className="p-1.5 bg-amber-600/30 rounded-lg border border-amber-500/40">
                                      <Users className="w-5 h-5 text-amber-300" />
                                    </div>
                                    <span className="text-amber-200 font-semibold">
                                      {reservasEnHorario.length} reserva{reservasEnHorario.length !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  <div className="text-base text-amber-100 bg-amber-900/30 rounded-lg px-3 py-2 border border-amber-600/30">
                                    <strong>{personasEnHorario}</strong> personas total
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 text-base text-white/60">
                                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                                  Sin reservas
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Lista de reservas para admin */}
                    {isAdmin && (
                      <div>
                        <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          <div className="w-2 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
                          Reservas del día ({reservasDelDia.length})
                        </h4>
                        <div className=" overflow-hidden">
                          {/* Header para desktop */}
                          <div className="hidden md:grid grid-cols-4 gap-6 p-2 bg-orange-500/20 border-b border-orange-500/30 text-sm font-semibold text-orange-200 uppercase tracking-wider">
                            <div>Cliente</div>
                            <div>Contacto</div>
                            <div>Horario</div>
                            <div>Personas</div>
                          </div>

                          {/* Desktop: tabla con divisores, Mobile: lista sin divisores */}
                          <div className="hidden md:block divide-y divide-gray-700/50">
                            {reservasDelDia.map((reserva, index) => (
                              <div key={reserva.id} className="hover:bg-orange-500/10 transition-colors duration-200">
                                {/* Vista desktop */}
                                <div className="grid grid-cols-4 gap-6 p-4 items-center">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500/30 to-red-500/20 rounded-full flex items-center justify-center border border-orange-500/40">
                                      <User className="w-5 h-5 text-orange-300" />
                                    </div>
                                    <div>
                                      <p className="text-white font-medium text-base">{reserva.nombre}</p>
                                      <p className="text-orange-200 text-sm">#{index + 1}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 min-w-0">
                                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-gray-300 text-base truncate cursor-pointer">
                                          {truncateEmail(reserva.contacto, 25)}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{reserva.contacto}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(reserva.contacto)}
                                      className="h-8 w-8 p-0 hover:bg-gray-600/50 flex-shrink-0 ml-2"
                                    >
                                      <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-orange-400" />
                                    <span className="text-white font-medium text-base">{reserva.horario}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-blue-400" />
                                    <span className="text-white font-medium text-base">{reserva.cantidad_personas} personas</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Vista mobile - estilo WhatsApp */}
                          <div className="md:hidden">
                            {reservasDelDia.map((reserva, index) => (
                              <div key={reserva.id} className="flex items-center gap-3 py-3 hover:bg-gray-800/30 active:bg-gray-800/50 transition-colors border-b border-gray-700/30 last:border-b-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500/30 to-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-5 h-5 text-orange-300" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-white font-medium text-base truncate">{reserva.nombre}</h3>
                                    <span className="text-orange-300 text-xs font-medium ml-2 flex-shrink-0">#{index + 1}</span>
                                  </div>

                                  <div className="flex items-center gap-2 mb-1">
                                    <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-gray-300 text-sm truncate cursor-pointer flex-1">
                                          {truncateEmail(reserva.contacto, 30)}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{reserva.contacto}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(reserva.contacto)}
                                      className="h-6 w-6 p-0 hover:bg-gray-600/50 flex-shrink-0"
                                    >
                                      <Copy className="w-3 h-3 text-gray-400 hover:text-white" />
                                    </Button>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-orange-400 flex-shrink-0" />
                                      <span className="text-white text-sm font-medium">{reserva.horario}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                      <span className="text-white text-sm">{reserva.cantidad_personas}</span>
                                    </div>
                                  </div>
                                </div>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(reserva.contacto)}
                                  className="h-8 w-8 p-0 hover:bg-gray-600/50 flex-shrink-0"
                                >
                                  <Copy className="w-3 h-3 text-gray-400 hover:text-white" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  )
}
