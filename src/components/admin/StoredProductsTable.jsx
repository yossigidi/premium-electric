import { useState, Fragment } from 'react'
import { Save, Trash2, Loader2, Check, ChevronDown, ChevronRight } from 'lucide-react'
import { applianceTypes, BRAND_TIERS } from '../../data/builderCatalog'
import { singlePrice, formatNis } from '../../utils/pricing'

const cellInput =
  'w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-gray-800 ' +
  'outline-none transition-colors hover:border-gray-200 focus:border-gold-400 focus:bg-white focus:ring-1 focus:ring-gold-400/40'
const panelInput =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400/40'

/**
 * Editable view of the products already saved in the DB. The main row edits the
 * core fields; expand a row to view/edit the rich detail (description, tags,
 * warranty) and preview the extracted features + spec tables. Saving PUTs the
 * whole product back to D1.
 */
export default function StoredProductsTable({ products, onUpdate, onRemove }) {
  const [edits, setEdits] = useState({}) // id -> { field: value }
  const [busyId, setBusyId] = useState(null)
  const [open, setOpen] = useState({}) // id -> bool

  const valueOf = (p, field) =>
    edits[p.id]?.[field] !== undefined ? edits[p.id][field] : p[field]
  const isDirty = (id) => edits[id] && Object.keys(edits[id]).length > 0

  const setField = (id, field, value) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))

  const save = async (p) => {
    setBusyId(p.id)
    try {
      await onUpdate({ ...p, ...edits[p.id] })
      setEdits((prev) => { const n = { ...prev }; delete n[p.id]; return n })
    } finally {
      setBusyId(null)
    }
  }

  const numField = (id, field) => (e) =>
    setField(id, field, e.target.value === '' ? undefined : Number(e.target.value))

  const toggle = (id) => setOpen((p) => ({ ...p, [id]: !p[id] }))

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100">
      <table className="w-full min-w-[900px] text-right">
        <thead>
          <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <th className="w-8 px-2 py-3"><span className="sr-only">פרטים</span></th>
            <th className="px-3 py-3">מוצר</th>
            <th className="px-3 py-3">מותג</th>
            <th className="px-3 py-3">דגם</th>
            <th className="px-3 py-3">קטגוריה</th>
            <th className="px-3 py-3">רמה</th>
            <th className="px-3 py-3">מחיר מחירון</th>
            <th className="px-3 py-3">מחיר זאפ</th>
            <th className="px-3 py-3">מחיר שלנו</th>
            <th className="w-20 px-3 py-3"><span className="sr-only">פעולות</span></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const dirty = isDirty(p.id)
            const ourPrice = singlePrice(valueOf(p, 'zapLow') ?? valueOf(p, 'price'))
            const features = valueOf(p, 'features') || []
            const specs = valueOf(p, 'specs') || {}
            const specCount = Object.values(specs).reduce((n, rows) => n + (Array.isArray(rows) ? rows.length : 0), 0)
            const isOpen = !!open[p.id]
            return (
              <Fragment key={p.id}>
                <tr className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="px-2 py-2 align-top">
                    <button type="button" onClick={() => toggle(p.id)} aria-label="פרטים מלאים" className="mt-1.5 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gold-500">
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input value={valueOf(p, 'name') || ''} onChange={(e) => setField(p.id, 'name', e.target.value)} dir="auto" className={`${cellInput} min-w-[180px] font-medium`} />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input value={valueOf(p, 'brand') || ''} onChange={(e) => setField(p.id, 'brand', e.target.value)} placeholder="—" dir="auto" className={`${cellInput} min-w-[100px]`} />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input value={valueOf(p, 'model') || ''} onChange={(e) => setField(p.id, 'model', e.target.value)} placeholder="—" dir="ltr" className={`${cellInput} min-w-[110px]`} />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <select
                      value={valueOf(p, 'category') || ''}
                      onChange={(e) => setField(p.id, 'category', e.target.value)}
                      className={`${cellInput} min-w-[120px] cursor-pointer ${!valueOf(p, 'category') ? 'text-amber-600' : ''}`}
                    >
                      <option value="">בחר…</option>
                      {applianceTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <select value={valueOf(p, 'brandTier') || 'base'} onChange={(e) => setField(p.id, 'brandTier', e.target.value)} className={`${cellInput} min-w-[100px] cursor-pointer`}>
                      {BRAND_TIERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input type="number" inputMode="numeric" value={valueOf(p, 'price') ?? ''} onChange={numField(p.id, 'price')} placeholder="0" dir="ltr" className={`${cellInput} w-24 tabular-nums`} />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input type="number" inputMode="numeric" value={valueOf(p, 'zapLow') ?? ''} onChange={numField(p.id, 'zapLow')} placeholder="0" dir="ltr" className={`${cellInput} w-24 tabular-nums`} title="מחיר השוק הנמוך (זאפ) — בסיס התמחור" />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span className="inline-block px-2 py-1.5 text-sm font-bold tabular-nums text-gold-600">
                      {ourPrice > 0 ? `₪${formatNis(ourPrice)}` : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="mt-0.5 flex items-center gap-1">
                      <button type="button" onClick={() => save(p)} disabled={!dirty || busyId === p.id} aria-label="שמור שינויים" title={dirty ? 'שמור שינויים' : 'אין שינויים'} className="rounded-lg p-1.5 text-gray-300 transition-colors enabled:hover:bg-gold-50 enabled:text-gold-500 disabled:opacity-40">
                        {busyId === p.id ? <Loader2 size={16} className="animate-spin" /> : dirty ? <Save size={16} /> : <Check size={16} />}
                      </button>
                      <button type="button" onClick={() => onRemove(p.id)} aria-label={`הסר ${p.name || 'מוצר'}`} className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>

                {isOpen && (
                  <tr className="border-b border-gray-100 bg-gray-50/40">
                    <td />
                    <td colSpan={9} className="px-4 py-4">
                      <div className="grid gap-4 lg:grid-cols-2">
                        {/* Editable text detail */}
                        <div className="space-y-3">
                          <label className="block">
                            <span className="mb-1 block text-xs font-semibold text-gray-500">תיאור מלא (פסקה לכל שורה ריקה ביניהן)</span>
                            <textarea
                              rows={4}
                              dir="auto"
                              value={(valueOf(p, 'description') || []).join('\n\n')}
                              onChange={(e) => setField(p.id, 'description', e.target.value.split(/\n\s*\n+/).map((s) => s.trim()).filter(Boolean))}
                              className={panelInput}
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1 block text-xs font-semibold text-gray-500">מאפיינים (מופרדים בפסיק)</span>
                            <input
                              dir="auto"
                              value={(valueOf(p, 'tags') || []).join(', ')}
                              onChange={(e) => setField(p.id, 'tags', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                              className={panelInput}
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1 block text-xs font-semibold text-gray-500">אחריות</span>
                            <input dir="auto" value={valueOf(p, 'warranty') || ''} onChange={(e) => setField(p.id, 'warranty', e.target.value)} className={panelInput} />
                          </label>
                        </div>

                        {/* Extracted features + specs preview */}
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="mb-1 block text-xs font-semibold text-gray-500">תכונות מודגשות ({features.length})</span>
                            {features.length ? (
                              <ul className="space-y-1">
                                {features.map((f, idx) => (
                                  <li key={idx} className="text-gray-700"><span className="font-semibold">{f.title}</span>{f.text ? ` — ${f.text}` : ''}</li>
                                ))}
                              </ul>
                            ) : <p className="text-gray-400">לא נשלפו תכונות.</p>}
                          </div>
                          <div>
                            <span className="mb-1 block text-xs font-semibold text-gray-500">מפרט טכני ({specCount} שורות)</span>
                            {specCount ? (
                              <div className="space-y-2">
                                {Object.entries(specs).map(([cat, rows]) => (
                                  <div key={cat}>
                                    <div className="text-xs font-bold text-gold-600">{cat}</div>
                                    <ul className="ms-3 list-disc text-gray-700">
                                      {(Array.isArray(rows) ? rows : []).map((r, idx) => (
                                        <li key={idx}><span className="text-gray-500">{r.label}:</span> {r.value}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            ) : <p className="text-gray-400">לא נשלף מפרט.</p>}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
