
  const SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Flb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
  const supa = supabase.createClient(SUPA_URL, SUPA_KEY);


  const urlParams = new URLSearchParams(window.location.search);
const destFilter = urlParams.get('destination');

const destinationMap = {
  'maasai-mara':  ['mara'],
  'diani-beach':  ['coastal'],
  'amboseli':     ['amboseli'],
  'lake-nakuru':  ['lakes'],
  'mount-kenya':  ['lakes'],
  'samburu':      ['samburu'],
  'tsavo':        ['tsavo'],
};

const destLabels = {
  'maasai-mara': 'Maasai Mara',
  'diani-beach': 'Diani Beach',
  'amboseli':    'Amboseli',
  'lake-nakuru': 'Lake Nakuru',
  'mount-kenya': 'Mount Kenya',
  'samburu':     'Samburu',
  'tsavo':       'Tsavo',
};
// Cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});
function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();
document.querySelectorAll('a, button, .pkg-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '20px'; cursor.style.height = '20px';
    ring.style.width = '60px'; ring.style.height = '60px';
    ring.style.borderColor = 'rgba(212,175,55,0.8)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '12px'; cursor.style.height = '12px';
    ring.style.width = '40px'; ring.style.height = '40px';
    ring.style.borderColor = 'rgba(212,175,55,0.5)';
  });
});

// Nav scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
reveals.forEach(el => observer.observe(el));

// ── ADVANCED FILTER SYSTEM ──────────────────────────────

// Data tags on each card — maps card names to filter attributes
const cardData = [
  // Classic
  { name: 'Grand Odyssey',               price: 6500,  days: 7,  destinations: ['mara','amboseli','samburu'], styles: ['classic','luxury'],     groups: ['couple','private','small-group'] },
  { name: 'Mara Awakening',              price: 2800,  days: 4,  destinations: ['mara'],                      styles: ['classic'],              groups: ['couple','solo','family','small-group'] },
  { name: 'Ultimate Kenya',              price: 11200, days: 10, destinations: ['mara','amboseli','samburu'], styles: ['classic','luxury'],     groups: ['couple','private'] },
  { name: 'Tsavo Red Earth',             price: 3400,  days: 5,  destinations: ['tsavo'],                     styles: ['classic'],              groups: ['couple','family','small-group'] },
  { name: 'Samburu Secrets',             price: 3100,  days: 4,  destinations: ['samburu'],                   styles: ['classic'],              groups: ['couple','solo','small-group'] },
  // Luxury
  { name: 'Private Conservancy Sojourn', price: 14800, days: 6,  destinations: ['mara'],                      styles: ['luxury'],               groups: ['couple','private'] },
  { name: 'Migration Witness',           price: 8900,  days: 5,  destinations: ['mara'],                      styles: ['luxury'],               groups: ['couple','private','small-group'] },
  { name: 'Aerial Kenya',                price: 16500, days: 8,  destinations: ['mara','amboseli','coastal'], styles: ['luxury'],               groups: ['couple','private'] },
  // Coastal
  { name: 'Safari & Sea',                price: 5600,  days: 8,  destinations: ['mara','coastal'],            styles: ['classic','coastal'],    groups: ['couple','family','small-group'] },
  { name: 'Lamu Archipelago',            price: 4200,  days: 5,  destinations: ['coastal'],                   styles: ['coastal'],              groups: ['couple','solo'] },
  // Specialist
  { name: 'Photography Expedition',      price: 7400,  days: 7,  destinations: ['mara','amboseli'],           styles: ['photography'],          groups: ['solo','small-group'] },
  { name: 'Birding Kenya',               price: 4800,  days: 6,  destinations: ['lakes','nairobi'],           styles: ['birding'],              groups: ['solo','small-group'] },
  { name: 'Family Wild',                 price: 4100,  days: 6,  destinations: ['mara','nairobi'],            styles: ['classic'],              groups: ['family'] },
  // Short
  { name: 'Nairobi Wild',                price: 680,   days: 2,  destinations: ['nairobi'],                   styles: ['classic'],              groups: ['solo','couple','family'] },
  { name: 'Lake Nakuru Escape',          price: 1240,  days: 3,  destinations: ['lakes'],                     styles: ['classic'],              groups: ['solo','couple','family'] },
  { name: 'Amboseli Express',            price: 1480,  days: 3,  destinations: ['amboseli'],                  styles: ['classic'],              groups: ['solo','couple','family'] },
  { name: "Hell's Gate Trek",            price: 590,   days: 2,  destinations: ['nairobi','lakes'],           styles: ['walking'],              groups: ['solo','couple','small-group'] },
];

// Attach data to cards by matching h3 text
document.querySelectorAll('.pkg-card').forEach(card => {
  const nameEl = card.querySelector('.pkg-name');
  if (!nameEl) return;
  const cardName = nameEl.innerText.replace(/\n/g, ' ').trim();
  const match = cardData.find(d => d.name.toLowerCase() === cardName.toLowerCase());
  if (match) {
    card.dataset.price       = match.price;
    card.dataset.days        = match.days;
    card.dataset.destinations = match.destinations.join(',');
    card.dataset.styles      = match.styles.join(',');
    card.dataset.groups      = match.groups.join(',');
  }
});

// Filter panel toggle
const filterToggleBtn = document.getElementById('filterToggleBtn');
const filterPanel     = document.getElementById('filterPanel');

filterToggleBtn.addEventListener('click', () => {
  filterToggleBtn.classList.toggle('open');
  filterPanel.classList.toggle('open');
});

// Budget slider
const budgetRange   = document.getElementById('budgetRange');
const budgetDisplay = document.getElementById('budgetDisplay');

budgetRange.addEventListener('input', () => {
  const val = parseInt(budgetRange.value);
  budgetDisplay.textContent = val >= 17000 ? 'No limit' : `Up to $${val.toLocaleString()}`;
  const pct = ((val - 500) / (17000 - 500)) * 100;
  budgetRange.style.background = `linear-gradient(to right, var(--gold) 0%, var(--gold) ${pct}%, rgba(212,175,55,0.2) ${pct}%)`;
});

// Count active filters
function countActiveFilters() {
  const checked = document.querySelectorAll('.filter-panel input[type="checkbox"]:checked').length;
  const sliderActive = parseInt(budgetRange.value) < 17000 ? 1 : 0;
  return checked + sliderActive;
}

function updateActiveCount() {
  const count = countActiveFilters();
  const badge = document.getElementById('filterActiveCount');
  if (count > 0) {
    badge.textContent = count + (count === 1 ? ' filter' : ' filters');
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }
}

document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', updateActiveCount);
});
budgetRange.addEventListener('input', updateActiveCount);

// Apply filters
function applyFilters() {
  const maxBudget      = parseInt(budgetRange.value);
  const budgetNoLimit  = maxBudget >= 17000;

  const checkedDurations    = [...document.querySelectorAll('input[name="duration"]:checked')].map(i => i.value);
  const checkedDestinations = [...document.querySelectorAll('input[name="destination"]:checked')].map(i => i.value);
  const checkedStyles       = [...document.querySelectorAll('input[name="style"]:checked')].map(i => i.value);
  const checkedGroups       = [...document.querySelectorAll('input[name="group"]:checked')].map(i => i.value);
  const checkedBudgets      = [...document.querySelectorAll('input[name="budget"]:checked')].map(i => i.value);

  const noFilters = budgetNoLimit && !checkedDurations.length && !checkedDestinations.length
                    && !checkedStyles.length && !checkedGroups.length && !checkedBudgets.length;

  let visibleCount = 0;

  document.querySelectorAll('.pkg-card').forEach(card => {
    if (noFilters) {
      card.classList.remove('filtered-out');
      visibleCount++;
      return;
    }

    const price       = parseInt(card.dataset.price || 0);
    const days        = parseInt(card.dataset.days  || 0);
    const destinations = (card.dataset.destinations || '').split(',');
    const styles      = (card.dataset.styles       || '').split(',');
    const groups      = (card.dataset.groups       || '').split(',');

    let pass = true;

    // Budget slider
    if (!budgetNoLimit && price > maxBudget) pass = false;

    // Budget checkboxes (OR logic within group)
    if (pass && checkedBudgets.length) {
      const budgetPass = checkedBudgets.some(b => {
        if (b === 'budget-low')  return price < 2000;
        if (b === 'budget-mid')  return price >= 2000 && price <= 6000;
        if (b === 'budget-high') return price > 6000;
        return false;
      });
      if (!budgetPass) pass = false;
    }

    // Duration (OR logic)
    if (pass && checkedDurations.length) {
      const durPass = checkedDurations.some(d => {
        if (d === '1-3')  return days <= 3;
        if (d === '4-6')  return days >= 4 && days <= 6;
        if (d === '7-9')  return days >= 7 && days <= 9;
        if (d === '10+')  return days >= 10;
        return false;
      });
      if (!durPass) pass = false;
    }

    // Destinations (OR logic)
    if (pass && checkedDestinations.length) {
      const destPass = checkedDestinations.some(d => destinations.includes(d));
      if (!destPass) pass = false;
    }

    // Style (OR logic)
    if (pass && checkedStyles.length) {
      const stylePass = checkedStyles.some(s => styles.includes(s));
      if (!stylePass) pass = false;
    }

    // Group (OR logic)
    if (pass && checkedGroups.length) {
      const groupPass = checkedGroups.some(g => groups.includes(g));
      if (!groupPass) pass = false;
    }

    if (pass) {
      card.classList.remove('filtered-out');
      visibleCount++;
    } else {
      card.classList.add('filtered-out');
    }
  });

  // Show/hide category blocks with no visible cards
  document.querySelectorAll('.category-block').forEach(block => {
    const visibleCards = block.querySelectorAll('.pkg-card:not(.filtered-out)').length;
    block.style.display = visibleCards > 0 ? '' : 'none';
  });

  // Results count
  document.getElementById('resultsCount').textContent = visibleCount;

  // No results state
  const noResults = document.getElementById('noResults');
  if (visibleCount === 0) {
    noResults.classList.add('visible');
  } else {
    noResults.classList.remove('visible');
  }

  updateActiveCount();

  // Close panel after applying
  filterPanel.classList.remove('open');
  filterToggleBtn.classList.remove('open');
}

document.getElementById('filterApplyBtn').addEventListener('click', applyFilters);

// Clear all
document.getElementById('filterClearBtn').addEventListener('click', () => {
  document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(cb => cb.checked = false);
  budgetRange.value = 17000;
  budgetDisplay.textContent = 'No limit';
  budgetRange.style.background = `linear-gradient(to right, var(--gold) 0%, var(--gold) 100%, rgba(212,175,55,0.2) 100%)`;
  applyFilters();
});


const pkgDetailMap = {
  'Grand Odyssey':                'pkg-grand-odyssey.html',
  'Mara Awakening':               'pkg-mara-awakening.html',
  'Ultimate Kenya':               'pkg-ultimate-kenya.html',
  'Tsavo Red Earth':              'pkg-tsavo-red-earth.html',
  'Samburu Secrets':              'pkg-samburu-secrets.html',
  'Private Conservancy Sojourn':  'pkg-private-conservancy.html',
  'Migration Witness':            'pkg-migration-witness.html',
  'Aerial Kenya':                 'pkg-aerial-kenya.html',
  'Safari & Sea':                 'pkg-safari-and-sea.html',
  'Lamu Archipelago':             'pkg-lamu-archipelago.html',
  'Photography Expedition':       'pkg-photography-expedition.html',
  'Birding Kenya':                'pkg-birding-kenya.html',
  'Family Wild':                  'pkg-family-wild.html',
  'Nairobi Wild':                 'pkg-nairobi-wild.html',
  'Lake Nakuru Escape':           'pkg-lake-nakuru-escape.html',
  'Amboseli Express':             'pkg-amboseli-express.html',
  "Hell's Gate Trek":             'pkg-hells-gate-trek.html',
};

document.querySelectorAll('.pkg-card').forEach(card => {
  const nameEl = card.querySelector('.pkg-name');
  const ctaEl  = card.querySelector('.pkg-cta');
  if (!nameEl || !ctaEl) return;
  const rawName = nameEl.innerText.replace(/\n/g,' ').replace(/\s+/g,' ').trim();
  const href = pkgDetailMap[rawName];
  if (href) {
    ctaEl.href        = href;
    ctaEl.textContent = 'Unveil This Journey';
  }
});
    // Auto-apply destination filter from URL param
if (destFilter && destinationMap[destFilter]) {
  const destValues = destinationMap[destFilter];

  // Tick the matching destination checkboxes
  destValues.forEach(val => {
    const cb = document.querySelector(`input[name="destination"][value="${val}"]`);
    if (cb) cb.checked = true;
  });

  // Show the active filter badge
  const badge = document.getElementById('activeFilter');
  const label = document.getElementById('filterLabel');
  if (badge && label) {
    label.textContent = destLabels[destFilter] || destFilter;
    badge.style.display = 'block';
  }

  // Run the filter
  applyFilters();
}


(async function loadDynamicPackages() {

  const { data: packages, error } = await supa
    .from('packages')
    .select(`
      *,
      package_inclusions ( text, included ),
      package_days ( day_number, title, location, sort_order )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error || !packages?.length) return;

  // Group by category
  const grouped = {};
  packages.forEach(pkg => {
    const cat = pkg.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(pkg);
  });

  const section = document.querySelector('.all-packages-section .container');
  if (!section) return;

  // Insert before the bespoke banner
  const bespokeLine = section.querySelector('.gold-line');

  Object.entries(grouped).forEach(([category, pkgs]) => {

    // Don't duplicate categories already in the HTML
    // We'll add new ones only
    const existingCategories = Array.from(section.querySelectorAll('.category-title'))
      .map(el => el.textContent.toLowerCase());
    if (existingCategories.includes(category.toLowerCase())) return;

    const block = document.createElement('div');
    block.className = 'category-block reveal';
    block.dataset.category = category.toLowerCase().replace(/\s+/g, '-');

    const gridCols = pkgs.length === 1 ? 'pkg-grid-3' :
                     pkgs.length === 2 ? 'pkg-grid-2' : 'pkg-grid-3';

    block.innerHTML = `
      <div class="category-header">
        <h2 class="category-title">${category}</h2>
        <span class="category-count">${pkgs.length} Package${pkgs.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="${gridCols}" id="dyn-grid-${category.toLowerCase().replace(/\s+/g,'-')}"></div>
    `;

    pkgs.forEach(pkg => {
      const grid = block.querySelector('[id^="dyn-grid-"]');
      grid.appendChild(buildPackageCard(pkg));
    });

    section.insertBefore(block, bespokeLine);

    // Observe reveal
    block.querySelectorAll('.reveal').forEach(el => {
      if (window._revealObserver) window._revealObserver.observe(el);
    });
    if (window._revealObserver) window._revealObserver.observe(block);
  });

  // Also inject dynamic packages into EXISTING categories if category matches
  packages.forEach(pkg => {
    const cat = pkg.category || '';
    const existingBlock = Array.from(section.querySelectorAll('.category-block'))
      .find(b => {
        const title = b.querySelector('.category-title')?.textContent || '';
        return title.toLowerCase() === cat.toLowerCase();
      });

    if (!existingBlock) return;
    const grid = existingBlock.querySelector('.pkg-grid-3, .pkg-grid-2, .pkg-grid-4');
    if (!grid) return;

    // Don't add duplicates
    const existingNames = Array.from(grid.querySelectorAll('.pkg-name'))
      .map(el => el.textContent.replace(/\s+/g,' ').trim().toLowerCase());
    const pkgNameClean = pkg.name.replace(/\s+/g,' ').trim().toLowerCase();
    if (existingNames.includes(pkgNameClean)) return;

    grid.appendChild(buildPackageCard(pkg));

    // Update count
    const countEl = existingBlock.querySelector('.category-count');
    if (countEl) {
      const current = parseInt(countEl.textContent) || 0;
      countEl.textContent = `${current + 1} Package${current + 1 !== 1 ? 's' : ''}`;
    }
  });

  // Update total results count
  const totalCards = document.querySelectorAll('.pkg-card').length;
  const resultsCount = document.getElementById('resultsCount');
  if (resultsCount) resultsCount.textContent = totalCards;

  // Re-attach card data for filters
  attachFilterData();

})();

function buildPackageCard(pkg) {
  const card = document.createElement('div');
  card.className = 'pkg-card reveal';

  const highlights = pkg.short_highlights || [];
  const price = pkg.price_high_season || pkg.price_duo || 0;
  const detailPage = pkg.detail_page_url || (pkg.slug + '.html');
  const badge = pkg.badge || null;
  const days = pkg.duration_days || '';
  const nights = pkg.duration_nights || '';
  const duration = days ? `${days} Days · ${nights} Nights` : '';

  // Season badge style
  const badgeClass = badge?.toLowerCase().includes('seasonal') ? 'badge-seasonal' :
                     badge?.toLowerCase().includes('new') ? 'badge-new' :
                     badge?.toLowerCase().includes('exclusive') ? 'badge-exclusive' : 'badge-popular';

  card.innerHTML = `
    ${pkg.card_bg_image_url ? `
  <div style="position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none;">
    <img src="${pkg.card_bg_image_url}" alt="" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.18) saturate(0.7);" loading="lazy">
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(8,8,8,0.55) 0%,rgba(8,8,8,0.3) 40%,rgba(8,8,8,0.65) 100%);"></div>
  </div>` : ''}
    ${badge ? `<span class="pkg-badge ${badgeClass}">${badge}</span>` : ''}
    <span class="pkg-duration">${duration}</span>
    <h3 class="pkg-name">${pkg.name}</h3>
    ${pkg.tagline ? `<p class="pkg-tagline">${pkg.tagline}</p>` : ''}
    <div class="divider"></div>
    <div class="pkg-price">$${Number(price).toLocaleString()} <span>/ person</span></div>
    ${pkg.destinations?.length ? `
      <div class="pkg-destinations">
        ${pkg.destinations.map(d => `<span class="dest-tag">${d}</span>`).join('')}
      </div>
    ` : ''}
    <ul class="pkg-features">
      ${highlights.slice(0,6).map(h => `<li>${h}</li>`).join('')}
    </ul>
    <a href="${detailPage}" class="pkg-cta">Unveil This Journey</a>
  `;

  // Attach filter data attributes
  card.dataset.price        = price;
  card.dataset.days         = days || 0;
  card.dataset.destinations = (pkg.destinations || []).join(',').toLowerCase();
  card.dataset.styles       = (pkg.category || '').toLowerCase();
  card.dataset.groups       = 'couple,private';

  return card;
}

function attachFilterData() {
  document.querySelectorAll('.pkg-card').forEach(card => {
    if (card.dataset.price) return; // already has data
    const nameEl = card.querySelector('.pkg-name');
    if (!nameEl) return;
    // Static cards already handled by existing JS cardData array
  });
}

// Store observer reference globally so dynamic cards can use it
window._revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => window._revealObserver.observe(el));


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

  var hints = [
    {
      id: 'filter-hint',
      label: 'Tip',
      text: 'Click "Filters" to narrow packages by budget, duration, destination and travel style.',
      targetId: 'filterToggleBtn',
      pointer: 'down',
      offsetX: 0, offsetY: -60,
      triggerElId: 'filterToggleBar',
      triggerOffset: 120
    },
    {
      id: 'package-hint',
      label: 'Explore',
      text: 'Each card links to a full itinerary — click "Unveil This Journey" to see day-by-day details.',
      targetId: 'pkgCard0',
      pointer: 'up',
      offsetX: 0, offsetY: 20,
      triggerElId: 'packagesGrid',
      triggerOffset: 300
    },
    {
      id: 'bespoke-hint',
      label: 'Did you know',
      text: 'None of these quite right? The bespoke section below lets us build a fully custom safari for you.',
      targetId: 'filterApplyBtn',
      pointer: 'down',
      offsetX: -60, offsetY: -60,
      triggerElId: 'filterPanel',
      triggerOffset: 600
    },
    {
      id: 'whatsapp-hint',
      label: 'Quick action',
      text: 'Tap here to reach us instantly on WhatsApp and start planning your safari.',
      targetId: null,
      fixedPos: { bottom: 100, right: 100 },
      pointer: 'right',
      triggerElId: null,
      triggerScrollY: 1200
    }
  ];

  function getTargetRect(hint) {
    if (hint.targetId) {
      var el = document.getElementById(hint.targetId);
      if (!el) return null;
      return el.getBoundingClientRect();
    }
    return null;
  }

  function showHint(hint) {
    if (shown.has(hint.id)) return;
    shown.add(hint.id);

    var box = document.createElement('div');
    box.className = 'site-hint';
    box.id = 'hint-' + hint.id;
    box.innerHTML =
      '<span class="site-hint-label">' + hint.label + '</span>' +
      '<span class="site-hint-text">' + hint.text + '</span>' +
      '<button class="site-hint-close" aria-label="Dismiss">×</button>' +
      '<div class="site-hint-pointer ' + hint.pointer + '"></div>' +
      '<div class="site-hint-bar"></div>';

    container.style.pointerEvents = 'none';
    box.style.pointerEvents = 'all';

    function positionBox() {
      if (hint.fixedPos) {
        box.style.position = 'fixed';
        if (hint.fixedPos.bottom !== undefined) box.style.bottom = hint.fixedPos.bottom + 'px';
        if (hint.fixedPos.right  !== undefined) box.style.right  = hint.fixedPos.right  + 'px';
        if (hint.fixedPos.top    !== undefined) box.style.top    = hint.fixedPos.top    + 'px';
        if (hint.fixedPos.left   !== undefined) box.style.left   = hint.fixedPos.left   + 'px';
        return;
      }
      var rect = getTargetRect(hint);
      if (!rect) return;
      var scrollY = window.pageYOffset;
      var scrollX = window.pageXOffset;
      var top = rect.top + scrollY + (hint.offsetY || 0);
      var left = rect.left + scrollX + (hint.offsetX || 0);
      box.style.position = 'absolute';
      box.style.top  = top + 'px';
      box.style.left = Math.max(8, Math.min(left, window.innerWidth - 256)) + 'px';
    }

    positionBox();
    container.appendChild(box);
    window.addEventListener('scroll', positionBox, { passive: true });

    function dismiss() {
      box.classList.add('hiding');
      window.removeEventListener('scroll', positionBox);
      setTimeout(function(){ if (box.parentNode) box.parentNode.removeChild(box); }, 380);
    }

    var autoTimer = setTimeout(dismiss, DURATION);
    box.querySelector('.site-hint-close').addEventListener('click', function(){
      clearTimeout(autoTimer);
      dismiss();
    });
  }

  function checkHints() {
    var scrollY = window.pageYOffset;
    hints.forEach(function(hint) {
      if (shown.has(hint.id)) return;
      if (hint.triggerScrollY && scrollY >= hint.triggerScrollY) { showHint(hint); return; }
      if (hint.triggerElId) {
        var el = document.getElementById(hint.triggerElId);
        if (!el) return;
        var rect = el.getBoundingClientRect();
        if (rect.top <= (hint.triggerOffset || window.innerHeight * 0.75)) { showHint(hint); }
      }
    });
  }

  window.addEventListener('scroll', checkHints, { passive: true });
  setTimeout(checkHints, 1200);
})();


// ── FULL AUTH + PROFILE SYSTEM FOR PACKAGES.HTML ──
(function(){
  'use strict';

  var SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';

  function getSupa(){ return window.supabase ? window.supabase.createClient(SUPA_URL, SUPA_KEY) : null; }

  var _fjCurrentUser = null;
  var _pmScrollY = 0, _pmIsOpen = false, _pmLoaded = false;

  // ── NAV USER CHIP ───────────────────────────────────────────
  function injectNavChip(firstName) {
    // Remove any existing chip first
    var existing = document.getElementById('pkgNavChip');
    if (existing) existing.remove();

    var navBack = document.querySelector('.nav-back');
    if (!navBack) return;

    var chip = document.createElement('button');
    chip.id = 'pkgNavChip';
    chip.style.cssText = [
      'display:flex;align-items:center;gap:8px;',
      'font-family:Jost,sans-serif;font-size:9px;font-weight:700;',
      'letter-spacing:3px;text-transform:uppercase;',
      'color:var(--gold);',
      'background:rgba(212,175,55,0.08);',
      'border:1px solid rgba(212,175,55,0.35);',
      'padding:9px 18px;cursor:none;',
      'position:absolute;left:50%;transform:translateX(-50%);',
      'transition:background 0.3s,border-color 0.3s;'
    ].join('');
    chip.innerHTML = '<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.5" stroke="currentColor" stroke-width="1.2"/><path d="M1.5 12.5c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>' + firstName;
    chip.addEventListener('mouseenter', function(){ chip.style.background='rgba(212,175,55,0.15)'; chip.style.borderColor='rgba(212,175,55,0.6)'; });
    chip.addEventListener('mouseleave', function(){ chip.style.background='rgba(212,175,55,0.08)'; chip.style.borderColor='rgba(212,175,55,0.35)'; });
    chip.addEventListener('click', function(){ window._openProfile(); });
    navBack.parentNode.insertBefore(chip, navBack);
  }

  function removeNavChip() {
    var chip = document.getElementById('pkgNavChip');
    if (chip) chip.remove();
  }

  // ── UPDATE NAV FOR USER ─────────────────────────────────────
  function updateNavForUser(user) {
    _fjCurrentUser = user;
    var strip    = document.getElementById('pkgAuthStrip');
    var flipWrap = document.getElementById('pkgFlipWrap');

    if (user) {
      if (strip)    strip.style.display    = 'none';
      if (flipWrap) { flipWrap.style.opacity = '0'; flipWrap.style.pointerEvents = 'none'; }

      // Fetch real first name from profiles table
      var supa = getSupa();
      var metaFirst = (user.user_metadata || {}).first_name
        || ((user.user_metadata || {}).full_name ? (user.user_metadata.full_name.split(' ')[0]) : '')
        || ((user.user_metadata || {}).name ? (user.user_metadata.name.split(' ')[0]) : '')
        || 'Member';

      injectNavChip(metaFirst); // inject immediately with metadata

      if (supa) {
        supa.from('profiles').select('first_name').eq('id', user.id).single()
          .then(function(res) {
            var fn = (res.data && res.data.first_name) ? res.data.first_name : metaFirst;
            injectNavChip(fn); // re-inject with real name once fetched
          })
          .catch(function(){ /* keep metadata name */ });
      }
    } else {
      if (strip)    strip.style.display    = 'block';
      if (flipWrap) { flipWrap.style.opacity = '1'; flipWrap.style.pointerEvents = ''; }
      removeNavChip();
    }
  }

  // ── PROFILE MODAL ───────────────────────────────────────────
  function pmSyncTheme() {
    var fr = document.getElementById('profileModalIframe');
    if (!fr || !fr.contentWindow) return;
    try {
      fr.contentWindow.postMessage({
        type: 'FJ_THEME',
        light: document.body.classList.contains('light-mode')
      }, '*');
    } catch(_) {}
  }

  window._openProfile = function() {
    if (!_fjCurrentUser) { window._openAuth('signin'); return; }
    if (_pmIsOpen) return;
    _pmIsOpen = true;
    _pmScrollY = window.scrollY || document.documentElement.scrollTop;

    document.body.style.position = 'fixed';
    document.body.style.top      = '-' + _pmScrollY + 'px';
    document.body.style.left     = '0';
    document.body.style.right    = '0';
    document.body.style.overflow = 'hidden';

    setFabs(false);

    var ov = document.getElementById('profileModalOverlay');
    ov.style.display = 'flex';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ ov.classList.add('open'); }); });

    var fr = document.getElementById('profileModalIframe');
    var ld = document.getElementById('profileModalLoader');
    if (!_pmLoaded) {
      if (ld) ld.classList.remove('hidden');
      fr.onload = function() {
        _pmLoaded = true;
        pmSyncTheme();
        setTimeout(function(){ if (ld) ld.classList.add('hidden'); }, 280);
      };
      fr.src = 'profile.html';
    } else {
      if (ld) ld.classList.add('hidden');
      pmSyncTheme();
    }
  };

  window._closeProfileModal = function() {
    if (!_pmIsOpen) return;
    var fr = document.getElementById('profileModalIframe');
    if (fr && fr.contentWindow) {
      try {
        fr.contentWindow.postMessage({ type: 'FJ_PROFILE_CHECK_DIRTY' }, '*');
        clearTimeout(window._pmCloseTimer);
        window._pmCloseTimer = setTimeout(_pmDoClose, 250);
        return;
      } catch(_) {}
    }
    _pmDoClose();
  };

  function _pmDoClose() {
    clearTimeout(window._pmCloseTimer);
    if (!_pmIsOpen) return;
    _pmIsOpen = false;

    var ov = document.getElementById('profileModalOverlay');
    ov.classList.remove('open');

    setTimeout(function() {
      ov.style.display = 'none';
      document.body.style.position = '';
      document.body.style.top      = '';
      document.body.style.left     = '';
      document.body.style.right    = '';
      document.body.style.overflow = '';
      window.scrollTo({ top: _pmScrollY, behavior: 'instant' });
      setFabs(true);
    }, 460);
  }

  window._closeProfile = window._closeProfileModal;

  function setFabs(show) {
    [
      document.querySelector('.whatsapp-fab'),
      document.getElementById('themeToggle')
    ].forEach(function(el) {
      if (!el) return;
      el.style.transition    = 'opacity 0.3s ease';
      el.style.opacity       = show ? '1' : '0';
      el.style.pointerEvents = show ? '' : 'none';
    });
  }

  // ── MESSAGE BUS ─────────────────────────────────────────────
  window.addEventListener('message', function(e) {
    if (!e.data || typeof e.data !== 'object') return;
    switch (e.data.type) {
      case 'FJ_PROFILE_DIRTY_RESPONSE':
        clearTimeout(window._pmCloseTimer);
        if (e.data.dirty) {
          try { document.getElementById('profileModalIframe').contentWindow.postMessage({ type: 'FJ_PROFILE_REQUEST_CLOSE' }, '*'); } catch(_) {}
        } else { _pmDoClose(); }
        break;
      case 'FJ_PROFILE_CLOSE_CONFIRMED':
      case 'FJ_PROFILE_NAVIGATE_AWAY':
        _pmDoClose();
        break;
      case 'FJ_PROFILE_SIGNED_OUT':
        _pmDoClose();
        updateNavForUser(null);
        break;
      case 'FJ_PROFILE_SAVED':
        if (e.data.firstName && _fjCurrentUser) {
          injectNavChip(e.data.firstName);
        }
        break;
    }
  });

  // ── AUTH MODAL ──────────────────────────────────────────────
  function clearMessages() {
    ['authMsgErrorSignin','authMsgSuccessSignin',
     'authMsgErrorSignup','authMsgSuccessSignup',
     'authMsgErrorForgot','authMsgSuccessForgot'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  window._openAuth = function(tab) {
    var ov = document.getElementById('authOverlay');
    if (!ov) return;
    setFabs(false);
    ov.style.display = 'flex';
    clearMessages();
    window._switchAuthTab(tab || 'signin');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      ov.style.opacity = '1';
      ov.style.pointerEvents = 'all';
    }); });
  };

  window._closeAuth = function() {
    var ov = document.getElementById('authOverlay');
    if (!ov) return;
    ov.style.opacity = '0';
    ov.style.pointerEvents = 'none';
    document.body.style.overflow = '';
    clearMessages();
    setTimeout(function() {
      ov.style.display = 'none';
      setFabs(true);
    }, 420);
  };

  window._switchAuthTab = function(tab) {
    var si  = document.getElementById('authPanelSignin');
    var su  = document.getElementById('authPanelSignup');
    var fg  = document.getElementById('authPanelForgot');
    var tsi = document.getElementById('tabSignin');
    var tsu = document.getElementById('tabSignup');
    var title = document.getElementById('authModalTitle');
    var sub   = document.getElementById('authModalSub');
    clearMessages();
    if (fg) fg.style.display = 'none';
    if (tab === 'signup') {
      if (si) si.style.display = 'none';
      if (su) su.style.display = 'block';
      if (tsi) { tsi.style.color = 'rgba(138,128,116,0.7)'; tsi.style.borderBottomColor = 'transparent'; }
      if (tsu) { tsu.style.color = '#d4af37'; tsu.style.borderBottomColor = '#d4af37'; }
      if (title) title.innerHTML = 'Join the<br><em style="font-style:italic;color:#d4af37;font-weight:400;">Journey</em>';
      if (sub)   sub.textContent = 'Create your free account to unlock the full safari experience.';
    } else {
      if (su) su.style.display = 'none';
      if (si) si.style.display = 'block';
      if (tsu) { tsu.style.color = 'rgba(138,128,116,0.7)'; tsu.style.borderBottomColor = 'transparent'; }
      if (tsi) { tsi.style.color = '#d4af37'; tsi.style.borderBottomColor = '#d4af37'; }
      if (title) title.innerHTML = 'Welcome<br><em style="font-style:italic;color:#d4af37;font-weight:400;">Back</em>';
      if (sub)   sub.textContent = 'Sign in to access your safari journey and saved preferences.';
    }
  };

  function showMsg(panelSuffix, type, text) {
    var errEl = document.getElementById('authMsgError' + panelSuffix);
    var okEl  = document.getElementById('authMsgSuccess' + panelSuffix);
    if (errEl) errEl.style.display = 'none';
    if (okEl)  okEl.style.display  = 'none';
    if (type === 'error'   && errEl) { errEl.textContent = text; errEl.style.display = 'block'; }
    if (type === 'success' && okEl)  { okEl.textContent  = text; okEl.style.display  = 'block'; }
  }

  window._doSignIn = async function() {
    var supa = getSupa(); if (!supa) return;
    var email = (document.getElementById('siEmail')  || {}).value || '';
    var pass  = (document.getElementById('siPassword')|| {}).value || '';
    email = email.trim();
    if (!email || !pass) { showMsg('Signin','error','Please enter your email and password.'); return; }
    var btn = document.getElementById('siSubmitBtn');
    if (btn) { btn.textContent = 'Signing in…'; btn.disabled = true; }
    try {
      window._fjSigningInViaForm = true;
      var res = await supa.auth.signInWithPassword({ email: email, password: pass });
      setTimeout(function(){ window._fjSigningInViaForm = false; }, 200);
      if (res.error) {
        var msg = (res.error.message || '').toLowerCase();
        if (msg.includes('invalid') || msg.includes('wrong') || msg.includes('credentials') || msg.includes('not found') || msg.includes('no user')) {
          showMsg('Signin','error','❌ No account found with this email. Please create an account first.');
          setTimeout(function(){ window._switchAuthTab('signup'); var el=document.getElementById('suEmail');if(el)el.value=email; }, 1800);
        } else {
          showMsg('Signin','error', res.error.message || 'Sign in failed. Please try again.');
        }
        if (btn) { btn.textContent = 'Sign In to Your Account'; btn.disabled = false; }
        return;
      }
      updateNavForUser(res.data.user);
      showMsg('Signin','success','✓ Welcome back! You are now signed in.');
      setTimeout(function(){
        window._closeAuth();
        showToast('✓ Signed in successfully');
      }, 1200);
    } catch(e) {
      showMsg('Signin','error', e.message || 'Sign in failed.');
    }
    if (btn) { btn.textContent = 'Sign In to Your Account'; btn.disabled = false; }
  };

  window._doSignUp = async function() {
    var supa = getSupa(); if (!supa) return;
    var fn   = ((document.getElementById('suFirstName')  || {}).value || '').trim();
    var email= ((document.getElementById('suEmail')       || {}).value || '').trim();
    var phoneCode = ((document.getElementById('suPhoneCode') || {}).value || '+254');
    var phoneRaw  = ((document.getElementById('suPhone')     || {}).value || '').trim();
    var phone= phoneCode + phoneRaw;
    var nat  = ((document.getElementById('suNationality') || {}).value || '').trim();
    var pass = ((document.getElementById('suPassword')    || {}).value || '');
    var conf = ((document.getElementById('suPassConf')    || {}).value || '');
    if (!fn)   { showMsg('Signup','error','⚠ First name is required.'); return; }
    if (!email){ showMsg('Signup','error','⚠ Email address is required.'); return; }
    if (!phoneRaw){ showMsg('Signup','error','⚠ Phone number is required.'); return; }
    if (!nat)  { showMsg('Signup','error','⚠ Country of residence is required.'); return; }
    if (!pass) { showMsg('Signup','error','⚠ Please create a password.'); return; }
    if (pass.length < 8) { showMsg('Signup','error','⚠ Password must be at least 8 characters.'); return; }
    if (pass !== conf)   { showMsg('Signup','error','⚠ Passwords do not match.'); return; }
    var btn = document.getElementById('suSubmitBtn');
    if (btn) { btn.textContent = 'Creating account…'; btn.disabled = true; }
    try {
      var res = await supa.auth.signUp({ email: email, password: pass, options: { data: { first_name: fn, full_name: fn, phone: phone, nationality: nat } } });
      if (res.error) throw res.error;
      if (res.data && res.data.user && res.data.user.identities && res.data.user.identities.length === 0) {
        showMsg('Signup','error','⚠ An account with this email already exists.');
        setTimeout(function(){ window._switchAuthTab('signin'); var el=document.getElementById('siEmail');if(el)el.value=email; showMsg('Signin','error','⚠ Account found. Please sign in.'); }, 1400);
        if (btn) { btn.textContent = 'Create My Safari Account'; btn.disabled = false; }
        return;
      }
      if (res.data && res.data.user) {
        try {
          await supa.from('profiles').upsert({
            id: res.data.user.id, email: email, first_name: fn, last_name: '',
            phone: phone, nationality: nat, country: nat,
            reward_points: 420,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            created_at: new Date().toISOString(), updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        } catch(_) {}
      }
      if (res.data && res.data.session) {
        updateNavForUser(res.data.user);
        showMsg('Signup','success','✓ Account created! Welcome to Filmax Jambo Tours.');
        setTimeout(function(){ window._closeAuth(); showToast('✓ Welcome, ' + fn + '!'); }, 1200);
      } else {
        showMsg('Signup','success','✓ Account created! Check your email to confirm, then sign in.');
        setTimeout(function(){ window._switchAuthTab('signin'); var el=document.getElementById('siEmail');if(el)el.value=email; }, 2200);
      }
    } catch(e) {
      showMsg('Signup','error', e.message || 'Registration failed.');
    }
    if (btn) { btn.textContent = 'Create My Safari Account'; btn.disabled = false; }
  };

  window._doGoogleAuth = async function() {
    var supa = getSupa(); if (!supa) return;
    try {
      var res = await supa.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/packages.html' }
      });
      if (res.error) throw res.error;
    } catch(e) { showMsg('Signin','error', e.message || 'Google sign-in failed.'); }
  };

  window._showForgotPassword = function() {
    var si = document.getElementById('authPanelSignin');
    var fg = document.getElementById('authPanelForgot');
    if (si) si.style.display = 'none';
    if (fg) fg.style.display = 'block';
    var title = document.getElementById('authModalTitle');
    var sub   = document.getElementById('authModalSub');
    if (title) title.innerHTML = 'Reset Your<br><em style="font-style:italic;color:#d4af37;font-weight:400;">Password</em>';
    if (sub)   sub.textContent = 'We will send a secure link to your inbox.';
    var siEmail = document.getElementById('siEmail');
    var fgEmail = document.getElementById('forgotEmail');
    if (siEmail && fgEmail && siEmail.value) fgEmail.value = siEmail.value;
  };

  window._doForgotPassword = async function() {
    var supa = getSupa(); if (!supa) return;
    var email = ((document.getElementById('forgotEmail') || {}).value || '').trim();
    if (!email) { showMsg('Forgot','error','Please enter your email address.'); return; }
    var btn = document.getElementById('forgotSubmitBtn');
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
    try {
      var res = await supa.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/packages.html?reset=true'
      });
      if (res.error) throw res.error;
      showMsg('Forgot','success','✓ Reset link sent! Check your inbox.');
    } catch(e) {
      showMsg('Forgot','error', e.message || 'Failed to send reset link.');
    }
    if (btn) { btn.textContent = 'Send Reset Link'; btn.disabled = false; }
  };

  function showToast(text) {
    // Remove any existing toast first — prevents stacking
    var existing = document.getElementById('fj-pkg-toast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.id = 'fj-pkg-toast';
    t.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:99999;background:linear-gradient(135deg,#d4af37,#b8860b);color:#080808;font-family:Jost,sans-serif;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;padding:18px 40px;box-shadow:0 8px 24px rgba(212,175,55,0.35);opacity:0;transition:opacity 0.4s ease;white-space:nowrap;pointer-events:none;';
    t.textContent = text;
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.style.opacity = '1'; });
    setTimeout(function(){ t.style.opacity = '0'; setTimeout(function(){ if(t.parentNode) t.remove(); }, 400); }, 2800);
  }

  // ── INIT SESSION ────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    var supa = getSupa(); if (!supa) return;

    // Track whether a session already existed when this page loaded
    var _hadSessionOnLoad = false;

    supa.auth.getSession().then(function(res) {
      if (res.data && res.data.session && res.data.session.user) {
        _hadSessionOnLoad = true;
        updateNavForUser(res.data.session.user);
      }
    });

    supa.auth.onAuthStateChange(function(event, session) {
      updateNavForUser(session ? session.user : null);
      // Only toast on a FRESH sign-in that happened on THIS page —
      // never on session restore from a previous page
      if (event === 'SIGNED_IN' && !_hadSessionOnLoad && session && !window._fjSigningInViaForm) {
        _hadSessionOnLoad = true;
        var m = session.user.user_metadata || {};
        var name = m.first_name
          || (m.full_name ? m.full_name.split(' ')[0] : '')
          || (m.name      ? m.name.split(' ')[0]      : '')
          || 'Explorer';
        var isNew = session.user.created_at && (Date.now() - new Date(session.user.created_at).getTime()) < 10000;
        showToast(isNew ? '✓ Welcome, ' + name + '!' : '✓ Welcome back, ' + name + '!');
      }
      if (event === 'SIGNED_IN') _hadSessionOnLoad = true;
    });

    // Close auth modal on backdrop click
    var ov = document.getElementById('authOverlay');
    if (ov) ov.addEventListener('click', function(e){ if (e.target === ov) window._closeAuth(); });

    // Close auth modal on Escape
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') {
        if (_pmIsOpen) window._closeProfileModal();
        else window._closeAuth();
      }
    });

    // Close profile modal on backdrop click
    var pov = document.getElementById('profileModalOverlay');
    if (pov) pov.addEventListener('click', function(e){ if (e.target === pov) window._closeProfileModal(); });

    // Enter key submits sign in
    var siPass = document.getElementById('siPassword');
    if (siPass) siPass.addEventListener('keydown', function(e){ if (e.key === 'Enter') window._doSignIn(); });

    // Theme toggle syncs to profile iframe
    var themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', function(){ setTimeout(pmSyncTheme, 60); });
  });

})();
