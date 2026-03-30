# WA Agency — Project Overview

**Date:** 2026-03-30
**Status:** Phase 1 MVP + Security ✅ Complete
**Model:** openai/gpt-oss-120b (Groq)

---

## What Is This?

WhatsApp AI Agency — a personal AI secretary on WhatsApp.
The user sends a message, the system routes it to the right AI agent, and responds instantly.

```
User → WhatsApp → Router → Agent → Response → WhatsApp
```

Currently running in **simulator mode** — a web-based WhatsApp clone for testing.
Production swap to WhatsApp Cloud API requires only changing `core/whatsapp.mjs`.

---

## Project Structure

```
wa-agency/
├── server.mjs              157 lines   HTTP server (Hono, port 3201)
│
├── core/                    497 lines   Shared engine
│   ├── config.mjs            37         Central config (ports, limits, keys)
│   ├── db.mjs               165         SQLite (users, messages, metrics, conversations, reminders, preferences)
│   ├── llm.mjs              135         Groq API (chat, classify, transcribe, analyzeImage)
│   ├── fetch-safe.mjs        19         Timeout wrapper for all external fetch
│   ├── whatsapp.mjs          69         Send/receive abstraction (simulator mode)
│   └── preferences.mjs       66         User preference learning from behavior
│
├── agents/                 1,182 lines  16 specialized AI agents
│   ├── router.mjs           171         Intent classification (keyword + LLM)
│   ├── onboarding.mjs        67         User registration (name → city → ready)
│   ├── morning.mjs           89         Daily briefing (date, weather, gold, quote)
│   ├── price.mjs            103         Real-time prices (crypto, currencies)
│   ├── weather.mjs           72         Detailed weather by city
│   ├── search.mjs            40         Information lookup via LLM
│   ├── creative.mjs          51         Content writing (emails, tweets, articles)
│   ├── summary.mjs           70         Text/URL summarization
│   ├── reminder.mjs         105         Task management with due dates
│   ├── calculator.mjs        83         Safe math evaluation (no eval)
│   ├── news.mjs              36         Trending topics
│   ├── joke.mjs              38         Jokes, riddles, quizzes
│   ├── profile.mjs           52         User data view/edit
│   ├── tools.mjs             97         QR code, translate, convert, image, voice
│   ├── general.mjs           30         Conversational fallback with memory
│   └── proactive.mjs         62         Engagement analytics (written, not scheduled)
│
├── views/                   304 lines   UI templates
│   ├── simulator.mjs        222         WhatsApp-style dark theme simulator
│   └── dashboard.mjs         80         Analytics dashboard
│
├── scripts/                1,267 lines  Testing & admin tools
│   ├── test-personas.mjs    471         10 personas × 31 msgs (llama-3.3-70b)
│   ├── test-oss120b.mjs     467         10 personas × 31 msgs (oss-120b)
│   ├── test-all-agents.mjs   76         All 15 agents coverage
│   ├── test-advanced.mjs     60         Calculator, reminder, summary, help
│   ├── test-stress.mjs      104         Edge cases + concurrent
│   ├── report.mjs            55         Admin report generator
│   └── stats.mjs             27         Quick stats from DB
│
├── docs/                   2,788 lines  Documentation (13 files)
├── data/                               SQLite DB + test results (gitignored)
├── config/.env                          API keys (gitignored)
├── CLAUDE.md                100         Project instructions for Claude Code
├── STATUS.md                 64         Phase completion checklist
├── package.json              21         2 dependencies only
└── .gitignore
```

**Total code:** 3,407 lines (excluding docs)
**Total docs:** 2,788 lines
**Dependencies:** 2 (hono, better-sqlite3)

---

## Agents Map

| # | Agent | Trigger | LLM? | Lines | Real API? |
|---|-------|---------|------|-------|-----------|
| 1 | onboarding | New user | No | 67 | — |
| 2 | help | "مساعدة", "?" | No | — | — |
| 3 | morning | "صباح", "تقرير" | Yes | 89 | Weather + Gold APIs |
| 4 | price | "سعر", "ذهب", "بتكوين" | Yes | 103 | CoinGecko + ExchangeRate |
| 5 | weather | "طقس", "حرارة" | Yes | 72 | OpenWeather API |
| 6 | search | "ابحث", "وش يعني" | Yes | 40 | LLM only |
| 7 | creative | "اكتب", "صمم" | Yes | 51 | LLM only |
| 8 | summary | "لخص", "اختصر" | Yes | 70 | fetch URL + LLM |
| 9 | reminder | "ذكرني", "مهامي" | No | 105 | SQLite |
| 10 | calculator | "احسب", math | No | 83 | Safe tokenizer |
| 11 | news | "أخبار", "ترند" | Yes | 36 | LLM only |
| 12 | joke | "نكتة", "حزورة" | Yes | 38 | LLM only |
| 13 | profile | "بياناتي", "غير اسمي" | No | 52 | SQLite |
| 14 | tools | "ترجم", "كيو ار", media | Yes | 97 | QR API + LLM |
| 15 | general | Fallback | Yes | 30 | LLM + conversation memory |

---

## Database Schema

```
users          → id, phone, name, email, city, language, registered_at, last_seen, status
messages       → id, user_id, direction(in/out), agent, content, message_type, timestamp
conversations  → id, user_id, role(user/assistant/system), content, timestamp  [rolling 20]
metrics        → id, user_id, agent, action, response_time_ms, tokens_used, success, timestamp
reminders      → id, user_id, text, due_at, status, created_at
preferences    → user_id, key, value, updated_at  [learned from behavior]
```

---

## Current Stats

| Metric | Value |
|--------|-------|
| Registered users | 22 |
| Total messages | 1,408 |
| Total metric events | 704 |
| Active reminders | 9 |
| Model tests run | 2 (llama-3.3-70b + oss-120b) |
| Messages per test | 310 |
| Success rate | 100% (both models) |
| Avg response time | ~1,000ms |

### Agent Usage Distribution

| Agent | Calls | Share |
|-------|-------|-------|
| search | 157 | 22.3% |
| price | 142 | 20.2% |
| creative | 122 | 17.3% |
| tools | 77 | 10.9% |
| general | 74 | 10.5% |
| morning | 54 | 7.7% |
| onboarding | 22 | 3.1% |
| calculator | 15 | 2.1% |
| reminder | 14 | 2.0% |
| help | 7 | 1.0% |
| joke | 6 | 0.9% |
| news | 4 | 0.6% |
| summary | 4 | 0.6% |
| profile | 3 | 0.4% |
| weather | 3 | 0.4% |

### Registered Users (22)

| Batch | Model | Users | Phone Range |
|-------|-------|-------|-------------|
| Test 1 | llama-3.3-70b | 10 | 966501001001–010 |
| Test 2 | oss-120b | 10 | 966502001001–010 |
| Stress | — | 2 | 96650999*, 96659999* |

---

## Model Comparison

| Metric | llama-3.3-70b | oss-120b |
|--------|---------------|----------|
| Success rate | 100% | 100% |
| Avg response | 1,027ms | 1,031ms |
| Language mixing | 3+ (Spanish, Vietnamese, Russian) | 0 ✅ |
| Arabic quality | ★★☆☆☆ | ★★★★☆ |
| Search formatting | Plain bullets | **Bold** + structured |
| Morning fallback | "I'm not able to..." | Same issue |
| Unknown routing | 0 | 11 |
| Current model | ❌ Replaced | ✅ Active |

---

## Security Measures

| Protection | Implementation |
|------------|---------------|
| No eval/Function | Calculator uses safe tokenizer |
| API key validation | Throws on missing GROQ_API_KEY |
| Fetch timeout | All external calls: 10-30s via fetchSafe |
| Input validation | Max 5,000 chars, phone format check |
| Rate limiting | 30 req/min per phone |
| Graceful shutdown | SIGTERM/SIGINT close DB |
| XSS tested | Passed (redirects to search) |
| SQL injection tested | Passed (parameterized queries) |

---

## URLs

| Endpoint | URL |
|----------|-----|
| Simulator | http://localhost:3201 |
| Dashboard | http://localhost:3201/dashboard |
| Health | http://localhost:3201/health |
| Stats API | http://localhost:3201/api/stats |
| Send message | POST http://localhost:3201/api/send |
| User messages | GET http://localhost:3201/api/messages/:phone |
| User engagement | GET http://localhost:3201/api/engagement/:phone |
| User list | GET http://localhost:3201/api/users |

---

## Quick Start

```bash
cd wa-agency
npm install
node server.mjs
# Open http://localhost:3201
```

---

## Known Issues (Open)

| Issue | Severity | Status |
|-------|----------|--------|
| Calculator: 15% من 1000 = 15 (should be 150) | Medium | Open |
| Morning: weather fallback in English | Medium | Open — needs Arabic-only prompt |
| "حول X دولار" routes to price not tools | Low | Acceptable — response correct |
| Reminder: no duplicate detection | Low | Open |
| Weather: inconsistent temps (LLM guessing) | Low | Needs real API key |
| Onboarding: accepts "test" as name | Low | Open |
| proactive.mjs: not activated as cron | Low | Phase 2 |
| All cities stored as "Riyadh" | Medium | Onboarding city mapping bug |

---

## Phase 2 Roadmap

- [ ] WhatsApp Cloud API integration
- [ ] Real web search (Tavily/Groq compound)
- [ ] Voice transcription (Whisper)
- [ ] Scheduled morning briefings (cron)
- [ ] Proactive engagement messages
- [ ] Admin authentication
- [ ] Database cleanup/TTL
- [ ] Multi-language support
