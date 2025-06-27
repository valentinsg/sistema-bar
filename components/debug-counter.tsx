"use client"

import { useEffect, useState } from "react"

const LOCAL_ID = process.env.NEXT_PUBLIC_LOCAL_ID!

export default function DebugCounter() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [serverEnvInfo, setServerEnvInfo] = useState<any>({})
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const info = {
      LOCAL_ID: LOCAL_ID,
      hasLocalId: !!LOCAL_ID,
      nodeEnv: process.env.NODE_ENV,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
      currentHour: new Date().getHours(),
      isDevelopment: process.env.NODE_ENV === "development" ||
        (typeof window !== 'undefined' && (
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1"
        )),
      isOperatingTime: (() => {
        const hour = new Date().getHours()
        return hour >= 19 || hour < 6
      })(),
      shouldShow: (() => {
        const hour = new Date().getHours()
        const isDev = process.env.NODE_ENV === "development" ||
          (typeof window !== 'undefined' && (
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
          ))
        const isOperatingTime = hour >= 19 || hour < 6
        return isDev || isOperatingTime
      })()
    }

    setDebugInfo(info)

    // Verificar variables de entorno del servidor
    fetch('/api/debug/env')
      .then(res => res.json())
      .then(data => {
        setServerEnvInfo(data)
        console.log('🔍 Server env info:', data)
      })
      .catch(error => {
        console.error('❌ Error fetching env info:', error)
        setServerEnvInfo({ error: error.message })
      })
  }, [])

  if (!isMounted) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs max-w-xs max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2">Debug Info</h3>

      <div className="mb-3">
        <h4 className="font-semibold text-yellow-300">Cliente:</h4>
        <pre className="whitespace-pre-wrap text-xs">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>

      <div className="mb-3">
        <h4 className="font-semibold text-blue-300">Servidor:</h4>
        <pre className="whitespace-pre-wrap text-xs">
          {JSON.stringify(serverEnvInfo, null, 2)}
        </pre>
      </div>

      <div className="text-xs text-gray-400">
        <div>Hora actual: {new Date().toLocaleTimeString()}</div>
        <div>URL: {typeof window !== 'undefined' ? window.location.href : 'server'}</div>
      </div>
    </div>
  )
}
