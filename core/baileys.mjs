// core/baileys.mjs — WhatsApp connection via Baileys
import makeWASocket, { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys'

let sock = null
let qrString = null
let connectionStatus = 'disconnected' // disconnected | connecting | open
const messageHandlers = new Set()

// ─── Get status ──────────────────────────

export function getStatus() {
  return { status: connectionStatus, qr: qrString }
}

// ─── Register message handler ────────────

export function onBaileysMessage(handler) {
  messageHandlers.add(handler)
  return () => messageHandlers.delete(handler)
}

// ─── Send message via WhatsApp ───────────

export async function sendWhatsApp(phone, text) {
  if (!sock || connectionStatus !== 'open') {
    throw new Error('WhatsApp not connected')
  }
  const jid = phone.replace(/^\+/, '') + '@s.whatsapp.net'
  await sock.sendMessage(jid, { text })
}

// ─── Start connection ────────────────────

export async function startBaileys() {
  const { state, saveCreds } = await useMultiFileAuthState('data/auth')

  sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, { level: 'silent' }),
    },
    printQRInTerminal: false,
    browser: ['WA-Agency', 'Chrome', '22.0'],
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ qr, connection, lastDisconnect }) => {
    if (qr) {
      qrString = qr
      connectionStatus = 'connecting'
      console.log('📱 New QR code ready — open /setup to scan')
    }

    if (connection === 'open') {
      connectionStatus = 'open'
      qrString = null
      console.log('✅ WhatsApp connected!')
    }

    if (connection === 'close') {
      connectionStatus = 'disconnected'
      const code = lastDisconnect?.error?.output?.statusCode
      if (code === DisconnectReason.loggedOut) {
        console.log('🚪 Logged out — need new QR scan')
        qrString = null
      } else {
        console.log('⚠️ Disconnected, reconnecting in 3s...')
        setTimeout(startBaileys, 3000)
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (const msg of messages) {
      if (msg.key.fromMe) continue
      const phone = msg.key.remoteJid?.replace('@s.whatsapp.net', '')
      if (!phone || msg.key.remoteJid?.includes('@g.us')) continue // skip groups

      const text = msg.message?.conversation
        || msg.message?.extendedTextMessage?.text
        || ''

      if (!text) continue

      for (const handler of messageHandlers) {
        try { await handler(phone, text) } catch (e) {
          console.error('Baileys handler error:', e.message)
        }
      }
    }
  })

  return sock
}

// ─── Stop connection ─────────────────────

export async function stopBaileys() {
  if (sock) {
    sock.end(undefined)
    sock = null
    connectionStatus = 'disconnected'
    qrString = null
  }
}
