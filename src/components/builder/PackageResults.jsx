import { motion } from 'framer-motion'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import BuilderProductCard from './BuilderProductCard'
import PackageSummary from './PackageSummary'
import { formatNis } from '../../utils/pricing'
import { applianceLabel } from '../../data/builderCatalog'

export default function PackageResults({ result }) {
  const { items, headlineUpgrade, unmatchedTypes = [] } = result
  if (!items.length) return null

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Products */}
      <div className="lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-gold-500" />
          <h2 className="text-xl font-bold text-gray-900">החבילה המומלצת עבורך</h2>
        </div>

        {headlineUpgrade && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-5 flex items-start gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-white">
              <ArrowUpRight size={18} />
            </span>
            <div className="text-sm leading-snug text-gray-700">
              <span className="font-bold text-gold-600">טיפ שדרוג חכם:</span>{' '}
              בתוספת <span className="font-bold">₪{formatNis(headlineUpgrade.extraCost)}</span> בלבד תוכל לשדרג
              את ה{applianceLabel(headlineUpgrade.type)} ל-
              <span className="font-semibold">{headlineUpgrade.to.brand} {headlineUpgrade.to.name}</span>
              {headlineUpgrade.crossesTier && ' ולעלות רמת מותג שלמה'}.
            </div>
          </motion.div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {items.map((item, i) => (
            <BuilderProductCard key={item.id} item={item} index={i} />
          ))}
        </div>

        {unmatchedTypes.length > 0 && (
          <p className="mt-4 text-sm text-gray-400">
            לא נמצאו דגמים זמינים עבור: {unmatchedTypes.map(applianceLabel).join('، ')}.
          </p>
        )}
      </div>

      {/* Sticky summary */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-28">
          <PackageSummary result={result} />
        </div>
      </div>
    </div>
  )
}
