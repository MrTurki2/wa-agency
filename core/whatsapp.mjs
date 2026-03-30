// core/whatsapp.mjs — WhatsApp abstraction (Simulator mode for dev)
// In production: swap to Cloud API. Interface stays the same.

const listeners = new Set()
const messageQueue = [] // For simulator: stores outgoing messages

// ─── Send message ────────────────────────

export async function sendMessage(phone, text) {
  const msg = {
    id: 'out_' + Date.now().toString(36),
    phone,
    text,
    timestamp: new Date().toISOString(),
    direction: 'out',
  }
  messageQueue.push(msg)
  // Notify listeners (simulator UI polls this)
  listeners.forEach(fn => {
    try { fn(msg) } catch {}
  })
  return msg
}

// ─── Send media message ──────────────────

export async function sendMedia(phone, type, url, caption = '') {
  return sendMessage(phone, `[${type}] ${caption}\n${url}`)
}

// ─── Receive message (called by webhook/simulator) ──

export async function receiveMessage(phone, text, type = 'text', mediaUrl = null) {
  const msg = {
    id: 'in_' + Date.now().toString(36),
    phone,
    text,
    type,
    mediaUrl,
    timestamp: new Date().toISOString(),
    direction: 'in',
  }
  // Notify all handlers
  for (const fn of listeners) {
    try { await fn(msg) } catch (e) { console.error('Handler error:', e.message) }
  }
  return msg
}

// ─── Event system ────────────────────────

export function onMessage(handler) {
  listeners.add(handler)
  return () => listeners.delete(handler)
}

// ─── Simulator helpers ──────────────────

export function getOutgoing(since = 0) {
  return messageQueue.filter(m => new Date(m.timestamp).getTime() > since)
}

export function clearQueue() {
  messageQueue.length = 0
}

export function getQueueSize() {
  return messageQueue.length
}
