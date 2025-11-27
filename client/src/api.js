// API 基礎 URL - production 時使用相對路徑，開發時使用 localhost
export const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5000';

export async function fetchJSON(url, opts = {}) {
  const res = await fetch(API_BASE + url, { ...opts, credentials: 'include', headers: { 'Accept': 'application/json', ...(opts.headers || {}) } })
  const data = await res.json().catch(() => null)
  return data || { ok: false, error: 'No JSON' }
}
