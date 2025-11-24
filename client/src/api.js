export async function fetchJSON(url, opts = {}) {
  const base = typeof window !== 'undefined' ? '' : ''
  const res = await fetch(base + url, { ...opts, credentials: 'include', headers: { 'Accept': 'application/json', ...(opts.headers || {}) } })
  const data = await res.json().catch(() => null)
  return data || { ok: false, error: 'No JSON' }
}
