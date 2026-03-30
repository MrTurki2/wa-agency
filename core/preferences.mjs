// core/preferences.mjs — User preferences learned from behavior
import { getDb } from './db.mjs'

export function initPreferences() {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS preferences (
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, key),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)
}

export function setPref(userId, key, value) {
  initPreferences()
  const db = getDb()
  db.prepare(`
    INSERT INTO preferences (user_id, key, value)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, key) DO UPDATE SET value = ?, updated_at = datetime('now')
  `).run(userId, key, value, value)
}

export function getPref(userId, key, defaultVal = null) {
  initPreferences()
  const db = getDb()
  const row = db.prepare('SELECT value FROM preferences WHERE user_id = ? AND key = ?').get(userId, key)
  return row?.value ?? defaultVal
}

export function getAllPrefs(userId) {
  initPreferences()
  const db = getDb()
  return db.prepare('SELECT key, value FROM preferences WHERE user_id = ?').all(userId)
}

// Learn preferences from usage patterns
export function learnFromUsage(userId) {
  const db = getDb()

  // Most used agent
  const topAgent = db.prepare(
    "SELECT agent, COUNT(*) as n FROM metrics WHERE user_id = ? AND agent NOT IN ('onboarding','help','general') GROUP BY agent ORDER BY n DESC LIMIT 1"
  ).get(userId)
  if (topAgent) setPref(userId, 'top_agent', topAgent.agent)

  // Average message length (short = prefers brief, long = prefers detailed)
  const avgLen = db.prepare(
    "SELECT AVG(LENGTH(content)) as avg FROM messages WHERE user_id = ? AND direction = 'in'"
  ).get(userId)
  if (avgLen?.avg) {
    setPref(userId, 'msg_style', avgLen.avg < 20 ? 'brief' : avgLen.avg < 50 ? 'normal' : 'detailed')
  }

  // Active hours
  const peakHour = db.prepare(`
    SELECT CAST(strftime('%H', timestamp) AS INTEGER) as hour, COUNT(*) as n
    FROM messages WHERE user_id = ? AND direction = 'in'
    GROUP BY hour ORDER BY n DESC LIMIT 1
  `).get(userId)
  if (peakHour) setPref(userId, 'peak_hour', String(peakHour.hour))
}
