// views/simulator.mjs — WhatsApp-style simulator UI
export function simulatorHTML() {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>WA Agency — Simulator</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg: #0b141a;
  --chat-bg: #0b141a;
  --incoming: #1f2c34;
  --outgoing: #005c4b;
  --text: #e9edef;
  --muted: #8696a0;
  --accent: #00a884;
  --border: #2a3942;
  --sidebar-bg: #111b21;
  --header-bg: #202c33;
}
body { font-family: -apple-system, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); height: 100vh; display: flex; }

.sidebar { width: 340px; background: var(--sidebar-bg); border-left: 1px solid var(--border); display: flex; flex-direction: column; }
.sidebar-header { padding: 16px; background: var(--header-bg); font-size: 18px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
.sidebar-header button { background: var(--accent); color: #fff; border: none; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; }
.contacts { flex: 1; overflow-y: auto; }
.contact { padding: 14px 16px; border-bottom: 1px solid var(--border); cursor: pointer; display: flex; align-items: center; gap: 12px; }
.contact:hover, .contact.active { background: #2a3942; }
.contact-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.contact-info { flex: 1; min-width: 0; }
.contact-name { font-size: 15px; font-weight: 500; }
.contact-last { font-size: 13px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.contact-meta { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.contact-time { font-size: 11px; color: var(--muted); }
.contact-badge { background: var(--accent); color: #fff; font-size: 11px; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; }

.chat-area { flex: 1; display: flex; flex-direction: column; }
.chat-header { padding: 12px 16px; background: var(--header-bg); display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border); }
.chat-header-name { font-size: 16px; font-weight: 500; }
.chat-header-status { font-size: 12px; color: var(--muted); }
.chat-header-agent { margin-right: auto; background: #1a3a2a; color: var(--accent); padding: 3px 10px; border-radius: 12px; font-size: 12px; }

.messages { flex: 1; overflow-y: auto; padding: 20px 60px; display: flex; flex-direction: column; gap: 4px; background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }

.msg { max-width: 65%; padding: 8px 12px; border-radius: 8px; font-size: 14.5px; line-height: 1.5; position: relative; word-wrap: break-word; white-space: pre-wrap; }
.msg.in { background: var(--incoming); align-self: flex-start; border-top-right-radius: 0; }
.msg.out { background: var(--outgoing); align-self: flex-end; border-top-left-radius: 0; }
.msg-time { font-size: 11px; color: var(--muted); margin-top: 4px; text-align: left; }
.msg-agent { font-size: 10px; color: var(--accent); margin-bottom: 2px; }
.msg-system { background: #182229; align-self: center; color: var(--muted); font-size: 12px; padding: 6px 16px; border-radius: 8px; }

.input-area { padding: 12px 16px; background: var(--header-bg); display: flex; gap: 10px; align-items: center; }
.input-area input { flex: 1; background: #2a3942; border: none; padding: 10px 16px; border-radius: 8px; color: var(--text); font-size: 14px; outline: none; }
.input-area button { background: var(--accent); border: none; width: 42px; height: 42px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.input-area button svg { fill: var(--bg); width: 20px; height: 20px; }

.stats-panel { padding: 16px; background: var(--sidebar-bg); border-top: 1px solid var(--border); }
.stat-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
.stat-label { color: var(--muted); }
.stat-value { color: var(--accent); font-weight: 600; }

.welcome { flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; color: var(--muted); }
.welcome h2 { color: var(--text); font-size: 28px; }

.typing { display: none; padding: 8px 16px; }
.typing.show { display: flex; align-items: center; gap: 8px; color: var(--accent); font-size: 13px; }
.typing-dots span { display: inline-block; width: 6px; height: 6px; background: var(--accent); border-radius: 50%; animation: bounce 1.4s infinite; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-8px); } }

@media (max-width: 768px) {
  .sidebar { width: 100%; position: absolute; z-index: 10; }
  .messages { padding: 16px; }
}
</style>
</head>
<body>
<div class="sidebar">
  <div class="sidebar-header">
    <span>📱 WA Agency</span>
    <button onclick="addPersona()">+ شخصية</button>
  </div>
  <div class="contacts" id="contacts"></div>
  <div class="stats-panel" id="statsPanel">
    <div class="stat-row"><span class="stat-label">Users</span><span class="stat-value" id="statUsers">0</span></div>
    <div class="stat-row"><span class="stat-label">Messages</span><span class="stat-value" id="statMsgs">0</span></div>
    <div class="stat-row"><span class="stat-label">Agents</span><span class="stat-value" id="statAgents">—</span></div>
  </div>
</div>

<div class="chat-area" id="chatArea">
  <div class="welcome" id="welcome">
    <h2>WA Agency Simulator</h2>
    <p>اختر شخصية من القائمة أو أضف واحدة جديدة</p>
  </div>
  <div class="chat-header" id="chatHeader" style="display:none">
    <div class="contact-avatar" id="chatAvatar">👤</div>
    <div>
      <div class="chat-header-name" id="chatName">—</div>
      <div class="chat-header-status" id="chatStatus">—</div>
    </div>
    <span class="chat-header-agent" id="chatAgent">—</span>
  </div>
  <div class="messages" id="messages" style="display:none"></div>
  <div class="typing" id="typing">
    <div class="typing-dots"><span></span><span></span><span></span></div>
    <span>يكتب...</span>
  </div>
  <div class="input-area" id="inputArea" style="display:none">
    <input type="text" id="msgInput" placeholder="اكتب رسالة..." autofocus>
    <button onclick="sendMsg()">
      <svg viewBox="0 0 24 24"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.239 1.816-13.239 1.817-.011 7.912z"/></svg>
    </button>
  </div>
</div>

<script>
let personas = [
  { phone: '966501001001', name: 'محمد', emoji: '👨‍💼', desc: 'رجل أعمال، الرياض' },
  { phone: '966501001002', name: 'نورة', emoji: '👩‍⚕️', desc: 'طبيبة، جدة' },
  { phone: '966501001003', name: 'فهد', emoji: '👨‍💻', desc: 'مبرمج، الدمام' },
  { phone: '966501001004', name: 'سارة', emoji: '👩‍🎓', desc: 'طالبة جامعية، الرياض' },
  { phone: '966501001005', name: 'عبدالله', emoji: '👨‍🏫', desc: 'معلم، أبها' },
  { phone: '966501001006', name: 'ريم', emoji: '👩‍🍳', desc: 'طباخة، المدينة' },
  { phone: '966501001007', name: 'خالد', emoji: '🧑‍✈️', desc: 'طيار، الرياض' },
  { phone: '966501001008', name: 'هند', emoji: '👩‍🎨', desc: 'مصممة، جدة' },
  { phone: '966501001009', name: 'سلطان', emoji: '👨‍🔧', desc: 'مهندس، الخبر' },
  { phone: '966501001010', name: 'لمى', emoji: '👩‍💻', desc: 'مطورة، الرياض' },
]
let activePhone = null, chatHistory = {}

renderContacts(); loadStats(); setInterval(loadStats, 10000)

function renderContacts() {
  const el = document.getElementById('contacts')
  el.innerHTML = personas.map(p => {
    const msgs = chatHistory[p.phone] || [], last = msgs[msgs.length - 1]
    return \`<div class="contact \${activePhone === p.phone ? 'active' : ''}" onclick="selectContact('\${p.phone}')">
      <div class="contact-avatar">\${p.emoji}</div>
      <div class="contact-info"><div class="contact-name">\${p.name}</div><div class="contact-last">\${last ? last.content.substring(0, 40) : p.desc}</div></div>
      <div class="contact-meta"><span class="contact-time">\${last ? new Date(last.time).toLocaleTimeString('ar-SA', {hour:'2-digit',minute:'2-digit'}) : ''}</span></div>
    </div>\`
  }).join('')
}

function selectContact(phone) {
  activePhone = phone; const p = personas.find(x => x.phone === phone)
  document.getElementById('welcome').style.display = 'none'
  document.getElementById('chatHeader').style.display = 'flex'
  document.getElementById('messages').style.display = 'flex'
  document.getElementById('inputArea').style.display = 'flex'
  document.getElementById('chatName').textContent = p.name
  document.getElementById('chatStatus').textContent = p.desc
  document.getElementById('chatAvatar').textContent = p.emoji
  document.getElementById('chatAgent').textContent = '—'
  renderMessages(); renderContacts(); loadHistory(phone)
  document.getElementById('msgInput').focus()
}

function renderMessages() {
  const el = document.getElementById('messages'), msgs = chatHistory[activePhone] || []
  el.innerHTML = msgs.map(m => {
    if (m.system) return \`<div class="msg msg-system">\${m.content}</div>\`
    return \`<div class="msg \${m.direction === 'in' ? 'out' : 'in'}">
      \${m.agent ? \`<div class="msg-agent">🤖 \${m.agent}</div>\` : ''}
      \${m.content}
      <div class="msg-time">\${new Date(m.time).toLocaleTimeString('ar-SA', {hour:'2-digit',minute:'2-digit'})}</div>
    </div>\`
  }).join('')
  el.scrollTop = el.scrollHeight
}

async function sendMsg() {
  const input = document.getElementById('msgInput'), text = input.value.trim()
  if (!text || !activePhone) return
  if (!chatHistory[activePhone]) chatHistory[activePhone] = []
  chatHistory[activePhone].push({ direction: 'in', content: text, time: new Date().toISOString() })
  renderMessages(); renderContacts(); input.value = ''
  document.getElementById('typing').classList.add('show')
  try {
    const res = await fetch('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: activePhone, text }) })
    const data = await res.json()
    document.getElementById('typing').classList.remove('show')
    chatHistory[activePhone].push({ direction: 'out', content: data.response || data.error, agent: data.agent, time: new Date().toISOString() })
    document.getElementById('chatAgent').textContent = data.agent || '—'
    renderMessages(); renderContacts()
  } catch (e) {
    document.getElementById('typing').classList.remove('show')
    chatHistory[activePhone].push({ direction: 'out', content: '❌ خطأ في الاتصال', time: new Date().toISOString(), system: true })
    renderMessages()
  }
}

async function loadHistory(phone) {
  try { const res = await fetch('/api/messages/' + phone); const data = await res.json()
    if (data.messages?.length) { chatHistory[phone] = data.messages.map(m => ({ direction: m.direction, content: m.content, agent: m.agent, time: m.timestamp })); renderMessages() }
  } catch {}
}

async function loadStats() {
  try { const res = await fetch('/api/stats'); const d = await res.json()
    document.getElementById('statUsers').textContent = d.totalUsers; document.getElementById('statMsgs').textContent = d.totalMessages
    document.getElementById('statAgents').textContent = d.agentStats?.map(a => a.agent).join(', ') || '—'
  } catch {}
}

function addPersona() {
  const name = prompt('اسم الشخصية:'); if (!name) return
  const desc = prompt('وصف (مثل: طبيب، الرياض):') || ''
  const phone = '966501' + String(Math.random()).slice(2, 8) + String(Date.now()).slice(-2)
  const emojis = ['👤','👨','👩','🧑','👨‍💼','👩‍💼','👨‍💻','👩‍💻']
  personas.push({ phone, name, emoji: emojis[Math.floor(Math.random()*emojis.length)], desc }); renderContacts()
}

document.getElementById('msgInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendMsg() })
</script>
</body>
</html>`
}
