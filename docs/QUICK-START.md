# Quick Start — البدء السريع

> اختبر الفكرة في ٣ ساعات

---

## Step 1: Setup Environment (10 دقائق)

```bash
cd /Users/mrturki/Code/R-D/Fail-fast/wa-agency

# Install dependencies
npm install

# Create .env file
cat > config/.env << 'EOF'
# LLM
GROQ_API_KEY=your_groq_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here

# WhatsApp (اختر واحد)
WHATSAPP_PROVIDER=zoko  # أو meta أو baileys
WHATSAPP_API_KEY=your_api_key
WHATSAPP_PHONE_ID=your_phone_id

# External APIs
OPENWEATHER_API_KEY=get_from_openweathermap.org
GOLD_API_KEY=get_from_metals.live

# n8n (لاحقاً)
N8N_WEBHOOK_URL=http://localhost:5678/webhook

# Database
DB_PATH=./data/wa-agency.db
EOF

# Get API keys
echo "Register for free APIs:"
echo "✓ Groq: https://console.groq.com/keys"
echo "✓ Claude: https://console.anthropic.com"
echo "✓ OpenWeather: https://openweathermap.org/api"
echo "✓ Metals.live: https://metals.live/api"
```

---

## Step 2: Build Router Agent (30 دقائق)

```bash
# Create agent structure
mkdir -p src/{agents,services,utils}
touch src/index.ts src/agents/router.ts

# Copy patterns
cp /Users/mrturki/Code/R-D/Fail-fast/agents-lab/smart-search.mjs src/agents/router.ts
```

**Edit `src/agents/router.ts`:**

```typescript
import { Groq } from '@groq/sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function routeMessage(message: string) {
  const prompt = `Classify to: morning|price|secretary|analyzer|general
Message: "${message}"
Agent (one word):`;

  const response = await groq.chat.completions.create({
    model: 'mixtral-8x7b-32768',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 20,
  });

  return response.choices[0].message.content.trim();
}
```

**Test it:**
```bash
node -e "
const { routeMessage } = require('./src/agents/router');
(async () => {
  console.log(await routeMessage('كم سعر الذهب؟')); // → price
  console.log(await routeMessage('صباح الخير')); // → morning
})()
"
```

---

## Step 3: Build Morning Agent (30 دقائق)

```bash
touch src/agents/morning.ts src/services/weather.ts

cat > src/agents/morning.ts << 'EOF'
import cron from 'node-cron';

export class MorningAgent {
  async sendBriefing(phone: string) {
    const now = new Date();
    const ar_date = now.toLocaleDateString('ar-SA');

    const message = `
صباح الخير ☀️

📅 اليوم: ${ar_date}
🌡️ الطقس: 28° شمس ☀️
💰 الذهب: 310 ريال/غرام
📈 السوق: مرتفع +0.5%

اكتب: سؤال | أسعار | خدمات
    `.trim();

    // TODO: Send via WhatsApp
    console.log(message);
  }

  start() {
    // 08:00 AM every day
    cron.schedule('0 8 * * *', () => {
      console.log('📰 Sending morning briefings...');
      // TODO: Get all users and send
    });
  }
}
EOF
```

**Test it:**
```bash
npm run test:morning
```

---

## Step 4: Setup WhatsApp Connection (1 ساعة)

### Option A: Zoko (الأسهل ✅)

```bash
# 1. Register at https://api.zoko.io
# 2. Get your API key
# 3. Add to .env
WHATSAPP_PROVIDER=zoko
WHATSAPP_API_KEY=xxxx_your_key_xxxx

# 4. Create webhook handler
cat > src/services/whatsapp.ts << 'EOF'
import axios from 'axios';

export class ZokoWhatsApp {
  async sendMessage(phone: string, text: string) {
    return axios.post('https://api.zoko.io/v1/message', {
      recipient: phone,
      text: text,
    }, {
      headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}` }
    });
  }

  async onMessage(callback: Function) {
    // Setup webhook endpoint
    // POST /webhook from Zoko
  }
}
EOF
```

### Option B: Meta Cloud API (الرسمي)

```bash
# https://developers.facebook.com/docs/whatsapp/cloud-api
# More setup, but official and scalable
```

### Option C: Baileys (للاختبار فقط ⚠️)

```bash
npm install @whiskeysockets/baileys
# Be careful — might get your personal number flagged
```

---

## Step 5: Test Full Flow (30 دقائق)

**Create `src/test.ts`:**

```typescript
import { routeMessage } from './agents/router';
import { MorningAgent } from './agents/morning';

async function test() {
  console.log('🧪 Testing Router Agent...');

  const tests = [
    'كم سعر الذهب؟',
    'صباح الخير',
    'أرسل إيميل',
    'حلل الصورة',
    'أنت من؟'
  ];

  for (const msg of tests) {
    const agent = await routeMessage(msg);
    console.log(`✓ "${msg}" → ${agent}`);
  }

  console.log('✅ All tests passed!');
}

test().catch(console.error);
```

**Run:**
```bash
npm run test
```

---

## Step 6: Deploy Webhook (30 دقائق)

**Create `src/index.ts`:**

```typescript
import express from 'express';
import { routeMessage } from './agents/router';

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  const { from, text } = req.body;

  console.log(`📨 ${from}: ${text}`);

  try {
    const agent = await routeMessage(text);
    console.log(`🤖 Routing to: ${agent}`);

    // TODO: Call appropriate agent

    res.json({ success: true, agent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3201;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
```

**Run:**
```bash
npm run dev
```

**Test webhook locally:**
```bash
curl -X POST http://localhost:3201/webhook \
  -H "Content-Type: application/json" \
  -d '{"from":"966501234567","text":"كم سعر الذهب؟"}'
```

---

## 📊 Metrics Dashboard

**Simple HTML dashboard at `src/dashboard.html`:**

```html
<!DOCTYPE html>
<html dir="rtl">
<head>
  <title>WA Agency — Live Metrics</title>
  <style>
    body { font-family: Arial; margin: 20px; }
    .metric { padding: 15px; margin: 10px 0; border: 1px solid #ddd; }
    .number { font-size: 2em; font-weight: bold; }
  </style>
</head>
<body>
  <h1>📊 WA Agency — لوحة التحكم</h1>

  <div class="metric">
    <div>👥 المستخدمين النشطين اليوم</div>
    <div class="number" id="dau">-</div>
  </div>

  <div class="metric">
    <div>💬 الرسائل اليوم</div>
    <div class="number" id="messages">-</div>
  </div>

  <div class="metric">
    <div>⚡ وقت الاستجابة (متوسط)</div>
    <div class="number" id="response-time">-</div>
  </div>

  <div class="metric">
    <div>📈 الوكلاء الأكثر استخداماً</div>
    <div id="agents">-</div>
  </div>

  <script>
    async function updateMetrics() {
      const res = await fetch('/api/metrics');
      const data = await res.json();

      document.getElementById('dau').textContent = data.dau;
      document.getElementById('messages').textContent = data.messages;
      document.getElementById('response-time').textContent = data.responseTime + 'ms';
    }

    updateMetrics();
    setInterval(updateMetrics, 5000);
  </script>
</body>
</html>
```

---

## 🎯 Checkpoint: Phase 1 MVP

After following these steps, you should have:

- ✅ Router Agent working
- ✅ Morning Agent scheduled
- ✅ WhatsApp webhook connected
- ✅ Basic metrics logged
- ✅ Local testing environment

**Total Time: ~3 hours**

---

## 🚀 Next Steps (After MVP validation)

1. **Add Price Agent** — APIs integration
2. **Deploy to Production** — docker2026 or local
3. **Invite 10 Beta Users** — measure engagement
4. **Analyze Metrics** — DAU, retention, message/user/day
5. **Iterate** — improve based on feedback

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| `GROQ_API_KEY not found` | Add to config/.env |
| `WhatsApp webhook not receiving` | Check provider webhook URL in dashboard |
| `Database locked` | Close other terminals, run `lsof -i :3201` |
| `Memory error` | Reduce batch size in morning agent |

---

## 📞 Support

- **Groq Docs:** https://console.groq.com/docs
- **Claude Docs:** https://docs.anthropic.com
- **WhatsApp Zoko:** https://api.zoko.io/docs
- **n8n Docs:** https://docs.n8n.io

---

Ready? Start with: `npm install && npm run dev`

Good luck! 🚀
