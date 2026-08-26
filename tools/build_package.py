#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""============================================================
   Landixa — build_package.py  (dev tooling, NOT in the theme zip)
   Produces the rtl-theme HTML submission package:

     Html_Package/
     ├── 1-Theme/
     │   └── theme.zip     ← the template itself (buyer files only)
     └── Help.pdf          ← built by tools/build_help_pdf.py

   stdlib only. Pipeline:
     1) node tools/self-check.mjs  — ALL checks must pass (aborts otherwise;
        skipped with a warning if node is missing)
     2) Help.pdf via tools/build_help_pdf.py (skipped with a warning if the
        optional PDF deps are not installed)
     3) theme.zip from THEME_FILES below — marketing/, tools/ and internal
        docs are deliberately NOT shipped

   Usage:  python3 tools/build_package.py
   ============================================================"""
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PKG = REPO / "Html_Package"
ZIP_PATH = PKG / "1-Theme" / "theme.zip"
HELP = PKG / "Help.pdf"

# buyer-facing files — everything else stays in the dev repo
THEME_FILES = [
    "index.html",
    "home-light.html",
    "home-warm.html",
    "blog/index.html",
    "blog/post.html",
    "ltr/index.html",
    "assets/css/style.css",
    "assets/js/main.js",
    "assets/fonts/Vazirmatn-Regular.woff2",
    "assets/fonts/Vazirmatn-Medium.woff2",
    "assets/fonts/Vazirmatn-Bold.woff2",
    "README.md",                 # buyer guide (Persian)
    "docs/screens/README.md",    # where to drop real screenshots
]


def run(cmd, **kw):
    return subprocess.run(cmd, cwd=REPO, capture_output=True, text=True, **kw)


def step(msg):
    print(f"• {msg}")


def self_check():
    if not shutil.which("node"):
        step("node پیدا نشد — self-check رد شد (هشدار)")
        return
    step("اجرای self-check (باید همهٔ چک‌ها سبز باشد)")
    r = run(["node", "tools/self-check.mjs"])
    tail = (r.stdout or r.stderr).strip().splitlines()
    if tail:
        print("   " + tail[-1])
    if r.returncode != 0:
        print(r.stdout)
        sys.exit("abort: self-check failed — fix the failures before packaging")


def build_help():
    r = run([sys.executable, "tools/build_help_pdf.py"])
    if r.returncode != 0:
        step("Help.pdf ساخته نشد (وابستگی‌های PDF نصب نیست) — رد شد با هشدار:")
        print("   " + (r.stderr.strip() or "unknown error").splitlines()[0])
        return False
    print("   " + r.stdout.strip())
    return True


def zip_theme():
    missing = [f for f in THEME_FILES if not (REPO / f).exists()]
    if missing:
        sys.exit("abort: missing theme files: " + ", ".join(missing))
    ZIP_PATH.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for f in THEME_FILES:
            z.write(REPO / f, f)
    n = len(THEME_FILES)
    size = ZIP_PATH.stat().st_size
    step(f"theme.zip ساخته شد — {n} فایل، {size:,} bytes")
    # integrity: every entry readable and non-empty
    with zipfile.ZipFile(ZIP_PATH) as z:
        bad = z.testzip()
        if bad:
            sys.exit(f"abort: corrupt zip entry {bad}")
    return True


def main():
    print("=== بسته‌بندی لندیکسا برای راست‌چین ===")
    self_check()
    step("ساخت Help.pdf")
    build_help()
    step("ساخت theme.zip (فقط فایل‌های خریدار)")
    zip_theme()
    print()
    print("خروجی:")
    for p in sorted(PKG.rglob("*")):
        if p.is_file():
            print(f"  {p.relative_to(REPO)}  ({p.stat().st_size:,} bytes)")
    if not HELP.exists():
        print("  ⚠ Help.pdf موجود نیست — قبل از ارسال، وابستگی‌های PDF را نصب و دوباره اجرا کنید")
    print()
    print("یادآوری مالک: آیکون ۳۲۰×۳۲۰، کاور ۲۱۰۰×۱۰۴۰ و اینفوگرافیک را از پوشهٔ marketing/ "
          "خارج کنید (راهنمای export داخل همان پوشه است) — سپس اسکن VirusTotal و ارسال از پنل.")


if __name__ == "__main__":
    main()
