import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, ShieldCheck, Truck } from 'lucide-react'

export default function Hero() {
  return (
    <section id="top" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=2400&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-ink-900 via-ink-900/80 to-ink-900/30" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.9),transparent_70%)]" />
      </div>

      {/* Floating orb */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-10 w-96 h-96 rounded-full bg-gold-400/10 blur-[120px]"
      />

      <div className="container-luxe relative z-10 grid lg:grid-cols-12 gap-10 py-20">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="chip mb-6"
          >
            <Sparkles size={14} />
            קולקציית 2026 הגיעה
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight"
          >
            יוקרה
            <br />
            <span className="gold-text">שמרגישים</span>
            <br />
            בכל פיקסל.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="mt-8 text-lg md:text-xl text-white/70 max-w-xl leading-relaxed"
          >
            מוצרי חשמל נבחרים מהמותגים הכי נחשקים בעולם. טלוויזיות OLED, מערכות שמע שמרגישות כמו אולם קונצרטים, ומחשבים ללא פשרות — כולם מגיעים עם שירות אישי של רכש פרטי.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a href="#featured" className="btn-gold">
              גלו את הקולקציה
              <ArrowLeft size={18} />
            </a>
            <a href="#categories" className="btn-ghost">קטגוריות</a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-14 grid grid-cols-3 gap-6 max-w-xl"
          >
            {[
              { icon: Truck, label: 'משלוח והתקנה', sub: 'ללא עלות' },
              { icon: ShieldCheck, label: 'אחריות מורחבת', sub: 'עד 5 שנים' },
              { icon: Sparkles, label: 'רכש פרטי', sub: 'ייעוץ אישי 24/7' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-300 shrink-0">
                  <f.icon size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{f.label}</div>
                  <div className="text-xs text-white/50">{f.sub}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Product showcase card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="lg:col-span-5 hidden lg:block"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gold-400/20 blur-3xl rounded-full" />
            <div className="relative card-luxe p-6 shadow-luxe">
              <div className="flex items-center justify-between mb-4">
                <div className="chip">הכי נמכר</div>
                <div className="text-xs text-white/40">#001</div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=900&q=80"
                alt=""
                className="w-full h-64 object-cover rounded-xl animate-float"
              />
              <div className="mt-5">
                <div className="text-xs text-gold-300 tracking-widest uppercase mb-1">Samsung Neo QLED</div>
                <h3 className="font-display text-2xl font-bold text-white">QN900D · 75" 8K</h3>
                <div className="flex items-end justify-between mt-4">
                  <div>
                    <div className="text-xs text-white/40 line-through">₪34,990</div>
                    <div className="text-3xl font-bold gold-text">₪31,490</div>
                  </div>
                  <button className="btn-gold !py-2.5 !px-5 text-sm">לרכישה</button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
