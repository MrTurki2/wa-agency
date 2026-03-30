// views/dashboard.mjs — Analytics dashboard UI
export function dashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WA Agency — Dashboard</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
:root { --bg: #0f172a; --card: #1e293b; --accent: #38bdf8; --green: #22c55e; --text: #e2e8f0; --muted: #94a3b8; --border: #334155; }
body { font-family: -apple-system, sans-serif; background: var(--bg); color: var(--text); padding: 24px; }
h1 { font-size: 24px; margin-bottom: 24px; } h1 span { color: var(--accent); }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
.card { background: var(--card); border-radius: 12px; padding: 20px; border: 1px solid var(--border); }
.card-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
.card-value { font-size: 32px; font-weight: 700; margin-top: 4px; }
.card-value.green { color: var(--green); } .card-value.accent { color: var(--accent); }
.section { background: var(--card); border-radius: 12px; padding: 20px; border: 1px solid var(--border); margin-bottom: 16px; }
.section h2 { font-size: 16px; margin-bottom: 16px; color: var(--accent); }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; font-size: 12px; color: var(--muted); text-transform: uppercase; padding: 8px 12px; border-bottom: 1px solid var(--border); }
td { padding: 8px 12px; border-bottom: 1px solid var(--border); font-size: 14px; }
.bar { height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 4px; background: var(--accent); }
.badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
.badge-in { background: #1e3a5f; color: #60a5fa; } .badge-out { background: #14532d; color: #4ade80; }
.refresh { position: fixed; top: 24px; right: 24px; background: var(--accent); color: var(--bg); border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; }
.nav { margin-bottom: 16px; } .nav a { color: var(--accent); text-decoration: none; margin-left: 16px; }
</style>
</head>
<body>
<div class="nav"><a href="/">← Simulator</a> <a href="/dashboard">Dashboard</a></div>
<h1>📊 <span>WA Agency</span> Dashboard</h1>
<button class="refresh" onclick="load()">🔄 Refresh</button>

<div class="grid">
  <div class="card"><div class="card-label">Users</div><div class="card-value accent" id="users">—</div></div>
  <div class="card"><div class="card-label">Messages</div><div class="card-value green" id="msgs">—</div></div>
  <div class="card"><div class="card-label">Active Agents</div><div class="card-value" id="agentCount">—</div></div>
  <div class="card"><div class="card-label">Avg Response</div><div class="card-value" id="avgMs">—</div></div>
</div>

<div class="section">
  <h2>Agent Performance</h2>
  <table><thead><tr><th>Agent</th><th>Calls</th><th>Avg (ms)</th><th>Tokens</th><th>Distribution</th></tr></thead><tbody id="agentTable"></tbody></table>
</div>

<div class="section">
  <h2>Recent Messages</h2>
  <table><thead><tr><th>User</th><th>Dir</th><th>Agent</th><th>Message</th><th>Time</th></tr></thead><tbody id="recentTable"></tbody></table>
</div>

<script>
async function load() {
  const res = await fetch('/api/stats'); const d = await res.json()
  document.getElementById('users').textContent = d.totalUsers
  document.getElementById('msgs').textContent = d.totalMessages
  document.getElementById('agentCount').textContent = d.agentStats?.length || 0
  const totalCalls = d.agentStats?.reduce((s, a) => s + a.calls, 0) || 1
  const avgAll = d.agentStats?.reduce((s, a) => s + (a.avg_ms || 0) * a.calls, 0) / totalCalls
  document.getElementById('avgMs').textContent = Math.round(avgAll) + 'ms'

  document.getElementById('agentTable').innerHTML = (d.agentStats || []).map(a => {
    const pct = ((a.calls / totalCalls) * 100).toFixed(1)
    return '<tr><td><strong>' + a.agent + '</strong></td><td>' + a.calls + '</td><td>' + Math.round(a.avg_ms || 0) + '</td><td>' + (a.tokens || 0) + '</td><td><div class="bar"><div class="bar-fill" style="width:' + pct + '%"></div></div> ' + pct + '%</td></tr>'
  }).join('')

  document.getElementById('recentTable').innerHTML = (d.recentMessages || []).slice(0, 15).map(m => {
    const badge = m.direction === 'in' ? 'badge-in' : 'badge-out'
    const dir = m.direction === 'in' ? '← IN' : '→ OUT'
    const time = new Date(m.timestamp).toLocaleTimeString('en', {hour:'2-digit',minute:'2-digit'})
    return '<tr><td>' + (m.user_name || '—') + '</td><td><span class="badge ' + badge + '">' + dir + '</span></td><td>' + (m.agent || '—') + '</td><td>' + (m.content || '').substring(0, 60) + '</td><td>' + time + '</td></tr>'
  }).join('')
}
load(); setInterval(load, 5000)
</script>
</body>
</html>`
}
