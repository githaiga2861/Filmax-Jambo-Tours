/* ═══════════════════════════════════════════════════════════════
   FJT BACKGROUND VIDEOS — keep silent decorative videos playing
   (hero, highlight cards, package heroes: <video autoplay muted loop>)
   • Hides Safari's play button on them.
   • If the browser blocks or pauses them (iPhone Low Power Mode, data
     saver, returning from another tab), restarts them — at the latest
     on the visitor's first tap, click, key press or scroll.
   Videos with controls (e.g. the highlight player) are left alone.
   Loaded by fjt-dock.js.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__fjtBgVideo) return;
  window.__fjtBgVideo = true;

  var css = document.createElement('style');
  css.textContent =
    'video.fjt-bgv::-webkit-media-controls,' +
    'video.fjt-bgv::-webkit-media-controls-panel,' +
    'video.fjt-bgv::-webkit-media-controls-overlay-play-button,' +
    'video.fjt-bgv::-webkit-media-controls-start-playback-button{display:none!important;-webkit-appearance:none;opacity:0!important}';
  document.head.appendChild(css);

  function candidates() {
    return Array.prototype.filter.call(document.querySelectorAll('video[autoplay]'), function (v) {
      return !v.controls && (v.muted || v.hasAttribute('muted'));
    });
  }
  function inView(v) {
    var r = v.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > -200 && r.top < window.innerHeight + 200;
  }
  function kick(v) {
    if (!v.paused || v.ended && !v.loop) return;
    if (!v.muted && v.dataset.fjtUserSound !== '1') { v.muted = true; }
    v.playsInline = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function prepare(v) {
    if (v.dataset.fjtBgv) return;
    v.dataset.fjtBgv = '1';
    v.classList.add('fjt-bgv');
    v.muted = true;            // the property matters on iOS, not just the attribute
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.addEventListener('pause', function () {
      // background videos have no controls, so any pause came from the browser
      setTimeout(function () { if (!document.hidden && inView(v)) kick(v); }, 300);
    });
    kick(v);
  }
  function sweep() { candidates().forEach(function (v) { prepare(v); if (inView(v)) kick(v); }); }

  // first interaction unlocks playback where the browser required one
  var unlocked = false;
  function unlock() {
    if (unlocked) return;
    unlocked = true;
    ['touchstart', 'pointerdown', 'click', 'keydown'].forEach(function (ev) { window.removeEventListener(ev, unlock, true); });
    sweep();
  }
  ['touchstart', 'pointerdown', 'click', 'keydown'].forEach(function (ev) { window.addEventListener(ev, unlock, { capture: true, passive: true }); });

  var t;
  window.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(sweep, 200); }, { passive: true });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) sweep(); });
  window.addEventListener('pageshow', sweep);

  // the highlight cards' sound buttons unmute their video on purpose — remember that
  document.addEventListener('volumechange', function (e) {
    var v = e.target;
    if (v && v.tagName === 'VIDEO' && v.dataset.fjtBgv) v.dataset.fjtUserSound = v.muted ? '' : '1';
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sweep); else sweep();
  setTimeout(sweep, 1500);
})();
