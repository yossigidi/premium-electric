import { useState } from 'react'
import { Save, Trash2, Loader2, Check } from 'lucide-react'
import { applianceTypes, BRAND_TIERS } from '../../data/builderCatalog'
import { singlePrice, formatNis } from '../../utils/pricing'

const cellInput =
  'w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-gray-800 ' +
  'outline-none transition-colors hover:border-gray-200 focus:border-gold-400 focus:bg-white focus:ring-1 focus:ring-gold-400/40'

/**
 * Editable view of the products already saved in the DB. Edit any field inline;
 * a row's save button lights up once it changes and commits via onUpdate (PUT
 * to D1). This is where partially-ingested products get completed by hand.
 */
export default function StoredProductsTable({ products, onUpdate, onRemove }) {
  const [edits, setEdits] = useState({}) // id -> { field: value }
  const [busyId, setBusyId] = useState(null)

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

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100">
      <table className="w-full min-w-[880px] text-right">
        <thead>
          <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-400">
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
            return (
              <tr key={p.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
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
                    <button
                      type="button"
                      onClick={() => save(p)}
                      disabled={!dirty || busyId === p.id}
                      aria-label="שמור שינויים"
                      title={dirty ? 'שמור שינויים' : 'אין שינויים'}
                      className="rounded-lg p-1.5 text-gray-300 transition-colors enabled:hover:bg-gold-50 enabled:text-gold-500 disabled:opacity-40"
                    >
                      {busyId === p.id ? <Loader2 size={16} className="animate-spin" /> : dirty ? <Save size={16} /> : <Check size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(p.id)}
                      aria-label={`הסר ${p.name || 'מוצר'}`}
                      className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
