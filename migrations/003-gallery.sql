-- ============================================================================
-- Migration 003 — product image gallery.
--
-- Adds an `images` column (JSON array of image URLs / data URLs) so a product
-- can carry a full gallery, like the showroom products. `image` stays as the
-- primary (first) image used on cards. Run ONCE against the D1 database:
--
--   Dashboard → D1 → premium-electric → Console → paste & Execute
--   (or: wrangler d1 execute premium-electric --remote --file=./migrations/003-gallery.sql)
--
-- "duplicate column" error = already applied; ignore it.
-- ============================================================================

ALTER TABLE products ADD COLUMN images TEXT DEFAULT '[]';
