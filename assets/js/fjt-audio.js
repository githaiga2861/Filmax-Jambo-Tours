/**
 * FJT AUDIO — Persistent ambient sound across all pages
 * Uses sessionStorage to track play state and resume position
 * Requests permission on first visit, then plays seamlessly
 */
(function () {
  'use strict';

  const AUDIO_SRC     = '/Filmax-Jambo-Tours/assets/hero-ambient.mp3';
  const STORAGE_KEY   = 'fjt_audio';
  const PROMPT_KEY    = 'fjt_audio_prompted';
  const VOL_FULL      = 1.0;
  const VOL_HALF      = 0.5;
  const FADE_DURATION = 2000;

  // ── State ──────────────────────────────────────────────────────
  function getState() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; } catch(_) { return {}; }
  }
  function setState(obj) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign(getState(), obj))); } catch(_) {}
  }

  // ── Audio element ──────────────────────────────────────────────
  var audio = document.createElement('audio');
  audio.id       = 'fjtAmbientAudio';
  audio.loop     = true;
  audio.preload  = 'auto';
  audio.volume   = 0;
  audio.style.display = 'none';
  var src = document.createElement('source');
  src.src  = AUDIO_SRC;
  src.type = 'audio/mpeg';
  audio.appendChild(src);
  document.body.appendChild(audio);

  // ── Volume fade ────────────────────────────────────────────────
  var fadeTimer = null;
  function fadeTo(targetVol, duration) {
    clearInterval(fadeTimer);
    var startVol  = audio.volume;
    var startTime = Date.now();
    fadeTimer = setInterval(function () {
      var elapsed  = Date.now() - startTime;
      var progress = Math.min(elapsed / duration, 1);
      audio.volume = startVol + (targetVol - startVol) * progress;
      if (progress >= 1) clearInterval(fadeTimer);
    }, 30);
  }

  // ── Play ───────────────────────────────────────────────────────
  function startPlay() {
    var state = getState();
    if (state.muted) return;
    if (state.currentTime) {
      try { audio.currentTime = parseFloat(state.currentTime) || 0; } catch(_) {}
    }
    audio.volume = 0;
    audio.play().then(function () {
      fadeTo(VOL_FULL, 800);
      setState({ playing: true });
      startScrollWatcher();
      startTimeSaver();
      updateBtn(true);
    }).catch(function () {
      setState({ playing: false });
      updateBtn(false);
    });
  }

  // ── Scroll watcher — fade to 50% past hero ─────────────────────
  function startScrollWatcher() {
    var heroHeight = window.innerHeight;
    var ticking    = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var state = getState();
        if (state.muted || audio.paused) return;
        var pastHero = window.scrollY > heroHeight * 0.8;
        var target   = pastHero ? VOL_HALF : VOL_FULL;
        if (Math.abs(audio.volume - target) > 0.02) fadeTo(target, FADE_DURATION);
      });
    }, { passive: true });
  }

  // ── Save current time every 2s ─────────────────────────────────
  function startTimeSaver() {
    setInterval(function () {
      if (!audio.paused) setState({ currentTime: audio.currentTime });
    }, 2000);
  }

  // ── Mute toggle button ────────────────────────────────────────
  function createBtn() {
    var existing = document.getElementById('fjtSoundBtn');
    if (existing) return existing;
    var btn = document.createElement('button');
    btn.id = 'fjtSoundBtn';
    btn.setAttribute('aria-label', 'Toggle ambient sound');
    btn.style.cssText = [
      'position:fixed',
      'bottom:100px',
      'right:36px',
      'z-index:9000',
      'width:44px',
      'height:44px',
      'border-radius:50%',
      'background:rgba(8,8,8,0.75)',
      'border:1px solid rgba(212,175,55,0.4)',
      'backdrop-filter:blur(10px)',
      '-webkit-backdrop-filter:blur(10px)',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'cursor:none',
      'transition:border-color .3s,background .3s',
      'opacity:0',
      'animation:fjtBtnFadeIn .5s .8s forwards'
    ].join(';');
    btn.innerHTML = [
      '<svg id="fjtIconSound" width="18" height="18" viewBox="0 0 24 24" fill="none" style="display:none">',
        '<path d="M11 5L6 9H2v6h4l5 4V5z" stroke="rgba(212,175,55,0.9)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
        '<path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="rgba(212,175,55,0.9)" stroke-width="1.4" stroke-linecap="round"/>',
        '<path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="rgba(212,175,55,0.9)" stroke-width="1.4" stroke-linecap="round"/>',
      '</svg>',
      '<svg id="fjtIconMuted" width="18" height="18" viewBox="0 0 24 24" fill="none">',
        '<path d="M11 5L6 9H2v6h4l5 4V5z" stroke="rgba(212,175,55,0.85)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
        '<line x1="23" y1="9" x2="17" y2="15" stroke="rgba(212,175,55,0.85)" stroke-width="1.4" stroke-linecap="round"/>',
        '<line x1="17" y1="9" x2="23" y2="15" stroke="rgba(212,175,55,0.85)" stroke-width="1.4" stroke-linecap="round"/>',
      '</svg>'
    ].join('');

    // Add keyframe
    var style = document.createElement('style');
    style.textContent = '@keyframes fjtBtnFadeIn{to{opacity:1}}';
    document.head.appendChild(style);

    btn.addEventListener('click', function () {
      var state = getState();
      if (state.muted || audio.paused) {
        setState({ muted: false });
        startPlay();
      } else {
        setState({ muted: true, currentTime: audio.currentTime });
        fadeTo(0, 500);
        setTimeout(function () { audio.pause(); }, 520);
        updateBtn(false);
      }
    });
    document.body.appendChild(btn);
    return btn;
  }

  function updateBtn(playing) {
    var soundIcon = document.getElementById('fjtIconSound');
    var mutedIcon = document.getElementById('fjtIconMuted');
    var btn       = document.getElementById('fjtSoundBtn');
    if (!btn) return;
    if (playing) {
      if (soundIcon) soundIcon.style.display = 'block';
      if (mutedIcon) mutedIcon.style.display = 'none';
      btn.style.borderColor = 'rgba(212,175,55,0.85)';
      btn.style.background  = 'rgba(212,175,55,0.12)';
    } else {
      if (soundIcon) soundIcon.style.display = 'none';
      if (mutedIcon) mutedIcon.style.display = 'block';
      btn.style.borderColor = 'rgba(212,175,55,0.35)';
      btn.style.background  = 'rgba(8,8,8,0.75)';
    }
  }

  // ── Permission prompt ─────────────────────────────────────────
  function showPrompt() {
    if (sessionStorage.getItem(PROMPT_KEY)) return;
    sessionStorage.setItem(PROMPT_KEY, '1');

    var overlay = document.createElement('div');
    overlay.id = 'fjtAudioPrompt';
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:99990',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'background:rgba(8,6,2,0.75)',
      'backdrop-filter:blur(16px)',
      '-webkit-backdrop-filter:blur(16px)',
      'opacity:0',
      'transition:opacity .4s ease'
    ].join(';');

    overlay.innerHTML = [
      '<div style="',
        'max-width:420px;width:90%;',
        'background:#0d0d0d;',
        'border:1px solid rgba(212,175,55,0.3);',
        'padding:48px 40px;',
        'text-align:center;',
        'position:relative;',
      '">',
        '<div style="position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(to right,transparent,rgba(212,175,55,0.5),transparent);"></div>',
        '<div style="font-size:36px;margin-bottom:20px;">🎵</div>',
        '<div style="font-family:\'Playfair Display\',Georgia,serif;font-size:24px;font-weight:700;color:#ffffff;margin-bottom:8px;">',
          'The Wild Has a Voice',
        '</div>',
        '<p style="font-family:\'Cormorant Garamond\',Georgia,serif;font-size:16px;font-style:italic;color:rgba(212,200,180,0.9);line-height:1.8;margin-bottom:32px;">',
          'Experience Kenya\'s ambient soundscape as you explore. You can mute at any time.',
        '</p>',
        '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">',
          '<button id="fjtPromptYes" style="',
            'font-family:\'Jost\',sans-serif;font-size:10px;font-weight:800;',
            'letter-spacing:4px;text-transform:uppercase;',
            'padding:16px 36px;',
            'background:linear-gradient(135deg,#f0c84a,#d4af37,#b8860b);',
            'color:#080808;border:none;cursor:pointer;',
            'transition:transform .3s,box-shadow .3s;',
            'box-shadow:0 4px 20px rgba(212,175,55,0.35);',
          '">',
            '🔊 &nbsp;Yes, Play Sound',
          '</button>',
          '<button id="fjtPromptNo" style="',
            'font-family:\'Jost\',sans-serif;font-size:10px;font-weight:700;',
            'letter-spacing:4px;text-transform:uppercase;',
            'padding:16px 28px;',
            'background:transparent;',
            'color:rgba(212,175,55,0.7);',
            'border:1px solid rgba(212,175,55,0.25);',
            'cursor:pointer;',
            'transition:border-color .3s,color .3s;',
          '">',
            'Continue Silently',
          '</button>',
        '</div>',
        '<div style="position:absolute;bottom:0;left:10%;right:10%;height:1px;background:linear-gradient(to right,transparent,rgba(212,175,55,0.3),transparent);"></div>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { overlay.style.opacity = '1'; });
    });

    function closePrompt() {
      overlay.style.opacity = '0';
      setTimeout(function () {
        overlay.remove();
        document.body.style.overflow = '';
      }, 420);
    }

    document.getElementById('fjtPromptYes').addEventListener('click', function () {
      setState({ muted: false });
      closePrompt();
      createBtn();
      startPlay();
    });

    document.getElementById('fjtPromptNo').addEventListener('click', function () {
      setState({ muted: true });
      closePrompt();
      createBtn();
      updateBtn(false);
    });
  }

  // ── Init ───────────────────────────────────────────────────────
  function init() {
    var state = getState();
    createBtn();

    // Hide the old heroSoundBtn if it exists on index.html
    var oldBtn = document.getElementById('heroSoundBtn');
    if (oldBtn) oldBtn.style.display = 'none';

    if (typeof state.muted === 'undefined') {
      // First visit ever — show prompt after short delay
      setTimeout(showPrompt, 1200);
    } else if (!state.muted) {
      // Returning to a page, was playing — resume
      startPlay();
      updateBtn(true);
    } else {
      // Was muted — show muted button
      updateBtn(false);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
