// core/fetch-safe.mjs — Safe fetch with timeout, never crashes
import { CONFIG } from './config.mjs'

export async function fetchSafe(url, options = {}, timeoutMs = CONFIG.FETCH_TIMEOUT_MS) {
  try {
    const res = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(timeoutMs),
    })
    return res
  } catch (e) {
    if (e.name === 'TimeoutError') {
      console.warn(`[TIMEOUT] ${url} (${timeoutMs}ms)`)
    } else {
      console.warn(`[FETCH] ${url}: ${e.message}`)
    }
    return { ok: false, status: 0, text: () => Promise.resolve(''), json: () => Promise.resolve(null) }
  }
}
