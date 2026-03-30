// views/setup.mjs — WhatsApp QR setup page

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
      max-width: 420px;
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
    <p class="subtitle">امسح الكود من واتساب على جوالك</p>

    <div id="qr-container" style="display:none">
      <canvas id="qr-canvas"></canvas>
    </div>

    <div id="status" class="status disconnected">جاري الاتصال...</div>

    <div class="steps">
      <b>1.</b> افتح واتساب على جوالك<br>
      <b>2.</b> روح الإعدادات → الأجهزة المرتبطة<br>
      <b>3.</b> اضغط "ربط جهاز"<br>
      <b>4.</b> امسح الكود اللي فوق
    </div>
  </div>

  <script>
    const statusEl = document.getElementById('status')
    const qrContainer = document.getElementById('qr-container')
    const qrCanvas = document.getElementById('qr-canvas')
    let lastQR = ''

    async function poll() {
      try {
        const res = await fetch('/api/wa-status')
        const data = await res.json()

        if (data.status === 'open') {
          statusEl.className = 'status open'
          statusEl.textContent = '✅ متصل! البوت شغال الحين'
          qrContainer.style.display = 'none'
        } else if (data.status === 'connecting' && data.qr) {
          statusEl.className = 'status connecting'
          statusEl.textContent = '📱 امسح الكود...'
          qrContainer.style.display = 'inline-block'
          if (data.qr !== lastQR) {
            lastQR = data.qr
            QRCode.toCanvas(qrCanvas, data.qr, { width: 280, margin: 0 })
          }
        } else {
          statusEl.className = 'status disconnected'
          statusEl.textContent = '⏳ جاري الاتصال...'
          qrContainer.style.display = 'none'
        }
      } catch {}
      setTimeout(poll, 1500)
    }
    poll()
  </script>
</body>
</html>`
}
