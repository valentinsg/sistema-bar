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

      try {
        // Enviar datos iniciales
        const contador = await getContador(localId)
        sendData({ contador, timestamp: new Date().toISOString() })

        // Configurar polling del servidor (más eficiente que cliente)
        const interval = setInterval(async () => {
          try {
            const contador = await getContador(localId)
            sendData({ contador, timestamp: new Date().toISOString() })
          } catch (error) {
            console.error('Error en SSE polling:', error)
            sendError('Error al obtener datos')
          }
        }, 15000) // 15 segundos

        // Limpiar cuando se cierre la conexión
        request.signal.addEventListener('abort', () => {
          clearInterval(interval)
          controller.close()
        })

      } catch (error) {
        console.error('Error en SSE:', error)
        sendError('Error de conexión')
        controller.close()
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
