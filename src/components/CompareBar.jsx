import { motion, AnimatePresence } from 'framer-motion'
import { Scale, X, ArrowLeft } from 'lucide-react'
import { useCompare } from '../contexts/CompareContext'
import { products } from '../data/products'
import { Link, useRouter } from '../router'

export default function CompareBar() {
  const { ids, remove, clear, max } = useCompare()
  const { route } = useRouter()
  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean)

  if (route.name === 'compare') return null

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 24 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[55] w-[92%] max-w-4xl"
        >
          <div className="bg-ink-800/95 backdrop-blur-xl border border-gold-400/30 rounded-2xl shadow-luxe p-4 flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-400/30 flex items-center justify-center text-gold-300">
                <Scale size={18} />
              </div>
              <div className="hidden sm:block">
                <div className="text-xs text-white/50">בהשוואה</div>
                <div className="text-sm font-bold text-white">{items.length} / {max} מוצרים</div>
              </div>
            </div>

            <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {items.map((p) => (
                <div key={p.id} className="relative shrink-0">
                  <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                  <button
                    onClick={() => remove(p.id)}
                    className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:scale-110 transition"
                    aria-label="הסר"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {Array.from({ length: max - items.length }).map((_, i) => (
                <div key={i} className="w-12 h-12 rounded-lg border-2 border-dashed border-white/10 shrink-0" />
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={clear}
                className="hidden sm:inline-flex text-xs text-white/50 hover:text-white px-3 py-2"
              >
                נקה
              </button>
              <Link to="/compare" className="btn-gold !py-2.5 !px-5 text-sm">
                השווה
                <ArrowLeft size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
