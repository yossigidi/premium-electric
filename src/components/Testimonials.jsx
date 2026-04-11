import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { testimonials } from '../data/products'

export default function Testimonials() {
  return (
    <section className="py-20">
      <div className="container-luxe">
        <div className="text-center mb-10">
          <div className="chip mb-3">מה אומרים עלינו</div>
          <h2 className="section-title">לקוחות <span className="gold-text">מרוצים</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card-luxe p-7">
              <Quote className="text-gold-300/50 mb-3" size={28} />
              <p className="text-gray-600 leading-relaxed text-base mb-5">"{t.quote}"</p>
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={13} className="fill-gold-300 text-gold-300" />
                ))}
              </div>
              <div className="hair-divider mb-3" />
              <div className="font-semibold text-gray-900">{t.name}</div>
              <div className="text-sm text-gray-400">{t.role}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
