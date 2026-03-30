# Codebase Index — فهرسة المشاريع والخدمات

> فهرس شامل لجميع المشاريع والخدمات والأنماط في `/Users/mrturki/Code` التي يمكن استخدامها في بناء وكلاء WA Agency

---

## 📋 الفهرس السريع

| الفئة | المشروع | الاستخدام | الأولوية |
|-------|---------|-----------|---------|
| **WhatsApp** | WA Business | الاتصال الرسمي | 🔴 عالي |
| **Agents** | Agent-to-Agent | بنية المراسلة | 🔴 عالي |
| **Agents** | Agents Lab | وكلاء جاهزة | 🟠 متوسط |
| **Automation** | n8n | تنفيذ المهام | 🟠 متوسط |
| **Observability** | SignOz + Grafana | المراقبة | 🟡 اختياري |
| **Browser** | Browser-Agents | أتمتة ويب | 🟡 اختياري |

---

## 🟢 المشاريع ذات الأولوية العالية

### 1. WhatsApp Business Integration
**المسار:** `/Users/mrturki/Code/nodejs/WhatsApp-Business/`

```
API Options:
├── Meta Cloud API (الرسمي) ✅
│   └── ~$0.05/conversation, requires business verification
├── Zoko BSP (الأسهل) ✅ ← RECOMMENDED FOR MVP
│   └── No phone verification needed, faster setup
└── Baileys (الحر) ⚠️
    └── Works but risky for production, can get banned

File Structure:
├── README.md (comprehensive guide)
├── docs/META-GUIDE.md
├── docs/ZOKO-GUIDE.md
├── webhook/ (Cloudflare Worker integration)
├── ai-backend/ (Groq API integration)
└── tests/ (example payloads)
```

**للاستخدام الفوري:**
```javascript
// From: /Users/mrturki/Code/nodejs/WhatsApp-Business/
const wa = require('./src/whatsapp-api');
const groq = require('./src/groq-agent');

wa.onMessage(async (msg) => {
  const response = await groq.process(msg);
  await wa.sendMessage(msg.from, response);
});
```

**الملفات المهمة:**
- `docs/ZOKO-GUIDE.md` — خطوة بخطوة للإعداد السريع
- `docs/META-GUIDE.md` — للإنتاج النهائي
- `webhook/cloudflare-worker.js` — تكامل نقطة النهاية

---

### 2. Agent-to-Agent Message Bus
**المسار:** `/Users/mrturki/Code/R-D/agent-to-agent/`

```
Architecture:
┌─────────────────────────────────┐
│      SQLite Message Bus         │
├──────┬──────┬──────┬────────────┤
│Scout │Think │Write │Reviewer|Coord
│(60s) │(10s) │(10s) │(10s)|(30s)
└──────┴──────┴──────┴────────────┘
     ↓
 Dashboard (http://localhost:3260)
 Real-time D3.js visualization
```

**الاستخدام:**
```javascript
// From: /Users/mrturki/Code/R-D/agent-to-agent/
import { Database } from 'better-sqlite3';
import { Groq } from '@groq/sdk';

const db = new Database('agents.db');

// Define agent
class MyAgent {
  async process(message) {
    const response = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: message.prompt }],
    });
    // Post result to SQLite bus
    db.exec(`INSERT INTO messages (from, to, type, content)
             VALUES ('my-agent', '${message.to}', '${message.type}', '${response}')`);
  }
}
```

**الملفات المهمة:**
- `CLAUDE.md` — Protocol & architecture
- `docs/a2a-protocol-guide.md` — Message format spec
- `src/agents/` — Agent implementations (Scout, Thinker, Writer, Reviewer)
- `src/db.js` — SQLite schema & queries
- `src/dashboard.js` — Real-time monitoring

**الفائدة الكبرى:** بنية جاهزة للتنسيق بين الوكلاء بدون تعقيد

---

### 3. Agents Lab — وكلاء جاهزة
**المسار:** `/Users/mrturki/Code/R-D/Fail-fast/agents-lab/`

```
Ready-to-use Agents:
├── 🔍 War Room (real-time coordination)
├── 📸 Photo Intel (image analysis via Claude)
├── 🎙️ Voice Chat (Groq Whisper + LLM)
├── 📹 Video Summary (frame extraction + analysis)
├── ⚡ LLM Arena (model benchmarking)
├── 📰 Morning Briefing (news + weather aggregation)
└── 🔎 Smart Search (web search + synthesis)

npm scripts:
$ npm run warroom      # Coordination hub
$ npm run photo       # Image analysis
$ npm run voice       # Audio processing
$ npm run video       # Video summarization
$ npm run arena       # Model comparison
$ npm run morning     # Daily briefing
$ npm run search      # Web research
```

**الملفات:**
```
agents-lab/
├── warroom.mjs (coordination example)
├── photo-intel.mjs (Claude vision API)
├── voice-chat.mjs (Whisper + chat)
├── video-summary.mjs (frame analysis)
├── llm-arena.mjs (model benchmarks)
├── morning-briefing.mjs ← CAN REUSE
└── smart-search.mjs (web search)
```

**الاستخدام المباشر:**
```bash
# اسخ morning-briefing.mjs لـ WA Agency
cp agents-lab/morning-briefing.mjs wa-agency/src/agents/morning.mjs
# عدّل ليناسب الصيغة الجديدة
```

---

## 🟠 المشاريع ذات الأولوية المتوسطة

### 4. n8n — طبقة التنفيذ
**المسار:** `/Users/mrturki/Code/R-D/Fail-fast/n8n/`

```
Environments:
├── Local (development)
│   └── http://localhost:5678
├── Production (docker2026)
│   └── https://ti-n8n.tj.sa
└── Cloud (optional)
    └── https://mrturki.app.n8n.cloud

Available Integrations (400+):
├── Email (Gmail, Outlook)
├── Chat (Slack, Telegram, Discord)
├── Sheets (Google, Excel)
├── Storage (Google Drive, S3)
├── APIs (HTTP, Webhooks)
└── Custom (Code nodes, Expression)
```

**متى تستخدم n8n من داخل WA Agency:**
- Secretary Agent يحتاج إرسال إيميل ✅
- Morning Agent يحتاج جلب بيانات من APIs ✅
- Analyzer Agent يحتاج حفظ نتائج في Sheets ✅
- Custom integrations مع ERPs ✅

**مثال: إرسال إيميل من Secretary Agent**
```javascript
// From: src/agents/secretary.ts
import axios from 'axios';

async function sendEmail(to, subject, body) {
  const workflow = {
    type: 'form',
    formData: { to, subject, body }
  };
  const result = await axios.post(
    'http://localhost:5678/webhook/email-workflow',
    workflow
  );
  return result.data;
}
```

**الملفات المهمة:**
- `README.md` — Setup & MCP integration
- `docs/SDK-REFERENCE.md` — Workflow SDK syntax
- `examples/` — Example workflows (Gmail, Slack, etc.)

**الفائدة:** 400+ integration بدون الحاجة لكود معقد

---

### 5. Mastra Agent Framework
**المسار:** `/Users/mrturki/Code/R-D/Fail-fast/Mastra/`

```
Agents in Mastra:
├── Content Scout (data gathering)
├── Content Writer (creation)
├── Art Director (design decisions)
├── Template Designer (layouts)
├── Content Reviewer (QA)
└── Composer (orchestration)

Tech Stack:
├── @mastra/core (orchestration)
├── @ai-sdk/groq (fast LLM)
├── Puppeteer (web automation)
├── Zod (schema validation)
└── Better-sqlite3 (persistence)
```

**الفائدة:** إذا احتجت pipeline معقد متعدد الخطوات (مثل تحليل + كتابة + تدقيق)

---

## 🟡 المشاريع الاختيارية (Phase 2+)

### 6. Browser-Agents
**المسار:** `/Users/mrturki/Code/R-D/Browser-Agents/`

**للاستخدام:** إذا أردت وكيل يستخرج بيانات من مواقع حكومية
- business.sa (تحقق من السجل التجاري)
- mc.gov.sa (وزارة التجارة)
- my.gov.sa (الخدمات الإلكترونية)

**ملفات مهمة:**
- `cdp-browser-automation-playbook.md` — خطوات التشغيل
- `check-cr-status.js` — مثال عملي

---

### 7. SignOz + Grafana — المراقبة
**المسار:** `/Users/mrturki/Code/R-D/Fail-fast/signoz-trial/`
**المسار:** `/Users/mrturki/Code/R-D/Fail-fast/grafana-trial/`

```
Metrics to Track:
├── Agent Response Time (ms)
├── SQLite Query Latency
├── WhatsApp API Success Rate
├── Groq API Usage & Cost
├── User Message Volume (per hour)
├── Agent Error Rate
└── Memory Usage
```

**الملفات:**
- `/Users/mrturki/Code/R-D/Fail-fast/signoz-trial/README.md` — Setup OpenTelemetry
- `/Users/mrturki/Code/R-D/Fail-fast/grafana-trial/EXPERIMENT-LOG.md` — Dashboard examples

**الفائدة:** Visibility على صحة النظام (Phase 2)

---

## 🔧 الأنماط والمكتبات القابلة لإعادة الاستخدام

### Pattern 1: WhatsApp Service Abstraction
**من:** `/Users/mrturki/Code/nodejs/WhatsApp-Business/src/`

```typescript
// src/services/whatsapp.ts
class WhatsAppService {
  async sendMessage(phoneNumber: string, text: string): Promise<void>
  async onMessage(callback: (msg: WhatsAppMessage) => void): Promise<void>
  async sendImage(phoneNumber: string, imageUrl: string): Promise<void>
  async markAsRead(messageId: string): Promise<void>
}
```

**استخدام:**
```javascript
const wa = new WhatsAppService({
  provider: 'zoko', // أو 'meta' أو 'baileys'
  apiKey: process.env.WHATSAPP_API_KEY,
});

wa.onMessage(async (msg) => {
  console.log(`${msg.from}: ${msg.text}`);
});
```

---

### Pattern 2: LLM Service Abstraction
**من:** `/Users/mrturki/Code/R-D/agent-to-agent/src/services/llm.ts`

```typescript
class LLMService {
  async chat(prompt: string, model?: string): Promise<string>
  async analyze(text: string, instruction: string): Promise<string>
  async generateJson(prompt: string, schema: Zod): Promise<object>
}

// استخدم Groq للسرعة، Claude للتعقيد
const llm = new LLMService({
  primary: 'groq', // ميدعو سريع
  fallback: 'claude', // معقد لاحقاً
});
```

---

### Pattern 3: SQLite Message Bus
**من:** `/Users/mrturki/Code/R-D/agent-to-agent/src/db.js`

```javascript
// Define schema
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY,
    from TEXT,
    to TEXT,
    type TEXT (analysis|content|review),
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT (pending|processing|done)
  )
`);

// Agent posts result
db.prepare(`
  INSERT INTO messages (from, to, type, content, status)
  VALUES (?, ?, ?, ?, 'done')
`).run(fromAgent, toAgent, 'analysis', jsonResult);

// Another agent reads it
const pending = db.prepare(`
  SELECT * FROM messages WHERE to = ? AND status = 'pending'
`).all(myAgentName);
```

---

### Pattern 4: Cron Job (Morning Briefing)
**من:** `/Users/mrturki/Code/R-D/Fail-fast/agents-lab/morning-briefing.mjs`

```javascript
import cron from 'node-cron';

// Run every day at 8:00 AM
cron.schedule('0 8 * * *', async () => {
  const weather = await getWeather();
  const gold = await getGoldPrice();
  const date = getCurrentDate('ar'); // Arabic date

  const briefing = `
    صباح الخير! ☀️

    📅 اليوم: ${date}
    🌡️ الطقس: ${weather.description}, ${weather.temp}°
    💰 سعر الذهب: ${gold.price} ريال
    📈 السوق: ${market.status}
  `;

  await wa.broadcast(briefing); // Send to all users
});
```

**استخدام مباشر:**
```bash
npm install node-cron
# ثم انسخ المنطق إلى src/agents/morning.ts
```

---

## 🔌 الخدمات والـ APIs المتاحة

### جاهزة للاستخدام الفوري:

| الخدمة | المسار | API | الحالة |
|--------|--------|-----|--------|
| **Groq LLM** | agents-lab | `process()` | ✅ Ready |
| **Claude API** | agents-lab/photo-intel | `vision()` | ✅ Ready |
| **Whisper ASR** | agents-lab/voice-chat | `transcribe()` | ✅ Ready |
| **OpenWeather** | morning-briefing | weather.api.openweathermap.org | ✅ Ready |
| **Gold API** | morning-briefing | metals API | ✅ Ready |
| **n8n Webhooks** | n8n | REST API | ✅ Ready |
| **SQLite** | everywhere | better-sqlite3 | ✅ Ready |
| **Telegram** | audit-bot/telegram.ts | Bot API | ✅ Ready |

---

## 📊 Database Schema Reference

### WA Agency Tables
**من:** `/Users/mrturki/Code/R-D/Fail-fast/wa-agency/CLAUDE.md`

```sql
-- Users
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE,
  name TEXT,
  email TEXT,
  registered_at DATETIME,
  last_message_at DATETIME
);

-- Messages (conversation history)
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  agent_name TEXT,
  direction TEXT, -- 'in' or 'out'
  content TEXT,
  media_url TEXT,
  timestamp DATETIME,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Metrics
CREATE TABLE metrics (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  agent_name TEXT,
  response_time_ms INTEGER,
  timestamp DATETIME,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Agent logs
CREATE TABLE agent_logs (
  id INTEGER PRIMARY KEY,
  agent_name TEXT,
  status TEXT,
  error TEXT,
  timestamp DATETIME
);
```

---

## 🚀 كيفية البدء بسرعة

### خيار 1: Build from Scratch (الأسرع للـ MVP)
```bash
cd /Users/mrturki/Code/R-D/Fail-fast/wa-agency

# Copy patterns from agents-lab
cp ../agents-lab/morning-briefing.mjs src/agents/morning.ts
cp ../agents-lab/smart-search.mjs src/agents/price.ts

# Copy WhatsApp integration
cp ../../nodejs/WhatsApp-Business/src/whatsapp-api.js src/services/whatsapp.ts

# Copy database pattern
cp ../agent-to-agent/src/db.js src/services/db.ts

# Install deps
npm install

# Start
npm run dev
```

### خيار 2: Fork & Extend (إذا أردت نقطة انطلاق جاهزة)
```bash
cp -r /Users/mrturki/Code/R-D/agent-to-agent wa-agency-v2
# ثم عدّل agents لتخدم WhatsApp
```

### خيار 3: Use n8n for Orchestration (أقل كود)
```bash
# Build agents as functions
# Expose via n8n webhooks
# Let n8n orchestrate flow
# Database for persistence
```

---

## 📝 ملفات التوثيق المهمة

| الملف | الموضوع | القيمة |
|------|---------|--------|
| `/Users/mrturki/Code/nodejs/WhatsApp-Business/docs/ZOKO-GUIDE.md` | Setup WhatsApp MVP | 🔴 Essential |
| `/Users/mrturki/Code/R-D/agent-to-agent/CLAUDE.md` | Agent Protocol | 🔴 Essential |
| `/Users/mrturki/Code/R-D/agent-to-agent/docs/a2a-protocol-guide.md` | Message Format | 🟠 Important |
| `/Users/mrturki/Code/R-D/Fail-fast/n8n/README.md` | n8n Setup | 🟠 Important |
| `/Users/mrturki/Code/R-D/Browser-Agents/cdp-browser-automation-playbook.md` | Web Automation | 🟡 Optional |
| `/Users/mrturki/Code/R-D/Fail-fast/agents-lab/README.md` | Agent Examples | 🟠 Reference |

---

## 🎯 الخطة الموصى بها للـ Phase 1

```
Week 1:
├─ Copy WA Business patterns (Zoko)
├─ Implement user registration (SQLite)
├─ Build Router Agent (Groq LLM)
└─ Copy Morning Agent from agents-lab

Week 2:
├─ Build Price Agent (APIs + Groq)
├─ Implement metrics tracking
├─ Test with 10 beta users
└─ Measure: DAU, retention, messages/user

Week 3:
├─ Iterate based on feedback
├─ Add image analysis (Claude API)
├─ Optimize response times
└─ Prepare Phase 2 roadmap
```

---

## 💡 ملاحظات مهمة

1. **لا تبني كل شيء من الصفر** — اسخ أنماط من agent-to-agent و agents-lab
2. **ابدأ بـ Groq** — أسرع، أرخص، يكفي للـ MVP
3. **استخدم SQLite** — كل المشاريع تستخدمه، يعني بيئة موحدة
4. **n8n لاحقاً** — بعد ما تثبت الفكرة، استخدمه للتكامل مع الخدمات الخارجية
5. **مراقبة من البداية** — حتى لو بسيطة (قيس DAU, retention, response time)
6. **WhatsApp:** اختر Zoko للسرعة، Meta للإنتاج النهائي

---

Last updated: 2026-03-27
