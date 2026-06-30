import { useMemo } from 'react'
import { ArrowLeft, Flame, Sparkles } from 'lucide-react'
import { Link } from '../router'
import ProductCard from './ProductCard'
import { useStoreProducts } from '../hooks/useStoreProducts'

export default function FeaturedProducts() {
  const all = useStoreProducts()
  // Prefer sale/new items; fall back to the most recent products so the section
  // is never empty once the DB has products.
  const featured = useMemo(() => {
    const sale = all.filter((p) => p.oldPrice || p.badge)
    const base = sale.length ? sale : [...all].reverse()
    return base.slice(0, 6)
  }, [all])

  if (!featured.length) return null

  return (
    <section id="featured" className="py-20 bg-surface-200">
      <div className="container-luxe">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-6">
          <div>
            <div className="chip mb-3"><Flame size={14} /> מבצעים וחדשים</div>
            <h2 className="section-title">לא לפספס <span className="gold-text">עכשיו</span></h2>
            <p className="mt-3 text-gray-500 max-w-lg">מוצרים חדשים ופריטים במבצע מיוחד — לזמן מוגבל.</p>
          </div>
          <Link to="/search" className="btn-ghost text-sm"><Sparkles size={16} /> כל המוצרים <ArrowLeft size={16} /></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}
