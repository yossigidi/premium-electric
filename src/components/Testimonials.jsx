import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { testimonials } from '../data/products'

export default function Testimonials() {
  return (
    <section className="py-28 relative">
      <div className="container-luxe">
        <div className="text-center mb-14">
          <div className="chip mb-4">מה אומרים עלינו</div>
          <h2 className="section-title">
            לקוחות <span className="gold-text">מרוצים</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="card-luxe p-8"
            >
              <Quote className="text-gold-400/40 mb-4" size={32} />
              <p className="text-white/80 leading-relaxed text-lg mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-gold-400 text-gold-400" />
                ))}
              </div>
              <div className="hair-divider mb-4" />
              <div>
                <div className="font-semibold text-white">{t.name}</div>
                <div className="text-sm text-white/50">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
