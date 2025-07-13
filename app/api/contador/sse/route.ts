import { getContador } from "@/lib/storage"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const localId = searchParams.get('local_id')

  if (!localId) {
    return new Response('Missing local_id parameter', { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const sendData = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      const sendError = (error: string) => {
        const message = `data: ${JSON.stringify({ error })}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      let isActive = true
      let lastContador: number | null = null

      try {
        // Enviar datos iniciales
        const initialContador = await getContador(localId)
        lastContador = initialContador
        sendData({ contador: initialContador, timestamp: new Date().toISOString() })

        // OPTIMIZACIÓN: Aumentar intervalo de polling de 60 segundos a 90 segundos
        const interval = setInterval(async () => {
          if (!isActive) return

          try {
            const contador = await getContador(localId)

            // Solo enviar si el valor cambió o es la primera vez
            if (contador !== lastContador) {
              lastContador = contador
              sendData({ contador, timestamp: new Date().toISOString() })
            }
          } catch (error) {
            console.error('Error en SSE polling:', error)
            // No enviar error en cada fallo, solo log
          }
        }, 90000) // 90 segundos para reducir llamadas significativamente

        // Limpiar cuando se cierre la conexión
        const cleanup = () => {
          if (isActive) {
            isActive = false
            clearInterval(interval)
            try {
              controller.close()
            } catch (error) {
              // El controlador ya puede estar cerrado, ignorar el error
              console.log('Controller already closed')
            }
          }
        }

        // Agregar listener para detectar si el cliente se desconectó
        request.signal.addEventListener('abort', cleanup)

      } catch (error) {
        console.error('Error en SSE:', error)
        sendError('Error de conexión inicial')
        try {
          controller.close()
        } catch (closeError) {
          console.log('Controller already closed in catch block')
        }
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}
