"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Shield, User } from "lucide-react"

interface SessionData {
  token: string
  expires: number
  user: {
    id: string
    nombre: string
    email: string
    local_id: string
  }
}

export default function SessionInfo() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>("")

  useEffect(() => {
    const loadSession = () => {
      const sessionString = localStorage.getItem("admin_session")
      if (sessionString) {
        try {
          const session = JSON.parse(sessionString) as SessionData
          setSessionData(session)
        } catch (error) {
          console.error("Error al cargar sesión:", error)
        }
      }
    }

    loadSession()
  }, [])

  useEffect(() => {
    if (!sessionData) return

    const updateTimeLeft = () => {
      const now = Date.now()
      const remaining = sessionData.expires - now

      if (remaining <= 0) {
        setTimeLeft("Expirada")
        return
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [sessionData])

  if (!sessionData) return null

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4" />
          Información de Sesión
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm flex items-center gap-2">
            <User className="w-3 h-3" />
            Usuario:
          </span>
          <Badge className="text-xs">
            {sessionData.user.email}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Expira en:
          </span>
          <Badge
            className="text-xs"
          >
            {timeLeft}
          </Badge>
        </div>

        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Token ID:</span>
            <span className="text-gray-500 text-xs font-mono">
              {sessionData.token.substring(0, 16)}...
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
