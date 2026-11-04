/* ═══════════════════════════════════════════════════════════════
   FJT FOOTER — shared across every page (except reserve.html)
   Accordion toggle on mobile + dynamic "Our Collection" package list
   ═══════════════════════════════════════════════════════════════ */
(function(){
  document.querySelectorAll('.footer-col-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      var col = btn.closest('.footer-col');
      var isOpen = col.classList.contains('open');
      document.querySelectorAll('.footer-col').forEach(function(c){ c.classList.remove('open'); });
      if (!isOpen) col.classList.add('open');
    });
  });


  // Make sure every footer lists all official channels from linktr.ee/filmaxjambotours
  (function () {
    var bars = document.querySelectorAll('.footer-socials');
    if (!bars.length) return;
    var WA = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8c-1-.4-1.8-1.2-2.2-2.2l.8-1-1-2z" fill="currentColor"/></svg>';
    var MAIL = '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 6.5l8.5 6 8.5-6" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    var TREE = '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3v18M6 7l6 5 6-5M7.5 12.5L12 16l4.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var X = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.4 21H2.3l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>';
    var extra = [
      { href: 'https://wa.me/34672304384', label: 'WhatsApp', svg: WA, test: 'wa.me' },
      { href: 'mailto:hello@filmaxjambotours.com', label: 'Email', svg: MAIL, test: 'mailto:' },
      { href: 'https://linktr.ee/filmaxjambotours', label: 'All links', svg: TREE, test: 'linktr.ee' }
    ];
    bars.forEach(function (bar) {
      // proper X logo instead of a plain cross
      var x = bar.querySelector('a[href*="x.com"]');
      if (x) { x.href = 'https://x.com/filmax_tours'; x.innerHTML = X; }
      extra.forEach(function (e) {
        if (bar.querySelector('a[href*="' + e.test + '"]')) return;
        var a = document.createElement('a');
        a.href = e.href;
        a.className = 'footer-social-icon';
        a.setAttribute('aria-label', e.label);
        a.title = e.label;
        if (e.test !== 'mailto:') { a.target = '_blank'; a.rel = 'noopener'; }
        a.innerHTML = e.svg;
        bar.appendChild(a);
      });
    });
  })();

  var list = document.getElementById('footerCollectionList');
  if (!list) return;
  var SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';

  fetch(SUPA_URL + '/rest/v1/packages?select=name,slug,detail_page_url&is_published=eq.true&order=name.asc', {
    headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
  }).then(function(r){ return r.json(); }).then(function(data){
    if (!Array.isArray(data) || !data.length) return;
    var html = data.map(function(pkg){
      var url = pkg.detail_page_url || ('/packages/' + pkg.slug + '/');
      return '<a href="' + url + '">' + pkg.name + '</a>';
    }).join('') + '<a href="/packages/" style="color:var(--gold);margin-top:4px;">View All Packages \u2192</a>';
    list.innerHTML = html;
  }).catch(function(){ /* keep the "View All Packages" fallback link already in the HTML */ });
})();
