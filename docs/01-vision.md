# WA Agency — Vision

## What
A WhatsApp AI assistant ("وكيل") that serves as a personal executive secretary via WhatsApp. Users text naturally in Arabic, and a team of specialized AI agents handles their requests.

## Why
- WhatsApp is the #1 messaging app in Saudi Arabia
- People want AI help without downloading new apps
- Current bots are rigid; we use LLM routing for natural conversation
- Fail-fast experiment: validate with 10 users before scaling

## How
- Message → Router (LLM classification) → Specialized Agent → Response
- 14 agents covering: prices, search, writing, tools, reminders, weather, news, entertainment
- Saudi dialect by default, professional but friendly tone
- Under 1 second average response time

## Success Metrics
- 10 daily active users within first week
- 80%+ messages handled without errors
- Average response time under 2 seconds
- Users return for 3+ days consecutively
