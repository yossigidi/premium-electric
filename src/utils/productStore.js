// ============================================================================
// Product store — the admin-ingested products layer.
//
// Phase-2 stand-in for the Firestore `products` collection. The admin panel
// saves reviewed/approved products here; the package builder reads them back
// (see `candidatesFor` in data/builderCatalog.js) so ingested products flow
// straight into recommendations — the end-to-end loop the plan calls for,
// working fully offline until Firebase is wired in phase 3.
//
// Persistence: localStorage (per-browser). Swapping this for Firestore later
// means re-implementing the same five functions against the SDK — the rest of
// the app only touches this module, never storage directly.
// ============================================================================

const STORAGE_KEY = 'pe.admin.products.v1'
const CHANGE_EVENT = 'pe:products-changed'

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

/** All ingested products currently in the store. */
export function getIngestedProducts() {
  return read()
}

// Ingested ids live well above the seed/showroom range (1–199) to avoid clashes.
const ID_BASE = 1000
function nextId(existing) {
  const max = existing.reduce((m, p) => Math.max(m, Number(p.id) || 0), ID_BASE - 1)
  return max + 1
}

/**
 * Append products to the store, assigning ids where missing.
 * Returns the full updated list.
 */
export function addIngestedProducts(incoming = []) {
  const current = read()
  let id = nextId(current)
  const stamped = incoming.map((p) => ({
    ...p,
    id: p.id ?? id++,
    source: p.source ?? 'admin',
    inStock: p.inStock ?? true,
    // zapLow is the pricing baseline; fall back to the entered price until the
    // phase-3 Zap lookup refines it.
    zapLow: p.zapLow ?? p.price,
  }))
  const next = [...current, ...stamped]
  write(next)
  return next
}

/** Replace the entire store (used by the review-table "save all" flow). */
export function setIngestedProducts(products = []) {
  write(products)
  return products
}

/** Remove a single product by id. Returns the updated list. */
export function removeIngestedProduct(id) {
  const next = read().filter((p) => p.id !== id)
  write(next)
  return next
}

/** Wipe the store. */
export function clearIngestedProducts() {
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
