// agents/summary.mjs — Text/URL summarization agent
import { chat } from '../core/llm.mjs'
import { fetchSafe } from '../core/fetch-safe.mjs'

export const summary = {
  getName() { return 'summary' },

  canHandle(ctx) {
    if (!ctx.text) return false
    return /^(لخص|خلص|summarize|summary|اختصر)/i.test(ctx.text.trim())
  },

  async handle(ctx) {
    const text = ctx.text.replace(/^(لخص|خلص|summarize|summary|اختصر)\s*/i, '').trim()

    if (!text) return 'عطني النص أو الرابط اللي تبي ألخصه'

    // Check if it's a URL
    const urlMatch = text.match(/https?:\/\/[^\s]+/)
    if (urlMatch) {
      return handleUrl(urlMatch[0])
    }

    // Summarize text
    const result = await chat(
      [{ role: 'user', content: text }],
      {
        system: `أنت ملخص محترف. لخص النص التالي بشكل مختصر ومفيد بالعربي.
قواعد:
- 3-5 نقاط رئيسية
- لا تضيف معلومات غير موجودة
- حافظ على المعنى الأساسي
- استخدم نقاط واضحة`,
        temperature: 0.3,
        maxTokens: 500,
      }
    )

    return `📝 الملخص:\n\n${result.content}`
  }
}

async function handleUrl(url) {
  const res = await fetchSafe(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WABot/1.0)' },
  })
  if (!res.ok) return `❌ ما قدرت أفتح الرابط (${res.status})`

  const html = await res.text()
  const textContent = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 3000)

  if (textContent.length < 50) return '❌ الصفحة ما فيها محتوى كافي للتلخيص'

  const result = await chat(
    [{ role: 'user', content: `لخص محتوى هذه الصفحة:\n\n${textContent}` }],
    {
      system: 'أنت ملخص محترف. لخص المحتوى بالعربي في 3-5 نقاط مختصرة.',
      temperature: 0.3,
      maxTokens: 500,
    }
  )

  return `📝 ملخص الرابط:\n${url}\n\n${result.content}`
}
