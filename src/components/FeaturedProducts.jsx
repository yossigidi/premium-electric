import { motion } from 'framer-motion'
import { ArrowLeft, Flame, Sparkles } from 'lucide-react'
import { products } from '../data/products'
import { Link } from '../router'
import ProductCard from './ProductCard'

// Show ONLY products with a badge (new arrival, sale, bestseller) — max 6
const featured = products
  .filter((p) => p.badge || p.oldPrice)
  .sort((a, b) => {
    // Prioritize: חדש first, then sales (oldPrice), then bestsellers
    const aScore = (a.badge?.includes('חדש') ? 3 : 0) + (a.oldPrice ? 2 : 0) + (a.badge ? 1 : 0)
    const bScore = (b.badge?.includes('חדש') ? 3 : 0) + (b.oldPrice ? 2 : 0) + (b.badge ? 1 : 0)
    return bScore - aScore
  })
  .slice(0, 6)

export default function FeaturedProducts() {
  return (
    <section id="featured" className="relative py-28 bg-ink-800/50">
      <div className="absolute inset-0 bg-radial-glow opacity-50" />
      <div className="container-luxe relative">
        <div className="flex items-end justify-between mb-14 flex-wrap gap-6">
          <div>
            <div className="chip mb-4">
              <Flame size={14} />
              מבצעים וחדשים
            </div>
            <h2 className="section-title">
              לא לפספס <span className="gold-text">עכשיו</span>
            </h2>
            <p className="mt-4 text-white/60 max-w-lg">
              מוצרים חדשים שהגיעו למלאי ופריטים במבצע מיוחד — לזמן מוגבל.
            </p>
          </div>
          <Link to="/search" className="btn-ghost">
            <Sparkles size={16} />
            כל המוצרים
            <ArrowLeft size={16} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
