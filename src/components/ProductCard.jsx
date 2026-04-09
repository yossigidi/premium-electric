import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star, Eye, Scale } from 'lucide-react'
import { Link } from '../router'
import { useCompare } from '../contexts/CompareContext'

const fmt = (n) => new Intl.NumberFormat('he-IL').format(n)

export default function ProductCard({ product, index = 0 }) {
  const { toggle, has, isFull } = useCompare()
  const inCompare = has(product.id)
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`)
  }

  const href = `/product/${product.id}`
  const perMonth = Math.round(product.price / 36)

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onMouseMove={handleMove}
      className="card-luxe group p-4 flex flex-col"
    >
      {/* Image with link */}
      <Link to={href} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-white to-neutral-100 block">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
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
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-ink-900/0 group-hover:bg-ink-900/50 transition-colors duration-500 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2 px-4 py-2 rounded-full bg-gold-gradient text-ink-900 font-semibold text-sm shadow-gold-glow">
            <Eye size={14} /> צפה במוצר
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="px-2 pt-5 pb-2 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs tracking-widest uppercase text-gold-300">{product.brand}</span>
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Star size={12} className="fill-gold-400 text-gold-400" />
            {product.rating} <span className="text-white/30">({product.reviews})</span>
          </div>
        </div>

        <Link to={href} className="block">
          <h3 className="font-display text-xl font-bold text-white leading-snug line-clamp-2 min-h-[56px] hover:text-gold-300 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {product.tags?.slice(0, 3).map((t) => (
            <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
              {t}
            </span>
          ))}
        </div>

        <div className="hair-divider my-4" />

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="min-w-0">
            {product.oldPrice && (
              <div className="text-xs text-white/40 line-through">₪{fmt(product.oldPrice)}</div>
            )}
            <div className="text-2xl font-bold gold-text truncate">₪{fmt(product.price)}</div>
            <div className="text-[10px] text-white/40">או 36 × ₪{fmt(perMonth)}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label={inCompare ? 'הסר מהשוואה' : 'הוסף להשוואה'}
              disabled={!inCompare && isFull}
              onClick={(e) => { e.stopPropagation(); toggle(product.id) }}
              className={`w-10 h-10 rounded-full border transition flex items-center justify-center ${
                inCompare
                  ? 'bg-gold-400 border-gold-400 text-ink-900'
                  : 'bg-ink-900/60 border-white/10 text-white/60 hover:text-gold-300 hover:border-gold-400/40 disabled:opacity-30 disabled:cursor-not-allowed'
              }`}
              title={isFull && !inCompare ? 'מקסימום 4 מוצרים' : 'השוואה'}
            >
              <Scale size={15} />
            </button>
            <button
              aria-label="הוסף למועדפים"
              className="w-10 h-10 rounded-full bg-ink-900/60 border border-white/10 text-white/60 hover:text-red-400 hover:border-red-400/40 transition flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Heart size={15} />
            </button>
            <button
              aria-label="הוסף לעגלה"
              className="w-11 h-11 rounded-full bg-gold-gradient text-ink-900 hover:shadow-gold-glow transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
