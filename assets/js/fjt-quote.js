/* ═══════════════════════════════════════════════════════════════
   FJT QUOTE CARD — adults/children counters + live total for the
   24 packages that had a static sidebar (Aerial Kenya keeps its own
   richer version in pkg-aerial-kenya.js and is skipped here).

   Also handles ?view=reserve — the trimmed "Reserve This Journey"
   view that shows only the hero + booking card.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  var card=document.querySelector('.sidebar-card');
  if(!card) return;

  // Aerial Kenya runs its own quote engine — don't double-bind.
  if(document.getElementById('sqCalendar')) { initReserveView(); return; }

  var slug=(location.pathname.replace(/\/+$/,'').split('/').pop())||'';
  var priceEl=card.querySelector('.sq-price-num');
  var base=priceEl?Number(String(priceEl.textContent).replace(/[^0-9.]/g,'')):0;
  var pkgName=(document.querySelector('.pkg-hero-title')||{}).textContent||slug;
  pkgName=String(pkgName).replace(/\s+/g,' ').trim();
  var duration='';
  card.querySelectorAll('.sidebar-detail').forEach(function(d){
    var l=d.querySelector('.sidebar-detail-label'), v=d.querySelector('.sidebar-detail-value');
    if(l&&v&&/duration/i.test(l.textContent)) duration=v.textContent.trim();
  });

  var state={adults:2,children:0};

  function money(n){ return '$'+Number(n||0).toLocaleString(); }
  function total(){ return (state.adults*base)+(state.children*base*0.5); }

  var block=document.createElement('div');
  block.innerHTML=
    '<div class="sidebar-divider"></div>'+
    '<div class="sq-field">'+
      '<label class="sq-field-label">Adult Travellers</label>'+
      '<div class="sq-counter">'+
        '<button type="button" class="sq-counter-btn" data-q="a-">\u2212</button>'+
        '<span class="sq-counter-val" id="fqAdultVal">2</span>'+
        '<button type="button" class="sq-counter-btn" data-q="a+">+</button>'+
      '</div>'+
    '</div>'+
    '<div class="sq-field" style="margin-top:14px;">'+
      '<label class="sq-field-label">Children</label>'+
      '<div class="sq-counter">'+
        '<button type="button" class="sq-counter-btn" data-q="c-">\u2212</button>'+
        '<span class="sq-counter-val" id="fqChildVal">0</span>'+
        '<button type="button" class="sq-counter-btn" data-q="c+">+</button>'+
      '</div>'+
      '<span class="sq-field-note">Children aged 5\u201311 travel at 50% of the adult rate.</span>'+
    '</div>'+
    '<div class="sidebar-divider"></div>'+
    '<div class="sq-field">'+
      '<label class="sq-field-label">Preferred Departure Date</label>'+
      '<input type="date" id="fqDate" class="sq-date-input" style="width:100%;">'+
    '</div>'+
    '<div class="sidebar-divider"></div>'+
    '<div class="sq-total-row">'+
      '<span class="sq-total-label">Estimated Total</span>'+
      '<span class="sq-total-val" id="fqTotal">'+money(base*2)+'</span>'+
    '</div>';

  var reserveBtn=card.querySelector('.btn-book-now');
  if(reserveBtn) card.insertBefore(block,reserveBtn);
  else card.appendChild(block);

  function paint(){
    var a=document.getElementById('fqAdultVal'), ch=document.getElementById('fqChildVal'), t=document.getElementById('fqTotal');
    if(a) a.textContent=state.adults;
    if(ch) ch.textContent=state.children;
    if(t) t.textContent=money(total());
    syncLinks();
  }

  function reserveHref(){
    var d=document.getElementById('fqDate');
    var trav=state.adults+' adult'+(state.adults!==1?'s':'')+(state.children?', '+state.children+' child'+(state.children!==1?'ren':''):'');
    var q='/reserve/?pkg='+encodeURIComponent(pkgName)+
          '&duration='+encodeURIComponent(duration||'\u2014')+
          '&travellers='+encodeURIComponent(trav)+
          '&adults='+state.adults+'&children='+state.children+
          '&total='+encodeURIComponent(money(total()));
    if(d&&d.value) q+='&date='+encodeURIComponent(d.value);
    return q;
  }
  function syncLinks(){
    ['.btn-book-now','.mobile-reserve-btn','.mobile-book-btn'].forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(a){ a.setAttribute('href',reserveHref()); });
    });
  }

  card.addEventListener('click',function(e){
    var b=e.target.closest?e.target.closest('[data-q]'):null;
    if(!b) return;
    e.preventDefault();
    var k=b.getAttribute('data-q');
    if(k==='a+'&&state.adults<12) state.adults++;
    if(k==='a-'&&state.adults>1) state.adults--;
    if(k==='c+'&&state.children<8) state.children++;
    if(k==='c-'&&state.children>0) state.children--;
    paint();
  });
  var dateEl=document.getElementById('fqDate');
  if(dateEl) dateEl.addEventListener('change',syncLinks);

  paint();
  initReserveView();

  /* ── ?view=reserve : hero + booking card only ── */
  function initReserveView(){
    if(new URLSearchParams(location.search).get('view')!=='reserve') return;
    document.body.classList.add('fj-reserve-view');
    var sc=document.querySelector('.sidebar-card');
    if(sc){
      setTimeout(function(){
        sc.scrollIntoView({behavior:'smooth',block:'center'});
      },300);
    }
  }
})();
