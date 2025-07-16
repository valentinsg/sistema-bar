import { getContador } from "@/lib/storage"

// OPTIMIZACIÓN: Simple GET endpoint - sin SSE, sin conexiones persistentes
export const runtime = 'edge'
export const maxDuration = 5

export async function GET(request: Request) {
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
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Error en contador endpoint:', error)
    return Response.json(
      { error: 'Error interno', contador: 0 },
      { status: 500 }
    )
  }
}

export async function POST() {
  return new Response('SSE_DISABLED', { status: 404 })
}

export async function PUT() {
  return new Response('SSE_DISABLED', { status: 404 })
}

export async function DELETE() {
  return new Response('SSE_DISABLED', { status: 404 })
}
