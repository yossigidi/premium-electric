import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { categories } from '../data/products'
import { useRouter } from '../router'

export default function Categories() {
  const { navigate } = useRouter()
  return (
    <section id="categories" className="relative py-28">
      <div className="container-luxe">
        <div className="flex items-end justify-between mb-14 flex-wrap gap-6">
          <div>
            <div className="chip mb-4">הקטגוריות שלנו</div>
            <h2 className="section-title">
              עולמות של <span className="gold-text">איכות</span>
            </h2>
            <p className="mt-4 text-white/60 max-w-lg">
              כל קטגוריה נאספה בקפידה. אנחנו לא מוכרים הכל — אנחנו מוכרים רק את מה שהיינו קונים לעצמנו.
            </p>
          </div>
          <button onClick={() => navigate('/search')} className="btn-ghost">לקולקציה המלאה <ArrowLeft size={16} /></button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((c, i) => (
            <motion.button
              key={c.id}
              onClick={() => navigate(`/category/${c.id}`)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative h-[400px] rounded-2xl overflow-hidden border border-white/5 hover:border-gold-400/40 transition-all duration-700 text-right"
            >
              <img
                src={c.image}
                alt={c.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
              <div className="absolute inset-0 bg-gold-400/0 group-hover:bg-gold-400/5 transition-colors duration-700" />

              <div className="absolute inset-x-0 bottom-0 p-8">
                <div className="text-xs tracking-[0.25em] uppercase text-gold-300 mb-2">{c.tagline}</div>
                <h3 className="font-display text-3xl font-bold text-white mb-2">{c.name}</h3>
                <p className="text-white/60 text-sm mb-5 line-clamp-2">{c.description}</p>
                <div className="inline-flex items-center gap-2 text-gold-300 font-semibold text-sm
                                group-hover:gap-4 transition-all duration-300">
                  גלה עכשיו <ArrowLeft size={16} />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
