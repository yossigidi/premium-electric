// ============================================================================
// GET /api/product-image?url=<product page URL>
//
// Fetches a product PAGE and returns the main product image URL — so the admin
// can paste the page link they have and let the system pull the image, instead
// of needing a direct image URL. Prefers the og:image / twitter:image meta tag
// (what retailers point at the product photo), then the first real <img>.
// ============================================================================

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' }
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_HEADERS })

const JUNK = /sprite|icon|logo|pixel|blank|spacer|placeholder|1x1|favicon|loading|thumb_|\.svg(\?|$)/i

// Collect the product images from a page: og:image first (the canonical product
// photo), then the on-page <img> gallery. Deduped, absolute, junk filtered.
function extractImages(html, baseUrl) {
  const out = []
  const push = (src) => {
    if (!src) return
    let abs
    try { abs = new URL(src, baseUrl).href } catch { return }
    if (JUNK.test(abs)) return
    if (!out.includes(abs)) out.push(abs)
  }
  const meta = (re) => { const m = html.match(re); return m && m[1] ? m[1] : null }
  // Preferred canonical images first.
  push(meta(/<meta[^>]+property=["']og:image(?::secure_url|:url)?["'][^>]+content=["']([^"']+)["']/i))
  push(meta(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i))
  push(meta(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i))
  push(meta(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i))
  // Then the page gallery.
  const re = /<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi
  let m
  while ((m = re.exec(html)) && out.length < 12) push(m[1])
  return out
}

export async function onRequestGet({ request }) {
  const url = new URL(request.url).searchParams.get('url')
  if (!url || !/^https?:\/\//i.test(url)) return json({ error: 'bad_url', message: 'הדבק קישור תקין (http/https) לדף המוצר.' }, 400)
  try {
    let origin = ''
    try { origin = new URL(url).origin } catch { /* ignore */ }
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1',
        ...(origin ? { Referer: origin + '/' } : {}),
      },
    })
    if (r.status === 403 || r.status === 401) {
      return json({ error: 'blocked', message: 'האתר חוסם גישה אוטומטית. העלה תמונה מהמחשב, או הדבק קישור ישיר לתמונה (קליק ימני על התמונה → "העתק כתובת תמונה").' }, 422)
    }
    if (!r.ok) return json({ error: 'fetch_failed', message: 'לא ניתן לגשת לדף.' }, 422)
    const images = extractImages(await r.text(), url)
    if (!images.length) return json({ error: 'no_image', message: 'לא נמצאו תמונות בדף. הדבק קישור ישיר לתמונה או העלה קובץ.' }, 404)
    return json({ images, image: images[0] })
  } catch {
    return json({ error: 'fetch_failed', message: 'שגיאה בגישה לדף.' }, 422)
  }
}
