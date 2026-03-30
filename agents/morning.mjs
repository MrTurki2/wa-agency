// agents/morning.mjs — Morning briefing agent (weather, gold, date, quote)
import { ask } from '../core/llm.mjs'
import { fetchSafe } from '../core/fetch-safe.mjs'
import { CONFIG } from '../core/config.mjs'

export const morning = {
  getName() { return 'morning' },

  canHandle(ctx) {
    if (!ctx.text) return false
    return /صباح|تقرير|morning|briefing|يومي/.test(ctx.text.toLowerCase())
  },

  async handle(ctx) {
    const city = ctx.user?.city || 'Riyadh'
    const now = new Date()
    const dateStr = now.toLocaleDateString('ar-SA', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      calendar: 'islamic-umalqura'
    })
    const gregDate = now.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })

    // Fetch in parallel
    const [weather, gold, quote] = await Promise.allSettled([
      fetchWeather(city),
      fetchGoldPrice(),
      ask('أعطني حكمة أو مقولة تحفيزية قصيرة بالعربي (جملة واحدة فقط، بدون مقدمة)'),
    ])

    const name = ctx.user?.name || 'صديقي'
    let msg = `صباح الخير ${name}! ☀️\n\n`
    msg += `📅 ${dateStr}\n${gregDate}\n\n`

    if (weather.status === 'fulfilled' && weather.value) {
      const w = weather.value
      msg += `🌡️ الطقس في ${city}:\n`
      msg += `${w.description} — ${w.temp}°C\n`
      msg += `الرطوبة: ${w.humidity}%\n\n`
    }

    if (gold.status === 'fulfilled' && gold.value) {
      const g = gold.value
      msg += `💰 سعر الذهب:\n`
      msg += `أونصة: $${g.ounce}\n`
      msg += `جرام 24: ${g.gram24} ريال\n\n`
    }

    if (quote.status === 'fulfilled' && quote.value) {
      msg += `💡 ${quote.value}`
    }

    return msg
  }
}

async function fetchWeather(city) {
  const key = CONFIG.WEATHER_API_KEY
  if (!key) {
    const result = await ask(`What's the weather like in ${city}, Saudi Arabia today? Reply in 1 line: temp, condition.`)
    return { description: result, temp: '—', humidity: '—' }
  }
  const res = await fetchSafe(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},SA&appid=${key}&units=metric&lang=ar`)
  if (!res.ok) return null
  const data = await res.json()
  return {
    description: data.weather[0].description,
    temp: Math.round(data.main.temp),
    humidity: data.main.humidity,
  }
}

async function fetchGoldPrice() {
  const res = await fetchSafe('https://api.metalpriceapi.com/v1/latest?api_key=demo&base=XAU&currencies=USD,SAR')
  if (res.ok) {
    const data = await res.json()
    if (data?.rates?.USD) {
      const ounceUSD = 1 / data.rates.USD
      return {
        ounce: ounceUSD.toFixed(2),
        gram24: (ounceUSD / 31.1035 * (data.rates.SAR || CONFIG.USD_SAR_RATE) / data.rates.USD).toFixed(2)
      }
    }
  }
  // Fallback: ask LLM
  const result = await ask('What is the current gold price per ounce in USD? Reply with just the number.')
  return { ounce: result.trim(), gram24: '—' }
}
