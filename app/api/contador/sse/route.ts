import { getContador } from "@/lib/storage"
import { NextRequest } from "next/server"

// OPTIMIZACIÓN: Configurar runtime edge para mejor performance
export const runtime = 'edge'
export const maxDuration = 30 // Límite máximo de 30 segundos

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const localId = searchParams.get('local_id')

  if (!localId) {
    return new Response('Missing local_id parameter', { status: 400 })
  }

  const encoder = new TextEncoder()

  // CRÍTICO: Agregar timeout absoluto para evitar funciones colgadas
  const connectionTimeout = setTimeout(() => {
    console.log('SSE connection timeout reached')
  }, 25000) // 25 segundos como máximo

  const stream = new ReadableStream({
    async start(controller) {
      const sendData = (data: any) => {
        try {
          if (!controller.desiredSize || controller.desiredSize > 0) {
            const message = `data: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(message))
          }
        } catch (error) {
          console.log('Controller already closed in sendData')
        }
      }

      const sendError = (error: string) => {
        try {
          if (!controller.desiredSize || controller.desiredSize > 0) {
            const message = `data: ${JSON.stringify({ error })}\n\n`
            controller.enqueue(encoder.encode(message))
          }
        } catch (error) {
          console.log('Controller already closed in sendError')
        }
      }

      let isActive = true
      let lastContador: number | null = null
      let pollCount = 0
      const MAX_POLLS = 15 // LÍMITE: máximo 15 polling cycles (15 * 90s = 22.5 min)

      const cleanup = () => {
        if (isActive) {
          isActive = false
          clearTimeout(connectionTimeout)
          if (interval) clearInterval(interval)
          try {
            controller.close()
          } catch (error) {
            console.log('Controller already closed')
          }
        }
      }

      let interval: NodeJS.Timeout | null = null

      try {
        // Enviar datos iniciales con timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Initial data timeout')), 5000)
        )

        const initialContador = await Promise.race([
          getContador(localId),
          timeoutPromise
        ]) as number

        lastContador = initialContador
        sendData({ contador: initialContador, timestamp: new Date().toISOString() })

        // OPTIMIZACIÓN: Reducir intervalo y agregar límite de polls
        interval = setInterval(async () => {
          if (!isActive || pollCount >= MAX_POLLS) {
            cleanup()
            return
          }

          pollCount++

          try {
            // Timeout en cada consulta individual
            const queryTimeout = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Query timeout')), 3000)
            )

            const contador = await Promise.race([
              getContador(localId),
              queryTimeout
            ]) as number

            // Solo enviar si el valor cambió
            if (contador !== lastContador) {
              lastContador = contador
              sendData({ contador, timestamp: new Date().toISOString() })
            }
          } catch (error) {
            console.error('Error en SSE polling:', error)
            // Después de 3 errores consecutivos, cerrar conexión
            if (pollCount % 3 === 0) {
              sendError('Error de conexión persistente')
              cleanup()
            }
          }
        }, 60000) // Reducido a 60 segundos

        // Detectar desconexión del cliente
        request.signal.addEventListener('abort', cleanup)

        // CRÍTICO: Auto-cleanup después del timeout
        setTimeout(cleanup, 25000)

      } catch (error) {
        console.error('Error en SSE inicial:', error)
        sendError('Error de conexión inicial')
        cleanup()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
      // CRÍTICO: Headers para evitar que Vercel mantenga conexiones abiertas
      'X-Accel-Buffering': 'no',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
  })
}
