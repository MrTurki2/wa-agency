// agents/router.mjs — Message router: classifies intent and delegates to correct agent
import { classify } from '../core/llm.mjs'
import { getUser } from '../core/db.mjs'
import { onboarding } from './onboarding.mjs'
import { morning } from './morning.mjs'
import { price } from './price.mjs'
import { general } from './general.mjs'
import { search } from './search.mjs'
import { creative } from './creative.mjs'
import { tools } from './tools.mjs'
import { summary } from './summary.mjs'
import { reminder } from './reminder.mjs'
import { calculator } from './calculator.mjs'
import { weather } from './weather.mjs'
import { news } from './news.mjs'
import { joke } from './joke.mjs'
import { profile } from './profile.mjs'

const agents = [onboarding, morning, price, weather, search, creative, summary, reminder, calculator, news, joke, profile, tools, general]

export async function route(phone, text, type = 'text', mediaUrl = null) {
  const ctx = {
    phone,
    text,
    type,
    mediaUrl,
    user: getUser(phone),
    timestamp: new Date().toISOString(),
  }

  // 1. Onboarding always first — if user not registered
  if (!ctx.user) {
    return { agent: onboarding, ctx }
  }

  // 2. Help/Menu command
  if (/^(مساعدة|help|قائمة|menu|خدمات|وش تقدر تسوي|؟|\?)$/i.test(text?.trim())) {
    return { agent: { getName: () => 'help', handle: () => helpMessage(ctx.user.name) }, ctx }
  }

  // 3. Quick keyword match (no LLM needed)
  const quick = quickMatch(text)
  if (quick) {
    const agent = agents.find(a => a.getName() === quick)
    if (agent) return { agent, ctx }
  }

  // 4. Media messages → tools agent
  if (type !== 'text' || mediaUrl) {
    return { agent: tools, ctx }
  }

  // 5. LLM classification
  const categories = ['price', 'weather', 'search', 'creative', 'tools', 'morning', 'summary', 'reminder', 'calculator', 'news', 'joke', 'general']
  const { category, tokens, ms } = await classify(text, categories,
    `You classify Arabic WhatsApp messages. Categories:
- price: asking about prices (gold, crypto, stocks, currency, سعر, كم سعر)
- weather: asking about weather, temperature (طقس, حرارة, جو)
- search: asking to search/find information (ابحث, وش يعني, ما هو, what is)
- creative: asking to write/compose/generate text (اكتب, صمم, سوي لي, generate)
- tools: asking for utility (QR code, convert, translate, ترجم, حول, كيو ار)
- morning: morning greeting or daily briefing (صباح, تقرير يومي)
- summary: asking to summarize text or URL (لخص, اختصر, summarize)
- reminder: asking to remember/remind/task (ذكرني, فكرني, مهمة, مهامي)
- calculator: math calculation (احسب, كم يساوي, +, -, ×, ÷)
- news: asking about news, trending (أخبار, ترند, وش الجديد)
- joke: asking for jokes, riddles, quiz (نكتة, حزورة, لغز, اختبار)
- general: casual chat, greetings, questions, anything else`)

  const agent = agents.find(a => a.getName() === category) || general
  return { agent, ctx, classification: { category, tokens, ms } }
}

function quickMatch(text) {
  if (!text) return null
  const t = text.trim().toLowerCase()

  // Price keywords
  if (/سعر|كم سعر|gold|ذهب|بتكوين|bitcoin|دولار|ريال|crypto|stock/.test(t)) return 'price'

  // Search keywords
  if (/^(ابحث|بحث|search|وش يعني|ما هو|what is|who is|من هو)/.test(t)) return 'search'

  // Creative keywords
  if (/^(اكتب|صمم|سوي لي|سولي|generate|compose|write|draft)/.test(t)) return 'creative'

  // Summary
  if (/^(لخص|خلص|اختصر|summarize|summary)/.test(t)) return 'summary'

  // Reminder/tasks
  if (/^(ذكرني|فكرني|remind|تذكير|مهمة|task|مهامي|tasks|قائمة مهام)/.test(t)) return 'reminder'

  // Calculator
  if (/^(احسب|حاسبة|calc|كم يساوي)/.test(t)) return 'calculator'
  if (/^\d+\s*[\+\-\*\/\×\÷]/.test(t)) return 'calculator'

  // Weather
  if (/^(طقس|حرارة|جو|weather)/.test(t)) return 'weather'

  // News
  if (/^(أخبار|اخبار|news|ترند|وش الجديد|آخر)/.test(t)) return 'news'

  // Joke/fun
  if (/^(نكتة|طرفة|joke|ضحكني|حزورة|لغز|فزورة|اختبار|quiz)/.test(t)) return 'joke'

  // Profile
  if (/^(بياناتي|حسابي|profile|معلوماتي|غير اسمي|غير مدينتي)/.test(t)) return 'profile'

  // Tools keywords (حول must come before price to catch "حول X دولار")
  if (/كيو ار|qr|ترجم|translate|^حول|convert/.test(t)) return 'tools'

  // Morning
  if (/^(صباح|تقرير|morning|briefing|يومي)/.test(t)) return 'morning'

  return null
}

function helpMessage(name) {
  return `مرحباً ${name || ''}! أنا وكيل — مساعدك الذكي 🤖

الخدمات المتاحة:

💰 الأسعار
▸ "كم سعر الذهب؟"
▸ "سعر البتكوين"
▸ "سعر الدولار"

🔍 البحث
▸ "ابحث عن [موضوع]"
▸ "وش يعني [مصطلح]"
▸ "من هو [شخص]"

✍️ الكتابة
▸ "اكتب إيميل [وصف]"
▸ "اكتب تغريدة عن [موضوع]"
▸ "اكتب رسالة [نوع]"

📝 التلخيص
▸ "لخص [نص أو رابط]"

⏰ التذكيرات
▸ "ذكرني [شي]"
▸ "مهامي" — عرض القائمة

🧮 الحاسبة
▸ "احسب 150 × 3.75"

🔧 أدوات
▸ "كيو ار [رابط]" — QR Code
▸ "ترجم [نص]"
▸ "حول [قيمة]"

🌤️ الطقس
▸ "طقس الرياض"
▸ "حرارة جدة"

📰 الأخبار
▸ "أخبار"
▸ "أخبار التقنية"

😂 الترفيه
▸ "نكتة"
▸ "حزورة"
▸ "اختبار"

☀️ التقرير اليومي
▸ "صباح الخير"

📸 أرسل صورة وأحللها لك
🎙️ أرسل صوت وأحوله لنص`
}
