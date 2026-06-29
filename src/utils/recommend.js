// ============================================================================
// Recommendation engine — picks the best product for each chosen appliance
// type given the customer's brand-tier preference and total budget.
//
// Phase-1 implementation runs locally off `builderCatalog` so the builder is
// fully demoable offline. The shape it returns is intentionally close to what
// the planned Cloudflare function `functions/api/recommend.js` will return, so
// swapping the local allocator + heuristic upgrade advice for a server call
// (with Groq-generated advice) later is a drop-in.
//
// Strategy: a budget-aware greedy allocator.
//   1. Start from the cheapest in-stock product per type (guarantees the base
//      package is as affordable as possible).
//   2. Repeatedly apply the single most cost-effective upgrade — toward the
//      preferred tier first, then toward a better model — while the package
//      price stays within budget.
// ============================================================================
import { candidatesFor, TIER_RANK } from '../data/builderCatalog'
import { singlePrice, packagePrice, priceBreakdown } from './pricing'

// Desirability of a candidate given the preferred tier:
//   first maximise closeness to the preferred tier, then prefer the better
//   (pricier) model within that tier. Higher = more desirable.
function desirability(product, preferredTier) {
  const target = TIER_RANK[preferredTier] ?? TIER_RANK.premium
  const closeness = -Math.abs((TIER_RANK[product.brandTier] ?? 1) - target)
  return closeness * 1_000_000 + (product.zapLow || 0)
}

const cheapest = (list) => list.reduce((a, b) => (b.zapLow < a.zapLow ? b : a))

/**
 * Build a package.
 * @param {Object} opts
 * @param {'budget'|'designed'|'premium'} opts.brandTier preferred tier
 * @param {number} opts.budget total budget (NIS) the package price must fit in
 * @param {string[]} opts.types selected appliance type ids
 */
export function buildPackage({ brandTier = 'premium', budget = 0, types = [] } = {}) {
  // Resolve candidate lists; drop types we have nothing for.
  const pools = []
  const unmatchedTypes = []
  for (const type of types) {
    const list = candidatesFor(type)
    if (list.length) pools.push({ type, list })
    else unmatchedTypes.push(type)
  }

  if (!pools.length) {
    return {
      items: [], pools: [], unmatchedTypes,
      pricing: priceBreakdown([]), budget,
      withinBudget: true, overBy: 0, headlineUpgrade: null,
    }
  }

  // 1) Cheapest feasible base, one item per type.
  const selection = new Map() // type -> product
  for (const { type, list } of pools) selection.set(type, cheapest(list))

  const currentItems = () => pools.map(({ type }) => selection.get(type))

  // 2) Greedy upgrades while we stay within budget.
  //    Each round, evaluate every "move to a more desirable product in the same
  //    type" and apply the one with the best score-gain-per-shekel that fits.
  const baseTotal = packagePrice(currentItems())
  let guard = pools.length * 40 // generous bound; selections only ever improve
  while (guard-- > 0) {
    let best = null
    for (const { type, list } of pools) {
      const cur = selection.get(type)
      const curScore = desirability(cur, brandTier)
      for (const cand of list) {
        if (cand.id === cur.id) continue
        const gain = desirability(cand, brandTier) - curScore
        if (gain <= 0) continue // only ever upgrade
        // Price of the package if we swapped in this candidate.
        const trial = pools.map(({ type: t }) => (t === type ? cand : selection.get(t)))
        const trialTotal = packagePrice(trial)
        if (trialTotal > budget) continue
        const extra = Math.max(trialTotal - packagePrice(currentItems()), 0)
        const value = extra === 0 ? gain * 1e6 : gain / extra // free upgrades first
        if (!best || value > best.value) best = { type, cand, value }
      }
    }
    if (!best) break
    selection.set(best.type, best.cand)
  }

  const items = pools.map(({ type }) => {
    const product = selection.get(type)
    return { ...product, type, singlePrice: singlePrice(product.zapLow) }
  })

  const pricing = priceBreakdown(items)
  const withinBudget = pricing.total <= budget
  const overBy = Math.max(0, pricing.total - budget)

  // 3) Heuristic upgrade advice: for each item, the next-better model in its
  //    type that we skipped (usually for budget). Attach the cheapest such
  //    jump to each item, and surface the single most compelling one.
  const upgrades = []
  for (const { type, list } of pools) {
    const cur = selection.get(type)
    const curScore = desirability(cur, brandTier)
    const better = list
      .filter((c) => c.id !== cur.id && desirability(c, brandTier) > curScore && c.zapLow > cur.zapLow)
      .sort((a, b) => a.zapLow - b.zapLow)[0]
    if (!better) continue

    // Extra the customer pays at the package rate to swap this one item up.
    const swapped = pools.map(({ type: t }) => (t === type ? better : selection.get(t)))
    const extraCost = Math.max(packagePrice(swapped) - pricing.total, 0)
    const crossesTier = TIER_RANK[better.brandTier] > TIER_RANK[cur.brandTier]
    const advice = { type, from: cur, to: better, extraCost, crossesTier }
    upgrades.push(advice)
    const item = items.find((it) => it.type === type)
    if (item) item.upgrade = advice
  }

  // Most compelling: prefer a tier jump, then the cheapest extra cost.
  const headlineUpgrade = upgrades
    .slice()
    .sort((a, b) =>
      (Number(b.crossesTier) - Number(a.crossesTier)) || (a.extraCost - b.extraCost))[0] || null

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
  }
}
