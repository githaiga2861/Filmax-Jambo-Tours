/* ═══════════════════════════════════════════════════════════════
   FJT DAY ACCOMMODATION SELECTOR — Aerial Kenya
   Renders per-day lodge options into .fjt-accom-mount[data-day]
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var _curLodge = null;
  window.FJT_SELECTED_ACCOM = window.FJT_SELECTED_ACCOM || {};

  // delta: 'flat' (Included/default), 'up' (Premium upgrade), 'down' (Lower cost)
  var DATA = window.FJT_ACCOM_DATA || {};


  // ── Enrich each lodge with booking-style detail (placeholder images from
  //    assets/ + Unsplash; swap real licensed photos in later) ──
  var GALLERY_POOL = [
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551009175-8a68da93d5f9?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1621414050946-1b4b7e5c5a5a?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80&auto=format&fit=crop'
  ];
  var FAC_ICONS = {
    'Free WiFi':'M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19h.01',
    'Swimming pool':'M2 18c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1',
    'Restaurant':'M6 3v8a2 2 0 0 0 2 2v8M6 7h4M18 3v18M18 3a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3',
    'Bar':'M5 3h14l-7 8zM12 11v8M8 21h8',
    'Spa':'M12 3c2 4 2 6 0 9-2-3-2-5 0-9zM5 13c4 1 6 3 7 7-4-1-6-3-7-7zM19 13c-4 1-6 3-7 7 4-1 6-3 7-7z',
    'Game drives':'M5 17h14M6 17l1-5h10l1 5M9 12V9h6v3M7 17a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM17 17a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
    'Airstrip transfer':'M3 12h18M21 12l-4-4M21 12l-4 4M3 8v8',
    'All meals':'M4 3v18M4 9h4M8 3v18M14 3c-1 2-1 5 0 7v11M18 3v8a2 2 0 0 0 2 2h0',
    'Laundry':'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 4h12v16H6zM9 7h.01',
    'Family friendly':'M9 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM15 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM9 11v9M15 11v9M6 14h12'
  };

  function enrich(){
    Object.keys(DATA).forEach(function(day){
      DATA[day].forEach(function(a, i){
        if(a._enriched) return;
        a._enriched = true;
        // gallery: lead image + a rotating selection from the pool (12-18 imgs)
        var count = 12 + ((i*5 + (+day)*3) % 7); // 12..18
        var imgs = [a.img];
        var start = ((+day) + i*3) % GALLERY_POOL.length;
        for(var k=0; k<count; k++){ imgs.push(GALLERY_POOL[(start+k) % GALLERY_POOL.length]); }
        a.gallery = imgs;
        // review score (stable per lodge, 8.6..9.6)
        var seed = (a.name.length*7 + (+day)*11 + i*13) % 11;
        a.score = (8.6 + seed*0.09).toFixed(1);
        a.scoreWord = a.score >= 9.3 ? 'Exceptional' : a.score >= 9.0 ? 'Superb' : 'Fabulous';
        a.reviews = 60 + ((a.name.length*17 + (+day)*23) % 240);
        // location line from facts (Setting) if present
        var setting = (a.facts.find(function(f){ return /setting/i.test(f[0]); })||[])[1] || 'Kenya';
        a.location = setting;
        // facilities — base set + tweaks
        a.facilities = ['Free WiFi','Game drives','All meals','Restaurant','Bar','Airstrip transfer','Laundry'];
        if(/pool|infinity|plunge/i.test(a.desc)) a.facilities.push('Swimming pool');
        if(/spa/i.test(a.desc) || a.delta==='up') a.facilities.push('Spa');
        if(/family/i.test(a.type) || /family/i.test(a.desc)) a.facilities.push('Family friendly');
        // room types
        var tents = (a.facts.find(function(f){ return /tents|suites|rooms|villas|capacity/i.test(f[0]); })||['',''])[1];
        a.rooms = [
          { name:'Classic en-suite '+(/villa/i.test(a.type)?'villa':/suite/i.test(a.type)?'suite':'tent'),
            img:a.gallery[1],
            desc:'Spacious en-suite with private veranda, king or twin configuration, and views over the surrounding wilderness.' },
          { name:'Premium '+(/villa/i.test(a.type)?'villa':'suite')+' with private deck',
            img:a.gallery[2],
            desc:'Elevated category with a larger private deck'+(/pool|plunge/i.test(a.desc)?' and private plunge pool':'')+', ideal for honeymooners and photographers.' },
          { name:'Family / interleading unit',
            img:a.gallery[3],
            desc:'Two interleading bedrooms sharing a lounge — configured for families travelling with children.' }
        ];
        // good to know / policies
        a.gtk = [
          ['Check-in','From 14:00 · flexible on charter arrival'],
          ['Check-out','By 10:00 · late checkout on request'],
          ['Children','Welcome '+(/family/i.test(a.type)?'(all ages)':'(age policy varies by season)')],
          ['Board basis',(a.facts.find(function(f){return /board/i.test(f[0]);})||['','Full board'])[1]],
          ['Park / conservancy fees','Included in your safari quote'],
          ['Connectivity','WiFi in main areas · limited in-tent signal']
        ];
      });
    });
  }
  enrich();

  var ACTS_BY_DAY = window.FJT_ACTS_DATA || {};

  function deltaLabel(d){
    if(d==='flat') return { cls:'flat', text:'Included · Default' };
    if(d==='up')   return { cls:'up',   text:'Premium upgrade' };
    return { cls:'down', text:'Lower cost' };
  }
  function flagLabel(d, isDef){
    if(isDef) return { cls:'is-default', text:'Default Lodge' };
    return { cls:'', text:'Alternative' };
  }

  var TICK = '<svg width="13" height="10" viewBox="0 0 13 10" fill="none"><path d="M1 5l3.5 3.5L12 1" stroke="#080808" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ARROW = '<svg width="12" height="7" viewBox="0 0 12 7" fill="none"><path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function esc(s){ return (s||'').replace(/"/g,'&quot;'); }

  function cardHTML(day, idx, a){
    var isDef = (a.delta==='flat');
    var fl = flagLabel(a.delta, isDef);
    var dl = deltaLabel(a.delta);
    return ''+
    '<div class="fjt-accom-card'+(isDef?' selected':'')+'" data-day="'+day+'" data-idx="'+idx+'">'+
      '<div class="fjt-accom-card-imgwrap">'+
        '<img src="'+a.img+'" alt="'+esc(a.name)+'" loading="lazy" onerror="this.onerror=null;this.src=\'/assets/maasaimara.webp\'">'+
        '<span class="fjt-accom-flag '+fl.cls+'">'+fl.text+'</span>'+
        '<span class="fjt-accom-delta '+dl.cls+'">'+dl.text+'</span>'+
        '<span class="fjt-accom-tick">'+TICK+'</span>'+
      '</div>'+
      '<div class="fjt-accom-card-body">'+
        '<div class="fjt-accom-name">'+a.name+'</div>'+
        '<div class="fjt-accom-type">'+a.type+'</div>'+
        '<div class="fjt-accom-mini">'+
          '<div class="fjt-accom-mini-head">📍 Getting There</div>'+
          '<div class="fjt-accom-mini-text">'+a.getting+'</div>'+
          '<button class="fjt-accom-mini-link" data-modal="getting" data-day="'+day+'" data-idx="'+idx+'">More details '+ARROW+'</button>'+
        '</div>'+
        '<div class="fjt-accom-mini">'+
          '<div class="fjt-accom-mini-head">✦ Activity Highlights</div>'+
          '<div class="fjt-accom-mini-text">'+a.acts+'</div>'+
          '<button class="fjt-accom-mini-link" data-modal="acts" data-day="'+day+'" data-idx="'+idx+'">More details '+ARROW+'</button>'+
        '</div>'+
        '<button class="fjt-accom-viewbtn" data-modal="accom" data-day="'+day+'" data-idx="'+idx+'">View accommodation details</button>'+
      '</div>'+
    '</div>';
  }

  function render(mount){
    var day = mount.getAttribute('data-day');
    var list = DATA[day];
    if(!list){ return; }
    var defIdx = list.findIndex(function(x){ return x.delta==='flat'; });
    if(defIdx < 0) defIdx = 0;
    var defName = list[defIdx].name;
    // seed the global store with the default for this day (only if unset)
    if(!window.FJT_SELECTED_ACCOM[day]){
      window.FJT_SELECTED_ACCOM[day] = { idx:defIdx, name:defName, delta:list[defIdx].delta };
    }
    var cards = list.map(function(a,i){ return cardHTML(day,i,a); }).join('');
    mount.innerHTML =
      '<div class="fjt-accom-wrap">'+
        '<div class="fjt-accom-toggle">'+
          '<span class="fjt-accom-toggle-label">🏕 Accommodation Options '+
            '<span class="fjt-accom-toggle-count">'+list.length+' '+(list.length===1?'lodge':'lodges')+' for this night · <span class="fjt-accom-current" data-current="'+day+'">'+defName+'</span></span>'+
          '</span>'+
          '<span class="fjt-accom-toggle-chevron">'+ARROW+'</span>'+
        '</div>'+
        '<div class="fjt-accom-panel">'+
          '<div class="fjt-accom-hint">A default lodge is pre-selected and already included in your quoted price. Tap any other lodge to swap it into your journey — you\'ll see whether it\'s a premium upgrade or a lower-cost option.</div>'+
          '<div class="fjt-accom-grid">'+cards+'</div>'+
          '<div class="fjt-accom-confirm" data-confirm="'+day+'"></div>'+
        '</div>'+
      '</div>';
  }


  function renderActivities(mount){
    var day = mount.getAttribute('data-day');
    var data = ACTS_BY_DAY[day];
    if(!data){ return; }
    var rows = data.items.map(function(it){
      return '<div class="fjt-act-item">'+
        '<div class="fjt-act-name">'+it[0]+'</div>'+
        '<div class="fjt-act-desc">'+it[1]+'</div>'+
      '</div>';
    }).join('');
    mount.innerHTML =
      '<div class="fjt-accom-wrap fjt-act-wrap">'+
        '<div class="fjt-accom-toggle fjt-act-toggle">'+
          '<span class="fjt-accom-toggle-label">✦ Activities '+
            '<span class="fjt-accom-toggle-count">'+data.items.length+' experiences · '+data.place+'</span>'+
          '</span>'+
          '<span class="fjt-accom-toggle-chevron">'+ARROW+'</span>'+
        '</div>'+
        '<div class="fjt-accom-panel">'+
          '<div class="fjt-accom-hint">A tailored selection of what your day can hold. Your guide adapts the plan to the wildlife, the light, and your pace.</div>'+
          '<div class="fjt-act-list">'+rows+'</div>'+
        '</div>'+
      '</div>';
  }

  // ── Modal ──
  function ensureModal(){
    if(document.getElementById('fjtAccomModal')) return;
    var o = document.createElement('div');
    o.className = 'fjt-modal-overlay'; o.id = 'fjtAccomModal';
    o.innerHTML = '<div class="fjt-modal">'+
      '<div class="fjt-bk-closebar"><span class="fjt-bk-closebar-title" id="fjtBkTitle"></span><button class="fjt-bk-close" aria-label="Close">×</button></div>'+
      '<div class="fjt-bk-scroll" id="fjtAccomModalInner"></div>'+
    '</div>';
    document.body.appendChild(o);
    o.addEventListener('click', function(e){ if(e.target===o) closeModal(); });
    o.querySelector('.fjt-bk-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeModal(); });
  }
  function openModal(html, title){
    ensureModal();
    document.getElementById('fjtAccomModalInner').innerHTML = html;
    var t = document.getElementById('fjtBkTitle'); if(t) t.textContent = title || '';
    var o = document.getElementById('fjtAccomModal');
    o.classList.add('open');
    var sc = document.getElementById('fjtAccomModalInner'); if(sc) sc.scrollTop = 0;
  }
  function closeModal(){
    var o = document.getElementById('fjtAccomModal');
    if(o) o.classList.remove('open');
  }

  function facIcon(name){
    var d = FAC_ICONS[name] || 'M5 12h14';
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="'+d+'"/></svg>';
  }
  function collageHTML(a){
    var g = a.gallery, total = g.length;
    var cells = '';
    for(var i=0;i<5;i++){
      var more = (i===4 && total>5);
      cells += '<div class="fjt-bk-collage-cell" data-gallery="open">'+
        '<img src="'+g[i]+'" alt="'+esc(a.name)+' photo" loading="lazy">'+
        (more ? '<div class="fjt-bk-collage-more"><span class="fjt-bk-collage-more-num">+'+(total-5)+'</span><span class="fjt-bk-collage-more-label">Photos</span></div>' : '')+
      '</div>';
    }
    return '<div class="fjt-bk-collage">'+cells+'</div>';
  }
  function accomModalHTML(a){
    var facs = a.facilities.map(function(f){ return '<span class="fjt-bk-facility">'+facIcon(f)+f+'</span>'; }).join('');
    var rooms = a.rooms.map(function(r){
      return '<div class="fjt-bk-room"><img class="fjt-bk-room-img" src="'+r.img+'" alt="'+esc(r.name)+'" loading="lazy"><div class="fjt-bk-room-info"><div class="fjt-bk-room-name">'+r.name+'</div><div class="fjt-bk-room-desc">'+r.desc+'</div></div></div>';
    }).join('');
    var gtk = a.gtk.map(function(g){ return '<div class="fjt-bk-gtk-item"><strong>'+g[0]+'</strong>'+g[1]+'</div>'; }).join('');
    return collageHTML(a)+
      '<div class="fjt-bk-body">'+
        '<div class="fjt-bk-head-row">'+
          '<div><div class="fjt-bk-name">'+a.name+'</div><div class="fjt-bk-type">'+a.type+'</div></div>'+
          '<div class="fjt-bk-score"><span class="fjt-bk-score-num">'+a.score+'</span><span class="fjt-bk-score-txt"><strong>'+a.scoreWord+'</strong>'+a.reviews+' reviews</span></div>'+
        '</div>'+
        '<div class="fjt-bk-loc">📍 '+a.location+'</div>'+
        '<p class="fjt-bk-p">'+a.desc+'</p>'+
        '<div class="fjt-bk-divider"></div>'+
        '<div class="fjt-bk-section-title">Most popular facilities</div>'+
        '<div class="fjt-bk-facilities">'+facs+'</div>'+
        '<div class="fjt-bk-divider"></div>'+
        '<div class="fjt-bk-section-title">Room types</div>'+rooms+
        '<div class="fjt-bk-divider"></div>'+
        '<div class="fjt-bk-section-title">Good to know</div>'+
        '<div class="fjt-bk-gtk">'+gtk+'</div>'+
      '</div>';
  }
  function galleryHTML(a){
    var imgs = a.gallery.map(function(src){ return '<img src="'+src+'" alt="'+esc(a.name)+' photo" loading="lazy">'; }).join('');
    return '<div style="padding:16px 18px 0"><button class="fjt-bk-back" data-gallery="back">‹ Back to overview</button></div>'+
      '<div class="fjt-bk-gallery-grid">'+imgs+'</div>';
  }
  function gettingModalHTML(a){
    return '<img class="fjt-modal-img" src="'+a.img+'" alt="'+esc(a.name)+'">'+
      '<div class="fjt-modal-body">'+
        '<span class="fjt-modal-eyebrow">Getting There</span>'+
        '<h3 class="fjt-modal-title">'+a.name+'</h3>'+
        '<div class="fjt-modal-sub">How you arrive</div>'+
        '<p class="fjt-modal-p">'+a.gettingFull+'</p>'+
      '</div>';
  }
  function actsModalHTML(a){
    var items = a.actsFull.map(function(x){ return '<li>'+x+'</li>'; }).join('');
    return '<img class="fjt-modal-img" src="'+a.img+'" alt="'+esc(a.name)+'">'+
      '<div class="fjt-modal-body">'+
        '<span class="fjt-modal-eyebrow">Activity Highlights</span>'+
        '<h3 class="fjt-modal-title">'+a.name+'</h3>'+
        '<div class="fjt-modal-sub">What you\'ll do</div>'+
        '<ul class="fjt-modal-list">'+items+'</ul>'+
      '</div>';
  }

  function selectCard(day, idx){
    var grid = document.querySelector('.fjt-accom-mount[data-day="'+day+'"] .fjt-accom-grid');
    if(!grid) return;
    grid.querySelectorAll('.fjt-accom-card').forEach(function(c){ c.classList.remove('selected'); });
    var card = grid.querySelector('.fjt-accom-card[data-idx="'+idx+'"]');
    if(card) card.classList.add('selected');
    var a = DATA[day][idx];

    // update the toggle line current-name (visible before/after dropdown is opened)
    var cur = document.querySelector('.fjt-accom-current[data-current="'+day+'"]');
    if(cur) cur.textContent = a.name;

    // update the global selection store
    window.FJT_SELECTED_ACCOM[day] = { idx:idx, name:a.name, delta:a.delta };

    // reflect choices onto the reserve links so the booking carries them
    updateReserveLinks();

    var conf = document.querySelector('[data-confirm="'+day+'"]');
    if(conf){
      if(a.delta==='flat') conf.innerHTML = '<strong>'+a.name+'</strong> is your default lodge for this night — included in your quoted price.';
      else if(a.delta==='up') conf.innerHTML = 'Selected <strong>'+a.name+'</strong> — a premium upgrade. Your concierge will confirm the adjusted quote.';
      else conf.innerHTML = 'Selected <strong>'+a.name+'</strong> — a lower-cost option. Your concierge will confirm the adjusted quote.';
    }
  }

  function updateReserveLinks(){
    var store = window.FJT_SELECTED_ACCOM || {};
    var days = Object.keys(store).sort(function(x,y){ return (+x)-(+y); });
    // build compact param: day1:LodgeName|day2:LodgeName...
    var parts = days.map(function(d){ return d+':'+store[d].name; });
    var encoded = encodeURIComponent(parts.join('|'));
    ['sidebarReserveBtn','mobileReserveBtn','mobileBarBtn'].forEach(function(id){
      var el = document.getElementById(id);
      if(!el) return;
      var base = el.getAttribute('href').split('?')[0];
      el.setAttribute('href', base + '?pkg=aerial-kenya&accom=' + encoded);
    });
    try { sessionStorage.setItem('fjt_aerial_accom', JSON.stringify(store)); } catch(e){}
  }

  function init(){
    var mounts = document.querySelectorAll('.fjt-accom-mount');
    mounts.forEach(render);
    var actMounts = document.querySelectorAll('.fjt-activities-mount');
    actMounts.forEach(renderActivities);
    updateReserveLinks();

    document.addEventListener('click', function(e){
      var galBtn = e.target.closest('[data-gallery]');
      if(galBtn && _curLodge){
        var mode = galBtn.getAttribute('data-gallery');
        if(mode==='open'){ openModal(galleryHTML(_curLodge), _curLodge.name); return; }
        if(mode==='back'){ openModal(accomModalHTML(_curLodge), _curLodge.name); return; }
      }
      var toggle = e.target.closest('.fjt-accom-toggle');
      if(toggle){
        toggle.closest('.fjt-accom-wrap').classList.toggle('open');
        return;
      }
      var link = e.target.closest('[data-modal]');
      if(link){
        e.stopPropagation();
        var day = link.getAttribute('data-day');
        var idx = +link.getAttribute('data-idx');
        var a = DATA[day][idx];
        var type = link.getAttribute('data-modal');
        _curLodge = a;
        if(type==='accom') openModal(accomModalHTML(a), a.name);
        else if(type==='getting') openModal(gettingModalHTML(a), a.name);
        else if(type==='acts') openModal(actsModalHTML(a), a.name);
        return;
      }
      var card = e.target.closest('.fjt-accom-card');
      if(card){
        selectCard(card.getAttribute('data-day'), +card.getAttribute('data-idx'));
      }
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
