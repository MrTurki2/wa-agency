// scripts/test-all-agents.mjs — Comprehensive test of all 13 agents
const API = 'http://localhost:3201/api/send'

async function send(phone, text) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, text }),
  })
  return res.json()
}

// Use existing registered user
const phone = '966501001001'

const tests = [
  // All agents
  { text: 'مساعدة', agent: 'help', desc: 'Help menu' },
  { text: 'كم سعر الذهب', agent: 'price', desc: 'Gold price' },
  { text: 'سعر البتكوين', agent: 'price', desc: 'Bitcoin price' },
  { text: 'طقس الرياض', agent: 'weather', desc: 'Weather' },
  { text: 'صباح الخير', agent: 'morning', desc: 'Morning briefing' },
  { text: 'ابحث عن رؤية 2030', agent: 'search', desc: 'Search' },
  { text: 'وش يعني API', agent: 'search', desc: 'Definition' },
  { text: 'اكتب تغريدة عن القهوة', agent: 'creative', desc: 'Creative' },
  { text: 'اكتب إيميل اعتذار', agent: 'creative', desc: 'Email' },
  { text: 'لخص التعلم الآلي هو مجال يهتم بتطوير أنظمة تتعلم من البيانات', agent: 'summary', desc: 'Summarize' },
  { text: 'ذكرني أسوي اجتماع بكرة', agent: 'reminder', desc: 'Reminder' },
  { text: 'مهامي', agent: 'reminder', desc: 'Task list' },
  { text: 'احسب 250 × 4', agent: 'calculator', desc: 'Calculator' },
  { text: '15 + 28', agent: 'calculator', desc: 'Math' },
  { text: 'أخبار التقنية', agent: 'news', desc: 'News' },
  { text: 'نكتة', agent: 'joke', desc: 'Joke' },
  { text: 'حزورة', agent: 'joke', desc: 'Riddle' },
  { text: 'ترجم Good morning', agent: 'tools', desc: 'Translate' },
  { text: 'كيو ار https://test.com', agent: 'tools', desc: 'QR Code' },
  { text: 'حول 100 دولار لريال', agent: 'tools', desc: 'Convert' },
  { text: 'كيف حالك يا وكيل؟', agent: 'general', desc: 'General chat' },
]

console.log('═══════════════════════════════════════════════════')
console.log('  All-Agents Comprehensive Test')
console.log(`  ${tests.length} tests across all agent types`)
console.log('═══════════════════════════════════════════════════\n')

let pass = 0, fail = 0
const agentHits = {}

for (const t of tests) {
  const data = await send(phone, t.text)
  const got = data.agent || 'error'
  const ok = got === t.agent
  agentHits[got] = (agentHits[got] || 0) + 1

  const status = ok ? '✅' : '❌'
  const respPreview = (data.response || '').substring(0, 60).replace(/\n/g, ' ')
  console.log(`${status} [${t.desc.padEnd(15)}] "${t.text.substring(0, 25).padEnd(25)}" → ${got.padEnd(12)} | ${respPreview}`)

  if (!ok) {
    console.log(`   ⚠️  Expected: ${t.agent}`)
    fail++
  } else {
    pass++
  }
  await new Promise(r => setTimeout(r, 800))
}

console.log('\n═══════════════════════════════════════════════════')
console.log(`  Results: ✅ ${pass}  ❌ ${fail}  Total: ${tests.length}`)
console.log(`  Success rate: ${((pass/tests.length)*100).toFixed(1)}%`)
console.log('───────────────────────────────────────────────────')
console.log('  Agent coverage:')
for (const [a, c] of Object.entries(agentHits).sort((a,b) => b[1]-a[1])) {
  console.log(`    ${a.padEnd(12)} ${c}`)
}
console.log('═══════════════════════════════════════════════════\n')
