// agents/calculator.mjs — Math/calculation agent (safe eval, no Function())
import { ask } from '../core/llm.mjs'

const OPS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => b === 0 ? NaN : a / b,
}

export const calculator = {
  getName() { return 'calculator' },

  canHandle(ctx) {
    if (!ctx.text) return false
    return /^(احسب|حاسبة|calc|calculate|كم يساوي|كم =|\d+\s*[\+\-\*\/\×\÷])/i.test(ctx.text.trim())
  },

  async handle(ctx) {
    const text = ctx.text.replace(/^(احسب|حاسبة|calc|calculate|كم يساوي)\s*/i, '').trim()
    if (!text) return '🧮 عطني العملية الحسابية\nمثال: احسب 150 × 3.75'

    // Normalize Arabic math symbols
    const normalized = text.replace(/×/g, '*').replace(/÷/g, '/').replace(/٪/g, '%')

    // Safe eval: only support "number op number" chains
    const result = safeMath(normalized)
    if (result !== null) {
      return `🧮 ${text} = ${result.toLocaleString()}`
    }

    // Percentage: "15% من 1000" or "15% of 1000"
    const pctMatch = normalized.match(/^([\d.]+)\s*%\s*(?:من|of|×|x|\*)?\s*([\d.]+)$/)
    if (pctMatch) {
      const val = (parseFloat(pctMatch[1]) / 100) * parseFloat(pctMatch[2])
      return `🧮 ${text} = ${val.toLocaleString()}`
    }

    // Complex math → LLM fallback
    const llmResult = await ask(
      `احسب هذا: "${text}"\nأعطني النتيجة مباشرة مع خطوات مختصرة إذا كانت معقدة.`,
      'أنت آلة حاسبة ذكية. أجب بالنتيجة أولاً ثم الخطوات إذا لزم.'
    )
    return `🧮 ${llmResult}`
  }
}

// Safe math: parse "a op b op c" without eval/Function
function safeMath(expr) {
  // Tokenize: split into numbers and operators
  const tokens = expr.match(/([\d.]+|[\+\-\*\/])/g)
  if (!tokens || tokens.length < 3 || tokens.length % 2 === 0) return null

  // Validate: must alternate number-operator-number
  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 0) {
      if (isNaN(parseFloat(tokens[i]))) return null
    } else {
      if (!OPS[tokens[i]]) return null
    }
  }

  // Evaluate: respect operator precedence (* / before + -)
  // Pass 1: handle * and /
  const simplified = [parseFloat(tokens[0])]
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i]
    const num = parseFloat(tokens[i + 1])
    if (op === '*' || op === '/') {
      simplified[simplified.length - 1] = OPS[op](simplified[simplified.length - 1], num)
    } else {
      simplified.push(op, num)
    }
  }

  // Pass 2: handle + and -
  let result = typeof simplified[0] === 'number' ? simplified[0] : parseFloat(simplified[0])
  for (let i = 1; i < simplified.length; i += 2) {
    result = OPS[simplified[i]](result, parseFloat(simplified[i + 1]))
  }

  return isFinite(result) ? result : null
}
