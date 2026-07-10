
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

(function(){
  var container = document.getElementById('hintsContainer');
  var shown = new Set();
  var DURATION = 5000;
  var BETWEEN_HINTS = 4000;
  var activeHint = null;

  var hints = [
    {
      id: 'tabs-hint',
      label: 'Navigate',
      text: 'Use these tabs to explore the full itinerary, rates, accommodation and how to get here.',
      targetId: 'pkgTabsWrapper',
      pointer: 'up',
      offsetX: 0, offsetY: 8,
      triggerElId: 'pkgTabsWrapper',
      triggerOffset: 90
    },
    {
      id: 'calendar-hint',
      label: 'Tip',
      text: 'Select your travel date — the sidebar quote updates live with seasonal pricing.',
      targetId: 'sqDateInput',
      pointer: 'down',
      offsetX: 0, offsetY: -58,
      triggerElId: 'sqDateInput',
      triggerOffset: window.innerHeight * 0.9
    },
    {
      id: 'itinerary-hint',
      label: 'Did you know',
      text: 'Click any day to expand it — each day includes images, activities and lodge details.',
      targetId: 'fjt-day-1',
      pointer: 'up',
      offsetX: 0, offsetY: 8,
      triggerElId: 'panel-itinerary',
      triggerOffset: window.innerHeight * 0.85
    },
    {
      id: 'reserve-hint',
      label: 'Book now',
      text: 'Hit "Reserve This Journey" to lock in your dates — 30% deposit secures everything.',
      targetId: 'sidebarReserveBtn',
      pointer: 'down',
      offsetX: 0, offsetY: -58,
      triggerScrollY: 1800
    },
    {
      id: 'whatsapp-hint',
      label: 'Quick action',
      text: 'Prefer to chat? Tap WhatsApp and we respond within the hour.',
      fixedPos: { bottom: 104, right: 100 },
      pointer: 'right',
      triggerScrollY: 2400
    }
  ];

  function showHint(hint) {
    if (shown.has(hint.id) || activeHint) return;
    shown.add(hint.id);
    activeHint = hint.id;
    var box = document.createElement('div');
    box.className = 'site-hint';
    box.innerHTML =
      '<span class="site-hint-label">' + hint.label + '</span>' +
      '<span class="site-hint-text">' + hint.text + '</span>' +
      '<button class="site-hint-close" aria-label="Dismiss">×</button>' +
      '<div class="site-hint-pointer ' + (hint.pointer||'down') + '"></div>' +
      '<div class="site-hint-bar"></div>';

    function positionBox() {
      if (hint.fixedPos) {
        box.style.position = 'fixed';
        if (hint.fixedPos.bottom !== undefined) box.style.bottom = hint.fixedPos.bottom + 'px';
        if (hint.fixedPos.right  !== undefined) box.style.right  = hint.fixedPos.right  + 'px';
        return;
      }
      var el = hint.targetId ? document.getElementById(hint.targetId) : null;
      if (!el) return;
      var rect = el.getBoundingClientRect();
      box.style.position = 'absolute';
      box.style.top  = (rect.top + window.pageYOffset + (hint.offsetY||0)) + 'px';
      box.style.left = Math.max(8, Math.min(rect.left + window.pageXOffset + (hint.offsetX||0), window.innerWidth - 256)) + 'px';
    }

    positionBox();
    container.appendChild(box);
    window.addEventListener('scroll', positionBox, { passive: true });

    function dismiss() {
      box.classList.add('hiding');
      window.removeEventListener('scroll', positionBox);
      setTimeout(function(){
        if (box.parentNode) box.parentNode.removeChild(box);
        activeHint = null;
        setTimeout(checkHints, BETWEEN_HINTS);
      }, 380);
    }
    var autoTimer = setTimeout(dismiss, DURATION);
    box.querySelector('.site-hint-close').addEventListener('click', function(){ clearTimeout(autoTimer); dismiss(); });
  }

  function checkHints() {
    if (activeHint) return;
    var scrollY = window.pageYOffset;
    hints.forEach(function(hint){
      if (shown.has(hint.id) || activeHint) return;
      if (hint.triggerScrollY && scrollY >= hint.triggerScrollY) { showHint(hint); return; }
      if (hint.triggerElId) {
        var el = document.getElementById(hint.triggerElId);
        if (!el) return;
        var rect = el.getBoundingClientRect();
        if (rect.top <= (hint.triggerOffset || window.innerHeight * 0.75)) showHint(hint);
      }
    });
  }

  window.addEventListener('scroll', checkHints, { passive: true });
  setTimeout(checkHints, 1500);
})();


function initKenyaMap() {
  var map = new google.maps.Map(document.getElementById('kenya-google-map'), {
    center: { lat: -1.2, lng: 37.8 },
    zoom: 6,
    disableDefaultUI: true,
    gestureHandling: 'none',
    keyboardShortcuts: false,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#0d0d0d' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#8a8074' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#080808' }] },
      { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#d4af37' }, { weight: 1.5 }] },
      { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#d4af3755' }, { weight: 0.5 }] },
      { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#111111' }] },
      { featureType: 'road', stylers: [{ visibility: 'off' }] },
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0a14' }] },
      { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6eb0c855' }] }
    ]
  });

  var stops = [
    { lat: -1.2921,  lng: 36.8219,  color: '#d4af37', name: 'NAIROBI',     sub: 'Start & End — Wilson Airport' },
    { lat: -1.5477,  lng: 35.1697,  color: '#e8884a', name: 'MAASAI MARA', sub: 'Days 1–2 — Sekenani Gate' },
    { lat: -2.6527,  lng: 37.2606,  color: '#7bb56e', name: 'AMBOSELI',    sub: 'Days 3–4 — Kimana Gate' },
    { lat: 0.5833,   lng: 37.5333,  color: '#6eb0c8', name: 'SAMBURU',     sub: 'Days 5–6 — Reserve Main Gate' },
    { lat: -4.2765,  lng: 39.5942,  color: '#9b6fd4', name: 'DIANI BEACH', sub: 'Days 7–8 — Beach Access' }
  ];

  // Draw route line
  var routePath = new google.maps.Polyline({
    path: stops.map(function(s){ return { lat: s.lat, lng: s.lng }; }),
    geodesic: true,
    strokeColor: 'rgba(212,175,55,0.6)',
    strokeOpacity: 0,
    strokeWeight: 2,
    icons: [{
      icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.6, strokeColor: '#d4af37', scale: 3 },
      offset: '0',
      repeat: '12px'
    }]
  });
  routePath.setMap(map);

  // Place markers
  stops.forEach(function(stop) {
    var marker = new google.maps.Marker({
      position: { lat: stop.lat, lng: stop.lng },
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: stop.color,
        fillOpacity: 1,
        strokeColor: 'rgba(255,255,255,0.3)',
        strokeWeight: 2
      }
    });

var infoContent =
      '<div style="' +
        'background:rgba(8,8,8,0.82);' +
        'border-left:2px solid ' + stop.color + ';' +
        'padding:5px 10px 5px 8px;' +
        'font-family:Jost,sans-serif;' +
        'backdrop-filter:blur(8px);' +
        'box-shadow:0 2px 12px rgba(0,0,0,0.6);' +
        'line-height:1.3;' +
        'pointer-events:none;' +
      '">' +
      '<div style="' +
        'font-size:8px;' +
        'letter-spacing:2.5px;' +
        'text-transform:uppercase;' +
        'color:' + stop.color + ';' +
        'font-weight:500;' +
      '">' + stop.name + '</div>' +
      '<div style="' +
        'font-size:7px;' +
        'color:rgba(255,255,255,0.35);' +
        'margin-top:2px;' +
        'letter-spacing:1.5px;' +
        'text-transform:uppercase;' +
      '">' + stop.sub.split('—')[0].trim() + '</div>' +
      '</div>';

    var infoWindow = new google.maps.InfoWindow({
      content: infoContent,
      disableAutoPan: true,
      pixelOffset: new google.maps.Size(0, -2)
    });

    infoWindow.open(map, marker);

    // Click marker to open Google Maps directions to the exact gate
    marker.addListener('click', function() {
      window.open('https://www.google.com/maps/search/?api=1&query=' + stop.lat + ',' + stop.lng, '_blank');
    });

    // Change cursor to pointer on hover
    marker.addListener('mouseover', function() {
      map.getDiv().style.cursor = 'pointer';
    });
    marker.addListener('mouseout', function() {
      map.getDiv().style.cursor = '';
    });
  }); 

  // Re-render when overview tab clicked
  document.querySelectorAll('.pkg-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      if (this.dataset.tab === 'overview') {
        setTimeout(function(){
          google.maps.event.trigger(map, 'resize');
        }, 350);
      }
    });
  });
}


// ── Custom cursor ──
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});
function animateRing() {
  rx += (mx - rx) * .12; ry += (my - ry) * .12;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();
document.querySelectorAll('a,button,.pkg-highlight-item,.related-card,.day-header').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '20px'; cursor.style.height = '20px';
    ring.style.width = '60px'; ring.style.height = '60px';
    ring.style.borderColor = 'rgba(212,175,55,.8)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '12px'; cursor.style.height = '12px';
    ring.style.width = '40px'; ring.style.height = '40px';
    ring.style.borderColor = 'rgba(212,175,55,.5)';
  });
});

// ── Navbar scroll ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ── Reveal on scroll ──
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: .06, rootMargin: '0px 0px -30px 0px' });
reveals.forEach(el => revealObserver.observe(el));

// ── TAB SWITCHING ──
const tabs = document.querySelectorAll('.pkg-tab');
const panels = document.querySelectorAll('.pkg-tab-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', function() {
    const target = this.dataset.tab;

    if (window.innerWidth <= 1100) {
      // MOBILE: all panels are visible and stacked.
      // Just update the active tab highlight and scroll to the section.
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      const panel = document.getElementById('panel-' + target);
      if (panel) {
        // Trigger reveal animations for anything not yet visible in this panel
        panel.querySelectorAll('.reveal').forEach(el => {
          if (!el.classList.contains('visible')) {
            setTimeout(() => el.classList.add('visible'), 80);
          }
        });

        // Scroll to panel, accounting for sticky tab bar height (~110px)
        setTimeout(function() {
          const panelTop = panel.getBoundingClientRect().top + window.pageYOffset - 110;
          window.scrollTo({ top: panelTop, behavior: 'smooth' });
        }, 50);
      }

    } else {
      // DESKTOP: original panel switching behaviour
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      this.classList.add('active');
      const panel = document.getElementById('panel-' + target);
      if (panel) {
        panel.classList.add('active');
        if (target === 'itinerary') {
          document.querySelectorAll('.itinerary-day.open').forEach(function(d) {
            d.classList.remove('open');
          });
        }
        panel.querySelectorAll('.reveal').forEach(el => {
          if (!el.classList.contains('visible')) {
            setTimeout(() => el.classList.add('visible'), 80);
          }
        });
      }

      const pkgMain = document.getElementById('pkgMain');
      if (pkgMain) {
        const top = pkgMain.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    }
  });
});

// ── MOBILE TAB BAR FIXED BEHAVIOUR ──
(function(){
  var tabsWrapper = document.getElementById('pkgTabsWrapper');
  var pkgMain = document.getElementById('pkgMain');
  var pkgRelated = document.querySelector('.pkg-related');
  if (!tabsWrapper || !pkgMain) return;

  function onScroll() {
    if (window.innerWidth > 1100) {
      tabsWrapper.classList.remove('pkg-tabs-fixed');
      return;
    }
    var mainRect = pkgMain.getBoundingClientRect();
    var relatedRect = pkgRelated ? pkgRelated.getBoundingClientRect() : { top: 99999 };
    if (mainRect.top <= 72 && relatedRect.top > 72) {
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
document.querySelectorAll('.itinerary-day').forEach(function(day) {
  day.classList.remove('open');
});
document.querySelectorAll('.day-header').forEach(function(header) {
  header.addEventListener('click', function() {
    var day = header.closest('.itinerary-day');
    if (!day) return;
    if (day.classList.contains('open')) {
      day.classList.remove('open');
    } else {
      day.classList.add('open');
    }
  });
});


(function() {
  'use strict';

  // ── Season rules ──
  // month index 0=Jan
  const SEASONS = {
    peak:  [6,7,8,9],       // Jul Aug Sep Oct
    high:  [0,1,5,10,11],   // Jan Feb Jun Nov Dec
    green: [2,3,4]          // Mar Apr May
  };
  const RATES = { peak: 18500, high: 16500, green: 13800 };
  const SEASON_NAMES = { peak: 'Peak Season', high: 'High Season', green: 'Green Season' };

  function getSeasonForMonth(m) {
    if (SEASONS.peak.includes(m))  return 'peak';
    if (SEASONS.green.includes(m)) return 'green';
    return 'high';
  }

  // ── State ──
  let state = {
    adults: 1,
    children: 0,
    childAges: [],
    selectedDate: null,
    season: 'high',
    baseRate: 16500
  };

  // ── Calendar ──
  let calView = { year: new Date().getFullYear(), month: new Date().getMonth() };
  const calEl      = document.getElementById('sqCalendar');
  const dateInput  = document.getElementById('sqDateInput');
  const calGrid    = document.getElementById('sqCalGrid');
  const calMonthEl = document.getElementById('sqCalMonth');
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function renderCalendar() {
    const { year, month } = calView;
    calMonthEl.textContent = MONTHS[month] + ' ' + year;
    const first = new Date(year, month, 1).getDay();
    const days  = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    calGrid.innerHTML = '';

    for (let i = 0; i < first; i++) {
      const blank = document.createElement('div');
      blank.className = 'sq-cal-day empty';
      calGrid.appendChild(blank);
    }
    for (let d = 1; d <= days; d++) {
      const cell  = document.createElement('div');
      const date  = new Date(year, month, d);
      const season = getSeasonForMonth(month);
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = state.selectedDate && date.toDateString() === state.selectedDate.toDateString();
      cell.className = 'sq-cal-day' +
        (isPast ? ' past' : '') +
        (isToday ? ' today' : '') +
        (isSelected ? ' selected' : '') +
        (season === 'peak' ? ' peak' : season === 'green' ? ' green-season' : ' high');
      cell.textContent = d;
      if (!isPast) {
        cell.addEventListener('click', function() {
          state.selectedDate = date;
          state.season = season;
          state.baseRate = RATES[season];
          const formatted = d + ' ' + MONTHS[month].slice(0,3) + ' ' + year;
          dateInput.value = formatted;
          calEl.classList.remove('open');
          dateInput.classList.remove('open');
          renderCalendar();
          updateQuote();
        });
      }
      calGrid.appendChild(cell);
    }
  }

  dateInput.addEventListener('click', function() {
    calEl.classList.toggle('open');
    dateInput.classList.toggle('open');
    renderCalendar();
  });
  document.addEventListener('click', function(e) {
    if (!calEl.contains(e.target) && e.target !== dateInput) {
      calEl.classList.remove('open');
      dateInput.classList.remove('open');
    }
  });
  document.getElementById('sqCalPrev').addEventListener('click', function(e) {
    e.stopPropagation();
    calView.month--;
    if (calView.month < 0) { calView.month = 11; calView.year--; }
    renderCalendar();
  });
  document.getElementById('sqCalNext').addEventListener('click', function(e) {
    e.stopPropagation();
    calView.month++;
    if (calView.month > 11) { calView.month = 0; calView.year++; }
    renderCalendar();
  });

  // ── Adults counter ──
  document.getElementById('sqAdultMinus').addEventListener('click', function() {
    if (state.adults > 1) { state.adults--; updateQuote(); }
  });
  document.getElementById('sqAdultPlus').addEventListener('click', function() {
    if (state.adults < 4) { state.adults++; updateQuote(); }
  });

  // ── Children toggle ──
  const childToggle  = document.getElementById('sqChildToggle');
  const childSection = document.getElementById('sqChildSection');
  childToggle.addEventListener('change', function() {
    if (this.checked) {
      childSection.classList.add('open');
      if (state.children === 0) state.children = 1;
    } else {
      childSection.classList.remove('open');
      state.children = 0;
      state.childAges = [];
    }
    renderChildAges();
    updateQuote();
  });

  // ── Children counter ──
  document.getElementById('sqChildMinus').addEventListener('click', function() {
    if (state.children > 1) { state.children--; renderChildAges(); updateQuote(); }
  });
  document.getElementById('sqChildPlus').addEventListener('click', function() {
    if (state.children < 6) { state.children++; renderChildAges(); updateQuote(); }
  });

  function renderChildAges() {
    document.getElementById('sqChildVal').textContent = state.children;
    const container = document.getElementById('sqChildAges');
    container.innerHTML = '';
    for (let i = 0; i < state.children; i++) {
      const row = document.createElement('div');
      row.className = 'sq-child-age-row';
      const label = document.createElement('span');
      label.className = 'sq-child-age-label';
      label.textContent = 'Child ' + (i + 1) + ' age';
      const select = document.createElement('select');
      select.className = 'sq-child-age-select';
      select.innerHTML = '<option value="">Select age</option>';
      for (let a = 0; a <= 17; a++) {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a === 0 ? 'Under 1' : a + ' yrs';
        if (state.childAges[i] !== undefined && state.childAges[i] == a) opt.selected = true;
        select.appendChild(opt);
      }
      const idx = i;
      select.addEventListener('change', function() {
        state.childAges[idx] = parseInt(this.value);
        updateQuote();
      });
      row.appendChild(label);
      row.appendChild(select);
      container.appendChild(row);
    }
  }

  // ── Pricing logic ──
  function getChildRate(age) {
    if (isNaN(age) || age < 5)  return 0;
    if (age < 12) return state.baseRate * 0.5;
    return state.baseRate;
  }

 function setEl(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }
  function setStyle(id, prop, value) {
    var el = document.getElementById(id);
    if (el) el.style[prop] = value;
  }

  function updateQuote() {
    var adultTotal = state.adults * state.baseRate;
    var childTotal = 0;
    for (var i = 0; i < state.children; i++) {
      childTotal += getChildRate(state.childAges[i] !== undefined ? state.childAges[i] : NaN);
    }
    var grandTotal = adultTotal + childTotal;
    var deposit    = Math.round(grandTotal * 0.3);

    setEl('sqAdultVal',  state.adults);
    setEl('sqPriceNum',  '$' + state.baseRate.toLocaleString());
    setEl('sqSeason',    SEASON_NAMES[state.season]);
    setEl('sqTotal',     '$' + grandTotal.toLocaleString());
    setEl('sqAdultTotal','$' + adultTotal.toLocaleString());
    setEl('sqDeposit',   '$' + deposit.toLocaleString());

    var totalEl = document.getElementById('sqTotal');
    if (totalEl) flash(totalEl);

    var firstRow = document.querySelector('#sqBreakdown .sq-breakdown-row:first-child span:first-child');
    if (firstRow) firstRow.textContent = 'Adults (' + state.adults + ' × $' + state.baseRate.toLocaleString() + ')';

    var childRow = document.getElementById('sqChildRow');
    if (childRow) {
      if (state.children > 0 && childTotal > 0) {
        childRow.style.display = 'flex';
        setEl('sqChildLabel', 'Children (' + state.children + ')');
        setEl('sqChildTotal', '$' + childTotal.toLocaleString());
      } else {
        childRow.style.display = 'none';
      }
    }

    var mobilePrice = document.querySelector('.mobile-book-price-num');
    if (mobilePrice) mobilePrice.textContent = '$' + grandTotal.toLocaleString();

    var mobilePriceLabel = document.querySelector('.mobile-book-price-label');
    if (mobilePriceLabel) mobilePriceLabel.textContent = 'estimated total';

    var waLink = document.querySelector('.btn-whatsapp');
    if (waLink) {
      var msg = encodeURIComponent(
        'Hello, I\'d like to enquire about the Aerial Kenya 8-Day Safari.\n' +
        'Date: ' + (dateInput.value || 'TBC') + '\n' +
        'Adults: ' + state.adults + '\n' +
        (state.children > 0 ? 'Children: ' + state.children + '\n' : '') +
        'Estimated Total: $' + grandTotal.toLocaleString()
      );
      waLink.href = 'https://wa.me/34672304384?text=' + msg;
    }
  }

  function flash(el) {
    el.classList.remove('price-flash');
    void el.offsetWidth;
    el.classList.add('price-flash');
  }

  // Init
  renderCalendar();
  updateQuote();

})();

// ── Activity button navigation ──
function actNav(tabTarget, highlightId) {
  var isMobile = window.innerWidth <= 1100;
  var tabs = document.querySelectorAll('.pkg-tab');
  var panels = document.querySelectorAll('.pkg-tab-panel');
  var targetPanel = document.getElementById('panel-' + tabTarget);
  if (!targetPanel) return;

  if (isMobile) {
    tabs.forEach(function(t) { t.classList.remove('active'); });
    var activeTab = Array.from(tabs).find(function(t) { return t.dataset.tab === tabTarget; });
    if (activeTab) activeTab.classList.add('active');
    targetPanel.querySelectorAll('.reveal').forEach(function(el) { el.classList.add('visible'); });

    var tabsWrapper = document.getElementById('pkgTabsWrapper');
    var offset = (tabsWrapper ? tabsWrapper.offsetHeight : 60) + 62 + 24;
    var scrollEl = highlightId ? document.getElementById(highlightId) : targetPanel;
    if (!scrollEl) scrollEl = targetPanel;

    setTimeout(function() {
      var top = scrollEl.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
      if (highlightId) { pulseElement(highlightId); }
    }, 80);

  } else {
    tabs.forEach(function(t) { t.classList.remove('active'); });
    panels.forEach(function(p) { p.classList.remove('active'); });
    var activeTab2 = Array.from(tabs).find(function(t) { return t.dataset.tab === tabTarget; });
    if (activeTab2) activeTab2.classList.add('active');
    targetPanel.classList.add('active');
    targetPanel.querySelectorAll('.reveal').forEach(function(el) { el.classList.add('visible'); });

    var scrollEl2 = highlightId ? document.getElementById(highlightId) : null;
    var top2 = scrollEl2
      ? scrollEl2.getBoundingClientRect().top + window.pageYOffset - 140
      : (document.getElementById('pkgMain') ? document.getElementById('pkgMain').getBoundingClientRect().top + window.pageYOffset - 80 : 0);

    window.scrollTo({ top: top2, behavior: 'smooth' });
    if (highlightId) {
      setTimeout(function() { pulseElement(highlightId); }, 450);
    }
  }
}

function pulseElement(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.style.transition = 'box-shadow 0.4s ease';
  el.style.boxShadow = '0 0 0 2px rgba(212,175,55,0.7), 0 0 28px rgba(212,175,55,0.2)';
  setTimeout(function() { el.style.boxShadow = ''; }, 2200);
}


// MOBILE SCROLL SPY — highlights the correct tab as user scrolls through stacked panels
(function () {
  var panels     = Array.from(document.querySelectorAll('.pkg-tab-panel'));
  var tabs       = Array.from(document.querySelectorAll('.pkg-tab'));
  var tabsWrapper = document.getElementById('pkgTabsWrapper');
  var pkgMain    = document.getElementById('pkgMain');

  function getTabForPanel(panel) {
    var id = panel.id.replace('panel-', '');
    return tabs.find(function(t){ return t.dataset.tab === id; });
  }

  function onScroll() {
    if (window.innerWidth > 1100) return;

    // Once user scrolls past pkg-main entirely, do nothing — stop touching tabs
    if (pkgMain) {
      var mainBottom = pkgMain.getBoundingClientRect().bottom;
      if (mainBottom < 0) return;
    }

    var stickyOffset = (tabsWrapper ? tabsWrapper.offsetHeight : 60) + 62 + 20;
    var current = null;

    panels.forEach(function (panel) {
      var rect = panel.getBoundingClientRect();
      if (rect.top <= stickyOffset) {
        current = panel;
      }
    });

    if (current) {
      tabs.forEach(function(t){ t.classList.remove('active'); });
      var activeTab = getTabForPanel(current);
      if (activeTab) {
        activeTab.classList.add('active');
        var tabsEl = tabsWrapper ? tabsWrapper.querySelector('.pkg-tabs') : null;
if (tabsEl) {
  var tabLeft = activeTab.offsetLeft;
  var tabWidth = activeTab.offsetWidth;
  var containerWidth = tabsEl.offsetWidth;
  var scrollTarget = tabLeft - (containerWidth / 2) + (tabWidth / 2);
  tabsEl.scrollLeft = scrollTarget;
}
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
})();


// ── Build reserve.html URL with package summary params ──
(function() {
  var SEASON_NAMES = { peak: 'Peak Season', high: 'High Season', green: 'Green Season' };
  var RATES = { peak: 18500, high: 16500, green: 13800 };

  // Read the current quote state from the sidebar widget
  function getQuoteState() {
    var priceText = document.getElementById('sqPriceNum') ? document.getElementById('sqPriceNum').textContent : '';
    var seasonText = document.getElementById('sqSeason') ? document.getElementById('sqSeason').textContent : 'High Season';
    var adults = document.getElementById('sqAdultVal') ? document.getElementById('sqAdultVal').textContent : '2';
    var totalText = document.getElementById('sqTotal') ? document.getElementById('sqTotal').textContent : '';
    var dateText = document.getElementById('sqDateInput') ? document.getElementById('sqDateInput').value : '';
    var childToggle = document.getElementById('sqChildToggle');
    var childVal = document.getElementById('sqChildVal') ? document.getElementById('sqChildVal').textContent : '0';

    var travellers = adults + ' adult' + (parseInt(adults) !== 1 ? 's' : '');
    if (childToggle && childToggle.checked) {
      travellers += ', ' + childVal + ' child' + (parseInt(childVal) !== 1 ? 'ren' : '');
    }

    return {
      pkg:        'Aerial Kenya — 8 Days',
      tagline:    'Kenya From the Sky Down',
      duration:   '8 Days · 7 Nights',
      date:       dateText || 'To be confirmed',
      travellers: travellers,
      season:     seasonText,
      category:   'Ultra Luxury',
      total:      totalText || 'Quote on request',
      ref:        'pkg-aerial-kenya.html'
    };
  }

  function buildURL() {
    var s = getQuoteState();
    var p = new URLSearchParams(s);
    return 'reserve.html?' + p.toString();
  }

  function updateAllButtons() {
    var url = buildURL();
    ['sidebarReserveBtn','mobileReserveBtn','mobileBarBtn'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.href = url;
    });
  }

  // Update on any interaction with the quote widget
  var widget = document.querySelector('.sidebar-card');
  if (widget) {
    widget.addEventListener('click', function() { setTimeout(updateAllButtons, 50); });
    widget.addEventListener('change', updateAllButtons);
  }

  // Also update on date selection and counter clicks
  ['sqAdultMinus','sqAdultPlus','sqChildMinus','sqChildPlus','sqCalPrev','sqCalNext'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', function() { setTimeout(updateAllButtons, 100); });
  });

  // Init
  updateAllButtons();
})();


(function(){
  var SUPA_URL='https://kwriicxzkgkcseorcqdi.supabase.co';
  var SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
  var _supa=window.supabase?window.supabase.createClient(SUPA_URL,SUPA_KEY):null;
  var _pmScrollY=0,_pmIsOpen=false,_pmLoaded=false,_fjCurrentUser=null;
  if(_supa){_supa.auth.getSession().then(function(r){if(r.data&&r.data.session)_fjCurrentUser=r.data.session.user;});_supa.auth.onAuthStateChange(function(e,s){_fjCurrentUser=s?s.user:null;});}
  window._openProfile=function(){if(!_fjCurrentUser){window._openAuth&&window._openAuth('signin');return;}if(_pmIsOpen)return;_pmIsOpen=true;_pmScrollY=window.scrollY;document.body.style.position='fixed';document.body.style.top='-'+_pmScrollY+'px';document.body.style.left='0';document.body.style.right='0';document.body.style.overflow='hidden';var ov=document.getElementById('profileModalOverlay');ov.style.display='flex';requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add('open');});});var fr=document.getElementById('profileModalIframe');var ld=document.getElementById('profileModalLoader');if(!_pmLoaded){fr.onload=function(){_pmLoaded=true;setTimeout(function(){if(ld)ld.style.opacity='0';},280);};fr.src='profile.html';}else{if(ld)ld.style.opacity='0';}};
  function _pmDoClose(){clearTimeout(window._pmCloseTimer);if(!_pmIsOpen)return;_pmIsOpen=false;var ov=document.getElementById('profileModalOverlay');ov.classList.remove('open');setTimeout(function(){ov.style.display='none';document.body.style.position='';document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.overflow='';window.scrollTo({top:_pmScrollY,behavior:'instant'});},460);}
  window._closeProfileModal=function(){if(!_pmIsOpen)return;var fr=document.getElementById('profileModalIframe');if(fr&&fr.contentWindow){try{fr.contentWindow.postMessage({type:'FJ_PROFILE_CHECK_DIRTY'},'*');clearTimeout(window._pmCloseTimer);window._pmCloseTimer=setTimeout(_pmDoClose,250);return;}catch(_){}}; _pmDoClose();};
  window.addEventListener('message',function(e){if(!e.data||typeof e.data!=='object')return;if(e.data.type==='FJ_PROFILE_DIRTY_RESPONSE'){clearTimeout(window._pmCloseTimer);if(e.data.dirty){try{document.getElementById('profileModalIframe').contentWindow.postMessage({type:'FJ_PROFILE_REQUEST_CLOSE'},'*');}catch(_){}}else _pmDoClose();}if(e.data.type==='FJ_PROFILE_CLOSE_CONFIRMED'||e.data.type==='FJ_PROFILE_NAVIGATE_AWAY')_pmDoClose();if(e.data.type==='FJ_PROFILE_SIGNED_OUT'){_pmDoClose();_fjCurrentUser=null;}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&_pmIsOpen)window._closeProfileModal();});
  document.getElementById('profileModalOverlay')?.addEventListener('click',function(e){if(e.target===this)window._closeProfileModal();});
})();
