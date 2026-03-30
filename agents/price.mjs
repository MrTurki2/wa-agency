// agents/price.mjs — Real-time price agent (gold, crypto, currencies, stocks)
import { ask } from '../core/llm.mjs'
import { fetchSafe } from '../core/fetch-safe.mjs'
import { CONFIG } from '../core/config.mjs'

export const price = {
  getName() { return 'price' },

  canHandle(ctx) {
    if (!ctx.text) return false
    return /سعر|كم سعر|price|gold|ذهب|بتكوين|bitcoin|دولار|ريال|crypto|stock|عمل/.test(ctx.text.toLowerCase())
  },

  async handle(ctx) {
    const text = ctx.text.trim()
    const asset = detectAsset(text)

    let priceData = null
    try {
      priceData = await fetchPrice(asset)
    } catch (e) {
      console.warn('Price fetch failed:', e.message)
    }

    if (priceData) {
      return formatPriceResponse(asset, priceData)
    }

    // Fallback: LLM
    const answer = await ask(
      `المستخدم يسأل: "${text}"\nأجب عن السعر المطلوب بشكل مختصر ودقيق. اذكر أن الأسعار تقريبية.`,
      'أنت مساعد أسعار متخصص. أجب بالعربي بشكل مختصر.'
    )
    return answer
  }
}

function detectAsset(text) {
  const t = text.toLowerCase()
  if (/ذهب|gold|xau/.test(t)) return { type: 'gold', name: 'الذهب' }
  if (/فض|silver|xag/.test(t)) return { type: 'silver', name: 'الفضة' }
  if (/بتكوين|bitcoin|btc/.test(t)) return { type: 'bitcoin', name: 'بيتكوين' }
  if (/ايثر|ethereum|eth/.test(t)) return { type: 'ethereum', name: 'إيثيريوم' }
  if (/دولار|dollar|usd/.test(t)) return { type: 'usd_sar', name: 'الدولار/ريال' }
  if (/يورو|euro|eur/.test(t)) return { type: 'eur_sar', name: 'اليورو/ريال' }
  if (/نفط|oil|brent|crude/.test(t)) return { type: 'oil', name: 'النفط' }
  return { type: 'unknown', name: text, query: text }
}

async function fetchPrice(asset) {
  // Crypto (free CoinGecko API)
  if (['bitcoin', 'ethereum'].includes(asset.type)) {
    const id = asset.type
    const res = await fetchSafe(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd,sar&include_24hr_change=true`)
    if (!res.ok) return null
    const data = await res.json()
    const coin = data?.[id]
    if (!coin) return null
    return {
      usd: coin.usd?.toLocaleString(),
      sar: coin.sar?.toLocaleString(),
      change24h: coin.usd_24h_change?.toFixed(2),
    }
  }

  // USD/SAR (pegged, but fetch real rate)
  if (asset.type === 'usd_sar') {
    const res = await fetchSafe('https://api.exchangerate-api.com/v4/latest/USD')
    if (res.ok) {
      const data = await res.json()
      if (data?.rates?.SAR) {
        return { usd: '1', sar: data.rates.SAR.toFixed(4), change24h: '0.00' }
      }
    }
    return { usd: '1', sar: String(CONFIG.USD_SAR_RATE), change24h: '0.00' }
  }

  // EUR/SAR
  if (asset.type === 'eur_sar') {
    const res = await fetchSafe('https://api.exchangerate-api.com/v4/latest/EUR')
    if (res.ok) {
      const data = await res.json()
      if (data?.rates) {
        return { usd: data.rates.USD?.toFixed(4), sar: data.rates.SAR?.toFixed(4), change24h: '—' }
      }
    }
  }

  return null
}

function formatPriceResponse(asset, data) {
  const changeEmoji = parseFloat(data.change24h) >= 0 ? '📈' : '📉'

  let msg = `💰 سعر ${asset.name}\n\n`
  if (data.usd) msg += `USD: $${data.usd}\n`
  if (data.sar) msg += `SAR: ${data.sar} ريال\n`
  if (data.change24h && data.change24h !== '—') {
    msg += `${changeEmoji} التغير (24h): ${data.change24h}%\n`
  }
  msg += `\n⏰ ${new Date().toLocaleTimeString('ar-SA')}`
  return msg
}
