/*
# Tô Aonde? — Shopping mall community guide schema

## Overview
Creates the full data model for a community-driven shopping mall guide app.
Users can browse malls and stores, search with natural language, post promotions,
report store changes, and save their car location. No authentication required —
the app is intentionally public/shared (single-tenant, anon-accessible).

## New Tables

1. shoppings — shopping malls
   - id (uuid, PK)
   - nome (text, not null) — mall name
   - cidade (text, not null) — city
   - aberto (boolean, default true) — currently open
   - created_at (timestamptz)

2. lojas — stores inside a mall
   - id (uuid, PK)
   - shopping_id (uuid, FK → shoppings)
   - nome (text, not null) — store name
   - piso (text, not null) — floor (L1, L2, L3...)
   - cat (text, not null) — category (moda, eletro, beleza, etc.)
   - tags (text[]) — searchable tags
   - created_at (timestamptz)

3. promocoes — community-posted promotions
   - id (uuid, PK)
   - loja_id (uuid, FK → lojas)
   - shopping_id (uuid, FK → shoppings)
   - descricao (text, not null) — promo text
   - autor (text, not null) — poster nickname
   - confirmacoes (int, default 0) — "confirmed by" count
   - created_at (timestamptz)

4. reports — community reports about stores
   - id (uuid, PK)
   - loja_id (uuid, FK → lojas, nullable)
   - shopping_id (uuid, FK → shoppings)
   - tipo (text, not null) — 'mudou', 'fechou', 'nova'
   - descricao (text)
   - autor (text, not null)
   - created_at (timestamptz)

5. carro_salvo — saved car locations
   - id (uuid, PK)
   - shopping_id (uuid, FK → shoppings)
   - localizacao (text, not null) — description of where the car is parked
   - observacao (text)
   - created_at (timestamptz)

## Security
- RLS enabled on all tables.
- All tables use `TO anon, authenticated` because this is a no-auth, public/shared app.
- Full CRUD for anon on all tables (data is intentionally community-shared).
*/

-- Shoppings table
CREATE TABLE IF NOT EXISTS shoppings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cidade text NOT NULL,
  aberto boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Lojas table
CREATE TABLE IF NOT EXISTS lojas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_id uuid NOT NULL REFERENCES shoppings(id) ON DELETE CASCADE,
  nome text NOT NULL,
  piso text NOT NULL,
  cat text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Promocoes table
CREATE TABLE IF NOT EXISTS promocoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id uuid REFERENCES lojas(id) ON DELETE CASCADE,
  shopping_id uuid NOT NULL REFERENCES shoppings(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  autor text NOT NULL,
  confirmacoes int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loja_id uuid REFERENCES lojas(id) ON DELETE CASCADE,
  shopping_id uuid NOT NULL REFERENCES shoppings(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  descricao text,
  autor text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Carro salvo table
CREATE TABLE IF NOT EXISTS carro_salvo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_id uuid NOT NULL REFERENCES shoppings(id) ON DELETE CASCADE,
  localizacao text NOT NULL,
  observacao text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE shoppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE carro_salvo ENABLE ROW LEVEL SECURITY;

-- Shoppings policies (public CRUD)
DROP POLICY IF EXISTS "anon_select_shoppings" ON shoppings;
CREATE POLICY "anon_select_shoppings" ON shoppings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_shoppings" ON shoppings;
CREATE POLICY "anon_insert_shoppings" ON shoppings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_shoppings" ON shoppings;
CREATE POLICY "anon_update_shoppings" ON shoppings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_shoppings" ON shoppings;
CREATE POLICY "anon_delete_shoppings" ON shoppings FOR DELETE
  TO anon, authenticated USING (true);

-- Lojas policies (public CRUD)
DROP POLICY IF EXISTS "anon_select_lojas" ON lojas;
CREATE POLICY "anon_select_lojas" ON lojas FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_lojas" ON lojas;
CREATE POLICY "anon_insert_lojas" ON lojas FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_lojas" ON lojas;
CREATE POLICY "anon_update_lojas" ON lojas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_lojas" ON lojas;
CREATE POLICY "anon_delete_lojas" ON lojas FOR DELETE
  TO anon, authenticated USING (true);

-- Promocoes policies (public CRUD)
DROP POLICY IF EXISTS "anon_select_promocoes" ON promocoes;
CREATE POLICY "anon_select_promocoes" ON promocoes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_promocoes" ON promocoes;
CREATE POLICY "anon_insert_promocoes" ON promocoes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_promocoes" ON promocoes;
CREATE POLICY "anon_update_promocoes" ON promocoes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_promocoes" ON promocoes;
CREATE POLICY "anon_delete_promocoes" ON promocoes FOR DELETE
  TO anon, authenticated USING (true);

-- Reports policies (public CRUD)
DROP POLICY IF EXISTS "anon_select_reports" ON reports;
CREATE POLICY "anon_select_reports" ON reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reports" ON reports;
CREATE POLICY "anon_insert_reports" ON reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reports" ON reports;
CREATE POLICY "anon_update_reports" ON reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reports" ON reports;
CREATE POLICY "anon_delete_reports" ON reports FOR DELETE
  TO anon, authenticated USING (true);

-- Carro salvo policies (public CRUD)
DROP POLICY IF EXISTS "anon_select_carro" ON carro_salvo;
CREATE POLICY "anon_select_carro" ON carro_salvo FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_carro" ON carro_salvo;
CREATE POLICY "anon_insert_carro" ON carro_salvo FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_carro" ON carro_salvo;
CREATE POLICY "anon_update_carro" ON carro_salvo FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_carro" ON carro_salvo;
CREATE POLICY "anon_delete_carro" ON carro_salvo FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lojas_shopping_id ON lojas(shopping_id);
CREATE INDEX IF NOT EXISTS idx_lojas_piso ON lojas(piso);
CREATE INDEX IF NOT EXISTS idx_promocoes_loja_id ON promocoes(loja_id);
CREATE INDEX IF NOT EXISTS idx_promocoes_shopping_id ON promocoes(shopping_id);
CREATE INDEX IF NOT EXISTS idx_promocoes_created_at ON promocoes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_shopping_id ON reports(shopping_id);
CREATE INDEX IF NOT EXISTS idx_carro_shopping_id ON carro_salvo(shopping_id);
