# الخطة التقنية — غلا

> أبسط طريقة تشتغل

---

## الصورة الكاملة

```
واتساب ←→ Webhook ←→ غلا (Node.js) ←→ Groq / Claude
                           ↓
                        SQLite
                       (المستخدمين + المحادثات)
```

---

## Stack

```
Runtime:    Node.js + TypeScript
WhatsApp:   Baileys (مجاني، للاختبار)  ← ابدأ هنا
LLM:        Groq  (سريع + مجاني)
Database:   SQLite  (بسيط، كافي)
Scheduler:  node-cron  (رسالة الصباح)
Host:       PM2 محلي  ← ثم docker2026
```

---

## هيكل الملفات

```
wa-agency/
├── src/
│   ├── index.ts          ← نقطة البداية
│   ├── wa.ts             ← اتصال واتساب (Baileys)
│   ├── router.ts         ← يفهم القصد ويوزع
│   ├── db.ts             ← SQLite
│   └── agents/
│       ├── onboard.ts    ← تسجيل المستخدم
│       ├── morning.ts    ← رسالة الصباح (cron)
│       ├── price.ts      ← أسعار لحظية
│       ├── send.ts       ← إرسال بالنيابة
│       └── analyze.ts    ← تحليل صور
├── data/
│   └── ghala.db          ← SQLite
└── config/
    └── .env
```

---

## قاعدة البيانات

```sql
-- المستخدمين
CREATE TABLE users (
  phone     TEXT PRIMARY KEY,
  name      TEXT,
  email     TEXT,
  persona   TEXT,   -- A / B / C
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- المحادثات (آخر ١٠ رسائل لكل مستخدم)
CREATE TABLE messages (
  id        INTEGER PRIMARY KEY,
  phone     TEXT,
  role      TEXT,   -- user / assistant
  content   TEXT,
  agent     TEXT,   -- أي وكيل رد
  ts        DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- المقاييس
CREATE TABLE metrics (
  id        INTEGER PRIMARY KEY,
  phone     TEXT,
  event     TEXT,   -- opened / completed_onboard / shared / daily_msg
  ts        DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## الكود الأساسي

### `src/index.ts` — نقطة البداية
```typescript
import { startWhatsApp } from './wa';
import { route } from './router';
import { initDB } from './db';
import { startMorningCron } from './agents/morning';

async function main() {
  initDB();
  startMorningCron();

  await startWhatsApp(async (phone, message, media) => {
    const reply = await route(phone, message, media);
    return reply;
  });
}

main();
```

---

### `src/router.ts` — القلب
```typescript
import Groq from 'groq-sdk';
import { getUser } from './db';
import { onboard } from './agents/onboard';
import { handleSend } from './agents/send';
import { handlePrice } from './agents/price';
import { handleAnalyze } from './agents/analyze';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function route(phone: string, text: string, media?: string) {

  // مستخدم جديد؟
  const user = getUser(phone);
  if (!user) return onboard(phone, text);

  // في منتصف الـ onboarding؟
  if (!user.name || !user.email) return onboard(phone, text, user);

  // صورة؟
  if (media) return handleAnalyze(phone, media, text);

  // صنّف القصد
  const intent = await classify(text);

  if (intent === 'send')   return handleSend(phone, text, user);
  if (intent === 'price')  return handlePrice(text);

  // محادثة عامة
  return chat(phone, text, user);
}

async function classify(text: string): Promise<string> {
  const res = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    messages: [{
      role: 'user',
      content: `صنّف هذه الجملة: "${text}"
الخيارات: send | price | general
الجواب (كلمة واحدة فقط):`
    }],
    max_tokens: 10,
  });
  return res.choices[0].message.content?.trim() ?? 'general';
}

async function chat(phone: string, text: string, user: any) {
  const res = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    messages: [
      {
        role: 'system',
        content: `أنت غلا 🌸 سكرتيرة ذكية على واتساب.
تتكلمين باللهجة السعودية، ودودة ومختصرة.
تتكلمين مع ${user.name}.`
      },
      { role: 'user', content: text }
    ],
    max_tokens: 300,
  });
  return res.choices[0].message.content ?? 'معذرة، ما فهمت 😅';
}
```

---

### `src/agents/onboard.ts` — الترحيب
```typescript
import { saveUser, updateUser, getUser } from '../db';

export async function onboard(phone: string, text: string, user?: any) {

  // زيارة أولى
  if (!user) {
    saveUser(phone);
    return `هلا والله! 🌸

أنا غلا — سكرتيرتك الذكية على واتساب
أرسل لك، أذكرك، أحلل صورك، وأكثر

كيف أناديك؟`;
  }

  // ينتظر الاسم
  if (!user.name) {
    updateUser(phone, { name: text });
    return `أهلاً ${text}! 😊

إيميلك؟ عشان أقدر أرسل بالنيابة عنك`;
  }

  // ينتظر الإيميل
  if (!user.email) {
    updateUser(phone, { email: text });
    return `ممتاز! 🎉

أنا جاهزة يا ${user.name}
قول لي: وش تبغى؟`;
  }
}
```

---

### `src/agents/morning.ts` — رسالة الصباح
```typescript
import cron from 'node-cron';
import { getAllUsers } from '../db';
import { sendMessage } from '../wa';

export function startMorningCron() {
  // كل يوم الساعة ٨ صباحاً
  cron.schedule('0 8 * * *', sendMorning, { timezone: 'Asia/Riyadh' });
}

async function sendMorning() {
  const users = getAllUsers();
  const date = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  const gold = await getGoldPrice();
  const weather = await getWeather();

  for (const user of users) {
    await sendMessage(user.phone, `صباح الخير ${user.name}! ☀️

📅 ${date}
🌡️ الطقس: ${weather}
💰 الذهب: ${gold} ريال/غرام

أنا جاهزة — وش تبغى اليوم؟`);
  }
}

async function getGoldPrice(): Promise<string> {
  // metals.live API مجاني
  try {
    const res = await fetch('https://metals.live/api/spot/gold');
    const data = await res.json() as { price: number };
    return (data.price * 3.75).toFixed(0); // تحويل لريال
  } catch {
    return '—';
  }
}

async function getWeather(): Promise<string> {
  // OpenWeather مجاني
  try {
    const key = process.env.OPENWEATHER_KEY;
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Riyadh&appid=${key}&units=metric&lang=ar`
    );
    const data = await res.json() as { main: { temp: number }, weather: { description: string }[] };
    return `${data.weather[0].description} ${Math.round(data.main.temp)}°`;
  } catch {
    return '—';
  }
}
```

---

### `src/agents/price.ts` — الأسعار
```typescript
export async function handlePrice(text: string): Promise<string> {
  const type = detectPriceType(text);

  const prices: Record<string, () => Promise<string>> = {
    gold:    fetchGold,
    dollar:  fetchDollar,
    bitcoin: fetchBitcoin,
  };

  const fetcher = prices[type];
  if (!fetcher) return 'أي سعر تبغى؟ ذهب، دولار، بتكوين؟';

  const price = await fetcher();
  return price;
}

function detectPriceType(text: string): string {
  if (/ذهب|gold/.test(text)) return 'gold';
  if (/دولار|dollar/.test(text)) return 'dollar';
  if (/بتكوين|bitcoin|btc/.test(text)) return 'bitcoin';
  return 'unknown';
}

async function fetchGold(): Promise<string> {
  const res = await fetch('https://metals.live/api/spot/gold');
  const data = await res.json() as { price: number };
  const sar = (data.price * 3.75).toFixed(0);
  return `💰 سعر الذهب الآن\n${sar} ريال / غرام`;
}

async function fetchDollar(): Promise<string> {
  const res = await fetch('https://open.er-api.com/v6/latest/USD');
  const data = await res.json() as { rates: { SAR: number } };
  return `💵 الدولار الآن\n${data.rates.SAR.toFixed(2)} ريال`;
}

async function fetchBitcoin(): Promise<string> {
  const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
  const data = await res.json() as { bitcoin: { usd: number } };
  const usd = data.bitcoin.usd.toLocaleString();
  return `₿ البتكوين الآن\n$${usd}`;
}
```

---

### `src/agents/send.ts` — الإرسال بالنيابة
```typescript
import { sendMessage, getContacts } from '../wa';

export async function handleSend(phone: string, text: string, user: any): Promise<string> {
  // استخرج المستلمين من النص
  const contacts = await extractContacts(phone, text);

  if (!contacts.length) {
    return `من تبغى أرسل لهم؟ أكتب الأسماء أو شارك أرقامهم`;
  }

  // قوالب جاهزة
  const templates = [
    '١- دعوة عشاء',
    '٢- تهنئة',
    '٣- تذكير موعد',
    '٤- اكتب رسالتك',
  ];

  return `لقيت ${contacts.length} جهة اتصال
اختار نوع الرسالة:
${templates.join('\n')}`;
}

async function extractContacts(phone: string, text: string) {
  // بسيط: ابحث عن أرقام في النص
  const numbers = text.match(/05\d{8}/g) ?? [];
  return numbers;
}
```

---

### `src/agents/analyze.ts` — تحليل الصور
```typescript
import Anthropic from '@anthropic-ai/sdk';

const claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

export async function handleAnalyze(phone: string, imageUrl: string, caption: string): Promise<string> {
  const prompt = caption || 'حلل هذه الصورة بالعربية واذكر أهم ما فيها';

  const res = await claude.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'url', url: imageUrl } },
        { type: 'text', text: prompt }
      ]
    }]
  });

  return res.content[0].type === 'text' ? res.content[0].text : '❌ ما قدرت أحلل الصورة';
}
```

---

## env

```bash
# config/.env
GROQ_API_KEY=
CLAUDE_API_KEY=
OPENWEATHER_KEY=
PORT=3201
```

---

## تشغيل

```bash
npm install
npm run dev
```

---

## package.json

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "tsx src/index.ts"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "^6.7.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "groq-sdk": "^0.3.0",
    "better-sqlite3": "^9.4.0",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "typescript": "^5.4.0"
  }
}
```

---

## ترتيب البناء

```
اليوم ١:   npm install + Baileys يتصل + يرد "مرحبا"
اليوم ٢:   Onboarding (اسم + إيميل)
اليوم ٣:   Router + محادثة عامة (Groq)
اليوم ٤:   وكيل الأسعار
اليوم ٥:   رسالة الصباح (cron)
اليوم ٦:   تحليل الصور (Claude)
اليوم ٧:   اختبار مع ٥ أشخاص حقيقيين
```

---

*آخر تحديث: 2026-03-27*
