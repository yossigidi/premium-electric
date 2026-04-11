import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { categories } from '../data/products'
import { useRouter } from '../router'

export default function Categories() {
  const { navigate } = useRouter()
  return (
    <section id="categories" className="py-20">
      <div className="container-luxe">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-6">
          <div>
            <div className="chip mb-3">הקטגוריות שלנו</div>
            <h2 className="section-title">עולמות של <span className="gold-text">איכות</span></h2>
            <p className="mt-3 text-gray-500 max-w-lg">אנחנו לא מוכרים הכל — רק את מה שהיינו קונים לעצמנו.</p>
          </div>
          <button onClick={() => navigate('/search')} className="btn-ghost text-sm">לקולקציה המלאה <ArrowLeft size={16} /></button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c, i) => (
            <motion.button
              key={c.id}
              onClick={() => navigate(`/category/${c.id}`)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group relative h-[280px] rounded-2xl overflow-hidden text-right"
            >
              <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="text-[10px] tracking-[0.2em] uppercase text-gold-300 mb-1">{c.tagline}</div>
                <h3 className="text-2xl font-bold text-white mb-1">{c.name}</h3>
                <p className="text-white/70 text-sm line-clamp-1">{c.description}</p>
                <div className="inline-flex items-center gap-2 text-gold-300 font-semibold text-sm mt-3 group-hover:gap-3 transition-all">
                  גלה עכשיו <ArrowLeft size={14} />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
