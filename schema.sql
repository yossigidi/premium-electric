-- ============================================================================
-- Cloudflare D1 schema — the `products` table behind the admin ingest panel.
--
-- This is the real database the smart builder recommends from. The admin panel
-- writes reviewed/approved products here (POST /api/products); the storefront +
-- package builder read them back (GET /api/products). One row per product.
--
-- Apply once after creating the D1 database:
--   wrangler d1 execute premium-electric --remote --file=./schema.sql
-- (or paste this file in the Cloudflare dashboard → D1 → Console).
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  name             TEXT    NOT NULL,
  brand            TEXT    DEFAULT '',
  model            TEXT    DEFAULT '',
  category         TEXT    NOT NULL,
  brand_tier       TEXT    DEFAULT 'base',     -- base | designed | luxury | premium
  price            REAL,                        -- catalog/list price (NIS)
  old_price        REAL,                        -- struck-through "was" price (NIS)
  zap_low          REAL,                        -- market-low baseline; defaults to price
  image            TEXT    DEFAULT '',          -- primary image (cards) = images[0]
  images           TEXT    DEFAULT '[]',         -- JSON array of gallery image URLs/data-URLs
  tags             TEXT    DEFAULT '[]',        -- JSON array of short feature strings
  short_description TEXT   DEFAULT '',
  description      TEXT    DEFAULT '[]',         -- JSON array of paragraph strings
  features         TEXT    DEFAULT '[]',         -- JSON array of { title, text }
  specs            TEXT    DEFAULT '{}',         -- JSON object: category -> [{ label, value }]
  warranty         TEXT    DEFAULT '',
  in_stock         INTEGER DEFAULT 1,           -- 0/1 boolean
  source           TEXT    DEFAULT 'admin',     -- where it was ingested from
  created_at       TEXT    DEFAULT (datetime('now'))
);

-- The builder scopes candidates by category, so index it.
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
