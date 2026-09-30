# ⚡ RTW Converter (React to WordPress Transpiler)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WordPress: 6.7+](https://img.shields.io/badge/WordPress-6.7%2B-21759B.svg)](https://wordpress.org)
[![Principle: Correctness Before Breadth](https://img.shields.io/badge/Principle-Correctness_Before_Breadth-blueviolet.svg)](ROADMAP.md)

موتور تبدیل ساختاریافته کدهای مدرن React / Next.js به ساختارهای استاندارد وردپرس (Classic Themes, FSE Block Themes, Plugins, Gutenberg Blocks) با تاکید بر ایزولاسیون کامل، استقلال ۱۰۰٪ از CDN، و اعتبارسنجی رانتایم.

---

## ⚠️ سیاست دامنه و انجماد ماژول‌ها (Phase 0 Scope Freeze)

طبق سیاست سخت‌گیرانه **«درستی مقدم بر گستردگی است» (Correctness before Breadth)**، تمرکز تیم فنی منحصراً بر هسته تبدیل (`core-engine/`)، آزمون‌های فیکسچر و هارنس اعتبارسنجی است.

کلیه ماژول‌های زیر تا زمان تکمیل و اثبات فازهای پایه به صورت رسمی **منجمد** شده‌اند و در حال حاضر تحت توسعه فعال قرار ندارند:
- `apps/desktop/` (کلاینت دسکتاپ)
- `app/` (اپلیکیشن اندروید)
- `pwa/` (وب‌اپلیکیشن پیش‌رونده)
- `docker-compose.yml`
- تمامی ۷ پایپلاین `.github/workflows/`
- `api-service/` (میکروسرویس وب‌هوک)
- بخش‌های مرتبط با رمزنگاری AES-256 یا پرداخت در `wp-github-bridge/`

برای مشاهده جزئیات فازبندی و تعاریف پذیرش به [ROADMAP.md](ROADMAP.md) مراجعه نمایید.

---

## 🏛️ ساختار فعال مخزن

```text
rtw-converter/
├── core-engine/                # هسته اصلی تحلیل AST، تولید خروجی و هارنس اعتبارسنجی
│   ├── src/
│   │   ├── ingestion/          # تشخیص پشته ورودی (Vite, Next, Pure React)
│   │   ├── parser/             # تحلیلگر AST و رجیستری نمادها
│   │   ├── generators/         # ژنراتورهای تم کلاسیک، تم بلاکی، پلاگین و بلوک گوتنبرگ
│   │   └── verification/       # اعتبارسنجی نحوی، یکپارچگی وابستگی‌ها و شبیه‌ساز رانتایم
│   └── tests/
│       └── fixtures/           # فیکسچرهای آزمایشی ثابت (Phase 1)
│
├── cli/                        # ابزار خط فرمان سراسری (`npx rtw-convert`)
│   └── bin/rtw.js              # فایل اجرایی CLI متصل به هسته کامپایلر
│
├── tests/                      # آزمون‌های رانر کیفیت‌سنجی فیکسچرها
│   └── runner/                 # اسکریپت‌های اعتبارسنجی جامع
│
├── ROADMAP.md                  # نقشه راه فنی، فازبندی سخت‌گیرانه و بخش‌های منجمد
└── README.md                   # مستندات مرجع مخزن
```

---

## 💻 ابزار خط فرمان (`rtw-convert`)

ابزار خط فرمان برای تبدیل محلی پروژه‌ها، دایرکتوری‌ها یا آرشیوها:

```bash
# تبدیل به قالب بلاکی (FSE)
npx rtw-convert ./src --type block-theme --name "My Modern Theme" --zip

# تبدیل به قالب کلاسیک
npx rtw-convert ./src --type classic-theme --name "Classic Theme" --zip

# تبدیل به افزونه وردپرس
npx rtw-convert ./src --type plugin --name "Custom Widget" --zip

# تبدیل به بلوک سفارشی گوتنبرگ
npx rtw-convert ./src/Card.tsx --type block --name "Card Block"
```

### سوییچ‌های معتبر CLI
- `-t, --type <type>`: نوع خروجی (`classic-theme`, `block-theme`, `plugin`, `block`)
- `-n, --name <name>`: نام پروژه و پیشوند نمادها
- `-o, --out <path>`: مسیر ذخیره فایل‌های خروجی (پیش‌فرض: `./build/wordpress`)
- `-z, --zip [path]`: بسته‌بندی مستقیم در قالب فایل فشرده `.zip` آماده نصب
- `--no-rtl`: غیرفعال‌سازی تولید استایل‌های راست‌به‌چپ
- `-b, --branch <branch>`: تعیین شاخه گیت در هنگام کلون مستقیم

---

## 🛡️ استانداردهای کیفی هسته تبدیل

تمام کدهای تولیدشده توسط `core-engine` ملزم به رعایت موارد زیر هستند:
1. **ایزولاسیون کامل نمادها**: پوشش ۱۰۰٪ توابع عمومی در `if ( ! function_exists(...) )` و کلاس‌ها در `if ( ! class_exists(...) )`.
2. **پیشوندگذاری سخت‌گیرانه**: تمامی توابع، متغیرها، نانس‌ها و نام کلاس‌ها دارای پیشوند منحصر‌به‌فرد پروژه هستند.
3. **استقلال کامل از CDN**: هیچ اسکریپت یا استایلی (مانند Tailwind Play-CDN) به منابع خارجی وابسته نبوده و استایل‌ها به صورت محلی باندل می‌شوند.
4. **شبیه‌ساز رانتایم**: فایل‌های خروجی پیش از بسته‌بندی، توسط شبیه‌ساز داخلی بررسی شده و بروز خطای فتال یا صفحه سفید (WSOD) منجر به توقف فرآیند می‌شود.
5. **تصویر شاخص `screenshot.png`**: در قالب‌های کلاسیک و بلاکی، تصویر با ابعاد استاندارد ۱۲۰۰×۹۰۰ در ریشه پکیج قرار می‌گیرد.

---

## 📄 لایسنس
این پروژه تحت لایسنس MIT منتشر شده است.
