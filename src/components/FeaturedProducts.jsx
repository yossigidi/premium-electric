import { motion } from 'framer-motion'
import { ArrowLeft, Flame, Sparkles } from 'lucide-react'
import { products } from '../data/products'
import { Link } from '../router'
import ProductCard from './ProductCard'

const featured = products
  .filter((p) => p.badge || p.oldPrice)
  .sort((a, b) => {
    const aScore = (a.badge?.includes('חדש') ? 3 : 0) + (a.oldPrice ? 2 : 0) + (a.badge ? 1 : 0)
    const bScore = (b.badge?.includes('חדש') ? 3 : 0) + (b.oldPrice ? 2 : 0) + (b.badge ? 1 : 0)
    return bScore - aScore
  })
  .slice(0, 6)

export default function FeaturedProducts() {
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
