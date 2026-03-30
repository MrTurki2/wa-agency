# خريطة الوكلاء — Agent Dependencies & Reusable Code

> خريطة تفصيلية لكل وكيل وما يحتاجه من خدمات وملفات موجودة في الكود

---

## 🎯 الوكلاء المخطط بناؤها

### 1. 🔀 Router Agent — المُوَجِّه الذكي

**المسؤولية:** فهم قصد المستخدم وتوجيه الرسالة للوكيل المناسب

```
User Message → Router Agent → Classify Intent → Route to Agent
                ↓
            Groq LLM (mixtral-8x7b)
            ↓
            "ما سعر الذهب؟" → Price Agent
            "أرسل إيميل" → Secretary Agent
            "كيف طقسك؟" → Morning Agent
            "حلل الصورة" → Analyzer Agent
```

**الملفات المطلوبة:**

| الملف | المسدر | الهدف |
|------|--------|-------|
| `src/services/llm.ts` | agents-lab | استدعاء Groq |
| `src/utils/intent-classifier.ts` | جديد | prompt engineering |
| `src/types/index.ts` | جديد | Message types |

**الكود الأساسي:**

```typescript
// src/agents/router.ts
import { Groq } from '@groq/sdk';

export class RouterAgent {
  private groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  async route(userMessage: string): Promise<AgentName> {
    const prompt = `
      Classify this user message to one of these agents:
      - morning (سؤال عن الطقس، التاريخ، ملخص يومي)
      - price (سؤال عن أسعار، ذهب، عملات، أسهم)
      - secretary (طلب إرسال إيميل، تذكير، مهام)
      - analyzer (صورة، فيديو، ملف)
      - general (محادثة عامة)

      User: "${userMessage}"
      Agent:
    `;

    const response = await this.groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
    });

    return response.choices[0].message.content.trim() as AgentName;
  }
}
```

**Dependencies:**
- ✅ Groq API (موجود)
- ✅ TypeScript (موجود)
- ⚠️ Prompt engineering (جديد)

---

### 2. 🌅 Morning Agent — صباح الخير

**المسؤولية:** إرسال ملخص يومي (تاريخ، طقس، أسعار، أخبار)

```
Cron: 08:00 AM → Gather Data → Format → Send to All Users
      ↓
      ├─ Get Date (Arabic)
      ├─ Get Weather (OpenWeather)
      ├─ Get Gold Price (Gold API)
      ├─ Get Stock Market (Stock API)
      └─ Send via WhatsApp
```

**الملفات المطلوبة:**

| الملف | المسدر | الحالة |
|------|--------|--------|
| `src/agents/morning.ts` | agents-lab/morning-briefing.mjs | ✅ Copy & Adapt |
| `src/utils/date-formatter.ts` | جديد | Format to Arabic |
| `src/services/weather.ts` | جديد | OpenWeather integration |
| `src/services/prices.ts` | جديد | Gold/Stock/Crypto APIs |

**الكود الأساسي:**

```typescript
// src/agents/morning.ts
import cron from 'node-cron';
import { WhatsAppService } from '../services/whatsapp';
import { WeatherService } from '../services/weather';
import { PriceService } from '../services/prices';

export class MorningAgent {
  constructor(private wa: WhatsAppService) {}

  start() {
    // 08:00 AM every day
    cron.schedule('0 8 * * *', () => this.sendBriefing());
  }

  private async sendBriefing() {
    const users = this.db.getAllUsers();

    for (const user of users) {
      const briefing = await this.buildBriefing(user);
      await this.wa.sendMessage(user.phone, briefing);
    }
  }

  private async buildBriefing(user: User): Promise<string> {
    const date = this.formatDate(); // Arabic
    const weather = await new WeatherService().get(user.location);
    const gold = await new PriceService().getGoldPrice();
    const market = await new PriceService().getMarketStatus();

    return `
صباح الخير! ☀️

📅 *${date}*
🌡️ الطقس: ${weather.description} • ${weather.temp}°C
💰 سعر الذهب: ${gold.price} ريال/غرام
📈 السوق: ${market.status}

استكشف خدماتنا: اكتب "خدمات"
    `.trim();
  }
}
```

**API Keys المطلوبة:**
- `OPENWEATHER_API_KEY` (free tier available)
- `GOLD_API_KEY` (metals.live or similar)

**Dependencies:**
- ✅ node-cron (موجود)
- ✅ WhatsApp Service (من WA Business)
- ⚠️ Weather Service (جديد بسيط)
- ⚠️ Price Service (جديد بسيط)

---

### 3. 💰 Price Agent — وكيل الأسعار

**المسؤولية:** الرد على استفسارات فورية عن الأسعار

```
User: "كم سعر الذهب الآن؟"
         ↓
     Price Agent
         ↓
    Query Price APIs
         ↓
    Format Response
         ↓
    Send to User
```

**الملفات المطلوبة:**

| الملف | المسدر | الحالة |
|------|--------|--------|
| `src/agents/price.ts` | agents-lab/smart-search.mjs | ✅ Adapt |
| `src/services/prices.ts` | جديد | API aggregator |
| `src/utils/price-formatter.ts` | جديد | Format prices in Arabic |

**الكود الأساسي:**

```typescript
// src/agents/price.ts
import { Groq } from '@groq/sdk';
import { PriceService } from '../services/prices';

export class PriceAgent {
  private prices = new PriceService();
  private groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  async handle(userMessage: string): Promise<string> {
    // Extract price type from message
    const type = this.extractPriceType(userMessage);
    // gold, silver, dollar, euro, bitcoin, etc.

    if (!type) return "لم أفهم السعر اللي تبحث عنه. جرب: ذهب، فضة، دولار، بتكوين";

    const price = await this.prices.get(type);

    if (!price) return `معذرة، ما أقدر أجيب سعر ${type} الآن`;

    return `
💰 سعر ${price.name}

📊 الآن: ${price.current} ريال
📈 اليوم: +${price.dayChange}%
📅 الأسبوع: +${price.weekChange}%

آخر تحديث: منذ ${price.updateTime} دقائق
    `.trim();
  }

  private extractPriceType(message: string): string | null {
    const keywords = {
      gold: ['ذهب', 'gold', 'au'],
      silver: ['فضة', 'silver', 'ag'],
      dollar: ['دولار', 'dollar', 'usd'],
      bitcoin: ['بتكوين', 'bitcoin', 'btc'],
      // ... more
    };

    for (const [type, keywords] of Object.entries(keywords)) {
      if (keywords.some(k => message.includes(k))) {
        return type;
      }
    }
    return null;
  }
}
```

**APIs المطلوبة:**
```javascript
// src/services/prices.ts
class PriceService {
  async get(type: 'gold' | 'silver' | 'dollar' | ...): Promise<Price> {
    // metals.live API
    // exchangerate-api.com
    // coingecko.com (free, no key)
    // finnhub.io (stock prices)
  }
}
```

**Dependencies:**
- ✅ Groq API
- ⚠️ Price APIs (free tiers available)

---

### 4. 📧 Secretary Agent — السكرتير التنفيذي

**المسؤولية:** إرسال إيميلات، تذكيرات، إدارة المهام

```
User: "أرسل إيميل لمحمد قول له العرض جاهز"
         ↓
  Secretary Agent
         ↓
     Parse Intent:
     ├─ To: محمد
     ├─ Subject: العرض جاهز
     └─ Body: (generate)
         ↓
    n8n Webhook (Gmail)
         ↓
    Email Sent ✅
```

**الملفات المطلوبة:**

| الملف | المسدر | الحالة |
|------|--------|--------|
| `src/agents/secretary.ts` | جديد | Secretary logic |
| `src/services/n8n.ts` | جديد | n8n webhook client |
| `src/utils/email-formatter.ts` | جديد | Email text generation |

**الكود الأساسي:**

```typescript
// src/agents/secretary.ts
import { Groq } from '@groq/sdk';
import { N8nService } from '../services/n8n';

export class SecretaryAgent {
  private groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  private n8n = new N8nService();

  async handle(userMessage: string): Promise<string> {
    // Parse user intent using LLM
    const intent = await this.parseIntent(userMessage);

    if (intent.type === 'email') {
      return await this.sendEmail(intent.to, intent.subject, intent.body);
    } else if (intent.type === 'reminder') {
      return await this.setReminder(intent.task, intent.time);
    } else if (intent.type === 'task') {
      return await this.createTask(intent.description);
    }

    return "ما فهمت الطلب بشكل واضح";
  }

  private async parseIntent(message: string) {
    const prompt = `
      Parse this message and extract: type, recipient, subject, body

      Types: email, reminder, task

      Example:
      "أرسل إيميل لأحمد قول له الاجتماع بكرة الساعة ٢"
      → { type: 'email', to: 'أحمد', subject: 'اجتماع غداً', body: 'الاجتماع بكرة الساعة ٢' }

      Message: "${message}"

      Response (JSON only):
    `;

    const response = await this.groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
    });

    return JSON.parse(response.choices[0].message.content);
  }

  private async sendEmail(to: string, subject: string, body: string): Promise<string> {
    // Call n8n Gmail workflow
    const result = await this.n8n.execute('send-email', {
      to,
      subject,
      body,
    });

    return result.success
      ? `✅ تم إرسال الإيميل لـ ${to}`
      : `❌ حدث خطأ في إرسال الإيميل`;
  }
}
```

**n8n Integration:**
```bash
# In n8n, create workflow: send-email
# Trigger: Webhook
# Nodes:
# 1. Webhook (receive email data)
# 2. Gmail (send email)
# 3. Response (confirm success)

# Webhook URL: https://ti-n8n.tj.sa/webhook/send-email
```

**Dependencies:**
- ✅ Groq API
- ⚠️ n8n (موجود)
- ⚠️ Gmail credentials (في n8n)

---

### 5. 🖼️ Analyzer Agent — محلل الصور والفيديوهات

**المسؤولية:** تحليل الصور والفيديوهات والملفات

```
User: [sends image]
         ↓
   Analyzer Agent
         ↓
  Download image
         ↓
  Claude API (vision)
         ↓
  Generate analysis
         ↓
  Send response
```

**الملفات المطلوبة:**

| الملف | المسدر | الحالة |
|------|--------|--------|
| `src/agents/analyzer.ts` | agents-lab/photo-intel.mjs | ✅ Copy |
| `src/services/claude.ts` | جديد | Claude API wrapper |
| `src/utils/media-download.ts` | wa-sync | Download from WhatsApp |

**الكود الأساسي:**

```typescript
// src/agents/analyzer.ts
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

export class AnalyzerAgent {
  private claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

  async handle(message: WhatsAppMessage): Promise<string> {
    if (!message.image_url && !message.video_url && !message.document_url) {
      return "أرجاء صورة أو فيديو أو ملف لأحللها";
    }

    try {
      if (message.image_url) {
        return await this.analyzeImage(message.image_url);
      } else if (message.video_url) {
        return await this.analyzeVideo(message.video_url);
      } else if (message.document_url) {
        return await this.analyzeDocument(message.document_url);
      }
    } catch (error) {
      return `❌ حدث خطأ: ${error.message}`;
    }
  }

  private async analyzeImage(imageUrl: string): Promise<string> {
    const response = await this.claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'url',
                url: imageUrl,
              },
            },
            {
              type: 'text',
              text: 'حلل الصورة بالعربية. ما الذي تراه؟ اذكر التفاصيل المهمة.',
            },
          ],
        },
      ],
    });

    return response.content[0].type === 'text'
      ? response.content[0].text
      : '❌ لم أستطع تحليل الصورة';
  }

  private async analyzeVideo(videoUrl: string): Promise<string> {
    // Extract key frames
    const frames = await this.extractFrames(videoUrl);

    // Analyze first frame
    const analysis = await this.analyzeImage(frames[0]);

    return `📹 تحليل الفيديو:\n\n${analysis}\n\n(تم تحليل الإطار الأول)`;
  }

  private async extractFrames(videoUrl: string): Promise<string[]> {
    // Use FFmpeg or video-processing library
    // For now, return placeholder
    return [videoUrl];
  }
}
```

**Dependencies:**
- ✅ Claude API (موجود)
- ✅ Anthropic SDK
- ⚠️ FFmpeg (للفيديوهات - optional)

---

### 6. 💬 General Agent — محادثة عامة

**المسؤولية:** محادثة طبيعية عندما لا يكون الوكيل الآخر مناسباً

```
User: "مين أنت؟"
         ↓
  General Agent
         ↓
  Claude API (conversation)
         ↓
  Maintain personality
         ↓
  Store conversation history
```

**الكود الأساسي:**

```typescript
// src/agents/general.ts
import Anthropic from '@anthropic-ai/sdk';
import { Database } from 'better-sqlite3';

export class GeneralAgent {
  private claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

  constructor(private db: Database) {}

  async handle(userMessage: string, userId: string): Promise<string> {
    // Get conversation history (last 10 messages)
    const history = this.getConversationHistory(userId);

    const messages = [
      ...history,
      { role: 'user', content: userMessage }
    ];

    const response = await this.claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: `أنت سكرتير تنفيذي ذكي باسم "وكيل".
أنت تتحدث باللهجة السعودية (نجدية).
تكون ودودة، محترفة، ومفيدة.
تتذكر السياق من المحادثات السابقة.`,
      messages,
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : "معذرة، حدث خطأ في معالجة رسالتك";

    // Store in conversation history
    this.db.prepare(`
      INSERT INTO messages (user_id, agent_name, direction, content)
      VALUES (?, ?, ?, ?)
    `).run(userId, 'general', 'in', userMessage);

    this.db.prepare(`
      INSERT INTO messages (user_id, agent_name, direction, content)
      VALUES (?, ?, ?, ?)
    `).run(userId, 'general', 'out', assistantMessage);

    return assistantMessage;
  }

  private getConversationHistory(userId: string): any[] {
    const messages = this.db.prepare(`
      SELECT direction, content FROM messages
      WHERE user_id = ? AND agent_name = 'general'
      ORDER BY timestamp DESC
      LIMIT 10
    `).all(userId);

    return messages.reverse().map(msg => ({
      role: msg.direction === 'in' ? 'user' : 'assistant',
      content: msg.content,
    }));
  }
}
```

**Dependencies:**
- ✅ Claude API
- ✅ SQLite (conversation history)

---

## 📊 Dependency Matrix

```
┌──────────────┬──────────────┬──────────────┬──────────┬──────────┐
│ Agent        │ WhatsApp API │ LLM (Groq)   │ LLM (Claude) │ External │
├──────────────┼──────────────┼──────────────┼──────────┼──────────┤
│ Router       │ ✅          │ ✅ MAIN      │ -        │ -        │
│ Morning      │ ✅          │ -            │ -        │ APIs     │
│ Price        │ ✅          │ ✅ classifier│ -        │ APIs     │
│ Secretary    │ ✅          │ ✅ parser    │ -        │ n8n      │
│ Analyzer     │ ✅          │ -            │ ✅ MAIN  │ -        │
│ General      │ ✅          │ -            │ ✅ MAIN  │ history  │
└──────────────┴──────────────┴──────────────┴──────────┴──────────┘
```

---

## 🔌 External Services Needed

| Service | Agent | Type | Cost | Status |
|---------|-------|------|------|--------|
| Groq API | Router, Price | LLM | FREE | ✅ Ready |
| Claude API | Analyzer, General | LLM | ~$0.001/msg | ✅ Ready |
| OpenWeather | Morning | Weather | FREE (1k/day) | ⚠️ Register |
| Gold API | Price | Prices | FREE | ⚠️ Register |
| Stock API | Morning, Price | Market | FREE | ⚠️ Register |
| Gmail (via n8n) | Secretary | Email | FREE | ✅ Ready (in n8n) |
| WhatsApp | All | Messaging | ~$0.05/conv | ⚠️ Choose provider |

---

## 🚀 Implementation Order

```
Phase 1 (MVP):
1. Router Agent ← START HERE
2. Morning Agent
3. Price Agent
4. Database + Metrics

Phase 2:
5. Secretary Agent (requires n8n)
6. Analyzer Agent (requires Claude API)
7. General Agent

Phase 3:
8. Advanced features
9. Optimize performance
10. Scale infrastructure
```

---

## 📁 File Structure Summary

```
wa-agency/
├── src/
│   ├── agents/
│   │   ├── router.ts       ← START HERE
│   │   ├── morning.ts      ← COPY from agents-lab
│   │   ├── price.ts        ← COPY + MODIFY
│   │   ├── secretary.ts    ← NEW (requires n8n)
│   │   ├── analyzer.ts     ← COPY from agents-lab
│   │   └── general.ts      ← NEW (simple)
│   ├── services/
│   │   ├── whatsapp.ts     ← FROM WhatsApp-Business
│   │   ├── llm.ts          ← FROM agent-to-agent
│   │   ├── db.ts           ← FROM agent-to-agent
│   │   ├── prices.ts       ← NEW (APIs)
│   │   ├── weather.ts      ← NEW (OpenWeather)
│   │   ├── claude.ts       ← NEW (wrapper)
│   │   └── n8n.ts          ← NEW (webhooks)
│   └── utils/
│       ├── intent-classifier.ts
│       ├── date-formatter.ts
│       ├── price-formatter.ts
│       ├── email-formatter.ts
│       └── media-download.ts
├── config/
│   └── .env                ← API keys
└── data/
    └── wa-agency.db        ← SQLite
```

---

Last updated: 2026-03-27
