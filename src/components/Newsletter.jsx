import { useState } from 'react'
import { Mail, Check } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <section className="py-24">
      <div className="container-luxe">
        <div className="relative overflow-hidden rounded-3xl border border-gold-400/20 p-12 md:p-16 bg-ink-700/50">
          <div className="absolute inset-0 bg-radial-glow" />
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gold-400/10 blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="chip mb-4">הצטרפו למועדון</div>
              <h2 className="section-title">
                גישה <span className="gold-text">מוקדמת</span> לקולקציות
              </h2>
              <p className="mt-4 text-white/70 max-w-md">
                חברי המועדון מקבלים הודעה ראשונים על השקות, מוזמנים לערבי VIP ונהנים מהנחות בלעדיות.
              </p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true) }}
              className="relative"
            >
              <div className="relative flex items-center bg-ink-900/80 rounded-full border border-white/10 focus-within:border-gold-400/50 transition p-1.5">
                <Mail className="text-white/40 mr-4 ml-3" size={18} />
                <input
                  type="email"
                  required
                  placeholder="האימייל שלך"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder-white/30 py-3"
                />
                <button className="btn-gold !py-2.5 !px-6 text-sm">
                  {sent ? <><Check size={16} /> נרשמת</> : 'הצטרף'}
                </button>
              </div>
              <p className="text-xs text-white/40 mt-3 mr-4">אנחנו לא שולחים ספאם. לעולם.</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
