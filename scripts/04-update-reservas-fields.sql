-- Script para actualizar tabla reservas con campos separados de email y WhatsApp
-- IMPORTANTE: Ejecutar en orden, paso a paso

-- 1. Agregar nuevos campos a la tabla reservas
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS quiere_newsletter BOOLEAN DEFAULT false;

-- 2. Migrar datos existentes del campo contacto
-- Detectar emails (contienen @)
UPDATE reservas
SET email = contacto
WHERE contacto LIKE '%@%' AND (email IS NULL OR email = '');

-- Detectar teléfonos (solo números, espacios, guiones, paréntesis, +)
UPDATE reservas
SET whatsapp = contacto
WHERE contacto NOT LIKE '%@%'
  AND contacto ~ '^[0-9\+\-\s\(\)]+$'
  AND (whatsapp IS NULL OR whatsapp = '');

-- 3. Para registros que no pudieron ser clasificados automáticamente
-- Revisar qué registros tienen problemas
SELECT id, nombre, contacto, email, whatsapp
FROM reservas
WHERE (email IS NULL OR email = '')
   OR (whatsapp IS NULL OR whatsapp = '');

-- 4. Solución para registros problemáticos
-- Si el contacto parece un email pero no tiene @, asumir que es teléfono
UPDATE reservas
SET whatsapp = contacto,
    email = 'sin-email@eleven-club.com'  -- Email temporal para registros sin email
WHERE (email IS NULL OR email = '')
  AND (whatsapp IS NULL OR whatsapp = '');

-- Si tiene email pero no whatsapp, poner un teléfono temporal
UPDATE reservas
SET whatsapp = '223-000-0000'  -- Teléfono temporal para registros sin WhatsApp
WHERE (whatsapp IS NULL OR whatsapp = '')
  AND (email IS NOT NULL AND email != '');

-- 5. Verificar que no hay NULLs antes de hacer NOT NULL
SELECT 'Registros con email NULL:' as info, COUNT(*) as cantidad
FROM reservas
WHERE email IS NULL OR email = '';

SELECT 'Registros con whatsapp NULL:' as info, COUNT(*) as cantidad
FROM reservas
WHERE whatsapp IS NULL OR whatsapp = '';

-- 6. Solo hacer NOT NULL si no hay registros problemáticos
-- EJECUTAR SOLO SI LAS CONSULTAS ANTERIORES DEVUELVEN 0
-- ALTER TABLE reservas ALTER COLUMN email SET NOT NULL;
-- ALTER TABLE reservas ALTER COLUMN whatsapp SET NOT NULL;

-- 7. Agregar constrains de validación (opcional - puede fallar con datos temporales)
-- ALTER TABLE reservas ADD CONSTRAINT email_format CHECK (
--   email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
--   OR email = 'sin-email@eleven-club.com'
-- );
-- ALTER TABLE reservas ADD CONSTRAINT whatsapp_format CHECK (
--   whatsapp ~* '^[0-9\-\+\s\(\)]{8,20}$'
-- );

-- 8. Comentarios para documentación
COMMENT ON COLUMN reservas.email IS 'Email del cliente (obligatorio)';
COMMENT ON COLUMN reservas.whatsapp IS 'Número de WhatsApp del cliente (obligatorio)';
COMMENT ON COLUMN reservas.contacto IS 'Campo legacy - mantener por compatibilidad';
COMMENT ON COLUMN reservas.quiere_newsletter IS 'Indica si el cliente quiere recibir noticias/newsletter';

-- 9. Ver resultado final
SELECT id, nombre, contacto, email, whatsapp, quiere_newsletter, created_at
FROM reservas
ORDER BY created_at DESC
LIMIT 10;
