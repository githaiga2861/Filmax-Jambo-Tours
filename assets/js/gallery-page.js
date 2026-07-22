/* ═══════════════════════════════════════════════════════════════
   FULL GALLERY PAGE — fetches every gallery item (tiles + pool),
   renders a uniform grid, and reuses the site's lightbox pattern.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  var grid = document.getElementById('fullGalleryGrid');
  if (!grid) return;

  var lb = document.getElementById('galLightbox');
  var lbBackdrop = document.getElementById('galLbBackdrop');
  var lbStage = document.getElementById('galLbStage');
  var lbClose = document.getElementById('galLbClose');
  var lbPrev = document.getElementById('galLbPrev');
  var lbNext = document.getElementById('galLbNext');
  var lbEyebrow = document.getElementById('galLbEyebrow');
  var lbTitle = document.getElementById('galLbTitle');
  var lbCur = document.getElementById('galLbCur');
  var lbTotal = document.getElementById('galLbTotal');

  var media = [];
  var curIndex = 0;
  var lockedScrollY = 0;
  var curScale = 1;

  function resetZoom(){
    curScale = 1;
    var el = lbStage.querySelector('img, video');
    if (el) el.style.transform = 'scale(1)';
  }

  function buildStage(idx){
    var m = media[idx];
    if (!m) return;
    lbStage.innerHTML = '';
    if (m.media_type === 'video') {
      var v = document.createElement('video');
      v.src = m.image_url; v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.controls = false;
      lbStage.appendChild(v);
    } else {
      var img = document.createElement('img');
      img.src = m.image_url; img.alt = m.title;
      lbStage.appendChild(img);
    }
    lbEyebrow.textContent = m.eyebrow;
    lbTitle.textContent = m.title;
    lbCur.textContent = idx + 1;
    lbTotal.textContent = media.length;
    curIndex = idx;
    resetZoom();
  }
  function openLb(idx){
    buildStage(idx);
    lb.classList.add('gc-lb-open');
    lb.setAttribute('aria-hidden', 'false');
    lockedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = (-lockedScrollY) + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }
  function closeLb(){
    lb.classList.remove('gc-lb-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, lockedScrollY);
    var v = lbStage.querySelector('video'); if (v) v.pause();
  }
  function nav(dir){
    var next = (curIndex + dir + media.length) % media.length;
    buildStage(next);
  }

  (function(){
    var touchStartX = 0, touchStartY = 0, isSwiping = false;
    var pinchStartDist = 0, pinchStartScale = 1, isPinching = false;

    function touchDist(touches){
      var dx = touches[0].clientX - touches[1].clientX;
      var dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx*dx + dy*dy);
    }

    lbStage.addEventListener('touchstart', function(e){
      if (e.touches.length === 2) {
        isPinching = true;
        isSwiping = false;
        pinchStartDist = touchDist(e.touches);
        pinchStartScale = curScale;
      } else if (e.touches.length === 1 && !isPinching) {
        isSwiping = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    lbStage.addEventListener('touchmove', function(e){
      if (isPinching && e.touches.length === 2) {
        e.preventDefault();
        var newDist = touchDist(e.touches);
        var scale = pinchStartScale * (newDist / pinchStartDist);
        curScale = Math.min(Math.max(scale, 1), 4);
        var el = lbStage.querySelector('img, video');
        if (el) el.style.transform = 'scale(' + curScale + ')';
      }
    }, { passive: false });

    lbStage.addEventListener('touchend', function(e){
      if (e.touches.length < 2) isPinching = false;
      if (isSwiping && e.touches.length === 0 && curScale <= 1) {
        var endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : touchStartX;
        var endY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : touchStartY;
        var dx = endX - touchStartX;
        var dy = endY - touchStartY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
          nav(dx < 0 ? 1 : -1);
        }
      }
      isSwiping = false;
    }, { passive: true });
  })();
  if (lbClose) lbClose.addEventListener('click', closeLb);
  if (lbBackdrop) lbBackdrop.addEventListener('click', closeLb);
  if (lbPrev) lbPrev.addEventListener('click', function(){ nav(-1); });
  if (lbNext) lbNext.addEventListener('click', function(){ nav(1); });
  document.addEventListener('keydown', function(e){
    if (!lb.classList.contains('gc-lb-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') nav(-1);
    if (e.key === 'ArrowRight') nav(1);
  });

  function renderGrid(){
    grid.innerHTML = media.map(function(m, i){
      var el = m.media_type === 'video'
        ? '<video class="fg-media" src="' + m.image_url + '" muted loop playsinline preload="metadata"></video>'
        : '<img class="fg-media" src="' + m.image_url + '" alt="' + (m.alt_text || m.title) + '" loading="lazy">';
      var playIcon = m.media_type === 'video'
        ? '<span class="fg-play"><svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 1.5v9l7-4.5-7-4.5z" fill="#f0ece4"/></svg></span>'
        : '';
      return '<div class="fg-item reveal" data-idx="' + i + '" tabindex="0" role="button" aria-label="Open ' + m.title + '">' +
        el + playIcon +
        '<div class="fg-scrim"></div>' +
        '<div class="fg-cap"><span class="fg-eyebrow">' + m.eyebrow + '</span><h3 class="fg-title">' + m.title + '</h3></div>' +
        '</div>';
    }).join('');

    grid.querySelectorAll('.fg-item').forEach(function(el){
      el.addEventListener('click', function(){ openLb(parseInt(el.dataset.idx, 10)); });
      el.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(parseInt(el.dataset.idx, 10)); }
      });
    });

    // Reveal animation — pkg-shared.js's observer only watches .reveal
    // elements present at page load; these are inserted dynamically after
    // the Supabase fetch, so they need their own observer here.
    if ('IntersectionObserver' in window) {
      var revealObs = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if (en.isIntersecting) {
            en.target.classList.add('visible');
            revealObs.unobserve(en.target);
          }
        });
      }, { threshold: 0.1 });
      grid.querySelectorAll('.fg-item').forEach(function(el){ revealObs.observe(el); });
    } else {
      grid.querySelectorAll('.fg-item').forEach(function(el){ el.classList.add('visible'); });
    }

    // Autoplay muted videos once visible
    var vids = Array.from(grid.querySelectorAll('video.fg-media'));
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(en){
          if (en.isIntersecting) { var p = en.target.play(); if (p && p.catch) p.catch(function(){}); }
          else { en.target.pause(); }
        });
      }, { rootMargin: '80px', threshold: 0.25 });
      vids.forEach(function(v){ obs.observe(v); });
    }
  }

  var SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';

  fetch(SUPA_URL + '/rest/v1/gallery_items?select=*&order=tile_index.asc.nullslast,sort_order.asc', {
    headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
  }).then(function(r){ return r.json(); }).then(function(data){
    if (!Array.isArray(data) || !data.length) {
      grid.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;">No gallery items found.</p>';
      return;
    }
    media = data;
    renderGrid();
  }).catch(function(){
    grid.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;">Could not load the gallery right now. Please try again shortly.</p>';
  });
})();
