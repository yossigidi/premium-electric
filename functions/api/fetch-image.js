// ============================================================================
// GET /api/fetch-image?url=<direct image URL>
//
// Downloads a single IMAGE server-side and streams the bytes back, so the
// browser embeds it from our own origin. This sidesteps two retailer blocks:
//   • page bot-protection (we fetch the image, not the page), and
//   • image hotlink protection (the image is re-served from our domain).
// The client then resizes the returned bytes to a compact data URL for storage.
// ============================================================================

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

export async function onRequestGet({ request }) {
  const url = new URL(request.url).searchParams.get('url')
  if (!url || !/^https?:\/\//i.test(url)) return json({ error: 'bad_url' }, 400)
  try {
    let origin = ''
    try { origin = new URL(url).origin } catch { /* ignore */ }
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/png,image/*,*/*;q=0.8',
        'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
        ...(origin ? { Referer: origin + '/' } : {}),
      },
    })
    if (!r.ok) return json({ error: 'fetch_failed', status: r.status }, 422)
    const ct = r.headers.get('content-type') || ''
    if (!ct.startsWith('image/')) return json({ error: 'not_image' }, 422)
    const buf = await r.arrayBuffer()
    if (buf.byteLength > 8_000_000) return json({ error: 'too_large' }, 413)
    return new Response(buf, {
      headers: { 'content-type': ct, 'cache-control': 'no-store', 'access-control-allow-origin': '*' },
    })
  } catch {
    return json({ error: 'fetch_failed' }, 422)
  }
}
