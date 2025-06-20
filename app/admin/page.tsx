"use client"

import ReservationCalendar from "@/components/reservation-calendar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { deleteReserva, getContador, getMesasEstadisticas } from "@/lib/storage"
import { supabase } from "@/lib/supabase"
import { BarChart3, Calendar, Clock, Download, Edit, ExternalLink, Loader2, LogOut, MessageSquare, Minus, Phone, Plus, RotateCcw, TableIcon, Trash2, User, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface AdminData {
  id: string
  nombre: string
  email: string
  local_id: string
}

interface MesasStats {
  mesasTotales: number
  mesasOcupadas: number
  mesasDisponibles: number
  personasTotales: number
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [reservas, setReservas] = useState<any[]>([])
  const [personasActuales, setPersonasActuales] = useState<number>(0)
  const [mesasStats, setMesasStats] = useState<MesasStats>({
    mesasTotales: 50,
    mesasOcupadas: 0,
    mesasDisponibles: 50,
    personasTotales: 0
  })
  const [loadingStats, setLoadingStats] = useState(false)
  const [editingReserva, setEditingReserva] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const router = useRouter()

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

        // Verificar si la sesión ha expirado
        if (now > sessionData.expires) {
          console.log("Sesión expirada")
          localStorage.removeItem("admin_session")
          router.replace("/admin/login")
          return
        }

        // Verificar que el token sigue siendo válido en la base de datos
        const { data: adminDbData, error } = await supabase
          .from("usuarios_admin")
          .select("id, nombre, email, local_id, token_acceso")
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

        // Cargar estadísticas de mesas para hoy
        const stats = await getMesasEstadisticas(adminData.local_id, today)

        setReservas(reservasData || [])
        setPersonasActuales(contadorData)
        setMesasStats(stats)
      } finally {
        setLoadingStats(false)
        setLoading(false)
      }
    }

    cargarDatos()

    // Suscribirse a cambios en tiempo real
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
          // Recargar datos cuando hay cambios
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

  const handleUpdateContador = async (increment: boolean) => {
    if (!adminData?.local_id) return

    const nuevoValor = Math.max(0, personasActuales + (increment ? 1 : -1))

    // Actualizar optimísticamente la UI
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
        // Revertir el cambio optimista si hay error
        setPersonasActuales(personasActuales)
        alert("Error al actualizar el contador")
        return
      }

      // Disparar evento para actualizar el contador en vivo
      window.dispatchEvent(new CustomEvent("contadorUpdated", { detail: { personas: nuevoValor } }))

    } catch (error) {
      console.error("Error al actualizar contador:", error)
      // Revertir el cambio optimista si hay error
      setPersonasActuales(personasActuales)
      alert("Error al actualizar el contador")
    }
  }

  const handleResetContador = async () => {
    if (!adminData?.local_id) return

    // Actualizar optimísticamente la UI
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
        alert("Error al resetear el contador")
        return
      }

      // Disparar evento para actualizar el contador en vivo
      window.dispatchEvent(new CustomEvent("contadorUpdated", { detail: { personas: 0 } }))

    } catch (error) {
      console.error("Error al resetear contador:", error)
      alert("Error al resetear el contador")
    }
  }

  const handleDeleteReserva = async (id: string, nombre: string) => {
    const success = await deleteReserva(id)
    if (success) {
      setReservas(prev => prev.filter(r => r.id !== id))
      // Recargar estadísticas de mesas
      if (adminData?.local_id) {
        const today = new Date().toISOString().split("T")[0]
        const stats = await getMesasEstadisticas(adminData.local_id, today)
        setMesasStats(stats)
      }
    } else {
      alert("Error al eliminar la reserva. Intenta nuevamente.")
    }
  }

  const handleVerSitio = () => {
    window.open(window.location.origin, '_blank', 'noopener,noreferrer')
  }

  const handleLogout = async () => {
    // Limpiar token de la base de datos
    if (adminData?.id) {
      await supabase
        .from("usuarios_admin")
        .update({ token_acceso: null })
        .eq("id", adminData.id)
    }

    // Limpiar localStorage
    localStorage.removeItem("admin_session")
    router.push("/admin/login")
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (fecha: string, horario: string) => {
    const reservaDateTime = new Date(`${fecha}T${horario}`)
    const now = new Date()

    if (reservaDateTime < now) return <Badge variant="secondary">Pasada</Badge>
    if (reservaDateTime.toDateString() === now.toDateString()) return <Badge className="bg-green-600 hover:bg-green-700">Hoy</Badge>
    return <Badge variant="outline">Próxima</Badge>
  }

  const handleEditReserva = async (reservaData: any) => {
    if (!adminData?.local_id) return

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
        alert("Error al actualizar la reserva")
        return
      }

      // Recargar datos
      const { data: reservasData } = await supabase
        .from("reservas")
        .select("*")
        .eq("local_id", adminData.local_id)

      setReservas(reservasData || [])
      setIsEditDialogOpen(false)
      setEditingReserva(null)

      alert("Reserva actualizada correctamente")
    } catch (error) {
      console.error("Error al actualizar reserva:", error)
      alert("Error al actualizar la reserva")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
              <p className="text-gray-400 text-sm">Gestión del boliche</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">

            <Button onClick={downloadCSV} variant="outline" size="sm" disabled={reservas.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            <Button onClick={handleVerSitio} variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Sitio
            </Button>

            <Button onClick={handleLogout} variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-900/20">
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingStats && (
            <div className="col-span-full flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <span className="ml-2 text-gray-400">Cargando estadísticas...</span>
            </div>
          )}
          {/* Contador en Vivo */}
          <Card className="bg-gradient-to-br from-purple-800/80 to-purple-900/80 border-purple-500/60 hover:from-purple-700/80 hover:to-purple-800/80 transition-all duration-200 shadow-lg hover:shadow-purple-500/25">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-purple-100 text-sm font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Personas en vivo
                  </div>
                  <p className="text-4xl font-bold text-white mt-2">{personasActuales}</p>
                  <p className="text-xs text-purple-200 mt-1">
                    Actualización en tiempo real
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    onClick={() => handleUpdateContador(true)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 px-3 py-1.5 transition-all duration-200 shadow-lg hover:shadow-green-500/25"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => handleUpdateContador(false)}
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-400 hover:bg-red-900/20 px-3 py-1.5 transition-all duration-200"
                    disabled={personasActuales <= 0}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20 px-3 py-1.5 transition-all duration-200"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-800 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">¿Resetear contador?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          ¿Estás seguro de que quieres resetear el contador a 0?
                          Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleResetContador}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          Resetear
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mesas Totales */}
          <Card className="bg-gradient-to-br from-blue-700/80 to-blue-800/80 border-blue-400/60 hover:from-blue-600/80 hover:to-blue-700/80 transition-all duration-200 shadow-lg hover:shadow-blue-500/25">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Capacidad total</p>
                  <p className="text-3xl font-bold text-white mt-1">{mesasStats.mesasTotales}</p>
                  <p className="text-xs text-blue-200 mt-1">mesas disponibles</p>
                </div>
                <div className="p-3 bg-blue-500/30 rounded-full">
                  <TableIcon className="w-6 h-6 text-blue-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mesas Ocupadas */}
          <Card className="bg-gradient-to-br from-red-700/80 to-red-800/80 border-red-400/60 hover:from-red-600/80 hover:to-red-700/80 transition-all duration-200 shadow-lg hover:shadow-red-500/25">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Mesas ocupadas hoy</p>
                  <p className="text-3xl font-bold text-white mt-1">{mesasStats.mesasOcupadas}</p>
                  <p className="text-xs text-red-200 mt-1">{mesasStats.personasTotales} personas reservadas</p>
                </div>
                <div className="p-3 bg-red-500/30 rounded-full">
                  <BarChart3 className="w-6 h-6 text-red-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mesas Disponibles */}
          <Card className="bg-gradient-to-br from-green-700/80 to-green-800/80 border-green-400/60 hover:from-green-600/80 hover:to-green-700/80 transition-all duration-200 shadow-lg hover:shadow-green-500/25">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Mesas disponibles</p>
                  <p className="text-3xl font-bold text-white mt-1">{mesasStats.mesasDisponibles}</p>
                  <p className="text-xs text-green-200 mt-1">
                    {Math.round((mesasStats.mesasDisponibles / mesasStats.mesasTotales) * 100)}% libre
                  </p>
                </div>
                <div className="p-3 bg-green-500/30 rounded-full">
                  <Users className="w-6 h-6 text-green-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="reservas" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="reservas" className="data-[state=active]:bg-purple-600">
              <Calendar className="w-4 h-4 mr-2" />
              Reservas ({reservas.length})
            </TabsTrigger>
            <TabsTrigger value="calendario" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Vista Calendario
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reservas" className="space-y-0">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Lista de Reservas</CardTitle>
                <CardDescription className="text-gray-400">
                  Gestiona todas las reservas del local
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reservas.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No hay reservas registradas</p>
                    <p className="text-sm">Las nuevas reservas aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Estado</TableHead>
                          <TableHead className="text-gray-300">Cliente</TableHead>
                          <TableHead className="text-gray-300">Contacto</TableHead>
                          <TableHead className="text-gray-300">Fecha</TableHead>
                          <TableHead className="text-gray-300">Horario</TableHead>
                          <TableHead className="text-gray-300">Personas</TableHead>
                          <TableHead className="text-gray-300">Mesas</TableHead>
                          <TableHead className="text-gray-300">Notas</TableHead>
                          <TableHead className="text-gray-300">Registrado</TableHead>
                          <TableHead className="text-gray-300 text-center">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reservas.sort((a, b) => new Date(`${a.fecha}T${a.horario}`).getTime() - new Date(`${b.fecha}T${b.horario}`).getTime()).map((r) => (
                          <TableRow key={r.id} className="border-gray-700 hover:bg-gray-700/50">
                            <TableCell>{getStatusBadge(r.fecha, r.horario)}</TableCell>
                            <TableCell className="text-white font-medium">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                {r.nombre}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {r.contacto}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">{formatDate(r.fecha)}</TableCell>
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {r.horario}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <Badge variant="secondary" className="bg-blue-900/50 text-blue-300">
                                {r.cantidad_personas}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <Badge variant="outline" className="border-purple-500 text-purple-300">
                                {Math.ceil(r.cantidad_personas / 4)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300 max-w-48">
                              {r.notas ? (
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                  <div className="text-sm">
                                    <p className="text-gray-300 line-clamp-2 break-words">
                                      {r.notas}
                                    </p>
                                    {r.notas.length > 60 && (
                                      <button
                                        className="text-yellow-400 hover:text-yellow-300 text-xs mt-1"
                                        onClick={() => alert(r.notas)}
                                      >
                                        Ver completo
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500 text-sm italic">Sin notas</span>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-400 text-sm">
                              {new Date(r.created_at).toLocaleDateString("es-AR")}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex gap-2 justify-center">
                                <Dialog open={isEditDialogOpen && editingReserva?.id === r.id} onOpenChange={(open) => {
                                  setIsEditDialogOpen(open)
                                  if (!open) setEditingReserva(null)
                                }}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                                      onClick={() => setEditingReserva(r)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Editar Reserva</DialogTitle>
                                      <DialogDescription className="text-gray-400">
                                        Modifica los datos de la reserva de {editingReserva?.nombre}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="nombre" className="text-right">
                                          Nombre
                                        </Label>
                                        <Input
                                          id="nombre"
                                          value={editingReserva?.nombre || ""}
                                          onChange={(e) => setEditingReserva(prev => ({ ...prev, nombre: e.target.value }))}
                                          className="col-span-3 bg-gray-700 border-gray-600 text-white"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="contacto" className="text-right">
                                          Contacto
                                        </Label>
                                        <Input
                                          id="contacto"
                                          value={editingReserva?.contacto || ""}
                                          onChange={(e) => setEditingReserva(prev => ({ ...prev, contacto: e.target.value }))}
                                          className="col-span-3 bg-gray-700 border-gray-600 text-white"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="fecha" className="text-right">
                                          Fecha
                                        </Label>
                                        <Input
                                          id="fecha"
                                          type="date"
                                          value={editingReserva?.fecha || ""}
                                          onChange={(e) => setEditingReserva(prev => ({ ...prev, fecha: e.target.value }))}
                                          className="col-span-3 bg-gray-700 border-gray-600 text-white"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="horario" className="text-right">
                                          Horario
                                        </Label>
                                        <Select
                                          value={editingReserva?.horario || ""}
                                          onValueChange={(value) => setEditingReserva(prev => ({ ...prev, horario: value }))}
                                        >
                                          <SelectTrigger className="col-span-3 bg-gray-700 border-gray-600 text-white">
                                            <SelectValue placeholder="Selecciona un horario" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-gray-700 border-gray-600">
                                            {["20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "00:00", "00:30", "01:00", "01:30", "02:00"].map((horario) => (
                                              <SelectItem key={horario} value={horario} className="text-white hover:bg-gray-600">
                                                {horario}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="personas" className="text-right">
                                          Personas
                                        </Label>
                                        <Input
                                          id="personas"
                                          type="number"
                                          min="1"
                                          max="20"
                                          value={editingReserva?.cantidad_personas || ""}
                                          onChange={(e) => setEditingReserva(prev => ({ ...prev, cantidad_personas: parseInt(e.target.value) }))}
                                          className="col-span-3 bg-gray-700 border-gray-600 text-white"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-start gap-4">
                                        <Label htmlFor="notas" className="text-right pt-2">
                                          Notas
                                        </Label>
                                        <Textarea
                                          id="notas"
                                          value={editingReserva?.notas || ""}
                                          onChange={(e) => setEditingReserva(prev => ({ ...prev, notas: e.target.value }))}
                                          className="col-span-3 bg-gray-700 border-gray-600 text-white resize-none"
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
                                        className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
                                      >
                                        Cancelar
                                      </Button>
                                      <Button
                                        onClick={() => handleEditReserva(editingReserva)}
                                        className="bg-blue-600 hover:bg-blue-700"
                                      >
                                        Guardar Cambios
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-gray-800 border-gray-700">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-white">¿Eliminar reserva?</AlertDialogTitle>
                                      <AlertDialogDescription className="text-gray-300">
                                        ¿Estás seguro de que quieres eliminar la reserva de <strong>{r.nombre}</strong>?
                                        Esta acción no se puede deshacer.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendario" className="space-y-0">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Vista de Calendario</CardTitle>
                <CardDescription className="text-gray-400">
                  Visualización de reservas por fecha con disponibilidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReservationCalendar isAdmin={true} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
