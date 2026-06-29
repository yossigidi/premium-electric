// ============================================================================
// POST /api/ingest — server-side product extraction (Cloudflare Pages Function)
//
// Handles the ingest sources that can't be parsed in the browser:
//   • PDF / Word — text is extracted and handed to an LLM for structuring.
//   • URL        — the page is fetched, stripped to text, then structured.
// (Excel/CSV is parsed entirely client-side; see src/utils/ingestParse.js.)
//
// The LLM step uses Groq (OpenAI-compatible Chat Completions) per the plan —
// cheap and proven; Claude can be swapped in later for messy documents. The
// function returns rows in the SAME loose shape the client normalizer expects
// (src/utils/ingestParse.js → normalizeProduct), so every path converges on
// one product shape before the review table.
//
// Config (Cloudflare Pages env vars / secrets):
//   GROQ_API_KEY   — required for extraction; without it the function returns a
//                    clear 503 so the UI can fall back to manual / CSV entry.
//   GROQ_MODEL     — optional; defaults to a current Groq instruct model.
// ============================================================================

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' }
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_HEADERS })

const EXTRACTION_SYSTEM = `You extract electrical-appliance products from raw text into structured JSON.
Return ONLY a JSON object: {"products": [...]}. Each product has these fields (omit unknowns):
name (string, Hebrew if the source is Hebrew), brand, model, category, brandTier, price (number, NIS),
oldPrice (number), image (url), tags (array of short strings), shortDescription (string).
category must be one of: refrigerators, ovens, cooktops, washers, dryers, dishwashers, robot-vacuums, tv, audio, computers.
brandTier must be one of: budget, designed, premium. Infer it from brand prestige and price when not stated.
Do not invent products that are not in the text. Do not add commentary.`

async function extractWithGroq(env, text) {
  const apiKey = env.GROQ_API_KEY
  if (!apiKey) {
    return { error: 'missing_key', status: 503 }
  }
  const model = env.GROQ_MODEL || 'llama-3.3-70b-versatile'

  const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM },
        { role: 'user', content: text.slice(0, 24000) }, // keep within context budget
      ],
    }),
  })

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '')
    return { error: 'groq_failed', status: 502, detail: detail.slice(0, 500) }
  }

  const data = await resp.json()
  const content = data?.choices?.[0]?.message?.content || '{}'
  try {
    const parsed = JSON.parse(content)
    const products = Array.isArray(parsed) ? parsed : parsed.products || []
    return { products: Array.isArray(products) ? products : [] }
  } catch {
    return { error: 'bad_model_output', status: 502 }
  }
}

// Very small HTML → text reduction (no DOM in Workers runtime).
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function readSourceText(body) {
  // URL source: fetch + strip to text.
  if (body.url) {
    try {
      const r = await fetch(body.url, { headers: { 'User-Agent': 'PremiumElectricBot/1.0' } })
      if (!r.ok) return { error: 'fetch_failed', status: 422 }
      const html = await r.text()
      return { text: htmlToText(html) }
    } catch {
      return { error: 'fetch_failed', status: 422 }
    }
  }
  // PDF/Word source: the client sends already-extracted text (browser-side
  // extraction keeps the binary off the wire); if a future client posts raw
  // text we accept it directly here.
  if (body.text) return { text: String(body.text) }
  return { error: 'no_source', status: 400 }
}

export async function onRequestPost({ request, env }) {
  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const src = await readSourceText(body)
  if (src.error) return json({ error: src.error }, src.status)
  if (!src.text || src.text.length < 20) {
    return json({ error: 'empty_source' }, 422)
  }

  const result = await extractWithGroq(env, src.text)
  if (result.error) {
    const message =
      result.error === 'missing_key'
        ? 'הזנת מסמכים/אתר דורשת הגדרת GROQ_API_KEY בשרת. בינתיים ניתן לקלוט CSV או להזין ידנית.'
        : 'החילוץ האוטומטי נכשל. נסה שוב או הזן ידנית.'
    return json({ error: result.error, message, detail: result.detail }, result.status)
  }

  return json({ products: result.products, count: result.products.length })
}
// Other verbs get an automatic 405 since only onRequestPost is defined.
