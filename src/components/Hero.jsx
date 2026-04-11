import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, ShieldCheck, Truck } from 'lucide-react'

export default function Hero() {
  return (
    <section id="top" className="relative min-h-[85vh] flex items-center overflow-hidden pt-20 md:pt-28 lg:pt-36 bg-ink-900">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=2400&q=80" alt="" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-l from-ink-900 via-ink-900/80 to-ink-900/40" />
      </div>

      <div className="container-luxe relative z-10 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="chip !bg-white/10 !text-gold-300 !border-gold-300/30 mb-5">
          <Sparkles size={14} /> קולקציית 2026 הגיעה
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight text-white max-w-2xl">
          יוקרה<br /><span className="text-gold-300">שמרגישים</span><br />בכל פיקסל.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed">
          מוצרי חשמל נבחרים מהמותגים הכי נחשקים בעולם. טלוויזיות, מערכות שמע, מחשבים ומוצרי חשמל ביתיים — כולם עם שירות אישי.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 flex flex-wrap gap-4">
          <a href="#categories" className="btn-gold">גלו את הקולקציה <ArrowLeft size={18} /></a>
          <a href="#/search" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-white border border-white/20 hover:border-white/40 transition">חיפוש מתקדם</a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-wrap gap-8">
          {[
            { icon: Truck, label: 'משלוח והתקנה חינם' },
            { icon: ShieldCheck, label: 'אחריות עד 5 שנים' },
            { icon: Sparkles, label: 'ייעוץ אישי 24/7' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-white/70 text-sm">
              <f.icon size={16} className="text-gold-300" />
              <span>{f.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
