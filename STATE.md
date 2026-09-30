# Project State: RTW Converter — Phases 1, 2 & 3 Certified

## مشخصات پروژه
- **نام پروژه**: `RTW Converter (React to WordPress Transpiler)`
- **نسخه فعلی**: `v1.4.0 (Phases 1, 2 & 3 Certified)`
- **اصل بنیادین حاکم**: «درستی مقدم بر گستردگی است» (Correctness before Breadth)
- **وضعیت فاز ۱**: **۱۰۰٪ تاییدشده (موتور قالب‌های کلاسیک وردپرس)**
- **وضعیت فاز ۲**: **۱۰۰٪ تاییدشده (قالب‌های بلاکی FSE، افزونه‌های ماژولار و بلوک‌های گوتنبرگ)**
- **وضعیت فاز ۳**: **۱۰۰٪ تاییدشده (ویزارد ۳ مرحله‌ای در برنامه + ابزار خط فرمان جامع CLI با پشتیبانی Git و Zip)**

---

## دستاوردهای عملیاتی به تفکیک فازها

### 🟢 فاز ۱: موتور قالب کلاسیک وردپرس (`CLASSIC_THEME`)
- آزمون رانر: `npm run test:fixtures` (۵ از ۵ قبولی کامل)
- ایزولاسیون کامل توابع با `function_exists` و کلاس‌ها با `class_exists`.
- تولید خودکار `screenshot.png` با ابعاد استاندارد ۱۲۰۰×۹۰۰.
- حذف کامل CDNهای خارجی و کامپایل استایل‌ها در `style.css`.
- تایید اجرای زنده و جلوگیری از WSOD با شبیه‌ساز `RuntimeSandbox`.

### 🟢 فاز ۲: قالب بلاکی FSE، افزونه ماژولار و بلوک گوتنبرگ
- آزمون رانر: `npm run test:phase2` (۵ از ۵ قبولی کامل)
- **قالب مدرن بلاکی FSE**: فایل `theme.json` نسخه ۳، قالب‌های HTML، پارت‌های هدر و فوتر و استایل‌های محلی.
- **افزونه ماژولار وردپرس**: شورتکد اختصاصی، صفحه تنظیمات در پیشخوان با Settings API، نانس‌های امن و هوک‌های فعال‌سازی.
- **بلوک اختصاصی گوتنبرگ**: استاندارد `block.json` نسخه ۳، رندر داینامیک سمت سرور با `get_block_wrapper_attributes` و کدهای React ادیتور.

### 🟢 فاز ۳: رابط کاربری تعاملی ۳ مرحله‌ای و ابزار CLI جامع
- **ویزارد ۳ مرحله‌ای مبتدی در اپلیکیشن**:
  - *گام ۱*: انتخاب ورودی (مخزن گیت‌هاب/گیت‌لب، آرشیو فشرده ZIP یا کدهای آماده) + تعیین نام و فرمت خروجی وردپرس.
  - *گام ۲*: خط لوله دیداری اعتبارسنجی کیفیت و اجرای شبیه‌ساز رانتایم وردپرس بدون رخداد WSOD.
  - *گام ۳*: دریافت مستقیم بسته فشرده ZIP آماده نصب وردپرس همراه با راهنمای گام‌به‌گام نصب در پیشخوان.
- **ابزار خط فرمان (`rtw-convert`)**:
  - اتصال مستقیم به هسته تبدیل `RTWCompilerEngine`.
  - کلون مستقیم از مخازن گیت‌هاب و گیت‌لب همراه با تشخیص شاخه (`--branch`).
  - استخراج ایمن آرشیوهای ZIP/TAR بدون آسیب‌پذیری path-traversal.
  - ساخت بسته فشرده ZIP نصبی با سوییچ `--zip`.

---

## کارنامه آزمون‌های کیفیت‌سنجی سراسری

دستور اجرای آزمون سراسری:
```bash
npm run test:all
```

| آزمون | عنوان و پشته | نوع خروجی | نتیجه | وضعیت خطا و امنیت |
| :--- | :--- | :--- | :--- | :--- |
| **GF-01** | Modern Portfolio (Vite + Tailwind) | قالب کلاسیک | ✅ PASS | 0 PHP Errors, Sandbox OK |
| **GF-02** | Contact Form (React + State + AJAX) | قالب کلاسیک | ✅ PASS | 0 PHP Errors, Nonce OK |
| **GF-03** | Multi-Page Blog (React Router) | قالب کلاسیک | ✅ PASS | 0 PHP Errors, Hierarchy OK |
| **GF-04** | Product Catalog (Fetch + Cards) | قالب کلاسیک | ✅ PASS | 0 PHP Errors, Loop OK |
| **GF-05** | Filter Dashboard (Complex State) | قالب کلاسیک | ✅ PASS | 0 PHP Errors, Vanilla JS OK |
| **P2-01** | Modern Portfolio | قالب بلاکی FSE | ✅ PASS | theme.json v3 Valid, 0 Errors |
| **P2-02** | Contact Form | افزونه ماژولار | ✅ PASS | Shortcode + Settings API OK |
| **P2-03** | Multi-Page Documentation | قالب بلاکی FSE | ✅ PASS | Block Templates Valid, 0 Errors |
| **P2-04** | Product Catalog | بلوک گوتنبرگ | ✅ PASS | block.json v3 + render.php OK |
| **P2-05** | Filter Dashboard | افزونه ماژولار | ✅ PASS | Activation Hooks + AJAX OK |
| **CLI-01** | CLI Git/Directory Ingestion & Zip | خط فرمان | ✅ PASS | Build & Packaging Verified |

**جمع کل: ۱۰۰٪ آزمون‌ها با موفقیت پاس شدند.**
