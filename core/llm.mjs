// core/llm.mjs — LLM service (Groq primary)
import { CONFIG } from './config.mjs'
import { fetchSafe } from './fetch-safe.mjs'

function getKey() {
  if (!CONFIG.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not set. Add it to config/.env or environment.')
  }
  return CONFIG.GROQ_API_KEY
}

function groqHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getKey()}`,
  }
}

// ─── Main chat function ──────────────────

export async function chat(messages, options = {}) {
  const {
    system = null,
    model = CONFIG.GROQ_MODEL,
    temperature = 0.7,
    maxTokens = 1024,
    json = false,
  } = options

  const allMessages = []
  if (system) allMessages.push({ role: 'system', content: system })
  allMessages.push(...messages)

  const start = Date.now()

  const body = {
    model,
    messages: allMessages,
    temperature,
    max_tokens: maxTokens,
  }
  if (json) body.response_format = { type: 'json_object' }

  const res = await fetchSafe(CONFIG.GROQ_URL, {
    method: 'POST',
    headers: groqHeaders(),
    body: JSON.stringify(body),
  }, 15000) // LLM gets 15s timeout

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const choice = data.choices?.[0]

  return {
    content: choice?.message?.content || '',
    tokens: data.usage?.total_tokens || 0,
    ms: Date.now() - start,
  }
}

// ─── Quick helpers ───────────────────────

export async function ask(prompt, system = null) {
  const result = await chat([{ role: 'user', content: prompt }], { system })
  return result.content
}

export async function classify(text, categories, system = null) {
  const sysPrompt = system || `You are a message classifier. Classify the user message into exactly ONE of these categories: ${categories.join(', ')}.
Reply with ONLY the category name, nothing else.`

  const result = await chat(
    [{ role: 'user', content: text }],
    { system: sysPrompt, temperature: 0.1, maxTokens: 50 }
  )
  const answer = result.content.trim().toLowerCase()
  const match = categories.find(c => answer.includes(c.toLowerCase()))
  return { category: match || categories[categories.length - 1], tokens: result.tokens, ms: result.ms }
}

export async function chatWithHistory(history, userMessage, system) {
  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage }
  ]
  return chat(messages, { system })
}

// ─── Voice transcription via Groq Whisper ──

export async function transcribe(audioBuffer, filename = 'audio.ogg') {
  const formData = new FormData()
  formData.append('file', new Blob([audioBuffer]), filename)
  formData.append('model', 'whisper-large-v3')
  formData.append('language', 'ar')

  const res = await fetchSafe('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getKey()}` },
    body: formData,
  }, 30000) // Whisper gets 30s

  if (!res.ok) throw new Error(`Transcription error: ${res.status}`)
  const data = await res.json()
  return data?.text || ''
}

// ─── Image analysis via Groq Vision ──────

export async function analyzeImage(imageUrl, prompt = 'صف هذه الصورة بالتفصيل') {
  const res = await fetchSafe(CONFIG.GROQ_URL, {
    method: 'POST',
    headers: groqHeaders(),
    body: JSON.stringify({
      model: CONFIG.GROQ_VISION_MODEL,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  }, 20000) // Vision gets 20s

  if (!res.ok) throw new Error(`Vision error: ${res.status}`)
  const data = await res.json()
  return data?.choices?.[0]?.message?.content || ''
}
