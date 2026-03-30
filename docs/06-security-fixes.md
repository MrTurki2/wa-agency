# WA Agency — Security & Quality Fixes

## Date: 2026-03-30

## Overview
Deep code review revealed 20 issues across 3 severity levels.
All critical and important issues were fixed in one session.

## P0 — Critical Security (Fixed)

### 1. Code Injection in Calculator
- **Before:** `Function('"use strict"; return (' + input + ')')()` — user input executed as code
- **After:** Safe tokenizer that only allows numbers and `+-*/` operators
- **File:** `agents/calculator.mjs` — complete rewrite with `safeMath()` function
- **Risk eliminated:** Remote code execution

### 2. API Key Validation
- **Before:** Empty string sent to Groq API if key missing → cryptic errors
- **After:** `getKey()` throws clear error: `"GROQ_API_KEY not set"`
- **File:** `core/llm.mjs`
- **Bonus:** `validateConfig()` prints warnings at startup for missing keys

### 3. Fetch Timeout Protection
- **Before:** All `fetch()` calls could hang indefinitely
- **After:** `fetchSafe()` wrapper with configurable timeout (default 10s)
- **File:** `core/fetch-safe.mjs` (new)
- **Applied to:** llm.mjs (15s), morning.mjs, price.mjs, weather.mjs, summary.mjs
- **Timeouts:** LLM=15s, Vision=20s, Whisper=30s, External APIs=10s

### 4. Input Validation
- **Before:** No limits on message length or phone format
- **After:** `MAX_MESSAGE_LENGTH: 5000`, phone length 10-15 chars
- **File:** `server.mjs` — validation before processing

## P1 — Important Quality (Fixed)

### 5. Rate Limiting
- **Before:** Anyone could spam the API unlimited
- **After:** 30 requests/minute per phone number (in-memory Map)
- **File:** `server.mjs` — `checkRateLimit()` with auto-cleanup every 5 minutes
- **Response:** HTTP 429 with Arabic message

### 6. Graceful Shutdown
- **Before:** DB connection left open on process exit → potential data loss
- **After:** `SIGTERM`/`SIGINT` handlers call `closeDb()` before exit
- **File:** `server.mjs`

### 7. Unused Imports Cleaned
| File | Removed |
|------|---------|
| `agents/onboarding.mjs` | `import { ask }` (never used) |
| `agents/general.mjs` | `import { chat }` (only chatWithHistory used) |
| `server.mjs` | `serveStatic`, `receiveMessage`, `onMessage`, `getOutgoing` |

### 8. Central Configuration
- **Before:** Hardcoded values scattered across files (model names, URLs, limits)
- **After:** `core/config.mjs` — single source of truth
- **Includes:** GROQ_URL, GROQ_MODEL, USD_SAR_RATE, MAX_MESSAGE_LENGTH, RATE_LIMIT, FETCH_TIMEOUT

## P2 — Polish (Fixed)

### 9. HTML Separated from Server
- **Before:** `server.mjs` = 581 lines (HTML + JS + CSS mixed with server logic)
- **After:** `server.mjs` = 156 lines (pure API logic)
- **New files:** `views/simulator.mjs` (222 lines), `views/dashboard.mjs` (80 lines)
- **All files now under 300 lines** — within project health limits

## Files Changed

| File | Action | Lines |
|------|--------|-------|
| `agents/calculator.mjs` | Rewritten (safe math) | 83 |
| `core/llm.mjs` | Updated (validation + fetchSafe + config) | 135 |
| `core/config.mjs` | New (central config) | 37 |
| `core/fetch-safe.mjs` | New (timeout wrapper) | 19 |
| `server.mjs` | Refactored (rate limit, validation, split HTML) | 156 |
| `views/simulator.mjs` | New (extracted from server) | 222 |
| `views/dashboard.mjs` | New (extracted from server) | 80 |
| `agents/morning.mjs` | Updated (fetchSafe + parallel) | 89 |
| `agents/price.mjs` | Updated (fetchSafe + config) | 103 |
| `agents/weather.mjs` | Updated (fetchSafe + config) | 72 |
| `agents/summary.mjs` | Updated (fetchSafe) | 70 |
| `agents/onboarding.mjs` | Cleaned (removed unused import) | 67 |
| `agents/general.mjs` | Cleaned (removed unused import) | 30 |

## Test Results After Fixes
- All-agents test: 20/21 (95.2%) — same routing ambiguity, response still correct
- Calculator safe: `احسب 250 × 4 = 1,000` ✅
- Rate limit working: returns 429 on spam ✅
- Input validation: rejects 5000+ char messages ✅
- Graceful shutdown: DB closes on SIGINT ✅

## Remaining Known Issues (Deferred)
| Issue | Severity | Reason for deferral |
|-------|----------|-------------------|
| No TypeScript | Medium | Faster iteration in JS for MVP |
| proactive.mjs not activated | Low | Needs cron scheduler |
| Audio transcription stubbed | Low | Needs real WhatsApp media download |
| No authentication on API | Medium | Simulator-only for now |
| No database TTL cleanup | Low | Scale not reached yet |
