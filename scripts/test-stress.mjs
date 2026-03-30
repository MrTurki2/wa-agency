// scripts/test-stress.mjs — Stress test: rapid-fire messages + edge cases
const API = 'http://localhost:3201/api/send'

async function send(phone, text) {
  const start = Date.now()
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, text }),
  })
  const data = await res.json()
  return { ...data, roundTrip: Date.now() - start }
}

const edgeCases = [
  // Empty/weird inputs
  { phone: '966501001001', text: ' ' },
  { phone: '966501001001', text: '...' },
  { phone: '966501001001', text: '😂😂😂' },
  { phone: '966501001001', text: 'a' },

  // Very long message
  { phone: '966501001001', text: 'ابحث عن '.repeat(50) },

  // Mixed language
  { phone: '966501001001', text: 'I want to know the price of gold بالريال السعودي' },

  // Numbers only
  { phone: '966501001001', text: '12345' },

  // Math edge cases
  { phone: '966501001001', text: '0 ÷ 0' },
  { phone: '966501001001', text: '999999 × 999999' },

  // Rapid same question
  { phone: '966501001002', text: 'سعر الذهب' },
  { phone: '966501001003', text: 'سعر الذهب' },
  { phone: '966501001004', text: 'سعر الذهب' },

  // Chained requests
  { phone: '966501001005', text: 'ذكرني أروح الدكتور' },
  { phone: '966501001005', text: 'ذكرني أشتري حليب' },
  { phone: '966501001005', text: 'ذكرني أدفع الفاتورة' },
  { phone: '966501001005', text: 'مهامي' },

  // Special characters
  { phone: '966501001001', text: '<script>alert("xss")</script>' },
  { phone: '966501001001', text: "SELECT * FROM users; DROP TABLE users;--" },

  // New user registration
  { phone: '966509999999', text: 'هلا' },
  { phone: '966509999999', text: 'اختبار الضغط' },
  { phone: '966509999999', text: 'تست سيتي' },
]

console.log('═══════════════════════════════════════════')
console.log('  Stress Test — Edge Cases & Rapid Fire')
console.log('═══════════════════════════════════════════\n')

let pass = 0, fail = 0, times = []

for (const t of edgeCases) {
  try {
    const data = await send(t.phone, t.text)
    times.push(data.roundTrip)
    if (data.response || data.error) {
      pass++
      process.stdout.write('✅')
    } else {
      fail++
      process.stdout.write('❌')
    }
  } catch (e) {
    fail++
    process.stdout.write('💥')
    console.log(` Error: ${e.message}`)
  }
  await new Promise(r => setTimeout(r, 200))
}

// Concurrent test: 5 messages at once
console.log('\n\n--- Concurrent Test (5 simultaneous) ---')
const concurrent = await Promise.all([
  send('966501001001', 'سعر البتكوين'),
  send('966501001002', 'نكتة'),
  send('966501001003', 'صباح الخير'),
  send('966501001004', 'احسب 50 × 10'),
  send('966501001005', 'ترجم hello world'),
])

for (const r of concurrent) {
  times.push(r.roundTrip)
  if (r.response) { pass++; process.stdout.write('✅') }
  else { fail++; process.stdout.write('❌') }
}

const avgMs = Math.round(times.reduce((a,b) => a+b, 0) / times.length)
const maxMs = Math.max(...times)
const minMs = Math.min(...times)

console.log(`\n\n═══════════════════════════════════════════`)
console.log(`  Results: ✅ ${pass}  ❌ ${fail}`)
console.log(`  Timing:  avg=${avgMs}ms  min=${minMs}ms  max=${maxMs}ms`)
console.log(`═══════════════════════════════════════════\n`)
