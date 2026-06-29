import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Sparkles, Wand2 } from 'lucide-react'
import BrandTierSelect from './BrandTierSelect'
import BudgetSlider from './BudgetSlider'
import ApplianceMultiSelect from './ApplianceMultiSelect'
import PackageResults from './PackageResults'
import { buildPackage } from '../../utils/recommend'

const STEPS = [
  { n: 1, title: 'רמת המותג', hint: 'איזו רמה מתאימה לך?' },
  { n: 2, title: 'התקציב', hint: 'כמה תרצה להשקיע בסך הכל?' },
  { n: 3, title: 'המכשירים', hint: 'מה צריך לבית? אפשר לבחור כמה שרוצים' },
]

function Step({ step, complete, children }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-200 ${
            complete ? 'bg-gold-gradient text-white' : 'border border-gray-300 bg-white text-gray-400'
          }`}
        >
          {step.n}
        </div>
        {step.n < 3 && <div className="my-1 w-px flex-1 bg-gray-200" />}
      </div>
      <div className="flex-1 pb-7">
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
          <span className="text-xs text-gray-400">{step.hint}</span>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 lg:grid-cols-3">
      <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-72 rounded-2xl border border-gray-100 bg-gray-100" />
        ))}
      </div>
      <div className="h-96 rounded-3xl bg-gray-200 lg:col-span-1" />
    </div>
  )
}

export default function PackageBuilder() {
  const [brandTier, setBrandTier] = useState('premium')
  const [budget, setBudget] = useState(40000)
  const [types, setTypes] = useState(['refrigerators', 'ovens', 'dishwashers'])
  const [built, setBuilt] = useState(false)
  const [loading, setLoading] = useState(false)
  const resultsRef = useRef(null)

  const result = useMemo(
    () => buildPackage({ brandTier, budget, types }),
    [brandTier, budget, types],
  )

  const toggleType = (id) =>
    setTypes((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))

  const handleBuild = () => {
    if (!types.length || loading) return
    setLoading(true)
    // Brief "AI is composing your package" beat for perceived intelligence.
    setTimeout(() => {
      setLoading(false)
      setBuilt(true)
      requestAnimationFrame(() =>
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
    }, 650)
  }

  return (
    <div>
      {/* Configurator inputs */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-luxe md:p-8">
        <Step step={STEPS[0]} complete={!!brandTier}>
          <BrandTierSelect value={brandTier} onChange={setBrandTier} />
        </Step>
        <Step step={STEPS[1]} complete={budget > 0}>
          <BudgetSlider value={budget} onChange={setBudget} />
        </Step>
        <Step step={STEPS[2]} complete={types.length > 0}>
          <ApplianceMultiSelect selected={types} onToggle={toggleType} />
        </Step>

        <div className="flex flex-col items-center gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
          <p className="text-sm text-gray-500">
            {types.length > 0 ? (
              <>נבחרו <span className="font-bold text-gold-600">{types.length}</span> סוגי מכשירים</>
            ) : (
              'בחר לפחות מכשיר אחד כדי להתחיל'
            )}
          </p>
          <button
            type="button"
            onClick={handleBuild}
            disabled={!types.length || loading}
            className="btn-gold w-full justify-center disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> בונה את החבילה…
              </>
            ) : (
              <>
                <Wand2 size={18} /> {built ? 'עדכן את החבילה' : 'בנה לי חבילה חכמה'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      <div ref={resultsRef} className="mt-10 scroll-mt-28">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ResultsSkeleton />
            </motion.div>
          )}
          {!loading && built && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PackageResults result={result} />
            </motion.div>
          )}
          {!loading && !built && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 py-14 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-500">
                <Sparkles size={26} />
              </span>
              <h3 className="mt-4 text-lg font-bold text-gray-900">החבילה החכמה שלך מחכה</h3>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                בחר רמת מותג, תקציב והמכשירים שאתה צריך — והבונה החכם ירכיב עבורך את החבילה
                המשתלמת ביותר, תמיד מתחת למחיר השוק.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
