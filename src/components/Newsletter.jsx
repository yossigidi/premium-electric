import { useState } from 'react'
import { Mail, Check } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <section className="py-16">
      <div className="container-luxe">
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-10 md:p-14 shadow-card">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="chip mb-3">הצטרפו למועדון</div>
              <h2 className="section-title text-3xl md:text-4xl">גישה <span className="gold-text">מוקדמת</span></h2>
              <p className="mt-3 text-gray-500">חברי המועדון מקבלים הודעה ראשונים על השקות ונהנים מהנחות בלעדיות.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
              <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 focus-within:border-gold-400 transition p-1">
                <Mail className="text-gray-400 mr-4 ml-3" size={18} />
                <input type="email" required placeholder="האימייל שלך" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 py-3" />
                <button className="btn-gold !py-2.5 !px-5 text-sm">
                  {sent ? <><Check size={16} /> נרשמת</> : 'הצטרף'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 mr-4">אנחנו לא שולחים ספאם. לעולם.</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
