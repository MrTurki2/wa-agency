# WA Agency — Agent Design

## Agent Interface
Every agent exports an object with 3 methods:

```javascript
export const myAgent = {
  getName()       // → string: unique agent identifier
  canHandle(ctx)  // → boolean: can this agent handle this message?
  handle(ctx)     // → string: the response to send back
}
```

## Context Object
```javascript
ctx = {
  phone,      // sender phone number
  text,       // message text
  type,       // 'text' | 'image' | 'audio' | 'document'
  mediaUrl,   // URL of media attachment (if any)
  user,       // user record from DB (null if not registered)
  timestamp,  // ISO timestamp
}
```

## Router Strategy
1. **No user?** → Onboarding (always)
2. **Help command?** → Help menu (static)
3. **Quick match?** → Keyword regex (0ms, no LLM cost)
4. **Media?** → Tools agent
5. **LLM classify** → Groq llama-3.3-70b (~200ms, 50 tokens)
6. **Fallback** → General agent

## Quick Match vs LLM Classification
Quick match handles ~60% of messages with zero latency. LLM handles ambiguous cases.

| Message | Quick Match | LLM |
|---------|------------|-----|
| "سعر الذهب" | ✅ price | — |
| "كم سعر البتكوين" | ✅ price | — |
| "وش أفضل مطاعم" | ❌ | ✅ search |
| "سوي لي QR" | ✅ tools | — |
| "الجو حار اليوم" | ❌ | ✅ weather |

## Adding a New Agent
1. Create `agents/myagent.mjs` with the 3 methods
2. Import in `router.mjs`
3. Add to `agents` array
4. Add keywords to `quickMatch()` if applicable
5. Add category to LLM classification prompt
6. Test with persona messages
