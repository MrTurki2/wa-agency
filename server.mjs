// server.mjs — Hono server: webhook + WhatsApp simulator UI
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { route } from './agents/router.mjs'
import { sendMessage } from './core/whatsapp.mjs'
import { getUser, saveMessage, addToConversation, touchUser, logMetric, getStats, getDb, close as closeDb } from './core/db.mjs'
import { learnFromUsage } from './core/preferences.mjs'
import { CONFIG, validateConfig } from './core/config.mjs'
import { simulatorHTML } from './views/simulator.mjs'
import { dashboardHTML } from './views/dashboard.mjs'

const app = new Hono()
const PORT = CONFIG.PORT

// ─── Rate limiter (in-memory) ────────────

const rateLimits = new Map()

function checkRateLimit(phone) {
  const now = Date.now()
  const limit = rateLimits.get(phone)
  if (!limit || now > limit.resetAt) {
    rateLimits.set(phone, { count: 1, resetAt: now + 60000 })
    return true
  }
  limit.count++
  return limit.count <= CONFIG.RATE_LIMIT_PER_MINUTE
}

setInterval(() => {
  const now = Date.now()
  for (const [phone, limit] of rateLimits) {
    if (now > limit.resetAt) rateLimits.delete(phone)
  }
}, 300000)

// ─── Init & validate on startup ─────────

getDb()
const configWarnings = validateConfig()
configWarnings.forEach(w => console.warn(`⚠️  ${w}`))

// ─── Graceful shutdown ──────────────────

function shutdown(signal) {
  console.log(`\n${signal} received. Closing DB...`)
  closeDb()
  process.exit(0)
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// ─── Health check ────────────────────────

app.get('/health', (c) => c.json({ status: 'ok', uptime: process.uptime() }))

// ─── Stats API ───────────────────────────

app.get('/api/stats', (c) => c.json(getStats()))

// ─── Dashboard ───────────────────────────

app.get('/dashboard', (c) => c.html(dashboardHTML()))

// ─── Simulator: Send message ─────────────

app.post('/api/send', async (c) => {
  const { phone, text, type, mediaUrl } = await c.req.json()
  if (!phone || !text) return c.json({ error: 'phone and text required' }, 400)

  if (!checkRateLimit(phone)) {
    return c.json({ error: 'Too many messages. Wait a minute.', response: '⏳ كثرت الرسائل! انتظر شوي.' }, 429)
  }
  if (typeof text !== 'string' || text.length > CONFIG.MAX_MESSAGE_LENGTH) {
    return c.json({ error: `Message too long (max ${CONFIG.MAX_MESSAGE_LENGTH} chars)` }, 400)
  }
  if (typeof phone !== 'string' || phone.length < 10 || phone.length > 15) {
    return c.json({ error: 'Invalid phone number' }, 400)
  }

  const start = Date.now()

  try {
    const { agent, ctx, classification } = await route(phone, text, type || 'text', mediaUrl)
    const agentName = agent.getName()
    const response = await agent.handle(ctx)

    const user = getUser(phone)
    if (user) {
      saveMessage(user.id, 'in', text, agentName, type || 'text')
      saveMessage(user.id, 'out', response, agentName)
      addToConversation(user.id, 'user', text)
      addToConversation(user.id, 'assistant', response)
      touchUser(phone)
      logMetric(user.id, agentName, 'handle', Date.now() - start, classification?.tokens || 0)
      try { learnFromUsage(user.id) } catch (e) { console.warn('Preference learn failed:', e.message) }
    }

    await sendMessage(phone, response)

    return c.json({
      agent: agentName,
      response,
      ms: Date.now() - start,
      classification: classification || null,
    })
  } catch (e) {
    console.error('Error handling message:', e)
    const fallback = '⚠️ صار خطأ، جرب مرة ثانية.'
    await sendMessage(phone, fallback)
    return c.json({ error: e.message, response: fallback }, 500)
  }
})

// ─── Conversation history ────────────────

app.get('/api/messages/:phone', (c) => {
  const phone = c.req.param('phone')
  const user = getUser(phone)
  if (!user) return c.json({ messages: [] })
  const db = getDb()
  const messages = db.prepare(
    'SELECT direction, content, agent, message_type, timestamp FROM messages WHERE user_id = ? ORDER BY timestamp ASC'
  ).all(user.id)
  return c.json({ user, messages })
})

// ─── User engagement ─────────────────────

app.get('/api/engagement/:phone', async (c) => {
  const phone = c.req.param('phone')
  const user = getUser(phone)
  if (!user) return c.json({ error: 'user not found' }, 404)
  const { getUserEngagement } = await import('./agents/proactive.mjs')
  return c.json({ user, engagement: getUserEngagement(user.id) })
})

// ─── List users ──────────────────────────

app.get('/api/users', (c) => {
  const db = getDb()
  const users = db.prepare('SELECT * FROM users ORDER BY last_seen DESC').all()
  return c.json(users)
})

// ─── Simulator UI ────────────────────────

app.get('/', (c) => c.html(simulatorHTML()))

// ─── Start server ────────────────────────

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`\n🚀 WA-Agency running on http://localhost:${PORT}`)
  console.log(`📱 Simulator: http://localhost:${PORT}`)
  console.log(`📊 Stats: http://localhost:${PORT}/api/stats\n`)
})
