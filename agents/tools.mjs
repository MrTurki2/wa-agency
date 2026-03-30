// agents/tools.mjs — Utility tools agent (QR, translate, convert, analyze)
import { ask, analyzeImage, transcribe } from '../core/llm.mjs'

export const tools = {
  getName() { return 'tools' },

  canHandle(ctx) {
    if (ctx.type !== 'text') return true // Handle all media
    if (!ctx.text) return false
    return /كيو ار|qr|ترجم|translate|حول|convert|تحويل/i.test(ctx.text)
  },

  async handle(ctx) {
    // Media handling
    if (ctx.type === 'image' && ctx.mediaUrl) {
      return handleImage(ctx)
    }
    if (ctx.type === 'audio' && ctx.mediaUrl) {
      return handleAudio(ctx)
    }
    if (ctx.type === 'document') {
      return '📄 استلمت الملف. حالياً أقدر أحلل الصور والصوتيات. دعم الملفات قريباً!'
    }

    const text = ctx.text.trim().toLowerCase()

    // QR Code
    if (/كيو ار|qr/.test(text)) {
      return handleQR(ctx.text)
    }

    // Translation
    if (/ترجم|translate/.test(text)) {
      return handleTranslate(ctx.text)
    }

    // Conversion
    if (/حول|convert|تحويل/.test(text)) {
      return handleConvert(ctx.text)
    }

    return '🔧 وش تبي أسوي لك؟\n\n▸ "كيو ار [رابط]" — QR Code\n▸ "ترجم [نص]" — ترجمة\n▸ "حول [قيمة]" — تحويل عملات\n▸ أرسل صورة — تحليل\n▸ أرسل صوت — تحويل لنص'
  }
}

async function handleImage(ctx) {
  try {
    const analysis = await analyzeImage(ctx.mediaUrl)
    return `🖼️ تحليل الصورة:\n\n${analysis}`
  } catch (e) {
    return '❌ ما قدرت أحلل الصورة. جرب مرة ثانية.'
  }
}

async function handleAudio(ctx) {
  try {
    // In simulator mode, we can't actually download audio
    // In production, download from WhatsApp and transcribe
    return '🎙️ خدمة تحويل الصوت لنص جاهزة!\nفي الإصدار الحالي (المحاكي) ما أقدر أحمل الصوت.\nبالنسخة الكاملة (Cloud API) بتشتغل تلقائي.'
  } catch {
    return '❌ ما قدرت أحول الصوت. جرب مرة ثانية.'
  }
}

async function handleQR(text) {
  const url = text.replace(/^(كيو ار|qr code|qr)\s*/i, '').trim()
  if (!url) return 'عطني الرابط اللي تبي أسوي له QR Code\nمثال: كيو ار https://example.com'

  // Generate QR using qr1.test API (or fallback)
  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`
    return `📱 QR Code جاهز!\n\n${qrUrl}\n\nالرابط: ${url}`
  } catch {
    return '❌ ما قدرت أسوي QR Code. جرب مرة ثانية.'
  }
}

async function handleTranslate(text) {
  const content = text.replace(/^(ترجم|translate)\s*/i, '').trim()
  if (!content) return 'عطني النص اللي تبي أترجمه\nمثال: ترجم Hello how are you'

  const result = await ask(
    `ترجم هذا النص. إذا كان عربي ترجمه لإنجليزي، إذا كان إنجليزي ترجمه لعربي. النص: "${content}"\nأعط الترجمة فقط بدون شرح.`
  )
  return `🌐 الترجمة:\n\n${result}`
}

async function handleConvert(text) {
  const content = text.replace(/^(حول|convert|تحويل)\s*/i, '').trim()
  if (!content) return 'عطني القيمة اللي تبي أحولها\nمثال: حول 100 دولار لريال'

  const result = await ask(
    `المستخدم يبي تحويل: "${content}"\nسو التحويل وأعطه النتيجة مباشرة. لو عملات استخدم الأسعار التقريبية الحالية.`,
    'أنت آلة حاسبة للتحويل. أجب بالنتيجة فقط مع توضيح بسيط.'
  )
  return `🔄 ${result}`
}
