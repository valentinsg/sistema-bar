-- MIGRACIÓN SEGURA PASO A PASO
-- Ejecutar estas consultas una por una en Supabase SQL Editor

-- PASO 1: Agregar las nuevas columnas (siempre seguro)
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS quiere_newsletter BOOLEAN DEFAULT false;

-- PASO 2: Verificar la estructura actual
SELECT id, nombre, contacto, email, whatsapp, quiere_newsletter
FROM reservas
ORDER BY created_at DESC
LIMIT 5;

-- PASO 3: Migrar emails (contactos que contienen @)
UPDATE reservas
SET email = contacto
WHERE contacto LIKE '%@%'
  AND (email IS NULL OR email = '');

-- PASO 4: Migrar teléfonos (contactos que NO contienen @)
UPDATE reservas
SET whatsapp = contacto
WHERE contacto NOT LIKE '%@%'
  AND (whatsapp IS NULL OR whatsapp = '');

-- PASO 5: Revisar qué registros tienen problemas
SELECT 'Registros problemáticos:' as info;
SELECT id, nombre, contacto, email, whatsapp
FROM reservas
WHERE (email IS NULL OR email = '')
   OR (whatsapp IS NULL OR whatsapp = '');

-- PASO 6: Corregir registros problemáticos manualmente
-- Solo ejecutar si hay registros problemáticos del paso anterior

-- Para registros sin email ni WhatsApp, asumir que contacto es teléfono
UPDATE reservas
SET whatsapp = contacto,
    email = 'cliente@eleven-club.com'
WHERE (email IS NULL OR email = '')
  AND (whatsapp IS NULL OR whatsapp = '');

-- Para registros con email pero sin WhatsApp
UPDATE reservas
SET whatsapp = '223-000-0000'
WHERE (whatsapp IS NULL OR whatsapp = '')
  AND (email IS NOT NULL AND email != '');

-- PASO 7: Verificar que todo está correcto
SELECT 'Verificación final:' as info;
SELECT
  COUNT(*) as total_registros,
  COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as con_email,
  COUNT(CASE WHEN whatsapp IS NOT NULL AND whatsapp != '' THEN 1 END) as con_whatsapp,
  COUNT(CASE WHEN quiere_newsletter = true THEN 1 END) as quiere_newsletter
FROM reservas;

-- PASO 8: Ver algunos registros de ejemplo
SELECT id, nombre, email, whatsapp, quiere_newsletter, created_at
FROM reservas
ORDER BY created_at DESC
LIMIT 10;
