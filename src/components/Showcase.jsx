import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const features = [
  'תצוגת OLED evo דור רביעי, בהירות עד 3,000 ניט',
  'עיבוד תמונה α11 AI Processor',
  'Dolby Vision IQ + Dolby Atmos',
  '4 יציאות HDMI 2.1 עם 120Hz ו-VRR',
  'אינטגרציה מלאה עם מערכות בית חכם',
]

export default function Showcase() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="container-luxe grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative order-2 lg:order-1"
        >
          <div className="absolute -inset-10 bg-gold-400/10 blur-3xl rounded-full" />
          <div className="relative rounded-3xl overflow-hidden border border-gold-400/20 shadow-luxe">
            <img
              src="https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1600&q=80"
              alt=""
              className="w-full h-[560px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 right-6 left-6 flex items-end justify-between">
              <div>
                <div className="text-xs text-gold-300 tracking-widest uppercase">LG Signature</div>
                <div className="font-display text-2xl font-bold text-white">OLED evo G4</div>
              </div>
              <div className="text-3xl font-bold gold-text">₪24,990</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="order-1 lg:order-2"
        >
          <div className="chip mb-6">כוכב הקולקציה</div>
          <h2 className="section-title">
            כשהתמונה <br />
            <span className="gold-text">נעלמת בקיר</span>
          </h2>
          <p className="mt-6 text-white/70 text-lg leading-relaxed">
            ה-OLED evo G4 החדש אינו רק טלוויזיה — זוהי יצירת אמנות שמתמזגת בבית שלכם.
            עובי של 2.4 ס"מ בלבד, מסגרת מינימליסטית, ואיכות תמונה שמשנה את ההגדרה של "מציאותי".
          </p>

          <ul className="mt-8 space-y-4">
            {features.map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-gold-400/10 border border-gold-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} className="text-gold-300" />
                </div>
                <span className="text-white/80">{f}</span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-10 flex gap-4">
            <button className="btn-gold">הוסף לעגלה</button>
            <button className="btn-ghost">מפרט מלא</button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
