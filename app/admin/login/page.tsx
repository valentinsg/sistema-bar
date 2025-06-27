"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Buscar el usuario admin por email
      const { data: adminData, error: adminError } = await supabase
        .from("usuarios_admin")
        .select("id, nombre, email, local_id, password, token_acceso")
        .eq("email", formData.email)
        .single()

      if (adminError || !adminData) {
        setError("Email no encontrado")
        setIsLoading(false)
        return
      }

      // Verificar contraseña (en texto plano por simplicidad)
      // En producción deberías usar hash de contraseñas
      if (formData.password !== adminData.password) {
        setError("Contraseña incorrecta")
        setIsLoading(false)
        return
      }

      // Generar nuevo token de sesión seguro
      const timestamp = Date.now()
      const randomBytes = crypto.getRandomValues(new Uint8Array(32))
      const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
      const newToken = `admin_${timestamp}_${randomString}`

      // Actualizar token en la base de datos
      await supabase
        .from("usuarios_admin")
        .update({ token_acceso: newToken })
        .eq("id", adminData.id)

      // Guardar token y datos de sesión en localStorage
      const sessionData = {
        token: newToken,
        expires: timestamp + (24 * 60 * 60 * 1000), // 24 horas
        user: {
          id: adminData.id,
          nombre: adminData.nombre,
          email: adminData.email,
          local_id: adminData.local_id
        }
      }

      localStorage.setItem("admin_session", JSON.stringify(sessionData))

      // Redireccionar al panel de admin
      router.push("/admin")

    } catch (error) {
      console.error("Error en login:", error)
      setError("Error al iniciar sesión. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-10"></div>

      <Card className="w-full max-w-md bg-gray-900/90 border-gray-700 backdrop-blur-sm shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Panel de Administración
          </CardTitle>
          <CardDescription className="text-gray-300">
            Accede al sistema de gestión de <span className="text-purple-400 font-semibold">Nocturnos</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="bg-red-900/50 border-red-700 text-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                placeholder="admin@nocturnos.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 pr-10"
                  placeholder="Tu contraseña"
                  required
                />
                <Button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-400">Credenciales por defecto:</p>
              <div className="bg-gray-800/50 rounded-lg p-3 text-xs">
                <p className="text-gray-300">Email: <span className="text-purple-400">admin@nocturnos.com</span></p>
                <p className="text-gray-300">Contraseña: <span className="text-purple-400">admin123</span></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
