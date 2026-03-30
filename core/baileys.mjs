// core/baileys.mjs — WhatsApp connection via Baileys v6
import baileys from '@whiskeysockets/baileys'
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = baileys
import { rmSync } from 'fs'

let sock = null
let qrString = null
let connectionStatus = 'disconnected' // disconnected | connecting | open
let retryCount = 0
let pairingPhone = null
let pairingCode = null
const MAX_RETRIES = 5
const messageHandlers = new Set()

// ─── Get status ──────────────────────────

export function getStatus() {
  return { status: connectionStatus, qr: qrString, pairingCode }
}

export function setPairingPhone(phone) {
  pairingPhone = phone?.replace(/[^0-9]/g, '') || null
  pairingCode = null
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
    auth: state,
    printQRInTerminal: false,
    defaultQueryTimeoutMs: undefined,
    browser: ['Mac OS', 'Chrome', '14.4.1'],
  })

  sock.ev.on('creds.update', saveCreds)

  // Try pairing code after first connection attempt
  let pairingRequested = false

  sock.ev.on('connection.update', async ({ qr, connection, lastDisconnect }) => {
    if (qr) {
      qrString = qr
      connectionStatus = 'connecting'
      console.log('📱 New QR code ready — open /setup to scan')

      // Also try pairing code if phone number is set
      if (!pairingRequested && pairingPhone) {
        pairingRequested = true
        try {
          const code = await sock.requestPairingCode(pairingPhone)
          pairingCode = code
          console.log(`🔢 Pairing code: ${code} — enter it in WhatsApp`)
        } catch (e) {
          console.warn('Pairing code failed:', e.message)
        }
      }
    }

    if (connection === 'open') {
      connectionStatus = 'open'
      qrString = null
      retryCount = 0
      console.log('✅ WhatsApp connected!')
    }

    if (connection === 'close') {
      connectionStatus = 'disconnected'
      const code = lastDisconnect?.error?.output?.statusCode
      if (code === DisconnectReason.loggedOut) {
        console.log('🚪 Logged out — clearing auth for fresh QR')
        qrString = null
        retryCount = 0
        try { rmSync('data/auth', { recursive: true, force: true }) } catch {}
        setTimeout(startBaileys, 2000)
      } else if (retryCount < MAX_RETRIES) {
        retryCount++
        const delay = Math.min(retryCount * 5000, 30000)
        console.log(`⚠️ Disconnected, retry ${retryCount}/${MAX_RETRIES} in ${delay / 1000}s...`)
        setTimeout(startBaileys, delay)
      } else {
        console.log('❌ Max retries reached. Open /setup to reconnect.')
        retryCount = 0
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (const msg of messages) {
      if (msg.key.fromMe) continue
      const phone = msg.key.remoteJid?.replace('@s.whatsapp.net', '')
      if (!phone || msg.key.remoteJid?.includes('@g.us')) continue

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
