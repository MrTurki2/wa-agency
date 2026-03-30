// agents/profile.mjs — User profile management
import { getUser, updateUser, getDb } from '../core/db.mjs'

export const profile = {
  getName() { return 'profile' },

  canHandle(ctx) {
    if (!ctx.text) return false
    return /^(بياناتي|حسابي|profile|اسمي|غير اسمي|غير مدينتي|معلوماتي)/i.test(ctx.text.trim())
  },

  async handle(ctx) {
    const text = ctx.text.trim()
    const user = ctx.user

    // Change name
    if (/^(غير اسمي|اسمي الجديد|سمني)\s+/i.test(text)) {
      const newName = text.replace(/^(غير اسمي|اسمي الجديد|سمني)\s+/i, '').trim()
      if (newName.length < 2) return 'الاسم قصير! عطني اسم أطول.'
      updateUser(ctx.phone, { name: newName })
      return `✅ تم تغيير اسمك إلى: ${newName}`
    }

    // Change city
    if (/^(غير مدينتي|مدينتي الجديدة|مدينتي)\s+/i.test(text)) {
      const newCity = text.replace(/^(غير مدينتي|مدينتي الجديدة|مدينتي)\s+/i, '').trim()
      updateUser(ctx.phone, { city: newCity })
      return `✅ تم تغيير مدينتك إلى: ${newCity}`
    }

    // Show profile
    const db = getDb()
    const msgCount = db.prepare('SELECT COUNT(*) as n FROM messages WHERE user_id = ?').get(user.id).n
    const topAgent = db.prepare(
      "SELECT agent, COUNT(*) as n FROM metrics WHERE user_id = ? AND agent NOT IN ('onboarding','help') GROUP BY agent ORDER BY n DESC LIMIT 1"
    ).get(user.id)

    return `👤 ملفك الشخصي

الاسم: ${user.name || '—'}
الهاتف: ${user.phone}
المدينة: ${user.city || '—'}
مسجل من: ${user.registered_at?.split('T')[0] || '—'}
آخر نشاط: ${user.last_seen?.split('T')[0] || '—'}
عدد الرسائل: ${msgCount}
أكثر خدمة تستخدمها: ${topAgent?.agent || '—'} (${topAgent?.n || 0} مرة)

لتعديل بياناتك:
▸ "غير اسمي [الاسم الجديد]"
▸ "غير مدينتي [المدينة]"`
  }
}
