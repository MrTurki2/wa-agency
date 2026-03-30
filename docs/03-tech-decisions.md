# WA Agency — Tech Decisions

## Node.js 22+ with ES Modules (.mjs)
**Why:** Native fetch, native WebSocket, top-level await. No build step needed.
**Tradeoff:** No TypeScript — faster iteration, less type safety.

## Hono (HTTP framework)
**Why:** 14KB, fast, familiar API, works with Node.js adapter.
**Alternative rejected:** Express (heavier), Fastify (more setup).

## better-sqlite3 (database)
**Why:** Synchronous API is simpler and faster for our scale. WAL mode for concurrent reads.
**Alternative rejected:** PostgreSQL (overkill for 10 users), Drizzle (unnecessary abstraction).

## Groq (LLM)
**Why:** Fast inference (~200ms for classification), free tier generous, OpenAI-compatible API.
**Models used:**
- `llama-3.3-70b-versatile` — routing, chat, search, creative
- `llama-3.2-90b-vision-preview` — image analysis
- `whisper-large-v3` — audio transcription

## WhatsApp Simulator (not Baileys)
**Why:** Baileys requires WhatsApp login and risks account ban. Simulator lets us iterate freely.
**Migration path:** Core `whatsapp.mjs` abstraction makes switching to Cloud API a config change.

## Zero Build Step
**Why:** Direct `node server.mjs` — no compilation, no bundling, no waiting.
**Tradeoff:** No JSX, no SCSS — inline HTML/CSS in server.mjs.
