// scripts/test-advanced.mjs — Test new features: summary, reminder, calculator, help
const API = 'http://localhost:3201/api/send'

async function send(phone, text) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, text }),
  })
  return res.json()
}

const tests = [
  // Help menu
  { phone: '966501001001', text: 'مساعدة', expect: 'help' },
  { phone: '966501001001', text: '?', expect: 'help' },

  // Calculator
  { phone: '966501001001', text: 'احسب 150 × 3.75', expect: 'calculator' },
  { phone: '966501001001', text: '100 + 200', expect: 'calculator' },
  { phone: '966501001001', text: 'كم يساوي 15% من 1000', expect: 'calculator' },

  // Reminder
  { phone: '966501001002', text: 'ذكرني أتصل بأحمد بكرة', expect: 'reminder' },
  { phone: '966501001002', text: 'مهمة تسليم التقرير', expect: 'reminder' },
  { phone: '966501001002', text: 'مهامي', expect: 'reminder' },

  // Summary
  { phone: '966501001003', text: 'لخص الذكاء الاصطناعي هو فرع من علوم الحاسوب يهدف إلى إنشاء أنظمة قادرة على أداء مهام تتطلب ذكاءً بشرياً مثل التعلم والاستدلال والإدراك واتخاذ القرارات', expect: 'summary' },

  // Edge cases
  { phone: '966501001004', text: 'قائمة', expect: 'help' },
  { phone: '966501001005', text: '500 ÷ 4', expect: 'calculator' },
  { phone: '966501001006', text: 'فكرني أروح السوق اليوم', expect: 'reminder' },
]

let success = 0
let fail = 0

console.log('═══════════════════════════════════════════')
console.log('  Advanced Features Test')
console.log('═══════════════════════════════════════════\n')

for (const t of tests) {
  const data = await send(t.phone, t.text)
  const got = data.agent || 'error'
  const ok = got === t.expect
  console.log(`${ok ? '✅' : '❌'} "${t.text.substring(0, 30)}..." → ${got} (expected: ${t.expect})`)
  if (!ok) {
    console.log(`   Response: ${data.response?.substring(0, 80)}...`)
    fail++
  } else {
    success++
  }
  await new Promise(r => setTimeout(r, 300))
}

console.log(`\n───────────────────────────────────────────`)
console.log(`  ✅ ${success}  ❌ ${fail}  Total: ${tests.length}`)
console.log('═══════════════════════════════════════════\n')
