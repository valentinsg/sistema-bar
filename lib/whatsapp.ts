// 📁 lib/whatsapp.ts
// Utilidades para envío de confirmaciones por WhatsApp

export interface ReservaWhatsApp {
  nombre: string
  fecha: string
  horario: string
  cantidad_personas: number
  whatsapp: string
}

/**
 * Genera el mensaje de confirmación de reserva para WhatsApp
 */
export const generarMensajeConfirmacion = (reserva: ReservaWhatsApp): string => {
  const fechaFormateada = formatearFecha(reserva.fecha)

  const mensaje = `🎯 *CONFIRMACIÓN DE RESERVA - ELEVEN CLUB*

👤 *Nombre:* ${reserva.nombre}
📅 *Fecha:* ${fechaFormateada}
⏰ *Horario:* ${reserva.horario}
👥 *Personas:* ${reserva.cantidad_personas}

✅ Tu reserva ha sido confirmada exitosamente.

📍 *Eleven Club*
📞 Consultas: 0223-5357224

¡Te esperamos! 🍻`

  return mensaje
}

/**
 * Genera la URL de WhatsApp para enviar el mensaje de confirmación
 */
export const generarUrlWhatsApp = (whatsapp: string, mensaje: string): string => {
  // Limpiar el número de WhatsApp (remover espacios, guiones, etc.)
  const numeroLimpio = whatsapp.replace(/[\s\-\(\)]/g, '')

  // Asegurarse de que tenga el código de país (+54 para Argentina)
  let numeroCompleto = numeroLimpio
  if (!numeroCompleto.startsWith('+')) {
    if (numeroCompleto.startsWith('54')) {
      numeroCompleto = '+' + numeroCompleto
    } else if (numeroCompleto.startsWith('223') || numeroCompleto.startsWith('11')) {
      numeroCompleto = '+54' + numeroCompleto
    } else {
      numeroCompleto = '+54223' + numeroCompleto
    }
  }

  // Codificar el mensaje para URL
  const mensajeCodificado = encodeURIComponent(mensaje)

  // Generar URL de WhatsApp
  return `https://wa.me/${numeroCompleto.replace('+', '')}?text=${mensajeCodificado}`
}

/**
 * Formatea una fecha en formato YYYY-MM-DD a formato legible en español
 */
const formatearFecha = (fecha: string): string => {
  const fechaObj = new Date(fecha + 'T12:00:00')
  const opciones: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  return fechaObj.toLocaleDateString('es-AR', opciones)
}

/**
 * Envía automáticamente la confirmación por WhatsApp (abre en nueva ventana)
 */
export const enviarConfirmacionWhatsApp = (reserva: ReservaWhatsApp): void => {
  try {
    const mensaje = generarMensajeConfirmacion(reserva)
    const url = generarUrlWhatsApp(reserva.whatsapp, mensaje)

    // Solo abrir en el navegador si estamos en el cliente
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }

    console.log('📱 Confirmación WhatsApp generada:', url)
  } catch (error) {
    console.error('❌ Error al generar confirmación WhatsApp:', error)
  }
}

/**
 * Valida si un número de WhatsApp tiene el formato correcto
 */
export const validarWhatsApp = (whatsapp: string): boolean => {
  // Remover espacios, guiones y paréntesis para validar
  const numeroLimpio = whatsapp.replace(/[\s\-\(\)]/g, '')

  // Debe tener entre 8 y 20 dígitos (incluyendo código de país)
  const regexNumero = /^(\+?54)?[\d]{8,15}$/

  return regexNumero.test(numeroLimpio)
}

/**
 * Formatea un número de WhatsApp para mostrar de manera legible
 */
export const formatearWhatsApp = (whatsapp: string): string => {
  const numeroLimpio = whatsapp.replace(/[\s\-\(\)]/g, '')

  // Si es un número argentino, formatearlo como +54 223 XXX-XXXX
  if (numeroLimpio.startsWith('54223') || numeroLimpio.startsWith('+54223')) {
    const numero = numeroLimpio.replace(/^\+?54/, '')
    return `+54 ${numero.slice(0, 3)} ${numero.slice(3, 6)}-${numero.slice(6)}`
  }

  return whatsapp
}
