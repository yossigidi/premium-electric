import { useState, Fragment } from 'react'
import { Save, Trash2, Loader2, Check, ChevronDown, ChevronRight, Upload, Link2 } from 'lucide-react'
import { applianceTypes, BRAND_TIERS } from '../../data/builderCatalog'
import { singlePrice, formatNis } from '../../utils/pricing'

// A URL that points at a web PAGE rather than a direct image file (no image
// extension, not a data URL) — i.e. something to "pull images from", not show.
const looksLikePageUrl = (s) =>
  /^https?:\/\//i.test(s || '') && !/\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i.test(s) && !String(s).startsWith('data:')

// Download an image THROUGH our server (bypasses page bot-blocks + hotlink
// protection) and resize it to a compact data URL. Returns null if it can't.
async function importImageFromUrl(url) {
  try {
    const res = await fetch(`/api/fetch-image?url=${encodeURIComponent(url)}`)
    if (!res.ok) return null
    if (!(res.headers.get('content-type') || '').startsWith('image/')) return null
    return await resizeImageToDataUrl(await res.blob())
  } catch {
    return null
  }
}

// Resize an uploaded image to a compact JPEG data URL so it can be stored
// inline without bloating the DB. Keeps the longest edge ≤ maxDim.
function resizeImageToDataUrl(file, maxDim = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h) // flatten transparency to white
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')) }
    img.src = url
  })
}

const cellInput =
  'w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-gray-800 text-right ' +
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
  const [imgBusy, setImgBusy] = useState(null) // id whose image is being fetched
  const [imgMsg, setImgMsg] = useState({}) // id -> status message
  const [imgDraft, setImgDraft] = useState({}) // id -> URL input buffer

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

  const [candidates, setCandidates] = useState({}) // id -> [url] fetched, awaiting pick

  // The product's gallery. Falls back to the single image — but only if it's an
  // actual image (a leftover product-PAGE URL is surfaced in the input instead).
  const galleryOf = (p) => {
    const imgs = valueOf(p, 'images')
    if (Array.isArray(imgs) && imgs.length) return imgs
    const single = valueOf(p, 'image')
    return single && !looksLikePageUrl(single) ? [single] : []
  }
  // A stored value that's a webpage link (not a real image) → offer to pull from it.
  const pageUrlOf = (p) => {
    const single = valueOf(p, 'image')
    return (!valueOf(p, 'images')?.length && looksLikePageUrl(single)) ? single : ''
  }
  // Set the gallery; keep `image` (cards) synced to the first entry.
  const setGallery = (id, arr) => {
    const clean = [...new Set(arr.filter((s) => typeof s === 'string' && s.trim()))]
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], images: clean, image: clean[0] || '' } }))
  }

  const uploadImages = async (id, files, current) => {
    const added = []
    for (const f of files) { try { added.push(await resizeImageToDataUrl(f)) } catch { /* skip */ } }
    if (added.length) { setGallery(id, [...current, ...added]); setImgMsg((m) => ({ ...m, [id]: `הועלו ${added.length} תמונות ✓` })) }
  }

  // Add an image from a URL: download it via the server and embed it (reliable);
  // if that fails, fall back to storing the raw URL.
  const addImageFromUrl = async (id, url, current) => {
    if (!url) return
    setImgBusy(id); setImgMsg((m) => ({ ...m, [id]: 'מוריד תמונה…' }))
    const dataUrl = await importImageFromUrl(url)
    if (dataUrl) {
      setGallery(id, [...current, dataUrl]); setImgMsg((m) => ({ ...m, [id]: 'תמונה נוספה ✓' }))
    } else {
      setGallery(id, [...current, url]); setImgMsg((m) => ({ ...m, [id]: 'נוסף קישור. אם התמונה לא מוצגת — האתר חוסם; העלה קובץ במקום.' }))
    }
    setImgBusy(null)
  }

  const addManyFromUrls = async (id, urls, current) => {
    setImgBusy(id); setImgMsg((m) => ({ ...m, [id]: `מוריד ${urls.length} תמונות…` }))
    const acc = [...current]
    for (const u of urls) { const d = await importImageFromUrl(u); acc.push(d || u) }
    setGallery(id, acc); setCandidates((c) => ({ ...c, [id]: [] }))
    setImgMsg((m) => ({ ...m, [id]: `נוספו ${urls.length} תמונות ✓` }))
    setImgBusy(null)
  }

  // Pull image candidates from a product-PAGE URL (og:image + page gallery).
  const fetchImagesFromPage = async (id, pageUrl) => {
    if (!pageUrl || !/^https?:\/\//i.test(pageUrl)) {
      setImgMsg((m) => ({ ...m, [id]: 'הדבק תחילה קישור לדף המוצר.' })); return
    }
    setImgBusy(id); setImgMsg((m) => ({ ...m, [id]: '' }))
    try {
      const res = await fetch(`/api/product-image?url=${encodeURIComponent(pageUrl)}`)
      const data = await res.json().catch(() => ({}))
      if (res.ok && Array.isArray(data.images) && data.images.length) {
        setCandidates((c) => ({ ...c, [id]: data.images }))
        setImgMsg((m) => ({ ...m, [id]: `נמצאו ${data.images.length} תמונות — בחר אילו להוסיף` }))
      } else {
        setImgMsg((m) => ({ ...m, [id]: data.message || 'לא נמצאו תמונות בדף.' }))
      }
    } catch {
      setImgMsg((m) => ({ ...m, [id]: 'שגיאת רשת במשיכת התמונה.' }))
    } finally {
      setImgBusy(null)
    }
  }

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
                          {(() => {
                            const imgs = galleryOf(p)
                            const cands = (candidates[p.id] || []).filter((c) => !imgs.includes(c))
                            const draft = (imgDraft[p.id] !== undefined ? imgDraft[p.id] : pageUrlOf(p)).trim()
                            return (
                              <div>
                                <span className="mb-1 block text-xs font-semibold text-gray-500">גלריית תמונות — העלה קבצים מהמחשב, הדבק קישור ישיר לתמונה, או משוך מדף מוצר</span>

                                {/* Current gallery: first = primary */}
                                {imgs.length > 0 && (
                                  <div className="mb-2 flex flex-wrap gap-2">
                                    {imgs.map((src, idx) => (
                                      <div key={src} className="relative">
                                        <img src={src} alt="" className="h-16 w-16 rounded-lg border border-gray-200 object-contain" />
                                        {idx === 0 && <span className="absolute -top-1 right-0 rounded bg-gold-500 px-1 text-[9px] font-bold text-white">ראשי</span>}
                                        <button type="button" onClick={() => setGallery(p.id, imgs.filter((_, i) => i !== idx))} aria-label="הסר תמונה" className="absolute -left-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white hover:bg-red-600">×</button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Controls */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <input
                                    dir="ltr"
                                    placeholder="קישור ישיר לתמונה, או קישור לדף המוצר…"
                                    value={imgDraft[p.id] !== undefined ? imgDraft[p.id] : pageUrlOf(p)}
                                    onChange={(e) => setImgDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                                    className={`${panelInput} flex-1`}
                                  />
                                  <button type="button" onClick={async () => { if (draft) { await addImageFromUrl(p.id, draft, imgs); setImgDraft((d) => ({ ...d, [p.id]: '' })) } }} disabled={!draft || imgBusy === p.id} title="הורד את התמונה מהקישור והוסף לגלריה" className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:border-gold-300 hover:text-gold-600 disabled:opacity-50">
                                    {imgBusy === p.id ? <Loader2 size={14} className="animate-spin" /> : null} הוסף קישור
                                  </button>
                                  <button type="button" onClick={async () => { if (/\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(draft)) { await addImageFromUrl(p.id, draft, imgs); setImgDraft((d) => ({ ...d, [p.id]: '' })) } else { fetchImagesFromPage(p.id, draft) } }} disabled={imgBusy === p.id} title="משוך את התמונות מדף המוצר (או הורד תמונה ישירה)" className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:border-gold-300 hover:text-gold-600 disabled:opacity-50">
                                    {imgBusy === p.id ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />} משוך מדף
                                  </button>
                                  <label className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:border-gold-300 hover:text-gold-600">
                                    <Upload size={14} /> העלה
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { uploadImages(p.id, Array.from(e.target.files || []), imgs); e.target.value = '' }} />
                                  </label>
                                </div>
                                {imgMsg[p.id] && <span className="mt-1 block text-[11px] text-gray-500">{imgMsg[p.id]}</span>}

                                {/* Fetched candidates to pick from */}
                                {cands.length > 0 && (
                                  <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 p-2">
                                    <div className="mb-1 flex items-center justify-between text-[11px] text-gray-500">
                                      <span>תמונות שנמצאו בדף — לחץ להוספה:</span>
                                      <button type="button" onClick={() => addManyFromUrls(p.id, cands, imgs)} className="font-semibold text-gold-600 hover:underline">הוסף הכל</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {cands.map((src) => (
                                        <button key={src} type="button" onClick={() => { addImageFromUrl(p.id, src, imgs); setCandidates((c) => ({ ...c, [p.id]: (c[p.id] || []).filter((x) => x !== src) })) }} title="הוסף לגלריה" className="rounded-lg border border-gray-200 bg-white p-0.5 hover:border-gold-400">
                                          <img src={src} alt="" className="h-14 w-14 object-contain" />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })()}
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
