import { useState } from 'react'
import { products, categories } from '../data/products'
import ProductCard from './ProductCard'

const filters = [{ id: 'all', name: 'הכל' }, ...categories.map((c) => ({ id: c.id, name: c.name }))]

export default function FeaturedProducts() {
  const [active, setActive] = useState('all')
  const list = active === 'all' ? products : products.filter((p) => p.category === active)

  return (
    <section id="featured" className="relative py-28 bg-ink-800/50">
      <div className="absolute inset-0 bg-radial-glow opacity-50" />
      <div className="container-luxe relative">
        <div className="text-center mb-14">
          <div className="chip mb-4">קולקציית בחירה</div>
          <h2 className="section-title">
            הפריטים ה<span className="gold-text">נחשקים</span> ביותר
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            נבחרו ידנית על ידי צוות המומחים שלנו — רק מה שעובר בקרת איכות מדוקדקת מגיע לקולקציה.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                active === f.id
                  ? 'bg-gold-gradient text-ink-900 shadow-gold-glow'
                  : 'bg-white/5 text-white/70 border border-white/10 hover:border-gold-400/30 hover:text-gold-300'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
