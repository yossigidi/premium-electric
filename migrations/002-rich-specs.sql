-- ============================================================================
-- Migration 002 — rich product detail columns.
--
-- Adds the full-spec-sheet fields so ingested products can carry the same depth
-- as the showroom catalog (description paragraphs, highlighted features, and
-- categorized spec tables). Run ONCE against the existing D1 database:
--
--   Dashboard → D1 → premium-electric → Console → paste & Execute
--   (or: wrangler d1 execute premium-electric --remote --file=./migrations/002-rich-specs.sql)
--
-- Safe to run once; SQLite has no "ADD COLUMN IF NOT EXISTS", so if a column
-- already exists the statement errors — that just means it was already applied.
-- ============================================================================

ALTER TABLE products ADD COLUMN description TEXT DEFAULT '[]';
ALTER TABLE products ADD COLUMN features    TEXT DEFAULT '[]';
ALTER TABLE products ADD COLUMN specs       TEXT DEFAULT '{}';
ALTER TABLE products ADD COLUMN warranty    TEXT DEFAULT '';
