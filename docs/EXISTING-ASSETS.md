# الأصول الموجودة — ما نملكه قبل ما نبني

> مراجع من أرشيف المشاريع — لا تبني من الصفر ما هو موجود بالفعل
> المصادر: `PROJECTS-INVENTORY.md` · `PROJECTS-INVENTORY-python.md` · `projects-map-2026.md`

---

## المشاريع الأقرب لفكرة WA Agency

### 🥇 غلا — `R-D/claude-cli`

أقرب مشروع موجود لفكرة WA Agency. **نفس المفهوم بالضبط.**

```
الفرق الوحيد:   غلا = سكرتير ذكي على تيليقرام
                WA Agency = نفس الفكرة على واتساب
```

```
الوضع:   35.6 ساعة عمل  — ناضج ومجرَّب
الوصف:  تيليقرام بوت يدير المهام والتذكيرات وينفذ أوامر
الموقع: /Users/mrturki/Code/R-D/claude-cli/
```

**اللي يمكن نقله إلى WA Agency:**
- منطق تفسير الأوامر
- إدارة المهام والتذكيرات
- نمط المحادثة مع اللغة العربية
- ربط LLM بالأوامر المنفذة

---

### 🥈 turki-agent — `nodejs/turki-agent`

```
الوضع:   120 ساعة عمل — أكثر مشروع استثماراً في الوقت
الوصف:   وكيل تركي — أداة رئيسية
الموقع:  /Users/mrturki/Code/nodejs/turki-agent/
```

**احتمال يحتوي على:** نمط وكيل متقدم — يستحق مراجعة قبل البناء

---

### 🥉 twilio-whatsap — `nodejs/twilio-whatsap`

```
الوضع:  مشروع WhatsApp جاهز ومرفوع على GitHub
URL:    twilio-whatsapp-bot.workers.dev
CF:     D1 + Durable Objects
Stack:  Hono + CF Workers
```

**اللي يمكن نقله:**
- WhatsApp webhook handler
- Message routing pattern
- D1 schema للرسائل والمستخدمين
- Durable Objects للجلسات

---

## أدوات Node.js قابلة للاستخدام

| المشروع | المسار | الاستخدام في WA Agency | CF Services |
|---------|--------|------------------------|-------------|
| `telegram` (kapps-bot) | `nodejs/telegram` | نمط بوت متكامل — D1+KV+R2+DO | ✅ كامل |
| `war-room-telegram` | `nodejs/war-room-telegram` | تنسيق وكلاء + Hono | D1 + KV |
| `CiS-Ksa-Bot` | `nodejs/CiS-Ksa-Bot` | تجربة بوت حكومي | D1 + KV |
| `tibi.tj.sa` | `nodejs/tibi.tj.sa` | Dashboard pattern + BI | Hono + D1 |

---

## أدوات Python قابلة للاستخدام

| المشروع | المسار | الوكيل المستفيد | ملاحظات |
|---------|--------|-----------------|---------|
| `whtsapp-api` | `python/whtsapp-api` | WhatsApp Service | اختبار API مبكر |
| `resend` | `python/resend` | Secretary Agent | إرسال إيميل |
| `voice-to-text` | `python/voice-to-text` | Analyzer Agent | Whisper/STT |
| `images-ocr` | `python/images-ocr` | Analyzer Agent | قراءة نص من صور |
| `images-ocr2` | `python/images-ocr2` | Analyzer Agent | نسخة محسّنة |
| `images-ocr3` | `python/images-ocr3` | Analyzer Agent | نسخة محسّنة |
| `pdf-to-text-by-ai-lab` | `python/pdf-to-text-by-ai-lab` | Analyzer Agent | 10 commits — ناضج |
| `turki_agent` | `python/turki_agent` | Reference | نمط وكيل |
| `Grok` | `python/Grok` | LLM Service | Groq integration |
| `notion` | `python/notion` | Secretary Agent | إدارة مهام |
| `google-analytics` | `python/google-analytics` | Metrics | 9 commits — جاهز |

---

## الإحصائيات الكاملة للأرشيف

```
Node.js:    41  مشروع  (25 git · 10 على GitHub)
Python:    151  مشروع  (23 git)
CF Workers: 16  worker على Cloudflare
D1 DB:       8  قاعدة بيانات
KV:          9  namespace
```

---

## خريطة المشاريع النشطة 2026

```
الدوام:        NCNP (prodsight + ncnp-brain8) — الأولوية
المنتجات:      qr1.pro (رئيسي) · pentagi (SOC) · Browser-Agents
الأدوات:       غلا + tibi + turki-agent + tilogs + tt
العملاء:       almousa · arriyadiyah · mscs-ai
الأجر:         athkeri.com · tahannuth
```

**WA Agency = مشروع Fail-Fast جديد — لا يتعارض مع الأولويات الحالية**

---

## ما يجب مراجعته قبل البناء

بهذا الترتيب:

```
1. R-D/claude-cli/          ← غلا — أقرب مشروع للفكرة
2. nodejs/turki-agent/      ← 120 ساعة — وش بنى؟
3. nodejs/twilio-whatsap/   ← WhatsApp code جاهز
4. nodejs/telegram/         ← kapps-bot — أفضل بوت عندنا
```

---

## التوصية

> قبل ما تكتب سطر كود — افتح `R-D/claude-cli` وشوف وش موجود.
> غالباً ٦٠٪ من اللي تحتاجه موجود وجاهز.

---

*آخر تحديث: 2026-03-27*
