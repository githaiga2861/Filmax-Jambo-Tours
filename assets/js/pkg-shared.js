/* ═══════════════════════════════════════════════════════════════
   FJT PKG SHARED — tabs, accordion, cursor, navbar, reveal
   Included on every package page except aerial-kenya (has own)
   ═══════════════════════════════════════════════════════════════ */

// ── Theme toggle ──
(function(){
  var toggle = document.getElementById('themeToggle');
  var tooltip = document.getElementById('themeTooltip');
  if (!toggle) return;
  var saved = localStorage.getItem('fjt-theme');
  if (saved === 'light') { document.body.classList.add('light-mode'); if(tooltip) tooltip.textContent = 'Dark Mode'; }
  else { if(tooltip) tooltip.textContent = 'Light Mode'; }
  toggle.addEventListener('click', function(){
    var isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('fjt-theme', isLight ? 'light' : 'dark');
    if(tooltip) tooltip.textContent = isLight ? 'Dark Mode' : 'Light Mode';
  });
})();

// ── Custom cursor ──
(function(){
  var cursor = document.getElementById('cursor');
  var ring = document.getElementById('cursorRing');
  if (!cursor || !ring) return;
  var mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove', function(e){
    mx=e.clientX; my=e.clientY;
    cursor.style.left=mx+'px'; cursor.style.top=my+'px';
  });
  function animateRing(){
    rx+=(mx-rx)*.12; ry+=(my-ry)*.12;
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();
  document.querySelectorAll('a,button,.pkg-highlight-item,.related-card,.day-header').forEach(function(el){
    el.addEventListener('mouseenter', function(){
      cursor.style.width='20px'; cursor.style.height='20px';
      ring.style.width='60px'; ring.style.height='60px';
      ring.style.borderColor='rgba(212,175,55,.8)';
    });
    el.addEventListener('mouseleave', function(){
      cursor.style.width='12px'; cursor.style.height='12px';
      ring.style.width='40px'; ring.style.height='40px';
      ring.style.borderColor='rgba(212,175,55,.5)';
    });
  });
})();

// ── Navbar scroll ──
(function(){
  var navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', function(){
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
})();

// ── Reveal on scroll ──
(function(){
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: .06, rootMargin: '0px 0px -30px 0px' });
  reveals.forEach(function(el){ observer.observe(el); });
})();

// ── TAB SWITCHING ──
(function(){
  var tabs   = document.querySelectorAll('.pkg-tab');
  var panels = document.querySelectorAll('.pkg-tab-panel');
  if (!tabs.length) return;

  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      var target = this.dataset.tab;

      if (window.innerWidth <= 1100) {
        // MOBILE: all panels stacked — just highlight tab and scroll to section
        tabs.forEach(function(t){ t.classList.remove('active'); });
        this.classList.add('active');
        var panel = document.getElementById('panel-' + target);
        if (panel) {
          panel.querySelectorAll('.reveal').forEach(function(el){
            if (!el.classList.contains('visible')) setTimeout(function(){ el.classList.add('visible'); }, 80);
          });
          setTimeout(function(){
            var top = panel.getBoundingClientRect().top + window.pageYOffset - 110;
            window.scrollTo({ top: top, behavior: 'smooth' });
          }, 50);
        }
      } else {
        // DESKTOP: switch active panel
        tabs.forEach(function(t){ t.classList.remove('active'); });
        panels.forEach(function(p){ p.classList.remove('active'); });
        this.classList.add('active');
        var panel = document.getElementById('panel-' + target);
        if (panel) {
          panel.classList.add('active');
          if (target === 'itinerary') {
            document.querySelectorAll('.itinerary-day.open').forEach(function(d){ d.classList.remove('open'); });
          }
          panel.querySelectorAll('.reveal').forEach(function(el){
            if (!el.classList.contains('visible')) setTimeout(function(){ el.classList.add('visible'); }, 80);
          });
        }
        var pkgMain = document.getElementById('pkgMain');
        if (pkgMain) {
          var top = pkgMain.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      }
    });
  });
})();

// ── MOBILE TAB BAR STICKY ──
(function(){
  var tabsWrapper = document.getElementById('pkgTabsWrapper');
  var pkgMain     = document.getElementById('pkgMain');
  var pkgRelated  = document.querySelector('.pkg-related');
  if (!tabsWrapper || !pkgMain) return;
  function onScroll(){
    if (window.innerWidth > 1100) { tabsWrapper.classList.remove('pkg-tabs-fixed'); return; }
    var mainRect    = pkgMain.getBoundingClientRect();
    var relatedTop  = pkgRelated ? pkgRelated.getBoundingClientRect().top : 99999;
    if (mainRect.top <= 72 && relatedTop > 72) {
      tabsWrapper.classList.add('pkg-tabs-fixed');
    } else {
      tabsWrapper.classList.remove('pkg-tabs-fixed');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();

// ── ITINERARY ACCORDION ──
(function(){
  document.querySelectorAll('.itinerary-day').forEach(function(day){ day.classList.remove('open'); });
  document.querySelectorAll('.day-header').forEach(function(header){
    header.addEventListener('click', function(){
      var day = header.closest('.itinerary-day');
      if (!day) return;
      day.classList.toggle('open');
    });
  });
})();

// ── BACK TO TOP ──
(function(){
  var btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', function(){
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });
})();

// ── MOBILE BOOK BAR ──
(function(){
  var bar = document.querySelector('.mobile-book-bar');
  if (!bar) return;
  window.addEventListener('scroll', function(){
    var docH = document.body.scrollHeight;
    var winH = window.innerHeight;
    var nearBottom = window.scrollY + winH >= docH - 600;
    if (window.scrollY > 400) {
      bar.classList.add('visible');
    } else {
      bar.classList.remove('visible');
    }
  }, { passive: true });
})();
