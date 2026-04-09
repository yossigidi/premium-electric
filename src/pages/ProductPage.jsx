import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft, Star, Heart, Share2, ShoppingBag, Check, Truck, ShieldCheck,
  Sparkles, Package, Phone, MessageCircle, CreditCard, Home, ChevronDown, Scale,
  BadgeCheck, Award,
} from 'lucide-react'
import { getProductById, getRelatedProducts, categories } from '../data/products'
import { Link, useRouter } from '../router'
import ProductCard from '../components/ProductCard'
import { useCompare } from '../contexts/CompareContext'

const fmt = (n) => new Intl.NumberFormat('he-IL').format(n)

export default function ProductPage({ id }) {
  const product = getProductById(id)
  const { navigate } = useRouter()

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white pt-32">
        <div className="text-center">
          <h1 className="text-4xl font-display mb-4">המוצר לא נמצא</h1>
          <Link to="/" className="btn-gold">חזרה לחנות</Link>
        </div>
      </div>
    )
  }

  return <ProductPageContent key={product.id} product={product} />
}

function ProductPageContent({ product }) {
  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('description')
  const [added, setAdded] = useState(false)
  const related = useMemo(() => getRelatedProducts(product), [product])
  const category = categories.find((c) => c.id === product.category)
  const { toggle: toggleCompare, has: inCompare } = useCompare()

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0
  const installments = 36
  const perMonth = Math.round(product.price / installments)

  useEffect(() => { setActiveImage(0); setTab('description') }, [product.id])

  const tabs = [
    { id: 'description', label: 'תיאור מלא' },
    { id: 'specs',       label: 'מפרט טכני' },
    { id: 'dimensions',  label: 'מידות ומשקל' },
    { id: 'warranty',    label: 'אחריות' },
    { id: 'service',     label: 'משלוח ושירות' },
    { id: 'qa',          label: 'שאלות ותשובות' },
  ]

  const handleAdd = () => {
    setAdded(true)
    setTimeout(() => setAdded(false), 2200)
  }

  return (
    <div className="pt-24 md:pt-32 lg:pt-44 pb-32 lg:pb-20 min-h-screen">
      {/* Breadcrumbs */}
      <div className="container-luxe py-6">
        <nav className="flex items-center gap-2 text-sm text-white/50 flex-wrap">
          <Link to="/" className="hover:text-gold-300 inline-flex items-center gap-1">
            <Home size={14} /> דף הבית
          </Link>
          <ChevronLeft size={14} className="text-white/30" />
          <Link to="/" className="hover:text-gold-300">{category?.name}</Link>
          <ChevronLeft size={14} className="text-white/30" />
          <span className="text-white/80 truncate">{product.name}</span>
        </nav>
      </div>

      {/* Main product section */}
      <div className="container-luxe grid lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Gallery */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden border border-white/10 bg-ink-800/50 shadow-luxe"
          >
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              {product.badge && (
                <span className="px-4 py-1.5 rounded-full bg-gold-gradient text-ink-900 text-xs font-bold shadow-gold-glow">
                  {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="px-4 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                  חסכון {discount}%
                </span>
              )}
            </div>
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <button className="w-10 h-10 rounded-full bg-ink-900/80 backdrop-blur border border-white/10 text-white/70 hover:text-red-400 hover:border-red-400/40 transition flex items-center justify-center">
                <Heart size={16} />
              </button>
              <button className="w-10 h-10 rounded-full bg-ink-900/80 backdrop-blur border border-white/10 text-white/70 hover:text-gold-300 hover:border-gold-400/40 transition flex items-center justify-center">
                <Share2 size={16} />
              </button>
              <button
                onClick={() => toggleCompare(product.id)}
                title={inCompare(product.id) ? 'הסר מהשוואה' : 'הוסף להשוואה'}
                className={`w-10 h-10 rounded-full backdrop-blur border flex items-center justify-center transition ${
                  inCompare(product.id)
                    ? 'bg-gold-400 border-gold-400 text-ink-900'
                    : 'bg-ink-900/80 border-white/10 text-white/70 hover:text-gold-300 hover:border-gold-400/40'
                }`}
              >
                <Scale size={16} />
              </button>
            </div>
            <div className="w-full h-[560px] bg-gradient-to-br from-white to-neutral-100">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />
            </div>
          </motion.div>

          {/* Thumbnails */}
          <div className="mt-4 grid grid-cols-5 gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-gradient-to-br from-white to-neutral-100 transition-all duration-300 ${
                  activeImage === i
                    ? 'border-gold-400 shadow-gold-glow'
                    : 'border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-contain p-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs tracking-[0.25em] uppercase text-gold-300">{product.brand}</span>
            <span className="text-white/30">•</span>
            <span className="text-xs text-white/50">מק"ט: {product.sku}</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.floor(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-white/20'}
                />
              ))}
              <span className="text-white font-semibold mr-2">{product.rating}</span>
            </div>
            <span className="text-white/50 text-sm">({product.reviews} ביקורות)</span>
            <span className="text-white/30">•</span>
            <button className="text-gold-300 text-sm hover:underline">כתוב ביקורת</button>
          </div>

          {/* Short description */}
          <p className="mt-5 text-white/70 leading-relaxed">{product.shortDescription}</p>

          <div className="hair-divider my-6" />

          {/* Stock */}
          <div className="flex items-center gap-3 mb-6">
            {product.inStock ? (
              <>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  במלאי — זמין למשלוח מיידי
                </span>
                <span className="text-white/50 text-xs">נותרו {product.stockCount} יחידות</span>
              </>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                הזמנה מיוחדת — 7-14 ימי עסקים
              </span>
            )}
          </div>

          {/* Price block */}
          <div className="p-6 rounded-2xl bg-ink-800/70 border border-gold-400/20">
            <div className="flex items-end justify-between flex-wrap gap-3">
              <div>
                {product.oldPrice && (
                  <div className="text-sm text-white/40 line-through mb-1">
                    מחיר קודם: ₪{fmt(product.oldPrice)}
                  </div>
                )}
                <div className="text-4xl md:text-5xl font-bold gold-text leading-none">
                  ₪{fmt(product.price)}
                </div>
                {product.oldPrice && (
                  <div className="text-red-400 text-sm font-semibold mt-2">
                    חסכון של ₪{fmt(product.oldPrice - product.price)}
                  </div>
                )}
              </div>
              <div className="text-left">
                <div className="text-xs text-white/50">או עד {installments} תשלומים של</div>
                <div className="text-xl font-bold text-white">₪{fmt(perMonth)}</div>
                <div className="text-xs text-white/40">ללא ריבית</div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 text-xs text-white/50">
              <CreditCard size={14} />
              <span>המחיר נכון ל-{new Date().toLocaleDateString('he-IL')} · כולל מע"מ</span>
            </div>
          </div>

          {/* Quantity + CTA */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center bg-ink-800 border border-white/10 rounded-full">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-11 h-11 text-white/70 hover:text-gold-300 font-bold text-lg"
              >−</button>
              <div className="w-10 text-center font-bold text-white">{qty}</div>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-11 h-11 text-white/70 hover:text-gold-300 font-bold text-lg"
              >+</button>
            </div>
            <button onClick={handleAdd} className="btn-gold flex-1 justify-center">
              {added ? (
                <><Check size={18} /> נוסף לעגלה</>
              ) : (
                <><ShoppingBag size={18} /> הוסף לעגלה</>
              )}
            </button>
          </div>
          <button className="btn-ghost w-full mt-3 justify-center">קנה עכשיו — Checkout מהיר</button>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { icon: Truck,       title: 'משלוח + התקנה חינם', sub: 'תוך 48 שעות' },
              { icon: ShieldCheck, title: `אחריות ${product.warranty.period}`, sub: 'שירות בבית' },
              { icon: BadgeCheck,  title: 'מחיר מובטח', sub: 'נשווה לכל מחיר' },
              { icon: Award,       title: 'מקורי 100%', sub: 'יבוא רשמי' },
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-ink-800/40 border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-300 shrink-0">
                  <b.icon size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{b.title}</div>
                  <div className="text-[10px] text-white/40">{b.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Concierge */}
          <div className="mt-5 p-4 rounded-xl bg-gold-400/5 border border-gold-400/20 flex items-center gap-4">
            <Sparkles className="text-gold-300 shrink-0" size={20} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">צריכים ייעוץ אישי?</div>
              <div className="text-xs text-white/60">יועץ פרטי ידבר איתכם על הצרכים שלכם</div>
            </div>
            <button className="p-2.5 rounded-full bg-gold-400 text-ink-900 hover:scale-105 transition" aria-label="WhatsApp">
              <MessageCircle size={16} />
            </button>
            <button className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition" aria-label="טלפון">
              <Phone size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container-luxe mt-20">
        <div className="flex gap-2 border-b border-white/10 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative whitespace-nowrap px-6 py-4 text-sm font-semibold transition-colors ${
                tab === t.id ? 'text-gold-300' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {t.label}
              {tab === t.id && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-gold-gradient"
                />
              )}
            </button>
          ))}
        </div>

        <div className="py-10">
          {tab === 'description' && <DescriptionTab product={product} />}
          {tab === 'specs'       && <SpecsTab       product={product} />}
          {tab === 'dimensions'  && <DimensionsTab  product={product} />}
          {tab === 'warranty'    && <WarrantyTab    product={product} />}
          {tab === 'service'     && <ServiceTab     product={product} />}
          {tab === 'qa'          && <QATab />}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="container-luxe mt-16">
          <div className="flex items-end justify-between mb-10">
            <h2 className="section-title">
              עשויים <span className="gold-text">לעניין</span> אתכם
            </h2>
            <Link to="/" className="btn-ghost text-sm">לכל הקטגוריה</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      )}

      {/* Sticky mobile cart bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ink-900/95 backdrop-blur-xl border-t border-gold-400/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white/50 truncate">{product.name}</div>
            <div className="text-xl font-bold gold-text">₪{fmt(product.price)}</div>
          </div>
          <button onClick={handleAdd} className="btn-gold">
            <ShoppingBag size={16} /> קנה
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================== Tabs ================== */

function DescriptionTab({ product }) {
  return (
    <div className="grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-5">
        {product.description.map((p, i) => (
          <p key={i} className="text-white/75 leading-relaxed text-lg">{p}</p>
        ))}
      </div>
      <div className="space-y-4">
        <h3 className="font-display text-2xl font-bold text-white mb-2">תכונות עיקריות</h3>
        {product.features.map((f, i) => (
          <div key={i} className="p-4 rounded-xl bg-ink-800/50 border border-white/5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center text-ink-900">
                <Check size={14} strokeWidth={3} />
              </div>
              <div className="font-semibold text-white">{f.title}</div>
            </div>
            <div className="text-sm text-white/60 mr-11">{f.text || f.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SpecsTab({ product }) {
  return (
    <div className="max-w-4xl space-y-8">
      {Object.entries(product.specs).map(([section, rows]) => (
        <div key={section}>
          <h3 className="font-display text-2xl font-bold text-gold-300 mb-4">{section}</h3>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            {rows.map((r, i) => (
              <div
                key={r.label}
                className={`flex justify-between gap-6 px-6 py-4 ${
                  i % 2 === 0 ? 'bg-ink-800/60' : 'bg-ink-700/40'
                }`}
              >
                <div className="text-white/60">{r.label}</div>
                <div className="text-white font-semibold text-left">{r.value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function DimensionsTab({ product }) {
  return (
    <div className="grid md:grid-cols-2 gap-10 max-w-5xl">
      <div>
        <h3 className="font-display text-2xl font-bold text-gold-300 mb-5 flex items-center gap-3">
          <Package size={22} /> מידות ומשקל
        </h3>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          {Object.entries(product.dimensions).map(([k, v], i) => (
            <div
              key={k}
              className={`flex justify-between px-6 py-4 ${
                i % 2 === 0 ? 'bg-ink-800/60' : 'bg-ink-700/40'
              }`}
            >
              <div className="text-white/60">{k}</div>
              <div className="text-white font-semibold">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gold-400/10 blur-3xl rounded-full" />
        <div className="relative p-10 rounded-3xl bg-ink-800/40 border border-gold-400/20 text-center">
          <div className="font-display text-6xl font-bold gold-text mb-2">
            {product.dimensions['משקל'] || product.dimensions['משקל עם מעמד']}
          </div>
          <div className="text-white/60">משקל כולל</div>
          <div className="hair-divider my-6" />
          <div className="text-sm text-white/50 leading-relaxed">
            כל מוצר נשלח באריזה מקורית עם הגנה מלאה.<br />
            התקנה מקצועית כלולה במחיר.
          </div>
        </div>
      </div>
    </div>
  )
}

function WarrantyTab({ product }) {
  return (
    <div className="max-w-4xl">
      <div className="flex items-start gap-6 p-8 rounded-3xl bg-gradient-to-br from-gold-400/10 to-transparent border border-gold-400/20">
        <div className="w-20 h-20 rounded-2xl bg-gold-gradient flex items-center justify-center text-ink-900 shrink-0">
          <ShieldCheck size={36} />
        </div>
        <div>
          <div className="text-xs tracking-widest uppercase text-gold-300 mb-1">תקופת אחריות</div>
          <div className="font-display text-4xl font-bold text-white">{product.warranty.period}</div>
          <p className="mt-4 text-white/75 leading-relaxed text-lg">{product.warranty.details}</p>
        </div>
      </div>

      <div className="mt-10 grid md:grid-cols-2 gap-4">
        {product.warranty.includes.map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-ink-800/50 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
              <Check size={14} strokeWidth={3} />
            </div>
            <div className="text-white">{item}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ServiceTab({ product }) {
  const items = [
    { icon: Truck,       title: 'משלוח',    text: product.service.delivery },
    { icon: Package,     title: 'התקנה',    text: product.service.installation },
    { icon: Phone,       title: 'תמיכה',    text: product.service.support },
  ]
  return (
    <div className="max-w-4xl space-y-5">
      {items.map((it, i) => (
        <div key={i} className="flex gap-5 p-6 rounded-2xl bg-ink-800/50 border border-white/5 hover:border-gold-400/30 transition">
          <div className="w-14 h-14 rounded-2xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-300 shrink-0">
            <it.icon size={22} />
          </div>
          <div>
            <div className="font-display text-xl font-bold text-white mb-2">{it.title}</div>
            <div className="text-white/70 leading-relaxed">{it.text}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function QATab() {
  const [open, setOpen] = useState(0)
  const qas = [
    { q: 'האם ההתקנה כלולה במחיר?', a: 'כן. כל מוצר כולל משלוח + התקנה מקצועית בבית הלקוח על ידי צוות טכנאים מוסמכים ללא עלות נוספת.' },
    { q: 'האם אפשר לפרוס לתשלומים?', a: 'בהחלט. עד 36 תשלומים ללא ריבית בכרטיס אשראי, או מימון מותאם עד 60 תשלומים דרך חברת האשראי.' },
    { q: 'מה ההבדל מאחריות יצרן?', a: 'אחריות פרימיום אלקטריק כוללת מעבר לאחריות היצרן גם שירות בבית, החלפת מכשיר בשנים הראשונות, וקו תמיכה VIP ייעודי בעברית.' },
    { q: 'האם יש אפשרות החזרה?', a: 'כן. 14 ימי ניסיון מרגע קבלת המוצר — אם לא שבעי רצון, נאסוף את המוצר ונחזיר את מלוא התשלום.' },
    { q: 'האם המוצר מקורי עם יבוא רשמי?', a: 'כל המוצרים שלנו הם יבוא רשמי של היבואן הרשמי בישראל, עם אחריות מלאה ותעודת יבוא רשמית.' },
  ]
  return (
    <div className="max-w-3xl space-y-3">
      {qas.map((item, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-ink-800/40 overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-right"
          >
            <span className="font-semibold text-white">{item.q}</span>
            <ChevronDown
              size={20}
              className={`text-gold-300 transition-transform ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-white/70 leading-relaxed">{item.a}</div>
          )}
        </div>
      ))}
    </div>
  )
}
