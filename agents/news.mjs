// agents/news.mjs — News/trending agent
import { chat } from '../core/llm.mjs'

export const news = {
  getName() { return 'news' },

  canHandle(ctx) {
    if (!ctx.text) return false
    return /^(أخبار|اخبار|news|ترند|trending|وش الجديد|آخر الأخبار|اخر)/i.test(ctx.text.trim())
  },

  async handle(ctx) {
    const text = ctx.text.trim()
    const topic = text.replace(/^(أخبار|اخبار|news|ترند|trending|وش الجديد|آخر الأخبار|اخر)\s*/i, '').trim()

    const query = topic || 'آخر الأخبار العربية والسعودية'

    const result = await chat(
      [{ role: 'user', content: `أخبرني عن: ${query}` }],
      {
        system: `أنت مراسل أخبار. أعط المستخدم آخر المعلومات عن الموضوع المطلوب.

قواعد:
- 3-5 نقاط أخبار مختصرة
- ابدأ بالأهم
- اذكر أن المعلومات بناءً على آخر ما تعرفه
- بالعربي ولهجة سعودية خفيفة
- لا تخترع أخبار — إذا ما تعرف قول`,
        temperature: 0.3,
        maxTokens: 800,
      }
    )

    return `📰 ${topic || 'آخر الأخبار'}\n\n${result.content}\n\n⚠️ المعلومات بناءً على آخر تحديث متوفر`
  }
}
