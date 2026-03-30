# WA Agency — Architecture

## System Flow
```
User (WhatsApp) → Webhook/Simulator → Router Agent → Specific Agent → Response → WhatsApp
                                          ↓
                                    LLM Classification
                                    (Groq llama-3.3-70b)
                                          ↓
                                    Quick Match (keywords)
                                    or LLM Intent Detection
```

## Components

### Core Layer (`core/`)
| Module | Purpose | Dependencies |
|--------|---------|-------------|
| db.mjs | SQLite via better-sqlite3 | 0 |
| llm.mjs | Groq API (chat, classify, vision, whisper) | 0 |
| whatsapp.mjs | Message send/receive abstraction | 0 |

### Agents Layer (`agents/`)
14 agents, each implementing: `getName()`, `canHandle(ctx)`, `handle(ctx)`

### Server (`server.mjs`)
Hono HTTP server with:
- POST /api/send — process incoming message
- GET /api/stats — system statistics
- GET /api/messages/:phone — conversation history
- GET /api/users — user list
- GET /api/engagement/:phone — user engagement
- GET / — WhatsApp simulator UI
- GET /dashboard — analytics dashboard

## Data Flow
```
Message In → getUser(phone) → route(phone, text)
                                ├── quickMatch() → agent (0ms)
                                └── classify() → agent (~200ms)
                                      ↓
                              agent.handle(ctx)
                                      ↓
                              saveMessage() + addToConversation()
                              logMetric() + touchUser()
                                      ↓
                              sendMessage(phone, response)
```

## Database Schema
- `users` — registered users (phone, name, city)
- `messages` — all messages in/out with agent attribution
- `conversations` — rolling context window (last 20 per user)
- `metrics` — agent performance (response time, tokens)
- `reminders` — user tasks and reminders
