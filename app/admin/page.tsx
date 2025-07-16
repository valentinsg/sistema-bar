"use client"

import ContadorConfirmacion from "@/components/ContadorConfirmacion"
import ReservationCalendarAdmin from "@/components/ReservationCalendarAdmin"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { deleteReserva, getContador } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import { AnimatePresence, motion } from "framer-motion"
import { Activity, BarChart3, Calendar, Clock, Copy, Download, Edit, ExternalLink, Loader2, LogOut, MessageSquare, Phone, Search, TableIcon, Trash2, TrendingUp, User, Users } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { toast } from "sonner"

interface AdminData {
  id: string
  nombre: string
  user: string
  local_id: string
}

interface PlazasStats {
  plazasTotales: number
  plazasOcupadas: number
  plazasDisponibles: number
  personasTotales: number
  primerTurno: {
    limite: number
    ocupadas: number
    disponibles: number
  }
  segundoTurno: {
    limite: number
    ocupadas: number
    disponibles: number
  }
}

const chartColors = {
  primary: "#F97316", // orange-500
  secondary: "#FED7AA", // orange-200
  accent: "#EA580C", // orange-600
  success: "#10B981", // emerald-500
  warning: "#F59E0B", // amber-500
  danger: "#EF4444", // red-500
  muted: "#64748B", // slate-500
}

// Función auxiliar para calcular estadísticas completas
const calcularEstadisticasCompletas = async (local_id: string, fecha: string): Promise<PlazasStats> => {
  try {
    const LIMITE_POR_TURNO = 30
    const NUM_TURNOS = 2
    const PLAZAS_TOTALES = LIMITE_POR_TURNO * NUM_TURNOS

    // Obtener reservas por horario para calcular turnos
    const { data: reservasDelDia } = await supabase
      .from("reservas")
      .select("horario, cantidad_personas")
      .eq("local_id", local_id)
      .eq("fecha", fecha)

    const reservasPrimerTurno = (reservasDelDia || []).filter(r => r.horario === "20:15")
    const reservasSegundoTurno = (reservasDelDia || []).filter(r => r.horario === "22:30")

    const personasPrimerTurno = reservasPrimerTurno.reduce((acc, r) => acc + r.cantidad_personas, 0)
    const personasSegundoTurno = reservasSegundoTurno.reduce((acc, r) => acc + r.cantidad_personas, 0)
    const personasTotales = personasPrimerTurno + personasSegundoTurno
    const plazasOcupadas = personasTotales

    return {
      plazasTotales: PLAZAS_TOTALES,
      plazasOcupadas,
      plazasDisponibles: Math.max(0, PLAZAS_TOTALES - plazasOcupadas),
      personasTotales,
      primerTurno: {
        limite: 30,
        ocupadas: personasPrimerTurno,
        disponibles: Math.max(0, 30 - personasPrimerTurno)
      },
      segundoTurno: {
        limite: 30,
        ocupadas: personasSegundoTurno,
        disponibles: Math.max(0, 30 - personasSegundoTurno)
      }
    }
  } catch (error) {
    console.error("Error al calcular estadísticas:", error)
    // Retornar valores por defecto en caso de error
    return {
      plazasTotales: 60,
      plazasOcupadas: 0,
      plazasDisponibles: 60,
      personasTotales: 0,
      primerTurno: {
        limite: 30,
        ocupadas: 0,
        disponibles: 30
      },
      segundoTurno: {
        limite: 30,
        ocupadas: 0,
        disponibles: 30
      }
    }
  }
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [reservas, setReservas] = useState<any[]>([])
  const [personasActuales, setPersonasActuales] = useState<number>(0)
  const [plazasStats, setPlazasStats] = useState<PlazasStats>({
    plazasTotales: 60,
    plazasOcupadas: 0,
    plazasDisponibles: 60,
    personasTotales: 0,
    primerTurno: {
      limite: 30,
      ocupadas: 0,
      disponibles: 30
    },
    segundoTurno: {
      limite: 30,
      ocupadas: 0,
      disponibles: 30
    }
  })
  const [loadingStats, setLoadingStats] = useState(false)
  const [editingReserva, setEditingReserva] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: "fecha", direction: "ascending" })
  const [sortedReservas, setSortedReservas] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const router = useRouter()

  // Funciones utilitarias
  const formatDate = (dateString: string) => {
    // Agregar hora para evitar problemas de zona horaria
    return new Date(dateString + 'T12:00:00').toLocaleDateString("es-AR", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatus = (fecha: string, horario: string) => {
    const reservaDateTime = new Date(`${fecha}T${horario}`)
    const now = new Date()

    const reservaDate = new Date(reservaDateTime)
    reservaDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (reservaDate < today) {
      return "Pasada"
    }
    if (reservaDate > today) {
      return "Próxima"
    }
    if (reservaDateTime < now) {
      return "Pasada"
    }
    return "Hoy"
  }

  const getStatusBadge = (fecha: string, horario: string) => {
    const status = getStatus(fecha, horario)
    switch (status) {
      case "Pasada":
        return <Badge variant="secondary" className="bg-slate-600 text-slate-200">Pasada</Badge>
      case "Hoy":
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Hoy</Badge>
      case "Próxima":
        return <Badge className="bg-amber-600 hover:bg-amber-700 text-white">Próxima</Badge>
      default:
        return <Badge variant="secondary">Pasada</Badge>
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('¡Copiado al portapapeles!', {
        description: text.length > 30 ? text.substring(0, 30) + '...' : text,
        duration: 2000,
      })
    } catch (err) {
      console.error('Error al copiar:', err)
      toast.error('Error al copiar')
    }
  }

  const truncateEmail = (email: string, maxLength: number = 25) => {
    if (email.length <= maxLength) return email
    return email.substring(0, maxLength) + '...'
  }

  const downloadCSV = () => {
    const headers = ["ID", "Nombre", "Contacto", "Fecha", "Horario", "Personas", "Creado"]
    const csvContent = [
      headers.join(","),
      ...reservas.map((r) =>
        [
          r.id,
          `"${r.nombre}"`,
          `"${r.contacto}"`,
          r.fecha,
          r.horario,
          r.cantidad_personas,
          new Date(r.created_at).toLocaleString("es-AR"),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `reservas_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handler functions
  const handleVerSitio = () => {
    window.open(window.location.origin, '_blank', 'noopener,noreferrer')
  }

  const handleLogout = async () => {
    if (adminData?.id) {
      await supabase
        .from("usuarios_admin")
        .update({ token_acceso: null })
        .eq("id", adminData.id)
    }

    localStorage.removeItem("admin_session")
    router.push("/admin/login")
  }

  const handleUpdateContador = async (increment: boolean) => {
    if (!adminData?.local_id) return

    const nuevoValor = Math.max(0, personasActuales + (increment ? 1 : -1))
    setPersonasActuales(nuevoValor)

    try {
      const today = new Date().toISOString().split("T")[0]
      const { error } = await supabase
        .from("contador_personas")
        .upsert({
          local_id: adminData.local_id,
          fecha: today,
          cantidad: nuevoValor
        }, {
          onConflict: 'local_id,fecha'
        })

      if (error) {
        console.error("Error al actualizar contador:", error)
        setPersonasActuales(personasActuales)
        toast.error("Error al actualizar el contador")
        return
      }
    } catch (error) {
      console.error("Error al actualizar contador:", error)
      setPersonasActuales(personasActuales)
      toast.error("Error al actualizar el contador")
    }
  }

  const handleBulkUpdateContador = async (changes: number) => {
    if (!adminData?.local_id) return

    const nuevoValor = Math.max(0, personasActuales + changes)
    setPersonasActuales(nuevoValor)

    try {
      const today = new Date().toISOString().split("T")[0]
      const { error } = await supabase
        .from("contador_personas")
        .upsert({
          local_id: adminData.local_id,
          fecha: today,
          cantidad: nuevoValor
        }, {
          onConflict: 'local_id,fecha'
        })

      if (error) {
        console.error("Error al actualizar contador:", error)
        setPersonasActuales(personasActuales)
        toast.error("Error al actualizar el contador")
        return
      }
    } catch (error) {
      console.error("Error al actualizar contador:", error)
      setPersonasActuales(personasActuales)
      toast.error("Error al actualizar el contador")
    }
  }

  const handleResetContador = async () => {
    if (!adminData?.local_id) return

    setPersonasActuales(0)

    try {
      const today = new Date().toISOString().split("T")[0]
      const { error } = await supabase
        .from("contador_personas")
        .upsert({
          local_id: adminData.local_id,
          fecha: today,
          cantidad: 0
        }, {
          onConflict: 'local_id,fecha'
        })

      if (error) {
        console.error("Error al resetear contador:", error)
        toast.error("Error al resetear el contador")
        return
      }
    } catch (error) {
      console.error("Error al resetear contador:", error)
      toast.error("Error al resetear el contador")
    }
  }

  const handleDeleteReserva = async (id: string, nombre: string) => {
    const success = await deleteReserva(id)
    if (success) {
      setReservas(prev => prev.filter(r => r.id !== id))
      if (adminData?.local_id) {
        const today = new Date().toISOString().split("T")[0]
        const stats = await calcularEstadisticasCompletas(adminData.local_id, today)
        setPlazasStats(stats)
      }
      toast.success(`Reserva de ${nombre} eliminada`)
    } else {
      toast.error("Error al eliminar la reserva")
    }
  }

  const handleEditReserva = async (reservaData: any) => {
    if (!adminData?.local_id) return

    if (reservaData.cantidad_personas > 20) {
      toast.error("El máximo de personas por reserva es 20")
      return
    }

    try {
      const { error } = await supabase
        .from("reservas")
        .update({
          nombre: reservaData.nombre,
          contacto: reservaData.contacto,
          fecha: reservaData.fecha,
          horario: reservaData.horario,
          cantidad_personas: reservaData.cantidad_personas,
          notas: reservaData.notas
        })
        .eq("id", editingReserva.id)
        .eq("local_id", adminData.local_id)

      if (error) {
        console.error("Error al actualizar reserva:", error)
        toast.error("Error al actualizar la reserva")
        return
      }

      const { data: reservasData } = await supabase
        .from("reservas")
        .select("*")
        .eq("local_id", adminData.local_id)

      setReservas(reservasData || [])
      setIsEditDialogOpen(false)
      setEditingReserva(null)

      toast.success("Reserva actualizada correctamente")
    } catch (error) {
      console.error("Error al actualizar reserva:", error)
      toast.error("Error al actualizar la reserva")
    }
  }

  // Datos para los gráficos
  const chartData = useMemo(() => {
    const today = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const reservasDelDia = reservas.filter(r => r.fecha === dateStr)
      const personasDelDia = reservasDelDia.reduce((acc, r) => acc + r.cantidad_personas, 0)

      return {
        fecha: date.toLocaleDateString("es-AR", { month: "short", day: "numeric" }),
        reservas: reservasDelDia.length,
        personas: personasDelDia
      }
    }).reverse()

    return last7Days
  }, [reservas])

  const turnosData = useMemo(() => {
    // Validar que plazasStats tenga las propiedades necesarias
    if (!plazasStats.primerTurno || !plazasStats.segundoTurno) {
      return [
        { name: "20:15", value: 0, total: 30, color: chartColors.primary },
        { name: "22:30", value: 0, total: 30, color: chartColors.accent }
      ]
    }

    return [
      {
        name: "20:15",
        value: plazasStats.primerTurno.ocupadas || 0,
        total: plazasStats.primerTurno.limite || 30,
        color: chartColors.primary
      },
      {
        name: "22:30",
        value: plazasStats.segundoTurno.ocupadas || 0,
        total: plazasStats.segundoTurno.limite || 30,
        color: chartColors.accent
      }
    ]
  }, [plazasStats])

  const statusData = useMemo(() => {
    const hoy = reservas.filter(r => getStatus(r.fecha, r.horario) === "Hoy").length
    const proximas = reservas.filter(r => getStatus(r.fecha, r.horario) === "Próxima").length

    return [
      { name: "Hoy", value: hoy, color: chartColors.success },
      { name: "Próximas", value: proximas, color: chartColors.warning }
    ]
  }, [reservas])

  // Filtrar reservas por búsqueda
  const filteredReservas = useMemo(() => {
    if (!searchTerm) return sortedReservas

    return sortedReservas.filter(reserva =>
      reserva.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [sortedReservas, searchTerm])

  useEffect(() => {
    const verificarAutenticacion = async () => {
      const sessionDataString = localStorage.getItem("admin_session")

      if (!sessionDataString) {
        router.replace("/admin/login")
        return
      }

      try {
        const sessionData = JSON.parse(sessionDataString)
        const now = Date.now()

        if (now > sessionData.expires) {
          console.log("Sesión expirada")
          localStorage.removeItem("admin_session")
          router.replace("/admin/login")
          return
        }

        const { data: adminDbData, error } = await supabase
          .from("usuarios_admin")
          .select("id, nombre, user, local_id, token_acceso")
          .eq("id", sessionData.user.id)
          .eq("token_acceso", sessionData.token)
          .single()

        if (error || !adminDbData) {
          console.error("Token inválido o expirado:", error)
          localStorage.removeItem("admin_session")
          router.replace("/admin/login")
          return
        }

        setAdminData(sessionData.user)
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        localStorage.removeItem("admin_session")
        router.replace("/admin/login")
      }
    }

    verificarAutenticacion()
  }, [router])

  useEffect(() => {
    if (!adminData?.local_id) return

    const cargarDatos = async () => {
      setLoadingStats(true)
      try {
        const today = new Date().toISOString().split("T")[0]

        const { data: reservasData } = await supabase
          .from("reservas")
          .select("*")
          .eq("local_id", adminData.local_id)

        const contadorData = await getContador(adminData.local_id)
        const stats = await calcularEstadisticasCompletas(adminData.local_id, today)

        setReservas(reservasData || [])
        setPersonasActuales(contadorData)
        setPlazasStats(stats)
      } finally {
        setLoadingStats(false)
        setLoading(false)
      }
    }

    cargarDatos()

    const reservasSubscription = supabase
      .channel('reservas_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservas',
          filter: `local_id=eq.${adminData.local_id}`
        },
        () => {
          cargarDatos()
        }
      )
      .subscribe()

    const contadorSubscription = supabase
      .channel('contador_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contador_personas',
          filter: `local_id=eq.${adminData.local_id}`
        },
        (payload) => {
          if (payload.new && 'cantidad' in payload.new) {
            setPersonasActuales(payload.new.cantidad as number)
          }
        }
      )
      .subscribe()

    return () => {
      reservasSubscription.unsubscribe()
      contadorSubscription.unsubscribe()
    }
  }, [adminData])

  useEffect(() => {
    let sorted = [...reservas]

    sorted.sort((a, b) => {
      const aStatus = getStatus(a.fecha, a.horario)
      const bStatus = getStatus(b.fecha, b.horario)
      const aDate = new Date(`${a.fecha}T${a.horario}`).getTime()
      const bDate = new Date(`${b.fecha}T${b.horario}`).getTime()

      const statusPriority = { "Hoy": 0, "Próxima": 1, "Pasada": 2 }

      if (statusPriority[aStatus] < statusPriority[bStatus]) return -1
      if (statusPriority[aStatus] > statusPriority[bStatus]) return 1

      if (aStatus === "Pasada") {
        return bDate - aDate
      }
      return aDate - bDate
    })

    setSortedReservas(sorted)
  }, [reservas, sortConfig])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Image
            src="/logo-eleven.webp"
            alt="Eleven Club"
            width={80}
            height={80}
            className="mx-auto opacity-80"
          />
          <div className="flex items-center gap-3 text-amber-100">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-legquinne text-xl">Cargando dashboard...</span>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-[url('/FONDOS-01.webp')] bg-cover bg-center opacity-3 pointer-events-none" />
        <div className="fixed inset-0 bg-gradient-to-br from-amber-500/8 via-slate-900/50 to-orange-500/8 pointer-events-none" />
        <div className="fixed inset-0 bg-slate-950/20 pointer-events-none" />

        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-900/80 backdrop-blur-xl border-b border-amber-500/20 sticky top-0 z-50"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Image
                      src="/logo-eleven.webp"
                      alt="Eleven Club"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-legquinne text-amber-100 font-bold">
                      Eleven Dashboard
                    </h1>
                    <p className="text-amber-300/70 text-sm">
                      Bienvenido, {adminData?.nombre}
                    </p>
                  </div>
                </div>

                <Separator orientation="vertical" className="h-12 bg-amber-500/20" />

                <div className="flex items-center space-x-2 bg-slate-800/50 rounded-full px-4 py-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-emerald-300 text-sm font-medium">
                    {personasActuales} personas en vivo
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={downloadCSV}
                  disabled={reservas.length === 0}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>

                <Button
                  onClick={handleVerSitio}
                  variant="outline"
                  className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Sitio
                </Button>

                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir
                </Button>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto p-6 space-y-8">
          {/* Quick Stats Cards - Removing Revenue Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Live Counter Card */}
            <Card className="bg-slate-800/70 border-amber-500/30 backdrop-blur-xl relative overflow-hidden group hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-300">
                  Personas en Vivo
                </CardTitle>
                <div className="relative">
                  <Activity className="h-5 w-5 text-amber-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-legquinne font-bold text-white mb-2">
                  {personasActuales}
                </div>
                <div className="flex items-center space-x-2">
                  <ContadorConfirmacion
                    personasActuales={personasActuales}
                    onIncrementAction={() => handleUpdateContador(true)}
                    onDecrementAction={() => handleUpdateContador(false)}
                    onResetAction={handleResetContador}
                    onBulkUpdateAction={handleBulkUpdateContador}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Occupancy Rate */}
            <Card className="bg-slate-800/70 border-emerald-500/30 backdrop-blur-xl relative overflow-hidden group hover:scale-105 transition-all duration-300 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-300">
                  Ocupación Hoy
                </CardTitle>
                <Users className="h-5 w-5 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-legquinne font-bold text-white">
                  {Math.round((plazasStats.plazasOcupadas / plazasStats.plazasTotales) * 100)}%
                </div>
                <Progress
                  value={(plazasStats.plazasOcupadas / plazasStats.plazasTotales) * 100}
                  className="h-2 bg-slate-700"
                />
                <div className="text-xs text-emerald-200 mt-1">
                  {plazasStats.plazasOcupadas}/{plazasStats.plazasTotales} plazas
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Trend Chart */}
            <Card className="lg:col-span-2 bg-slate-800/70 border-amber-500/30 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-100 font-legquinne flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  Tendencia de Reservas (7 días)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    reservas: { label: "Reservas", color: chartColors.primary },
                    personas: { label: "Personas", color: chartColors.secondary }
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="reservas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="fecha"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#FED7AA', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#FED7AA', fontSize: 12 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="reservas"
                        stroke={chartColors.primary}
                        fillOpacity={1}
                        fill="url(#reservas)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Turnos Distribution */}
            <Card className="bg-slate-800/70 border-amber-500/30 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-amber-100 font-legquinne flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Distribución por Turno
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { label: "Ocupadas", color: chartColors.primary }
                  }}
                  className="h-[250px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={turnosData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {turnosData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {turnosData.map((turno, index) => (
                    <div key={index} className="text-center">
                      <div className="text-lg font-legquinne text-white">
                        {turno.name}
                      </div>
                      <div className="text-sm text-amber-200">
                        {turno.value}/{turno.total}
                      </div>
                      <Progress
                        value={(turno.value / turno.total) * 100}
                        className="h-1 mt-1"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="reservas" className="space-y-6">
              <TabsList className="bg-slate-800/50 border border-amber-500/20 backdrop-blur-xl">
                <TabsTrigger
                  value="reservas"
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-legquinne"
                >
                  <TableIcon className="w-4 h-4 mr-2" />
                  Reservas ({filteredReservas.length})
                </TabsTrigger>
                <TabsTrigger
                  value="calendario"
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-legquinne"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Vista Calendario
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-legquinne"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Análisis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reservas" className="space-y-0">
                <Card className="bg-slate-800/70 border-amber-500/30 backdrop-blur-xl shadow-xl">
                  <CardHeader className="border-b border-amber-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-amber-100 font-legquinne text-xl">
                          Gestión de Reservas
                        </CardTitle>
                        <CardDescription className="text-amber-300/70">
                          Administra todas las reservas del local
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-4 h-4" />
                          <Input
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64 bg-slate-700/50 border-amber-500/30 text-amber-100 placeholder:text-amber-400/60 focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {filteredReservas.length === 0 ? (
                      <div className="text-center py-16 text-amber-300/70">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="space-y-4"
                        >
                          {searchTerm ? (
                            <>
                              <Search className="w-20 h-20 mx-auto opacity-30" />
                              <div>
                                <p className="text-xl font-legquinne">No se encontraron reservas</p>
                                <p className="text-sm">No hay reservas que coincidan con "{searchTerm}"</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Calendar className="w-20 h-20 mx-auto opacity-30" />
                              <div>
                                <p className="text-xl font-legquinne">No hay reservas registradas</p>
                                <p className="text-sm">Las nuevas reservas aparecerán aquí automáticamente</p>
                              </div>
                            </>
                          )}
                        </motion.div>
                      </div>
                    ) : (
                      <div className="overflow-hidden">
                        <div className="overflow-x-auto max-h-[600px]">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-amber-500/20 hover:bg-amber-500/5">
                                <TableHead className="text-amber-300 font-legquinne">Estado</TableHead>
                                <TableHead className="text-amber-300 font-legquinne">Fecha</TableHead>
                                <TableHead className="text-amber-300 font-legquinne">Horario</TableHead>
                                <TableHead className="text-amber-300 font-legquinne">Cliente</TableHead>
                                <TableHead className="text-amber-300 font-legquinne">Contacto</TableHead>
                                <TableHead className="text-amber-300 font-legquinne">Personas</TableHead>
                                <TableHead className="text-amber-300 font-legquinne">Notas</TableHead>
                                <TableHead className="text-amber-300 font-legquinne">Registrado</TableHead>
                                <TableHead className="text-amber-300 font-legquinne text-center">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <AnimatePresence>
                                {filteredReservas.map((r, index) => (
                                  <motion.tr
                                    key={r.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                                  >
                                    <TableCell>{getStatusBadge(r.fecha, r.horario)}</TableCell>
                                    <TableCell className="text-amber-100">
                                      <div className="font-medium">
                                        {formatDate(r.fecha)}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-amber-100">
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-400" />
                                        <span className="font-medium">{r.horario}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-white">
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                                          <User className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-medium">{r.nombre}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-amber-100">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span className="cursor-pointer truncate hover:text-amber-200 transition-colors">
                                              {truncateEmail(r.contacto)}
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{r.contacto}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => copyToClipboard(r.contacto)}
                                          className="h-6 w-6 p-0 hover:bg-amber-500/20 flex-shrink-0"
                                        >
                                          <Copy className="w-3 h-3 text-amber-400 hover:text-amber-200" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-amber-100">
                                      <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
                                        <Users className="w-3 h-3 mr-1" />
                                        {r.cantidad_personas}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-amber-100 max-w-48">
                                      {r.notas ? (
                                        <div className="flex items-start gap-2">
                                          <MessageSquare className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                          <div className="text-sm">
                                            <p className="text-amber-200 line-clamp-2 break-words">
                                              {r.notas}
                                            </p>
                                            {r.notas.length > 60 && (
                                              <button
                                                className="text-yellow-400 hover:text-yellow-300 text-xs mt-1 transition-colors"
                                                onClick={() => {
                                                  toast.info("Nota completa", { description: r.notas })
                                                }}
                                              >
                                                Ver completo
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-amber-500/50 text-sm italic">Sin notas</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-amber-300/70 text-sm">
                                      {new Date(r.created_at).toLocaleDateString("es-AR")}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <div className="flex gap-1 justify-center">
                                        <Dialog open={isEditDialogOpen && editingReserva?.id === r.id} onOpenChange={(open) => {
                                          setIsEditDialogOpen(open)
                                          if (!open) setEditingReserva(null)
                                        }}>
                                          <DialogTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-8 w-8 p-0 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                                              onClick={() => setEditingReserva(r)}
                                            >
                                              <Edit className="w-4 h-4" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="bg-slate-800 border-amber-500/20 text-white max-w-2xl">
                                            <DialogHeader>
                                              <DialogTitle className="font-legquinne text-amber-100">
                                                Editar Reserva
                                              </DialogTitle>
                                              <DialogDescription className="text-amber-300/70">
                                                Modifica los datos de la reserva de {editingReserva?.nombre}
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                              <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="nombre" className="text-right text-amber-300">
                                                  Nombre
                                                </Label>
                                                <Input
                                                  id="nombre"
                                                  value={editingReserva?.nombre || ""}
                                                  onChange={(e) => setEditingReserva((prev: any) => ({ ...prev, nombre: e.target.value }))}
                                                  className="col-span-3 bg-slate-700 border-amber-500/30 text-white"
                                                />
                                              </div>
                                              <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="contacto" className="text-right text-amber-300">
                                                  Contacto
                                                </Label>
                                                <Input
                                                  id="contacto"
                                                  value={editingReserva?.contacto || ""}
                                                  onChange={(e) => setEditingReserva((prev: any) => ({ ...prev, contacto: e.target.value }))}
                                                  className="col-span-3 bg-slate-700 border-amber-500/30 text-white"
                                                />
                                              </div>
                                              <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="fecha" className="text-right text-amber-300">
                                                  Fecha
                                                </Label>
                                                <Input
                                                  id="fecha"
                                                  type="date"
                                                  value={editingReserva?.fecha || ""}
                                                  onChange={(e) => setEditingReserva((prev: any) => ({ ...prev, fecha: e.target.value }))}
                                                  className="col-span-3 bg-slate-700 border-amber-500/30 text-white"
                                                />
                                              </div>
                                              <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="horario" className="text-right text-amber-300">
                                                  Horario
                                                </Label>
                                                <Select
                                                  value={editingReserva?.horario || ""}
                                                  onValueChange={(value) => setEditingReserva((prev: any) => ({ ...prev, horario: value }))}
                                                >
                                                  <SelectTrigger className="col-span-3 bg-slate-700 border-amber-500/30 text-white">
                                                    <SelectValue placeholder="Selecciona un horario" />
                                                  </SelectTrigger>
                                                  <SelectContent className="bg-slate-700 border-amber-500/30">
                                                    {["20:15", "22:30"].map((horario) => (
                                                      <SelectItem key={horario} value={horario} className="text-white hover:bg-slate-600">
                                                        {horario}
                                                      </SelectItem>
                                                    ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="personas" className="text-right text-amber-300">
                                                  Personas
                                                </Label>
                                                <Input
                                                  id="personas"
                                                  type="number"
                                                  min="1"
                                                  max="20"
                                                  value={editingReserva?.cantidad_personas || ""}
                                                  onChange={(e) => {
                                                    let value = parseInt(e.target.value)
                                                    if (value > 20) value = 20
                                                    if (value < 1) value = 1
                                                    setEditingReserva((prev: any) => ({ ...prev, cantidad_personas: value }))
                                                  }}
                                                  className="col-span-3 bg-slate-700 border-amber-500/30 text-white"
                                                />
                                              </div>
                                              <div className="grid grid-cols-4 items-start gap-4">
                                                <Label htmlFor="notas" className="text-right pt-2 text-amber-300">
                                                  Notas
                                                </Label>
                                                <Textarea
                                                  id="notas"
                                                  value={editingReserva?.notas || ""}
                                                  onChange={(e) => setEditingReserva((prev: any) => ({ ...prev, notas: e.target.value }))}
                                                  className="col-span-3 bg-slate-700 border-amber-500/30 text-white resize-none"
                                                  placeholder="Solicitudes especiales, alergias, celebraciones, etc."
                                                  rows={3}
                                                  maxLength={500}
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <Button
                                                onClick={() => {
                                                  setIsEditDialogOpen(false)
                                                  setEditingReserva(null)
                                                }}
                                                variant="outline"
                                                className="bg-slate-700 text-white border-amber-500/30 hover:bg-slate-600"
                                              >
                                                Cancelar
                                              </Button>
                                              <Button
                                                onClick={() => handleEditReserva(editingReserva)}
                                                className="bg-amber-600 hover:bg-amber-700"
                                              >
                                                Guardar Cambios
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>

                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent className="bg-slate-800 border-amber-500/20">
                                            <AlertDialogHeader>
                                              <AlertDialogTitle className="text-white font-legquinne">
                                                ¿Eliminar reserva?
                                              </AlertDialogTitle>
                                              <AlertDialogDescription className="text-amber-300/70">
                                                ¿Estás seguro de que quieres eliminar la reserva de <strong className="text-amber-200">{r.nombre}</strong>?
                                                Esta acción no se puede deshacer.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel className="bg-slate-700 text-white border-amber-500/30 hover:bg-slate-600">
                                                Cancelar
                                              </AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => handleDeleteReserva(r.id, r.nombre)}
                                                className="bg-red-600 hover:bg-red-700"
                                              >
                                                Eliminar
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </TableCell>
                                  </motion.tr>
                                ))}
                              </AnimatePresence>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendario" className="space-y-0">
                {adminData?.local_id ? (
                  <div className="bg-slate-800/70 border border-amber-500/30 backdrop-blur-xl rounded-lg p-6 shadow-xl">
                    <ReservationCalendarAdmin localId={adminData.local_id} />
                  </div>
                ) : (
                  <Card className="bg-slate-800/70 border-amber-500/30 backdrop-blur-xl shadow-xl">
                    <CardContent className="flex items-center justify-center py-8">
                      <div className="text-amber-300/70">Cargando calendario...</div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="analytics" className="space-y-8">
                {/* Main Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status Distribution */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="bg-slate-800/70 border-amber-500/30 backdrop-blur-xl shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-amber-100 font-legquinne flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-amber-400" />
                          Distribución por Estado
                        </CardTitle>
                        <CardDescription className="text-amber-300/60">
                          Análisis del estado actual de las reservas
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            value: { label: "Reservas", color: chartColors.primary }
                          }}
                          className="h-[280px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <defs>
                                <linearGradient id="statusGradient1" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.8} />
                                  <stop offset="95%" stopColor={chartColors.success} stopOpacity={0.2} />
                                </linearGradient>
                                <linearGradient id="statusGradient2" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={chartColors.warning} stopOpacity={0.8} />
                                  <stop offset="95%" stopColor={chartColors.warning} stopOpacity={0.2} />
                                </linearGradient>
                              </defs>
                              <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#FED7AA', fontSize: 12 }}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#FED7AA', fontSize: 12 }}
                              />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {statusData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={`url(#statusGradient${index + 1})`}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>

                        {/* Status Summary */}
                        <div className="grid grid-cols-2 gap-6 mt-4 pt-4 border-t border-amber-500/20">
                          {statusData.map((status, index) => (
                            <div key={status.name} className="text-center">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: status.color }}
                                />
                                <span className="text-xs text-amber-200">{status.name}</span>
                              </div>
                              <div className="text-lg font-legquinne text-white">{status.value}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Weekly Trend Analysis */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-slate-800/70 border-amber-500/30 backdrop-blur-xl shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-amber-100 font-legquinne flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-emerald-400" />
                          Análisis Semanal
                        </CardTitle>
                        <CardDescription className="text-amber-300/60">
                          Tendencia de reservas en los últimos 7 días
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            personas: { label: "Personas", color: chartColors.accent }
                          }}
                          className="h-[280px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <defs>
                                <linearGradient id="personasGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={chartColors.accent} stopOpacity={0.4} />
                                  <stop offset="95%" stopColor={chartColors.accent} stopOpacity={0.1} />
                                </linearGradient>
                              </defs>
                              <XAxis
                                dataKey="fecha"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#FED7AA', fontSize: 12 }}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#FED7AA', fontSize: 12 }}
                              />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Area
                                type="monotone"
                                dataKey="personas"
                                stroke={chartColors.accent}
                                fillOpacity={1}
                                fill="url(#personasGradient)"
                                strokeWidth={3}
                                dot={{ fill: chartColors.accent, strokeWidth: 2, r: 4 }}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </ChartContainer>

                        {/* Weekly Stats */}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-amber-500/20">
                          <div className="text-center">
                            <div className="text-xs text-amber-300/70">Total Semana</div>
                            <div className="text-lg font-legquinne text-emerald-400">
                              {chartData.reduce((acc, day) => acc + day.personas, 0)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-amber-300/70">Promedio Diario</div>
                            <div className="text-lg font-legquinne text-blue-400">
                              {(chartData.reduce((acc, day) => acc + day.personas, 0) / 7).toFixed(1)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-amber-300/70">Mejor Día</div>
                            <div className="text-lg font-legquinne text-amber-400">
                              {Math.max(...chartData.map(day => day.personas))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Analytics Summary Cards Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  <Card className="bg-slate-800/70 backdrop-blur-xl hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-medium text-emerald-300">
                        Promedio Personas/Reserva
                      </CardTitle>
                      <div className="p-2 bg-emerald-500/20 rounded-full">
                        <Users className="h-4 w-4 text-emerald-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-legquinne font-bold text-white mb-1">
                        {reservas.length > 0 ?
                          (reservas.reduce((acc, r) => acc + r.cantidad_personas, 0) / reservas.length).toFixed(1) :
                          '0.0'
                        }
                      </div>
                      <p className="text-xs text-emerald-300/70">
                        personas por reserva
                      </p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-3 h-3 mr-1 text-emerald-400" />
                        <span className="text-xs text-emerald-400">Óptimo: 2-4 personas</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/70 border-amber-500/30 backdrop-blur-xl hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-medium text-amber-300">
                        Horario Más Popular
                      </CardTitle>
                      <div className="p-2 bg-amber-500/20 rounded-full">
                        <Clock className="h-4 w-4 text-amber-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-legquinne font-bold text-white mb-1">
                        {(() => {
                          const horarios = reservas.reduce((acc, r) => {
                            acc[r.horario] = (acc[r.horario] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                          const popular = Object.entries(horarios).sort(([, a], [, b]) => (b as number) - (a as number))[0]
                          return popular ? popular[0] : 'N/A'
                        })()}
                      </div>
                      <p className="text-xs text-amber-300/70">
                        turno preferido
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="w-3 h-3 mr-1 bg-amber-400 rounded-full" />
                        <span className="text-xs text-amber-400">
                          {(() => {
                            const horarios = reservas.reduce((acc, r) => {
                              acc[r.horario] = (acc[r.horario] || 0) + 1
                              return acc
                            }, {} as Record<string, number>)
                            const popular = Object.entries(horarios).sort(([, a], [, b]) => (b as number) - (a as number))[0]
                            return popular ? `${popular[1]} reservas` : '0 reservas'
                          })()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/70 border-blue-500/30 backdrop-blur-xl hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-medium text-blue-300">
                        Tasa de Ocupación
                      </CardTitle>
                      <div className="p-2 bg-blue-500/20 rounded-full">
                        <Activity className="h-4 w-4 text-blue-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-legquinne font-bold text-white mb-1">
                        {Math.round((plazasStats.plazasOcupadas / plazasStats.plazasTotales) * 100)}%
                      </div>
                      <p className="text-xs text-blue-300/70">
                        capacidad utilizada
                      </p>
                      <Progress
                        value={(plazasStats.plazasOcupadas / plazasStats.plazasTotales) * 100}
                        className="h-1.5 mt-2 bg-slate-700"
                      />
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/70 border-purple-500/30 backdrop-blur-xl hover:scale-105 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-medium text-purple-300">
                        Reservas con Notas
                      </CardTitle>
                      <div className="p-2 bg-purple-500/20 rounded-full">
                        <MessageSquare className="h-4 w-4 text-purple-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-legquinne font-bold text-white mb-1">
                        {reservas.filter(r => r.notas && r.notas.trim()).length}
                      </div>
                      <p className="text-xs text-purple-300/70">
                        solicitudes especiales
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="w-3 h-3 mr-1 bg-purple-400 rounded-full" />
                        <span className="text-xs text-purple-400">
                          {reservas.length > 0 ?
                            Math.round((reservas.filter(r => r.notas && r.notas.trim()).length / reservas.length) * 100)
                            : 0}% del total
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>


              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  )
}
