import { useMemo } from 'react'
import { X, ShoppingBag, Check, Minus, Star } from 'lucide-react'
import { products } from '../data/products'
import { useCompare } from '../contexts/CompareContext'
import { Link } from '../router'

const fmt = (n) => new Intl.NumberFormat('he-IL').format(n)

export default function ComparePage() {
  const { ids, remove, clear } = useCompare()
  const items = useMemo(() => ids.map((id) => products.find((p) => p.id === id)).filter(Boolean), [ids])

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">⚖️</div>
          <h1 className="font-display text-4xl text-gray-900 mb-3">ההשוואה ריקה</h1>
          <p className="text-gray-500 mb-8">בחרו מוצרים מהחנות כדי להשוות ביניהם מפרט, מחיר ותכונות.</p>
          <Link to="/" className="btn-gold">לחנות</Link>
        </div>
      </div>
    )
  }

  // Collect all spec sections across products
  const allSections = Array.from(new Set(items.flatMap((p) => Object.keys(p.specs))))
  const getSpecMap = (p, section) => {
    const map = {}
    ;(p.specs[section] || []).forEach((r) => { map[r.label] = r.value })
    return map
  }
  const sectionLabels = Object.fromEntries(allSections.map((s) => {
    const labels = new Set()
    items.forEach((p) => (p.specs[s] || []).forEach((r) => labels.add(r.label)))
    return [s, Array.from(labels)]
  }))

  const dimKeys = Array.from(new Set(items.flatMap((p) => Object.keys(p.dimensions))))

  return (
    <div className="pt-24 md:pt-32 lg:pt-44 pb-20 min-h-screen">
      <div className="container-luxe">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="section-title">
              השוואת <span className="gold-text">מוצרים</span>
            </h1>
            <p className="mt-2 text-gray-500">{items.length} מוצרים בהשוואה</p>
          </div>
          <button onClick={clear} className="btn-ghost text-sm">נקה הכל</button>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[900px] border-separate border-spacing-0">
            {/* Header row — product cards */}
            <thead>
              <tr>
                <th className="sticky right-0 bg-white z-10 w-48 text-right align-top p-4 text-sm text-gray-400 font-semibold"></th>
                {items.map((p) => (
                  <th key={p.id} className="align-top p-3 min-w-[240px]">
                    <div className="card-luxe p-4 relative">
                      <button
                        onClick={() => remove(p.id)}
                        className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 border border-gray-200 text-gray-500 hover:text-red-400 hover:border-red-400/40 flex items-center justify-center z-10"
                        aria-label="הסר"
                      >
                        <X size={14} />
                      </button>
                      <Link to={`/product/${p.id}`} className="block">
                        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 mb-3">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-xs text-gold-500 tracking-wider uppercase">{p.brand}</div>
                        <div className="font-display text-lg font-bold text-gray-900 leading-snug mt-1 min-h-[48px]">{p.name}</div>
                      </Link>
                      <div className="mt-3 flex items-center gap-1">
                        <Star size={14} className="fill-gold-400 text-gold-500" />
                        <span className="text-gray-700 text-sm">{p.rating}</span>
                        <span className="text-gray-400 text-xs">({p.reviews})</span>
                      </div>
                      <div className="hair-divider my-3" />
                      <div className="text-2xl font-bold gold-text">₪{fmt(p.price)}</div>
                      {p.oldPrice && <div className="text-xs text-gray-400 line-through">₪{fmt(p.oldPrice)}</div>}
                      <button className="btn-gold w-full mt-3 !py-2 !px-3 text-xs justify-center">
                        <ShoppingBag size={14} /> קנה
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Basic row: stock */}
              <GroupHeader span={items.length + 1} title="מידע כללי" />
              <Row label="זמינות" span={items.length}>
                {items.map((p) => (
                  <Cell key={p.id}>
                    {p.inStock ? (
                      <span className="text-emerald-300 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" /> במלאי
                      </span>
                    ) : <span className="text-amber-300 text-sm">הזמנה מיוחדת</span>}
                  </Cell>
                ))}
              </Row>
              <Row label="מק״ט">
                {items.map((p) => <Cell key={p.id}>{p.sku}</Cell>)}
              </Row>
              <Row label="דגם">
                {items.map((p) => <Cell key={p.id}>{p.model}</Cell>)}
              </Row>
              <Row label="אחריות">
                {items.map((p) => <Cell key={p.id}>{p.warranty.period}</Cell>)}
              </Row>

              {/* Specs */}
              {allSections.map((section) => (
                <FragmentRows key={section} section={section} labels={sectionLabels[section]} items={items} getSpecMap={getSpecMap} />
              ))}

              {/* Dimensions */}
              <GroupHeader span={items.length + 1} title="מידות ומשקל" />
              {dimKeys.map((k) => (
                <Row key={k} label={k}>
                  {items.map((p) => <Cell key={p.id}>{p.dimensions[k] || <Minus className="text-white/20" size={14} />}</Cell>)}
                </Row>
              ))}

              {/* Key features */}
              <GroupHeader span={items.length + 1} title="תכונות עיקריות" />
              <Row label="תכונות">
                {items.map((p) => (
                  <Cell key={p.id} className="align-top">
                    <ul className="space-y-2">
                      {p.features.slice(0, 5).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <Check size={13} className="text-gold-500 mt-0.5 shrink-0" />
                          <span>{f.title}</span>
                        </li>
                      ))}
                    </ul>
                  </Cell>
                ))}
              </Row>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function GroupHeader({ span, title }) {
  return (
    <tr>
      <td colSpan={span} className="px-4 pt-10 pb-3">
        <div className="font-display text-2xl font-bold gold-text">{title}</div>
        <div className="hair-divider mt-2" />
      </td>
    </tr>
  )
}

function Row({ label, children }) {
  return (
    <tr className="group">
      <td className="sticky right-0 bg-white z-10 px-4 py-3 text-sm text-gray-500 font-semibold border-t border-gray-100 text-right">
        {label}
      </td>
      {children}
    </tr>
  )
}

function Cell({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-sm text-gray-600 text-center border-t border-gray-100 ${className}`}>
      {children}
    </td>
  )
}

function FragmentRows({ section, labels, items, getSpecMap }) {
  return (
    <>
      <GroupHeader span={items.length + 1} title={section} />
      {labels.map((label) => (
        <Row key={label} label={label}>
          {items.map((p) => {
            const val = getSpecMap(p, section)[label]
            return <Cell key={p.id}>{val || <Minus className="text-white/20 mx-auto" size={14} />}</Cell>
          })}
        </Row>
      ))}
    </>
  )
}
