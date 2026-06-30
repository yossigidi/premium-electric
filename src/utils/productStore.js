// ============================================================================
// Product store — the admin-ingested products layer.
//
// Source of truth is the Cloudflare D1 `products` table, reached through the
// /api/products Pages Function. localStorage is a local CACHE of that table:
//   • reads (getIngestedProducts) are synchronous off the cache, so the rest of
//     the app — builderCatalog/candidatesFor, the storefront — never changes;
//   • syncFromServer() hydrates the cache from D1 on app load;
//   • writes (add/remove/clear) go to D1, then refresh the cache from the
//     server's authoritative response and notify listeners.
//
// Offline fallback: when /api/products is unreachable (plain `vite dev` with no
// wrangler/D1, or an outage) the writes degrade to cache-only so the admin keeps
// working locally. In production on Cloudflare the D1 path is the one that runs.
// ============================================================================

const STORAGE_KEY = 'pe.admin.products.v1'
const CHANGE_EVENT = 'pe:products-changed'
const API = '/api/products'

const isBrowser = typeof window !== 'undefined'

function read() {
  if (!isBrowser) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(products) {
  if (!isBrowser) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  // Notify same-tab listeners (the native `storage` event only fires cross-tab).
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

/** All ingested products currently in the cache (synchronous). */
export function getIngestedProducts() {
  return read()
}

// --- Server (D1) access -----------------------------------------------------
// Each helper returns the authoritative product list on success, or null when
// the API is unavailable so callers can fall back to the local cache.
async function apiRequest(method, { body, query } = {}) {
  if (!isBrowser) return null
  try {
    const res = await fetch(API + (query ? `?${query}` : ''), {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) return null // 503 (no D1) / 5xx → fall back to local cache
    const data = await res.json().catch(() => null)
    return Array.isArray(data?.products) ? data.products : null
  } catch {
    return null // network error (e.g. no Functions in plain vite dev)
  }
}

/** Pull the products from D1 into the local cache. Returns the list. */
export async function syncFromServer() {
  const products = await apiRequest('GET')
  if (products) write(products)
  return products ?? read()
}

// Cache-only id assignment, used for the offline fallback path.
const ID_BASE = 1000
function nextId(existing) {
  const max = existing.reduce((m, p) => Math.max(m, Number(p.id) || 0), ID_BASE - 1)
  return max + 1
}

/**
 * Persist products (commits the admin's selected rows). Tries D1 first; on
 * failure appends to the local cache so the admin keeps working offline.
 * Returns the full updated list.
 */
export async function addIngestedProducts(incoming = []) {
  const server = await apiRequest('POST', { body: { products: incoming } })
  if (server) { write(server); return server }

  // Offline fallback: stamp ids locally and append to the cache.
  const current = read()
  let id = nextId(current)
  const stamped = incoming.map((p) => ({
    ...p,
    id: p.id ?? id++,
    source: p.source ?? 'admin',
    inStock: p.inStock ?? true,
    zapLow: p.zapLow ?? p.price,
  }))
  const next = [...current, ...stamped]
  write(next)
  return next
}

/** Replace the local cache outright (no server round-trip). */
export function setIngestedProducts(products = []) {
  write(products)
  return products
}

/** Update a single product (D1, with cache fallback). Returns the updated list. */
export async function updateIngestedProduct(product) {
  const server = await apiRequest('PUT', { body: product })
  if (server) { write(server); return server }
  const next = read().map((p) => (p.id === product.id ? { ...p, ...product } : p))
  write(next)
  return next
}

/** Remove a single product by id (D1, with cache fallback). */
export async function removeIngestedProduct(id) {
  const server = await apiRequest('DELETE', { query: `id=${encodeURIComponent(id)}` })
  if (server) { write(server); return server }
  const next = read().filter((p) => p.id !== id)
  write(next)
  return next
}

/** Wipe the store (D1, with cache fallback). */
export async function clearIngestedProducts() {
  const server = await apiRequest('DELETE', { query: 'all=1' })
  if (server) { write(server); return server }
  write([])
  return []
}

/**
 * Subscribe to store changes (same-tab custom event + cross-tab storage event).
 * Returns an unsubscribe function.
 */
export function subscribeProducts(callback) {
  if (!isBrowser) return () => {}
  const onCustom = () => callback(read())
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY) callback(read())
  }
  window.addEventListener(CHANGE_EVENT, onCustom)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom)
    window.removeEventListener('storage', onStorage)
  }
}
