import { Instagram, Facebook, Youtube, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer id="contact" className="bg-ink-900 border-t border-white/5 pt-20 pb-10">
      <div className="container-luxe">
        <div className="grid md:grid-cols-4 gap-10 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center font-display text-ink-900 text-xl font-black">
                פ
              </div>
              <div className="font-display text-lg font-bold gold-text">פרימיום אלקטריק</div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              חנות בוטיק למוצרי חשמל יוקרתיים. כל מוצר נבחר בקפידה, כל לקוח מקבל יחס אישי.
            </p>
            <div className="flex gap-3 mt-6">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-gold-300 hover:border-gold-400/40 transition"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5">חנות</h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li><a href="#tv" className="hover:text-gold-300">טלוויזיות</a></li>
              <li><a href="#audio" className="hover:text-gold-300">מערכות שמע</a></li>
              <li><a href="#computers" className="hover:text-gold-300">מחשבים</a></li>
              <li><a href="#brands" className="hover:text-gold-300">מותגים</a></li>
              <li><a href="#" className="hover:text-gold-300">מבצעים</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5">שירות</h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li><a href="#" className="hover:text-gold-300">משלוחים והתקנה</a></li>
              <li><a href="#" className="hover:text-gold-300">אחריות</a></li>
              <li><a href="#" className="hover:text-gold-300">החזרות</a></li>
              <li><a href="#" className="hover:text-gold-300">ייעוץ אישי</a></li>
              <li><a href="#" className="hover:text-gold-300">תמיכה טכנית</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-5">צור קשר</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold-400 mt-0.5 shrink-0" />
                <span>רחוב אלנבי 100<br />תל אביב-יפו</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gold-400 shrink-0" />
                <span dir="ltr">+972 3-123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold-400 shrink-0" />
                <span>concierge@premium-electric.co.il</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="hair-divider mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div>© {new Date().getFullYear()} פרימיום אלקטריק. כל הזכויות שמורות.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gold-300">תנאי שימוש</a>
            <a href="#" className="hover:text-gold-300">פרטיות</a>
            <a href="#" className="hover:text-gold-300">נגישות</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
