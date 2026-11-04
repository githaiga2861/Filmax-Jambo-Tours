/* ═══════════════════════════════════════════════════════════════
   FJT DOCK — one bar: Language · Theme · Sound · Concierge
   Include on any public page:
     <script src="/assets/js/fjt-dock.js" defer></script>
   It loads its own CSS, the concierge chat, the sound engine,
   Google sign-in and Google Translate when a page doesn't already.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.FJTDock) return;
  var V = '20261104d';

  var ICON = {
    lang: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>',
    sun: '<svg class="fjt-dk-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',
    moon: '<svg class="fjt-dk-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    soundOn: '<svg class="fjt-dk-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    soundOff: '<svg class="fjt-dk-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5v-8z"/><path d="M8.5 8.5h7M8.5 11.5h4.5"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  var LANGS = [
    ['en', 'English', 'EN'], ['sw', 'Kiswahili', 'SW'], ['fr', 'Français', 'FR'], ['de', 'Deutsch', 'DE'],
    ['es', 'Español', 'ES'], ['it', 'Italiano', 'IT'], ['pt', 'Português', 'PT'], ['nl', 'Nederlands', 'NL'],
    ['pl', 'Polski', 'PL'], ['ru', 'Русский', 'RU'], ['ar', 'العربية', 'AR'], ['hi', 'हिन्दी', 'HI'],
    ['zh-CN', '中文 (简体)', 'ZH'], ['ja', '日本語', 'JA'], ['ko', '한국어', 'KO']
  ];

  function loadCss(href) {
    if (document.querySelector('link[href^="' + href.split('?')[0] + '"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = href;
    document.head.appendChild(l);
  }
  function loadJs(src) {
    if (document.querySelector('script[src^="' + src.split('?')[0] + '"]')) return;
    var s = document.createElement('script');
    s.src = src; s.defer = true;
    document.body.appendChild(s);
  }
  function btn(cls, label, inner) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'fjt-dk-btn ' + cls;
    b.setAttribute('aria-label', label);
    b.innerHTML = inner + '<span class="fjt-dk-tip">' + label + '</span>';
    return b;
  }
  function setTip(b, text) { var t = b.querySelector('.fjt-dk-tip'); if (t) t.textContent = text; b.setAttribute('aria-label', text); }
  var flashTimers = new WeakMap();
  function flash(b, text) {
    setTip(b, text);
    b.classList.add('tip-show');
    clearTimeout(flashTimers.get(b));
    flashTimers.set(b, setTimeout(function () { b.classList.remove('tip-show'); }, 1400));
  }

  /* ── Google Translate ───────────────────────────────────────── */
  function currentLang() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([^;]+)/);
    return m ? decodeURIComponent(m[1]) : 'en';
  }
  function setCookie(val) {
    var host = location.hostname;
    var parts = host.split('.');
    var root = parts.length > 1 ? '.' + parts.slice(-2).join('.') : host;
    var exp = val ? '' : ';expires=Thu, 01 Jan 1970 00:00:00 GMT';
    [';path=/', ';path=/;domain=' + host, ';path=/;domain=' + root].forEach(function (suffix) {
      document.cookie = 'googtrans=' + (val || '') + exp + suffix;
    });
  }
  function ensureTranslate() {
    if (!document.getElementById('google_translate_element')) {
      var d = document.createElement('div');
      d.id = 'google_translate_element';
      document.body.appendChild(d);
    }
    if (typeof window.googleTranslateElementInit !== 'function') {
      window.googleTranslateElementInit = function () {
        new google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: LANGS.map(function (l) { return l[0]; }).filter(function (c) { return c !== 'en'; }).join(','),
          autoDisplay: false
        }, 'google_translate_element');
      };
    }
    if (!document.querySelector('script[src*="translate_a/element.js"]')) {
      var s = document.createElement('script');
      s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(s);
    }
  }
  function translateTo(code) {
    if (code === 'en') {
      setCookie('');
      location.reload();
      return;
    }
    setCookie('/en/' + code);
    ensureTranslate();
    var t0 = Date.now();
    (function apply() {
      var combo = document.querySelector('.goog-te-combo');
      if (combo && Array.prototype.some.call(combo.options, function (o) { return o.value === code; })) {
        combo.value = code;
        combo.dispatchEvent(new Event('change'));
        return;
      }
      if (Date.now() - t0 < 6000) setTimeout(apply, 150);
      else location.reload(); // the cookie makes Google translate the page on load
    })();
  }

  /* ── Build ──────────────────────────────────────────────────── */
  function init() {
    loadCss('/assets/css/fjt-dock.css?v=' + V);
    document.body.classList.add('fjt-dock-on');

    var dock = document.createElement('div');
    dock.className = 'fjt-dock';
    dock.setAttribute('role', 'toolbar');
    dock.setAttribute('aria-label', 'Site controls');

    var bLang = btn('fjt-dk-lang', 'Language', ICON.lang);
    bLang.setAttribute('aria-haspopup', 'true');
    bLang.setAttribute('aria-expanded', 'false');
    var bTheme = btn('fjt-dk-theme', 'Light mode', ICON.sun + ICON.moon);
    var bSound = btn('fjt-dk-sound', 'Sound on', ICON.soundOn + ICON.soundOff);
    var bChat = btn('fjt-dk-chat', 'Private Concierge', ICON.chat + '<span class="fjt-dk-dot" aria-hidden="true"></span>');
    bChat.setAttribute('aria-expanded', 'false');

    var sep = document.createElement('span');
    sep.className = 'fjt-dock-sep';
    sep.setAttribute('aria-hidden', 'true');

    dock.appendChild(bLang);
    dock.appendChild(bTheme);
    dock.appendChild(bSound);
    dock.appendChild(sep);
    dock.appendChild(bChat);
    document.body.appendChild(dock);

    /* Language popover */
    var pop = document.createElement('div');
    pop.className = 'fjt-lang-pop';
    pop.setAttribute('role', 'menu');
    var cur = currentLang();
    pop.innerHTML = '<div class="fjt-lang-head">Language</div>' + LANGS.map(function (l) {
      return '<button type="button" role="menuitem" class="fjt-lang-opt' + (l[0] === cur ? ' is-current' : '') + '" data-lang="' + l[0] + '">' +
        '<span>' + l[1] + '</span><small>' + l[2] + '</small></button>';
    }).join('');
    document.body.appendChild(pop);
    function setPop(open) {
      pop.classList.toggle('open', open);
      bLang.setAttribute('aria-expanded', String(open));
      dock.classList.toggle('is-active', open);
      if (open && window.FJTChat && window.FJTChat.isOpen()) window.FJTChat.close();
    }
    bLang.addEventListener('click', function (e) { e.stopPropagation(); setPop(!pop.classList.contains('open')); });
    pop.addEventListener('click', function (e) {
      var o = e.target.closest('.fjt-lang-opt');
      if (!o) return;
      setPop(false);
      var code = o.getAttribute('data-lang');
      pop.querySelectorAll('.fjt-lang-opt').forEach(function (x) { x.classList.toggle('is-current', x === o); });
      flash(bLang, o.querySelector('span').textContent);
      translateTo(code);
    });
    document.addEventListener('click', function (e) {
      if (pop.classList.contains('open') && !pop.contains(e.target) && e.target !== bLang) setPop(false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setPop(false); });
    if (cur !== 'en') ensureTranslate();
    else if (document.getElementById('google_translate_element')) { /* page already loads Google's widget */ }

    /* Theme — reuses each page's own toggle so its logic stays the single source of truth */
    function isLight() { return document.body.classList.contains('light-mode'); }
    function paintTheme() {
      bTheme.classList.toggle('is-off', isLight());   // moon icon while light
      setTip(bTheme, isLight() ? 'Dark mode' : 'Light mode');
    }
    bTheme.addEventListener('click', function () {
      var t = document.getElementById('themeToggle');
      if (t) t.click();
      else {
        var light = document.body.classList.toggle('light-mode');
        try { localStorage.setItem('fjt-theme', light ? 'light' : 'dark'); } catch (e) {}
      }
      setTimeout(function () { paintTheme(); flash(bTheme, isLight() ? 'Light mode on' : 'Dark mode on'); setTimeout(paintTheme, 1500); }, 30);
    });
    new MutationObserver(paintTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    paintTheme();

    /* Sound */
    function paintSound(stateText) {
      var on = window.FJTAudio && window.FJTAudio.isOn();
      bSound.classList.toggle('is-off', !on);
      setTip(bSound, stateText || (on ? 'Mute sound' : 'Play sound'));
    }
    bSound.addEventListener('click', function () {
      if (!window.FJTAudio) return;
      var on = window.FJTAudio.toggle();
      paintSound();
      flash(bSound, on ? 'Sound on' : 'Sound off');
      setTimeout(function () { paintSound(); }, 1500);
    });
    (function waitAudio() {
      if (window.FJTAudio) { window.FJTAudio.onChange(function () { paintSound(); }); paintSound(); }
      else setTimeout(waitAudio, 200);
    })();

    /* Concierge */
    bChat.addEventListener('click', function (e) {
      e.stopPropagation();
      setPop(false);
      if (window.FJTChat) window.FJTChat.toggle();
    });
    (function waitChat() {
      if (window.FJTChat) {
        window.FJTChat.onChange(function (open) {
          bChat.setAttribute('aria-expanded', String(open));
          bChat.firstChild.outerHTML = open ? ICON.close : ICON.chat;
          setTip(bChat, open ? 'Close concierge' : 'Private Concierge');
          dock.classList.toggle('is-active', open);
        });
      } else setTimeout(waitChat, 200);
    })();

    /* Dim while scrolling so it never fights with content */
    var scrollTimer;
    window.addEventListener('scroll', function () {
      if (dock.classList.contains('is-active')) return;
      dock.classList.add('is-scrolling');
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () { dock.classList.remove('is-scrolling'); }, 650);
    }, { passive: true });

    window.FJTDock = { el: dock, buttons: { lang: bLang, theme: bTheme, sound: bSound, chat: bChat } };

    /* Shared pieces this bar relies on */
    loadJs('/assets/js/fjt-audio.js?v=' + V);
    loadJs('/assets/js/gemini-chat.js?v=' + V);
    loadJs('/assets/js/fjt-google-signin.js?v=' + V);
    loadJs('/assets/js/fjt-hints.js?v=' + V);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
