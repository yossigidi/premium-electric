// ============================================================================
// Ingest parsing + normalization.
//
// Turns raw tabular input (CSV / pasted spreadsheet rows) into the catalog
// product shape the builder understands. Header matching is bilingual
// (Hebrew + English) and tolerant of spacing/case so a manager can paste an
// export straight out of Excel.
//
// The same `normalizeProduct` is also applied to rows the server function
// (functions/api/ingest.js) extracts from PDF/Word/URL, so every path produces
// identically-shaped products before they reach the review table.
// ============================================================================
import { applianceTypes, TIER_IDS } from '../data/builderCatalog'

// --- Field → accepted header aliases (lowercased, trimmed) ------------------
const FIELD_ALIASES = {
  name:        ['name', 'product', 'title', 'שם', 'שם מוצר', 'מוצר', 'תיאור קצר'],
  brand:       ['brand', 'manufacturer', 'מותג', 'יצרן', 'חברה'],
  model:       ['model', 'sku', 'מקט', 'מק"ט', 'מקט יצרן', 'דגם', 'מספר דגם'],
  category:    ['category', 'type', 'קטגוריה', 'סוג', 'סוג מוצר', 'מחלקה'],
  brandTier:   ['tier', 'brandtier', 'brand tier', 'רמה', 'רמת מותג', 'דרגה'],
  price:       ['price', 'cost', 'מחיר', 'מחיר מחירון', 'מחיר קטלוגי'],
  zapLow:      ['zaplow', 'zap', 'zap low', 'מחיר זאפ', 'זאפ', 'מחיר זאף', 'זאף', 'מחיר שוק', 'מחיר נמוך'],
  oldPrice:    ['oldprice', 'old price', 'list price', 'מחיר ישן', 'מחיר קודם'],
  image:       ['image', 'img', 'photo', 'image url', 'תמונה', 'קישור תמונה'],
  tags:        ['tags', 'features', 'specs', 'מאפיינים', 'תגיות', 'מפרט'],
  shortDescription: ['description', 'desc', 'details', 'תיאור', 'פירוט'],
}

// Reverse lookup: alias -> canonical field.
const ALIAS_TO_FIELD = {}
for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
  for (const a of aliases) ALIAS_TO_FIELD[a] = field
}

// --- Category normalization: free text -> applianceType id ------------------
const CATEGORY_HINTS = [
  ['refrigerators', ['refrigerator', 'fridge', 'מקרר', 'מקררים']],
  ['ovens', ['oven', 'תנור', 'תנורים']],
  ['cooktops', ['cooktop', 'stove', 'hob', 'כיריים', 'כירה']],
  ['washers', ['washer', 'washing', 'מכונת כביסה', 'כביסה']],
  ['dryers', ['dryer', 'מייבש', 'מייבשים']],
  ['dishwashers', ['dishwasher', 'מדיח', 'מדיחים']],
  ['robot-vacuums', ['robot', 'vacuum', 'שואב', 'רובוטי', 'שואב אבק']],
  ['tv', ['tv', 'television', 'טלוויזיה', 'טלויזיה', 'מסך']],
  ['audio', ['audio', 'speaker', 'sound', 'שמע', 'רמקול', 'סאונד']],
  ['computers', ['computer', 'laptop', 'pc', 'מחשב', 'לפטופ', 'נייד']],
]
const VALID_CATEGORIES = new Set(applianceTypes.map((t) => t.id))

export function normalizeCategory(raw) {
  if (!raw) return ''
  const v = String(raw).trim().toLowerCase()
  if (VALID_CATEGORIES.has(v)) return v
  for (const [id, hints] of CATEGORY_HINTS) {
    if (hints.some((h) => v.includes(h))) return id
  }
  return '' // unknown -> manager picks in the review table
}

// --- Tier normalization -----------------------------------------------------
const TIER_HINTS = {
  base:     ['base', 'בסיס', 'תקציב', 'זול', 'בסיסי', 'low', 'budget'],
  designed: ['designed', 'מעוצב', 'design', 'smeg'],
  luxury:   ['luxury', 'יוקרה', 'exclusive', 'miele', 'gaggenau', 'liebherr'],
  premium:  ['premium', 'פרימיום', 'פרמיום', 'דגל', 'high', 'mid', 'בינוני', 'samsung', 'bosch', 'aeg'],
}
export function normalizeTier(raw) {
  if (!raw) return 'base' // safe default when no tier given (admin can refine)
  const v = String(raw).trim().toLowerCase()
  if (TIER_IDS.includes(v)) return v
  for (const [id, hints] of Object.entries(TIER_HINTS)) {
    if (hints.some((h) => v.includes(h))) return id
  }
  return 'base'
}

// --- Price parsing: strip ₪, commas, spaces ---------------------------------
export function parsePrice(raw) {
  if (raw == null || raw === '') return undefined
  const n = Number(String(raw).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined
}

function parseTags(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean).map((t) => String(t).trim())
  return String(raw)
    .split(/[;,|]/)
    .map((t) => t.trim())
    .filter(Boolean)
}

/**
 * Normalize one loosely-typed record (already keyed by canonical or alias
 * field names) into the catalog product shape used by the builder + store.
 */
export function normalizeProduct(rec = {}) {
  // Allow callers to pass either canonical keys or raw header aliases.
  const get = (field) => {
    if (rec[field] != null && rec[field] !== '') return rec[field]
    for (const alias of FIELD_ALIASES[field] || []) {
      if (rec[alias] != null && rec[alias] !== '') return rec[alias]
    }
    return ''
  }

  const price = parsePrice(get('price'))
  const zapLow = parsePrice(get('zapLow'))
  return {
    name: String(get('name') || '').trim(),
    brand: String(get('brand') || '').trim(),
    model: String(get('model') || '').trim(),
    category: normalizeCategory(get('category')),
    brandTier: normalizeTier(get('brandTier')),
    price,
    // Pricing baseline defaults to the entered price until phase-3 Zap lookup.
    zapLow: zapLow ?? price,
    oldPrice: parsePrice(get('oldPrice')),
    image: String(get('image') || '').trim(),
    tags: parseTags(get('tags')),
    shortDescription: String(get('shortDescription') || '').trim(),
  }
}

// --- CSV parsing (RFC-4180-ish: quotes, escaped quotes, commas in quotes) ---
function splitCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',' || c === '\t') {
      row.push(field); field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((f) => f.trim() !== '')) rows.push(row)
      row = []
    } else field += c
  }
  if (field !== '' || row.length) { row.push(field); if (row.some((f) => f.trim() !== '')) rows.push(row) }
  return rows
}

/**
 * Parse pasted/uploaded CSV or tab-separated text into normalized products.
 * First non-empty row is treated as the header.
 * @returns {{ products: object[], unmappedHeaders: string[], rowCount: number }}
 */
export function parseDelimited(text) {
  const rows = splitCsv(String(text || '').trim())
  if (rows.length < 2) return { products: [], unmappedHeaders: [], rowCount: 0 }

  const headers = rows[0].map((h) => h.trim())
  const fields = headers.map((h) => ALIAS_TO_FIELD[h.toLowerCase()] || null)
  const unmappedHeaders = headers.filter((_, i) => !fields[i])

  const products = rows.slice(1).map((cells) => {
    const rec = {}
    fields.forEach((field, i) => {
      if (field) rec[field] = cells[i]
    })
    return normalizeProduct(rec)
  })

  return { products, unmappedHeaders, rowCount: products.length }
}

/** A blank product row for manual entry in the review table. */
export function blankProduct() {
  return {
    name: '', brand: '', model: '', category: '', brandTier: 'designed',
    price: undefined, zapLow: undefined, oldPrice: undefined,
    image: '', tags: [], shortDescription: '',
  }
}

/**
 * Validate a product for save-readiness. Returns an array of problem strings
 * (empty = ready). Used by the review table to gate the per-row checkbox.
 */
export function validateProduct(p) {
  const problems = []
  if (!p.name?.trim()) problems.push('חסר שם מוצר')
  if (!p.category) problems.push('חסרה קטגוריה')
  if (!(p.price > 0) && !(p.zapLow > 0)) problems.push('חסר מחיר')
  return problems
}
