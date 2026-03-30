// scripts/test-oss120b.mjs — Same questions, new personas, oss-120b model
// Exact same messages as test-personas.mjs but with new phone numbers + names

const API = 'http://localhost:3201/api/send'

const personas = [
  {
    phone: '966502001001', name: 'أحمد', desc: 'رجل أعمال',
    messages: [
      'السلام عليكم',
      'أحمد الراشد',
      'الرياض',
      'كم سعر الذهب؟',
      'سعر البتكوين',
      'سعر الدولار بالريال',
      'صباح الخير',
      'ابحث عن الذكاء الاصطناعي',
      'وش يعني blockchain',
      'اكتب لي إيميل اعتذار عن تأخر اجتماع',
      'اكتب تغريدة عن ريادة الأعمال',
      'ترجم Hello, how are you?',
      'كيو ار https://example.com',
      'حول 100 دولار لريال',
      'كيف حالك؟',
      'وش أخبارك؟',
      'ابحث عن أفضل مطاعم الرياض',
      'اكتب رسالة تهنئة بالترقية',
      'سعر اليورو',
      'وش الفرق بين ChatGPT و Claude',
      'اكتب لي سيرة ذاتية مختصرة',
      'صباح النور',
      'سعر النفط اليوم',
      'ترجم شكراً جزيلاً لتعاونكم',
      'من هو إيلون ماسك',
      'اكتب بوست لينكد إن عن التحول الرقمي',
      'وش رأيك بالسوق السعودي؟',
      'حول 50 يورو لريال',
      'ابحث عن رؤية 2030',
      'مشكور على المساعدة',
      'تقرير يومي',
    ]
  },
  {
    phone: '966502001002', name: 'أمل', desc: 'طبيبة',
    messages: [
      'مرحبا',
      'أمل الشمري',
      'جدة',
      'ابحث عن آخر أبحاث الذكاء الاصطناعي في الطب',
      'سعر الذهب اليوم',
      'اكتب إيميل لمريض عن موعد مراجعة',
      'ترجم Patient follow-up appointment scheduled',
      'صباح الخير',
      'وش يعني telemedicine',
      'كيو ار https://hospital.sa/appointment',
      'اكتب رسالة شكر لفريق العمل',
      'سعر البتكوين',
      'من هو أبو بكر الرازي',
      'ابحث عن أعراض نقص فيتامين D',
      'حول 200 دولار لريال',
      'اكتب مقال قصير عن الصحة النفسية',
      'وش أخبار كورونا',
      'ترجم The surgery was successful',
      'سعر الفضة',
      'اكتب تغريدة عن أهمية الفحص الدوري',
      'كم سعر الدولار',
      'ابحث عن أفضل مستشفيات جدة',
      'صباح النور يا وكيل',
      'اكتب رسالة اعتذار عن إلغاء موعد',
      'حول 1000 ريال لدولار',
      'وش يعني AI diagnostics',
      'سعر سهم أرامكو',
      'اكتب بوست عن يوم الطبيب العالمي',
      'ابحث عن منح دراسية طبية',
      'شكراً وكيل',
      'تقرير يومي',
    ]
  },
  {
    phone: '966502001003', name: 'راشد', desc: 'مبرمج',
    messages: [
      'هلا',
      'راشد المالكي',
      'الدمام',
      'ابحث عن أفضل لغات البرمجة 2026',
      'وش يعني Rust ownership',
      'اكتب لي README لمشروع Node.js',
      'سعر البتكوين',
      'ترجم This function handles authentication',
      'صباح الخير',
      'كيو ار https://github.com/myproject',
      'وش الفرق بين REST و GraphQL',
      'اكتب إيميل لعميل عن تأخر المشروع',
      'سعر الإيثيريوم',
      'ابحث عن أفضل أدوات DevOps',
      'حول 500 دولار لريال',
      'اكتب تغريدة عن البرمجة',
      'وش يعني WebAssembly',
      'سعر الذهب',
      'ترجم Deploy the application to production',
      'اكتب مقال عن مستقبل الذكاء الاصطناعي',
      'من هو لينوس تورفالدز',
      'ابحث عن وظائف برمجة عن بعد',
      'كيف أتعلم Kubernetes',
      'اكتب رسالة لزميل عن code review',
      'سعر الدولار',
      'صباح النور',
      'ابحث عن أفضل مكتبات Python للـ AI',
      'حول 1000 يورو لدولار',
      'اكتب بوست لينكد إن عن تجربتي كمبرمج',
      'وش أفضل IDE للبرمجة',
      'تقرير يومي',
    ]
  },
  {
    phone: '966502001004', name: 'دانة', desc: 'طالبة جامعية',
    messages: [
      'هاي',
      'دانة الحربي',
      'الرياض',
      'ابحث عن تخصصات المستقبل',
      'وش يعني machine learning',
      'اكتب لي مقدمة بحث عن الطاقة المتجددة',
      'صباح الخير',
      'سعر الذهب',
      'ترجم Sustainable development goals',
      'كيو ار https://university.edu.sa',
      'اكتب إيميل لدكتور عن تأجيل تسليم واجب',
      'ابحث عن منح دراسية في أمريكا',
      'حول 10000 ريال لدولار',
      'وش الفرق بين الماجستير والدكتوراه',
      'اكتب ملخص عن التغير المناخي',
      'سعر البتكوين',
      'ترجم I would like to apply for a scholarship',
      'ابحث عن أفضل جامعات السعودية',
      'اكتب تغريدة عن الحياة الجامعية',
      'من هي زها حديد',
      'وش يعني GPA',
      'اكتب رسالة تحفيزية',
      'صباح النور',
      'ابحث عن دورات مجانية أونلاين',
      'سعر الدولار',
      'اكتب بوست عن التخرج',
      'حول 5000 دولار لريال',
      'ترجم Research methodology',
      'وش أفضل تطبيقات الدراسة',
      'شكراً يا وكيل',
      'تقرير يومي',
    ]
  },
  {
    phone: '966502001005', name: 'تركي', desc: 'معلم',
    messages: [
      'السلام عليكم ورحمة الله',
      'تركي الحارثي',
      'أبها',
      'ابحث عن أساليب التعليم الحديثة',
      'اكتب خطة درس عن الكسور',
      'صباح الخير',
      'سعر الذهب',
      'وش يعني gamification في التعليم',
      'ترجم Student-centered learning',
      'كيو ار https://school.sa/homework',
      'اكتب رسالة لأولياء الأمور عن اجتماع',
      'ابحث عن تطبيقات تعليمية للأطفال',
      'حول 300 دولار لريال',
      'اكتب إيميل للإدارة عن مقترح تطوير',
      'سعر البتكوين',
      'وش الفرق بين التعليم المدمج والتقليدي',
      'ترجم Assessment rubric',
      'اكتب تغريدة عن يوم المعلم',
      'ابحث عن استراتيجيات إدارة الصف',
      'من هو ابن خلدون',
      'اكتب ملخص عن أهمية القراءة',
      'صباح النور',
      'سعر الدولار',
      'ابحث عن ألعاب تعليمية رياضيات',
      'اكتب رسالة تشجيع لطالب',
      'حول 100 يورو لريال',
      'وش أفضل منصات التعليم عن بعد',
      'اكتب بوست عن التعليم في السعودية',
      'ترجم Differentiated instruction',
      'سعر سهم المراعي',
      'تقرير يومي',
    ]
  },
  {
    phone: '966502001006', name: 'جواهر', desc: 'طباخة',
    messages: [
      'هلا والله',
      'جواهر العمري',
      'المدينة',
      'ابحث عن وصفة كبسة لحم',
      'اكتب قائمة مقادير لكيكة شوكولاتة',
      'صباح الخير',
      'سعر الذهب',
      'ترجم Season the chicken with salt and pepper',
      'وش يعني sous vide',
      'كيو ار https://myrecipes.sa',
      'اكتب بوست إنستغرام عن طبخة اليوم',
      'ابحث عن بدائل صحية للسكر',
      'حول 50 دولار لريال',
      'اكتب وصفة مندي يمني',
      'سعر الزعفران',
      'وش الفرق بين الطبخ والخبز',
      'ابحث عن أشهر الأطباق السعودية',
      'اكتب إيميل لمورد عن طلب مواد',
      'ترجم Preheat the oven to 180 degrees',
      'سعر الدولار',
      'اكتب قائمة مشتريات لحفلة 20 شخص',
      'صباح النور',
      'ابحث عن دورات طبخ في المدينة',
      'اكتب رسالة لعميل عن كاترينج',
      'حول 200 ريال لدولار',
      'من هو جوردون رامزي',
      'وش أفضل أنواع الأرز للكبسة',
      'اكتب تغريدة عن الطبخ السعودي',
      'سعر البتكوين',
      'ابحث عن مطابخ سحابية',
      'تقرير يومي',
    ]
  },
  {
    phone: '966502001007', name: 'بندر', desc: 'طيار',
    messages: [
      'يا هلا',
      'بندر السهلي',
      'الرياض',
      'ابحث عن أحوال الطقس في دبي',
      'سعر النفط اليوم',
      'اكتب إيميل لشركة طيران عن إجازة',
      'صباح الخير',
      'ترجم Flight plan approved for departure',
      'وش يعني turbulence',
      'كيو ار https://airline.sa/schedule',
      'ابحث عن أفضل شركات الطيران 2026',
      'سعر الذهب',
      'حول 2000 دولار لريال',
      'اكتب رسالة لطاقم الطائرة',
      'وش الفرق بين بوينغ وإيرباص',
      'ابحث عن رحلات رخيصة من الرياض لإسطنبول',
      'سعر البتكوين',
      'ترجم Altitude 35000 feet, speed 900 km/h',
      'اكتب تغريدة عن حياة الطيار',
      'من هي أول طيارة سعودية',
      'سعر الدولار',
      'صباح النور',
      'ابحث عن متطلبات رخصة الطيران',
      'اكتب بوست عن سفر',
      'حول 500 يورو لريال',
      'وش أفضل مطارات العالم',
      'اكتب إيميل اعتذار عن تأخر رحلة',
      'ابحث عن تقنيات الطيران الحديثة',
      'ترجم Emergency landing procedures',
      'سعر الفضة',
      'تقرير يومي',
    ]
  },
  {
    phone: '966502001008', name: 'وجدان', desc: 'مصممة',
    messages: [
      'مرحبا يا وكيل',
      'وجدان الزهراني',
      'جدة',
      'ابحث عن ترندات التصميم 2026',
      'وش يعني UX design',
      'اكتب بريف تصميم لتطبيق توصيل',
      'صباح الخير',
      'سعر الذهب',
      'ترجم User interface mockup',
      'كيو ار https://portfolio.hind.sa',
      'اكتب إيميل لعميل عن عرض سعر تصميم',
      'ابحث عن أفضل أدوات التصميم',
      'حول 800 دولار لريال',
      'وش الفرق بين UI و UX',
      'اكتب تغريدة عن التصميم الإبداعي',
      'سعر البتكوين',
      'ابحث عن خطوط عربية مجانية',
      'من هو ديتر رامز',
      'اكتب رسالة لزميل عن فيدباك تصميم',
      'ترجم Color palette and typography guide',
      'سعر الدولار',
      'صباح النور',
      'اكتب مقال عن أهمية التصميم البصري',
      'ابحث عن مسابقات تصميم',
      'حول 150 يورو لريال',
      'وش أفضل ألوان للتطبيقات الطبية',
      'اكتب بوست لينكد إن عن شغلي كمصممة',
      'سعر الإيثيريوم',
      'ابحث عن وظائف تصميم عن بعد',
      'ترجم Responsive design principles',
      'تقرير يومي',
    ]
  },
  {
    phone: '966502001009', name: 'ماجد', desc: 'مهندس',
    messages: [
      'السلام عليكم',
      'ماجد الثبيتي',
      'الخبر',
      'ابحث عن مشاريع نيوم',
      'سعر الحديد اليوم',
      'اكتب إيميل لمقاول عن تأخر مشروع',
      'صباح الخير',
      'وش يعني BIM في الهندسة',
      'ترجم Structural analysis report',
      'كيو ار https://project.sa/site-report',
      'ابحث عن معايير البناء السعودية',
      'سعر الذهب',
      'حول 5000 دولار لريال',
      'اكتب رسالة لفريق العمل عن السلامة',
      'وش الفرق بين الخرسانة والحديد',
      'سعر البتكوين',
      'ابحث عن شركات مقاولات الشرقية',
      'اكتب تقرير مختصر عن تقدم مشروع',
      'ترجم Project completion milestone',
      'من هو زها حديد',
      'سعر الدولار',
      'صباح النور',
      'اكتب تغريدة عن الهندسة السعودية',
      'ابحث عن تقنيات البناء الحديثة',
      'حول 1000 ريال ليورو',
      'وش أفضل برامج التصميم الهندسي',
      'اكتب بوست عن رؤية 2030 والبناء',
      'سعر النفط',
      'ابحث عن معارض بناء في السعودية',
      'ترجم Quality assurance inspection',
      'تقرير يومي',
    ]
  },
  {
    phone: '966502001010', name: 'رزان', desc: 'مطورة',
    messages: [
      'هاي وكيل',
      'رزان الخالدي',
      'الرياض',
      'ابحث عن أفضل إطارات الويب 2026',
      'وش يعني serverless',
      'اكتب لي وصف وظيفي لمطور Full Stack',
      'صباح الخير',
      'سعر البتكوين',
      'ترجم Continuous integration pipeline',
      'كيو ار https://github.com/lama-dev',
      'اكتب إيميل لمديري عن ترقية',
      'ابحث عن مجتمعات برمجة نسائية',
      'حول 700 دولار لريال',
      'وش الفرق بين SQL و NoSQL',
      'اكتب تغريدة تقنية عن TypeScript',
      'سعر الذهب',
      'ابحث عن هاكاثونات في السعودية',
      'من هي مريم المزروعي',
      'اكتب مقال عن المرأة في التقنية',
      'ترجم Agile sprint retrospective',
      'سعر الدولار',
      'صباح النور',
      'اكتب رسالة لفريق عن standup meeting',
      'ابحث عن رواتب المبرمجين في السعودية',
      'حول 3000 ريال لدولار',
      'وش أفضل خدمات الكلاود',
      'اكتب بوست لينكد إن عن التعلم الذاتي',
      'سعر الإيثيريوم',
      'ابحث عن أفضل مصادر تعلم React',
      'ترجم Code review best practices',
      'تقرير يومي',
    ]
  },
]

// ─── Run Tests ───────────────────────────

const results = {
  total: 0, success: 0, errors: [],
  agentCounts: {}, avgMs: [], byPersona: {},
}

async function send(phone, text) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, text }),
  })
  return res.json()
}

async function testPersona(persona) {
  const personaResult = { success: 0, errors: 0, messages: [] }
  console.log(`\n👤 ${persona.name} (${persona.desc}) — ${persona.messages.length} messages`)

  for (const msg of persona.messages) {
    results.total++
    try {
      const data = await send(persona.phone, msg)
      if (data.error && !data.response) {
        results.errors.push({ persona: persona.name, msg, error: data.error })
        personaResult.errors++
        process.stdout.write('❌')
      } else {
        results.success++
        personaResult.success++
        const agent = data.agent || 'unknown'
        results.agentCounts[agent] = (results.agentCounts[agent] || 0) + 1
        if (data.ms) results.avgMs.push(data.ms)
        personaResult.messages.push({ msg, agent, ms: data.ms, responseLen: data.response?.length })
        process.stdout.write('✅')
      }
    } catch (e) {
      results.errors.push({ persona: persona.name, msg, error: e.message })
      personaResult.errors++
      process.stdout.write('💥')
    }
    await new Promise(r => setTimeout(r, 500))
  }

  results.byPersona[persona.name] = personaResult
  console.log(` — ✅ ${personaResult.success}/${persona.messages.length}`)
}

async function main() {
  console.log('═══════════════════════════════════════════')
  console.log('  WA Agency — OSS-120B Model Test')
  console.log(`  Model: openai/gpt-oss-120b`)
  console.log(`  ${personas.length} personas × ~31 messages each`)
  console.log('═══════════════════════════════════════════')

  const startTime = Date.now()

  for (const persona of personas) {
    await testPersona(persona)
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)
  const avgMs = results.avgMs.length ? Math.round(results.avgMs.reduce((a,b) => a+b, 0) / results.avgMs.length) : 0

  console.log('\n\n═══════════════════════════════════════════')
  console.log('  RESULTS — openai/gpt-oss-120b')
  console.log('═══════════════════════════════════════════')
  console.log(`  Total:     ${results.total} messages`)
  console.log(`  Success:   ${results.success} ✅`)
  console.log(`  Errors:    ${results.errors.length} ❌`)
  console.log(`  Rate:      ${((results.success/results.total)*100).toFixed(1)}%`)
  console.log(`  Avg Time:  ${avgMs}ms`)
  console.log(`  Total Time: ${totalTime}s`)
  console.log('───────────────────────────────────────────')
  console.log('  Agent Distribution:')
  for (const [agent, count] of Object.entries(results.agentCounts).sort((a,b) => b[1]-a[1])) {
    const pct = ((count / results.success) * 100).toFixed(1)
    console.log(`    ${agent.padEnd(15)} ${String(count).padStart(4)} (${pct}%)`)
  }

  if (results.errors.length) {
    console.log('───────────────────────────────────────────')
    console.log('  Errors:')
    for (const e of results.errors.slice(0, 10)) {
      console.log(`    ${e.persona}: "${e.msg}" → ${e.error}`)
    }
    if (results.errors.length > 10) console.log(`    ... and ${results.errors.length - 10} more`)
  }

  console.log('═══════════════════════════════════════════\n')

  // Save results
  const fs = await import('fs')
  fs.writeFileSync('data/test-oss120b-results.json', JSON.stringify(results, null, 2))
  console.log('📄 Results saved to data/test-oss120b-results.json')
}

main().catch(console.error)
