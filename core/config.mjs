// core/config.mjs — Central configuration

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '3201'),
  DB_PATH: process.env.DB_PATH || 'data/wa-agency.db',

  // LLM
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_URL: process.env.GROQ_URL || 'https://api.groq.com/openai/v1/chat/completions',
  GROQ_MODEL: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  GROQ_VISION_MODEL: process.env.GROQ_VISION_MODEL || 'llama-3.2-90b-vision-preview',

  // APIs
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
  GOLD_API_KEY: process.env.GOLD_API_KEY || '',

  // Limits
  MAX_MESSAGE_LENGTH: 5000,
  MAX_CONVERSATION_HISTORY: 20,
  FETCH_TIMEOUT_MS: 10000,
  RATE_LIMIT_PER_MINUTE: 30,

  // Currency (fallback)
  USD_SAR_RATE: parseFloat(process.env.USD_SAR_RATE || '3.75'),
}

// Validate critical keys at startup
export function validateConfig() {
  const warnings = []
  if (!CONFIG.GROQ_API_KEY) {
    warnings.push('GROQ_API_KEY not set — LLM features will fail')
  }
  if (!CONFIG.WEATHER_API_KEY) {
    warnings.push('WEATHER_API_KEY not set — weather will use LLM fallback')
  }
  return warnings
}
