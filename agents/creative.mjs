// agents/creative.mjs — Content creation agent (write, compose, draft)
import { chat } from '../core/llm.mjs'

export const creative = {
  getName() { return 'creative' },

  canHandle(ctx) {
    if (!ctx.text) return false
    return /^(اكتب|صمم|سوي لي|سولي|generate|compose|write|draft|حرر|عدل)/i.test(ctx.text.trim())
  },

  async handle(ctx) {
    const text = ctx.text.trim()

    // Detect creative task type
    const taskType = detectTask(text)

    const result = await chat(
      [{ role: 'user', content: text }],
      {
        system: `أنت كاتب محترف ومبدع. المستخدم يطلب منك ${taskType}.

قواعد:
- اكتب بجودة عالية ومهنية
- إذا طلب إيميل: استخدم تنسيق إيميل رسمي
- إذا طلب رسالة: اجعلها مناسبة للسياق
- إذا طلب محتوى سوشال ميديا: اجعله جذاب ومختصر
- إذا طلب تعديل نص: حسّنه مع الحفاظ على المعنى
- لا تضيف مقدمة — ابدأ مباشرة بالنص المطلوب
- إذا ما وضح التفاصيل، اكتب نسخة عامة يقدر يعدلها`,
        temperature: 0.8,
        maxTokens: 1200,
      }
    )

    return `✍️ ${taskType}\n\n${result.content}\n\n—\nتبي أعدل شي؟ قول لي وش تبي أغير.`
  }
}

function detectTask(text) {
  const t = text.toLowerCase()
  if (/ايميل|email|بريد/.test(t)) return 'كتابة إيميل'
  if (/رسالة|message|واتساب/.test(t)) return 'كتابة رسالة'
  if (/تغريد|tweet|تويت/.test(t)) return 'كتابة تغريدة'
  if (/مقال|article|بوست|post/.test(t)) return 'كتابة مقال'
  if (/اعتذار|apology|عذر/.test(t)) return 'كتابة رسالة اعتذار'
  if (/تهنئ|congrat|مبارك/.test(t)) return 'كتابة رسالة تهنئة'
  if (/سيرة|cv|resume/.test(t)) return 'كتابة سيرة ذاتية'
  if (/عدل|حرر|edit|fix/.test(t)) return 'تعديل نص'
  return 'كتابة محتوى'
}
