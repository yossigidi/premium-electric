import { motion } from 'framer-motion'
import { ArrowUpRight, Tag } from 'lucide-react'
import { formatNis } from '../../utils/pricing'
import { applianceLabel, BRAND_TIERS } from '../../data/builderCatalog'

const tierMeta = (id) => BRAND_TIERS.find((t) => t.id === id)

/**
 * One product chosen by the builder for a given appliance type. Shows the
 * single-item price (zapLow −5%), the market (Zap) price struck through, and
 * — when relevant — the heuristic "for ₪X more you get a better model" hint.
 */
export default function BuilderProductCard({ item, index = 0 }) {
  const tier = tierMeta(item.brandTier)
  const TierIcon = tier?.Icon
  const saving = Math.max(0, item.zapLow - item.singlePrice)

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card-luxe flex flex-col"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-gradient-to-br from-white to-gray-50">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-contain p-4"
        />
        <div className="absolute right-3 top-3 rounded-full bg-ink-900/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
          {applianceLabel(item.type)}
        </div>
        {tier && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gold-600 shadow-card backdrop-blur">
            {TierIcon && <TierIcon size={12} />}
            {tier.label}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-500">
          {item.brand}
        </span>
        <h3 className="mt-1 min-h-[44px] text-base font-bold leading-snug text-gray-900 line-clamp-2">
          {item.name}
        </h3>

        {item.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="hair-divider my-3" />

        <div className="mt-auto">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-[11px] text-gray-400 line-through">מחיר שוק ₪{formatNis(item.zapLow)}</div>
              <div className="text-xl font-bold text-gold-600">₪{formatNis(item.singlePrice)}</div>
            </div>
            {saving > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                <Tag size={11} /> חיסכון ₪{formatNis(saving)}
              </div>
            )}
          </div>

          {item.upgrade && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-gold-200 bg-gold-50/60 p-2.5 text-[12px] leading-snug text-gray-700">
              <ArrowUpRight size={15} className="mt-0.5 shrink-0 text-gold-500" />
              <span>
                ב-<span className="font-bold text-gold-600">₪{formatNis(item.upgrade.extraCost)}</span> יותר
                {' '}תקבל את <span className="font-semibold">{item.upgrade.to.brand} {item.upgrade.to.name}</span>
                {item.upgrade.crossesTier && ' — שדרוג רמת מותג'}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}
