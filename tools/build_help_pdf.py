#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""============================================================
   Landixa — build_help_pdf.py  (dev tooling, NOT in the theme zip)
   Builds the Persian buyer guide  →  Html_Package/Help.pdf

   Follows the easy-call build_help_pdf.py pattern:
   - reportlab + LOCAL Vazirmatn only (assets/fonts/*.woff2 → TTF in
     a temp dir via fontTools; reportlab cannot embed woff2 directly)
   - arabic_reshaper + python-bidi for correct Persian shaping
   - zero personal links / contact info, Jalali dates only

   Deps (dev machine only, never shipped):
     pip install reportlab arabic-reshaper python-bidi fonttools brotli

   Usage:
     python3 tools/build_help_pdf.py            # → Html_Package/Help.pdf
     python3 tools/build_help_pdf.py --out X    # custom output path
   ============================================================"""
import argparse
import io
import os
import sys
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
FONTS = REPO / "assets" / "fonts"
OUT_DEFAULT = REPO / "Html_Package" / "Help.pdf"

# ---- house palette (mirrors style.css tokens; PDFs cannot use var()) ----
BG, CARD, TEXT, MUTED = "#0B0F17", "#131A26", "#E8EDF6", "#93A0B8"
ACCENT, ACCENT2 = "#22D3EE", "#8B5CF6"

PERSIAN_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")


def fa_num(n):
    """Latin digits → Persian digits."""
    return str(n).translate(PERSIAN_DIGITS)


def die(msg):
    print("خطا: " + msg, file=sys.stderr)
    sys.exit(1)


# ---- deps ------------------------------------------------------------
def check_deps():
    missing = []
    for mod in ("reportlab", "arabic_reshaper", "bidi.algorithm", "fontTools"):
        try:
            __import__(mod, fromlist=["x"])
        except ImportError:
            missing.append(mod.replace(".", "-"))
            if mod == "bidi.algorithm":
                missing.append("python-bidi")
    if missing:
        die(
            "برای ساخت Help.pdf این پکیج‌ها لازم است (فقط روی سیستم توسعه، نه داخل قالب):\n"
            "  pip install " + " ".join(sorted(set(missing)))
        )


def load_vazirmatn():
    """woff2 → TTF in-memory (flavor=None) and register with reportlab."""
    from fontTools.ttLib import TTFont
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont as RLTTFont

    faces = {}
    with tempfile.TemporaryDirectory() as tmp:
        for name, weight in (
            ("Regular", "Vazirmatn"),
            ("Bold", "Vazirmatn-Bold"),
        ):
            src = FONTS / f"Vazirmatn-{name}.woff2"
            if not src.exists():
                die(f"فونت پیدا نشد: {src}")
            tt = TTFont(str(src))
            tt.flavor = None  # decompress woff2 → plain ttf
            buf = io.BytesIO()
            tt.save(buf)
            buf.seek(0)
            p = Path(tmp) / f"{weight}.ttf"
            p.write_bytes(buf.read())
            pdfmetrics.registerFont(RLTTFont(weight, str(p)))
            faces[weight] = weight
    return faces


def fa(text, bold=False):
    """Shape Persian text for reportlab (reshape + bidi visual order)."""
    import arabic_reshaper
    from bidi.algorithm import get_display

    return get_display(arabic_reshaper.reshape(text))


# ---- styles ----------------------------------------------------------
def make_styles():
    from reportlab.lib.enums import TA_RIGHT
    from reportlab.lib.styles import ParagraphStyle

    base = dict(fontName="Vazirmatn", alignment=TA_RIGHT, wordWrap="RTL",
                textColor=TEXT, leading=26)
    return {
        "h2": ParagraphStyle("h2", fontName="Vazirmatn-Bold", fontSize=17,
                             leading=30, spaceBefore=22, spaceAfter=8,
                             textColor=ACCENT, **{k: v for k, v in base.items()
                                                  if k in ("alignment", "wordWrap")}),
        "h3": ParagraphStyle("h3", fontName="Vazirmatn-Bold", fontSize=13,
                             leading=24, spaceBefore=14, spaceAfter=4,
                             textColor=TEXT, alignment=TA_RIGHT, wordWrap="RTL"),
        "p": ParagraphStyle("p", fontSize=11, spaceAfter=8, **base),
        "li": ParagraphStyle("li", fontSize=11, spaceAfter=5, rightIndent=14,
                             **{k: v for k, v in base.items() if k != "leading"},
                             leading=22),
        "muted": ParagraphStyle("muted", fontSize=9.5, spaceAfter=6,
                                textColor=MUTED, leading=18,
                                **{k: v for k, v in base.items()
                                   if k not in ("textColor", "leading")}),
    }


# ---- cover + footer (canvas layer) -----------------------------------
def draw_cover(cv, doc):
    from reportlab.lib.colors import HexColor
    from reportlab.lib.utils import simpleSplit

    W, H = doc.pagesize
    cv.saveState()
    cv.setFillColor(HexColor(BG))
    cv.rect(0, 0, W, H, fill=1, stroke=0)
    # glows — two soft corner circles (pure geometry, like the hero CSS)
    cv.setFillColor(HexColor(ACCENT))
    cv.setFillAlpha(0.14)
    cv.circle(60, H - 70, 150, fill=1, stroke=0)
    cv.setFillColor(HexColor(ACCENT2))
    cv.setFillAlpha(0.14)
    cv.circle(W - 60, 130, 170, fill=1, stroke=0)
    cv.setFillAlpha(1)
    # logo: rounded square + L (same geometry as the inline SVG mark)
    cv.setFillColor(HexColor(ACCENT))
    cv.roundRect(W / 2 - 46, H / 2 + 40, 92, 92, 26, fill=1, stroke=0)
    cv.setFillColor(HexColor(ACCENT2))
    cv.circle(W / 2 + 46, H / 2 + 132, 46, fill=1, stroke=0)
    cv.setFillColor(HexColor(ACCENT))
    cv.setFillAlpha(0.6)
    cv.circle(W / 2 - 46, H / 2 + 40, 30, fill=1, stroke=0)
    cv.setFillAlpha(1)
    cv.setFillColor(HexColor(BG))
    cv.setFont("Vazirmatn-Bold", 58)
    cv.drawCentredString(W / 2, H / 2 + 66, "L")
    # titles
    cv.setFillColor(HexColor(TEXT))
    cv.setFont("Vazirmatn-Bold", 30)
    cv.drawCentredString(W / 2, H / 2 - 40, fa("راهنمای قالب لندیکسا"))
    cv.setFillColor(HexColor(MUTED))
    cv.setFont("Vazirmatn", 14)
    cv.drawCentredString(W / 2, H / 2 - 78, fa("لندینگ معرفی اپلیکیشن — نسخهٔ ۱.۲.۰"))
    cv.drawCentredString(W / 2, H / 2 - 106, fa("قالب HTML راست‌چین · بدون وابستگی خارجی"))
    # footer badge
    cv.setFillColor(HexColor(CARD))
    cv.roundRect(W / 2 - 120, 64, 240, 34, 17, fill=1, stroke=0)
    cv.setFillColor(HexColor(MUTED))
    cv.setFont("Vazirmatn", 11)
    cv.drawCentredString(W / 2, 74, fa("سال ۱۴۰۵ — مخصوص راست‌چین"))
    cv.restoreState()


def draw_page(cv, doc):
    """Inner pages: slim header rule + Persian page number."""
    from reportlab.lib.colors import HexColor

    W, H = doc.pagesize
    cv.saveState()
    cv.setStrokeColor(HexColor(CARD))
    cv.setLineWidth(1)
    cv.line(40, H - 40, W - 40, H - 40)
    cv.setFillColor(HexColor(MUTED))
    cv.setFont("Vazirmatn", 9)
    cv.drawRightString(W - 40, H - 34, fa("لندیکس — راهنمای خریدار"))
    cv.drawCentredString(W / 2, 26, fa("صفحهٔ " + fa_num(doc.page)))
    cv.restoreState()


# ---- content ---------------------------------------------------------
def content(faces):
    """[(style, text), …] — all Persian copy lives here."""
    from reportlab.lib.pagesizes import A4

    S = make_styles()
    fa_p = lambda t: fa(t)
    blocks = [
        ("h2", "شروع سریع"),
        ("p", "لندیکس هیچ پیش‌نیازی ندارد: نصبی، بیلدی و وابستگی‌ای وجود ندارد. کل پوشهٔ قالب را روی هاست خود آپلود کنید (سی‌پنل، دایرکت‌ادمین، گیت‌هاب پیجز یا هر هاست استاتیک) و index.html را باز کنید. برای تست محلی هم کافی است فایل index.html را با مرورگر باز کنید — هیچ درخواستی به اینترنت زده نمی‌شود."),
        ("h2", "ساختار فایل‌ها"),
        ("li", "index.html — صفحهٔ اصلی، نسخهٔ تیره (پیش‌فرض)"),
        ("li", "home-light.html و home-warm.html — همان صفحه با تم روشن و گرم"),
        ("li", "blog/ — فهرست وبلاگ و صفحهٔ تک‌پست"),
        ("li", "ltr/index.html — نسخهٔ انگلیسی چپ‌چین صفحهٔ اصلی"),
        ("li", "assets/css/style.css — تمام استایل‌ها؛ توکن‌های رنگ در ابتدای فایل"),
        ("li", "assets/js/main.js — منو، لایت‌باکس، آکاردئون و انیمیشن ظهور"),
        ("li", "assets/fonts/ — فونت وزیرمتن (لوکال)"),
        ("h2", "تغییر متن‌ها و نام اپ"),
        ("p", "همهٔ متن‌ها مستقیم داخل فایل‌های HTML نوشته شده است. نام اپ نمونه «کیف من» را با نام اپ خودتان جایگزین کنید (جست‌وجوی متن در فایل کافی است). اعداد لاتین داخل متن فارسی داخل bdi با کلاس en قرار گرفته‌اند تا جهت متن به‌هم نریزد؛ همین الگو را برای متن‌های خودتان هم نگه دارید."),
        ("h2", "تغییر رنگ‌ها — فقط ۴ مقدار"),
        ("p", "در ابتدای style.css چهار توکن اصلی رنگ است: accent (رنگ تأکید)، accent-2 (رنگ دوم گرادیانت)، on-accent (رنگ متن روی دکمهٔ اصلی) و bg (پس‌زمینه). رنگ‌های مشتق مثل سایه‌ها، هاله‌ها و گرادیانت‌ها با color-mix خودشان از همین چهار مقدار محاسبه می‌شوند؛ پس با یک تغییر کوچک، کل قالب هماهنگ می‌ماند. برای تم روشن و گرم هم توکن‌های همان تم در بلاک‌های جداگانه بالای فایل هستند."),
        ("h2", "نسخه‌های رنگی و انتشار"),
        ("p", "سه نسخهٔ صفحهٔ اصلی فقط یک صفت data-theme با هم فرق دارند و یک استایل‌شیت مشترک دارند. برای انتشار، فایلی را که می‌خواهید صفحهٔ اصلی باشد به‌عنوان index.html سایت بگذارید یا هر سه را کنار هم نگه دارید و در آگهی خود معرفی کنید."),
        ("h2", "وبلاگ"),
        ("p", "فهرست وبلاگ شش کارت پست نمونه دارد و صفحهٔ تک‌پست یک چیدمان کامل با بردکرامب، تاریخ، دسته، نقل‌قول و پست‌های مرتبط است. برای هر پست واقعی، یکی از کارت‌ها را کپی کنید، متن و تاریخ شمسی را عوض کنید و href آن را به فایل پست جدید بدهید. کاور پست‌ها CSS خالص است؛ اگر تصویر واقعی می‌خواهید می‌توانید به‌جای آن یک img بگذارید."),
        ("h2", "نسخهٔ انگلیسی (LTR)"),
        ("p", "فایل ltr/index.html همان صفحهٔ اصلی با جهت چپ‌چین و متن انگلیسی است. چون تمام CSS با خواص منطقی نوشته شده، قرینه‌شدن چیدمان خودکار است و نیازی به تغییر استایل نیست."),
        ("h2", "گذاشتن اسکرین‌شات واقعی اپ"),
        ("p", "داخل هر shot-screen به‌جای خطوط نمونه می‌توانید یک تگ img بگذارید. راهنمای کامل محل فایل‌ها، ابعاد پیشنهادی و نکات دسترسی‌پذیری در docs/screens/README.md داخل بسته آمده است."),
        ("h2", "دکمه‌های دانلود"),
        ("p", "دکمه‌های کافه‌بازار، مایکت و دانلود مستقیم فعلاً لینک placeholder دارند؛ تا وقتی href آن‌ها # باشد، کلیک روی دکمه فقط یک پیام راهنما نشان می‌دهد. برای انتشار، href هر دکمه را با لینک واقعی اپ خودتان عوض کنید. متن پیام راهنما هم با صفت data-toast روی هر دکمه قابل تغییر است."),
        ("h2", "نکات فنی و پشتیبانی"),
        ("li", "ریسپانسیو از ۳۲۰ تا ۱۹۲۰ پیکسل؛ بدون اسکرول افقی در ۳۶۰px"),
        ("li", "دسترسی‌پذیر: ناوبری با کیبورد، aria-labelها و پشتیبانی prefers-reduced-motion"),
        ("li", "تاریخ‌ها در تمام صفحات شمسی است؛ همین قاعده را برای محتوای خودتان نگه دارید"),
        ("li", "مرورگرهای پشتیبانی‌شده: کروم، اج، فایرفاکس و سافاری دو سال اخیر"),
        ("p", "اگر سوالی پیش آمد، از طریق پنل پشتیبانی راست‌چین همین آگهی پیام بگذارید تا در سریع‌ترین زمان پاسخ بگیرید."),
    ]
    return S, blocks, A4


def build(out_path: Path):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        BaseDocTemplate, Frame, NextPageTemplate, PageBreak, PageTemplate,
        Paragraph, Spacer,
    )

    faces = load_vazirmatn()
    S, blocks, _ = content(faces)

    doc = BaseDocTemplate(
        str(out_path), pagesize=A4,
        title="راهنمای قالب لندیکسا", author="Landixa Template",
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=20 * mm, bottomMargin=16 * mm,
    )
    cover_frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="c")
    body_frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="b")
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[cover_frame], onPage=draw_cover),
        PageTemplate(id="body", frames=[body_frame], onPage=draw_page),
    ])

    story = [NextPageTemplate("body"), Spacer(1, 1), PageBreak()]
    for style, text in blocks:
        story.append(Paragraph(fa(text), S[style]))
    story.append(Spacer(1, 14))
    story.append(Paragraph(fa("© ۱۴۰۵ لندیکس — تهیه‌شده برای فروشگاه راست‌چین"), S["muted"]))

    doc.build(story)
    print(f"OK — {out_path.relative_to(REPO)} ساخته شد ({out_path.stat().st_size:,} bytes)")


def main():
    ap = argparse.ArgumentParser(description="Build the Persian Help.pdf for Landixa")
    ap.add_argument("--out", type=Path, default=OUT_DEFAULT,
                    help="مسیر فایل خروجی (پیش‌فرض: Html_Package/Help.pdf)")
    args = ap.parse_args()
    check_deps()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    build(args.out)


if __name__ == "__main__":
    main()
