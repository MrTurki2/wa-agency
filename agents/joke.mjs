// agents/joke.mjs — Fun/entertainment agent
import { ask } from '../core/llm.mjs'

export const joke = {
  getName() { return 'joke' },

  canHandle(ctx) {
    if (!ctx.text) return false
    return /^(نكتة|طرفة|joke|ضحكني|سالفة|حزورة|لغز|quiz|اختبار|فزورة)/i.test(ctx.text.trim())
  },

  async handle(ctx) {
    const text = ctx.text.trim().toLowerCase()

    if (/نكتة|طرفة|joke|ضحكني/.test(text)) {
      return ask(
        'أعطني نكتة سعودية مضحكة (مناسبة للجميع، قصيرة، بلهجة سعودية)',
        'أنت كوميديان سعودي. نكتة واحدة فقط، بدون مقدمة.'
      ).then(r => `😂 ${r}`)
    }

    if (/حزورة|لغز|فزورة/.test(text)) {
      return ask(
        'أعطني لغز أو حزورة ممتعة مع الجواب',
        'أعط حزورة واحدة ثم اكتب الجواب بعد سطر فاصل. بالعربي.'
      ).then(r => `🧩 ${r}`)
    }

    if (/quiz|اختبار/.test(text)) {
      return ask(
        'أعطني سؤال ثقافة عامة مع 4 خيارات والجواب الصحيح',
        'سؤال واحد، 4 خيارات (أ ب ج د)، ثم الجواب. بالعربي.'
      ).then(r => `📝 اختبار:\n\n${r}`)
    }

    return ask('أعطني نكتة سعودية قصيرة ومضحكة').then(r => `😂 ${r}`)
  }
}
