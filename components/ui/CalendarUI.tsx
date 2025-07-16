"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type Reserva } from "@/lib/storage"
import { motion } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight, Clock, Copy, Info, Loader2, Phone, User, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

interface CalendarUIProps {
  isAdmin: boolean
  allReservas: Reserva[]
  loading: boolean
  onDeleteReserva?: (id: string, nombre: string) => Promise<void>
}

export function CalendarUI({ isAdmin, allReservas, loading, onDeleteReserva }: CalendarUIProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  const horarios = useMemo(() => ["20:15", "22:30"], [])

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
      <div className="space-y-8 p-2 sm:p-4 w-full max-w-none font-source-sans">
        {/* Calendario Principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          {/* Fondo con imagen */}
          <div className="absolute inset-0 rounded-xl overflow-hidden" style={{ minHeight: '100%' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-orange-900/50"></div>
          </div>

          <Card className="relative overflow-hidden bg-transparent border-2 border-orange-500/40 backdrop-blur-xl shadow-2xl">
            <CardHeader className="relative z-10 bg-gradient-to-r from-orange-500/25 to-red-500/20 border-b-2 border-orange-500/40 backdrop-blur-md px-2 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-legquinne font-normal">
                      <div className="p-2 bg-gradient-to-br from-orange-500/25 to-red-500/20 rounded-xl border-2 border-orange-400/40 shadow-lg">
                        <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-orange-200" />
                      </div>
                      <span className="block leading-tight">Calendario<br className="sm:hidden" />de Reservas</span>
                      {loading && <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-orange-400" />}
                    </CardTitle>
                    <CardDescription className="text-white/95 text-sm sm:text-lg font-medium mt-1 leading-tight">
                      Selecciona una fecha para ver disponibilidad{isAdmin ? " y gestionar reservas" : ""}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-8 relative z-10">
              {/* Navegación del mes */}
              <div className="flex items-center justify-between mb-4 sm:mb-8">
                <Button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="group relative overflow-hidden bg-black/70 border-2 border-orange-500/40 text-orange-200 hover:bg-gradient-to-r hover:from-orange-500/40 hover:to-red-500/30 hover:border-orange-400/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:scale-105 backdrop-blur-md px-2 py-2 sm:px-4 sm:py-3 rounded-xl"
                  disabled={loading}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <h3 className="text-xl sm:text-3xl font-bold font-legquinne text-transparent bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text drop-shadow-lg">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <Button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="group relative overflow-hidden bg-black/70 border-2 border-orange-500/40 text-orange-200 hover:bg-gradient-to-r hover:from-orange-500/40 hover:to-red-500/30 hover:border-orange-400/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:scale-105 backdrop-blur-md px-2 py-2 sm:px-4 sm:py-3 rounded-xl"
                  disabled={loading}
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 sm:gap-3 mb-2 sm:mb-6">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs sm:text-base font-bold text-orange-200 py-2 sm:py-4 bg-black/60 rounded-xl border-2 border-orange-500/30 backdrop-blur-md shadow-lg">
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-1 sm:gap-3">
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
                        try {
                          setSelectedDate(dateStr)
                        } catch (error) {
                          console.error('Error al seleccionar fecha:', error)
                        }
                      }}
                      disabled={pastDate || loading || diaSinPlazas || isDayClosed}
                      className={`h-10 sm:h-16 rounded-xl text-xs sm:text-base font-bold transition-all duration-300 relative overflow-hidden group backdrop-blur-md shadow-lg
                        ${isSelected ?
                          "bg-gradient-to-br from-orange-600/90 to-red-600/80 text-white shadow-xl shadow-orange-500/40 scale-110 border-2 border-orange-300/60 backdrop-blur-md" :
                          pastDate || isDayClosed ?
                            "text-gray-500 cursor-not-allowed bg-black/30 border border-gray-600/30" :
                            diaSinPlazas ?
                              "text-gray-500 cursor-not-allowed bg-black/30 border border-red-600/40 opacity-60" :
                              todayClass ?
                                "bg-gradient-to-br from-orange-500/50 to-red-500/40 text-orange-100 border-2 border-orange-400/60 shadow-lg shadow-orange-500/30 hover:scale-110" :
                                "text-white bg-black/60 hover:bg-gradient-to-br hover:from-orange-500/40 hover:to-red-500/30 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/20 border-2 border-orange-500/30 hover:border-orange-400/50"
                        }`}>
                      <span className="relative z-10">{day}</span>

                      {/* Indicador de reservas */}
                      {reservasCount > 0 && !pastDate && !isDayClosed && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-7 sm:h-7 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-[10px] sm:text-sm flex items-center justify-center text-white font-bold shadow-xl animate-pulse z-20 border-2 border-red-300/50">
                          {reservasCount}
                        </div>
                      )}

                      {/* Indicador de sin plazas */}
                      {diaSinPlazas && !pastDate && !isDayClosed && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <span className="text-xs sm:text-sm font-bold text-red-400 bg-black/80 rounded px-1">Sin plazas</span>
                        </div>
                      )}

                      {/* Indicador de cerrado */}
                      {isDayClosed && !pastDate && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <span className="text-xs sm:text-sm font-bold text-gray-400 bg-black/80 rounded px-1">Cerrado</span>
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-red-900/50"></div>
            </div>

            <Card className="relative overflow-hidden bg-transparent border-2 border-orange-500/40 backdrop-blur-xl shadow-2xl">
              <CardHeader className="relative z-10 bg-gradient-to-r from-red-500/25 to-orange-500/20 border-b-2 border-orange-500/40 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <CardTitle className="text-white flex items-center gap-3 text-2xl font-legquinne font-normal">
                        <div className="p-2.5 bg-gradient-to-br from-red-500/25 to-orange-500/20 rounded-xl border-2 border-red-400/40 shadow-lg">
                          <Clock className="w-7 h-7 text-red-200" />
                        </div>
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-AR", {
                          weekday: "long", year: "numeric", month: "long", day: "numeric"
                        })}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                {reservasDelDia.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-500/25 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2  shadow-lg">
                      <Calendar className="w-12 h-12 text-orange-300" />
                    </div>
                    <p className="text-white/90 text-2xl font-legquinne font-medium mb-2">No hay reservas para esta fecha</p>
                    <p className="text-white/70 text-lg">¡Perfecto para nuevas reservas!</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {/* Info para usuarios no admin */}
                    {!isAdmin && (
                      <div className="flex justify-center">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-orange-500/80 to-red-500/80 text-white px-3 py-1 rounded font-bold text-xs flex items-center gap-1 border border-orange-400/30 hover:from-orange-600/90 hover:to-red-600/90 transition-all duration-300"
                          style={{ minWidth: 0 }}
                        >
                          <Info className="w-4 h-4 text-orange-200" />
                          Turnos: 20:15 y 22:30 (30p c/u). Barra libre
                        </Button>
                      </div>
                    )}

                    {/* Disponibilidad por horario */}
                    <div>
                      <h4 className="text-white font-bold text-lg sm:text-2xl mb-4 mt-4 sm:mb-8 flex items-center gap-2 sm:gap-3 font-legquinne">
                        <div className="w-2 h-6 sm:w-3 sm:h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full shadow-lg"></div>
                        <span className="leading-tight">Disponibilidad<br className='sm:hidden' />por horario</span>
                      </h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                        {horarios.map((horario) => {
                          const disponibles = disponibilidadPorHorario[horario] ?? "-"
                          const reservasEnHorario = reservasDelDia.filter(r => r.horario === horario)
                          const personasEnHorario = reservasEnHorario.reduce((acc, r) => acc + r.cantidad_personas, 0)
                          const limiteTotal = 30
                          const ocupacion = typeof disponibles === "number" ? ((limiteTotal - disponibles) / limiteTotal) * 100 : 0

                          return (
                            <div key={horario} className="bg-black/70 rounded-xl p-4 border-2 border-orange-500/40 hover:border-orange-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20 backdrop-blur-md hover:scale-105">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-white font-bold text-xl">{horario}</span>
                                <Badge
                                  className={`text-sm font-bold px-4 py-2 rounded-lg shadow-lg ${typeof disponibles === "number" && disponibles > (limiteTotal * 0.7) ?
                                    "bg-green-500/25 text-green-200 border-2 border-green-500/40" :
                                    typeof disponibles === "number" && disponibles > (limiteTotal * 0.3) ?
                                      "bg-yellow-500/25 text-yellow-200 border-2 border-yellow-500/40" :
                                      "bg-red-500/25 text-red-200 border-2 border-red-500/40"
                                    }`}
                                >
                                  {disponibles}/{limiteTotal} libres
                                </Badge>
                              </div>

                              {/* Barra de ocupación */}
                              <div className="w-full bg-black/60 rounded-full h-3 mb-4 overflow-hidden border-2 border-orange-500/30 shadow-inner">
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
                                    <div className="p-1.5 bg-orange-500/20 rounded-lg border border-orange-400/30">
                                      <Users className="w-5 h-5 text-orange-300" />
                                    </div>
                                    <span className="text-orange-200 font-semibold">
                                      {reservasEnHorario.length} reserva{reservasEnHorario.length !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  <div className="text-base text-white/90 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                                    <strong>{personasEnHorario}</strong> personas total
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 text-base text-white/60">
                                  <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                                  Sin reservas
                                </div>
                              )}
                            </div>
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
