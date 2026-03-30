// core/db.mjs — SQLite database service (better-sqlite3)
import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'

let _db = null

export function getDb(dbPath = 'data/wa-agency.db') {
  if (_db) return _db
  const dir = dirname(dbPath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  _db = new Database(dbPath)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  initSchema(_db)
  return _db
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      name TEXT,
      email TEXT,
      city TEXT DEFAULT 'Riyadh',
      language TEXT DEFAULT 'ar',
      registered_at TEXT DEFAULT (datetime('now')),
      last_seen TEXT DEFAULT (datetime('now')),
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      direction TEXT NOT NULL CHECK(direction IN ('in','out')),
      agent TEXT,
      content TEXT,
      message_type TEXT DEFAULT 'text',
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      agent TEXT NOT NULL,
      action TEXT NOT NULL,
      response_time_ms INTEGER,
      tokens_used INTEGER,
      success INTEGER DEFAULT 1,
      timestamp TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user','assistant','system')),
      content TEXT NOT NULL,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, timestamp);
    CREATE INDEX IF NOT EXISTS idx_metrics_agent ON metrics(agent, timestamp);
  `)
}

// ─── User CRUD ───────────────────────────

export function getUser(phone) {
  const db = getDb()
  return db.prepare('SELECT * FROM users WHERE phone = ?').get(phone)
}

export function createUser(phone, data = {}) {
  const db = getDb()
  const id = 'u_' + Date.now().toString(36)
  db.prepare(`
    INSERT INTO users (id, phone, name, email, city, language)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, phone, data.name || null, data.email || null, data.city || 'Riyadh', data.language || 'ar')
  return getUser(phone)
}

export function updateUser(phone, data) {
  const db = getDb()
  const fields = Object.entries(data)
    .filter(([k]) => ['name', 'email', 'city', 'language', 'status'].includes(k))
    .map(([k]) => `${k} = ?`)
  if (!fields.length) return
  const values = Object.entries(data)
    .filter(([k]) => ['name', 'email', 'city', 'language', 'status'].includes(k))
    .map(([, v]) => v)
  db.prepare(`UPDATE users SET ${fields.join(', ')}, last_seen = datetime('now') WHERE phone = ?`)
    .run(...values, phone)
  return getUser(phone)
}

export function touchUser(phone) {
  const db = getDb()
  db.prepare("UPDATE users SET last_seen = datetime('now') WHERE phone = ?").run(phone)
}

// ─── Messages ────────────────────────────

export function saveMessage(userId, direction, content, agent = null, type = 'text') {
  const db = getDb()
  db.prepare(`
    INSERT INTO messages (user_id, direction, agent, content, message_type)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, direction, agent, content, type)
}

// ─── Conversation Memory ─────────────────

export function addToConversation(userId, role, content) {
  const db = getDb()
  db.prepare('INSERT INTO conversations (user_id, role, content) VALUES (?, ?, ?)').run(userId, role, content)
  // Keep last 20 messages per user
  db.prepare(`
    DELETE FROM conversations WHERE user_id = ? AND id NOT IN (
      SELECT id FROM conversations WHERE user_id = ? ORDER BY timestamp DESC LIMIT 20
    )
  `).run(userId, userId)
}

export function getConversation(userId, limit = 10) {
  const db = getDb()
  return db.prepare(
    'SELECT role, content FROM conversations WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?'
  ).all(userId, limit).reverse()
}

// ─── Metrics ─────────────────────────────

export function logMetric(userId, agent, action, responseTimeMs, tokensUsed = 0, success = 1) {
  const db = getDb()
  db.prepare(`
    INSERT INTO metrics (user_id, agent, action, response_time_ms, tokens_used, success)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, agent, action, responseTimeMs, tokensUsed, success)
}

export function getStats() {
  const db = getDb()
  return {
    totalUsers: db.prepare('SELECT COUNT(*) as n FROM users').get().n,
    totalMessages: db.prepare('SELECT COUNT(*) as n FROM messages').get().n,
    agentStats: db.prepare(`
      SELECT agent, COUNT(*) as calls, AVG(response_time_ms) as avg_ms, SUM(tokens_used) as tokens
      FROM metrics GROUP BY agent ORDER BY calls DESC
    `).all(),
    recentMessages: db.prepare(`
      SELECT m.*, u.name as user_name FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY m.timestamp DESC LIMIT 20
    `).all()
  }
}

export function close() {
  if (_db) { _db.close(); _db = null }
}
