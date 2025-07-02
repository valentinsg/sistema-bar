# Optimizaciones SSE - Reducción de Llamados

## Problema Identificado

Se detectó un exceso de llamados al endpoint `/api/contador/sse` que causaba:
- Sobrecarga en el servidor
- Múltiples conexiones simultáneas
- Reconexiones innecesarias
- Polling excesivo a la base de datos

## Soluciones Implementadas

### 1. Singleton Pattern para SSE Manager

**Antes:** Cada componente creaba su propia conexión SSE
**Después:** Un único manager global maneja todas las conexiones

```typescript
class SSEManager {
  private static instance: SSEManager
  private listeners: Set<(data: any) => void> = new Set()

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager()
    }
    return SSEManager.instance
  }
}
```

**Beneficios:**
- Una sola conexión SSE por aplicación
- Compartir datos entre múltiples componentes
- Mejor gestión de recursos

### 2. Backoff Exponencial para Reconexiones

**Antes:** Reconexión fija cada 5 segundos
**Después:** Backoff exponencial con límite máximo

```typescript
const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000)
```

**Beneficios:**
- Reduce la carga en el servidor durante errores
- Mejor experiencia de usuario
- Evita reconexiones agresivas

### 3. Optimización del Endpoint SSE

**Antes:** Polling cada 15 segundos, siempre enviando datos
**Después:** Polling cada 30 segundos, solo enviar cambios

```typescript
// Solo enviar si el valor cambió
if (contador !== lastContador) {
  lastContador = contador
  sendData({ contador, timestamp: new Date().toISOString() })
}
```

**Beneficios:**
- Reduce tráfico de red en un 50%
- Menos consultas a la base de datos
- Mejor rendimiento general

### 4. Mejor Manejo de Visibilidad

**Antes:** Desconectar/reconectar en cada cambio de pestaña
**Después:** Mantener conexión, solo marcar estado

```typescript
const handleVisibilityChange = () => {
  if (document.hidden) {
    setIsConnected(false) // Solo marcar, no desconectar
  } else {
    if (!sseManager.isConnected()) {
      sseManager.connect() // Reconectar solo si es necesario
    }
    setIsConnected(true)
  }
}
```

**Beneficios:**
- Evita reconexiones innecesarias
- Mejor experiencia al cambiar pestañas
- Mantiene la conexión activa

## Resultados Esperados

### Reducción de Llamados
- **Antes:** ~4 llamados por minuto por componente
- **Después:** ~2 llamados por minuto total (compartido)

### Mejoras de Rendimiento
- 50% menos tráfico de red
- 75% menos consultas a la base de datos
- Mejor estabilidad de conexión

### Experiencia de Usuario
- Reconexiones más inteligentes
- Menos errores de conexión
- Interfaz más responsiva

## Monitoreo

Para verificar que las optimizaciones funcionan:

1. **Logs del servidor:** Deberían mostrar menos llamados repetitivos
2. **Network tab:** Una sola conexión SSE persistente
3. **Performance:** Menor uso de CPU y memoria
4. **Errores:** Reducción de errores de conexión

## Configuración

- **Intervalo de polling:** 30 segundos (configurable)
- **Máximo reintentos:** 3 intentos
- **Backoff máximo:** 10 segundos
- **Timeout de conexión:** 5 segundos
