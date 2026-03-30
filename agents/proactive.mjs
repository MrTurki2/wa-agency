// agents/proactive.mjs — Proactive suggestions based on user patterns
import { getDb } from '../core/db.mjs'

export function getProactiveSuggestion(userId) {
  const db = getDb()

  // Get user's most used agents
  const topAgents = db.prepare(`
    SELECT agent, COUNT(*) as cnt FROM metrics
    WHERE user_id = ? AND agent NOT IN ('onboarding','general','help')
    GROUP BY agent ORDER BY cnt DESC LIMIT 3
  `).all(userId)

  if (!topAgents.length) return null

  // Get last message time
  const last = db.prepare(
    "SELECT timestamp FROM messages WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1"
  ).get(userId)

  if (!last) return null

  const hoursSinceLast = (Date.now() - new Date(last.timestamp).getTime()) / 3600000

  // If user hasn't interacted in 24+ hours, suggest morning briefing
  if (hoursSinceLast > 24) {
    return 'صباح الخير! تبي التقرير اليومي؟ قول "صباح الخير" 🌅'
  }

  // Suggest based on patterns
  const top = topAgents[0].agent
  const suggestions = {
    price: 'تبي أتابع لك الأسعار تلقائي؟ 📊',
    search: 'عندي معلومات جديدة ممكن تهمك 🔍',
    creative: 'تبي أساعدك تكتب شي اليوم؟ ✍️',
    morning: 'ما شفت تقريرك اليوم! قول "صباح الخير" ☀️',
  }

  return suggestions[top] || null
}

// Get user engagement stats
export function getUserEngagement(userId) {
  const db = getDb()

  const stats = db.prepare(`
    SELECT
      COUNT(*) as totalMessages,
      COUNT(DISTINCT DATE(timestamp)) as activeDays,
      MIN(timestamp) as firstMessage,
      MAX(timestamp) as lastMessage
    FROM messages WHERE user_id = ?
  `).get(userId)

  const agentUsage = db.prepare(`
    SELECT agent, COUNT(*) as cnt FROM metrics
    WHERE user_id = ?
    GROUP BY agent ORDER BY cnt DESC
  `).all(userId)

  return { ...stats, agentUsage }
}
