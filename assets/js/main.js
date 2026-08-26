/* ============================================================
   Landixa — main.js
   Interactions: mobile nav, lightbox, FAQ single-open, reveal-on-scroll
   Vanilla JS only — no dependencies. All queries null-safe.
   ============================================================ */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---- Mobile nav (disclosure pattern: keyboard + mouse) ---- */
  var navToggle = $('#navToggle');
  var mainNav = $('#mainNav');
  var mqlMobile = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
  if (navToggle && mainNav) {
    function setNav(open) {
      mainNav.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    function firstLink() { return mainNav.querySelector('a'); }

    navToggle.addEventListener('click', function () {
      var open = !mainNav.classList.contains('open');
      setNav(open);
      // keyboard users: move focus into the menu — the toggle sits AFTER
      // the menu in DOM order, so plain Tab from the toggle would skip it
      if (open && (!mqlMobile || mqlMobile.matches)) {
        var byKeyboard = true;
        try { byKeyboard = navToggle.matches(':focus-visible'); } catch (err) { /* keep true */ }
        if (byKeyboard) { var fl = firstLink(); if (fl) fl.focus(); }
      }
    });

    // close after tapping a link; return focus to the toggle so keyboard
    // focus is not stranded on the now-hidden menu
    $$('a', mainNav).forEach(function (a) {
      a.addEventListener('click', function () {
        setNav(false);
        navToggle.focus();
      });
    });

    // Escape closes and returns focus to the toggle
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !mainNav.classList.contains('open')) return;
      setNav(false);
      navToggle.focus();
    });

    // outside click closes (pointer users only)
    document.addEventListener('click', function (e) {
      if (!mainNav.classList.contains('open')) return;
      if (mainNav.contains(e.target) || navToggle.contains(e.target)) return;
      setNav(false);
    });

    // while open: keep keyboard focus cycling inside the menu
    navToggle.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !mainNav.classList.contains('open')) return;
      var links = $$('a', mainNav);
      if (!e.shiftKey) {
        e.preventDefault();
        if (links[0]) links[0].focus();
      } else {
        e.preventDefault();
        if (links[links.length - 1]) links[links.length - 1].focus();
      }
    });
    mainNav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !mainNav.classList.contains('open')) return;
      var links = $$('a', mainNav);
      if (e.shiftKey && document.activeElement === links[0]) {
        e.preventDefault();
        navToggle.focus();
      }
    });

    // keep state sane when crossing the breakpoint (resize/orientation)
    if (mqlMobile) {
      var onBreakpoint = function () { if (!mqlMobile.matches) setNav(false); };
      if (mqlMobile.addEventListener) mqlMobile.addEventListener('change', onBreakpoint);
      else if (mqlMobile.addListener) mqlMobile.addListener(onBreakpoint); // older Safari
    }
  }

  /* ---- Screenshot lightbox (clone card into dialog) ---- */
  var lightbox = $('#lightbox');
  var lbBody = $('#lbBody');
  var lbClose = $('#lbClose');
  var lbTrigger = null;

  function closeLb() {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    if (lbBody) lbBody.innerHTML = ''; // no stale clone left in the DOM
    if (lbTrigger) { lbTrigger.focus(); lbTrigger = null; } // restore focus
  }

  if (lightbox && lbBody && lbClose) {
    function openLb(shot) {
      lbBody.innerHTML = '';
      var clone = shot.cloneNode(true);
      clone.removeAttribute('style');
      // the enlarged copy is not interactive — drop the button semantics
      clone.removeAttribute('tabindex');
      clone.removeAttribute('role');
      clone.removeAttribute('aria-label');
      lbBody.appendChild(clone);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      lbTrigger = shot;
      lbClose.focus();
    }
    $$('[data-shot]').forEach(function (shot) {
      shot.addEventListener('click', function () { openLb(shot); });
      // shots are focusable buttons (tabindex=0) — open with Enter/Space
      shot.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
        e.preventDefault();
        openLb(shot);
      });
    });
    lbClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLb(); // backdrop click
    });
    // focus trap: the close button is the only focusable element inside
    lightbox.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      lbClose.focus();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLb();
    });
  }

  /* ---- FAQ: keep only one item open ----
     MutationObserver on the `open` attribute — same semantics as the
     <details> toggle event, but observable in every environment. */
  var faqItems = $$('.faq-item');
  if (faqItems.length && 'MutationObserver' in window) {
    var faqObserver = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        var item = m.target;
        if (!item.open) return;
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
    faqItems.forEach(function (item) {
      faqObserver.observe(item, { attributes: true, attributeFilter: ['open'] });
    });
  }

  /* ---- Demo store links: '#' placeholders must not jump to top ----
     If the buyer replaces the href with a real store URL the guard
     no longer matches, so this is safe to leave in the shipped file.
     The toast text is customizable via data-toast on each link. */
  var hint = null;
  function showHint(a) {
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'toast';
      hint.setAttribute('role', 'status');
      document.body.appendChild(hint);
    }
    var msg = a && a.getAttribute('data-toast');
    hint.textContent = msg || 'لینک دمو — در نسخهٔ نهایی، href این دکمه را با لینک واقعی اپ خودتان جایگزین کنید.';
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
    showHint(a);
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
