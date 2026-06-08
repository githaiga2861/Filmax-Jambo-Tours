/* Filmax Jambo Tours — Site Hints System v2.0
   ─────────────────────────────────────────────────────────────────────────
   RULES ENFORCED:
   • isHintActive global boolean — only ONE hint ever visible at a time
   • 6-second gap fires AFTER the current hint fully fades out (not from show)
   • getBoundingClientRect() called fresh at every show AND every scroll event
   • Arrow tip aligns to exact centre of target element
   • Off-screen elements are skipped; 6-second gap then tries the next one
   • Scroll repositions the visible hint in real time
   • All transitions are CSS opacity+transform — no snapping or flickering
   • Click dismisses current hint → 6-second gap → next hint
   • localStorage key per page; system never repeats after first visit
   ─────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── TIMING CONSTANTS ───────────────────────────────────────────────── */
  var DISPLAY_MS = 5000;  /* how long each hint stays visible              */
  var GAP_MS     = 6000;  /* pause AFTER a hint fades out, before next     */
  var FADE_MS    = 380;   /* CSS transition duration for fade in / fade out */

  /* ── GLOBAL MUTEX ───────────────────────────────────────────────────── */
  /* Only ONE hint may ever be visible. Any code path that would show a
     hint MUST check this flag first and abort if it is true.             */
  var isHintActive = false;

  /* ── PAGE DETECTION ─────────────────────────────────────────────────── */
  var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (!page.endsWith('.html')) page = 'index.html';

  /* ── HINT DEFINITIONS ───────────────────────────────────────────────── */
  /* Format: [ 'css-selector (comma-separated = try each)', 'hint text' ] */
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

  /* All pkg-*.html pages share the same hints */
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

  /* ── RESOLVE HINTS FOR THIS PAGE ────────────────────────────────────── */
  var rawHints = PAGE_HINTS[page] || (page.startsWith('pkg-') ? PKG_HINTS : null);
  if (!rawHints || !rawHints.length) return;

  /* ── FIRST-VISIT GATE (localStorage per page) ────────────────────────── */
  var storageKey = 'fjt-hints-v2-' + page;
  if (localStorage.getItem(storageKey)) return;
  localStorage.setItem(storageKey, '1');

  /* ── MODULE-LEVEL STATE ─────────────────────────────────────────────── */
  var validHints = [];   /* hints whose selectors matched at init time     */
  var bubble     = null; /* the tooltip DOM element                        */
  var dotRing    = null; /* the pulsing ring DOM element                   */
  var mainTimer  = null; /* the single active setTimeout reference         */
  var curIdx     = -1;   /* index of the hint currently showing            */
  var curEl      = null; /* the DOM element the current hint points at     */
  var engineDone = false;/* true once all hints have cycled                */
  var rzTimer    = null; /* debounce handle for resize                     */

  /* ── BOOT ───────────────────────────────────────────────────────────── */
  if (document.readyState === 'complete') {
    setTimeout(startEngine, 2400);
  } else {
    window.addEventListener('load', function () { setTimeout(startEngine, 2400); });
  }

  /* ─────────────────────────────────────────────────────────────────────
     startEngine — build DOM once, then kick off the first hint
     ───────────────────────────────────────────────────────────────────── */
  function startEngine() {
    /* Filter raw hints to those whose element actually exists in the DOM */
    validHints = rawHints.filter(function (h) {
      return !!resolveEl(h[0]);
    });
    if (!validHints.length) return;

    injectStyles();
    bubble  = buildBubble();
    dotRing = buildDotRing();

    /* Global listeners — attached once, cleaned up in finalCleanup() */
    document.addEventListener('click',  onBodyClick, true);
    window.addEventListener('scroll',   onScroll,    { passive: true });
    window.addEventListener('resize',   onResize);

    /* Show the first hint with no initial gap */
    scheduleShow(0, 0);
  }

  /* ─────────────────────────────────────────────────────────────────────
     scheduleShow — wait `delayMs`, then call tryShow(idx)
     All hint scheduling goes through this single chokepoint.
     ───────────────────────────────────────────────────────────────────── */
  function scheduleShow(idx, delayMs) {
    clearTimeout(mainTimer);
    mainTimer = setTimeout(function () {
      tryShow(idx);
    }, delayMs);
  }

  /* ─────────────────────────────────────────────────────────────────────
     tryShow — attempt to display hint[idx]
     • Checks the global mutex (isHintActive) — aborts if true
     • Calls getBoundingClientRect() right now to check visibility
     • Skips off-screen elements (waits GAP_MS then tries idx+1)
     • Sets isHintActive = true BEFORE any visual change
     ───────────────────────────────────────────────────────────────────── */
  function tryShow(idx) {
    if (engineDone) return;

    /* End of sequence */
    if (idx >= validHints.length) {
      finalCleanup();
      return;
    }

    /* ── Global mutex guard ── */
    /* If somehow another hint is still active, abort silently. */
    if (isHintActive) return;

    var h  = validHints[idx];
    var el = resolveEl(h[0]);

    /* Element must exist and be within the viewport right now */
    if (!el || !isInViewport(el)) {
      /* Skip this hint — wait GAP_MS then try the next one */
      scheduleShow(idx + 1, GAP_MS);
      return;
    }

    /* ── Claim the mutex ── */
    isHintActive = true;
    curIdx = idx;
    curEl  = el;

    /* Populate text content */
    bubble.querySelector('.fjt-h-text').textContent  = h[1];
    bubble.querySelector('.fjt-h-count').textContent = (idx + 1) + ' / ' + validHints.length;

    /* Position using a fresh getBoundingClientRect() call RIGHT NOW */
    positionBubble(el);

    /* Reset the progress bar (no transition while resetting) */
    var bar = bubble.querySelector('.fjt-h-bar');
    bar.style.transition = 'none';
    bar.style.width      = '0%';
    void bar.offsetWidth; /* force layout so transition reset takes effect */

    /* ── Fade in ── */
    bubble.classList.add('fjt-h-vis');
    dotRing.style.opacity = '1';

    /* Start progress bar animation across DISPLAY_MS */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bar.style.transition = 'width ' + DISPLAY_MS + 'ms linear';
        bar.style.width      = '100%';
      });
    });

    /* Auto-dismiss after the hint has been visible for DISPLAY_MS */
    mainTimer = setTimeout(function () {
      beginDismiss(idx + 1);
    }, DISPLAY_MS);
  }

  /* ─────────────────────────────────────────────────────────────────────
     beginDismiss — fade out the current hint, then release the mutex and
     schedule the next hint after a full GAP_MS has elapsed.
     The GAP_MS countdown starts ONLY after the fade-out completes.
     ───────────────────────────────────────────────────────────────────── */
  function beginDismiss(nextIdx) {
    if (engineDone) return;

    /* ── Fade out ── */
    bubble.classList.remove('fjt-h-vis');
    dotRing.style.opacity = '0';
    curEl = null; /* stop scroll repositioning */

    /* Wait for the CSS fade to finish, then release mutex and start gap */
    setTimeout(function () {
      isHintActive = false; /* ← mutex released here, after full fade-out */

      if (nextIdx >= validHints.length) {
        finalCleanup();
        return;
      }

      /* 6-second gap starts NOW — after the hint has fully disappeared */
      scheduleShow(nextIdx, GAP_MS);
    }, FADE_MS + 30);
  }

  /* ─────────────────────────────────────────────────────────────────────
     onBodyClick — clicking anywhere dismisses the active hint.
     The 6-second countdown then resets and begins from this moment.
     Clicks on real interactive elements (links, buttons etc.) are ignored.
     ───────────────────────────────────────────────────────────────────── */
  function onBodyClick(e) {
    if (engineDone || !isHintActive) return;

    var tag = (e.target.tagName || '').toUpperCase();
    var ignored = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'VIDEO', 'LABEL'];
    if (ignored.indexOf(tag) !== -1) return;

    e.stopPropagation();
    clearTimeout(mainTimer); /* cancel the auto-dismiss timer */
    beginDismiss(curIdx + 1);
  }

  /* ─────────────────────────────────────────────────────────────────────
     onScroll — reposition the visible hint in real time as the user scrolls.
     Calls getBoundingClientRect() on the current element at every event.
     ───────────────────────────────────────────────────────────────────── */
  function onScroll() {
    if (engineDone || !isHintActive || !curEl) return;
    positionBubble(curEl); /* fresh rect every scroll event */
  }

  /* ─────────────────────────────────────────────────────────────────────
     onResize — reposition with an 80 ms debounce to avoid thrashing
     ───────────────────────────────────────────────────────────────────── */
  function onResize() {
    clearTimeout(rzTimer);
    rzTimer = setTimeout(function () {
      if (engineDone || !isHintActive || !curEl) return;
      positionBubble(curEl);
    }, 80);
  }

  /* ─────────────────────────────────────────────────────────────────────
     finalCleanup — remove DOM elements and all listeners
     ───────────────────────────────────────────────────────────────────── */
  function finalCleanup() {
    if (engineDone) return;
    engineDone = true;
    isHintActive = false;
    clearTimeout(mainTimer);
    clearTimeout(rzTimer);
    document.removeEventListener('click',  onBodyClick, true);
    window.removeEventListener('scroll',   onScroll);
    window.removeEventListener('resize',   onResize);
    if (bubble)  { bubble.classList.remove('fjt-h-vis'); }
    if (dotRing) { dotRing.style.opacity = '0'; }
    setTimeout(function () {
      if (bubble  && bubble.parentNode)  bubble.remove();
      if (dotRing && dotRing.parentNode) dotRing.remove();
    }, FADE_MS + 100);
  }

  /* ─────────────────────────────────────────────────────────────────────
     positionBubble — ALWAYS calls getBoundingClientRect() fresh.
     Arrow tip is aligned to the EXACT CENTRE of the target element.
     Called at: show time, every scroll event, every resize event.
     ───────────────────────────────────────────────────────────────────── */
  function positionBubble(el) {
    /* Fresh layout data at this exact moment */
    var rect = el.getBoundingClientRect();
    var vw   = window.innerWidth;
    var vh   = window.innerHeight;

    /* Exact centre of the target element */
    var cx = rect.left + rect.width  / 2;
    var cy = rect.top  + rect.height / 2;

    /* Bubble geometry (width must match CSS; height is an estimate) */
    var BW  = 278;
    var BH  = 120;
    var GAP = 14; /* pixel gap between element edge and bubble edge */

    /* ── Place the pulsing dot ring at the element's exact centre ── */
    dotRing.style.left = cx + 'px';
    dotRing.style.top  = cy + 'px';

    /* ── Choose the quadrant with the most available space ── */
    var spaceBelow = vh - rect.bottom;
    var spaceAbove = rect.top;
    var spaceRight = vw - rect.right;
    var placement, bx, by;

    if (spaceBelow >= BH + GAP + 10) {
      /* Bubble below element */
      placement = 'bottom';
      bx = clamp(cx - BW / 2, 8, vw - BW - 8);
      by = rect.bottom + GAP;
    } else if (spaceAbove >= BH + GAP + 10) {
      /* Bubble above element */
      placement = 'top';
      bx = clamp(cx - BW / 2, 8, vw - BW - 8);
      by = rect.top - BH - GAP;
    } else if (spaceRight >= BW + GAP + 10) {
      /* Bubble right of element */
      placement = 'right';
      bx = rect.right + GAP;
      by = clamp(cy - BH / 2, 8, vh - BH - 8);
    } else {
      /* Bubble left of element */
      placement = 'left';
      bx = Math.max(8, rect.left - BW - GAP);
      by = clamp(cy - BH / 2, 8, vh - BH - 8);
    }

    bubble.style.left = bx + 'px';
    bubble.style.top  = by + 'px';

    /* ── Position the arrow so its visual TIP points to (cx, cy) ── */
    var arrow = bubble.querySelector('.fjt-h-arrow');
    arrow.style.cssText = '';
    arrow.className = 'fjt-h-arrow fjt-h-arr-' + placement;

    if (placement === 'bottom' || placement === 'top') {
      /* Arrow moves horizontally; its centre (8 px wide) aligns with cx */
      arrow.style.left = clamp(cx - bx - 8, 10, BW - 28) + 'px';
    } else {
      /* Arrow moves vertically; its centre (8 px tall) aligns with cy */
      arrow.style.top = clamp(cy - by - 8, 10, BH - 24) + 'px';
    }
  }

  /* ── HELPERS ─────────────────────────────────────────────────────────── */

  /* Resolve the first matching DOM element for a (possibly comma-separated)
     selector string. Returns null if none match or selector is invalid.   */
  function resolveEl(selectorStr) {
    var parts = selectorStr.split(',');
    for (var i = 0; i < parts.length; i++) {
      var s = parts[i].trim();
      try {
        var el = document.querySelector(s);
        if (el) return el;
      } catch (e) { /* invalid selector — skip */ }
    }
    return null;
  }

  /* Return true if the element has a non-zero size AND overlaps the viewport */
  function isInViewport(el) {
    var r = el.getBoundingClientRect();
    return (
      r.width  > 0 &&
      r.height > 0 &&
      r.bottom > 0 &&
      r.right  > 0 &&
      r.top    < window.innerHeight &&
      r.left   < window.innerWidth
    );
  }

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  /* ── DOM BUILDERS ────────────────────────────────────────────────────── */
  function buildBubble() {
    var d = document.createElement('div');
    d.className = 'fjt-h-bubble';
    d.setAttribute('role', 'tooltip');
    d.setAttribute('aria-live', 'polite');
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
  /* All class names are namespaced fjt-h-* to avoid collisions with the
     site's existing CSS. This block is injected once per page load.       */
  function injectStyles() {
    if (document.getElementById('fjt-hints-css')) return;
    var s = document.createElement('style');
    s.id  = 'fjt-hints-css';
    s.textContent =

      /* ── Bubble ── */
      '.fjt-h-bubble{' +
        'position:fixed;z-index:2147483640;pointer-events:auto;' +
        'background:#0c0c0c;' +
        'border:1px solid rgba(212,175,55,0.42);' +
        'box-shadow:0 16px 52px rgba(0,0,0,0.78),' +
                   '0 0 0 1px rgba(212,175,55,0.05) inset,' +
                   '0 1px 0 rgba(255,255,255,0.03) inset;' +
        'padding:16px 20px 14px 20px;' +
        'width:278px;' +
        /* start invisible and shifted down */
        'opacity:0;transform:translateY(7px);' +
        'transition:opacity ' + FADE_MS + 'ms cubic-bezier(0.22,1,0.36,1),' +
                   'transform ' + FADE_MS + 'ms cubic-bezier(0.22,1,0.36,1);' +
        'will-change:opacity,transform;' +
      '}' +
      /* Adding fjt-h-vis fades in and lifts into place */
      '.fjt-h-bubble.fjt-h-vis{opacity:1;transform:translateY(0);}' +

      /* ── Eyebrow label ── */
      '.fjt-h-eyebrow{' +
        'display:block;' +
        'font-family:"Jost",sans-serif;font-size:7px;letter-spacing:4.5px;' +
        'text-transform:uppercase;color:rgba(212,175,55,0.58);' +
        'margin-bottom:8px;' +
      '}' +

      /* ── Hint body text ── */
      '.fjt-h-text{' +
        'display:block;' +
        'font-family:"Cormorant Garamond",serif;font-size:14.5px;font-style:italic;' +
        'line-height:1.55;color:rgba(255,255,255,0.86);' +
        'margin-bottom:13px;' +
      '}' +

      /* ── Footer: progress bar + counter ── */
      '.fjt-h-foot{display:flex;align-items:center;gap:12px;}' +
      '.fjt-h-bar-wrap{flex:1;height:1px;background:rgba(212,175,55,0.13);overflow:hidden;}' +
      '.fjt-h-bar{height:100%;width:0%;' +
        'background:linear-gradient(90deg,rgba(212,175,55,0.25),rgba(212,175,55,0.7));}' +
      '.fjt-h-count{' +
        'font-family:"Jost",sans-serif;font-size:7px;letter-spacing:2.5px;' +
        'color:rgba(212,175,55,0.32);white-space:nowrap;flex-shrink:0;' +
      '}' +

      /* ── Arrow base ── */
      '.fjt-h-arrow{position:absolute;width:0;height:0;}' +

      /* Bubble BELOW element → arrow at TOP of bubble, pointing UP ↑ */
      '.fjt-h-arr-bottom{' +
        'border-left:8px solid transparent;border-right:8px solid transparent;' +
        'border-bottom:8px solid rgba(212,175,55,0.42);top:-8px;' +
      '}' +
      '.fjt-h-arr-bottom::after{' +
        'content:"";position:absolute;left:-6px;top:2px;' +
        'border-left:6px solid transparent;border-right:6px solid transparent;' +
        'border-bottom:6px solid #0c0c0c;' +
      '}' +

      /* Bubble ABOVE element → arrow at BOTTOM of bubble, pointing DOWN ↓ */
      '.fjt-h-arr-top{' +
        'border-left:8px solid transparent;border-right:8px solid transparent;' +
        'border-top:8px solid rgba(212,175,55,0.42);bottom:-8px;' +
      '}' +
      '.fjt-h-arr-top::after{' +
        'content:"";position:absolute;left:-6px;bottom:2px;' +
        'border-left:6px solid transparent;border-right:6px solid transparent;' +
        'border-top:6px solid #0c0c0c;' +
      '}' +

      /* Bubble RIGHT of element → arrow at LEFT edge of bubble, pointing LEFT ← */
      '.fjt-h-arr-right{' +
        'border-top:8px solid transparent;border-bottom:8px solid transparent;' +
        'border-right:8px solid rgba(212,175,55,0.42);left:-8px;' +
      '}' +
      '.fjt-h-arr-right::after{' +
        'content:"";position:absolute;top:-6px;left:2px;' +
        'border-top:6px solid transparent;border-bottom:6px solid transparent;' +
        'border-right:6px solid #0c0c0c;' +
      '}' +

      /* Bubble LEFT of element → arrow at RIGHT edge of bubble, pointing RIGHT → */
      '.fjt-h-arr-left{' +
        'border-top:8px solid transparent;border-bottom:8px solid transparent;' +
        'border-left:8px solid rgba(212,175,55,0.42);right:-8px;' +
      '}' +
      '.fjt-h-arr-left::after{' +
        'content:"";position:absolute;top:-6px;right:2px;' +
        'border-top:6px solid transparent;border-bottom:6px solid transparent;' +
        'border-left:6px solid #0c0c0c;' +
      '}' +

      /* ── Pulsing dot ring at element centre ── */
      '.fjt-h-dot{' +
        'position:fixed;z-index:2147483639;pointer-events:none;' +
        'width:34px;height:34px;border-radius:50%;' +
        'border:1.5px solid rgba(212,175,55,0.52);' +
        'margin-left:-17px;margin-top:-17px;' + /* offset so left/top = centre */
        'opacity:0;' +
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
