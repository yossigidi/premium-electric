import { Truck, ShieldCheck, Phone, Sparkles } from 'lucide-react'

const items = [
  { icon: Truck,       text: 'משלוח והתקנה חינם בכל הארץ' },
  { icon: ShieldCheck, text: 'אחריות יבואן רשמי עד 5 שנים' },
  { icon: Sparkles,    text: '36 תשלומים ללא ריבית' },
  { icon: Phone,       text: 'קו VIP 24/7 בעברית' },
]

export default function TopBar() {
  return (
    <div className="hidden md:block fixed top-0 inset-x-0 z-50 bg-ink-900 border-b border-gold-400/10 text-[11px] text-white/60">
      <div className="container-luxe h-8 flex items-center justify-center gap-8 overflow-hidden">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <it.icon size={12} className="text-gold-400" />
            <span>{it.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
