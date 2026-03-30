# WA Agency — وكالة الذكاء الاصطناعي على واتساب

> بوت واتساب يشتغل كوكالة وكلاء ذكاء اصطناعي. كل مشترك يحصل على فريق سكرتارية شخصي يخدمه ٢٤/٧

## الفكرة

المستخدم يتكلم مع بوت واتساب واحد، وراه فريق من الوكلاء الذكية:

```
User ←→ WhatsApp ←→ Router Agent ←→ [ Morning | Price | Secretary | Analyzer ]
```

## السيناريو

```
1. المستخدم يفتح البوت
2. البوت يرحب فيه ويطلب: اسم + إيميل + موقع (اختياري)
3. يشرح الخدمات المتاحة
4. يبدأ الوكلاء يشتغلون:
   ▸ وكيل الصباح — رسالة يومية (تاريخ، طقس، أسعار، ملخص)
   ▸ وكيل الأسعار — سعر ذهب/عملات/أسهم لحظي
   ▸ وكيل السكرتير — إرسال إيميل، تذكيرات، مهام
   ▸ وكيل التحليل — تحليل صور وفيديوهات
```

## المراحل

### Phase 1 — MVP (أسبوع)
| Component | Technology | Status |
|-----------|-----------|--------|
| WhatsApp Connection | Cloud API / Baileys | `TODO` |
| User Registration | SQLite | `TODO` |
| Router Agent | Claude/Groq LLM | `TODO` |
| Morning Agent | Cron + APIs (weather, gold, date) | `TODO` |
| Price Agent | Real-time price APIs | `TODO` |
| Metrics Tracking | SQLite + simple dashboard | `TODO` |

### Phase 2 — بعد إثبات التفاعل
- تحليل صور وفيديوهات
- شخصية السكرتير التنفيذي
- إرسال إيميلات نيابة عن المستخدم
- ربط تقويم

### Phase 3 — بعد إثبات القيمة
- ربط أنظمة محاسبية (رواء، ERP)
- تقارير مبيعات تفاعلية
- نظام اشتراكات (Token-based billing)

## المقاييس — Fail-Fast Metrics

```
Metric                    Why
────────────────────────  ─────────────────────────────────
DAU (Daily Active Users)  هل الناس ترجع كل يوم؟
Retention D1/D7/D30       كم يبقون بعد يوم/أسبوع/شهر؟
Messages per User/Day     مستوى التفاعل
Morning Open Rate         هل رسالة الصباح مفيدة؟
Agent Usage Distribution  أي وكيل الأكثر استخدام؟
Time to Value             كم ثانية من أول رسالة لأول فايدة؟
NPS (ask monthly)         هل يوصي فيه لغيره؟
```

## Tech Stack

```
Runtime       Node.js + TypeScript
LLM           Groq (fast) + Claude (complex tasks)
Database      SQLite (users, messages, metrics)
WhatsApp      Cloud API or Baileys
Scheduler     node-cron (morning messages)
APIs          OpenWeather, Gold API, Stock API
Hosting       PM2 on local/VPS
```

## Project Structure

```
wa-agency/
├── src/
│   ├── agents/          # AI agents (morning, price, secretary, analyzer)
│   ├── services/        # WhatsApp, LLM, external APIs
│   └── utils/           # helpers, date formatting, etc.
├── config/              # environment, agent configs
├── data/                # SQLite database
├── docs/                # additional documentation
├── CLAUDE.md            # development instructions
├── package.json
└── README.md
```

## Quick Start

```bash
# install
cd wa-agency && npm install

# configure
cp config/.env.example config/.env
# edit .env with your API keys

# run
npm run dev
```

## License

Private — Turki Labs
