import { Instagram, Facebook, Youtube, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer id="contact" className="bg-ink-900 text-white pt-16 pb-8">
      <div className="container-luxe">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gold-gradient flex items-center justify-center text-white text-lg font-black">פ</div>
              <div className="text-lg font-bold text-white">פרימיום אלקטריק</div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">חנות בוטיק למוצרי חשמל יוקרתיים. כל מוצר נבחר בקפידה.</p>
            <div className="flex gap-2 mt-5">
              {[Instagram, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-gold-300 hover:border-gold-300/40 transition">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">חנות</h4>
            <ul className="space-y-2 text-sm text-white/50">
              {['טלוויזיות','מערכות שמע','מחשבים','מותגים','מבצעים'].map(l => <li key={l}><a href="#" className="hover:text-gold-300">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">שירות</h4>
            <ul className="space-y-2 text-sm text-white/50">
              {['משלוחים','אחריות','החזרות','ייעוץ אישי','תמיכה טכנית'].map(l => <li key={l}><a href="#" className="hover:text-gold-300">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">צור קשר</h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li className="flex items-start gap-2"><MapPin size={14} className="text-gold-300 mt-0.5 shrink-0" /><span>רחוב אלנבי 100, תל אביב</span></li>
              <li className="flex items-center gap-2"><Phone size={14} className="text-gold-300 shrink-0" /><span dir="ltr">+972 3-123-4567</span></li>
              <li className="flex items-center gap-2"><Mail size={14} className="text-gold-300 shrink-0" /><span>info@premium-electric.co.il</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <div>© {new Date().getFullYear()} פרימיום אלקטריק. כל הזכויות שמורות.</div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-gold-300">תנאי שימוש</a>
            <a href="#" className="hover:text-gold-300">פרטיות</a>
            <a href="#" className="hover:text-gold-300">נגישות</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
