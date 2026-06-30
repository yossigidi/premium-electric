import { BadgePercent, Package, ShoppingBag, TriangleAlert, Zap } from 'lucide-react'
import { formatNis, PACKAGE_DISCOUNT } from '../../utils/pricing'

/**
 * Sticky package summary — the persuasion panel. Leads with the package total,
 * then the two savings angles: vs Zap's lowest market price, and vs buying the
 * same items here one by one. Dark premium surface so it stands out.
 */
export default function PackageSummary({ result }) {
  const { pricing, withinBudget, overBy } = result
  const { total, savingsVsZap, savingsVsZapPct, savingsVsSingles, count, zapTotal } = pricing

  return (
    <div className="overflow-hidden rounded-3xl bg-ink-900 text-white shadow-luxe">
      <div className="bg-radial-glow p-6">
        <div className="flex items-center gap-2 text-gold-300">
          <Package size={18} />
          <span className="text-sm font-semibold">החבילה שלך</span>
          <span className="mr-auto rounded-full bg-white/10 px-2.5 py-0.5 text-xs">{count} מוצרים</span>
        </div>

        <div className="mt-5">
          <div className="text-sm text-white/50">מחיר חבילה</div>
          <div className="mt-1 text-4xl font-bold text-white">₪{formatNis(total)}</div>
          <div className="mt-1 text-xs text-white/40 line-through">מחיר שוק ₪{formatNis(zapTotal)}</div>
        </div>

        {/* Headline saving vs Zap */}
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-gold-gradient p-3.5 text-white">
          <Zap size={20} className="shrink-0" />
          <div>
            <div className="text-[11px] uppercase tracking-wide text-white/80">חיסכון מול המחיר הזול בזאפ</div>
            <div className="text-lg font-bold leading-tight">
              ₪{formatNis(savingsVsZap)} <span className="text-sm font-semibold">({savingsVsZapPct}%)</span>
            </div>
          </div>
        </div>

        {/* Secondary saving vs buying singles here */}
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5">
          <BadgePercent size={20} className="shrink-0 text-gold-300" />
          <div>
            <div className="text-[11px] uppercase tracking-wide text-white/50">לעומת קנייה בודדת אצלנו</div>
            <div className="text-base font-bold text-white">חוסכים עוד ₪{formatNis(savingsVsSingles)}</div>
          </div>
        </div>

        {!withinBudget && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-[12px] leading-snug text-amber-200">
            <TriangleAlert size={15} className="mt-0.5 shrink-0" />
            <span>
              החבילה חורגת מהתקציב ב-<span className="font-bold">₪{formatNis(overBy)}</span>. אלה הדגמים
              המשתלמים ביותר לסוגים שבחרת — אפשר להגדיל מעט את התקציב או להסיר מכשיר.
            </span>
          </div>
        )}

        <button
          type="button"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 font-bold text-ink-900 transition-all duration-200 hover:bg-gold-100 hover:shadow-gold-glow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
        >
          <ShoppingBag size={18} /> אני רוצה את החבילה
        </button>
        <p className="mt-2.5 text-center text-[11px] text-white/40">
          הנחת חבילה {Math.round(PACKAGE_DISCOUNT * 100)}% כבר כלולה במחיר • ללא התחייבות
        </p>
      </div>
    </div>
  )
}
