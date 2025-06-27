# Carta del Bar con QR - Eleven Club

## Descripción

Esta funcionalidad permite a los clientes acceder a la carta del bar escaneando un código QR desde sus dispositivos móviles. La carta está optimizada para dispositivos móviles y ofrece una experiencia de usuario moderna y atractiva.

## Características

- **Acceso por QR**: Los clientes pueden acceder a la carta escaneando un código QR
- **Diseño Responsivo**: Optimizado para dispositivos móviles
- **Categorías Organizadas**: Tragos organizados por categorías (Cócteles Clásicos, Sin Alcohol, Cervezas, Vinos)
- **Información Detallada**: Cada trago incluye descripción, precio, ingredientes y tipo (alcohólico/sin alcohol)
- **Generador de QR**: Panel de administración para generar y descargar códigos QR

## Rutas Disponibles

### `/carta`
- **Acceso**: Público (por QR)
- **Descripción**: Página principal de la carta del bar
- **Características**:
  - Diseño optimizado para móviles
  - Interfaz atractiva con gradientes y efectos visuales
  - Información completa de cada trago
  - Categorización clara

### `/admin/qr-carta`
- **Acceso**: Solo administradores
- **Descripción**: Generador de códigos QR para la carta
- **Características**:
  - Generación automática del QR
  - Descarga del código QR en formato PNG
  - Copia de la URL de la carta
  - Vista previa de cómo se ve en móviles
  - Instrucciones de uso

## Cómo Usar

### Para Administradores

1. **Acceder al Generador de QR**:
   - Inicia sesión en el panel de administración
   - Haz clic en el botón "QR Carta" en el header
   - O navega directamente a `/admin/qr-carta`

2. **Generar el QR**:
   - El sistema genera automáticamente el QR con la URL de la carta
   - La URL base se configura automáticamente

3. **Descargar el QR**:
   - Haz clic en "Descargar QR"
   - El archivo se descarga como `qr-carta-eleven.png`

4. **Implementar en el Local**:
   - Imprime el código QR
   - Colócalo en las mesas del bar
   - Asegúrate de que sea visible y accesible

### Para Clientes

1. **Escanear el QR**:
   - Usa la cámara de tu teléfono o una app de QR
   - Apunta hacia el código QR en la mesa

2. **Acceder a la Carta**:
   - Se abrirá automáticamente la página de la carta
   - Navega por las diferentes categorías
   - Revisa precios, descripciones e ingredientes

## Estructura de Datos

### Tragos
Cada trago incluye:
- **id**: Identificador único
- **nombre**: Nombre del trago
- **descripcion**: Descripción detallada
- **precio**: Precio en pesos
- **categoria**: Categoría del trago
- **ingredientes**: Lista de ingredientes
- **alcoholico**: Boolean indicando si contiene alcohol

### Categorías Disponibles
- Cócteles Clásicos
- Sin Alcohol
- Cervezas
- Vinos

## Personalización

### Agregar Nuevos Tragos
Para agregar nuevos tragos, edita el archivo `app/carta/page.tsx` y agrega nuevos objetos al array `tragos`:

```typescript
{
  id: "11",
  nombre: "Nuevo Trago",
  descripcion: "Descripción del nuevo trago",
  precio: 1500,
  categoria: "Cócteles Clásicos",
  ingredientes: ["Ingrediente 1", "Ingrediente 2"],
  alcoholico: true
}
```

### Modificar Categorías
Para agregar o modificar categorías, edita el array `categorias` en el mismo archivo.

### Cambiar Estilos
Los estilos están definidos usando Tailwind CSS. Puedes modificar las clases en el componente para cambiar la apariencia.

## Consideraciones Técnicas

### Optimización Móvil
- Viewport configurado para dispositivos móviles
- Diseño responsive con grid adaptativo
- Tamaños de fuente optimizados para pantallas pequeñas
- Interacciones táctiles consideradas

### Performance
- Carga estática de datos (no requiere API calls)
- Optimización de imágenes y assets
- Código QR generado dinámicamente

### Seguridad
- La carta es de acceso público (no requiere autenticación)
- El generador de QR requiere autenticación de administrador
- No se almacenan datos sensibles

## Mantenimiento

### Actualizar Precios
Para actualizar precios, modifica el array `tragos` en `app/carta/page.tsx`.

### Agregar Promociones
Puedes agregar badges de promoción modificando el componente de cada trago.

### Cambiar URL Base
Si cambias el dominio, actualiza la variable `baseUrl` en `app/admin/qr-carta/page.tsx`.

## Troubleshooting

### QR No Funciona
- Verifica que la URL base sea correcta
- Asegúrate de que la ruta `/carta` esté funcionando
- Prueba el QR con diferentes apps de escaneo

### Carta No Se Ve Bien en Móvil
- Verifica que el viewport esté configurado correctamente
- Revisa las clases de Tailwind para responsive design
- Prueba en diferentes dispositivos

### Problemas de Carga
- Verifica que todos los componentes UI estén importados correctamente
- Revisa la consola del navegador para errores
- Asegúrate de que las dependencias estén instaladas

## Próximas Mejoras

- [ ] Integración con sistema de pedidos
- [ ] Fotos de los tragos
- [ ] Filtros por precio y tipo
- [ ] Búsqueda de tragos
- [ ] Información nutricional
- [ ] Recomendaciones personalizadas
- [ ] Sistema de favoritos
- [ ] Integración con redes sociales
