// ============================================================================
// POST /api/ingest — server-side product extraction (Cloudflare Pages Function).
//
// Uses Claude (Anthropic Messages API) to structure raw product sources:
//   • PDF  — the client sends the file as base64; Claude reads it natively
//            (including scanned/image PDFs via vision). No browser-side text
//            extraction, which never worked reliably for binary formats.
//   • text — extracted Word (.docx) text, plain text, or pasted text.
//   • URL  — the page is fetched, stripped to text, then structured.
//
// Returns rows in the SAME loose shape the client normalizer expects
// (src/utils/ingestParse.js → normalizeProduct), so every path converges on
// one product shape before the review table.
//
// Config (Cloudflare Pages env vars / secrets):
//   ANTHROPIC_API_KEY — required; without it the function 503s so the UI can
//                       fall back to CSV / Excel / manual entry.
//   ANTHROPIC_MODEL   — optional; defaults to claude-haiku-4-5.
// ============================================================================

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' }
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_HEADERS })

const EXTRACTION_SYSTEM = `You extract electrical-appliance products from the input into rich, structured JSON.
Return ONLY a JSON object of the form {"products": [...]} with no surrounding text or markdown.
LANGUAGE: Write ALL human-readable text — name, shortDescription, description, feature titles/texts, spec section names, spec labels and values, tags, warranty — in fluent, natural Hebrew. If the source is in English (or any other language), TRANSLATE it accurately and naturally into Hebrew. Never output English prose. Keep as-is only: brand names, model numbers/SKUs, and standard technical tokens/units (e.g. "4K", "A++", "NoFrost", "Wi-Fi", 'ס"מ', "kg").
Each product has these fields (omit a field only if truly absent from the source):

- name (string)
- brand (string)
- model (string)
- category — one of: refrigerators, ovens, cooktops, washers, dryers, dishwashers, robot-vacuums, tv, audio, computers
- brandTier — one of: base, designed, luxury, premium. Infer from the brand: value brands (Electra, Beko, TCL, Hisense, Lenovo) = base; Smeg = designed; exclusive brands (Miele, Gaggenau, Liebherr, Sub-Zero) = luxury; leading brands (Samsung, LG, Bosch, Sony, Apple, Sonos) = premium.
- price (number, NIS), oldPrice (number, NIS)
- image — a direct URL (http/https) to the main product image, if one appears in the source (e.g. an <img> src or an image-column value). Omit it if the source has no usable image URL; never invent one.
- shortDescription (string) — one or two sentences for cards
- description — array of 1-3 paragraph strings: the full marketing/product description
- tags — array of short feature strings (e.g. "NoFrost", "700 ליטר", "A++", "4K")
- features — array of { "title": string, "text": string } objects: the key highlighted features, each a short title + one-sentence explanation
- specs — an object mapping a Hebrew category name (e.g. "תצוגה", "ביצועים", "מידות", "חיבורים", "צריכת אנרגיה") to an array of { "label": string, "value": string } rows. Capture EVERY technical detail you find in the source as a label/value row under the right category.
- warranty (string) — warranty terms if stated

Extract as much real detail as the source contains — the goal is a complete product page. Do NOT invent specs that are not in the source. Do not add commentary.`

async function extractWithClaude(env, userContent) {
  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) return { error: 'missing_key', status: 503 }
  const model = env.ANTHROPIC_MODEL || 'claude-haiku-4-5'

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: EXTRACTION_SYSTEM,
      messages: [{ role: 'user', content: userContent }],
    }),
  })

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '')
    return { error: 'claude_failed', status: 502, detail: detail.slice(0, 500) }
  }

  const data = await resp.json()
  const text = (data?.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()

  // Claude is instructed to return pure JSON; fall back to the first {...} block.
  const parse = (s) => { try { return JSON.parse(s) } catch { return null } }
  let parsed = parse(text)
  if (!parsed) {
    const m = text.match(/\{[\s\S]*\}/)
    if (m) parsed = parse(m[0])
  }
  if (!parsed) return { error: 'bad_model_output', status: 502 }
  const products = Array.isArray(parsed) ? parsed : parsed.products || []
  return { products: Array.isArray(products) ? products : [] }
}

// Very small HTML → text reduction (no DOM in Workers runtime). Image src URLs
// are pulled out first and appended so the model can pick the product image.
function htmlToText(html) {
  const imgs = []
  const re = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi
  let m
  while ((m = re.exec(html)) && imgs.length < 30) {
    const src = m[1]
    if (/^https?:\/\//i.test(src) && !/sprite|icon|logo|pixel|blank|spacer/i.test(src)) imgs.push(src)
  }
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return imgs.length ? `${text}\n\nIMAGE CANDIDATES (pick the main product image for "image"):\n${imgs.join('\n')}` : text
}

// Build the Claude user-message content from whatever source the client sent.
async function buildContent(body) {
  // PDF: hand the base64 straight to Claude as a document block.
  if (body.pdf) {
    const data = String(body.pdf).replace(/^data:.*;base64,/, '')
    return {
      content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } },
        { type: 'text', text: 'Extract every product from this document into the required JSON.' },
      ],
    }
  }
  // URL: fetch + strip to text.
  if (body.url) {
    try {
      const r = await fetch(body.url, { headers: { 'User-Agent': 'PremiumElectricBot/1.0' } })
      if (!r.ok) return { error: 'fetch_failed', status: 422 }
      const text = htmlToText(await r.text())
      if (text.length < 20) return { error: 'empty_source', status: 422 }
      return { content: [{ type: 'text', text: `Extract products from this page text:\n\n${text.slice(0, 24000)}` }] }
    } catch {
      return { error: 'fetch_failed', status: 422 }
    }
  }
  // Plain / extracted text (Word .docx text, .txt, paste).
  if (body.text) {
    const text = String(body.text)
    if (text.trim().length < 20) return { error: 'empty_source', status: 422 }
    return { content: [{ type: 'text', text: `Extract products from this text:\n\n${text.slice(0, 24000)}` }] }
  }
  return { error: 'no_source', status: 400 }
}

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const built = await buildContent(body)
  if (built.error) return json({ error: built.error }, built.status)

  const result = await extractWithClaude(env, built.content)
  if (result.error) {
    const message =
      result.error === 'missing_key'
        ? 'הזנת מסמכים/אתר דורשת הגדרת ANTHROPIC_API_KEY בשרת. בינתיים ניתן לקלוט Excel/CSV או להזין ידנית.'
        : 'החילוץ האוטומטי נכשל. נסה שוב או הזן ידנית.'
    return json({ error: result.error, message, detail: result.detail }, result.status)
  }

  return json({ products: result.products, count: result.products.length })
}
// Other verbs get an automatic 405 since only onRequestPost is defined.
