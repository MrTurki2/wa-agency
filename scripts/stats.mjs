// scripts/stats.mjs — Print stats from the database
import { getDb, getStats, close } from '../core/db.mjs'

const stats = getStats()

console.log('═══════════════════════════════════════════')
console.log('  WA Agency — Statistics')
console.log('═══════════════════════════════════════════')
console.log(`  Users:     ${stats.totalUsers}`)
console.log(`  Messages:  ${stats.totalMessages}`)
console.log('───────────────────────────────────────────')
console.log('  Agent Performance:')
console.log('  Agent          Calls   Avg(ms)   Tokens')
console.log('  ─────────────  ─────   ───────   ──────')
for (const a of stats.agentStats) {
  console.log(`  ${a.agent.padEnd(15)} ${String(a.calls).padStart(5)}   ${String(Math.round(a.avg_ms || 0)).padStart(7)}   ${String(a.tokens || 0).padStart(6)}`)
}
console.log('───────────────────────────────────────────')
console.log('  Recent Messages:')
for (const m of stats.recentMessages.slice(0, 10)) {
  const dir = m.direction === 'in' ? '←' : '→'
  const name = m.user_name || '?'
  console.log(`  ${dir} ${name.padEnd(10)} [${(m.agent || '').padEnd(10)}] ${(m.content || '').substring(0, 50)}`)
}
console.log('═══════════════════════════════════════════\n')

close()
