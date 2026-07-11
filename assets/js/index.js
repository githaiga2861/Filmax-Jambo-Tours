
  const SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
  const supa = supabase.createClient(SUPA_URL, SUPA_KEY);

window._fjt_fresh=!sessionStorage.getItem('loaderSeen');

// ====================================================
// GLOBAL AUTH — defined first, before anything else
// ====================================================

// ===========================
// QUESTIONNAIRE (overlay)
// ===========================
(function () {
  if (sessionStorage.getItem('quizDone')) return;

  const overlay   = document.getElementById('quiz-overlay');
  const container = document.getElementById('quizStepContainer');
  const progress  = document.getElementById('quizProgress');
  const skipBtn   = document.getElementById('quizSkip');
  if (!overlay || !container) return;

  function getLivePool() {
    if (window.allPackages && window.allPackages.length) {
      return window.allPackages.map(function(p) {
        const name = p.name.replace(/<br>/g,' ').replace(/\s+/g,' ').trim();
        const tierRaw = (p.tier || '').toLowerCase();
        const tier = tierRaw.includes('ultra') ? 'ultra' : tierRaw.includes('luxury') ? 'luxury' : tierRaw.includes('budget') ? 'budget' : 'mid';
        const features = p.features || [];
        const vibes = [];
        const searchText = (name + ' ' + features.join(' ')).toLowerCase();
        if (/beach|coast|ocean|diani|marine|snorkel/.test(searchText)) vibes.push('beach');
        if (/wildlife|safari|game|mara|amboseli|samburu|tsavo|nakuru|park|reserve|big five|migration|elephant|lion|leopard/.test(searchText)) vibes.push('wildlife');
        if (/hike|climb|mount|trek|adventure|highland|mountain/.test(searchText)) vibes.push('adventure');
        if (/culture|maasai|village|community|people|tradition/.test(searchText)) vibes.push('culture');
        if (!vibes.length) vibes.push('wildlife');
        const days = parseInt((p.duration || '').match(/\d+/) || [0]);
        const durationKey = days <= 4 ? 'short' : days <= 7 ? 'medium' : days <= 10 ? 'long' : 'grand';
        const priceRaw = parseInt((p.price || '$0').replace(/\D/g,'')) || 0;
        return { name, price: p.price, duration: p.duration || '', page: p.page || '#packages', tier, vibe: vibes, durationKey, priceRaw };
      });
    }
    return [
      { name:'Mara Awakening',             price:'$2,800',  duration:'4 Days', page:'/packages/mara-awakening/',          tier:'mid',    vibe:['wildlife'],              durationKey:'short',  priceRaw:2800  },
      { name:'Grand Odyssey',              price:'$6,500',  duration:'7 Days', page:'/packages/grand-odyssey/',           tier:'luxury', vibe:['wildlife','culture'],    durationKey:'medium', priceRaw:6500  },
      { name:'Ultimate Kenya',             price:'$11,200', duration:'10 Days',page:'/packages/ultimate-kenya/',          tier:'luxury', vibe:['wildlife','adventure'],  durationKey:'long',   priceRaw:11200 },
      { name:'Amboseli Escape',            price:'$1,950',  duration:'3 Days', page:'/packages/amboseli-express/',        tier:'budget', vibe:['wildlife'],              durationKey:'short',  priceRaw:1950  },
      { name:'Samburu Wilderness',         price:'$3,400',  duration:'5 Days', page:'/packages/samburu-secrets/',         tier:'mid',    vibe:['wildlife','adventure'],  durationKey:'medium', priceRaw:3400  },
      { name:'Coastal Safari Blend',       price:'$4,200',  duration:'6 Days', page:'/packages/safari-and-sea/',          tier:'mid',    vibe:['beach','wildlife'],      durationKey:'medium', priceRaw:4200  },
      { name:'Lakes & Highlands',          price:'$5,100',  duration:'8 Days', page:'/packages/lake-nakuru-escape/',      tier:'mid',    vibe:['adventure','culture'],   durationKey:'long',   priceRaw:5100  },
      { name:'Kenya Mastery',              price:'$14,500', duration:'12 Days',page:'/packages/grand-odyssey/',           tier:'ultra',  vibe:['wildlife','culture'],    durationKey:'grand',  priceRaw:14500 },
      { name:'Nairobi Wild',               price:'$680',    duration:'2 Days', page:'/packages/nairobi-wild/',            tier:'budget', vibe:['wildlife'],              durationKey:'short',  priceRaw:680   },
      { name:"Hell's Gate Trek",           price:'$590',    duration:'2 Days', page:'/packages/hells-gate-trek/',         tier:'budget', vibe:['adventure'],             durationKey:'short',  priceRaw:590   },
      { name:'Lamu Archipelago',           price:'$4,200',  duration:'5 Days', page:'/packages/lamu-archipelago/',        tier:'mid',    vibe:['beach','culture'],       durationKey:'medium', priceRaw:4200  },
      { name:'Birding Kenya',              price:'$4,800',  duration:'6 Days', page:'/packages/birding-kenya/',           tier:'mid',    vibe:['wildlife','adventure'],  durationKey:'medium', priceRaw:4800  },
      { name:'Family Wild',                price:'$4,100',  duration:'6 Days', page:'/packages/family-wild/',             tier:'mid',    vibe:['wildlife','culture'],    durationKey:'medium', priceRaw:4100  },
      { name:'Photography Expedition',     price:'$7,400',  duration:'7 Days', page:'/packages/photography-expedition/',  tier:'luxury', vibe:['wildlife'],              durationKey:'medium', priceRaw:7400  },
      { name:'Private Conservancy Sojourn',price:'$14,800', duration:'6 Days', page:'/packages/private-conservancy/',     tier:'ultra',  vibe:['wildlife'],              durationKey:'medium', priceRaw:14800 },
      { name:'Migration Witness',          price:'$8,900',  duration:'5 Days', page:'/packages/migration-witness/',       tier:'luxury', vibe:['wildlife'],              durationKey:'medium', priceRaw:8900  },
    ];
  }

  const steps = [
    { id:'name',     type:'text',   label:'Step 1 of 5', question:'Welcome. What shall we call you?', sub:'Every great safari begins with a name.', placeholder:'Your first name', minLength:2, pattern:/^[a-zA-ZÀ-ÖØ-öø-ÿ\s'\-]{2,}$/, errorMsg:'Please enter a real name — at least 2 letters.' },
    { id:'vibe',     type:'multi',  label:'Step 2 of 5', question:'What draws you to Kenya?', sub:'Choose everything that stirs something in you.', options:[{value:'wildlife',label:'Wildlife & Safari'},{value:'beach',label:'Coast & Ocean'},{value:'adventure',label:'Adventure & Hiking'},{value:'culture',label:'Culture & People'}] },
    { id:'duration', type:'choice', label:'Step 3 of 5', question:'How long is your dream escape?', sub:'We will shape the perfect rhythm around your time.', options:[{value:'short',label:'3 – 4 Days'},{value:'medium',label:'5 – 7 Days'},{value:'long',label:'8 – 10 Days'},{value:'grand',label:'10+ Days'}] },
    { id:'budget',   type:'choice', label:'Step 4 of 5', question:'What is your comfort range?', sub:'No judgement — every budget unlocks a remarkable journey.', singleCol:true, options:[{value:'budget',label:'Budget · Under $2,500'},{value:'mid',label:'Mid · $2,500–$5,000'},{value:'luxury',label:'Luxury · $5,000–$12,000'},{value:'ultra',label:'Ultra · $12,000+'}] },
    { id:'travel',   type:'text',   label:'Step 5 of 5', question:'When are you thinking of travelling?', sub:'A rough idea helps us check availability and seasons.', placeholder:'e.g. July 2025, or "not sure yet"', minLength:4, pattern:/^[a-zA-Z0-9\s,\-\/\.]{4,}$/, errorMsg:'Please enter a month, year, or "not sure yet".' },
  ];

  let current = 0;
  const answers = {};

  function getResults() {
    const pool = getLivePool();
    const vibes = Array.isArray(answers.vibe) ? answers.vibe : [];
    return pool.map(function(pkg) {
      let score = 0;
      vibes.forEach(function(v) { if (pkg.vibe.includes(v)) score += 3; });
      if (answers.duration) { const o=['short','medium','long','grand']; const d=Math.abs(o.indexOf(pkg.durationKey)-o.indexOf(answers.duration)); if(d===0)score+=4; else if(d===1)score+=2; }
      if (answers.budget) { if(pkg.tier===answers.budget)score+=5; }
      return Object.assign({}, pkg, {score:score});
    }).sort(function(a,b){return b.score-a.score||a.priceRaw-b.priceRaw;}).slice(0,3);
  }

  function setProgress(step) { if(progress) progress.style.width = ((step+1)/(steps.length+1)*100)+'%'; }

  function renderStep(index) {
    setProgress(index);
    if (index >= steps.length) { renderResults(); return; }
    const step = steps[index];
    const isText = step.type==='text', isMulti = step.type==='multi';
    const selVibes = Array.isArray(answers.vibe) ? answers.vibe : [];
    const hasAnswer = isText ? !!answers[step.id] : isMulti ? selVibes.length>0 : !!answers[step.id];

    container.innerHTML = '<div class="quiz-step">' +
      '<span class="quiz-step-label">'+step.label+'</span>' +
      '<h2 class="quiz-question">'+step.question+'</h2>' +
      '<p class="quiz-sub">'+step.sub+(isMulti?' <em style="font-size:10px;letter-spacing:2px;opacity:0.6;">(select all that apply)</em>':'')+'</p>' +
      (isText ? '<input class="quiz-input" id="qzInput" type="text" placeholder="'+step.placeholder+'" value="'+(answers[step.id]||'')+'" autocomplete="off">' :
        '<div class="quiz-options'+(step.singleCol?' single-col':'')+'" id="qzOptions">'+
          step.options.map(function(opt){
            const sel = isMulti ? selVibes.includes(opt.value) : answers[step.id]===opt.value;
            return '<button class="quiz-option'+(sel?' selected':'')+'" data-value="'+opt.value+'">'+opt.label+'</button>';
          }).join('')+
        '</div>'+(isMulti?'<p style="font-family:Jost,sans-serif;font-size:9px;letter-spacing:3px;color:rgba(212,175,55,0.6);margin-top:10px;text-transform:uppercase;" id="qzHint">'+selVibes.length+' selected — press Continue when ready</p>':'')) +
      '<div class="quiz-nav">' +
        (index>0?'<button class="quiz-btn-back" id="qzBack">Back</button>':'<span></span>') +
        '<button class="quiz-btn-next'+(hasAnswer?' ready':'')+'" id="qzNext">'+(index===steps.length-1?'See My Safaris':'Continue')+'</button>' +
      '</div></div>';

    const nextBtn = document.getElementById('qzNext');
    const backBtn = document.getElementById('qzBack');

    if (isText) {
      const input = document.getElementById('qzInput');
      function valid() { const val=input.value.trim(); return val.length>=(step.minLength||1)&&(!step.pattern||step.pattern.test(val)); }
      input.addEventListener('input', function() { answers[step.id]=input.value.trim(); nextBtn.classList.toggle('ready',valid()); });
      input.addEventListener('keydown', function(e) { if(e.key==='Enter'&&valid()) advance(); });
      // Autofill from signed-in user data
      if(step.id==='name' && !answers.name && window._fjUserMeta && window._fjUserMeta.first_name){
        input.value = window._fjUserMeta.first_name;
        answers.name = window._fjUserMeta.first_name;
        nextBtn.classList.add('ready');
      }
      setTimeout(function(){input.focus();},80);
    } else if (isMulti) {
      document.getElementById('qzOptions').addEventListener('click', function(e) {
        const btn=e.target.closest('.quiz-option'); if(!btn)return;
        const val=btn.dataset.value;
        if(!Array.isArray(answers.vibe))answers.vibe=[];
        if(answers.vibe.includes(val)){answers.vibe=answers.vibe.filter(function(v){return v!==val;});btn.classList.remove('selected');}
        else{answers.vibe.push(val);btn.classList.add('selected');}
        const h=document.getElementById('qzHint'); if(h)h.textContent=answers.vibe.length+' selected — press Continue when ready';
        nextBtn.classList.toggle('ready',answers.vibe.length>0);
      });
    } else {
      document.getElementById('qzOptions').addEventListener('click', function(e) {
        const btn=e.target.closest('.quiz-option'); if(!btn)return;
        document.querySelectorAll('#qzOptions .quiz-option').forEach(function(b){b.classList.remove('selected');});
        btn.classList.add('selected'); answers[step.id]=btn.dataset.value;
        nextBtn.classList.add('ready'); nextBtn.style.pointerEvents='all';
        setTimeout(advance,380);
      });
    }

    if (nextBtn) nextBtn.addEventListener('click', function() { if(nextBtn.classList.contains('ready'))advance(); });
    if (backBtn) backBtn.addEventListener('click', function() { current--; renderStep(current); });
  }

  function advance() { current++; renderStep(current); }

  function renderResults() {
    setProgress(steps.length);
    const results = getResults();
    const name = answers.name ? answers.name.split(' ')[0] : 'Explorer';
    container.innerHTML = '<div class="quiz-step">' +
      '<div class="quiz-results-intro"><span class="quiz-step-label">Curated For You</span>' +
      '<h2 class="quiz-question">Your Safari Awaits,<br>'+name+'.</h2>' +
      '<p class="quiz-sub">Based on your answers, these experiences were made for you.</p></div>' +
      '<div class="quiz-result-cards">'+
        results.map(function(pkg){return '<div class="quiz-result-card"><div class="quiz-result-info"><div class="quiz-result-name">'+pkg.name+'</div><div class="quiz-result-meta">'+pkg.duration+' · '+pkg.tier+'</div></div><div class="quiz-result-price">'+pkg.price+'</div><a href="'+pkg.page+'" class="quiz-result-link">View</a></div>';}).join('')+
      '</div>' +
      '<button class="quiz-btn-next ready" id="qzEnter" style="width:100%;text-align:center;margin-top:24px;">Enter the Full Experience</button>' +
      '</div>';
    document.getElementById('qzEnter').addEventListener('click', closeQuiz);
  }

  function closeQuiz() {
    sessionStorage.setItem('quizDone','true');
    document.body.style.overflow=''; document.documentElement.style.overflow='';
    overlay.style.opacity='0'; overlay.style.pointerEvents='none';
    setTimeout(function(){ overlay.style.display='none'; },600);
  }

  if(skipBtn) skipBtn.addEventListener('click', closeQuiz);

  function initQuiz() {
    window.scrollTo(0,0);
    document.body.style.overflow='hidden'; document.documentElement.style.overflow='hidden';
    overlay.style.cssText='display:flex;opacity:0;pointer-events:none;';
    renderStep(0);
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      overlay.classList.add('visible'); overlay.style.opacity='1'; overlay.style.pointerEvents='all';
    });});
  }

  if (sessionStorage.getItem('loaderSeen')) { setTimeout(initQuiz,400); }
  else { setTimeout(initQuiz,5800); }
})();

// ===========================
// THEME TOGGLE
// ===========================
(function () {
  const toggle  = document.getElementById('themeToggle');
  const tooltip = document.getElementById('themeTooltip');
  if (!toggle) return;
  const saved = localStorage.getItem('fjt-theme');
  if (saved === 'light') { document.body.classList.add('light-mode'); if(tooltip) tooltip.textContent='Dark Mode'; }
  else { if(tooltip) tooltip.textContent='Light Mode'; }
  toggle.addEventListener('click', function() {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('fjt-theme', isLight ? 'light' : 'dark');
    if(tooltip) tooltip.textContent = isLight ? 'Dark Mode' : 'Light Mode';
  });
})();

// ===========================
// LOADER + PAPER TEAR
// ===========================
(function(){
  if(window.location.hash) history.replaceState(null,null,window.location.pathname+window.location.search);
  window.scrollTo(0,0);
  var loaderEl=document.getElementById('loader');
  var loaderLogoEl=document.querySelector('.loader-logo');
  var heroLogoEl=document.getElementById('hero-logo');
  var heroSkyEl=document.querySelector('.hero-sky');
  var navLogoLink=document.querySelector('.nav-logo-link');
  var navIdleWords=document.querySelector('.nav-idle-words');
  var shutterWrap=document.getElementById('shutterWrap');

  function fireShutter(cb) {
    if(!shutterWrap){if(cb)cb();return;}
    shutterWrap.classList.add('closing');
    setTimeout(function(){shutterWrap.style.display='none';if(cb)cb();},700);
  }

  function paperTearReveal(cb) {
    // Create tear container that covers the screen
    var container = document.createElement('div');
    container.className = 'loader-tear-container';
    document.body.appendChild(container);

    var COLS = 8, ROWS = 10;
    var vw = window.innerWidth, vh = window.innerHeight;
    var pw = Math.ceil(vw / COLS), ph = Math.ceil(vh / ROWS);
    var pieces = [];

    // Create irregular grid pieces
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var piece = document.createElement('div');
        piece.className = 'loader-tear-piece';
        // Irregular sizing — each piece slightly different
        var jitterX = (Math.random() - 0.5) * pw * 0.4;
        var jitterY = (Math.random() - 0.5) * ph * 0.4;
        var w = pw + Math.random() * pw * 0.5;
        var h = ph + Math.random() * ph * 0.5;
        var x = c * pw + jitterX;
        var y = r * ph + jitterY;
        // Clip path for irregular torn edge
        var pts = [];
        var steps = 6;
        for (var i = 0; i <= steps; i++) {
          var bx = (i/steps)*100, by = (Math.random()-0.5)*18;
          pts.push(bx+'% '+by+'%');
        }
        for (var i = steps; i >= 0; i--) {
          var bx2 = (i/steps)*100, by2 = 100+(Math.random()-0.5)*18;
          pts.push(bx2+'% '+by2+'%');
        }
        piece.style.cssText = 'left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;clip-path:polygon('+pts.join(',')+');background:#080808;';
        // Random tear direction — explode outward from center
        var cx = x + w/2, cy = y + h/2;
        var dx = cx - vw/2, dy = cy - vh/2;
        var dist = Math.sqrt(dx*dx+dy*dy)||1;
        var nx = dx/dist, ny = dy/dist;
        var mag = 80 + Math.random() * 120;
        var rot = (Math.random()-0.5)*60;
        piece.style.setProperty('--tear-tx','translate('+(nx*mag*vw/100*1.5)+'px,'+(ny*mag*vh/100*1.5)+'px) rotate('+rot+'deg)');
        piece.style.setProperty('--tear-rot',rot+'deg');
        pieces.push(piece);
        container.appendChild(piece);
      }
    }

    // Stagger the tear animation — pieces at edges tear first
    pieces.forEach(function(piece, i) {
      var delay = 40 + Math.random() * 280;
      setTimeout(function(){
        piece.classList.add('tearing');
      }, delay);
    });

    // After all pieces gone, clean up and callback
    setTimeout(function(){
      container.remove();
      if(cb) cb();
    }, 900);
  }

  if(sessionStorage.getItem('loaderSeen')){
    // Fast path — already seen loader, skip animation
    if(loaderEl) loaderEl.style.display='none';
    if(heroLogoEl){heroLogoEl.style.display='block';heroLogoEl.style.opacity='1';}
    if(heroSkyEl) heroSkyEl.classList.add('settled');
    setTimeout(function(){fireShutter();},200);
  } else {
    sessionStorage.setItem('loaderSeen','true');
    // Show loader, then tear it away
    setTimeout(function(){
      // Start hero loading in background
      if(heroLogoEl) heroLogoEl.style.display='block';
      if(heroSkyEl)  heroSkyEl.classList.add('settled');

      // Tear the loader away
      paperTearReveal(function(){
        if(loaderLogoEl) loaderLogoEl.classList.add('gone');
        if(loaderEl)     loaderEl.style.display='none';
        setTimeout(function(){
          if(heroLogoEl) heroLogoEl.classList.add('visible');
          fireShutter();
        },200);
      });
    },4200);
  }

  document.addEventListener('DOMContentLoaded',function(){window.scrollTo(0,0);});
  window.addEventListener('load',function(){ if((window.scrollY||document.documentElement.scrollTop) < 5){ window.scrollTo(0,0); } });

  // Hero logo scroll-to-nav animation — single source of truth
  // Nav logo is ALWAYS hidden until JS explicitly shows it after flight
  if(navLogoLink){
    navLogoLink.style.opacity='0';
    navLogoLink.style.visibility='hidden';
    navLogoLink.style.pointerEvents='none';
  }

  let hasFlown=false, heroStartRect=null;

  function syncLogoState(scrollY, animate){
    if(navIdleWords) navIdleWords.style.opacity = scrollY>80 ? '0' : '1';

    if(scrollY>80 && !hasFlown){
      hasFlown=true;
      // Immediately hide hero logo — only one logo ever visible
      if(heroLogoEl){ heroLogoEl.style.opacity='0'; heroLogoEl.style.pointerEvents='none'; }

      if(!animate){
        // Instant — no clone, just reveal nav logo
        if(navLogoLink){
          navLogoLink.style.visibility='visible';
          navLogoLink.style.opacity='1';
          navLogoLink.style.pointerEvents='all';
        }
        return;
      }

      // Animated flight: clone from hero position to nav position
      const currentRect = heroLogoEl ? heroLogoEl.getBoundingClientRect() : null;
      const navRect     = navLogoLink ? navLogoLink.getBoundingClientRect() : null;
      if(currentRect && navRect && heroLogoEl){
        const tH = navRect.height * 0.85;
        const tW = tH * ((heroStartRect||currentRect).width / Math.max((heroStartRect||currentRect).height,1));
        const clone = heroLogoEl.cloneNode(true);
        clone.removeAttribute('id');
        clone.style.cssText = 'position:fixed;top:'+(currentRect.top)+'px;left:'+(currentRect.left)+'px;width:'+(currentRect.width)+'px;height:'+(currentRect.height)+'px;opacity:1;z-index:9997;pointer-events:none;margin:0;transition:none;animation:none;';
        document.body.appendChild(clone);
        requestAnimationFrame(function(){ requestAnimationFrame(function(){
          clone.style.transition='top 0.6s cubic-bezier(0.76,0,0.24,1),left 0.6s cubic-bezier(0.76,0,0.24,1),width 0.6s cubic-bezier(0.76,0,0.24,1),height 0.6s cubic-bezier(0.76,0,0.24,1),opacity 0.25s ease 0.45s';
          clone.style.top  = (navRect.top + (navRect.height - tH)/2) + 'px';
          clone.style.left = navRect.left + 'px';
          clone.style.width  = tW + 'px';
          clone.style.height = tH + 'px';
          clone.style.opacity = '0';
        }); });
        setTimeout(function(){
          clone.remove();
          if(navLogoLink){ navLogoLink.style.visibility='visible'; navLogoLink.style.opacity='1'; navLogoLink.style.pointerEvents='all'; }
        }, 680);
      } else {
        if(navLogoLink){ navLogoLink.style.visibility='visible'; navLogoLink.style.opacity='1'; navLogoLink.style.pointerEvents='all'; }
      }
    }

    if(scrollY<=80 && hasFlown){
      hasFlown=false;
      if(navLogoLink){ navLogoLink.style.opacity='0'; navLogoLink.style.visibility='hidden'; navLogoLink.style.pointerEvents='none'; }
      if(heroLogoEl){ heroLogoEl.style.opacity='1'; heroLogoEl.style.pointerEvents=''; }
    }
  }

  window.addEventListener('load', function(){
    if(heroLogoEl) heroStartRect = heroLogoEl.getBoundingClientRect();
    // On refresh-while-scrolled: instant snap, no animation
    syncLogoState(window.scrollY, false);
  });

  window.addEventListener('scroll', function(){
    syncLogoState(window.scrollY, true);
  }, { passive: true });
})();

// ===========================
// CUSTOM CURSOR
// ===========================
(function(){
  const cursor=document.getElementById('cursor');
  const ring=document.getElementById('cursorRing');
  if(!cursor||!ring)return;
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px';});
  function animateRing(){rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animateRing);}
  animateRing();
  document.querySelectorAll('a,button,.highlight-card,.package-card,.quiz-option,.blog-card,.gallery-item,.theme-toggle').forEach(function(el){
    el.addEventListener('mouseenter',function(){cursor.style.width='20px';cursor.style.height='20px';ring.style.width='60px';ring.style.height='60px';});
    el.addEventListener('mouseleave',function(){cursor.style.width='12px';cursor.style.height='12px';ring.style.width='40px';ring.style.height='40px';});
  });
})();

// ===========================
// MENU
// ===========================
(function(){
  const menuBtn=document.getElementById('menuBtn');
  const dropdown=document.getElementById('dropdown');
  if(!menuBtn||!dropdown)return;
  menuBtn.addEventListener('click',function(){
    var isOpening = !menuBtn.classList.contains('open');
    menuBtn.classList.toggle('open');
    dropdown.classList.toggle('open');
    // Hide/show FABs
    var fabs = [document.querySelector('.whatsapp-fab'), document.getElementById('themeToggle'), document.getElementById('google_translate_element')];
    fabs.forEach(function(el){
      if(!el)return;
      if(isOpening){
        el.style.transition='opacity 0.3s ease, transform 0.3s ease';
        el.style.opacity='0'; el.style.pointerEvents='none'; el.style.transform='scale(0.8)';
      } else {
        el.style.opacity='1'; el.style.pointerEvents=''; el.style.transform='';
      }
    });
  });
  dropdown.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click',function(e){
      var href=link.getAttribute('href');
      // close menu first without any scroll jump
      menuBtn.classList.remove('open');
      dropdown.classList.remove('open');
      var fabs=[document.querySelector('.whatsapp-fab'),document.getElementById('themeToggle'),document.getElementById('google_translate_element')];
      fabs.forEach(function(el){if(el){el.style.opacity='1';el.style.pointerEvents='';el.style.transform='';}});
      // if it is a same-page anchor, scroll smoothly — never reload
      if(href&&href.startsWith('#')&&href.length>1){
        e.preventDefault();
        var target=document.querySelector(href);
        if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
      }
      // if bare "#" or "/home/" pointing to current page, prevent reload
      if(!href||href==='#'||href===window.location.pathname||href==='/home/'){
        e.preventDefault();
      }
    });
  });
  document.addEventListener('click',function(e){
    if(!dropdown.contains(e.target)&&!menuBtn.contains(e.target)){
      menuBtn.classList.remove('open');
      dropdown.classList.remove('open');
      var fabs=[document.querySelector('.whatsapp-fab'),document.getElementById('themeToggle'),document.getElementById('google_translate_element')];
      fabs.forEach(function(el){if(el){el.style.opacity='1';el.style.pointerEvents='';el.style.transform='';}});
    }
  });
})();

// ===========================
// REVEAL ANIMATIONS
// ===========================
(function(){
  var reveals = document.querySelectorAll('.reveal');
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) {
        var el = e.target;
        setTimeout(function(){ el.classList.add('visible'); }, 60);
        obs.unobserve(el);
      }
    });
  }, {threshold: 0.08, rootMargin: '0px 0px -30px 0px'});
  setTimeout(function(){
    reveals.forEach(function(el){ obs.observe(el); });
  }, 150);
})();

// ===========================
// SMOOTH SCROLL
// ===========================
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click',function(e){
    const href=this.getAttribute('href');
    // bare "#" with no target — do nothing, no scroll, no reload
    if(!href||href==='#'){e.preventDefault();return;}
    e.preventDefault();
    const t=document.querySelector(href);
    if(t)t.scrollIntoView({behavior:'smooth',block:'start'});
  });
});

// ===========================
// COUNTER ANIMATION
// ===========================
(function(){
  function animateCounters(){
    document.querySelectorAll('.stat-num').forEach(function(c){
      const text=c.textContent, num=parseInt(text.replace(/\D/g,'')), suffix=text.replace(/[\d,]/g,'');
      if(!num)return;
      let cur=0; const inc=num/60;
      const t=setInterval(function(){cur+=inc;if(cur>=num){cur=num;clearInterval(t);}c.textContent=Math.floor(cur).toLocaleString()+suffix;},25);
    });
  }
  const sb=document.querySelector('.stats-bar');
  if(sb){new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){animateCounters();}});},{threshold:0.5}).observe(sb);}
})();

// ===========================
// PACKAGES
// ===========================
var allPackages = [
  {badge:null,        duration:'4 Days · 3 Nights',   name:'Mara<br>Awakening',             price:'$2,800',  page:'/packages/mara-awakening/',        tier:'mid',    cardBg:'/assets/maasaimara.webp',   features:['Maasai Mara Game Reserve','Private 4x4 Land Cruiser','Luxury Tented Camp','Expert Naturalist Guide','All Meals Included','Sundowner Cocktails']},
  {badge:'Most Exclusive',duration:'7 Days · 6 Nights',name:'Grand<br>Odyssey',             price:'$6,500',  page:'/packages/grand-odyssey/',         tier:'luxury', cardBg:'/assets/jungle.webp',       features:['Mara + Amboseli + Samburu','Private Charter Flights','5-Star Lodge & Tented Camps','Sunrise Balloon Safari','Cultural Maasai Immersion','Butler & Concierge Service','All-Inclusive Premium']},
  {badge:null,        duration:'10 Days · 9 Nights',  name:'Ultimate<br>Kenya',             price:'$11,200', page:'/packages/ultimate-kenya/',        tier:'luxury', cardBg:'/assets/Coolelephant.webp', features:['5 Iconic National Parks','Private Conservancy Access','Exclusive Use Bush Camp','Night Safari Drives','Marine Excursion, Diani','Photography Guide Included','Bespoke Farewell Dinner']},
  {badge:'New',       duration:'3 Days · 2 Nights',   name:'Amboseli<br>Escape',            price:'$1,950',  page:'/packages/amboseli-express/',      tier:'budget', cardBg:'/assets/amboseli.webp',     features:['Amboseli National Park','Kilimanjaro Panorama Views','Private Game Drives','Bush Breakfast Experience','All Meals Included','Expert Naturalist Guide']},
  {badge:null,        duration:'5 Days · 4 Nights',   name:'Samburu<br>Wilderness',         price:'$3,400',  page:'/packages/samburu-secrets/',       tier:'mid',    cardBg:'/assets/maasaimen.webp',    features:['Samburu National Reserve','Rare Northern Species','Private Tented Camp','Camel Safari Experience','Cultural Village Visit','All Meals & Transfers']},
  {badge:'Popular',   duration:'6 Days · 5 Nights',   name:'Coastal<br>Safari Blend',       price:'$4,200',  page:'/packages/safari-and-sea/',        tier:'mid',    cardBg:'/assets/dianibeach.webp',   features:['Tsavo East & West','Diani Beach Extension','Ocean-View Lodge','Snorkelling & Marine Park','Private Game Drives','All-Inclusive Package']},
  {badge:null,        duration:'8 Days · 7 Nights',   name:'Lakes &<br>Highlands',          price:'$5,100',  page:'/packages/lake-nakuru-escape/',    tier:'mid',    cardBg:'/assets/lakenakuru.webp',   features:['Lake Nakuru & Naivasha','Aberdare Forest Walks','Flamingo Boat Excursion','Mount Kenya Foothills','Luxury Lodge Stays','All Meals & Flights']},
  {badge:'Signature', duration:'12 Days · 11 Nights', name:'Kenya<br>Mastery',              price:'$14,500', page:'/packages/grand-odyssey/',         tier:'luxury', cardBg:'/assets/mountkenya.webp',   features:['6 Parks & Conservancies','Private Helicopter Transfer','Exclusive Bush Camp','Hot Air Balloon Safari','Michelin-Inspired Bush Dining','Dedicated Personal Guide','Fully Bespoke Itinerary']},
  {badge:null,        duration:'2 Days · 1 Night',    name:'Nairobi<br>Wild',               price:'$680',    page:'/packages/nairobi-wild/',          tier:'budget', cardBg:'/assets/maasaimara.webp',   features:['Nairobi National Park','Giraffes & Elephants','Boutique City-Edge Lodge','Private 4x4 Throughout','Full Board','Expert Naturalist Guide']},
  {badge:null,        duration:'2 Days · 1 Night',    name:"Hell's<br>Gate Trek",           price:'$590',    page:'/packages/hells-gate-trek/',       tier:'budget', cardBg:'/assets/maasaimara.webp',   features:["Hell's Gate National Park",'Cycling Through Gorge','Rappelling & Gorge Walk','Lake Naivasha Boat Ride','Full Board','2–8 Guests']},
  {badge:null,        duration:'5 Days · 4 Nights',   name:'Lamu<br>Archipelago',           price:'$4,200',  page:'/packages/lamu-archipelago/',      tier:'mid',    cardBg:'/assets/dianibeach.webp',   features:['Lamu & Manda Island','Boutique Heritage Hotel','Charter & Private Dhow','UNESCO Old Town','Full Board & Sundowners','Ideal for Couples']},
  {badge:null,        duration:'6 Days · 5 Nights',   name:'Birding<br>Kenya',              price:'$4,800',  page:'/packages/birding-kenya/',         tier:'mid',    cardBg:'/assets/lakenakuru.webp',   features:['Nakuru, Kakamega & Mara','250–400 Bird Species','African Bird Club Guide','Full Board','2–6 Guests','All Transfers Included']},
  {badge:null,        duration:'6 Days · 5 Nights',   name:'Family<br>Wild',                price:'$4,100',  page:'/packages/family-wild/',           tier:'mid',    cardBg:'/assets/maasaimara.webp',   features:['Nairobi + Maasai Mara','Junior Ranger Programme','Private Vehicle Always','Full Board','6 Days Family Adventure','Expert Family Guide']},
  {badge:null,        duration:'7 Days · 6 Nights',   name:'Photography<br>Expedition',     price:'$7,400',  page:'/packages/photography-expedition/',tier:'luxury', cardBg:'/assets/maasaimara.webp',   features:['Mara + Amboseli Locations','Nat Geo Professional Guide','Max 4 Guests Strictly','Private Charter Flights','All-Inclusive Premium','Full Photography Tuition']},
  {badge:'Exclusive', duration:'6 Days · 5 Nights',   name:'Private<br>Conservancy',        price:'$14,800', page:'/packages/private-conservancy/',   tier:'ultra',  cardBg:'/assets/maasaimara.webp',   features:['Full Conservancy Buyout','Exclusive-Use Tented Villa','Private Charter Flights','All-Inclusive Premium','Per Couple — Fully Private','Bespoke Butler Service']},
  {badge:null,        duration:'5 Days · 4 Nights',   name:'Migration<br>Witness',          price:'$8,900',  page:'/packages/migration-witness/',     tier:'luxury', cardBg:'/assets/maasaimara.webp',   features:['Great Migration River Crossings','July–October Only','Private River Camp','Private Charter Flights','All-Inclusive Fine Dining','Expert Migration Guide']},
];

(async function(){
  try {
    const supa = window.supabase ? window.supabase.createClient('https://kwriicxzkgkcseorcqdi.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo') : null;
    if(!supa)return;
    const {data,error}=await supa.from('packages').select('name,slug,badge,category,duration_days,duration_nights,price_high_season,price_duo,short_highlights,card_bg_image_url,detail_page_url').eq('is_published',true).order('created_at',{ascending:false});
    if(error||!data||!data.length)return;
    data.forEach(function(pkg){
      const price=pkg.price_high_season||pkg.price_duo||0;
      const days=pkg.duration_days||0, nights=pkg.duration_nights||0;
      const tier=pkg.category?.toLowerCase().includes('ultra')?'ultra':pkg.category?.toLowerCase().includes('luxury')?'luxury':pkg.category?.toLowerCase().includes('budget')?'budget':'mid';
      const exists=allPackages.some(function(p){return p.name.replace(/<br>/g,' ').replace(/\s+/g,' ').trim().toLowerCase()===pkg.name.trim().toLowerCase();});
      if(exists)return;
      allPackages.push({badge:pkg.badge||null,duration:days?days+' Days · '+nights+' Nights':'',name:pkg.name,price:'$'+Number(price).toLocaleString(),page:pkg.detail_page_url||(pkg.slug+'.html'),tier:tier,features:pkg.short_highlights||[],cardBg:pkg.card_bg_image_url||null});
    });
  } catch(_){}
})();

var cardBgs=['/assets/Coolelephant.webp','/assets/jungle.webp','/assets/zebra.webp'];

function buildCard(pkg,isFeatured,bgIndex){
  const maxF=isFeatured?7:6, features=[].concat(pkg.features);
  while(features.length<maxF)features.push(null);
  const bg=pkg.cardBg||cardBgs[bgIndex!==undefined?bgIndex:0];
  return '<img class="pkg-bg" src="'+bg+'" alt="" aria-hidden="true"><div class="pkg-bg-overlay"></div>'+
    (pkg.badge?'<span class="pkg-badge">'+pkg.badge+'</span>':'<span style="display:block;height:29px;margin-bottom:28px;position:relative;z-index:3;"></span>')+
    '<span class="pkg-duration">'+pkg.duration+'</span><h3 class="pkg-name">'+pkg.name+'</h3>'+
    '<div class="divider" style="position:relative;z-index:3;"></div>'+
    '<div class="pkg-price">'+pkg.price+' <span>/ person</span></div>'+
    '<ul class="pkg-features">'+features.map(function(f){return f?'<li>'+f+'</li>':'<li style="visibility:hidden;border-bottom-color:transparent;">—</li>';}).join('')+'</ul>'+
    '<a href="'+(pkg.page||'#contact')+'" class="pkg-cta">Unveil This Journey</a>';
}

document.addEventListener('DOMContentLoaded',function(){
  const filterBtns=document.querySelectorAll('.pkg-filter-btn');
  const filterLabel=document.getElementById('pkgFilterLabel');
  const filterGlow=document.getElementById('pkgFilterGlow');
  const card0=document.getElementById('pkgCard0');
  const card1=document.getElementById('pkgCard1');
  const card2=document.getElementById('pkgCard2');
  if(!card0||!card1||!card2)return;

  var activeFilter='all';
  var currentSet=[0,1,2];

  const labelMap={all:'Showing all collections',luxury:'Showing luxury experiences','mid':'Showing mid journeys',budget:'Showing budget-friendly safaris'};

  function positionGlow(btn){if(filterGlow){filterGlow.style.left=btn.offsetLeft+'px';filterGlow.style.width=btn.offsetWidth+'px';}}

  function getFilteredSet(filter){
    const pool=filter==='all'?allPackages.map(function(_,i){return i;}):allPackages.map(function(p,i){return p.tier===filter?i:null;}).filter(function(i){return i!==null;});
    while(pool.length<3)pool.push.apply(pool,pool);
    return[pool[0],pool[1],pool[2]];
  }

  function renderCard(el,pkgIndex,isFeatured,animate,bgIndex){
    const pkg=allPackages[pkgIndex%allPackages.length];
    if(!animate){el.innerHTML=buildCard(pkg,isFeatured,bgIndex);return;}
    el.style.transition='opacity 0.5s ease,transform 0.5s ease';el.style.opacity='0';el.style.transform='translateY(16px)';
    setTimeout(function(){el.innerHTML=buildCard(pkg,isFeatured,bgIndex);el.style.opacity='1';el.style.transform='translateY(0)';},500);
  }

  filterBtns.forEach(function(btn){
    btn.addEventListener('click',function(){
      filterBtns.forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active'); activeFilter=btn.dataset.filter;
      if(filterLabel)filterLabel.textContent=labelMap[activeFilter]||'';
      positionGlow(btn);
      currentSet=getFilteredSet(activeFilter);
      renderCard(card0,currentSet[0],false,false,0);
      renderCard(card1,currentSet[1],true,false,1);
      renderCard(card2,currentSet[2],false,false,2);
    });
  });

  const initActive=document.querySelector('.pkg-filter-btn.active');
  if(initActive)positionGlow(initActive);

  renderCard(card0,currentSet[0],false,false,0);
  renderCard(card1,currentSet[1],true,false,1);
  renderCard(card2,currentSet[2],false,false,2);

  setInterval(function(){currentSet[0]=(currentSet[0]+3)%allPackages.length;renderCard(card0,currentSet[0],false,true,0);},18000);
  setTimeout(function(){setInterval(function(){currentSet[1]=(currentSet[1]+3)%allPackages.length;renderCard(card1,currentSet[1],true,true,1);},18000);},6000);
  setTimeout(function(){setInterval(function(){currentSet[2]=(currentSet[2]+3)%allPackages.length;renderCard(card2,currentSet[2],false,true,2);},12000);},12000);
});

// ===========================
// INLINE QUIZ
// ===========================
(function(){
  var container=document.getElementById('iqStepContainer');
  var progress=document.getElementById('iqProgress');
  if(!container)return;

  // Check if user is signed in and get their name
  var _iqUserName = null;
  var _iqUserSignedIn = false;

  function getLivePool(){
    var pool=(window.allPackages&&window.allPackages.length)?window.allPackages.map(function(p){
      var name=p.name.replace(/<br>/g,' ').replace(/\s+/g,' ').trim();
      var tier=(p.tier||'').toLowerCase();
      var vibes=[]; var st=(name+' '+(p.features||[]).join(' ')).toLowerCase();
      if(/beach|coast|diani/.test(st))vibes.push('beach');
      if(/wildlife|safari|mara|amboseli|elephant/.test(st))vibes.push('wildlife');
      if(/hike|trek|adventure|mount/.test(st))vibes.push('adventure');
      if(/culture|maasai|village/.test(st))vibes.push('culture');
      if(!vibes.length)vibes.push('wildlife');
      var days=parseInt((p.duration||'').match(/\d+/)||[0]);
      var dk=days<=4?'short':days<=7?'medium':days<=10?'long':'grand';
      return{name:name,price:p.price,duration:p.duration||'',page:p.page||'#packages',tier:tier,vibe:vibes,durationKey:dk,priceRaw:parseInt((p.price||'$0').replace(/\D/g,''))||0};
    }):[
      {name:'Mara Awakening',price:'$2,800',duration:'4 Days',page:'/packages/mara-awakening/',tier:'mid',vibe:['wildlife'],durationKey:'short',priceRaw:2800},
      {name:'Grand Odyssey',price:'$6,500',duration:'7 Days',page:'/packages/grand-odyssey/',tier:'luxury',vibe:['wildlife','culture'],durationKey:'medium',priceRaw:6500},
      {name:'Ultimate Kenya',price:'$11,200',duration:'10 Days',page:'/packages/ultimate-kenya/',tier:'luxury',vibe:['wildlife','adventure'],durationKey:'long',priceRaw:11200},
      {name:'Amboseli Escape',price:'$1,950',duration:'3 Days',page:'/packages/amboseli-express/',tier:'budget',vibe:['wildlife'],durationKey:'short',priceRaw:1950},
      {name:'Samburu Wilderness',price:'$3,400',duration:'5 Days',page:'/packages/samburu-secrets/',tier:'mid',vibe:['wildlife','adventure'],durationKey:'medium',priceRaw:3400},
      {name:'Coastal Safari Blend',price:'$4,200',duration:'6 Days',page:'/packages/safari-and-sea/',tier:'mid',vibe:['beach','wildlife'],durationKey:'medium',priceRaw:4200},
      {name:'Lakes & Highlands',price:'$5,100',duration:'8 Days',page:'/packages/lake-nakuru-escape/',tier:'mid',vibe:['adventure','culture'],durationKey:'long',priceRaw:5100},
      {name:'Kenya Mastery',price:'$14,500',duration:'12 Days',page:'/packages/grand-odyssey/',tier:'ultra',vibe:['wildlife','culture'],durationKey:'grand',priceRaw:14500},
      {name:'Nairobi Wild',price:'$680',duration:'2 Days',page:'/packages/nairobi-wild/',tier:'budget',vibe:['wildlife'],durationKey:'short',priceRaw:680},
      {name:"Hell's Gate Trek",price:'$590',duration:'2 Days',page:'/packages/hells-gate-trek/',tier:'budget',vibe:['adventure'],durationKey:'short',priceRaw:590},
      {name:'Lamu Archipelago',price:'$4,200',duration:'5 Days',page:'/packages/lamu-archipelago/',tier:'mid',vibe:['beach','culture'],durationKey:'medium',priceRaw:4200},
      {name:'Birding Kenya',price:'$4,800',duration:'6 Days',page:'/packages/birding-kenya/',tier:'mid',vibe:['wildlife','adventure'],durationKey:'medium',priceRaw:4800},
      {name:'Family Wild',price:'$4,100',duration:'6 Days',page:'/packages/family-wild/',tier:'mid',vibe:['wildlife','culture'],durationKey:'medium',priceRaw:4100},
      {name:'Photography Expedition',price:'$7,400',duration:'7 Days',page:'/packages/photography-expedition/',tier:'luxury',vibe:['wildlife'],durationKey:'medium',priceRaw:7400},
      {name:'Private Conservancy Sojourn',price:'$14,800',duration:'6 Days',page:'/packages/private-conservancy/',tier:'ultra',vibe:['wildlife'],durationKey:'medium',priceRaw:14800},
      {name:'Migration Witness',price:'$8,900',duration:'5 Days',page:'/packages/migration-witness/',tier:'luxury',vibe:['wildlife'],durationKey:'medium',priceRaw:8900},
    ];
    return pool;
  }

  // Steps without name (for signed-in users)
  var stepsNoName=[
    {id:'vibe',type:'multi',label:'Step 1 of 4',question:'What draws you to Kenya?',sub:'Choose everything that stirs something in you.',options:[{value:'wildlife',label:'Wildlife & Safari'},{value:'beach',label:'Coast & Ocean'},{value:'adventure',label:'Adventure & Hiking'},{value:'culture',label:'Culture & People'}]},
    {id:'duration',type:'choice',label:'Step 2 of 4',question:'How long is your dream escape?',sub:'We will shape the perfect rhythm around your time.',options:[{value:'short',label:'3 – 4 Days'},{value:'medium',label:'5 – 7 Days'},{value:'long',label:'8 – 10 Days'},{value:'grand',label:'10+ Days'}]},
    {id:'budget',type:'choice',label:'Step 3 of 4',question:'What is your comfort range?',sub:'Every budget unlocks a remarkable journey.',singleCol:true,options:[{value:'budget',label:'Budget · Under $2,500'},{value:'mid',label:'Mid · $2,500–$5,000'},{value:'luxury',label:'Luxury · $5,000–$12,000'},{value:'ultra',label:'Ultra · $12,000+'}]},
    {id:'travel',type:'text',label:'Step 4 of 4',question:'When are you thinking of travelling?',sub:'A rough idea helps us check availability.',placeholder:'e.g. July 2025, or "not sure yet"',minLength:4,pattern:/^[a-zA-Z0-9\s,\-\/\.]{4,}$/},
  ];

  // Steps with name (for guests)
  var stepsWithName=[
    {id:'name',type:'text',label:'Step 1 of 5',question:'What shall we call you?',sub:'Every great safari begins with a name.',placeholder:'Your first name',minLength:2,pattern:/^[a-zA-ZÀ-ÖØ-öø-ÿ\s'\-]{2,}$/},
    {id:'vibe',type:'multi',label:'Step 2 of 5',question:'What draws you to Kenya?',sub:'Choose everything that stirs something in you.',options:[{value:'wildlife',label:'Wildlife & Safari'},{value:'beach',label:'Coast & Ocean'},{value:'adventure',label:'Adventure & Hiking'},{value:'culture',label:'Culture & People'}]},
    {id:'duration',type:'choice',label:'Step 3 of 5',question:'How long is your dream escape?',sub:'We will shape the perfect rhythm around your time.',options:[{value:'short',label:'3 – 4 Days'},{value:'medium',label:'5 – 7 Days'},{value:'long',label:'8 – 10 Days'},{value:'grand',label:'10+ Days'}]},
    {id:'budget',type:'choice',label:'Step 4 of 5',question:'What is your comfort range?',sub:'Every budget unlocks a remarkable journey.',singleCol:true,options:[{value:'budget',label:'Budget · Under $2,500'},{value:'mid',label:'Mid · $2,500–$5,000'},{value:'luxury',label:'Luxury · $5,000–$12,000'},{value:'ultra',label:'Ultra · $12,000+'}]},
    {id:'travel',type:'text',label:'Step 5 of 5',question:'When are you thinking of travelling?',sub:'A rough idea helps us check availability.',placeholder:'e.g. July 2025, or "not sure yet"',minLength:4,pattern:/^[a-zA-Z0-9\s,\-\/\.]{4,}$/},
  ];

  // Greetings for signed-in users (first step replaces name step)
  var personalizedIntros = [
    function(n){ return 'Ready to plan your next adventure, '+n+'?'; },
    function(n){ return 'Welcome back, '+n+'. Let\'s find your perfect safari.'; },
    function(n){ return n+', shall we find your ideal Kenya escape?'; },
    function(n){ return 'Good to see you, '+n+'. Let\'s match you to the wild.'; },
    function(n){ return n+', your next safari story is waiting to be written.'; },
  ];

  var current=0, answers={}, steps=stepsWithName;

  function initQuiz() {
    // Try to get signed-in user
    try {
      var SUPA_URL='https://kwriicxzkgkcseorcqdi.supabase.co';
      var SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
      var supa=window.supabase?window.supabase.createClient(SUPA_URL,SUPA_KEY):null;
      if(supa){
        supa.auth.getSession().then(function(res){
          var session=res.data&&res.data.session;
          if(session&&session.user){
            var m=session.user.user_metadata||{};
            _iqUserName=m.first_name||(m.full_name?m.full_name.split(' ')[0]:'')||session.user.email.split('@')[0]||null;
            // Also check profiles table
            supa.from('profiles').select('first_name').eq('id',session.user.id).single().then(function(r){
              if(r.data&&r.data.first_name)_iqUserName=r.data.first_name;
              _iqUserSignedIn=true;
              answers.name=_iqUserName;
              steps=stepsNoName;
              current=0;
              renderStep(0);
            });
          } else {
            steps=stepsWithName;
            renderStep(0);
          }
        });
      } else {
        steps=stepsWithName;
        renderStep(0);
      }
    } catch(e){
      steps=stepsWithName;
      renderStep(0);
    }
  }

  function getResults(){
    var pool=getLivePool();
    var vibes=Array.isArray(answers.vibe)?answers.vibe:[];
    return pool.map(function(pkg){
      var score=0;
      vibes.forEach(function(v){if(pkg.vibe.includes(v))score+=3;});
      if(answers.duration){var o=['short','medium','long','grand'];var d=Math.abs(o.indexOf(pkg.durationKey)-o.indexOf(answers.duration));if(d===0)score+=4;else if(d===1)score+=2;}
      if(answers.budget&&pkg.tier===answers.budget)score+=5;
      return Object.assign({},pkg,{score:score});
    }).sort(function(a,b){return b.score-a.score||a.priceRaw-b.priceRaw;}).slice(0,3);
  }

  function setProgress(step){
    if(progress)progress.style.width=((step+1)/(steps.length+1)*100)+'%';
  }

  function renderStep(index){
    setProgress(index);
    if(index>=steps.length){renderResults();return;}

    // For signed-in users, show personalized intro above first question
    var personalizedBanner='';
    if(_iqUserSignedIn&&index===0&&_iqUserName){
      var introFns=personalizedIntros;
      var intro=introFns[Math.floor(Math.random()*introFns.length)](_iqUserName);
      personalizedBanner='<div style="background:rgba(212,175,55,0.07);border:1px solid rgba(212,175,55,0.2);border-left:3px solid var(--gold);padding:14px 18px;margin-bottom:24px;font-family:\'Cormorant Garamond\',serif;font-size:16px;font-style:italic;color:rgba(212,175,55,0.9);">'+intro+'</div>';
    }

    var step=steps[index], isText=step.type==='text', isMulti=step.type==='multi';
    var selVibes=Array.isArray(answers.vibe)?answers.vibe:[];
    var hasAnswer=isText?!!answers[step.id]:isMulti?selVibes.length>0:!!answers[step.id];

    container.innerHTML='<div class="quiz-step">'+personalizedBanner+
      '<span class="quiz-step-label">'+step.label+'</span><h2 class="quiz-question">'+step.question+'</h2><p class="quiz-sub">'+step.sub+'</p>'+
      (isText?'<input class="quiz-input" id="iqIn" type="text" placeholder="'+(step.placeholder||'')+'" value="'+(answers[step.id]||'')+'" autocomplete="off">':
        '<div class="quiz-options'+(step.singleCol?' single-col':'')+'" id="iqOpts">'+step.options.map(function(opt){var sel=isMulti?selVibes.includes(opt.value):answers[step.id]===opt.value;return'<button class="quiz-option'+(sel?' selected':'')+'" data-value="'+opt.value+'">'+opt.label+'</button>';}).join('')+'</div>'+
        (isMulti?'<p style="font-family:Jost,sans-serif;font-size:9px;letter-spacing:3px;color:rgba(212,175,55,0.6);margin-top:10px;text-transform:uppercase;" id="iqHint">'+selVibes.length+' selected — press Continue when ready</p>':''))+
      '<div class="quiz-nav">'+(index>0?'<button class="quiz-btn-back" id="iqBk">Back</button>':'<span></span>')+
      '<button class="quiz-btn-next'+(hasAnswer?' ready':'')+'" id="iqNx">'+(index===steps.length-1?'See My Safaris':'Continue')+'</button></div></div>';

    var nx=document.getElementById('iqNx'),bk=document.getElementById('iqBk');
    if(isText){
      var inp=document.getElementById('iqIn');
      function valid(){return inp.value.trim().length>=(step.minLength||1)&&(!step.pattern||step.pattern.test(inp.value.trim()));}
      inp.addEventListener('input',function(){answers[step.id]=inp.value.trim();nx.classList.toggle('ready',valid());});
      inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&valid()){current++;renderStep(current);}});
      setTimeout(function(){inp.focus({preventScroll:true});},80);
    } else if(isMulti){
      document.getElementById('iqOpts').addEventListener('click',function(e){
        var btn=e.target.closest('.quiz-option');if(!btn)return;
        var val=btn.dataset.value;if(!Array.isArray(answers.vibe))answers.vibe=[];
        if(answers.vibe.includes(val)){answers.vibe=answers.vibe.filter(function(v){return v!==val;});btn.classList.remove('selected');}
        else{answers.vibe.push(val);btn.classList.add('selected');}
        var h=document.getElementById('iqHint');if(h)h.textContent=answers.vibe.length+' selected — press Continue when ready';
        nx.classList.toggle('ready',answers.vibe.length>0);
      });
    } else {
      document.getElementById('iqOpts').addEventListener('click',function(e){
        var btn=e.target.closest('.quiz-option');if(!btn)return;
        document.querySelectorAll('#iqOpts .quiz-option').forEach(function(b){b.classList.remove('selected');});
        btn.classList.add('selected');answers[step.id]=btn.dataset.value;nx.classList.add('ready');
        setTimeout(function(){current++;renderStep(current);},380);
      });
    }
    if(nx)nx.addEventListener('click',function(){if(nx.classList.contains('ready')){current++;renderStep(current);}});
    if(bk)bk.addEventListener('click',function(){current--;renderStep(current);});
  }

  function renderResults(){
    setProgress(steps.length);
    var results=getResults();
    var name=_iqUserName||(answers.name?answers.name.split(' ')[0]:'Explorer');
    container.innerHTML='<div class="quiz-step"><div class="quiz-results-intro"><span class="quiz-step-label">Curated For You</span><h2 class="quiz-question">Your Safari Awaits,<br>'+name+'.</h2><p class="quiz-sub">Based on your preferences, these experiences were made for you.</p></div><div class="quiz-result-cards">'+
      results.map(function(pkg){return'<div class="quiz-result-card"><div class="quiz-result-info"><div class="quiz-result-name">'+pkg.name+'</div><div class="quiz-result-meta">'+pkg.duration+' · '+pkg.tier+'</div></div><div class="quiz-result-price">'+pkg.price+'</div><a href="'+pkg.page+'" class="quiz-result-link">View</a></div>';}).join('')+
      '</div><button class="quiz-btn-next ready" id="iqCont" style="width:100%;text-align:center;margin-top:24px;">Speak to Our Safari Team</button></div>';
    document.getElementById('iqCont').addEventListener('click',function(){document.querySelector('#contact').scrollIntoView({behavior:'smooth',block:'start'});});
  }

  initQuiz();
})();

// ===========================
// BLOG
// ===========================
(function(){
  var fallbackBlogs=[
    {slug:'great-migration-guide',title:'The Great Migration: Everything You Need to Know Before You Go',excerpt:'Two million wildebeest. One river. An annual crossing that redefines what it means to witness nature at full force.',category:'Wildlife',date:'March 2025',read_time:'8 min read',cover_image:'/assets/maasaimara.webp',cover_alt:'The Great Migration'},
    {slug:'best-time-kenya-safari',title:"When to Go: Kenya's Safari Seasons Decoded",excerpt:'Peak, shoulder, green — each season unlocks a different Kenya. Here is how to choose yours.',category:'Planning',date:'February 2025',read_time:'5 min read',cover_image:'/assets/amboseli.webp',cover_alt:'Best time for Kenya safari'},
    {slug:'diani-beach-guide',title:"Diani Beach: Africa's Finest Coastline After Your Safari",excerpt:'Where the bush ends and the ocean begins.',category:'Coast',date:'January 2025',read_time:'6 min read',cover_image:'/assets/dianibeach.webp',cover_alt:'Diani Beach Guide'},
  ];
  var allBlogs=fallbackBlogs.slice();

  function buildBlogCardHTML(blog){
    var page=blog.slug&&blog.slug.startsWith('http')?blog.slug:'/journal/'+blog.slug+'/';
    return'<div class="blog-card-img-wrap"><img class="blog-card-img" src="'+blog.cover_image+'" alt="'+(blog.cover_alt||blog.title)+'" loading="lazy"><div class="blog-card-img-overlay"></div><span class="blog-card-category">'+blog.category+'</span></div>'+
      '<div class="blog-card-body"><div class="blog-card-meta"><span class="blog-card-date">'+blog.date+'</span><span class="blog-card-read">'+blog.read_time+'</span></div>'+
      '<h3 class="blog-card-title">'+blog.title+'</h3><p class="blog-card-excerpt">'+blog.excerpt+'</p>'+
      '<span class="blog-card-cta">Read the story</span></div>';
  }

  function setCard(el,blog){
    if(!el||!blog)return;
    var page=blog.slug&&blog.slug.startsWith('http')?blog.slug:'/journal/'+blog.slug+'/';
    el.innerHTML=buildBlogCardHTML(blog);
    el.style.cursor='none'; el.onclick=function(){window.location.href=page;};
  }

  async function loadBlogs(){
    try{
      var supa=window.supabase?window.supabase.createClient('https://kwriicxzkgkcseorcqdi.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo'):null;
      if(supa){
        var res=await supa.from('blogs').select('slug,title,excerpt,category,published_date,read_time,cover_image_url,cover_alt,is_published').eq('is_published',true).order('published_date',{ascending:false});
        if(!res.error&&res.data&&res.data.length){
          var sb=res.data.map(function(b){return{slug:b.slug,title:b.title,excerpt:b.excerpt||'',category:b.category||'Safari',date:b.published_date?new Date(b.published_date).toLocaleDateString('en-US',{month:'long',year:'numeric'}):'',read_time:b.read_time||'5 min read',cover_image:b.cover_image_url||'/assets/maasaimara.webp',cover_alt:b.cover_alt||b.title};});
          var slugSet=new Set(sb.map(function(b){return b.slug;}));
          allBlogs=sb.concat(fallbackBlogs.filter(function(b){return!slugSet.has(b.slug);}));
        }
      }
    }catch(_){}
    var e0=document.getElementById('blogCard0'),e1=document.getElementById('blogCard1'),e2=document.getElementById('blogCard2');
    setCard(e0,allBlogs[0]); setCard(e1,allBlogs[1]); setCard(e2,allBlogs[2]);
  }

  document.addEventListener('DOMContentLoaded',loadBlogs);
})();

// ===========================
// DESTINATIONS SLIDESHOW
// ===========================
(function(){
  var slideshow=document.getElementById('destSlideshow');
  var track=document.getElementById('dsTrack');
  if(!track)return;
  var slides=Array.from(track.querySelectorAll('.ds-slide'));
  var dotsWrap=document.getElementById('dsDots');
  var progress=document.getElementById('dsProgress');
  var countCur=document.getElementById('dsCountCurrent');
  var countTotal=document.getElementById('dsCountTotal');
  var hintLeft=document.getElementById('dsHintLeft');
  var hintRight=document.getElementById('dsHintRight');
  var lightbox=document.getElementById('dsLightbox');
  var lbImg=document.getElementById('dsLightboxImg');
  var lbClose=document.getElementById('dsLightboxClose');
  var total=slides.length, current=0, timer=null, isHovered=false, trackOffset=0;
  var INTERVAL=4500;

  if(countTotal)countTotal.textContent=total;
  slides.forEach(function(_,i){
    var dot=document.createElement('div');dot.className='ds-dot'+(i===0?' active':'');
    dot.addEventListener('click',function(){goTo(i);startTimer();});
    if(dotsWrap)dotsWrap.appendChild(dot);
  });

  function getClass(pos){if(pos===0)return'ds-active';if(pos===1)return'ds-next';if(pos===total-1)return'ds-prev-slide';if(pos===2||pos===total-2)return'ds-far';return'';}

  function centerActive(){
    if(!slideshow)return;
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      var sw=slideshow.offsetWidth, ae=slides[current], aw=ae.offsetWidth, gap=20, padL=sw*0.18, before=0;
      slides.forEach(function(s,i){if(i<current)before+=s.offsetWidth+gap;});
      trackOffset=(sw-aw)/2-before-padL;
      track.style.transform='translateX('+trackOffset+'px)';
    });});
  }

  function updateSlides(){
    slides.forEach(function(sl,i){
      sl.classList.remove('ds-active','ds-next','ds-prev-slide','ds-far');
      var pos=(i-current+total)%total, cls=getClass(pos);
      if(cls)sl.classList.add(cls);
      sl.style.visibility=(pos>2&&pos<total-2)?'hidden':'visible';
    });
    if(dotsWrap)dotsWrap.querySelectorAll('.ds-dot').forEach(function(d,i){d.classList.toggle('active',i===current);if(i===current){d.innerHTML='';void d.offsetWidth;}});
    if(countCur)countCur.textContent=current+1;
    centerActive();
  }

  function goTo(index){if(index===current)return;current=(index+total)%total;updateSlides();restartProgress();}
  function next(){goTo(current+1);}function prev(){goTo(current-1);}

  function restartProgress(){
    if(!progress)return;
    progress.classList.remove('running');progress.style.transition='none';progress.style.width='0%';
    void progress.offsetWidth;progress.classList.add('running');
  }

  function startTimer(){clearInterval(timer);timer=setInterval(function(){if(!isHovered)next();},INTERVAL);}

  slides.forEach(function(slide){
    slide.addEventListener('click',function(e){
      if(e.target.closest('.ds-magnify')||e.target.closest('.ds-slide-btn'))return;
      if(slide.classList.contains('ds-next')){next();startTimer();}
      if(slide.classList.contains('ds-prev-slide')){prev();startTimer();}
    });
  });

  if(hintLeft)hintLeft.addEventListener('click',function(){prev();startTimer();});
  if(hintRight)hintRight.addEventListener('click',function(){next();startTimer();});

  if(lightbox&&lbClose){
    slides.forEach(function(slide){
      var magnify=slide.querySelector('.ds-magnify');
      var img=slide.querySelector('.ds-slide-img');
      if(magnify&&img){magnify.addEventListener('click',function(e){e.stopPropagation();if(lbImg)lbImg.src=img.src;lightbox.classList.add('open');document.body.style.overflow='hidden';clearInterval(timer);});}
    });
    lbClose.addEventListener('click',function(){lightbox.classList.remove('open');document.body.style.overflow='';startTimer();});
    lightbox.addEventListener('click',function(e){if(e.target===lightbox){lightbox.classList.remove('open');document.body.style.overflow='';startTimer();}});
  }

  if(slideshow){slideshow.addEventListener('mouseenter',function(){isHovered=true;});slideshow.addEventListener('mouseleave',function(){isHovered=false;});}

  var tx=0, dragging=false;
  if(slideshow){
    slideshow.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;dragging=true;clearInterval(timer);},{passive:true});
    slideshow.addEventListener('touchend',function(e){if(!dragging)return;dragging=false;var dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>50){dx<0?next():prev();}startTimer();},{passive:true});
  }

  document.addEventListener('keydown',function(e){if(lightbox&&lightbox.classList.contains('open'))return;if(e.key==='ArrowRight'){next();startTimer();}if(e.key==='ArrowLeft'){prev();startTimer();}});
  window.addEventListener('resize',function(){centerActive();});

  requestAnimationFrame(function(){updateSlides();restartProgress();startTimer();});
})();

// ===========================
// GALLERY COLLAGE + LIGHTBOX
// ===========================
(function(){
  var grid=document.getElementById('galCollage');
  if(!grid)return;
  var items=Array.from(grid.querySelectorAll('.gc-item'));
  var lb=document.getElementById('galLightbox');
  var lbBackdrop=document.getElementById('galLbBackdrop');
  var lbStage=document.getElementById('galLbStage');
  var lbClose=document.getElementById('galLbClose');
  var lbPrev=document.getElementById('galLbPrev');
  var lbNext=document.getElementById('galLbNext');
  var lbEyebrow=document.getElementById('galLbEyebrow');
  var lbTitle=document.getElementById('galLbTitle');
  var lbCur=document.getElementById('galLbCur');
  var lbTotal=document.getElementById('galLbTotal');
  var viewAllBtn=document.getElementById('galViewAllBtn');
  var curIndex=0;

  // Lazy-load + autoplay videos only when visible (keeps initial load fast)
  var videos=Array.from(grid.querySelectorAll('.gc-video'));
  var vidObserver=('IntersectionObserver' in window) ? new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      var v=en.target;
      if(en.isIntersecting){
        if(!v.src && v.dataset.src){ v.src=v.dataset.src; }
        var p=v.play(); if(p&&p.catch)p.catch(function(){});
      } else {
        v.pause();
      }
    });
  }, {rootMargin:'80px', threshold:0.25}) : null;
  videos.forEach(function(v){ if(vidObserver)vidObserver.observe(v); else { v.src=v.dataset.src; } });

  function buildStage(idx){
    var it=items[idx];
    var type=it.getAttribute('data-type');
    var src=it.getAttribute('data-src');
    var eyebrow=it.querySelector('.gc-eyebrow').textContent;
    var title=it.querySelector('.gc-title').textContent;
    lbStage.innerHTML='';
    if(type==='video'){
      var v=document.createElement('video');
      v.src=src; v.muted=true; v.loop=true; v.playsInline=true; v.autoplay=true; v.controls=false;
      lbStage.appendChild(v);
    } else {
      var img=document.createElement('img');
      img.src=src; img.alt=title;
      lbStage.appendChild(img);
    }
    lbEyebrow.textContent=eyebrow;
    lbTitle.textContent=title;
    lbCur.textContent=idx+1;
    lbTotal.textContent=items.length;
    curIndex=idx;
  }

  function openLb(idx){
    buildStage(idx);
    lb.classList.add('gc-lb-open');
    lb.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function closeLb(){
    lb.classList.remove('gc-lb-open');
    lb.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    var v=lbStage.querySelector('video'); if(v)v.pause();
  }
  function nav(dir){
    var next=(curIndex+dir+items.length)%items.length;
    buildStage(next);
  }

  items.forEach(function(it,i){
    it.addEventListener('click',function(){ openLb(i); });
    it.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openLb(i); }
    });
  });
  if(viewAllBtn) viewAllBtn.addEventListener('click',function(){ openLb(0); });
  if(lbClose) lbClose.addEventListener('click',closeLb);
  if(lbBackdrop) lbBackdrop.addEventListener('click',closeLb);
  if(lbPrev) lbPrev.addEventListener('click',function(){ nav(-1); });
  if(lbNext) lbNext.addEventListener('click',function(){ nav(1); });
  document.addEventListener('keydown',function(e){
    if(!lb.classList.contains('gc-lb-open'))return;
    if(e.key==='Escape')closeLb();
    if(e.key==='ArrowLeft')nav(-1);
    if(e.key==='ArrowRight')nav(1);
  });
})();


// ===========================
// USER PROFILE — uses profile.html
// ===========================
// ═══════════════════════════════════════════════════
// PROFILE MODAL SYSTEM
// Renders profile.html inside an iframe overlay.
// The main page scroll position and state are fully
// preserved — no navigation, no reload.
// ═══════════════════════════════════════════════════
(function () {
  'use strict';

  let _pmScrollY  = 0;
  let _pmIsOpen   = false;
  let _pmLoaded   = false;

  // ── DOM refs ──────────────────────────────────────
  const getOverlay = () => document.getElementById('profileModalOverlay');
  const getIframe  = () => document.getElementById('profileModalIframe');
  const getLoader  = () => document.getElementById('profileModalLoader');

  // ── Toggle FABs & fixed elements ──────────────────
  function setFabs(show) {
    [
      document.querySelector('.whatsapp-fab'),
      document.getElementById('themeToggle'),
      document.getElementById('google_translate_element')
    ].forEach(el => {
      if (!el) return;
      el.style.transition    = 'opacity 0.3s ease';
      el.style.opacity       = show ? '1' : '0';
      el.style.pointerEvents = show ? '' : 'none';
    });
  }

  // ── OPEN ─────────────────────────────────────────
  window._openProfile = function () {
    if (!window._fjCurrentUser) { window._openAuth('signin'); return; }
    if (_pmIsOpen) return;
    _pmIsOpen = true;

    // Capture exact scroll position
    _pmScrollY = window.scrollY || document.documentElement.scrollTop;

    // Freeze page scroll without layout shift
    document.body.style.position = 'fixed';
    document.body.style.top      = `-${_pmScrollY}px`;
    document.body.style.left     = '0';
    document.body.style.right    = '0';
    document.body.style.overflow = 'hidden';

    setFabs(false);

    const overlay = getOverlay();
    overlay.style.display = 'flex';

    // Two rAF frames so display:flex takes effect before opacity transition
    requestAnimationFrame(() => requestAnimationFrame(() => {
      overlay.classList.add('open');
    }));

    const fr = getIframe();
    const ld = getLoader();

    if (!_pmLoaded) {
      // First open — inject src and wait for load event
      if (ld) ld.classList.remove('hidden');
      fr.onload = function () {
        _pmLoaded = true;
        _pmSyncTheme();
        // Short grace period so iframe paints before hiding loader
        setTimeout(() => { if (ld) ld.classList.add('hidden'); }, 280);
      };
      fr.src = '/profile/';
    } else {
      // Already loaded — hide loader immediately, re-sync theme
      if (ld) ld.classList.add('hidden');
      _pmSyncTheme();
    }
  };

  // ── CLOSE ─────────────────────────────────────────
  window._closeProfileModal = function () {
    if (!_pmIsOpen) return;

    const fr = getIframe();
    if (fr && fr.contentWindow) {
      try {
        fr.contentWindow.postMessage({ type: 'FJ_PROFILE_CHECK_DIRTY' }, '*');
        // Give iframe 250ms to respond; force-close if no reply
        clearTimeout(window._pmCloseTimer);
        window._pmCloseTimer = setTimeout(_pmDoClose, 250);
        return;
      } catch (_) { /* cross-origin or not loaded yet */ }
    }
    _pmDoClose();
  };

  function _pmDoClose() {
    clearTimeout(window._pmCloseTimer);
    if (!_pmIsOpen) return;
    _pmIsOpen = false;

    const overlay = getOverlay();
    overlay.classList.remove('open');

    setTimeout(() => {
      overlay.style.display = 'none';

      // Unfreeze page and restore exact scroll position — no reload
      document.body.style.position = '';
      document.body.style.top      = '';
      document.body.style.left     = '';
      document.body.style.right    = '';
      document.body.style.overflow = '';
      window.scrollTo({ top: _pmScrollY, behavior: 'instant' });

      setFabs(true);
    }, 460);
  }

  // ── THEME SYNC ────────────────────────────────────
  function _pmSyncTheme() {
    const fr = getIframe();
    if (!fr || !fr.contentWindow) return;
    try {
      fr.contentWindow.postMessage({
        type:  'FJ_THEME',
        light: document.body.classList.contains('light-mode')
      }, '*');
    } catch (_) {}
  }

  // Keep iframe theme in sync whenever parent toggles
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    setTimeout(_pmSyncTheme, 60);
  });

  // ── MESSAGE BUS ───────────────────────────────────
  window.addEventListener('message', function (e) {
    if (!e.data || typeof e.data !== 'object') return;

    switch (e.data.type) {

      case 'FJ_PROFILE_DIRTY_RESPONSE':
        clearTimeout(window._pmCloseTimer);
        if (e.data.dirty) {
          // Let iframe show its own discard dialog
          try {
            getIframe()?.contentWindow?.postMessage(
              { type: 'FJ_PROFILE_REQUEST_CLOSE' }, '*'
            );
          } catch (_) {}
        } else {
          _pmDoClose();
        }
        break;

      case 'FJ_PROFILE_CLOSE_CONFIRMED':
        _pmDoClose();
        break;

      case 'FJ_PROFILE_NAVIGATE_AWAY':
        _pmDoClose();
        break;

      case 'FJ_PROFILE_SIGNED_OUT':
        _pmDoClose();
        // Sign out on parent page too
        if (typeof updateNavForUser === 'function') updateNavForUser(null);
        break;

      case 'FJ_PROFILE_SAVED':
        // Update nav display name on parent without reload
        if (e.data.firstName && window._fjCurrentUser) {
          window._fjCurrentUser.user_metadata = {
            ...(window._fjCurrentUser.user_metadata || {}),
            first_name: e.data.firstName,
            last_name:  e.data.lastName || ''
          };
          if (typeof updateNavForUser === 'function') {
            updateNavForUser(window._fjCurrentUser);
          }
        }
        break;
    }
  });

  // ── BACKDROP CLICK ────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    getOverlay()?.addEventListener('click', function (e) {
      if (e.target === getOverlay()) window._closeProfileModal();
    });
  });

  // ── ESCAPE KEY ────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && _pmIsOpen) window._closeProfileModal();
  });

  // Expose close alias
  window._closeProfile = window._closeProfileModal;

})();
// ===========================
// HERO AMBIENT SOUND TOGGLE
// ===========================
(function(){
  var btn       = document.getElementById('heroSoundBtn');
  var audio     = document.getElementById('heroAudio');
  var iconMuted = document.getElementById('heroIconMuted');
  var iconSound = document.getElementById('heroIconSound');
  if(!btn || !audio) return;

  var playing = false;

  function setMuted(){
    audio.pause();
    playing = false;
    iconMuted.style.display = 'block';
    iconSound.style.display = 'none';
    btn.style.borderColor   = 'rgba(212,175,55,0.4)';
    btn.style.background    = 'rgba(8,8,8,0.55)';
  }

  function setPlaying(){
    audio.volume = 0.45;
    audio.play().catch(function(){
      // Browser still blocked — show muted state
      setMuted();
    });
    playing = true;
    iconMuted.style.display = 'none';
    iconSound.style.display = 'block';
    btn.style.borderColor   = 'rgba(212,175,55,0.85)';
    btn.style.background    = 'rgba(212,175,55,0.12)';
  }

  btn.addEventListener('click', function(){
    playing ? setMuted() : setPlaying();
  });

  // Auto-pause when user scrolls past hero
  window.addEventListener('scroll', function(){
    if(playing && window.scrollY > window.innerHeight * 0.8){
      setMuted();
    }
  }, { passive:true });
})();

window._addToCart = function(pkg) {
  var cart = JSON.parse(localStorage.getItem('fj-cart') || '[]');
  if (cart.find(function(p){ return p.name === pkg.name; })) return;
  cart.push(pkg);
  localStorage.setItem('fj-cart', JSON.stringify(cart));
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:120px;right:36px;z-index:99999;background:linear-gradient(135deg,#d4af37,#b8860b);color:#080808;font-family:Jost,sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:14px 24px;box-shadow:0 8px 32px rgba(212,175,55,0.4);opacity:0;transition:opacity 0.35s ease;';
  t.textContent = '✓ ' + pkg.name.replace(/<br>/g,' ') + ' added to cart';
  document.body.appendChild(t);
  requestAnimationFrame(function(){ t.style.opacity='1'; });
  setTimeout(function(){ t.style.opacity='0'; setTimeout(function(){t.remove();},350); },2200);
};
window._addToDraft = window._addToCart;

// Save scroll position whenever user leaves index.html
window.addEventListener('beforeunload', function() {
  sessionStorage.setItem('fjt_scroll', window.scrollY);
});  

// Restore scroll position if returning from profile page
window.addEventListener('load', function() {
  const savedScroll = sessionStorage.getItem('fjt_scroll');
  if (savedScroll && document.referrer.includes('/profile/')) {
    window.scrollTo({ top: parseInt(savedScroll), behavior: 'instant' });
    sessionStorage.removeItem('fjt_scroll');
  }
});  

// ===========================
// TEAM POPUP
// ===========================
(function(){
  var members={
    filmer:{
      name:'Filmer Mageto', role:'Founder & Lead Guide',
      img:'/assets/team-filmer.webp',
      wildlifeImg:'/assets/maasaimara.webp',
      bio:'Over a decade navigating Kenya\'s finest reserves. Filmer founded Filmax Jambo Tours with one unwavering conviction — that a safari should be as extraordinary in its execution as Kenya is in its raw, untamed beauty. He has guided guests across the Mara, Amboseli, Samburu, Tsavo, and the Kenyan coast, accumulating an intimate knowledge of the land and an unshakeable love for every creature within it.',
      details:[
        {icon:'✉️',label:'Email',value:'filmer@filmaxjambotours.co.ke',href:'mailto:filmer@filmaxjambotours.co.ke'},
        {icon:'📞',label:'Direct Line',value:'+254 700 000 001',href:'tel:+254700000001'},
        {icon:'🏆',label:'Certification',value:'KPSGA Gold — Senior Wildlife Guide'},
        {icon:'🌍',label:'Speciality',value:'Maasai Mara · Amboseli · Samburu · Tsavo'},
        {icon:'📅',label:'Experience',value:'12+ years in Kenyan wilderness'},
        {icon:'🦁',label:'Favourite Animal',value:'The African Leopard'},
        {icon:'🗣️',label:'Languages',value:'English · Swahili · Basic Maasai'},
        {icon:'🎓',label:'Education',value:'Tourism Management, University of Nairobi'},
        {icon:'⭐',label:'Achievement',value:'Led 500+ successful safaris across all major Kenyan parks'}
      ]
    },
    amara:{
      name:'Amara Wanjiku', role:'Safari Experience Director',
      img:'/assets/team-amara.webp',
      wildlifeImg:'/assets/amboseli.webp',
      bio:'A master of logistics and luxury, Amara orchestrates every detail of your Filmax Jambo safari — from the timing of your arrival transfer to the fine details of your farewell dinner under the Mara sky. With a background in luxury hospitality and a deep passion for Kenya, she ensures the gap between what you imagined and what you actually experience is as close to zero as humanly possible.',
      details:[
        {icon:'✉️',label:'Email',value:'amara@filmaxjambotours.co.ke',href:'mailto:amara@filmaxjambotours.co.ke'},
        {icon:'📞',label:'Direct Line',value:'+254 700 000 002',href:'tel:+254700000002'},
        {icon:'🏅',label:'Background',value:'Luxury Hospitality & Tourism Management (Moi University)'},
        {icon:'✨',label:'Speciality',value:'Itinerary Design · Lodge Relations · Client Experience'},
        {icon:'📅',label:'Experience',value:'8 years in luxury safari operations'},
        {icon:'🦒',label:'Favourite Animal',value:'The Reticulated Giraffe'},
        {icon:'🗣️',label:'Languages',value:'English · Swahili · French (conversational)'},
        {icon:'🌐',label:'Handled',value:'Guests from 40+ countries worldwide'},
        {icon:'⭐',label:'Achievement',value:'Recipient of Kenya Tourism Board Excellence Award 2024'}
      ]
    },
    githaiga:{
      name:'Githaiga Njoroge', role:'Wildlife Naturalist',
      img:'/assets/team-githaiga.webp',
      wildlifeImg:'/assets/zebra.webp',
      bio:'Born in the shadow of the Mara, Githaiga reads the wilderness like a living book. He anticipates migrations before they happen, tracks the Big Five with a quiet precision that borders on the supernatural, and shares stories the bush whispers only to those who have earned its trust. He has spent his entire career within 50 kilometres of where he was born — and that intimacy with the land is something no amount of international training can replicate.',
      details:[
        {icon:'✉️',label:'Email',value:'githaiga@filmaxjambotours.co.ke',href:'mailto:githaiga@filmaxjambotours.co.ke'},
        {icon:'📞',label:'Direct Line',value:'+254 700 000 003',href:'tel:+254700000003'},
        {icon:'🏆',label:'Certification',value:'KPSGA Silver — Wildlife Naturalist'},
        {icon:'🌍',label:'Speciality',value:'Big Five Tracking · Bird Watching · Migration Patterns'},
        {icon:'📅',label:'Experience',value:'15+ years — born and raised in the Mara region'},
        {icon:'🐘',label:'Favourite Animal',value:'The African Elephant'},
        {icon:'🗣️',label:'Languages',value:'English · Swahili · Kikuyu · Maasai'},
        {icon:'🔭',label:'Record',value:'Identified 312 bird species in a single Mara season'},
        {icon:'⭐',label:'Achievement',value:'Featured in BBC Africa documentary "Eyes of the Mara" 2023'}
      ]
    }
  };
  var overlay=document.getElementById('teamPopupOverlay');
  var closeBtn=document.getElementById('teamPopupClose');
  if(!overlay)return;
  function hideFabs(hide){
    [document.querySelector('.whatsapp-fab'),document.getElementById('themeToggle'),document.getElementById('google_translate_element')].forEach(function(el){if(el){el.style.transition='opacity 0.3s ease';el.style.opacity=hide?'0':'1';el.style.pointerEvents=hide?'none':'';}});
  }
  function openPopup(key){
    hideFabs(true);
    var m=members[key];if(!m)return;
    var heroImg = document.getElementById('teamPopupHeroImg');
    if(heroImg){ heroImg.src = m.wildlifeImg || m.img; heroImg.className = 'team-popup-hero-wildlife'; }
    document.getElementById('teamPopupAvatarImg').src=m.img;
    document.getElementById('teamPopupRole').textContent=m.role;document.getElementById('teamPopupName').textContent=m.name;
    document.getElementById('teamPopupBio').textContent=m.bio;
    var det=document.getElementById('teamPopupDetails');
    det.innerHTML=m.details.map(function(d){return'<div class="team-popup-detail"><div class="team-popup-detail-icon">'+d.icon+'</div><div class="team-popup-detail-text"><span class="team-popup-detail-label">'+d.label+'</span>'+(d.href?'<a href="'+d.href+'" class="team-popup-detail-value">'+d.value+'</a>':'<span class="team-popup-detail-value">'+d.value+'</span>')+'</div></div>';}).join('');
    overlay.classList.add('open');document.body.style.overflow='hidden';
  }
  function closePopup(){overlay.classList.remove('open');document.body.style.overflow='';hideFabs(false);}
  document.querySelectorAll('.team-card[data-member]').forEach(function(card){card.addEventListener('click',function(){openPopup(card.dataset.member);});});
  if(closeBtn)closeBtn.addEventListener('click',closePopup);
  overlay.addEventListener('click',function(e){if(e.target===overlay)closePopup();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closePopup();});
})();

// ===========================
// SITE HINTS
// ===========================
(function(){
  // Respect user preference saved from 3rd hint
  if(localStorage.getItem('fj-hints-disabled')==='true') return;

  var container = document.body;
  var FIRST_HINT_DELAY = 15000; // 15 seconds before first hint
  var BETWEEN_HINTS = 5000;     // 5 seconds between hints
  var DURATION = 5200;
  var shown = new Set();
  var activeHint = null;
  var hintCount = 0;

  var hints = [
    {id:'theme', label:'Tip', text:'Switch between dark and light mode using this button.',
      fixedPos:{bottom:100, left:20}, pointer:'down', triggerScrollY:0},
    {id:'quiz', label:'Safari Match', text:'Answer 5 quick questions below and we\'ll find your perfect safari package instantly.',
      targetId:'inline-quiz', pointer:'up', offsetX:0, offsetY:-56, triggerElId:'inline-quiz', triggerOffset:window.innerHeight*0.85},
    {id:'gallery', label:'Gallery', text:'Hover any photo or video, or hit "View All Moments" to browse the full collection full-screen.',
      targetId:'galViewAllBtn', pointer:'down', offsetX:-100, offsetY:-58, triggerElId:'galViewAllBtn', triggerOffset:window.innerHeight*0.85},
    {id:'packages', label:'Filter', text:'Use the filter bar to sort safari packages by budget — from backpacker to ultra-luxury.',
      targetId:'packagesGrid', pointer:'up', offsetX:0, offsetY:-56, triggerElId:'packagesGrid', triggerOffset:window.innerHeight*0.8},
    {id:'whatsapp', label:'Quick action', text:'Tap the green WhatsApp button to reach our team within the hour.',
      fixedPos:{bottom:104, right:100}, pointer:'right', triggerScrollY:600},
    {id:'team', label:'Meet Us', text:'Click "View Profile" on any team member card to learn more about your guide.',
      targetId:'teamCardFirst', pointer:'down', offsetX:0, offsetY:-58, triggerElId:'teamCardFirst', triggerOffset:window.innerHeight*0.8},
    {id:'review', label:'Your Voice', text:'Scroll to the bottom of testimonials to leave your own review after your safari.',
      targetId:'testimonials', pointer:'up', offsetX:0, offsetY:-56, triggerElId:'testimonials', triggerOffset:window.innerHeight*0.4}
  ];

  function getTargetRect(hint){
    if(hint.targetId){
      var el=document.getElementById(hint.targetId);
      if(!el)return null;
      return el.getBoundingClientRect();
    }
    return null;
  }

  function buildHintBox(hint, isThird){
    var box=document.createElement('div');
    box.className='site-hint';
    box.id='fj-hint-'+hint.id;
    var inner='<span class="site-hint-label">'+hint.label+'</span>'+
      '<span class="site-hint-text">'+hint.text+'</span>';
    if(isThird){
      inner+='<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">'+
        '<button id="fj-hint-yes" style="font-family:Jost,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;padding:8px 16px;background:var(--gold);color:#080808;border:none;cursor:none;font-weight:700;">Yes, keep them</button>'+
        '<button id="fj-hint-no" style="font-family:Jost,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;padding:8px 16px;background:transparent;color:var(--muted);border:1px solid var(--border);cursor:none;">No thanks</button>'+
        '</div>';
    }
    inner+='<button class="site-hint-close" aria-label="Dismiss">×</button>';
    inner+='<div class="site-hint-pointer '+(hint.pointer||'down')+'"></div>';
    inner+='<div class="site-hint-bar"></div>';
    box.innerHTML=inner;
    return box;
  }

  function positionBox(box, hint){
    if(hint.fixedPos){
      box.style.position='fixed';
      if(hint.fixedPos.bottom!==undefined)box.style.bottom=hint.fixedPos.bottom+'px';
      if(hint.fixedPos.right!==undefined)box.style.right=hint.fixedPos.right+'px';
      if(hint.fixedPos.left!==undefined)box.style.left=hint.fixedPos.left+'px';
      if(hint.fixedPos.top!==undefined)box.style.top=hint.fixedPos.top+'px';
      return;
    }
    var rect=getTargetRect(hint);
    if(!rect)return;
    var scrollY=window.pageYOffset, scrollX=window.pageXOffset;
    var top=rect.top+scrollY+(hint.offsetY||0);
    var left=rect.left+scrollX+(hint.offsetX||0);
    box.style.position='absolute';
    box.style.top=top+'px';
    box.style.left=Math.max(8, Math.min(left, window.innerWidth-280))+'px';
  }

  function showHint(hint){
    if(shown.has(hint.id) || activeHint) return;
    shown.add(hint.id);
    activeHint=hint.id;
    hintCount++;
    var isThird=hintCount===3;
    var box=buildHintBox(hint, isThird);
    var scrollHandler=function(){ positionBox(box, hint); };
    positionBox(box, hint);
    document.body.appendChild(box);
    if(!hint.fixedPos) window.addEventListener('scroll', scrollHandler, {passive:true});
    requestAnimationFrame(function(){ box.style.opacity='1'; });

    function dismiss(scheduleNext){
      box.classList.add('hiding');
      if(!hint.fixedPos) window.removeEventListener('scroll', scrollHandler);
      setTimeout(function(){
        if(box.parentNode) box.parentNode.removeChild(box);
        activeHint=null;
        if(scheduleNext!==false && localStorage.getItem('fj-hints-disabled')!=='true'){
          setTimeout(checkHints, BETWEEN_HINTS);
        }
      },380);
    }

    box.querySelector('.site-hint-close').addEventListener('click', function(){ clearTimeout(autoTimer); dismiss(true); });

    if(isThird){
      var yesBtn=box.querySelector('#fj-hint-yes');
      var noBtn=box.querySelector('#fj-hint-no');
      if(yesBtn) yesBtn.addEventListener('click', function(){ localStorage.setItem('fj-hints-disabled','false'); dismiss(true); });
      if(noBtn) noBtn.addEventListener('click', function(){ localStorage.setItem('fj-hints-disabled','true'); dismiss(false); });
    }

    var autoTimer = isThird ? null : setTimeout(function(){ dismiss(true); }, DURATION);
  }

  function checkHints(){
    if(activeHint || localStorage.getItem('fj-hints-disabled')==='true') return;
    var scrollY=window.pageYOffset;
    for(var i=0;i<hints.length;i++){
      var hint=hints[i];
      if(shown.has(hint.id) || activeHint) continue;
      if(hint.triggerScrollY!==undefined && scrollY>=hint.triggerScrollY){ showHint(hint); return; }
      if(hint.triggerElId){
        var el=document.getElementById(hint.triggerElId);
        if(!el) continue;
        var rect=el.getBoundingClientRect();
        if(rect.top<=(hint.triggerOffset||window.innerHeight*0.75)){ showHint(hint); return; }
      }
    }
  }

  setTimeout(function(){
    checkHints();
    window.addEventListener('scroll', checkHints, {passive:true});
  }, FIRST_HINT_DELAY);

  // ===========================
  // SITE SETTINGS — LIVE APPLY
  // ===========================
  (function() {
    const SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
    const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
    const supa = window.supabase ? window.supabase.createClient(SUPA_URL, SUPA_KEY) : null;
    if (!supa) return;
    function applySettings(row) {
      const v = row.value || {};
      if (row.id === 'concierge') {
        document.querySelectorAll('.concierge-name').forEach(el => el.textContent = v.name || el.textContent);
        if (v.whatsapp) {
          const num = v.whatsapp.replace(/\D/g, '');
          document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
            const msg = el.href.split('?text=')[1] || '';
            el.href = 'https://wa.me/' + num + (msg ? '?text=' + msg : '');
          });
          document.querySelectorAll('.whatsapp-fab').forEach(el => {
            const msg = el.href.split('?text=')[1] || '';
            el.href = 'https://wa.me/' + num + (msg ? '?text=' + msg : '');
          });
        }
        document.querySelectorAll('.contact-detail-value').forEach(el => {
          if (el.textContent.includes('@filmaxjambotours') && v.email) el.textContent = v.email;
        });
        document.querySelectorAll('.concierge-bio').forEach(el => {
          if (v.bio) el.textContent = v.bio;
        });
      }
      if (row.id === 'hero') {
        if (v.eyebrow) {
          const ey = document.querySelector('.hero-eyebrow');
          if (ey) ey.textContent = v.eyebrow;
        }
        if (v.subtitle) {
          const sub = document.querySelector('.hero-subtitle');
          if (sub) sub.textContent = v.subtitle;
        }
      }
      if (row.id === 'business') {
        document.querySelectorAll('.contact-detail-value').forEach(el => {
          if (el.textContent.includes('Mon') && v.hours) el.textContent = v.hours;
          if (el.textContent.includes('Nairobi') && v.office) el.textContent = v.office;
        });
        if (v.footer_desc) {
          const fb = document.querySelector('.footer-brand p');
          if (fb) fb.textContent = v.footer_desc;
        }
      }
      if (row.id === 'stats') {
        const statNums   = document.querySelectorAll('.stat-num');
        const statLabels = document.querySelectorAll('.stat-label');
        const vals = [
          { num: v.stat1_num, label: v.stat1_label },
          { num: v.stat2_num, label: v.stat2_label },
          { num: v.stat3_num, label: v.stat3_label },
          { num: v.stat4_num, label: v.stat4_label },
        ];
        vals.forEach((s, i) => {
          if (statNums[i]   && s.num)   statNums[i].textContent   = s.num;
          if (statLabels[i] && s.label) statLabels[i].textContent = s.label;
        });
      }
    }
    async function loadSiteSettings() {
      const { data } = await supa.from('site_settings').select('*');
      if (data) data.forEach(applySettings);
    }
    supa.channel('site-settings-live')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'site_settings'
      }, payload => {
        applySettings(payload.new);
      })
      .subscribe();
    loadSiteSettings();
  })();
})();



// Google Translate periodic fade
(function(){
  var el = document.getElementById('google_translate_element');
  if (!el) return;
  var visible = true;
  var SHOW_DURATION = 12000;  // visible for 12s
  var HIDE_DURATION = 18000;  // hidden for 18s

  function hide() {
    visible = false;
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
    setTimeout(show, HIDE_DURATION);
  }

  function show() {
    // Don't show if a menu/panel is open
    if (document.getElementById('dropdown')?.classList.contains('open')) { setTimeout(show, 3000); return; }
    if (document.getElementById('authOverlay')?.style.display === 'flex') { setTimeout(show, 3000); return; }
    if (document.getElementById('profileOverlay')?.classList.contains('open')) { setTimeout(show, 3000); return; }
    visible = true;
    el.style.opacity = '1';
    el.style.pointerEvents = '';
    setTimeout(hide, SHOW_DURATION);
  }

  // Start cycle after 8 seconds on page
  setTimeout(function(){
    hide();
  }, 8000);
})();


/* ── LOADER ENHANCEMENT ── runs only on first-ever load of the session ── */
(function () {
  if (!window._fjt_fresh) return;

  /* Progress bar — fills over 4.1 s matching the existing 4200 ms loader hold */
  var prog = document.createElement('div');
  prog.className = 'fjt-ldr-progress';
  document.body.appendChild(prog);

  /* Tagline — fades in after the logo settles (~0.9 s) */
  var tag = document.createElement('div');
  tag.className = 'fjt-ldr-tagline';
  tag.textContent = 'Kenya Awaits';
  document.body.appendChild(tag);

  /* Start progress animation on next paint */
  requestAnimationFrame(function () {
    prog.style.transition = 'width 4.05s cubic-bezier(0.25, 0.1, 0.4, 1)';
    prog.style.width = '100%';
    setTimeout(function () { tag.classList.add('fjt-ldr-tag-vis'); }, 900);
  });

  /* Fade out both elements just before the paper-tear fires (4200 ms) */
  setTimeout(function () {
    prog.style.transition = 'opacity 0.4s ease';
    prog.style.opacity    = '0';
    tag.style.transition  = 'color 0.4s ease';
    tag.classList.remove('fjt-ldr-tag-vis');
    setTimeout(function () {
      if (prog.parentNode) prog.remove();
      if (tag.parentNode)  tag.remove();
    }, 500);
  }, 3900);
})();

// ===========================
// HOMEPAGE PACKAGE CARDS (dynamic, Supabase-backed)
// ===========================
(function(){
  var SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
  var grid = document.getElementById('packagesGrid');
  if (!grid) return;
  var filterBar = document.getElementById('pkgFilterBar');
  var filterLabel = document.getElementById('pkgFilterLabel');
  var glow = document.getElementById('pkgFilterGlow');
  var allPackages = [];
  var rotateIndex = 0;
  var rotateTimer = null;

  function cardHTML(pkg) {
    var price = pkg.price_high_season || pkg.price_duo || 0;
    var detailPage = pkg.detail_page_url || ('/packages/' + pkg.slug + '/');
    var badge = pkg.badge || null;
    var duration = pkg.duration_days ? (pkg.duration_days + ' Days · ' + (pkg.duration_nights||'') + ' Nights') : '';
    var highlights = pkg.short_highlights || [];
    var destinations = pkg.destinations || [];
    return '' +
      '<img class="pkg-bg" src="' + (pkg.card_bg_image_url || pkg.hero_image_url || '') + '" alt="" loading="lazy">' +
      '<div class="pkg-bg-overlay"></div>' +
      (badge ? '<span class="pkg-badge">' + badge + '</span>' : '') +
      '<span class="pkg-duration">' + duration + '</span>' +
      '<h3 class="pkg-name">' + (pkg.name||'') + '</h3>' +
      (pkg.tagline ? '<p class="pkg-tagline">' + pkg.tagline + '</p>' : '') +
      '<div class="divider"></div>' +
      '<div class="pkg-price">$' + Number(price).toLocaleString() + ' <span>/ person</span></div>' +
      (destinations.length ? '<div class="pkg-destinations">' + destinations.map(function(d){return '<span class="dest-tag">'+d+'</span>';}).join('') + '</div>' : '') +
      '<ul class="pkg-features">' + highlights.slice(0,4).map(function(h){return '<li>'+h+'</li>';}).join('') + '</ul>' +
      '<a href="' + detailPage + '" class="pkg-cta">Unveil This Journey</a>';
  }

  function renderThree(list) {
    var ids = ['pkgCard0','pkgCard1','pkgCard2'];
    ids.forEach(function(id, i) {
      var el = document.getElementById(id);
      if (!el) return;
      var pkg = list[i];
      if (pkg) { el.innerHTML = cardHTML(pkg); el.style.display = ''; }
      else { el.innerHTML = ''; el.style.display = 'none'; }
    });
  }

  function applyFilter(tier) {
    var filtered = tier === 'all' ? allPackages : allPackages.filter(function(p){ return p.tier === tier; });
    rotateIndex = 0;
    renderThree(filtered.slice(0, 3));
    if (filterLabel) {
      var label = tier === 'all' ? 'Showing all collections' :
        'Showing ' + filtered.length + ' ' + tier + ' collection' + (filtered.length===1?'':'s');
      filterLabel.textContent = label;
    }
    clearInterval(rotateTimer);
    if (filtered.length > 3) {
      rotateTimer = setInterval(function(){
        rotateIndex = (rotateIndex + 3) % filtered.length;
        var next = filtered.slice(rotateIndex, rotateIndex + 3);
        if (next.length < 3) next = next.concat(filtered.slice(0, 3 - next.length));
        renderThree(next);
      }, 6000);
    }
  }

  if (filterBar) {
    filterBar.querySelectorAll('.pkg-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBar.querySelectorAll('.pkg-filter-btn').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        applyFilter(btn.dataset.filter);
      });
    });
  }

  fetch(SUPA_URL + '/rest/v1/packages?select=*&is_published=eq.true&order=created_at.desc', {
    headers: { 'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY }
  })
  .then(function(r){ return r.json(); })
  .then(function(data){
    allPackages = Array.isArray(data) ? data : [];
    applyFilter('all');
  })
  .catch(function(){ /* fail silently — cards stay empty rather than broken */ });
})();
