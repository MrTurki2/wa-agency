// agents/reminder.mjs — Reminder/task management agent
import { chat } from '../core/llm.mjs'
import { getDb } from '../core/db.mjs'

// Init reminders table
function initReminders() {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      due_at TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)
}

export const reminder = {
  getName() { return 'reminder' },

  canHandle(ctx) {
    if (!ctx.text) return false
    return /^(ذكرني|فكرني|remind|تذكير|مهمة|task|مهامي|tasks|قائمة مهام)/i.test(ctx.text.trim())
  },

  async handle(ctx) {
    initReminders()
    const text = ctx.text.trim()

    // List tasks
    if (/^(مهامي|tasks|قائمة مهام|قائمتي)/i.test(text)) {
      return listReminders(ctx.user.id)
    }

    // Add reminder
    const content = text.replace(/^(ذكرني|فكرني|remind me|remind|تذكير|مهمة|task)\s*/i, '').trim()
    if (!content) {
      return '⏰ وش تبي أذكرك فيه؟\n\nمثال:\n▸ "ذكرني أتصل بأحمد"\n▸ "مهمة تسليم التقرير"\n▸ "مهامي" — لعرض القائمة'
    }

    // Parse time if mentioned
    const timeInfo = await extractTime(content)

    const db = getDb()
    db.prepare('INSERT INTO reminders (user_id, text, due_at) VALUES (?, ?, ?)')
      .run(ctx.user.id, timeInfo.task, timeInfo.dueAt)

    const count = db.prepare("SELECT COUNT(*) as n FROM reminders WHERE user_id = ? AND status = 'pending'")
      .get(ctx.user.id).n

    let msg = `✅ تم حفظ المهمة: ${timeInfo.task}`
    if (timeInfo.dueAt) msg += `\n⏰ الموعد: ${timeInfo.dueAt}`
    msg += `\n\n📋 عندك ${count} مهام نشطة`
    msg += `\nقول "مهامي" لعرض القائمة`

    return msg
  }
}

function listReminders(userId) {
  const db = getDb()
  const items = db.prepare(
    "SELECT id, text, due_at, created_at FROM reminders WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 20"
  ).all(userId)

  if (!items.length) return '📋 ما عندك مهام حالياً.\nقول "ذكرني [شي]" لإضافة مهمة جديدة.'

  let msg = `📋 مهامك (${items.length}):\n\n`
  items.forEach((item, i) => {
    msg += `${i + 1}. ${item.text}`
    if (item.due_at) msg += ` ⏰ ${item.due_at}`
    msg += '\n'
  })
  msg += '\nلإضافة مهمة: "ذكرني [شي]"'

  return msg
}

async function extractTime(text) {
  // Simple patterns
  const tomorrow = /غداً|غدا|بكرة|tomorrow/i
  const today = /اليوم|today/i
  const nextWeek = /الأسبوع الجاي|next week/i

  let dueAt = null
  let task = text

  if (tomorrow.test(text)) {
    const d = new Date(); d.setDate(d.getDate() + 1)
    dueAt = d.toISOString().split('T')[0]
    task = text.replace(tomorrow, '').trim()
  } else if (today.test(text)) {
    dueAt = new Date().toISOString().split('T')[0]
    task = text.replace(today, '').trim()
  } else if (nextWeek.test(text)) {
    const d = new Date(); d.setDate(d.getDate() + 7)
    dueAt = d.toISOString().split('T')[0]
    task = text.replace(nextWeek, '').trim()
  }

  return { task: task || text, dueAt }
}
