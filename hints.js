/* Filmax Jambo Tours — Site Hints System v1.0
   One hint visible at a time, cycling every 6 s, first-visit only per page. */
(function () {
  'use strict';

  var CYCLE_MS = 6000;
  var FADE_MS  = 380;

  /* ── PAGE DETECTION ──────────────────────────────────────────────────── */
  var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (!page.endsWith('.html')) page = 'index.html';

  /* ── HINT DEFINITIONS ────────────────────────────────────────────────── */
  /* Each entry: [ cssSelector, hintText ] */
  var PAGE_HINTS = {
    'index.html': [
      ['#menuBtn',
        'Open the navigation menu — explore destinations, packages, gallery and our journey journal'],
      ['.btn-primary',
        'Begin your Kenya journey — browse and book a curated safari expedition tailored entirely to you'],
      ['#heroSoundBtn',
        'Toggle immersive ambient audio — hear the sounds of the Kenyan wilderness as you explore the site'],
      ['#themeToggle',
        'Switch between dark and light mode to suit your viewing comfort'],
      ['.whatsapp-fab',
        'Chat instantly with our concierge via WhatsApp — we respond within minutes, any time of day'],
      ['#authNavBtn, .auth-flip-signin',
        'Sign in or create an account to save favourites, track reservations and personalise your safari'],
      ['#dsHintRight, .ds-scroll-hint-right',
        'Browse Kenya\'s iconic destinations — each links to curated packages available for that location'],
      ['#google_translate_element',
        'Translate this entire page into any of 100+ languages instantly with one click'],
      ['.view-all-btn',
        'Explore the complete collection of all our curated safari packages'],
      ['.blog-view-all-btn',
        'Read expert safari stories, destination guides and wildlife reports from our naturalists'],
    ],

    'packages.html': [
      ['#filterToggleBtn',
        'Click to reveal smart filters — narrow packages precisely by budget, duration and destination'],
      ['#budgetRange',
        'Drag the slider to set your maximum price — the package grid updates instantly as you slide'],
      ['.pkg-cta',
        'Enquire about this safari — a dedicated concierge will respond personally within 24 hours'],
      ['.nav-back',
        'Return to the Filmax Jambo Tours homepage'],
    ],

    'blog.html': [
      ['[data-filter="Wildlife"]',
        'Filter stories by category — click any tag to see only articles from that theme'],
      ['[data-filter="Planning"]',
        'Browse destination planning guides written by our expert safari team'],
      ['.blog-post-card',
        'Click any story card to read the full article — written by our guides and naturalists in the field'],
    ],

    'admin.html': [
      ['#nav-dashboard',
        'View the admin dashboard — bookings overview, recent activity and quick-action shortcuts'],
      ['#nav-packages-header',
        'Manage safari packages — create, edit, publish or archive any listing from here'],
      ['#nav-new-blog',
        'Write and publish a new blog post — stories appear live on the journal immediately on publish'],
      ['#sidebarToggle',
        'Collapse or expand the admin sidebar to maximise your editing workspace'],
      ['.admin-save-btn',
        'Save all pending changes to the database — always confirm before navigating away'],
    ],
  };

  /* All pkg-*.html pages share the same set of hints */
  var PKG_HINTS = [
    ['.nav-back',
      'Return to all packages — continue browsing the full safari collection at any time'],
    ['.pkg-tab',
      'Navigate between tabs — Overview, Day-by-Day Itinerary, Rates, and What\'s Included'],
    ['.btn-book-now',
      'Reserve this journey — secure your dates with a comfortable 30% deposit, fully flexible'],
    ['.btn-whatsapp',
      'Prefer to chat? Enquire directly via WhatsApp for immediate, personal assistance from our team'],
    ['.related-card',
      'Explore similar safari experiences — curated to match your travel style, dates and interests'],
    ['.mobile-float-btn',
      'Tap to begin your reservation — our concierge confirms every detail within 24 hours'],
  ];

  /* ── RESOLVE HINTS FOR THIS PAGE ─────────────────────────────────────── */
  var hints = PAGE_HINTS[page] || (page.startsWith('pkg-') ? PKG_HINTS : null);
  if (!hints || !hints.length) return;

  /* ── FIRST-VISIT GATE (localStorage per page) ────────────────────────── */
  var storageKey = 'fjt-hints-v1-' + page;
  if (localStorage.getItem(storageKey)) return;
  localStorage.setItem(storageKey, '1');

  /* ── WAIT FOR FULL PAGE LOAD ─────────────────────────────────────────── */
  function init() {
    /* Filter to hints whose target element actually exists and is visible */
    var valid = hints.filter(function (h) {
      /* Support comma-separated selectors */
      var selectors = h[0].split(',').map(function (s) { return s.trim(); });
      return selectors.some(function (s) {
        try { return !!document.querySelector(s); } catch (e) { return false; }
      });
    });
    if (!valid.length) return;
    run(valid);
  }

  if (document.readyState === 'complete') {
    setTimeout(init, 2400);
  } else {
    window.addEventListener('load', function () { setTimeout(init, 2400); });
  }

  /* ── HINT ENGINE ─────────────────────────────────────────────────────── */
  function run(valid) {
    injectStyles();
    var bubble  = buildBubble();
    var dotRing = buildDotRing();
    var idx     = 0;
    var timer   = null;
    var done    = false;

    /* ── advance to next hint ── */
    function advance() {
      if (done) return;
      clearTimeout(timer);
      bubble.classList.remove('fjt-h-vis');
      dotRing.style.opacity = '0';
      setTimeout(function () {
        idx++;
        if (idx >= valid.length) { cleanup(); return; }
        show(idx);
      }, FADE_MS + 60);
    }

    /* ── show hint at index i ── */
    function show(i) {
      if (done) return;
      var h  = valid[i];
      /* Pick first matching selector */
      var el = null;
      var selectors = h[0].split(',').map(function (s) { return s.trim(); });
      selectors.some(function (s) {
        try { el = document.querySelector(s); return !!el; } catch (e) { return false; }
      });
      if (!el) { idx++; if (idx < valid.length) show(idx); else cleanup(); return; }

      /* Update copy */
      bubble.querySelector('.fjt-h-text').textContent  = h[1];
      bubble.querySelector('.fjt-h-count').textContent = (i + 1) + ' / ' + valid.length;

      /* Reset progress bar */
      var bar = bubble.querySelector('.fjt-h-bar');
      bar.style.transition = 'none';
      bar.style.width = '0%';
      void bar.offsetWidth;   /* force reflow */

      /* Position bubble and dot */
      positionAll(el, bubble, dotRing);

      /* Fade in */
      bubble.classList.add('fjt-h-vis');
      dotRing.style.opacity = '1';

      /* Animate progress bar */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          bar.style.transition = 'width ' + CYCLE_MS + 'ms linear';
          bar.style.width = '100%';
        });
      });

      /* Auto-advance after CYCLE_MS */
      timer = setTimeout(function () {
        bubble.classList.remove('fjt-h-vis');
        dotRing.style.opacity = '0';
        setTimeout(function () {
          idx++;
          if (idx >= valid.length) cleanup();
          else show(idx);
        }, FADE_MS + 60);
      }, CYCLE_MS);
    }

    /* ── click anywhere to skip to next (but don't swallow real interactions) ── */
    function onBodyClick(e) {
      if (done) return;
      var tag = (e.target.tagName || '').toUpperCase();
      if (['A','BUTTON','INPUT','SELECT','TEXTAREA','VIDEO','LABEL'].indexOf(tag) !== -1) return;
      e.stopPropagation();
      advance();
    }
    document.addEventListener('click', onBodyClick, true);

    /* ── reposition on resize ── */
    var rzTimer;
    function onResize() {
      clearTimeout(rzTimer);
      rzTimer = setTimeout(function () {
        if (done || idx >= valid.length) return;
        var el = null;
        var selectors = valid[idx][0].split(',').map(function (s) { return s.trim(); });
        selectors.some(function (s) {
          try { el = document.querySelector(s); return !!el; } catch (e) { return false; }
        });
        if (el) positionAll(el, bubble, dotRing);
      }, 80);
    }
    window.addEventListener('resize', onResize);

    /* ── cleanup ── */
    function cleanup() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      document.removeEventListener('click', onBodyClick, true);
      window.removeEventListener('resize', onResize);
      bubble.classList.remove('fjt-h-vis');
      dotRing.style.opacity = '0';
      setTimeout(function () {
        if (bubble.parentNode)  bubble.remove();
        if (dotRing.parentNode) dotRing.remove();
      }, FADE_MS + 100);
    }

    show(0);
  }

  /* ── POSITIONING ─────────────────────────────────────────────────────── */
  function positionAll(el, bubble, dotRing) {
    var rect = el.getBoundingClientRect();
    var vw   = window.innerWidth;
    var vh   = window.innerHeight;
    var cx   = rect.left + rect.width  / 2;
    var cy   = rect.top  + rect.height / 2;
    var BW   = 278;   /* bubble width — must match CSS */
    var BH   = 120;   /* estimated bubble height */
    var GAP  = 14;

    /* Position pulsing dot ring at element centre */
    dotRing.style.left = cx + 'px';
    dotRing.style.top  = cy + 'px';

    /* Determine best placement quadrant */
    var spaceBelow = vh - rect.bottom;
    var spaceAbove = rect.top;
    var spaceRight = vw - rect.right;
    var placement, bx, by;

    if (spaceBelow >= BH + GAP + 10) {
      placement = 'bottom';
      bx = clamp(cx - BW / 2, 8, vw - BW - 8);
      by = rect.bottom + GAP;
    } else if (spaceAbove >= BH + GAP + 10) {
      placement = 'top';
      bx = clamp(cx - BW / 2, 8, vw - BW - 8);
      by = rect.top - BH - GAP;
    } else if (spaceRight >= BW + GAP + 10) {
      placement = 'right';
      bx = rect.right + GAP;
      by = clamp(cy - BH / 2, 8, vh - BH - 8);
    } else {
      placement = 'left';
      bx = Math.max(8, rect.left - BW - GAP);
      by = clamp(cy - BH / 2, 8, vh - BH - 8);
    }

    bubble.style.left = bx + 'px';
    bubble.style.top  = by + 'px';

    /* Position arrow along the correct edge */
    var arrow = bubble.querySelector('.fjt-h-arrow');
    /* Reset all inline styles */
    arrow.style.cssText = '';
    arrow.className = 'fjt-h-arrow fjt-h-arr-' + placement;

    if (placement === 'bottom' || placement === 'top') {
      var ax = clamp((cx - bx) - 8, 12, BW - 30);
      arrow.style.left = ax + 'px';
    } else {
      var ay = clamp((cy - by) - 8, 12, BH - 24);
      arrow.style.top = ay + 'px';
    }
  }

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  /* ── DOM BUILDERS ────────────────────────────────────────────────────── */
  function buildBubble() {
    var d = document.createElement('div');
    d.className = 'fjt-h-bubble';
    d.setAttribute('role', 'tooltip');
    d.innerHTML =
      '<div class="fjt-h-arrow"></div>' +
      '<span class="fjt-h-eyebrow">Tip</span>' +
      '<span class="fjt-h-text"></span>' +
      '<div class="fjt-h-foot">' +
        '<div class="fjt-h-bar-wrap"><div class="fjt-h-bar"></div></div>' +
        '<span class="fjt-h-count"></span>' +
      '</div>';
    document.body.appendChild(d);
    return d;
  }

  function buildDotRing() {
    var d = document.createElement('div');
    d.className = 'fjt-h-dot';
    d.setAttribute('aria-hidden', 'true');
    document.body.appendChild(d);
    return d;
  }

  /* ── STYLE INJECTION ─────────────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('fjt-hints-css')) return;
    var s = document.createElement('style');
    s.id  = 'fjt-hints-css';
    /* All class names are namespaced fjt-h-* to avoid collisions */
    s.textContent =
      /* Bubble */
      '.fjt-h-bubble{' +
        'position:fixed;z-index:2147483640;pointer-events:auto;' +
        'background:#0c0c0c;' +
        'border:1px solid rgba(212,175,55,0.42);' +
        'box-shadow:0 16px 52px rgba(0,0,0,0.78),0 0 0 1px rgba(212,175,55,0.05) inset,' +
                   '0 1px 0 rgba(255,255,255,0.03) inset;' +
        'padding:16px 20px 14px 20px;' +
        'width:278px;' +
        'opacity:0;transform:translateY(7px);' +
        'transition:opacity ' + FADE_MS + 'ms cubic-bezier(0.22,1,0.36,1),' +
                   'transform ' + FADE_MS + 'ms cubic-bezier(0.22,1,0.36,1);' +
        'will-change:opacity,transform;' +
      '}' +
      '.fjt-h-bubble.fjt-h-vis{opacity:1;transform:translateY(0);}' +

      /* Eyebrow label */
      '.fjt-h-eyebrow{' +
        'display:block;' +
        'font-family:"Jost",sans-serif;font-size:7px;letter-spacing:4.5px;' +
        'text-transform:uppercase;color:rgba(212,175,55,0.58);' +
        'margin-bottom:8px;' +
      '}' +

      /* Hint text */
      '.fjt-h-text{' +
        'display:block;' +
        'font-family:"Cormorant Garamond",serif;font-size:14.5px;font-style:italic;' +
        'line-height:1.55;color:rgba(255,255,255,0.86);' +
        'margin-bottom:13px;' +
      '}' +

      /* Footer row */
      '.fjt-h-foot{display:flex;align-items:center;gap:12px;}' +
      '.fjt-h-bar-wrap{flex:1;height:1px;background:rgba(212,175,55,0.13);overflow:hidden;}' +
      '.fjt-h-bar{height:100%;width:0%;background:linear-gradient(90deg,rgba(212,175,55,0.25),rgba(212,175,55,0.7));}' +
      '.fjt-h-count{' +
        'font-family:"Jost",sans-serif;font-size:7px;letter-spacing:2.5px;' +
        'color:rgba(212,175,55,0.32);white-space:nowrap;flex-shrink:0;' +
      '}' +

      /* ── ARROWS ── */
      '.fjt-h-arrow{position:absolute;width:0;height:0;}' +

      /* Bubble BELOW element → arrow at top of bubble, pointing up */
      '.fjt-h-arr-bottom{' +
        'border-left:8px solid transparent;border-right:8px solid transparent;' +
        'border-bottom:8px solid rgba(212,175,55,0.42);' +
        'top:-8px;' +
      '}' +
      '.fjt-h-arr-bottom::after{' +
        'content:"";position:absolute;left:-6px;top:2px;' +
        'border-left:6px solid transparent;border-right:6px solid transparent;' +
        'border-bottom:6px solid #0c0c0c;' +
      '}' +

      /* Bubble ABOVE element → arrow at bottom of bubble, pointing down */
      '.fjt-h-arr-top{' +
        'border-left:8px solid transparent;border-right:8px solid transparent;' +
        'border-top:8px solid rgba(212,175,55,0.42);' +
        'bottom:-8px;' +
      '}' +
      '.fjt-h-arr-top::after{' +
        'content:"";position:absolute;left:-6px;bottom:2px;' +
        'border-left:6px solid transparent;border-right:6px solid transparent;' +
        'border-top:6px solid #0c0c0c;' +
      '}' +

      /* Bubble to the RIGHT of element → arrow at left edge, pointing left */
      '.fjt-h-arr-right{' +
        'border-top:8px solid transparent;border-bottom:8px solid transparent;' +
        'border-right:8px solid rgba(212,175,55,0.42);' +
        'left:-8px;' +
      '}' +
      '.fjt-h-arr-right::after{' +
        'content:"";position:absolute;top:-6px;left:2px;' +
        'border-top:6px solid transparent;border-bottom:6px solid transparent;' +
        'border-right:6px solid #0c0c0c;' +
      '}' +

      /* Bubble to the LEFT of element → arrow at right edge, pointing right */
      '.fjt-h-arr-left{' +
        'border-top:8px solid transparent;border-bottom:8px solid transparent;' +
        'border-left:8px solid rgba(212,175,55,0.42);' +
        'right:-8px;' +
      '}' +
      '.fjt-h-arr-left::after{' +
        'content:"";position:absolute;top:-6px;right:2px;' +
        'border-top:6px solid transparent;border-bottom:6px solid transparent;' +
        'border-left:6px solid #0c0c0c;' +
      '}' +

      /* ── DOT RING ── */
      '.fjt-h-dot{' +
        'position:fixed;z-index:2147483639;pointer-events:none;' +
        'width:34px;height:34px;border-radius:50%;' +
        'border:1.5px solid rgba(212,175,55,0.52);' +
        'margin-left:-17px;margin-top:-17px;' +  /* centre on left/top coords */
        'transition:opacity ' + FADE_MS + 'ms ease;' +
        'animation:fjt-h-ping 1.7s ease-out infinite;' +
      '}' +
      '@keyframes fjt-h-ping{' +
        '0%{transform:scale(1);opacity:0.8;}' +
        '100%{transform:scale(2.5);opacity:0;}' +
      '}';

    document.head.appendChild(s);
  }

})();
