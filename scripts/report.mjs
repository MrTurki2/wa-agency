// scripts/report.mjs — Generate admin report
import { getDb, getStats, close } from '../core/db.mjs'
import { getAllPrefs } from '../core/preferences.mjs'

const stats = getStats()
const db = getDb()

// Users with engagement
const users = db.prepare('SELECT * FROM users ORDER BY last_seen DESC').all()

console.log('╭──────────────────────────────────────────────╮')
console.log('│       WA Agency — Admin Report               │')
console.log('│       ' + new Date().toISOString().split('T')[0] + '                              │')
console.log('╰──────────────────────────────────────────────╯')

console.log('\n─── Overview ─────────────────────────────────\n')
console.log(`  Users:          ${stats.totalUsers}`)
console.log(`  Messages:       ${stats.totalMessages}`)
console.log(`  Active Agents:  ${stats.agentStats.length}`)

const totalCalls = stats.agentStats.reduce((s, a) => s + a.calls, 0)
const avgMs = Math.round(stats.agentStats.reduce((s, a) => s + (a.avg_ms || 0) * a.calls, 0) / totalCalls)
console.log(`  Avg Response:   ${avgMs}ms`)

console.log('\n─── Agent Performance ────────────────────────\n')
console.log('  Agent          Calls    Avg(ms)  Share')
console.log('  ─────────────  ──────   ──────   ─────')
for (const a of stats.agentStats) {
  const pct = ((a.calls / totalCalls) * 100).toFixed(1)
  const bar = '▰'.repeat(Math.round(pct / 5)) + '▱'.repeat(20 - Math.round(pct / 5))
  console.log(`  ${a.agent.padEnd(15)} ${String(a.calls).padStart(6)}   ${String(Math.round(a.avg_ms || 0)).padStart(6)}   ${bar} ${pct}%`)
}

console.log('\n─── User Engagement ──────────────────────────\n')
console.log('  User          City        Messages  Top Agent')
console.log('  ────────────  ──────────  ────────  ─────────')
for (const u of users) {
  const msgCount = db.prepare('SELECT COUNT(*) as n FROM messages WHERE user_id = ?').get(u.id).n
  const topAgent = db.prepare(
    "SELECT agent FROM metrics WHERE user_id = ? AND agent NOT IN ('onboarding','help') GROUP BY agent ORDER BY COUNT(*) DESC LIMIT 1"
  ).get(u.id)
  console.log(`  ${(u.name || '?').padEnd(14)} ${(u.city || '?').padEnd(12)} ${String(msgCount).padStart(6)}    ${topAgent?.agent || '—'}`)
}

console.log('\n─── Preferences Learned ──────────────────────\n')
for (const u of users.slice(0, 5)) {
  const prefs = getAllPrefs(u.id)
  if (prefs.length) {
    console.log(`  ${u.name}: ${prefs.map(p => `${p.key}=${p.value}`).join(', ')}`)
  }
}

console.log('\n──────────────────────────────────────────────\n')

close()
