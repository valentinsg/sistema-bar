import { NextResponse } from 'next/server'

// OPTIMIZACIÓN: Forzar nodejs runtime para respetar vercel.json
export const runtime = 'nodejs'
export const maxDuration = 5

// MONITOREO: Contador de llamadas para detectar abuso
let callCount = 0
let lastLogTime = 0
const LOG_INTERVAL = 60000 // Log cada minuto

export async function GET() {
  // MONITOREO: Incrementar contador
  callCount++

  // MONITOREO: Log periódico para detectar llamadas excesivas
  const now = Date.now()
  if (now - lastLogTime > LOG_INTERVAL) {
    const callsPerMinute = callCount
    console.log(`🏥 Health endpoint: ${callsPerMinute} calls in last minute`)

    // ALERTA: Si hay más de 30 calls por minuto (sospechoso)
    if (callsPerMinute > 30) {
      console.warn(`⚠️ ALERT: Excessive health checks detected: ${callsPerMinute}/min`)
    }

    callCount = 0
    lastLogTime = now
  }

  try {
    // CRÍTICO: Respuesta mínima para evitar procesamiento innecesario
    return NextResponse.json({
      status: 'ok',
      timestamp: Date.now(), // Usar timestamp numérico es más eficiente
      env: process.env.VERCEL_ENV || 'development'
    }, {
      headers: {
        'Cache-Control': 'no-cache, max-age=0',
        'Content-Type': 'application/json',
        'Connection': 'close' // CRÍTICO: Cerrar conexión inmediatamente
      }
    })
  } catch (error) {
    console.error('❌ Health endpoint error:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: Date.now()
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, max-age=0',
        'Connection': 'close'
      }
    })
  }
}

export async function HEAD() {
  // MONITOREO: También contar HEAD requests
  callCount++

  // OPTIMIZACIÓN: HEAD request más eficiente para health checks
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, max-age=0',
      'Content-Length': '0',
      'Connection': 'close' // CRÍTICO: Cerrar conexión inmediatamente
    }
  })
}
