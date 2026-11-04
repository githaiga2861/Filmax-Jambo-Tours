/* ═══════════════════════════════════════════════════════════════
   FJT HINTS — one site-wide tip system (replaces the per-page copies)
   • One tip at a time: visible 5s, then a 6s pause before the next.
   • A tip only shows when its target is on screen, and follows it.
   • Short, glanceable text. Each tip shows once per visit.
   • "Hide tips" turns them off for good (localStorage fj-hints-disabled).
   Loaded by fjt-dock.js.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.FJTHints) return;
  window.FJTHints = true;

  var SHOW_MS = 5000;
  var GAP_MS = 6000;
  var FIRST_DELAY_MS = 8000;
  var SEEN_KEY = 'fjt_hints_seen';

  function disabled() { try { return localStorage.getItem('fj-hints-disabled') === 'true'; } catch (e) { return false; } }
  if (disabled()) return;

  var path = location.pathname.replace(/index\.html$/, '');
  var isHome = /^\/(home\/?)?$/.test(path);
  var isPkgList = /^\/packages\/?$/.test(path);
  var isPkgDetail = /^\/packages\/[^/]+\/?$/.test(path) && !isPkgList;
  var isJournal = /^\/journal\//.test(path);

  // Each tip: target selector (first visible match), short label + text.
  var DOCK = [
    { id: 'dock-chat', sel: '.fjt-dk-chat', label: 'Concierge', text: 'Questions? Ask our concierge — or switch to WhatsApp.' },
    { id: 'dock-lang', sel: '.fjt-dk-lang', label: 'Language', text: 'Read the site in your language.', minScroll: 500 },
    { id: 'dock-sound', sel: '.fjt-dk-sound', label: 'Sound', text: 'Turn the safari soundscape on or off.', minScroll: 900 },
    { id: 'dock-theme', sel: '.fjt-dk-theme', label: 'Display', text: 'Switch between dark and light.', minScroll: 1400 }
  ];
  var PAGE = [];
  if (isHome) PAGE = [
    { id: 'home-signin', sel: '#authNavBtn', label: 'Account', text: 'Sign in to save journeys and track bookings.', maxScroll: 300 },
    { id: 'home-filter', sel: '#pkgFilterBar', label: 'Filter', text: 'Show journeys by budget.' },
    { id: 'home-wish', sel: '.pkg-wish-btn', label: 'Save', text: 'Tap the heart to save a journey.' },
    { id: 'home-team', sel: '#teamCardFirst', label: 'Our team', text: 'Tap View Profile to meet your guide.' },
    { id: 'home-gallery', sel: '#galViewAllBtn', label: 'Gallery', text: 'Open every photo and film full-screen.' },
    { id: 'home-quiz', sel: '#inline-quiz', label: 'Safari match', text: '5 quick questions → 3 safaris picked for you.' }
  ];
  if (isPkgList) PAGE = [
    { id: 'pk-filter', sel: '#filterToggleBtn, #filterToggleBar', label: 'Filter', text: 'Narrow by budget, style and length.' },
    { id: 'pk-wish', sel: '.pkg-wish-btn', label: 'Save', text: 'Tap the heart to save a journey.' }
  ];
  if (isPkgDetail) PAGE = [
    { id: 'pd-tabs', sel: '#pkgTabsWrapper', label: 'Details', text: 'Itinerary, stays and inclusions are in these tabs.' },
    { id: 'pd-book', sel: '.btn-book-now, #mobileReserveBtn', label: 'Reserve', text: 'Reserve this journey in 3 short steps.' }
  ];
  if (isJournal) PAGE = [];
  var TIPS = PAGE.concat(DOCK);

  var seen = {};
  try { seen = JSON.parse(sessionStorage.getItem(SEEN_KEY) || '{}'); } catch (e) {}
  function markSeen(id) { seen[id] = 1; try { sessionStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch (e) {} }

  /* ── styles ── */
  var css = document.createElement('style');
  css.textContent =
    '.fjt-hint{position:fixed;z-index:2147483002;max-width:230px;padding:9px 30px 9px 12px;border-radius:12px;' +
      'background:rgba(12,12,12,.94);color:#f2ead8;border:1px solid rgba(212,175,55,.38);' +
      'box-shadow:0 8px 26px rgba(0,0,0,.45),0 0 14px rgba(212,175,55,.14);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);' +
      'font-family:Jost,sans-serif;font-size:12px;line-height:1.4;opacity:0;transform:translateY(4px);transition:opacity .25s ease,transform .25s ease;pointer-events:auto}' +
    '.fjt-hint.show{opacity:1;transform:none}' +
    '.fjt-hint b{display:block;font-size:8.5px;font-weight:500;letter-spacing:2.5px;text-transform:uppercase;color:#d4af37;margin-bottom:3px}' +
    '.fjt-hint-x{position:absolute;top:5px;right:6px;width:20px;height:20px;border:none;border-radius:50%;background:transparent;color:inherit;opacity:.55;cursor:none;font-size:14px;line-height:1}' +
    '.fjt-hint-x:hover{opacity:1;background:rgba(212,175,55,.12)}' +
    '.fjt-hint-off{display:inline-block;margin-top:5px;border:none;background:none;padding:0;color:#d4af37;opacity:.7;font:inherit;font-size:10px;letter-spacing:.5px;cursor:none;text-decoration:underline;text-underline-offset:2px}' +
    '.fjt-hint-off:hover{opacity:1}' +
    '.fjt-hint i{position:absolute;width:9px;height:9px;background:inherit;border:inherit;transform:rotate(45deg)}' +
    '.fjt-hint.below i{top:-5.5px;border-right:none;border-bottom:none}' +
    '.fjt-hint.above i{bottom:-5.5px;border-left:none;border-top:none}' +
    '.fjt-hint-bar{position:absolute;left:12px;right:12px;bottom:4px;height:1.5px;border-radius:2px;background:rgba(212,175,55,.5);transform-origin:left;animation:fjtHintBar ' + SHOW_MS + 'ms linear forwards}' +
    '@keyframes fjtHintBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}' +
    'body.light-mode .fjt-hint{background:rgba(246,242,234,.97);color:#1a1a1a;border-color:rgba(153,101,21,.35);box-shadow:0 8px 22px rgba(0,0,0,.14)}' +
    'body.light-mode .fjt-hint b,body.light-mode .fjt-hint-off{color:#996515}' +
    '@media (max-width:600px){.fjt-hint{max-width:200px;font-size:11.5px}}';
  document.head.appendChild(css);

  /* ── helpers ── */
  function visibleTarget(sel, anywhere) {
    var list = document.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      var st = getComputedStyle(el);
      if (st.visibility === 'hidden' || st.display === 'none' || parseFloat(st.opacity) < 0.1) continue;
      // at least partly inside the middle band of the screen
      var vh = window.innerHeight;
      var band = anywhere ? 0 : 0.12;
      if (r.bottom > vh * band && r.top < vh * (1 - band) && r.right > 0 && r.left < window.innerWidth) return el;
    }
    return null;
  }
  function blocked() {
    // don't talk over open dialogs (sign-in, chat, language list, sound prompt, lightboxes)
    var ov = document.getElementById('authOverlay');
    if (ov && getComputedStyle(ov).display !== 'none' && parseFloat(getComputedStyle(ov).opacity) > 0.1) return true;
    if (document.querySelector('.fjt-panel.open, .fjt-lang-pop.open, #fjtAudioPrompt, .gc-lb-open, .hc-modal.open, #profileModalOverlay.open')) return true;
    return false;
  }

  var active = null, nextAt = Date.now() + FIRST_DELAY_MS;

  function place(box, target) {
    var r = target.getBoundingClientRect();
    var bw = box.offsetWidth, bh = box.offsetHeight, gap = 12;
    var above = r.top - bh - gap > 8;
    var top = above ? r.top - bh - gap : r.bottom + gap;
    var cx = r.left + r.width / 2;
    var left = Math.max(10, Math.min(cx - bw / 2, window.innerWidth - bw - 10));
    box.style.top = Math.round(top) + 'px';
    box.style.left = Math.round(left) + 'px';
    box.classList.toggle('above', above);
    box.classList.toggle('below', !above);
    var arrow = box.querySelector('i');
    arrow.style.left = Math.round(Math.max(12, Math.min(cx - left - 4.5, bw - 21))) + 'px';
  }

  function show(tip, target) {
    markSeen(tip.id);
    var box = document.createElement('div');
    box.className = 'fjt-hint';
    box.setAttribute('role', 'status');
    box.innerHTML = '<b></b><span></span><br><button type="button" class="fjt-hint-off">Hide tips</button>' +
      '<button type="button" class="fjt-hint-x" aria-label="Dismiss tip">×</button><i></i><span class="fjt-hint-bar"></span>';
    box.querySelector('b').textContent = tip.label;
    box.querySelector('span').textContent = tip.text;
    document.body.appendChild(box);
    place(box, target);
    requestAnimationFrame(function () { box.classList.add('show'); });

    var raf, timer;
    (function follow() {
      if (!document.body.contains(target)) return close();
      place(box, target);
      raf = requestAnimationFrame(follow);
    })();
    function close() {
      if (!active) return;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      box.classList.remove('show');
      setTimeout(function () { box.remove(); }, 260);
      active = null;
      nextAt = Date.now() + GAP_MS;          // gap counts from when this tip disappears
    }
    timer = setTimeout(close, SHOW_MS);
    box.querySelector('.fjt-hint-x').addEventListener('click', close);
    box.querySelector('.fjt-hint-off').addEventListener('click', function () {
      try { localStorage.setItem('fj-hints-disabled', 'true'); } catch (e) {}
      close();
      clearInterval(loop);
    });
    active = { close: close };
  }

  function tick() {
    if (active || Date.now() < nextAt || document.hidden || blocked() || disabled()) return;
    var y = window.scrollY;
    for (var i = 0; i < TIPS.length; i++) {
      var t = TIPS[i];
      if (seen[t.id]) continue;
      if (t.minScroll != null && y < t.minScroll) continue;
      if (t.maxScroll != null && y > t.maxScroll) continue;
      var el = visibleTarget(t.sel, /^dock-/.test(t.id));
      if (el) { show(t, el); return; }
    }
  }
  var loop = setInterval(tick, 500);
})();
