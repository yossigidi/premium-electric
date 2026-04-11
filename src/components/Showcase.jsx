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
    <section className="py-20">
      <div className="container-luxe grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="order-2 lg:order-1">
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-luxe">
            <img src="https://media.us.lg.com/transform/ecomm-PDPGallery-1100x730/04b71684-166f-4333-896a-76e61d94ac78/TV_OLED97G4WUA_gallery-01_3000x3000"
              alt="LG OLED G4" className="w-full h-[460px] object-contain p-8" />
            <div className="p-6 bg-white border-t border-gray-100 flex items-end justify-between">
              <div>
                <div className="text-xs text-gold-500 tracking-wider uppercase font-semibold">LG Signature</div>
                <div className="text-xl font-bold text-gray-900">OLED evo G4</div>
              </div>
              <div className="text-3xl font-bold gold-text">₪24,990</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="order-1 lg:order-2">
          <div className="chip mb-4">כוכב הקולקציה</div>
          <h2 className="section-title">כשהתמונה <br /><span className="gold-text">נעלמת בקיר</span></h2>
          <p className="mt-5 text-gray-500 text-lg leading-relaxed">
            ה-OLED evo G4 אינו רק טלוויזיה — זוהי יצירת אמנות שמתמזגת בבית שלכם.
            עובי של 2.4 ס"מ בלבד, מסגרת מינימליסטית, ואיכות תמונה שמשנה את ההגדרה של "מציאותי".
          </p>
          <ul className="mt-6 space-y-3">
            {features.map((f, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={13} className="text-gold-500" />
                </div>
                <span className="text-gray-600">{f}</span>
              </motion.li>
            ))}
          </ul>
          <div className="mt-8 flex gap-3">
            <button className="btn-gold">הוסף לעגלה</button>
            <button className="btn-ghost">מפרט מלא</button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
