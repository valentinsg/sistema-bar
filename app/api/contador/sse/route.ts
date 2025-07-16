import { getContador } from "@/lib/storage"

// OPTIMIZACIÓN: Usar nodejs runtime para respetar vercel.json limits
export const runtime = 'nodejs'
export const maxDuration = 5

// MONITOREO: Contador de llamadas para detectar abuso
let callCount = 0
let lastLogTime = 0
const LOG_INTERVAL = 60000 // Log cada minuto

export async function GET(request: Request) {
  // MONITOREO: Incrementar contador
  callCount++

  // MONITOREO: Log periódico para detectar llamadas excesivas
  const now = Date.now()
  if (now - lastLogTime > LOG_INTERVAL) {
    const callsPerMinute = callCount
    console.log(`📊 Contador endpoint: ${callsPerMinute} calls in last minute`)

    // ALERTA: Si hay más de 20 calls por minuto (sospechoso)
    if (callsPerMinute > 20) {
      console.warn(`⚠️ ALERT: Excessive contador requests detected: ${callsPerMinute}/min`)
    }

    callCount = 0
    lastLogTime = now
  }

  try {
    const { searchParams } = new URL(request.url)
    const localId = searchParams.get('local_id')

    if (!localId) {
      return Response.json({ error: 'Missing local_id parameter' }, { status: 400 })
    }

    // Simple query - sin polling, sin streams
    const contador = await getContador(localId)

    return Response.json({
      contador,
      timestamp: new Date().toISOString(),
      type: 'static' // Indicar que es estático, no live
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30', // Cache 30 segundos
        'Content-Type': 'application/json',
        'Connection': 'close' // CRÍTICO: Cerrar conexión inmediatamente
      }
    })

  } catch (error) {
    console.error('❌ Error en contador endpoint:', error)
    return Response.json(
      { error: 'Error interno', contador: 0 },
      {
        status: 500,
        headers: {
          'Connection': 'close'
        }
      }
    )
  }
}

export async function POST() {
  return new Response('SSE_DISABLED', {
    status: 404,
    headers: { 'Connection': 'close' }
  })
}

export async function PUT() {
  return new Response('SSE_DISABLED', {
    status: 404,
    headers: { 'Connection': 'close' }
  })
}

export async function DELETE() {
  return new Response('SSE_DISABLED', {
    status: 404,
    headers: { 'Connection': 'close' }
  })
}
