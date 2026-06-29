import { useMemo } from 'react'
import { Trash2, CheckCircle2, AlertTriangle, Save, Loader2, Inbox } from 'lucide-react'
import { applianceTypes, BRAND_TIERS } from '../../data/builderCatalog'
import { validateProduct } from '../../utils/ingestParse'
import { singlePrice, formatNis } from '../../utils/pricing'

const cellInput =
  'w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-gray-800 ' +
  'outline-none transition-colors hover:border-gray-200 focus:border-gold-400 focus:bg-white focus:ring-1 focus:ring-gold-400/40'

/**
 * Editable review table — the heart of the admin panel.
 * Every extracted/added product is a row: tick to include, edit any field,
 * see the resulting single price live, drop rows you don't want. Only valid,
 * ticked rows are saved to the product store.
 */
export default function ReviewTable({ rows, onChange, onToggle, onToggleAll, onRemove, onSave, saving }) {
  const validity = useMemo(() => rows.map((r) => validateProduct(r)), [rows])
  const selectedCount = rows.filter((r) => r._selected).length
  const savableCount = rows.filter((r, i) => r._selected && validity[i].length === 0).length
  const allSelected = rows.length > 0 && selectedCount === rows.length

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-gray-200 bg-white/60 px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-500">
          <Inbox size={26} />
        </span>
        <h3 className="mt-4 text-lg font-bold text-gray-900">אין מוצרים לסקירה עדיין</h3>
        <p className="mt-1 max-w-md text-sm text-gray-500">
          קלוט קובץ CSV, מסמך או קישור — או הוסף מוצר ידנית — והמוצרים יופיעו כאן לעריכה ואישור.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white shadow-luxe">
      {/* Header / save bar */}
      <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">סקירת מוצרים</h3>
          <p className="text-sm text-gray-500">
            נבחרו <span className="font-bold text-gold-600">{selectedCount}</span> מתוך {rows.length}
            {savableCount < selectedCount && (
              <span className="text-amber-600"> · {selectedCount - savableCount} עם שדות חסרים</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || savableCount === 0}
          className="btn-gold !py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? <><Loader2 size={16} className="animate-spin" /> שומר…</> : <><Save size={16} /> שמור {savableCount} מוצרים ל-DB</>}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-right">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="בחר הכל"
                  checked={allSelected}
                  onChange={(e) => onToggleAll(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-gold-500"
                />
              </th>
              <th className="px-3 py-3">מוצר</th>
              <th className="px-3 py-3">מותג</th>
              <th className="px-3 py-3">דגם</th>
              <th className="px-3 py-3">קטגוריה</th>
              <th className="px-3 py-3">רמה</th>
              <th className="px-3 py-3">מחיר מחירון</th>
              <th className="px-3 py-3">מחיר זאף</th>
              <th className="px-3 py-3">מחיר שלנו</th>
              <th className="w-10 px-3 py-3"><span className="sr-only">פעולות</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const problems = validity[i]
              const ok = problems.length === 0
              const ourPrice = singlePrice(row.zapLow ?? row.price)
              return (
                <tr
                  key={row._key ?? i}
                  className={`border-b border-gray-50 transition-colors ${row._selected ? 'bg-gold-50/30' : 'hover:bg-gray-50/50'}`}
                >
                  <td className="px-4 py-2 align-top">
                    <input
                      type="checkbox"
                      aria-label={`כלול ${row.name || 'מוצר'}`}
                      checked={!!row._selected}
                      onChange={() => onToggle(i)}
                      className="mt-2 h-4 w-4 cursor-pointer accent-gold-500"
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      value={row.name || ''}
                      onChange={(e) => onChange(i, 'name', e.target.value)}
                      placeholder="שם מוצר"
                      dir="auto"
                      className={`${cellInput} min-w-[180px] font-medium`}
                    />
                    {!ok && (
                      <span className="mt-1 flex items-center gap-1 px-2 text-[11px] text-amber-600">
                        <AlertTriangle size={11} /> {problems.join(' · ')}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input value={row.brand || ''} onChange={(e) => onChange(i, 'brand', e.target.value)} placeholder="—" dir="auto" className={`${cellInput} min-w-[100px]`} />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input value={row.model || ''} onChange={(e) => onChange(i, 'model', e.target.value)} placeholder="—" dir="ltr" className={`${cellInput} min-w-[110px]`} />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <select
                      value={row.category || ''}
                      onChange={(e) => onChange(i, 'category', e.target.value)}
                      className={`${cellInput} min-w-[120px] cursor-pointer ${!row.category ? 'text-amber-600' : ''}`}
                    >
                      <option value="">בחר…</option>
                      {applianceTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <select
                      value={row.brandTier || 'designed'}
                      onChange={(e) => onChange(i, 'brandTier', e.target.value)}
                      className={`${cellInput} min-w-[100px] cursor-pointer`}
                    >
                      {BRAND_TIERS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="number" inputMode="numeric" value={row.price ?? ''}
                      onChange={(e) => onChange(i, 'price', e.target.value === '' ? undefined : Number(e.target.value))}
                      placeholder="0" dir="ltr"
                      className={`${cellInput} w-24 tabular-nums`}
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <input
                      type="number" inputMode="numeric" value={row.zapLow ?? ''}
                      onChange={(e) => onChange(i, 'zapLow', e.target.value === '' ? undefined : Number(e.target.value))}
                      placeholder="0" dir="ltr"
                      className={`${cellInput} w-24 tabular-nums`}
                      title="מחיר השוק הנמוך (זאף) — בסיס התמחור. שלב 3 ימלא אוטומטית."
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span className="inline-block px-2 py-1.5 text-sm font-bold tabular-nums text-gold-600">
                      {ourPrice > 0 ? `₪${formatNis(ourPrice)}` : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <button
                      type="button"
                      onClick={() => onRemove(i)}
                      aria-label={`הסר ${row.name || 'מוצר'}`}
                      className="mt-1 rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-1.5 border-t border-gray-100 p-4 text-xs text-gray-400">
        <CheckCircle2 size={13} className="text-gold-500" />
        מחיר שלנו = מחיר זאף −5%. בחבילה הלקוח מקבל −10% מסכום הזאף. שלב 3 ימלא את מחיר הזאף אוטומטית.
      </div>
    </div>
  )
}
