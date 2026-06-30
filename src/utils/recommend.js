// ============================================================================
// Recommendation engine — picks the best product for each chosen appliance
// type, staying within the customer's chosen brand STYLE and total budget.
//
// The four styles (בסיס / מעוצב / יוקרה / פרימיום) are independent brand worlds,
// NOT a cheap→expensive ladder. So the allocator never ranks one style above
// another. Instead it:
//   1. Scopes each appliance type to products in the chosen style — falling
//      back to any brand only when that style has nothing for the type, so the
//      package still completes (e.g. Smeg makes no TVs).
//   2. Starts from the cheapest in-style product per type, then upgrades to
//      pricier (better) models in the SAME style while the package stays in
//      budget.
//   3. Surfaces upgrade advice that points to the next pricier model in the
//      same style ("ב-₪X יותר תקבל דגם משודרג").
//
// The return shape matches the planned Cloudflare `functions/api/recommend.js`
// so swapping the local allocator for a server call later is a drop-in.
// ============================================================================
import { candidatesFor } from '../data/builderCatalog'
import { singlePrice, packagePrice, priceBreakdown } from './pricing'

const cheapest = (list) => list.reduce((a, b) => (b.zapLow < a.zapLow ? b : a))

// Within a single style there is no cross-brand hierarchy, so "better" simply
// means the pricier (more capable) model.
const betterScore = (product) => product.zapLow || 0

/**
 * Resolve a type's candidate pool, scoped to the chosen style when possible.
 * Falls back to all candidates for the type when the style has none, so the
 * package never breaks just because a style doesn't cover that category.
 */
function poolFor(type, style) {
  const all = candidatesFor(type)
  const inStyle = all.filter((p) => p.brandTier === style)
  return inStyle.length ? { list: inStyle, fellBack: false } : { list: all, fellBack: true }
}

/**
 * Build a package.
 * @param {Object} opts
 * @param {'base'|'designed'|'luxury'|'premium'} opts.brandTier chosen style id
 * @param {number} opts.budget total budget (NIS) the package price must fit in
 * @param {string[]} opts.types selected appliance type ids
 */
export function buildPackage({ brandTier = 'premium', budget = 0, types = [] } = {}) {
  // Resolve candidate pools; scope to the chosen style, note fallbacks.
  const pools = []
  const unmatchedTypes = []
  const fallbackTypes = []
  for (const type of types) {
    if (!candidatesFor(type).length) { unmatchedTypes.push(type); continue }
    const { list, fellBack } = poolFor(type, brandTier)
    pools.push({ type, list })
    if (fellBack) fallbackTypes.push(type)
  }

  if (!pools.length) {
    return {
      items: [], pools: [], unmatchedTypes, fallbackTypes,
      pricing: priceBreakdown([]), budget,
      withinBudget: true, overBy: 0, baseTotal: 0,
      upgrades: [], headlineUpgrade: null,
    }
  }

  // 1) Cheapest feasible base, one item per type.
  const selection = new Map() // type -> product
  for (const { type, list } of pools) selection.set(type, cheapest(list))
  const currentItems = () => pools.map(({ type }) => selection.get(type))
  const baseTotal = packagePrice(currentItems())

  // 2) Greedy upgrades toward pricier (better) in-style models, within budget.
  //    Each round, apply the single move with the best gain-per-shekel that fits.
  let guard = pools.length * 40 // generous bound; selections only ever improve
  while (guard-- > 0) {
    let best = null
    const total = packagePrice(currentItems())
    for (const { type, list } of pools) {
      const cur = selection.get(type)
      const curScore = betterScore(cur)
      for (const cand of list) {
        if (cand.id === cur.id) continue
        const gain = betterScore(cand) - curScore
        if (gain <= 0) continue // only ever upgrade
        const trial = pools.map(({ type: t }) => (t === type ? cand : selection.get(t)))
        const trialTotal = packagePrice(trial)
        if (trialTotal > budget) continue
        const extra = Math.max(trialTotal - total, 0)
        const value = extra === 0 ? gain * 1e6 : gain / extra // free upgrades first
        if (!best || value > best.value) best = { type, cand, value }
      }
    }
    if (!best) break
    selection.set(best.type, best.cand)
  }

  const items = pools.map(({ type }) => {
    const product = selection.get(type)
    return {
      ...product,
      type,
      singlePrice: singlePrice(product.zapLow),
      styleFallback: fallbackTypes.includes(type),
    }
  })

  const pricing = priceBreakdown(items)
  const withinBudget = pricing.total <= budget
  const overBy = Math.max(0, pricing.total - budget)

  // 3) Upgrade advice: the next pricier model in the same (in-style) pool.
  const upgrades = []
  for (const { type, list } of pools) {
    const cur = selection.get(type)
    const better = list
      .filter((c) => c.id !== cur.id && c.zapLow > cur.zapLow)
      .sort((a, b) => a.zapLow - b.zapLow)[0]
    if (!better) continue

    // Extra the customer pays at the package rate to swap this one item up.
    const swapped = pools.map(({ type: t }) => (t === type ? better : selection.get(t)))
    const extraCost = Math.max(packagePrice(swapped) - pricing.total, 0)
    const advice = { type, from: cur, to: better, extraCost }
    upgrades.push(advice)
    const item = items.find((it) => it.type === type)
    if (item) item.upgrade = advice
  }

  // Most compelling: the smallest extra cost that still buys a better model.
  const headlineUpgrade = upgrades
    .slice()
    .sort((a, b) => a.extraCost - b.extraCost)[0] || null

  return {
    items,
    pricing,
    budget,
    baseTotal,
    withinBudget,
    overBy,
    upgrades,
    headlineUpgrade,
    unmatchedTypes,
    fallbackTypes,
  }
}
