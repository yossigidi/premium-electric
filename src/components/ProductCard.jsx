import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star, Eye, Scale } from 'lucide-react'
import { Link } from '../router'
import { useCompare } from '../contexts/CompareContext'

const fmt = (n) => new Intl.NumberFormat('he-IL').format(n)

export default function ProductCard({ product, index = 0 }) {
  const { toggle, has, isFull } = useCompare()
  const inCompare = has(product.id)
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0
  const href = `/product/${product.id}`
  const perMonth = Math.round(product.price / 36)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="card-luxe group flex flex-col"
    >
      <Link to={href} className="relative aspect-[4/3] rounded-t-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 block">
        <img src={product.image} alt={product.name} loading="lazy"
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
        {product.badge && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gold-gradient text-white text-xs font-bold">{product.badge}</div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold">-{discount}%</div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 px-4 py-2 rounded-full bg-gold-gradient text-white font-semibold text-sm shadow-lg">
            <Eye size={14} /> צפה במוצר
          </div>
        </div>
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs tracking-wider uppercase text-gold-500 font-semibold">{product.brand}</span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Star size={12} className="fill-gold-300 text-gold-300" />
            {product.rating} <span className="text-gray-300">({product.reviews})</span>
          </div>
        </div>

        <Link to={href} className="block">
          <h3 className="text-lg font-bold text-gray-900 leading-snug line-clamp-2 min-h-[48px] hover:text-gold-500 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {product.tags?.slice(0, 3).map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">{t}</span>
          ))}
        </div>

        <div className="hair-divider my-4" />

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="min-w-0">
            {product.oldPrice && <div className="text-xs text-gray-400 line-through">₪{fmt(product.oldPrice)}</div>}
            <div className="text-2xl font-bold text-gold-500">₪{fmt(product.price)}</div>
            <div className="text-[10px] text-gray-400">או 36 × ₪{fmt(perMonth)}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <button aria-label={inCompare ? 'הסר מהשוואה' : 'הוסף להשוואה'} disabled={!inCompare && isFull}
              onClick={(e) => { e.stopPropagation(); toggle(product.id) }}
              className={`w-9 h-9 rounded-full border transition flex items-center justify-center ${
                inCompare ? 'bg-gold-gradient border-gold-400 text-white' : 'bg-white border-gray-200 text-gray-400 hover:text-gold-500 hover:border-gold-300 disabled:opacity-30'
              }`}><Scale size={14} /></button>
            <button aria-label="הוסף למועדפים" onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-300 transition flex items-center justify-center">
              <Heart size={14} /></button>
            <button aria-label="הוסף לעגלה" onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 rounded-full bg-gold-gradient text-white hover:shadow-gold-glow transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center shrink-0">
              <ShoppingBag size={16} /></button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
