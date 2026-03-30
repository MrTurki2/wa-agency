// agents/weather.mjs — Dedicated weather agent (more detailed than morning)
import { ask } from '../core/llm.mjs'
import { fetchSafe } from '../core/fetch-safe.mjs'
import { CONFIG } from '../core/config.mjs'

export const weather = {
  getName() { return 'weather' },

  canHandle(ctx) {
    if (!ctx.text) return false
    return /طقس|حرارة|جو|weather|temp|rain|مطر|رطوبة|humidity/i.test(ctx.text)
  },

  async handle(ctx) {
    const city = extractCity(ctx.text) || ctx.user?.city || 'Riyadh'
    const key = CONFIG.WEATHER_API_KEY

    if (key) {
      const res = await fetchSafe(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},SA&appid=${key}&units=metric&lang=ar`
      )
      if (res.ok) {
        const d = await res.json()
        if (d?.weather?.[0]) {
          return `🌤️ الطقس في ${city}\n\n` +
            `الحالة: ${d.weather[0].description}\n` +
            `🌡️ الحرارة: ${Math.round(d.main.temp)}°C\n` +
            `🌡️ تحسسها: ${Math.round(d.main.feels_like)}°C\n` +
            `💧 الرطوبة: ${d.main.humidity}%\n` +
            `💨 الرياح: ${d.wind.speed} م/ث\n` +
            `👁️ الرؤية: ${(d.visibility / 1000).toFixed(1)} كم\n\n` +
            `⏰ ${new Date().toLocaleTimeString('ar-SA')}`
        }
      }
    }

    // Fallback: LLM
    const result = await ask(
      `What's the weather in ${city}, Saudi Arabia? Include temperature, humidity, wind. Be concise.`,
      'Provide weather info in Arabic. 3-4 lines max.'
    )
    return `🌤️ الطقس في ${city}\n\n${result}`
  }
}

function extractCity(text) {
  const cities = {
    'الرياض': 'Riyadh', 'رياض': 'Riyadh',
    'جدة': 'Jeddah', 'جده': 'Jeddah',
    'الدمام': 'Dammam', 'دمام': 'Dammam',
    'مكة': 'Mecca', 'مكه': 'Mecca',
    'المدينة': 'Medina', 'مدينة': 'Medina',
    'أبها': 'Abha', 'ابها': 'Abha',
    'الطائف': 'Taif', 'طائف': 'Taif',
    'تبوك': 'Tabuk',
    'الخبر': 'Khobar', 'خبر': 'Khobar',
    'حائل': 'Hail', 'حايل': 'Hail',
    'نجران': 'Najran',
    'جيزان': 'Jazan', 'جازان': 'Jazan',
    'الباحة': 'Baha',
    'دبي': 'Dubai',
    'الكويت': 'Kuwait',
    'البحرين': 'Bahrain',
    'القاهرة': 'Cairo',
    'اسطنبول': 'Istanbul',
    'لندن': 'London',
  }
  for (const [ar, en] of Object.entries(cities)) {
    if (text.includes(ar)) return en
  }
  return null
}
