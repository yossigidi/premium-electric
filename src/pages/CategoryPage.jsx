import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Home, ChevronLeft, ArrowDownNarrowWide, Package } from 'lucide-react'
import { products, categories } from '../data/products'
import { Link } from '../router'
import ProductCard from '../components/ProductCard'

const sortOptions = [
  { id: 'popular',   label: 'הכי נמכרים' },
  { id: 'new',       label: 'חדשים ראשונים' },
  { id: 'priceAsc',  label: 'מחיר: נמוך לגבוה' },
  { id: 'priceDesc', label: 'מחיר: גבוה לנמוך' },
  { id: 'rating',    label: 'דירוג גבוה ביותר' },
]

export default function CategoryPage({ catId }) {
  const [sort, setSort] = useState('popular')
  const category = categories.find((c) => c.id === catId)

  const list = useMemo(() => {
    let items = products.filter((p) => p.category === catId)
    switch (sort) {
      case 'priceAsc':  items = [...items].sort((a, b) => a.price - b.price); break
      case 'priceDesc': items = [...items].sort((a, b) => b.price - a.price); break
      case 'rating':    items = [...items].sort((a, b) => b.rating - a.rating); break
      case 'new':       items = [...items].sort((a, b) => ((b.badge || '').includes('חדש') ? 1 : 0) - ((a.badge || '').includes('חדש') ? 1 : 0)); break
      default:          items = [...items].sort((a, b) => b.reviews - a.reviews)
    }
    return items
  }, [catId, sort])

  if (!category) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl text-white mb-4">הקטגוריה לא נמצאה</h1>
          <Link to="/" className="btn-gold">חזרה לחנות</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 md:pt-32 lg:pt-44 pb-20 min-h-screen">
      {/* Hero banner */}
      <section className="relative h-[340px] overflow-hidden">
        <img src={category.image} alt={category.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/70 to-ink-900/30" />
        <div className="absolute inset-0 bg-radial-glow" />

        <div className="container-luxe relative h-full flex flex-col justify-end pb-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link to="/" className="hover:text-gold-500 inline-flex items-center gap-1">
              <Home size={14} /> דף הבית
            </Link>
            <ChevronLeft size={14} className="text-white/50" />
            <span className="text-white/90">{category.name}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs tracking-[0.3em] uppercase text-gold-500 mb-3">{category.tagline}</div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-3">{category.name}</h1>
            <p className="text-white/70 text-lg max-w-2xl">{category.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Results bar + sort */}
      <div className="container-luxe mt-10">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-200 flex items-center justify-center text-gold-500">
              <Package size={18} />
            </div>
            <div>
              <div className="text-sm text-gray-400">סה"כ</div>
              <div className="text-xl font-bold text-gray-900">
                <span className="gold-text">{list.length}</span> מוצרים בקטגוריה
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="text-xs text-gray-400 mb-1 block">מיון לפי</label>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 text-gray-900 pr-10 pl-4 py-2.5 rounded-full text-sm focus:border-gold-400 outline-none cursor-pointer"
              >
                {sortOptions.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <ArrowDownNarrowWide size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Products grid */}
        {list.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="font-display text-2xl text-gray-900 mb-2">אין מוצרים בקטגוריה זו כרגע</h3>
            <p className="text-gray-400 mb-6">מוצרים חדשים מתווספים בקרוב</p>
            <Link to="/" className="btn-gold">חזרה לחנות</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}

        {/* Back to all */}
        <div className="mt-16 text-center">
          <Link to="/" className="btn-ghost">
            חזרה לדף הבית
            <ChevronLeft size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
