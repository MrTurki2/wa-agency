// agents/onboarding.mjs — User registration flow
import { createUser, getUser, updateUser } from '../core/db.mjs'

const pendingRegistrations = new Map() // phone -> step

export const onboarding = {
  getName() { return 'onboarding' },

  canHandle(ctx) {
    return !ctx.user || pendingRegistrations.has(ctx.phone)
  },

  async handle(ctx) {
    const step = pendingRegistrations.get(ctx.phone) || 'welcome'

    switch (step) {
      case 'welcome': {
        pendingRegistrations.set(ctx.phone, 'name')
        return `أهلاً وسهلاً! 👋

أنا مساعدك الذكي على الواتساب.
أقدر أساعدك في:
▸ أسعار الذهب والعملات
▸ البحث عن أي معلومة
▸ تقرير صباحي يومي
▸ كتابة وتحرير النصوص
▸ أدوات مثل QR Code والترجمة

عشان أبدأ، وش اسمك؟`
      }

      case 'name': {
        const name = ctx.text.trim()
        if (name.length < 2) return 'الاسم قصير، عطني اسمك الكامل'

        // Create user with name
        createUser(ctx.phone, { name })
        pendingRegistrations.set(ctx.phone, 'city')
        return `أهلاً ${name}! 🎉

وش مدينتك؟ (مثل: الرياض، جدة، الدمام)`
      }

      case 'city': {
        const city = ctx.text.trim()
        updateUser(ctx.phone, { city })
        pendingRegistrations.delete(ctx.phone)
        const user = getUser(ctx.phone)
        return `تمام ${user.name}! تم تسجيلك ✅

أنت الحين جاهز تستخدم كل الخدمات.
جرب تقول لي:
▸ "كم سعر الذهب؟"
▸ "ابحث عن الذكاء الاصطناعي"
▸ "اكتب لي إيميل اعتذار"
▸ "صباح الخير" — للتقرير اليومي

أو أرسل أي سؤال وأنا أجاوبك 🚀`
      }

      default: {
        pendingRegistrations.delete(ctx.phone)
        return 'حصل خطأ، نبدأ من جديد. وش اسمك؟'
      }
    }
  }
}
