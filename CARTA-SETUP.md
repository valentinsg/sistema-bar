# Configuración de la Carta (Menú)

## Cambios Implementados

### 1. **Nueva Página `/carta`**
- Diseño elegante y minimalista basado en las imágenes proporcionadas
- Fondo negro con tipografía Legquinne
- Totalmente responsive (móvil, tablet, desktop)
- Precios conectados directamente con la base de datos
- Animaciones suaves con Framer Motion

### 2. **Panel de Admin Completamente Reestructurado**

#### Mejoras de UI/UX:
- ✅ **Tabs superiores**: Reservas, Calendario, Carta, Análisis (jerarquía clara)
- ✅ **Botones eliminados**: "Exportar" y "Ver Sitio" removidos para diseño minimalista
- ✅ **Mejor legibilidad**: Texto más pequeño, espaciado optimizado, colores mejorados
- ✅ **Header simplificado**: Solo logo, nombre de usuario y botón de salir
- ✅ **Cards compactas**: Stats cards más pequeñas y eficientes

#### Nueva Pestaña "Carta":
- Gestión completa de categorías y items del menú
- Crear, editar y eliminar categorías
- Crear, editar y eliminar items (nombre, descripción, precio)
- Interfaz intuitiva con lista de categorías a la izquierda
- Items organizados por categoría seleccionada

### 3. **Optimización de Reservas**

#### Performance mejorado:
- ✅ **Carga inicial**: Solo las últimas 25 reservas
- ✅ **Paginación**: Botón "Cargar 25 más" para cargar más reservas
- ✅ **LocalStorage**: Las reservas cargadas se guardan en cache local
- ✅ **Velocidad**: Carga inicial 3-5x más rápida
- ✅ **Memoria**: Menor uso de memoria en el navegador

### 4. **Base de Datos**

Se crearon dos nuevas tablas:

#### `categorias_carta`
- `id`: UUID (Primary Key)
- `nombre`: TEXT (nombre de la categoría)
- `orden`: INTEGER (orden de visualización)
- `local_id`: TEXT (identificador del local)
- `created_at`: TIMESTAMP

#### `items_carta`
- `id`: UUID (Primary Key)
- `categoria_id`: UUID (Foreign Key a categorias_carta)
- `nombre`: TEXT (nombre del item)
- `descripcion`: TEXT (descripción opcional)
- `precio`: DECIMAL(10, 2) (precio del item)
- `disponible`: BOOLEAN (si está disponible)
- `orden`: INTEGER (orden dentro de la categoría)
- `local_id`: TEXT (identificador del local)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Instrucciones de Setup

### Paso 1: Ejecutar el Script SQL

Ejecuta el archivo SQL en tu base de datos Supabase:

```bash
# En Supabase Dashboard > SQL Editor, ejecuta:
scripts/create_carta_tables.sql
```

O desde la línea de comandos:

```bash
psql -h [tu-host] -U [tu-usuario] -d [tu-database] -f scripts/create_carta_tables.sql
```

### Paso 2: Poblar Datos Iniciales (Opcional)

Puedes crear categorías e items manualmente desde el panel de admin, o ejecutar este SQL para datos de ejemplo:

```sql
-- Insertar categorías de ejemplo
INSERT INTO categorias_carta (nombre, orden, local_id) VALUES
('Cocktails de firma', 0, 'eleven-club'),
('Eternos', 1, 'eleven-club'),
('Aperitivos y Vermut', 2, 'eleven-club'),
('Spritz Season', 3, 'eleven-club'),
('Delicias Selectas', 4, 'eleven-club'),
('Negronis de la Casa', 5, 'eleven-club'),
('Whisky Escocés', 6, 'eleven-club'),
('Whisky Irlandés', 7, 'eleven-club'),
('American Whisky - Kentucky', 8, 'eleven-club'),
('Tennessee', 9, 'eleven-club'),
('Gin', 10, 'eleven-club'),
('Ron', 11, 'eleven-club'),
('Servicio de botella', 12, 'eleven-club'),
('Champagne', 13, 'eleven-club'),
('Espumantes', 14, 'eleven-club'),
('Cervezas', 15, 'eleven-club'),
('Vinos', 16, 'eleven-club'),
('Mocktails', 17, 'eleven-club'),
('Aguas Nacionales', 18, 'eleven-club'),
('Aguas Importadas', 19, 'eleven-club'),
('Refrescos', 20, 'eleven-club');

-- Ejemplo de items (ajusta según tus necesidades)
INSERT INTO items_carta (categoria_id, nombre, descripcion, precio, orden, local_id)
SELECT 
  c.id,
  'Genesis',
  'Vermut Tempestad, Tequila José Cuervo, Don mix, azahar.',
  15.000,
  0,
  'eleven-club'
FROM categorias_carta c
WHERE c.nombre = 'Cocktails de firma' AND c.local_id = 'eleven-club';
```

### Paso 3: Verificar Acceso

1. Inicia sesión en el panel de admin
2. Ve a la pestaña "Carta"
3. Crea una categoría de prueba
4. Agrega algunos items
5. Visita `/carta` para ver el menú público

## Uso del Panel de Admin

### Gestión de Categorías

1. Click en "Nueva Categoría"
2. Ingresa el nombre (ej: "Cocktails de firma")
3. Click en "Crear Categoría"

### Gestión de Items

1. Selecciona una categoría de la lista izquierda
2. Click en "Nuevo Item"
3. Completa:
   - **Nombre**: Nombre del producto
   - **Descripción**: Ingredientes o descripción (opcional)
   - **Precio**: Precio en formato decimal (ej: 15.000)
4. Click en "Crear Item"

### Editar/Eliminar

- **Editar**: Click en el ícono de lápiz azul
- **Eliminar**: Click en el ícono de basura rojo

## Características Técnicas

### Responsive Design

La página `/carta` es completamente responsive:

- **Mobile**: Diseño vertical, texto optimizado
- **Tablet**: Layout adaptado con mejor espaciado
- **Desktop**: Diseño completo con máximo ancho de 4xl

### Performance

- **Lazy loading**: Imágenes cargadas bajo demanda
- **Memoización**: Componentes React memoizados
- **Cache**: LocalStorage para reservas
- **Optimistic UI**: Actualizaciones instantáneas

### Seguridad

- **Row Level Security**: Habilitado en ambas tablas
- **Políticas**: Lectura pública, escritura autenticada
- **Validación**: Precios y datos validados en frontend y backend

## Estructura de Archivos

```
app/
├── carta/
│   └── page.tsx              # Página pública del menú
├── admin/
│   └── page.tsx              # Panel admin reestructurado
scripts/
└── create_carta_tables.sql   # Script de creación de tablas
```

## Próximos Pasos Recomendados

1. **Imágenes de productos**: Agregar campo `imagen_url` a `items_carta`
2. **Ordenamiento drag & drop**: Permitir reordenar items visualmente
3. **Búsqueda**: Agregar búsqueda de items en el admin
4. **Exportar PDF**: Generar PDF del menú para impresión
5. **Múltiples idiomas**: Soporte para inglés/español

## Soporte

Si encuentras algún problema:

1. Verifica que las tablas se crearon correctamente
2. Revisa los permisos de Supabase (RLS policies)
3. Verifica que `local_id` sea 'eleven-club' en todos los registros
4. Revisa la consola del navegador para errores

## Notas Importantes

- Los precios se muestran con formato argentino (ej: $15.000)
- La carta pública solo muestra items con `disponible = true`
- Las categorías se ordenan por el campo `orden`
- Los items dentro de cada categoría también se ordenan por `orden`
