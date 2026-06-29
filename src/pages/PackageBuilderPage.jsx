import { motion } from 'framer-motion'
import { Sparkles, ShieldCheck, Truck, TrendingDown } from 'lucide-react'
import PackageBuilder from '../components/builder/PackageBuilder'

export default function PackageBuilderPage() {
  return (
    <>
      {/* Dark configurator hero — the builder is the hero of the page */}
      <section className="relative overflow-hidden bg-ink-900 pt-28 md:pt-36">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="container-luxe relative z-10 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="chip mb-5 !border-gold-300/30 !bg-white/10 !text-gold-300"
          >
            <Sparkles size={14} /> בונה חבילות מבוסס AI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl"
          >
            בנה את חבילת החשמל המושלמת
            <br />
            <span className="text-gold-300">במחיר שלא תמצא בשום מקום.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 max-w-xl text-lg leading-relaxed text-white/70"
          >
            ספר לנו מה התקציב, איזו רמת מותג אתה אוהב ואילו מכשירים צריך לבית — והבונה החכם
            ירכיב חבילה מותאמת אישית, תמיד זולה ב-10% ממחיר השוק הזול ביותר.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-x-8 gap-y-3"
          >
            {[
              { icon: TrendingDown, label: 'חבילה תמיד זולה ב-10% מהשוק' },
              { icon: Truck, label: 'משלוח והתקנה חינם' },
              { icon: ShieldCheck, label: 'אחריות עד 5 שנים' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                <f.icon size={16} className="text-gold-300" />
                <span>{f.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* curved transition into the light builder area */}
        <div className="h-10 rounded-t-[2.5rem] bg-surface-100 md:h-14" />
      </section>

      {/* Builder */}
      <section className="bg-surface-100 pb-24">
        <div className="container-luxe">
          <PackageBuilder />
        </div>
      </section>
    </>
  )
}
