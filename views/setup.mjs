// views/setup.mjs — WhatsApp setup page (QR + Pairing Code)

export function setupHTML() {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WA Agency — Setup</title>
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, 'Segoe UI', sans-serif;
      background: #111b21;
      color: #e9edef;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .card {
      background: #1f2c34;
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      max-width: 460px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .subtitle { color: #8696a0; font-size: 14px; margin-bottom: 24px; }
    #qr-container {
      background: #fff;
      border-radius: 12px;
      padding: 16px;
      display: inline-block;
      margin: 16px 0;
    }
    #qr-container canvas { display: block; }
    .status {
      font-size: 16px;
      padding: 12px 24px;
      border-radius: 8px;
      margin-top: 16px;
    }
    .status.connecting { background: #2a3942; color: #ffc107; }
    .status.open { background: #0a3622; color: #25d366; }
    .status.disconnected { background: #3b1a1a; color: #ef5350; }
    .divider {
      margin: 24px 0;
      border-top: 1px solid #2a3942;
      position: relative;
    }
    .divider span {
      background: #1f2c34;
      padding: 0 12px;
      position: relative;
      top: -12px;
      color: #8696a0;
      font-size: 13px;
    }
    .pair-section { margin-top: 8px; }
    .pair-input {
      background: #2a3942;
      border: 1px solid #3b4a54;
      border-radius: 8px;
      padding: 12px 16px;
      color: #e9edef;
      font-size: 18px;
      width: 220px;
      text-align: center;
      direction: ltr;
      letter-spacing: 2px;
      outline: none;
    }
    .pair-input:focus { border-color: #25d366; }
    .pair-btn {
      background: #25d366;
      color: #111b21;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 12px;
      display: block;
      width: 220px;
      margin-left: auto;
      margin-right: auto;
    }
    .pair-btn:hover { background: #1da851; }
    .pair-btn:disabled { background: #3b4a54; cursor: not-allowed; }
    .pair-code {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 8px;
      color: #25d366;
      margin: 16px 0;
      direction: ltr;
      font-family: monospace;
    }
    .pair-hint {
      color: #8696a0;
      font-size: 12px;
      margin-top: 8px;
    }
    .steps {
      text-align: right;
      margin-top: 20px;
      font-size: 13px;
      color: #8696a0;
      line-height: 2;
    }
    .steps b { color: #e9edef; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🔗 ربط الواتساب</h1>
    <p class="subtitle">اختر طريقة الربط</p>

    <div id="qr-container" style="display:none">
      <canvas id="qr-canvas"></canvas>
    </div>

    <div id="status" class="status disconnected">جاري الاتصال...</div>

    <div class="divider"><span>أو ربط برقم الجوال</span></div>

    <div class="pair-section">
      <input id="phone-input" class="pair-input" type="tel"
             placeholder="966501234567" maxlength="15">
      <button id="pair-btn" class="pair-btn" onclick="requestPair()">أرسل كود الربط</button>
      <div id="pair-code" class="pair-code" style="display:none"></div>
      <div id="pair-steps" style="display:none" class="steps">
        <b>1.</b> افتح واتساب → الإعدادات → الأجهزة المرتبطة<br>
        <b>2.</b> اضغط "ربط جهاز"<br>
        <b>3.</b> اضغط "الربط برقم الهاتف بدلاً من ذلك"<br>
        <b>4.</b> أدخل الكود اللي فوق
      </div>
      <p class="pair-hint">أدخل رقمك بدون + (مثل 966501234567)</p>
    </div>
  </div>

  <script>
    const statusEl = document.getElementById('status')
    const qrContainer = document.getElementById('qr-container')
    const qrCanvas = document.getElementById('qr-canvas')
    const pairCodeEl = document.getElementById('pair-code')
    const pairStepsEl = document.getElementById('pair-steps')
    const pairBtn = document.getElementById('pair-btn')
    let lastQR = ''

    async function requestPair() {
      const phone = document.getElementById('phone-input').value.replace(/\\D/g, '')
      if (!phone || phone.length < 10) {
        alert('أدخل رقم صحيح')
        return
      }
      pairBtn.disabled = true
      pairBtn.textContent = 'جاري الإرسال...'
      try {
        await fetch('/api/wa-pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        })
      } catch {}
      pairBtn.textContent = 'انتظر الكود...'
    }

    async function poll() {
      try {
        const res = await fetch('/api/wa-status')
        const data = await res.json()

        if (data.status === 'open') {
          statusEl.className = 'status open'
          statusEl.textContent = '✅ متصل! البوت شغال الحين'
          qrContainer.style.display = 'none'
          pairCodeEl.style.display = 'none'
          pairStepsEl.style.display = 'none'
          pairBtn.style.display = 'none'
        } else if (data.status === 'connecting' && data.qr) {
          statusEl.className = 'status connecting'
          statusEl.textContent = '📱 امسح الكود أو استخدم رقم الجوال'
          qrContainer.style.display = 'inline-block'
          if (data.qr !== lastQR) {
            lastQR = data.qr
            QRCode.toCanvas(qrCanvas, data.qr, { width: 260, margin: 0 })
          }
        } else {
          statusEl.className = 'status disconnected'
          statusEl.textContent = '⏳ جاري الاتصال...'
          qrContainer.style.display = 'none'
        }

        if (data.pairingCode) {
          pairCodeEl.textContent = data.pairingCode
          pairCodeEl.style.display = 'block'
          pairStepsEl.style.display = 'block'
          pairBtn.textContent = 'أدخل الكود في واتساب'
          pairBtn.disabled = true
        }
      } catch {}
      setTimeout(poll, 1500)
    }
    poll()
  </script>
</body>
</html>`
}
