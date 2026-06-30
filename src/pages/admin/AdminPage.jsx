import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Database, LogOut, PackageCheck, Sparkles, Trash2, CheckCircle2,
} from 'lucide-react'
import AdminLogin from '../../components/admin/AdminLogin'
import IngestPanel from '../../components/admin/IngestPanel'
import ReviewTable from '../../components/admin/ReviewTable'
import StoredProductsTable from '../../components/admin/StoredProductsTable'
import { isAuthed, signOut } from '../../utils/adminAuth'
import {
  getIngestedProducts, addIngestedProducts, updateIngestedProduct,
  removeIngestedProduct, clearIngestedProducts, subscribeProducts,
} from '../../utils/productStore'
import { applianceLabel } from '../../data/builderCatalog'
import { Link } from '../../router'

let keySeq = 0
const withKeys = (products) =>
  products.map((p) => ({ ...p, _key: `r${++keySeq}`, _selected: true }))

export default function AdminPage() {
  const [authed, setAuthed] = useState(isAuthed)
  const [draft, setDraft] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(0)
  const [stored, setStored] = useState(getIngestedProducts)

  // Keep the "current DB" view in sync with the store.
  useEffect(() => subscribeProducts(setStored), [])

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />

  // --- Draft editing --------------------------------------------------------
  const addToDraft = (products) => {
    setSaved(0)
    setDraft((prev) => [...withKeys(products), ...prev])
  }
  const updateRow = (i, field, value) =>
    setDraft((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)))
  const toggleRow = (i) =>
    setDraft((prev) => prev.map((r, idx) => (idx === i ? { ...r, _selected: !r._selected } : r)))
  const toggleAll = (checked) =>
    setDraft((prev) => prev.map((r) => ({ ...r, _selected: checked })))
  const removeRow = (i) => setDraft((prev) => prev.filter((_, idx) => idx !== i))

  // --- Save selected rows to the store (commits to D1) ----------------------
  // Only a name is required; category/price can be completed later in the
  // "products in DB" editor below.
  const isSavable = (r) => r._selected && r.name?.trim()

  const handleSave = async () => {
    const toSave = draft
      .filter(isSavable)
      // strip editor-only fields before persisting
      .map(({ _key, _selected, ...p }) => p)
    if (!toSave.length) return
    setSaving(true)
    try {
      await addIngestedProducts(toSave)
      // drop the saved rows from the draft, keep any unsaved/invalid ones
      setDraft((prev) => prev.filter((r) => !isSavable(r)))
      setSaved(toSave.length)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStored = (product) => updateIngestedProduct(product)
  const handleRemoveStored = (id) => removeIngestedProduct(id)

  const handleClearDb = async () => {
    if (window.confirm('למחוק את כל המוצרים שנקלטו? פעולה זו אינה הפיכה.')) {
      await clearIngestedProducts()
    }
  }

  // --- Current DB summary ---------------------------------------------------
  const byCategory = useMemo(() => {
    const m = new Map()
    for (const p of stored) m.set(p.category, (m.get(p.category) || 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [stored])

  return (
    <div className="min-h-screen bg-surface-100">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink-900 text-white">
        <div className="container-luxe flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-gradient text-white">
              <Database size={18} />
            </span>
            <div>
              <div className="text-sm font-bold leading-tight">פאנל ניהול מוצרים</div>
              <div className="text-xs text-white/50">קליטה · סקירה · שמירה ל-DB</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/builder" className="hidden text-sm text-white/60 transition-colors hover:text-gold-300 sm:inline">
              ← לבונה החבילות
            </Link>
            <button
              type="button"
              onClick={() => { signOut(); setAuthed(false) }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:border-gold-300/40 hover:text-gold-300"
            >
              <LogOut size={15} /> יציאה
            </button>
          </div>
        </div>
      </header>

      <main className="container-luxe space-y-8 py-8">
        {/* Stats strip */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={PackageCheck} label="מוצרים ב-DB" value={stored.length} />
          <StatCard icon={Sparkles} label="ממתינים לסקירה" value={draft.length} />
          <StatCard icon={CheckCircle2} label="קטגוריות פעילות" value={byCategory.length} />
        </div>

        {/* Saved confirmation */}
        {saved > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            role="status"
            className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800"
          >
            <CheckCircle2 size={18} className="text-green-600" />
            {saved} מוצרים נשמרו ל-DB ומופיעים כעת בבונה החבילות.
            <Link to="/builder" className="ml-1 font-bold text-green-700 underline">בדוק בבונה →</Link>
          </motion.div>
        )}

        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">1 · קליטת מוצרים</h2>
          <IngestPanel onProducts={addToDraft} />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">2 · סקירה ואישור</h2>
          <ReviewTable
            rows={draft}
            onChange={updateRow}
            onToggle={toggleRow}
            onToggleAll={toggleAll}
            onRemove={removeRow}
            onSave={handleSave}
            saving={saving}
          />
        </section>

        {/* Current DB */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">3 · מוצרים ב-DB ({stored.length})</h2>
            {stored.length > 0 && (
              <button type="button" onClick={handleClearDb} className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-red-500">
                <Trash2 size={14} /> נקה הכל
              </button>
            )}
          </div>
          {stored.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-6 text-sm text-gray-500">
              אין עדיין מוצרים שנקלטו. מוצרים שתשמור יתווספו לקטלוג הבונה.
            </p>
          ) : (
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-luxe">
              <div className="mb-4 flex flex-wrap gap-2">
                {byCategory.map(([cat, n]) => (
                  <span key={cat} className="chip">{applianceLabel(cat) || 'ללא קטגוריה'} · {n}</span>
                ))}
              </div>
              <p className="mb-3 text-xs text-gray-400">
                ערוך כל שדה ישירות בטבלה והשלם פרטים חסרים. כפתור השמירה נדלק כשמשנים שורה.
              </p>
              <StoredProductsTable
                products={stored}
                onUpdate={handleUpdateStored}
                onRemove={handleRemoveStored}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-luxe">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-500">
        <Icon size={20} />
      </span>
      <div>
        <div className="text-2xl font-bold tabular-nums text-gray-900">{value}</div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    </div>
  )
}
