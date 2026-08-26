/* ============================================================
   Landixa — main.js
   Interactions: mobile nav, lightbox, FAQ single-open, reveal-on-scroll
   Vanilla JS only — no dependencies. All queries null-safe.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---- Mobile nav ---- */
  var navToggle = $('#navToggle');
  var mainNav = $('#mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close after tapping a link
    $$('a', mainNav).forEach(function (a) {
      a.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Screenshot lightbox (clone card into dialog) ---- */
  var lightbox = $('#lightbox');
  var lbBody = $('#lbBody');
  var lbClose = $('#lbClose');

  function closeLb() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (lightbox && lbBody && lbClose) {
    $$('[data-shot]').forEach(function (shot) {
      shot.addEventListener('click', function () {
        lbBody.innerHTML = '';
        var clone = shot.cloneNode(true);
        clone.removeAttribute('style');
        lbBody.appendChild(clone);
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        lbClose.focus();
      });
    });
    lbClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLb(); // backdrop click
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLb();
    });
  }

  /* ---- FAQ: keep only one item open ---- */
  var faqItems = $$('.faq-item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---- Demo store links: '#' placeholders must not jump to top ----
     If the buyer replaces the href with a real store URL the guard
     no longer matches, so this is safe to leave in the shipped file. */
  var hint = null;
  function showHint() {
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'toast';
      hint.setAttribute('role', 'status');
      document.body.appendChild(hint);
      hint.textContent = 'لینک دمو — در نسخهٔ نهایی، href این دکمه را با لینک واقعی اپ خودتان جایگزین کنید.';
    }
    hint.classList.remove('show');
    // restart the fade even if re-triggered while visible
    void hint.offsetWidth;
    hint.classList.add('show');
    clearTimeout(hint._timer);
    hint._timer = setTimeout(function () { hint.classList.remove('show'); }, 3200);
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    var a = (t && t.closest) ? t.closest('a[href="#"][data-store-demo]') : null;
    if (!a) return;
    e.preventDefault();
    showHint();
  });

  /* ---- Reveal on scroll (progressive enhancement) ---- */
  var reveals = $$('.feature-card, .review-card, .step-card');
  if ('IntersectionObserver' in window) {
    reveals.forEach(function (el) { el.classList.add('will-reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('revealed');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  }
})();
