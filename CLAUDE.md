# WA Agency — CLAUDE.md

## What Is This?
WhatsApp AI Agency — 15 specialized AI agents serving subscribers via WhatsApp.
Fail-fast experiment. Currently in simulator mode (no real WhatsApp needed).

## Architecture
```
Message → Input Validation → Rate Limit → Router (keyword/LLM) → Agent → Response
```

### Build Order
```
core/    → config, db, llm, whatsapp, fetch-safe, preferences
agents/  → router + 15 specialized agents
views/   → simulator.mjs, dashboard.mjs
server.mjs → Hono HTTP (156 lines)
scripts/ → test suites, stats, report
docs/    → numbered markdown (00-06)
```

## Agents (15 + help)
| # | Agent | Trigger | LLM? | Lines |
|---|-------|---------|------|-------|
| 1 | onboarding | no user record | No | 67 |
| 2 | help | "مساعدة", "?" | No | (in router) |
| 3 | morning | "صباح", "تقرير" | Yes | 89 |
| 4 | price | "سعر", "ذهب" | Yes | 103 |
| 5 | weather | "طقس", "حرارة" | Yes | 72 |
| 6 | search | "ابحث", "وش يعني" | Yes | 40 |
| 7 | creative | "اكتب", "صمم" | Yes | 51 |
| 8 | summary | "لخص", "اختصر" | Yes | 70 |
| 9 | reminder | "ذكرني", "مهامي" | No | 105 |
| 10 | calculator | "احسب", math expr | No | 83 |
| 11 | news | "أخبار", "ترند" | Yes | 36 |
| 12 | joke | "نكتة", "حزورة" | Yes | 38 |
| 13 | profile | "بياناتي", "غير اسمي" | No | 52 |
| 14 | tools | "ترجم", "كيو ار" | Yes | 97 |
| 15 | general | fallback | Yes | 30 |
| — | proactive | (analytics, not yet scheduled) | No | 62 |

## Tech Stack
- **Runtime:** Node.js 22+ ES Modules (.mjs), zero build step
- **HTTP:** Hono + @hono/node-server (port 3201)
- **Database:** better-sqlite3 (WAL mode) — 6 tables
- **LLM:** Groq (llama-3.3-70b, whisper-large-v3, llama-3.2-90b-vision)
- **WhatsApp:** Simulator (swap to Cloud API via core/whatsapp.mjs)

## Key Files
```
server.mjs          156 lines  Entry point, API endpoints
core/config.mjs      37 lines  Central configuration
core/db.mjs         165 lines  SQLite CRUD (users, messages, metrics, conversations, reminders, preferences)
core/llm.mjs        135 lines  Groq API (chat, classify, transcribe, analyzeImage)
core/fetch-safe.mjs  19 lines  Timeout wrapper for all external fetch
core/whatsapp.mjs    69 lines  Send/receive abstraction
core/preferences.mjs 66 lines  User preference learning
agents/router.mjs   171 lines  Keyword match + LLM classification
views/simulator.mjs 222 lines  WhatsApp-style UI
views/dashboard.mjs  80 lines  Analytics dashboard
```

## Security
- **No eval/Function:** Calculator uses safe tokenizer
- **API key validation:** Throws on missing GROQ_API_KEY, warns on startup
- **Fetch timeout:** All external calls have 10-30s timeout via fetchSafe
- **Input validation:** Max 5000 chars, phone format check
- **Rate limiting:** 30 req/min per phone
- **Graceful shutdown:** SIGTERM/SIGINT close DB properly

## URLs
- Simulator: http://localhost:3201
- Dashboard: http://localhost:3201/dashboard
- Stats API: http://localhost:3201/api/stats
- Health: http://localhost:3201/health

## Rules
- Port: 3201 (check with lsof before starting)
- File limit: 300 lines warn, 500 must-split (all files compliant)
- Dependencies: 2 only (hono, better-sqlite3)
- Arabic (Saudi dialect) for bot responses
- Never commit config/.env

## Testing
```bash
node scripts/test-personas.mjs     # 10 personas × 31 messages
node scripts/test-all-agents.mjs   # all agents
node scripts/test-stress.mjs       # edge cases + concurrent
node scripts/test-advanced.mjs     # new features
node scripts/report.mjs            # admin report
node scripts/stats.mjs             # quick stats
```

## Current Status
Phase 1 MVP: ✅ COMPLETE
Phase 1.1 Security: ✅ COMPLETE
- 15 agents, all tested, all under 300 lines
- 750+ messages processed, 0 crashes
- 95.2% routing accuracy
- See STATUS.md for full checklist
