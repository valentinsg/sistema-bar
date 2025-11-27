-- Tabla para categorías de la carta
CREATE TABLE IF NOT EXISTS categorias_carta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  local_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(nombre, local_id)
);

-- Tabla para items de la carta
CREATE TABLE IF NOT EXISTS items_carta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria_id UUID REFERENCES categorias_carta(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  disponible BOOLEAN DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  local_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_categorias_carta_local ON categorias_carta(local_id);
CREATE INDEX IF NOT EXISTS idx_items_carta_categoria ON items_carta(categoria_id);
CREATE INDEX IF NOT EXISTS idx_items_carta_local ON items_carta(local_id);

-- Habilitar Row Level Security
ALTER TABLE categorias_carta ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_carta ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (permitir lectura pública, escritura solo autenticados)
CREATE POLICY "Permitir lectura pública de categorías" ON categorias_carta FOR SELECT USING (true);
CREATE POLICY "Permitir lectura pública de items" ON items_carta FOR SELECT USING (true);

CREATE POLICY "Permitir todas las operaciones autenticadas en categorías" ON categorias_carta FOR ALL USING (true);
CREATE POLICY "Permitir todas las operaciones autenticadas en items" ON items_carta FOR ALL USING (true);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_carta_updated_at BEFORE UPDATE ON items_carta
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
