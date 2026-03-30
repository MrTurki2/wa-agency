// agents/search.mjs — Web search and information lookup agent
import { ask, chat } from '../core/llm.mjs'

export const search = {
  getName() { return 'search' },

  canHandle(ctx) {
    if (!ctx.text) return false
    return /^(ابحث|بحث|search|وش يعني|ما هو|what is|who is|من هو|عرفني|explain)/i.test(ctx.text.trim())
  },

  async handle(ctx) {
    const query = ctx.text
      .replace(/^(ابحث عن|ابحث|بحث عن|بحث|search for|search|وش يعني|ما هو|what is|who is|من هو|عرفني عن|عرفني|explain)\s*/i, '')
      .trim()

    if (!query) return 'وش تبي أبحث عنه؟'

    // Use LLM as knowledge base (fast, no external API needed)
    const result = await chat(
      [{ role: 'user', content: query }],
      {
        system: `أنت محرك بحث ذكي. المستخدم يسألك سؤال ويبي جواب دقيق ومختصر.

قواعد:
- أجب بالعربي (لهجة سعودية خفيفة)
- رتب المعلومات بنقاط واضحة
- إذا السؤال عن شخص: اسمه، وش يسوي، ليش مشهور
- إذا السؤال عن مفهوم: تعريف مختصر + مثال
- إذا السؤال عن مكان: وين، وش فيه، ليش مهم
- حط المصدر إذا تقدر
- لا تطول — 3-5 نقاط كافية`,
        temperature: 0.3,
        maxTokens: 800,
      }
    )

    return `🔍 ${query}\n\n${result.content}`
  }
}
