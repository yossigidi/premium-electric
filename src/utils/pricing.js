// ============================================================================
// Pricing logic — the heart of the smart package builder.
//
// Business rules (from PLAN.md):
//   • Single product : price = round(zapLow × 0.95)   → 5% under the market low.
//   • Full package   : price = round(sum(zapLow) × 0.90) → 10% under the market low.
//
// The package is ALWAYS cheaper than buying the same items one by one here,
// which is cheaper still than the cheapest price found on Zap — a strong
// incentive to buy the whole package.
//
// `zapLow` is the lowest market price (today: the catalog price; later: a value
// fetched/confirmed via the hybrid Zap lookup in phase 3). All amounts are NIS.
// ============================================================================

export const SINGLE_DISCOUNT = 0.05 // 5% off the market low for a single item
export const PACKAGE_DISCOUNT = 0.10 // 10% off the market low for a full package

const num = (v) => (Number.isFinite(v) ? v : 0)

/** Our price for a single product: 5% below its lowest market (Zap) price. */
export function singlePrice(zapLow) {
  return Math.round(num(zapLow) * (1 - SINGLE_DISCOUNT))
}

/** Sum of the lowest market prices across the items (the Zap baseline). */
export function sumZapLow(items = []) {
  return items.reduce((sum, it) => sum + num(it?.zapLow), 0)
}

/** What the items would cost if each were bought individually here (each −5%). */
export function sumSingles(items = []) {
  return items.reduce((sum, it) => sum + singlePrice(it?.zapLow), 0)
}

/** Our price for the whole package: 10% below the summed market low. */
export function packagePrice(items = []) {
  return Math.round(sumZapLow(items) * (1 - PACKAGE_DISCOUNT))
}

/**
 * Full pricing breakdown for a set of items.
 * Returns the package total plus both savings angles the UI highlights:
 *   • vs Zap     — how much below the cheapest market price the package is.
 *   • vs singles — how much the bundle beats buying each item here one-by-one.
 */
export function priceBreakdown(items = []) {
  const zapTotal = sumZapLow(items)
  const singlesTotal = sumSingles(items)
  const total = packagePrice(items)

  const savingsVsZap = Math.max(0, zapTotal - total)
  const savingsVsSingles = Math.max(0, singlesTotal - total)
  const savingsVsZapPct = zapTotal > 0 ? Math.round((savingsVsZap / zapTotal) * 100) : 0

  return {
    zapTotal, // Σ market-low (Zap) prices
    singlesTotal, // Σ our single-item prices (each −5%)
    total, // package price (−10%)
    savingsVsZap, // total − Zap baseline
    savingsVsSingles, // saved vs buying singles here
    savingsVsZapPct, // headline % saved vs Zap
    count: items.length,
  }
}

/** Format a NIS amount the Israeli way, e.g. 12990 → "12,990". */
export const formatNis = (n) => new Intl.NumberFormat('he-IL').format(Math.round(num(n)))
