import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Table2, FileText, Link2, UploadCloud, Loader2, ClipboardPaste,
  AlertCircle, Plus,
} from 'lucide-react'
import { parseDelimited, blankProduct, normalizeProduct } from '../../utils/ingestParse'

const SOURCES = [
  { id: 'csv', label: 'טבלה / CSV', Icon: Table2, hint: 'הדבק או העלה ייצוא אקסל' },
  { id: 'doc', label: 'מסמך', Icon: FileText, hint: 'PDF / Word / טקסט' },
  { id: 'url', label: 'קישור לאתר', Icon: Link2, hint: 'חילוץ מדף מוצר' },
]

const SAMPLE_CSV =
  'שם,מותג,דגם,קטגוריה,רמה,מחיר,תמונה,מאפיינים,תיאור\n' +
  'מקרר סמסונג 4 דלתות,Samsung,RF65,מקרר,פרמיום,8990,,"NoFrost;700 ליטר",מקרר רחב עם תא המרה\n' +
  'מדיח Bosch Serie 4,Bosch,SMS4,מדיח,מעוצב,2790,,"13 מערכות;A++",מדיח שקט וחסכוני'

/**
 * Multi-source ingest. CSV/paste is parsed entirely client-side; document & URL
 * sources POST to /api/ingest (Groq extraction) and degrade gracefully when the
 * backend/key isn't configured. Extracted products bubble up via onProducts.
 */
export default function IngestPanel({ onProducts }) {
  const [source, setSource] = useState('csv')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const fileRef = useRef(null)

  const reset = () => { setError(''); setNote('') }

  // --- CSV / paste (client-side) -------------------------------------------
  const handleParseCsv = () => {
    reset()
    const { products, rowCount, unmappedHeaders } = parseDelimited(text)
    if (!rowCount) {
      setError('לא נמצאו שורות. ודא ששורה ראשונה היא כותרות (שם, מותג, קטגוריה, מחיר…).')
      return
    }
    if (unmappedHeaders.length) {
      setNote(`עמודות שלא זוהו (לא ייובאו): ${unmappedHeaders.join(', ')}`)
    }
    onProducts(products, { source: 'csv', count: rowCount })
    setText('')
  }

  // --- File upload ----------------------------------------------------------
  const handleFile = async (file) => {
    if (!file) return
    reset()
    const name = file.name.toLowerCase()
    const isText = /\.(csv|tsv|txt)$/.test(name) || file.type.startsWith('text/')

    if (isText) {
      const content = await file.text()
      if (source === 'csv') {
        const { products, rowCount } = parseDelimited(content)
        if (!rowCount) { setError('הקובץ לא הכיל שורות תקינות.'); return }
        onProducts(products, { source: 'file-csv', count: rowCount })
      } else {
        await sendToServer({ text: content, filename: file.name })
      }
      return
    }

    // Binary doc (PDF/Word): hand the raw text we can read to the server; the
    // function calls Groq to structure it (and 503s clearly without a key).
    if (source === 'doc') {
      const content = await file.text().catch(() => '')
      await sendToServer({ text: content, filename: file.name })
    } else {
      setError('קובץ לא נתמך בלשונית זו. ל-CSV השתמש בלשונית "טבלה / CSV".')
    }
  }

  // --- Server extraction (document / URL) -----------------------------------
  const sendToServer = async (payload) => {
    setBusy(true)
    reset()
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.message || 'החילוץ נכשל. נסה שוב או הזן ידנית.')
        return
      }
      const products = (data.products || []).map(normalizeProduct)
      if (!products.length) {
        setNote('לא זוהו מוצרים במקור. אפשר להוסיף ידנית.')
        return
      }
      onProducts(products, { source: payload.url ? 'url' : 'doc', count: products.length })
    } catch {
      setError('שגיאת רשת. ודא שה-Functions פעילים (cloudflare) או הזן ידנית.')
    } finally {
      setBusy(false)
    }
  }

  const handleUrl = () => {
    if (!url.trim()) { setError('הזן כתובת אתר.'); return }
    sendToServer({ url: url.trim() })
  }

  const active = SOURCES.find((s) => s.id === source)

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-luxe md:p-7">
      {/* Source tabs */}
      <div role="tablist" aria-label="מקור קליטה" className="grid grid-cols-3 gap-2">
        {SOURCES.map((s) => {
          const selected = source === s.id
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={selected}
              type="button"
              onClick={() => { setSource(s.id); reset() }}
              className={`group flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                selected
                  ? 'border-gold-400 bg-gold-50 shadow-gold-glow'
                  : 'border-gray-200 bg-white hover:border-gold-300 hover:bg-gold-50/40'
              }`}
            >
              <s.Icon size={20} className={selected ? 'text-gold-600' : 'text-gray-500 group-hover:text-gold-500'} />
              <span className={`text-sm font-bold ${selected ? 'text-gold-600' : 'text-gray-800'}`}>{s.label}</span>
              <span className="text-[11px] leading-tight text-gray-400">{s.hint}</span>
            </button>
          )
        })}
      </div>

      <motion.div key={source} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mt-6">
        {/* CSV / paste */}
        {source === 'csv' && (
          <div>
            <label htmlFor="csv-text" className="mb-1.5 block text-sm font-medium text-gray-700">
              הדבק שורות (כותרות בשורה ראשונה)
            </label>
            <textarea
              id="csv-text"
              dir="auto"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder={SAMPLE_CSV}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 font-mono text-sm text-gray-800 outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" onClick={handleParseCsv} disabled={!text.trim()} className="btn-gold !py-2.5 text-sm disabled:opacity-40">
                <ClipboardPaste size={16} /> קלוט מהטקסט
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost !py-2.5 text-sm">
                <UploadCloud size={16} /> העלה קובץ CSV
              </button>
              <button type="button" onClick={() => setText(SAMPLE_CSV)} className="text-xs text-gold-600 hover:underline">
                טען דוגמה
              </button>
            </div>
          </div>
        )}

        {/* Document */}
        {source === 'doc' && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/60 px-6 py-12 text-center transition-colors hover:border-gold-300 hover:bg-gold-50/30 disabled:opacity-60"
          >
            {busy ? <Loader2 size={28} className="animate-spin text-gold-500" /> : <UploadCloud size={28} className="text-gold-500" />}
            <span className="text-sm font-bold text-gray-800">{busy ? 'מחלץ מוצרים…' : 'גרור או בחר קובץ PDF / Word / טקסט'}</span>
            <span className="max-w-xs text-xs text-gray-400">
              החילוץ מתבצע בשרת (Groq). ללא מפתח מוגדר — השתמש ב-CSV או בהזנה ידנית.
            </span>
          </button>
        )}

        {/* URL */}
        {source === 'url' && (
          <div>
            <label htmlFor="url-input" className="mb-1.5 block text-sm font-medium text-gray-700">
              כתובת דף מוצר
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="url-input"
                type="url"
                dir="ltr"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/product/..."
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30"
              />
              <button type="button" onClick={handleUrl} disabled={busy || !url.trim()} className="btn-gold !py-3 text-sm disabled:opacity-40">
                {busy ? <><Loader2 size={16} className="animate-spin" /> מחלץ…</> : <><Link2 size={16} /> חלץ מהאתר</>}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Hidden file input shared by csv + doc tabs */}
      <input
        ref={fileRef}
        type="file"
        accept={source === 'csv' ? '.csv,.tsv,.txt,text/csv' : '.pdf,.doc,.docx,.txt'}
        className="hidden"
        onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = '' }}
      />

      {/* Feedback */}
      {error && (
        <p role="alert" className="mt-4 flex items-start gap-1.5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}
      {note && !error && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{note}</p>
      )}

      {/* Manual add — always available fallback */}
      <div className="mt-5 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => onProducts([blankProduct()], { source: 'manual', count: 1 })}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gold-600"
        >
          <Plus size={16} /> הוסף מוצר ידנית
        </button>
      </div>
    </div>
  )
}
