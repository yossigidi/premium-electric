import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('he-IL').format(n)

export default function ProductCard({ product, index = 0 }) {
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onMouseMove={handleMove}
      className="card-luxe group p-4"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-ink-800">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.badge && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gold-gradient text-ink-900 text-xs font-bold">
            {product.badge}
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-bold">
            -{discount}%
          </div>
        )}
        <button className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-ink-900/80 backdrop-blur border border-white/10 text-white/70 hover:text-red-400 hover:border-red-400/40 transition flex items-center justify-center">
          <Heart size={16} />
        </button>
      </div>

      {/* Info */}
      <div className="px-2 pt-5 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs tracking-widest uppercase text-gold-300">{product.brand}</span>
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Star size={12} className="fill-gold-400 text-gold-400" />
            {product.rating} <span className="text-white/30">({product.reviews})</span>
          </div>
        </div>

        <h3 className="font-display text-xl font-bold text-white leading-snug line-clamp-2 min-h-[56px]">
          {product.name}
        </h3>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {product.tags?.map((t) => (
            <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
              {t}
            </span>
          ))}
        </div>

        <div className="hair-divider my-4" />

        <div className="flex items-end justify-between">
          <div>
            {product.oldPrice && (
              <div className="text-xs text-white/40 line-through">₪{fmt(product.oldPrice)}</div>
            )}
            <div className="text-2xl font-bold gold-text">₪{fmt(product.price)}</div>
          </div>
          <button className="w-11 h-11 rounded-full bg-gold-gradient text-ink-900 hover:shadow-gold-glow transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center">
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </motion.article>
  )
}
