// agents/general.mjs — Fallback conversational agent
import { chatWithHistory } from '../core/llm.mjs'
import { getConversation } from '../core/db.mjs'

const SYSTEM_PROMPT = `أنت مساعد ذكي على الواتساب، تتكلم بلهجة سعودية ودية ومهنية.
اسمك "وكيل" — مساعد AI شخصي.

قواعد:
- أجب بشكل مختصر ومفيد (الزبدة)
- استخدم اللهجة السعودية
- لا تستخدم إيموجي كثير — واحد أو اثنين بس
- إذا ما تعرف الجواب قول "ما عندي معلومة أكيدة عن هالموضوع"
- لا تتكلف ولا تطول — المستخدم على واتساب يبي رد سريع
- إذا طلب شي مو من اختصاصك وجهه للخدمة المناسبة:
  "جرب تقول: كم سعر الذهب" أو "قول: ابحث عن ..."
`

export const general = {
  getName() { return 'general' },

  canHandle() { return true }, // Always matches as fallback

  async handle(ctx) {
    // Load conversation history
    const history = getConversation(ctx.user.id)

    const result = await chatWithHistory(history, ctx.text, SYSTEM_PROMPT)
    return result.content
  }
}
