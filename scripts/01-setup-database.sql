-- Crear tabla de locales (si no existe)
CREATE TABLE IF NOT EXISTS locales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id UUID REFERENCES locales(id),
  nombre TEXT NOT NULL,
  contacto TEXT NOT NULL,
  fecha DATE NOT NULL,
  horario TEXT NOT NULL,
  cantidad_personas INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla para el contador de personas por día
CREATE TABLE IF NOT EXISTS contador_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id UUID REFERENCES locales(id),
  fecha DATE NOT NULL,
  cantidad INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(local_id, fecha)
);

-- Crear tabla de usuarios admin
CREATE TABLE IF NOT EXISTS usuarios_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id UUID REFERENCES locales(id),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  token_acceso TEXT,
  rol TEXT DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar un local de ejemplo si no existe
INSERT INTO locales (nombre, slug, activo) 
VALUES ('Nocturnos', 'nocturnos', true) 
ON CONFLICT (slug) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contador_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_admin ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad básicas (permitir todo por ahora)
CREATE POLICY "Allow all operations on locales" ON locales FOR ALL USING (true);
CREATE POLICY "Allow all operations on reservas" ON reservas FOR ALL USING (true);
CREATE POLICY "Allow all operations on contador_personas" ON contador_personas FOR ALL USING (true);
CREATE POLICY "Allow all operations on usuarios_admin" ON usuarios_admin FOR ALL USING (true);
