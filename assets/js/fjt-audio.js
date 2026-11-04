/**
 * FJT AUDIO — ambient soundscape across the site
 *
 * - Plays /assets/hero-ambient.mp3 on loop, full volume on the hero, 50% further down.
 * - Browsers only allow sound after the visitor interacts, so playback starts on the
 *   first click, tap or key press (and on scroll once the page has been interacted with).
 * - The visitor's choice (sound on / off) is remembered across pages and visits.
 * - Whenever any video with sound is playing, the ambience fades out; when that video
 *   pauses or ends it fades back in — unless the visitor muted it.
 * - The control button lives in the bottom dock (fjt-dock.js), which uses window.FJTAudio.
 */
(function () {
  'use strict';
  if (window.FJTAudio) return;

  var SRC = '/assets/hero-ambient.mp3';
  var PREF_KEY = 'fjt_sound';          // 'on' | 'off' (localStorage, persists across visits)
  var POS_KEY = 'fjt_sound_pos';       // resume position between pages (sessionStorage)
  var PROMPT_KEY = 'fjt_sound_prompted';
  var VOL_FULL = 1.0, VOL_HALF = 0.5;

  function store(kind) { try { return window[kind]; } catch (e) { return null; } }
  function get(kind, k) { var s = store(kind); try { return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function set(kind, k, v) { var s = store(kind); try { if (s) s.setItem(k, v); } catch (e) {} }

  // Migrate the old session-only preference.
  if (get('localStorage', PREF_KEY) == null) {
    try {
      var old = JSON.parse(get('sessionStorage', 'fjt_audio') || '{}');
      if (typeof old.muted === 'boolean') set('localStorage', PREF_KEY, old.muted ? 'off' : 'on');
    } catch (e) {}
  }

  var audio = new Audio();
  audio.id = 'fjtAmbientAudio';
  audio.src = SRC;
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0;

  var listeners = [];
  var ducked = false;        // a video with sound is playing
  var fadeTimer = null;
  var blocked = false;       // browser refused autoplay; wait for a click/tap/key

  function pref() { return get('localStorage', PREF_KEY); }      // null = not chosen yet
  function wantsSound() { return pref() === 'on'; }
  function isPlaying() { return !audio.paused && !ducked; }
  function emit() {
    var on = wantsSound();
    listeners.forEach(function (cb) { try { cb({ on: on, playing: isPlaying(), ducked: ducked }); } catch (e) {} });
  }

  function targetVolume() {
    return window.scrollY > window.innerHeight * 0.8 ? VOL_HALF : VOL_FULL;
  }
  function fadeTo(vol, ms, done) {
    clearInterval(fadeTimer);
    var from = audio.volume, t0 = Date.now();
    fadeTimer = setInterval(function () {
      var p = Math.min((Date.now() - t0) / ms, 1);
      audio.volume = Math.max(0, Math.min(1, from + (vol - from) * p));
      if (p >= 1) { clearInterval(fadeTimer); if (done) done(); }
    }, 30);
  }

  function play() {
    if (!wantsSound() || ducked || document.hidden) return;
    if (!audio.paused) { fadeTo(targetVolume(), 600); return; }
    var pos = parseFloat(get('sessionStorage', POS_KEY));
    if (pos && isFinite(pos)) { try { audio.currentTime = pos; } catch (e) {} }
    audio.volume = 0;
    var p = audio.play();
    if (p && p.then) {
      p.then(function () { blocked = false; fadeTo(targetVolume(), 900); emit(); })
       .catch(function () { blocked = true; armGesture(); emit(); });
    }
  }
  function pause(ms) {
    if (audio.paused) return;
    set('sessionStorage', POS_KEY, String(audio.currentTime));
    fadeTo(0, ms || 500, function () { audio.pause(); emit(); });
  }

  // Start on the first real interaction (browsers block sound before that).
  var armed = false;
  function onGesture() {
    blocked = false;
    disarm();
    play();
  }
  function armGesture() {
    if (armed) return;
    armed = true;
    ['pointerdown', 'keydown', 'touchend', 'click'].forEach(function (ev) {
      window.addEventListener(ev, onGesture, { capture: true, passive: true });
    });
  }
  function disarm() {
    armed = false;
    ['pointerdown', 'keydown', 'touchend', 'click'].forEach(function (ev) {
      window.removeEventListener(ev, onGesture, { capture: true });
    });
  }

  // Scroll: start (if allowed) and adjust volume by position.
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (!wantsSound() || ducked) return;
      if (audio.paused) { if (!blocked) play(); return; }
      var t = targetVolume();
      if (Math.abs(audio.volume - t) > 0.03) fadeTo(t, 1500);
    });
  }, { passive: true });

  // ── Video ducking ───────────────────────────────────────────────
  function audible(m) {
    return m !== audio && !m.paused && !m.ended && !m.muted && m.volume > 0 && m.readyState > 1;
  }
  function anyAudibleMedia() {
    var list = document.querySelectorAll('video, audio');
    for (var i = 0; i < list.length; i++) if (audible(list[i])) return true;
    return false;
  }
  var duckCheck = null;
  function reconsider() {
    clearTimeout(duckCheck);
    duckCheck = setTimeout(function () {
      var should = anyAudibleMedia();
      if (should && !ducked) {
        ducked = true;
        pause(400);
        emit();
      } else if (!should && ducked) {
        ducked = false;
        emit();
        play();   // back to the site sound — only if the visitor hasn't muted
      }
    }, 120);
  }
  ['play', 'playing', 'pause', 'ended', 'volumechange', 'emptied', 'abort'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (e.target && e.target !== audio && /^(VIDEO|AUDIO)$/.test(e.target.tagName)) reconsider();
    }, true);
  });
  // Videos removed from the page (e.g. a closed lightbox) stop counting.
  setInterval(function () { if (ducked) reconsider(); }, 1500);

  // Pause in background tabs, resume when back.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pause(200); else play();
  });
  window.addEventListener('pagehide', function () {
    if (!audio.paused) set('sessionStorage', POS_KEY, String(audio.currentTime));
  });
  setInterval(function () { if (!audio.paused) set('sessionStorage', POS_KEY, String(audio.currentTime)); }, 2000);

  // ── Public API (used by the dock button) ────────────────────────
  function setOn(on) {
    set('localStorage', PREF_KEY, on ? 'on' : 'off');
    if (on) { disarm(); play(); } else { pause(400); }
    emit();
  }
  window.FJTAudio = {
    isOn: wantsSound,
    isPlaying: isPlaying,
    isDucked: function () { return ducked; },
    setOn: setOn,
    toggle: function () { setOn(!wantsSound()); return wantsSound(); },
    onChange: function (cb) { listeners.push(cb); },
    element: audio
  };

  // ── First-visit invitation ──────────────────────────────────────
  function showPrompt() {
    if (get('sessionStorage', PROMPT_KEY)) return;
    set('sessionStorage', PROMPT_KEY, '1');
    var ov = document.createElement('div');
    ov.id = 'fjtAudioPrompt';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-label', 'Ambient sound');
    ov.innerHTML =
      '<div class="fjt-sp-card">' +
        '<div class="fjt-sp-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg></div>' +
        '<div class="fjt-sp-title">The Wild Has a Voice</div>' +
        '<p class="fjt-sp-text">Hear Kenya\'s soundscape as you explore. Mute any time from the bar below.</p>' +
        '<div class="fjt-sp-actions">' +
          '<button type="button" class="fjt-sp-yes">Play sound</button>' +
          '<button type="button" class="fjt-sp-no">Continue silently</button>' +
        '</div>' +
      '</div>';
    var css = document.createElement('style');
    css.textContent =
      '#fjtAudioPrompt{position:fixed;inset:0;z-index:99980;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(8,6,2,.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);opacity:0;transition:opacity .4s ease}' +
      '#fjtAudioPrompt.show{opacity:1}' +
      '.fjt-sp-card{max-width:380px;width:100%;background:#0d0d0d;border:1px solid rgba(212,175,55,.3);padding:36px 30px;text-align:center;position:relative}' +
      '.fjt-sp-card:before{content:"";position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,.6),transparent)}' +
      '.fjt-sp-icon{color:#d4af37;margin-bottom:14px}' +
      '.fjt-sp-title{font-family:"Playfair Display",Georgia,serif;font-size:22px;color:#fff;margin-bottom:8px}' +
      '.fjt-sp-text{font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-size:16px;line-height:1.6;color:rgba(230,220,200,.85);margin:0 0 24px}' +
      '.fjt-sp-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}' +
      '.fjt-sp-actions button{font-family:Jost,sans-serif;font-size:10px;font-weight:500;letter-spacing:4px;text-transform:uppercase;padding:14px 22px;cursor:none}' +
      '.fjt-sp-yes{border:none;color:#080808;background:linear-gradient(135deg,#f0c84a 0%,#d4af37 35%,#b8860b 65%,#c9921a 100%);box-shadow:0 2px 0 rgba(255,255,255,.25) inset,0 -2px 0 rgba(0,0,0,.35) inset,0 4px 16px rgba(212,175,55,.4)}' +
      '.fjt-sp-no{background:transparent;color:#d4af37;border:1px solid rgba(212,175,55,.25)}' +
      '.fjt-sp-no:hover{background:rgba(212,175,55,.08);border-color:#d4af37}' +
      'body.light-mode .fjt-sp-card{background:#f0ece4;border-color:rgba(153,101,21,.35)}' +
      'body.light-mode .fjt-sp-title{color:#0a0a0a}body.light-mode .fjt-sp-text{color:#2a2a2a}' +
      'body.light-mode .fjt-sp-no{color:#996515;border-color:rgba(0,0,0,.15)}';
    document.head.appendChild(css);
    document.body.appendChild(ov);
    requestAnimationFrame(function () { requestAnimationFrame(function () { ov.classList.add('show'); }); });
    function close() { ov.classList.remove('show'); setTimeout(function () { ov.remove(); }, 420); }
    ov.querySelector('.fjt-sp-yes').addEventListener('click', function () { close(); setOn(true); });
    ov.querySelector('.fjt-sp-no').addEventListener('click', function () { close(); setOn(false); });
  }

  function init() {
    document.body.appendChild(audio);
    // The old per-page sound buttons are replaced by the dock.
    ['heroSoundBtn', 'fjtSoundBtn'].forEach(function (id) { var b = document.getElementById(id); if (b) b.remove(); });
    if (pref() == null) setTimeout(showPrompt, 1200);
    else if (wantsSound()) { play(); armGesture(); }
    emit();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
