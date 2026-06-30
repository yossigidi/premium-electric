// ============================================================================
// /api/products — CRUD over the D1 `products` table (Cloudflare Pages Function).
//
// This is the real database behind the smart builder. The admin panel commits
// the products the operator selected here (POST); the storefront + builder read
// them back (GET). Only reviewed-and-selected rows ever reach this endpoint —
// the review/approve gate lives in the admin UI.
//
//   GET    /api/products            → { products: [...] }   (all rows)
//   POST   /api/products            → { products: [...] }   body: { products: [...] }
//   DELETE /api/products?id=123     → { products: [...] }   (remove one)
//   DELETE /api/products?all=1      → { products: [] }      (wipe — admin "clear all")
//
// Binding: env.DB (the D1 database; see wrangler.toml). Without it the function
// returns 503 so the client falls back to its local cache.
// ============================================================================

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' }
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_HEADERS })

const VALID_TIERS = new Set(['base', 'designed', 'luxury', 'premium'])

const parseJson = (s, fallback) => {
  try { const v = JSON.parse(s); return v ?? fallback } catch { return fallback }
}

// --- Row (snake_case, D1) → product (camelCase, app shape) -------------------
function rowToProduct(row) {
  const tags = parseJson(row.tags || '[]', [])
  return {
    id: row.id,
    name: row.name,
    brand: row.brand || '',
    model: row.model || '',
    category: row.category,
    brandTier: row.brand_tier || 'base',
    price: row.price ?? undefined,
    oldPrice: row.old_price ?? undefined,
    zapLow: row.zap_low ?? row.price ?? undefined,
    image: row.image || '',
    tags: Array.isArray(tags) ? tags : [],
    shortDescription: row.short_description || '',
    description: parseJson(row.description || '[]', []),  // paragraph strings
    features: parseJson(row.features || '[]', []),        // { title, text }
    specs: parseJson(row.specs || '{}', {}),              // category -> [{ label, value }]
    warranty: row.warranty || '',
    inStock: row.in_stock !== 0,
    source: row.source || 'admin',
  }
}

// --- Product (app shape) → column values (order shared by INSERT & UPDATE) ---
function productToColumns(p) {
  const tier = VALID_TIERS.has(p.brandTier) ? p.brandTier : 'base'
  const price = Number.isFinite(Number(p.price)) ? Number(p.price) : null
  const zapLow = Number.isFinite(Number(p.zapLow)) ? Number(p.zapLow) : price
  const arr = (v) => JSON.stringify(Array.isArray(v) ? v : [])
  const obj = (v) => JSON.stringify(v && typeof v === 'object' && !Array.isArray(v) ? v : {})
  return [
    String(p.name || '').trim(),
    String(p.brand || ''),
    String(p.model || ''),
    String(p.category || '').trim(),
    tier,
    price,
    Number.isFinite(Number(p.oldPrice)) ? Number(p.oldPrice) : null,
    zapLow,
    String(p.image || ''),
    arr(p.tags),
    String(p.shortDescription || ''),
    arr(p.description),
    arr(p.features),
    obj(p.specs),
    String(p.warranty || ''),
    p.inStock === false ? 0 : 1,
    String(p.source || 'admin'),
  ]
}

const COLS = 'name, brand, model, category, brand_tier, price, old_price, zap_low, image, tags, short_description, description, features, specs, warranty, in_stock, source'
const PLACEHOLDERS = COLS.split(',').map(() => '?').join(', ')
const INSERT_SQL = `INSERT INTO products (${COLS}) VALUES (${PLACEHOLDERS})`

async function listAll(db) {
  const { results } = await db.prepare('SELECT * FROM products ORDER BY id').all()
  return (results || []).map(rowToProduct)
}

const noDb = () =>
  json({ error: 'no_db', message: 'מסד הנתונים (D1) לא מחובר. בדוק את ה-binding בשם DB.' }, 503)

export async function onRequestGet({ env }) {
  if (!env.DB) return noDb()
  try {
    return json({ products: await listAll(env.DB) })
  } catch (e) {
    return json({ error: 'db_error', message: String(e).slice(0, 300) }, 500)
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return noDb()
  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }
  const incoming = Array.isArray(body?.products) ? body.products : []
  // A product needs only a name; category/price can be completed later via PUT.
  const valid = incoming.filter((p) => p && String(p.name || '').trim())
  if (!valid.length) return json({ error: 'no_valid_products' }, 422)

  try {
    const stmt = env.DB.prepare(INSERT_SQL)
    await env.DB.batch(valid.map((p) => stmt.bind(...productToColumns(p))))
    return json({ products: await listAll(env.DB), inserted: valid.length })
  } catch (e) {
    return json({ error: 'db_error', message: String(e).slice(0, 300) }, 500)
  }
}

const UPDATE_SQL = `UPDATE products SET ${COLS.split(', ').map((c) => `${c}=?`).join(', ')} WHERE id=?`

export async function onRequestPut({ request, env }) {
  if (!env.DB) return noDb()
  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }
  const id = Number(body?.id)
  if (!Number.isInteger(id)) return json({ error: 'bad_id' }, 400)
  if (!String(body?.name || '').trim()) return json({ error: 'name_required' }, 422)
  try {
    await env.DB.prepare(UPDATE_SQL).bind(...productToColumns(body), id).run()
    return json({ products: await listAll(env.DB) })
  } catch (e) {
    return json({ error: 'db_error', message: String(e).slice(0, 300) }, 500)
  }
}

export async function onRequestDelete({ request, env }) {
  if (!env.DB) return noDb()
  const url = new URL(request.url)
  try {
    if (url.searchParams.get('all') === '1') {
      await env.DB.prepare('DELETE FROM products').run()
    } else {
      const id = Number(url.searchParams.get('id'))
      if (!Number.isInteger(id)) return json({ error: 'bad_id' }, 400)
      await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run()
    }
    return json({ products: await listAll(env.DB) })
  } catch (e) {
    return json({ error: 'db_error', message: String(e).slice(0, 300) }, 500)
  }
}
