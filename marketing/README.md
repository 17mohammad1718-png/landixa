# منابع گرافیکی فروش — لندیکسا

هر سه فایل این پوشه **سورس HTML/CSS دست‌ساز** هستند — بدون هیچ فایل تصویری و
بدون تصویرسازی هوش‌مصنوعی (قانون رد خودکار آگهی در راست‌چین). طبق ROADMAP
فاز ۳، خروجی PNG را مالک قبل از آپلود بازبینی می‌کند.

| فایل | خروجی | ابعاد دقیق |
|---|---|---|
| `icon.html` | آیکون قالب | ۳۲۰×۳۲۰ |
| `cover.html` | کاور آگهی | ۲۱۰۰×۱۰۴۰ |
| `infographic.html` | اینفوگرافیک | عرض ۸۰۰ × ارتفاعِ محتوا |

این فایل‌ها JS و تعامل ندارند؛ استایل از استایل‌شیت مشترک قالب
(`../assets/css/style.css`) می‌آید و پالت با توکن‌ها همیشه sync است.
تنها استثنا، کارت‌های «نسخه‌های رنگی» داخل اینفوگرافیک هستند که مقادیر
پالت را برای نمایش هاردکد کرده‌اند (داخل خود قالب همه‌چیز از توکن‌ها می‌آید).

## Export با کروم (headless)

```bash
google-chrome --headless=new --force-device-scale-factor=1 \
  --screenshot=icon.png --window-size=320,320 marketing/icon.html

google-chrome --headless=new --force-device-scale-factor=1 \
  --screenshot=cover.png --window-size=2100,1040 marketing/cover.html

# ارتفاع اینفوگرافیک را از DevTools بخوانید (عرض بدنه ۸۰۰px است) و همان عدد را بدهید؛ مثلاً:
google-chrome --headless=new --force-device-scale-factor=1 \
  --screenshot=infographic.png --window-size=800,3280 marketing/infographic.html
```

روی مک، به‌جای `google-chrome` از مسیر کامل Chrome استفاده کنید؛ ویندوز:
`chrome.exe` با مسیر نصب. `--force-device-scale-factor=1` برای خروجی
پیکسل‌در-پیکسل ضروری است.

## Export دستی (بدون ترمینال)

1. فایل را در کروم باز کنید.
2. `F12` → `Ctrl+Shift+M` (Device Toolbar) → حالت **Responsive** → ابعاد دقیق
   جدول بالا را وارد کنید.
3. `Ctrl+Shift+P` → عبارت **Capture screenshot** → Enter.

## پیش از آپلود

- PNG خروجی را با محتوای آگهی مقایسه کنید (متن‌ها، ۱۴۰۵، نام «لندیکسا»).
- در صورت نیاز فایل را فشرده کنید (PNG بدون افت کیفیت واضح).
- این پوشه عمداً داخل `theme.zip` نمی‌رود (`tools/build_package.py` آن را مستثنا کرده است).
