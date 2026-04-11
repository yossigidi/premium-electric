import { useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, SlidersHorizontal, Star, Check, ArrowDownNarrowWide } from 'lucide-react'
import { products, categories, brands } from '../data/products'
import ProductCard from '../components/ProductCard'

const PRICE_BOUNDS = [0, 160000]

const sortOptions = [
  { id: 'popular',   label: 'הכי נמכרים' },
  { id: 'new',       label: 'חדשים ראשונים' },
  { id: 'priceAsc',  label: 'מחיר: נמוך לגבוה' },
  { id: 'priceDesc', label: 'מחיר: גבוה לנמוך' },
  { id: 'rating',    label: 'דירוג גבוה ביותר' },
]

function parseParams() {
  return new URLSearchParams(window.location.hash.split('?')[1] || '')
}

export default function SearchPage() {
  const [query, setQuery] = useState(() => parseParams().get('q') || '')
  const [cats, setCats] = useState(() => {
    const cat = parseParams().get('cat')
    return cat ? [cat] : []
  })
  const [brandSel, setBrandSel] = useState([])
  const [priceMax, setPriceMax] = useState(PRICE_BOUNDS[1])
  const [minRating, setMinRating] = useState(0)
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [onlyDiscount, setOnlyDiscount] = useState(false)
  const [sort, setSort] = useState('popular')
  const [mobileFilters, setMobileFilters] = useState(false)

  // React to hash changes (e.g., clicking a different category in the navbar)
  useEffect(() => {
    const onHashChange = () => {
      const params = parseParams()
      setQuery(params.get('q') || '')
      const cat = params.get('cat')
      setCats(cat ? [cat] : [])
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = products.filter((p) => {
      if (q && !(`${p.name} ${p.brand} ${p.tags?.join(' ') || ''} ${p.shortDescription || ''}`.toLowerCase().includes(q))) return false
      if (cats.length && !cats.includes(p.category)) return false
      if (brandSel.length && !brandSel.includes(p.brand)) return false
      if (p.price > priceMax) return false
      if (p.rating < minRating) return false
      if (onlyInStock && !p.inStock) return false
      if (onlyDiscount && !p.oldPrice) return false
      return true
    })
    switch (sort) {
      case 'priceAsc':  list = [...list].sort((a, b) => a.price - b.price); break
      case 'priceDesc': list = [...list].sort((a, b) => b.price - a.price); break
      case 'rating':    list = [...list].sort((a, b) => b.rating - a.rating); break
      case 'new':       list = [...list].sort((a, b) => (b.badge === 'חדש' || b.badge === 'חדש 2026' ? 1 : 0) - (a.badge === 'חדש' || a.badge === 'חדש 2026' ? 1 : 0)); break
      default:          list = [...list].sort((a, b) => b.reviews - a.reviews)
    }
    return list
  }, [query, cats, brandSel, priceMax, minRating, onlyInStock, onlyDiscount, sort])

  const toggleCat = (id) => setCats((c) => c.includes(id) ? c.filter((x) => x !== id) : [...c, id])
  const toggleBrand = (b) => setBrandSel((s) => s.includes(b) ? s.filter((x) => x !== b) : [...s, b])

  const clearAll = () => {
    setQuery(''); setCats([]); setBrandSel([]); setPriceMax(PRICE_BOUNDS[1])
    setMinRating(0); setOnlyInStock(false); setOnlyDiscount(false)
  }

  const activeCount = cats.length + brandSel.length + (priceMax < PRICE_BOUNDS[1] ? 1 : 0)
                    + (minRating > 0 ? 1 : 0) + (onlyInStock ? 1 : 0) + (onlyDiscount ? 1 : 0)

  const FiltersPanel = (
    <Filters
      cats={cats} toggleCat={toggleCat}
      brandSel={brandSel} toggleBrand={toggleBrand}
      priceMax={priceMax} setPriceMax={setPriceMax}
      minRating={minRating} setMinRating={setMinRating}
      onlyInStock={onlyInStock} setOnlyInStock={setOnlyInStock}
      onlyDiscount={onlyDiscount} setOnlyDiscount={setOnlyDiscount}
      clearAll={clearAll} activeCount={activeCount}
    />
  )

  return (
    <div className="pt-24 md:pt-32 lg:pt-44 pb-20 min-h-screen">
      <div className="container-luxe">
        <div className="text-center mb-10">
          <h1 className="section-title">
            חיפוש <span className="gold-text">מתקדם</span>
          </h1>
          <p className="mt-3 text-gray-500">מצאו את המוצר המושלם עם סינון חכם</p>
        </div>

        {/* Search bar */}
        <div className="relative max-w-3xl mx-auto">
          <Search className="absolute top-1/2 -translate-y-1/2 right-5 text-gold-500" size={20} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש מוצר, מותג או תכונה..."
            className="w-full bg-gray-50 border border-gray-200 focus:border-gold-400 rounded-full py-4 pr-14 pl-14 text-gray-900 placeholder-gray-400 outline-none transition"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute top-1/2 -translate-y-1/2 left-5 text-gray-400 hover:text-gray-900"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Results + Filters grid */}
        <div className="mt-10 grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Desktop filters */}
          <aside className="hidden lg:block">{FiltersPanel}</aside>

          {/* Mobile filter trigger + sort */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-6">
              <button
                onClick={() => setMobileFilters(true)}
                className="lg:hidden btn-ghost !py-2.5 !px-4 text-sm"
              >
                <SlidersHorizontal size={16} /> סינון {activeCount > 0 && <span className="w-5 h-5 rounded-full bg-gold-400 text-ink-900 text-[10px] font-bold flex items-center justify-center">{activeCount}</span>}
              </button>

              <div className="text-sm text-gray-500">
                נמצאו <span className="text-gold-500 font-bold">{filtered.length}</span> מוצרים
              </div>

              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-900 pr-10 pl-4 py-2.5 rounded-full text-sm focus:border-gold-400 outline-none"
                >
                  {sortOptions.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <ArrowDownNarrowWide size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500 pointer-events-none" />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-display text-2xl text-gray-900 mb-2">לא נמצאו תוצאות</h3>
                <p className="text-gray-400 mb-6">נסו להרחיב את הסינון או לחפש מונח אחר</p>
                <button onClick={clearAll} className="btn-gold">נקה סינון</button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filters drawer */}
      <AnimatePresence>
        {mobileFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-[70] bg-white/90 "
            onClick={() => setMobileFilters(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-y-0 right-0 w-[88%] max-w-sm bg-gray-50 border-l border-gray-200 overflow-y-auto"
            >
              <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-5 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-gray-900">סינון</h3>
                <button onClick={() => setMobileFilters(false)} className="p-2 text-gray-500 hover:text-gray-900">
                  <X size={22} />
                </button>
              </div>
              <div className="p-5">
                {FiltersPanel}
                <button onClick={() => setMobileFilters(false)} className="btn-gold w-full justify-center mt-6">
                  הצג {filtered.length} תוצאות
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Filters({ cats, toggleCat, brandSel, toggleBrand, priceMax, setPriceMax, minRating, setMinRating, onlyInStock, setOnlyInStock, onlyDiscount, setOnlyDiscount, clearAll, activeCount }) {
  const fmt = (n) => new Intl.NumberFormat('he-IL').format(n)
  return (
    <div className="space-y-7">
      {activeCount > 0 && (
        <button
          onClick={clearAll}
          className="text-sm text-gold-500 hover:text-gold-200 flex items-center gap-2"
        >
          <X size={14} /> נקה הכל ({activeCount})
        </button>
      )}

      {/* Categories */}
      <FilterBlock title="קטגוריה">
        {categories.map((c) => (
          <Checkbox key={c.id} checked={cats.includes(c.id)} onChange={() => toggleCat(c.id)} label={c.name} />
        ))}
      </FilterBlock>

      {/* Price */}
      <FilterBlock title="טווח מחירים">
        <div className="text-sm text-gray-500 mb-3">
          עד <span className="text-gold-500 font-bold">₪{fmt(priceMax)}</span>
        </div>
        <input
          type="range"
          min={PRICE_BOUNDS[0]}
          max={PRICE_BOUNDS[1]}
          step={500}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-gold-400"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>₪0</span>
          <span>₪{fmt(PRICE_BOUNDS[1])}</span>
        </div>
      </FilterBlock>

      {/* Brand */}
      <FilterBlock title="מותג">
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {brands.map((b) => (
            <Checkbox key={b} checked={brandSel.includes(b)} onChange={() => toggleBrand(b)} label={b} />
          ))}
        </div>
      </FilterBlock>

      {/* Rating */}
      <FilterBlock title="דירוג מינימלי">
        <div className="space-y-2">
          {[4.5, 4, 3.5, 0].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`flex items-center gap-2 w-full text-right px-3 py-2 rounded-lg transition ${
                minRating === r ? 'bg-gold-400/10 text-gold-500' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {r > 0 ? (
                <>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < Math.floor(r) ? 'fill-gold-400 text-gold-500' : 'text-white/20'} />
                    ))}
                  </div>
                  <span className="text-sm">{r}+ ומעלה</span>
                </>
              ) : <span className="text-sm">הכל</span>}
            </button>
          ))}
        </div>
      </FilterBlock>

      {/* Toggles */}
      <FilterBlock title="מסננים נוספים">
        <Checkbox checked={onlyInStock} onChange={() => setOnlyInStock(!onlyInStock)} label="במלאי בלבד" />
        <Checkbox checked={onlyDiscount} onChange={() => setOnlyDiscount(!onlyDiscount)} label="במבצע" />
      </FilterBlock>
    </div>
  )
}

function FilterBlock({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-white mb-3 tracking-wide">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-1">
      <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center shrink-0 ${
        checked ? 'bg-gold-400 border-gold-400' : 'border-white/20 group-hover:border-gold-400/50'
      }`}>
        {checked && <Check size={13} className="text-ink-900" strokeWidth={3} />}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className="text-sm text-gray-500 group-hover:text-white transition-colors">{label}</span>
    </label>
  )
}
