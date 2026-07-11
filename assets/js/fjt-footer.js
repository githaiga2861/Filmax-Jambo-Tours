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
