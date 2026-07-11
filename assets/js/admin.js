
// ── CONFIG ──
const SUPABASE_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let editingPackageId = null;
let currentStep = 0;
const TOTAL_STEPS = 7;
let completedSteps = new Set();

// ── SIDEBAR TOGGLE ──
function toggleSidebar() {
  const layout = document.getElementById('adminLayout');
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    layout.classList.toggle('sidebar-open');
  } else {
    layout.classList.toggle('sidebar-collapsed');
    const arrow = document.getElementById('pulltabArrow');
    if (arrow) {
      arrow.textContent = layout.classList.contains('sidebar-collapsed') ? '›' : '‹';
    }
  }
}

  // ── NAV GROUP TOGGLE ──
function toggleNavGroup(groupId) {
  const group = document.getElementById(groupId);
  const header = document.getElementById('nav-' + groupId.replace('group-','')+'-header');
  const isOpen = group.classList.contains('open');
  group.classList.toggle('open', !isOpen);
  header.classList.toggle('open', !isOpen);
}

function openNavGroup(groupId) {
  const group = document.getElementById(groupId);
  const header = document.getElementById('nav-' + groupId.replace('group-','')+'-header');
  if (group) group.classList.add('open');
  if (header) header.classList.add('open');
}  

  // ── DASHBOARD PANEL COLLAPSE (mobile) ──
function toggleDashPanel(panelId, headerEl) {
  const panel = document.getElementById(panelId);
  const arrow = headerEl.querySelector('.dash-panel-arrow');
  if (!panel) return;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if (arrow) arrow.style.transform = isOpen ? 'rotate(-90deg)' : 'rotate(0deg)';
}

// Open packages group by default on load
function initNavGroups() {
  // Open packages group by default, keep others closed
  openNavGroup('group-packages');
}

// ── AUTH ──
async function signIn() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const errEl = document.getElementById('authError');
  errEl.style.display = 'none';

  if (!email || !password) {
    errEl.style.display = 'block';
    errEl.textContent = 'Please enter your email and password.';
    return;
  }

  const btn = document.querySelector('.auth-box .btn-gold');
  btn.textContent = 'Signing in...';
  btn.disabled = true;

  const { data, error } = await db.auth.signInWithPassword({ email, password });

  btn.textContent = 'Sign In';
  btn.disabled = false;

  if (error) {
    errEl.style.display = 'block';
    errEl.textContent = error.message;
    console.error('Auth error:', error);
  } else {
    console.log('Signed in:', data);
    showAdmin();
  }
}

async function signOut() {
  await db.auth.signOut();
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('adminLayout').style.display = 'none';
}

async function checkSession() {
  const { data: { session } } = await db.auth.getSession();
  if (session) showAdmin();
}

function showAdmin() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('adminLayout').style.display = 'grid';
  loadPackages();
  loadCategories();
  initNavGroups();
  showView('dashboard');
  initRealtime();

  // After categories load (slight delay so <select> is populated), restore any unsaved draft
  setTimeout(() => {
    const restored = restoreFormFromStorage();
    if (restored) {
      showToast('Unsaved draft restored — your progress was kept 💾');
      showView('new-package');
    }
  }, 400);
}

function showView(name) {
  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  // Clear all active nav states
  document.querySelectorAll('.nav-item, .nav-sub-item, .nav-group-header').forEach(n => {
    n.classList.remove('active');
  });

  // Show the target view
  const viewEl = document.getElementById('view-' + name);
  if (viewEl) {
    viewEl.classList.add('active');
  } else {
    console.warn('View not found: view-' + name);
    return;
  }

  // Map of view name → { navId, groupId, loader }
  const viewMap = {
    'dashboard':    { navId:'nav-dashboard',    group:null,             loader: loadDashboard },
    'packages':     { navId:'nav-packages',     group:'group-packages', loader: loadPackages },
    'drafts':       { navId:'nav-drafts',       group:'group-packages', loader: loadDrafts },
    'categories':   { navId:'nav-categories',   group:'group-packages', loader: loadCategoriesList },
    'new-package':  { navId:'nav-new',          group:'group-packages', loader: null },
    'enquiries':    { navId:'nav-enquiries',    group:'group-bookings', loader: () => loadEnquiries('all') },
    'confirmed':    { navId:'nav-confirmed',    group:'group-bookings', loader: () => loadReservations('all') },
    'blog-posts':   { navId:'nav-blog-posts',   group:'group-blog',     loader: loadBlogPosts },
    'blog-drafts':  { navId:'nav-blog-drafts',  group:'group-blog',     loader: loadBlogDrafts },
    'new-blog':     { navId:'nav-new-blog',     group:'group-blog',     loader: null },
    'members':      { navId:'nav-members',      group:'group-members',  loader: loadMembers },
    'testimonials': { navId:'nav-testimonials', group:'group-members',  loader: () => loadTestimonials('pending') },
    'team':         { navId:'nav-team',         group:'group-settings', loader: null },
    'site-settings':{ navId:'nav-site',         group:'group-settings', loader: loadSiteSettings },
  };

  const config = viewMap[name];
  if (config) {
    // Activate nav item
    const navEl = document.getElementById(config.navId);
    if (navEl) navEl.classList.add('active');
    // Open the group
    if (config.group) openNavGroup(config.group);
    // Activate dashboard top-level nav
    if (name === 'dashboard') {
      document.getElementById('nav-dashboard')?.classList.add('active');
    }
    // Run loader
    if (config.loader) config.loader();
  }

  // Close mobile sidebar after navigation
  if (window.innerWidth < 768) {
    document.getElementById('adminLayout')?.classList.remove('sidebar-open');
  }
}

function startNewPackage() {
  editingPackageId = null;
  resetForm();
  document.getElementById('formModeLabel').textContent = 'Create';
  document.getElementById('formTitleText').textContent = 'New Package';
  showView('new-package');
  goToStep(0, true);
}

// ── WIZARD STEPS ──
function goToStep(step, force = false) {
  // Free navigation if current step is untouched
  const freeNav = isStepEmpty(currentStep);
  // Block forward navigation only if the step has content AND hasn't been validated
  if (!force && step > currentStep && !freeNav && !completedSteps.has(currentStep)) return;

  // Update pages
  document.querySelectorAll('.form-page').forEach(p => p.classList.remove('active'));
  document.getElementById('fp-' + step).classList.add('active');

  // Update progress indicators
document.querySelectorAll('.wizard-step').forEach((el, i) => {
  el.classList.remove('active', 'completed');
  // Only show completed (tick) if explicitly earned, never just because i < step
  if (completedSteps.has(i)) el.classList.add('completed');
  if (i === step) el.classList.add('active');
});

  // Update progress bar
  const pct = step === 6 ? 100 : Math.round((step / 6) * 100);
  document.getElementById('wizardProgressBar').style.width = pct + '%';

  currentStep = step;

  if (step === 6) buildReviewSummary();
}

function nextStep(step) {
  if (isStepEmpty(step)) {
    // Browsing freely — do NOT mark complete, no tick
    hideValidationSummary(step);
    goToStep(step + 1);
  const mainEl = document.querySelector('.main');
  if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const errors = validateStep(step);
  if (errors.length > 0) {
    showValidationSummary(step, errors);
    return;
  }
  // Only reach here when fully valid and filled — earn the tick
  hideValidationSummary(step);
  completedSteps.add(step);
  goToStep(step + 1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(step) {
  hideValidationSummary(step);
  goToStep(step - 1);
  const mainEl = document.querySelector('.main');
  if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showValidationSummary(step, errors) {
  const vs = document.getElementById('vs-' + step);
  if (!vs) return;
  vs.innerHTML = '<p>Please fix the following before continuing:</p>' +
    errors.map(e => `<p>• ${e}</p>`).join('');
  vs.classList.add('show');
  vs.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideValidationSummary(step) {
  const vs = document.getElementById('vs-' + step);
  if (vs) vs.classList.remove('show');
}

function setInvalid(id, msg) {
  const el = document.getElementById(id);
  const err = document.getElementById('err-' + id.replace('f-',''));
  if (el) el.classList.add('invalid');
  if (err && msg) { err.textContent = msg; err.classList.add('show'); }
}
function clearInvalid(id) {
  const el = document.getElementById(id);
  const err = document.getElementById('err-' + id.replace('f-',''));
  if (el) el.classList.remove('invalid');
  if (err) err.classList.remove('show');
}
function clearAllInvalid() {
  document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  document.querySelectorAll('.field-error.show').forEach(el => el.classList.remove('show'));
}


  function isStepEmpty(step) {
  if (step === 0) {
    const ids = ['f-name','f-tagline','f-badge','f-transport',
                 'f-days','f-nights','f-destinations',
                 'f-overview-title','f-overview-body',
                 'f-hero-image-url','f-card-bg-url','f-short-highlights'];
    const catVal = document.getElementById('f-category').value;
    const anyText = ids.some(id => (document.getElementById(id)?.value || '').trim() !== '');
    return !anyText && !catVal;
  }
  if (step === 1) {
    const ids = ['f-price-peak','f-price-high','f-price-green',
                 'f-price-solo','f-price-duo','f-price-group',
                 'f-peak-months','f-high-months','f-green-months'];
    return ids.every(id => (document.getElementById(id)?.value || '').trim() === '');
  }
  if (step === 2) {
    return document.querySelectorAll('#daysRepeater .repeater-row').length === 0;
  }
  if (step === 3) {
    return document.querySelectorAll('#lodgesRepeater .repeater-row').length === 0;
  }
  if (step === 4) {
    const incRows = document.querySelectorAll('#inclusionsRepeater .repeater-row');
    const excRows = document.querySelectorAll('#exclusionsRepeater .repeater-row');
    return incRows.length === 0 && excRows.length === 0;
  }
  if (step === 5) {
    return document.querySelectorAll('#routeRepeater .repeater-row').length === 0;
  }
  return true;
}

// ── DRAFT PERSISTENCE (survives refresh) ──

const STORAGE_KEY = 'filmax_admin_wizard_draft';

function persistFormToStorage() {
  const days = Array.from(document.querySelectorAll('#daysRepeater .repeater-row')).map(row => ({
    day_number:       row.querySelector('.day-num')?.value || '',
    title:            row.querySelector('.day-title')?.value || '',
    location:         row.querySelector('.day-location')?.value || '',
    description:      row.querySelector('.day-desc')?.value || '',
    activities:       row.querySelector('.day-activities')?.value || '',
    highlight_badges: row.querySelector('.day-badges')?.value || '',
  }));

  const lodges = Array.from(document.querySelectorAll('#lodgesRepeater .repeater-row')).map(row => ({
    destination: row.querySelector('.lodge-dest')?.value || '',
    lodge_name:  row.querySelector('.lodge-name')?.value || '',
    nights:      row.querySelector('.lodge-nights')?.value || '',
    image_url:   row.querySelector('.lodge-img')?.value || '',
    description: row.querySelector('.lodge-desc')?.value || '',
  }));

  const inclusions = Array.from(document.querySelectorAll('#inclusionsRepeater .repeater-row')).map(row => ({
    text:     row.querySelector('.inc-text')?.value || '',
    included: true,
  }));

  const exclusions = Array.from(document.querySelectorAll('#exclusionsRepeater .repeater-row')).map(row => ({
    text:     row.querySelector('.inc-text')?.value || '',
    included: false,
  }));

  const stops = Array.from(document.querySelectorAll('#routeRepeater .repeater-row')).map(row => ({
    name:            row.querySelector('.stop-name')?.value || '',
    day_label:       row.querySelector('.stop-day')?.value || '',
    color:           row.querySelector('.stop-color')?.value || '#d4af37',
    lat:             row.querySelector('.stop-lat')?.value || '',
    lng:             row.querySelector('.stop-lng')?.value || '',
    flight_duration: row.querySelector('.stop-flight')?.value || '',
  }));

  const data = {
    // Basics
    name:             document.getElementById('f-name')?.value || '',
    slug:             document.getElementById('f-slug')?.value || '',
    tagline:          document.getElementById('f-tagline')?.value || '',
    badge:            document.getElementById('f-badge')?.value || '',
    category:         document.getElementById('f-category')?.value || '',
    transport:        document.getElementById('f-transport')?.value || '',
    days:             document.getElementById('f-days')?.value || '',
    nights:           document.getElementById('f-nights')?.value || '',
    destinations:     document.getElementById('f-destinations')?.value || '',
    overviewTitle:    document.getElementById('f-overview-title')?.value || '',
    overviewBody:     document.getElementById('f-overview-body')?.value || '',
    overviewBody2:    document.getElementById('f-overview-body-2')?.value || '',
    heroImageUrl:     document.getElementById('f-hero-image-url')?.value || '',
    cardBgUrl:        document.getElementById('f-card-bg-url')?.value || '',
    shortHighlights:  document.getElementById('f-short-highlights')?.value || '',
    detailPageUrl:    document.getElementById('f-detail-page-url')?.value || '',
    tier:             document.getElementById('f-tier')?.value || '',
    labels:           Array.from(document.querySelectorAll('.f-label-opt:checked')).map(el => el.value),
    // Pricing
    pricePeak:        document.getElementById('f-price-peak')?.value || '',
    priceHigh:        document.getElementById('f-price-high')?.value || '',
    priceGreen:       document.getElementById('f-price-green')?.value || '',
    priceSolo:        document.getElementById('f-price-solo')?.value || '',
    priceDuo:         document.getElementById('f-price-duo')?.value || '',
    priceGroup:       document.getElementById('f-price-group')?.value || '',
    peakMonths:       document.getElementById('f-peak-months')?.value || '',
    highMonths:       document.getElementById('f-high-months')?.value || '',
    greenMonths:      document.getElementById('f-green-months')?.value || '',
    // Repeaters
    days_rows:        days,
    lodges_rows:      lodges,
    inclusions_rows:  inclusions,
    exclusions_rows:  exclusions,
    stops_rows:       stops,
    // Wizard state
    currentStep:      currentStep,
    completedSteps:   Array.from(completedSteps),
    editingPackageId: editingPackageId,
    savedAt:          Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch(e) {
    // Storage full or unavailable — fail silently
  }
}

function restoreFormFromStorage() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch(e) { return false; }

  if (!raw) return false;

  let data;
  try { data = JSON.parse(raw); } catch(e) { return false; }

  // Nothing meaningful was saved
  if (!data.name && !data.tagline && !data.days_rows?.length) return false;

  // Restore flat fields
  const set = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };

  set('f-name',            data.name);
  set('f-slug',            data.slug);
  set('f-tagline',         data.tagline);
  set('f-badge',           data.badge);
  set('f-category',        data.category);
  set('f-transport',       data.transport);
  set('f-days',            data.days);
  set('f-nights',          data.nights);
  set('f-destinations',    data.destinations);
  set('f-overview-title',  data.overviewTitle);
  set('f-overview-body',   data.overviewBody);
  set('f-overview-body-2', data.overviewBody2);
  set('f-hero-image-url',  data.heroImageUrl);
  set('f-card-bg-url',     data.cardBgUrl);
  set('f-short-highlights',data.shortHighlights);
  set('f-detail-page-url', data.detailPageUrl);
  set('f-tier',            data.tier);
  set('f-price-peak',      data.pricePeak);
  set('f-price-high',      data.priceHigh);
  set('f-price-green',     data.priceGreen);
  set('f-price-solo',      data.priceSolo);
  set('f-price-duo',       data.priceDuo);
  set('f-price-group',     data.priceGroup);
  set('f-peak-months',     data.peakMonths);
  set('f-high-months',     data.highMonths);
  set('f-green-months',    data.greenMonths);

  // Restore repeater rows
  data.days_rows?.forEach(d => addDayRow({
    day_number: d.day_number, title: d.title, location: d.location,
    description: d.description,
    activities: d.activities ? d.activities.split(',').map(s=>s.trim()).filter(Boolean) : [],
    highlight_badges: d.highlight_badges ? d.highlight_badges.split(',').map(s=>s.trim()).filter(Boolean) : [],
  }));

  data.lodges_rows?.forEach(l => addLodgeRow({
    destination: l.destination, lodge_name: l.lodge_name,
    nights: l.nights, image_url: l.image_url, description: l.description,
  }));

  data.inclusions_rows?.forEach(i => addInclusionRow(true,  { text: i.text }));
  data.exclusions_rows?.forEach(i => addInclusionRow(false, { text: i.text }));

  data.stops_rows?.forEach(s => addRouteRow({
    name: s.name, day_label: s.day_label, color: s.color,
    lat: s.lat, lng: s.lng, flight_duration: s.flight_duration,
  }));

  // Restore wizard position
  editingPackageId = data.editingPackageId || null;
  completedSteps   = new Set(data.completedSteps || []);
  goToStep(data.currentStep || 0, true);

  return true;
}

function clearStorageDraft() {
  try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
}

function attachPersistenceListeners() {
  const wizard = document.getElementById('view-new-package');
  if (!wizard) return;
  wizard.addEventListener('input',  () => persistFormToStorage());
  wizard.addEventListener('change', () => persistFormToStorage());
}
  
// ── VALIDATION ──
function validateStep(step) {
  clearAllInvalid();
  const errors = [];

  if (step === 0) {
    const name = document.getElementById('f-name').value.trim();
    const slug = document.getElementById('f-slug').value.trim();
    const tagline = document.getElementById('f-tagline').value.trim();
    const badge = document.getElementById('f-badge').value.trim();
    const category = document.getElementById('f-category').value;
    const transport = document.getElementById('f-transport').value.trim();
    const days = document.getElementById('f-days').value;
    const nights = document.getElementById('f-nights').value;
    const destinations = document.getElementById('f-destinations').value.trim();
    const overviewTitle = document.getElementById('f-overview-title').value.trim();
    const overviewBody = document.getElementById('f-overview-body').value.trim();
    const heroUrl = document.getElementById('f-hero-image-url').value.trim();
    const cardBgUrl = document.getElementById('f-card-bg-url').value.trim();
    const highlights = document.getElementById('f-short-highlights').value.trim();

    if (name.length < 5) { errors.push('Package name (min 5 characters)'); setInvalid('f-name'); }
    else clearInvalid('f-name');

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) { errors.push('URL slug (lowercase letters, numbers, hyphens only)'); setInvalid('f-slug'); }
    else clearInvalid('f-slug');

    if (tagline.length < 10) { errors.push('Tagline (min 10 characters)'); setInvalid('f-tagline'); }
    else clearInvalid('f-tagline');

    if (!badge) { errors.push('Badge text is required'); setInvalid('f-badge'); }
    else clearInvalid('f-badge');

    if (!category) { errors.push('Category must be selected'); setInvalid('f-category'); }
    else clearInvalid('f-category');

    if (!transport) { errors.push('Transport type is required'); setInvalid('f-transport'); }
    else clearInvalid('f-transport');

    if (!days || parseInt(days) < 1) { errors.push('Duration days (min 1)'); setInvalid('f-days'); }
    else clearInvalid('f-days');

    if (nights === '' || parseInt(nights) < 0) { errors.push('Duration nights required'); setInvalid('f-nights'); }
    else clearInvalid('f-nights');

    const destArr = destinations.split(',').map(s => s.trim()).filter(Boolean);
    if (destArr.length < 2) { errors.push('At least 2 destinations required (comma separated)'); setInvalid('f-destinations'); }
    else clearInvalid('f-destinations');

    if (overviewTitle.length < 10) { errors.push('Overview title (min 10 characters)'); setInvalid('f-overview-title'); }
    else clearInvalid('f-overview-title');

    if (overviewBody.length < 80) { errors.push(`Overview body (min 80 characters — currently ${overviewBody.length})`); setInvalid('f-overview-body'); }
    else clearInvalid('f-overview-body');

    const heroOk = heroUrl && heroUrl.toLowerCase().endsWith('.webp');
    if (!heroOk) { errors.push('Hero image URL is required and must end in .webp'); setInvalid('f-hero-image-url'); document.getElementById('heroUploadBox').classList.add('invalid'); }
    else { clearInvalid('f-hero-image-url'); document.getElementById('heroUploadBox').classList.remove('invalid'); }

    const cardBgOk = cardBgUrl && cardBgUrl.toLowerCase().endsWith('.webp');
    if (!cardBgOk) { errors.push('Card background image URL is required and must end in .webp'); setInvalid('f-card-bg-url'); }
    else clearInvalid('f-card-bg-url');

    const hlLines = highlights.split('\n').map(s => s.trim()).filter(Boolean);
    if (hlLines.length < 4 || hlLines.length > 7) { errors.push(`Short highlights: need between 4 and 7 items (currently ${hlLines.length})`); setInvalid('f-short-highlights'); }
    else clearInvalid('f-short-highlights');
  }

  if (step === 1) {
    const peak = document.getElementById('f-price-peak').value;
    const high = document.getElementById('f-price-high').value;
    const green = document.getElementById('f-price-green').value;
    const solo = document.getElementById('f-price-solo').value;
    const duo = document.getElementById('f-price-duo').value;
    const grp = document.getElementById('f-price-group').value;
    const peakM = document.getElementById('f-peak-months').value.trim();
    const highM = document.getElementById('f-high-months').value.trim();
    const greenM = document.getElementById('f-green-months').value.trim();

    if (!peak || parseFloat(peak) <= 0) { errors.push('Peak season price required'); setInvalid('f-price-peak'); }
    if (!high || parseFloat(high) <= 0) { errors.push('High season price required'); setInvalid('f-price-high'); }
    if (!green || parseFloat(green) <= 0) { errors.push('Green season price required'); setInvalid('f-price-green'); }
    if (!solo || parseFloat(solo) <= 0) { errors.push('Solo price required'); setInvalid('f-price-solo'); }
    if (!duo || parseFloat(duo) <= 0) { errors.push('Duo price required'); setInvalid('f-price-duo'); }
    if (!grp || parseFloat(grp) <= 0) { errors.push('Group price required'); setInvalid('f-price-group'); }

    const monthRx = /^(\d{1,2})(,\d{1,2})*$/;
    if (!monthRx.test(peakM.replace(/\s/g,''))) { errors.push('Peak months: comma-separated numbers 1–12 (e.g. 7,8,9,10)'); setInvalid('f-peak-months'); }
    if (!monthRx.test(highM.replace(/\s/g,''))) { errors.push('High months: comma-separated numbers 1–12'); setInvalid('f-high-months'); }
    if (!monthRx.test(greenM.replace(/\s/g,''))) { errors.push('Green months: comma-separated numbers 1–12'); setInvalid('f-green-months'); }
  }

  if (step === 2) {
    const rows = document.querySelectorAll('#daysRepeater .repeater-row');
    if (rows.length < 2) { errors.push('At least 2 itinerary days required'); }
    rows.forEach((row, i) => {
      const title = row.querySelector('.day-title')?.value.trim() || '';
      const location = row.querySelector('.day-location')?.value.trim() || '';
      const desc = row.querySelector('.day-desc')?.value.trim() || '';
      if (!title) { errors.push(`Day ${i+1}: title required`); row.querySelector('.day-title')?.classList.add('invalid'); }
      if (!location) { errors.push(`Day ${i+1}: location required`); row.querySelector('.day-location')?.classList.add('invalid'); }
      if (desc.length < 40) { errors.push(`Day ${i+1}: description min 40 characters (${desc.length} entered)`); row.querySelector('.day-desc')?.classList.add('invalid'); }
    });
  }

  if (step === 3) {
    const rows = document.querySelectorAll('#lodgesRepeater .repeater-row');
    if (rows.length < 1) { errors.push('At least 1 lodge/property required'); }
    rows.forEach((row, i) => {
      const dest = row.querySelector('.lodge-dest')?.value.trim() || '';
      const name = row.querySelector('.lodge-name')?.value.trim() || '';
      const nights = row.querySelector('.lodge-nights')?.value || '';
      if (!dest) { errors.push(`Lodge ${i+1}: destination required`); row.querySelector('.lodge-dest')?.classList.add('invalid'); }
      if (!name) { errors.push(`Lodge ${i+1}: lodge name required`); row.querySelector('.lodge-name')?.classList.add('invalid'); }
      if (!nights || parseInt(nights) < 1) { errors.push(`Lodge ${i+1}: nights must be at least 1`); row.querySelector('.lodge-nights')?.classList.add('invalid'); }
      const lodgeImgUrl = row.querySelector('.lodge-img')?.value.trim() || '';
if (!lodgeImgUrl) {
  errors.push(`Lodge ${i+1}: image URL required (.webp)`);
  row.querySelector('.lodge-img')?.classList.add('invalid');
} else if (!lodgeImgUrl.toLowerCase().endsWith('.webp')) {
  errors.push(`Lodge ${i+1}: image URL must end in .webp`);
  row.querySelector('.lodge-img')?.classList.add('invalid');
}
    });
  }

  if (step === 4) {
    const incRows = document.querySelectorAll('#inclusionsRepeater .repeater-row');
    const excRows = document.querySelectorAll('#exclusionsRepeater .repeater-row');
    const incValid = Array.from(incRows).filter(r => r.querySelector('.inc-text')?.value.trim());
    const excValid = Array.from(excRows).filter(r => r.querySelector('.inc-text')?.value.trim());
    if (incValid.length < 3) errors.push(`At least 3 included items required (${incValid.length} filled)`);
    if (excValid.length < 2) errors.push(`At least 2 excluded items required (${excValid.length} filled)`);
    incRows.forEach(row => { if (!row.querySelector('.inc-text')?.value.trim()) row.querySelector('.inc-text')?.classList.add('invalid'); });
    excRows.forEach(row => { if (!row.querySelector('.inc-text')?.value.trim()) row.querySelector('.inc-text')?.classList.add('invalid'); });
  }

  if (step === 5) {
    const rows = document.querySelectorAll('#routeRepeater .repeater-row');
    if (rows.length < 2) { errors.push('At least 2 route stops required'); }
    rows.forEach((row, i) => {
      const name = row.querySelector('.stop-name')?.value.trim() || '';
      const lat = row.querySelector('.stop-lat')?.value || '';
      const lng = row.querySelector('.stop-lng')?.value || '';
      if (!name) { errors.push(`Stop ${i+1}: place name required`); row.querySelector('.stop-name')?.classList.add('invalid'); }
      if (!lat || isNaN(parseFloat(lat))) { errors.push(`Stop ${i+1}: valid latitude required`); row.querySelector('.stop-lat')?.classList.add('invalid'); }
      if (!lng || isNaN(parseFloat(lng))) { errors.push(`Stop ${i+1}: valid longitude required`); row.querySelector('.stop-lng')?.classList.add('invalid'); }
    });
  }

  return errors;
}

// ── REVIEW SUMMARY ──
function buildReviewSummary() {
  const name = document.getElementById('f-name').value;
  const days = document.getElementById('f-days').value;
  const nights = document.getElementById('f-nights').value;
  const cat = document.getElementById('f-category').value;
  const peakP = document.getElementById('f-price-peak').value;
  const daysCount = document.querySelectorAll('#daysRepeater .repeater-row').length;
  const lodgesCount = document.querySelectorAll('#lodgesRepeater .repeater-row').length;
  const incCount = document.querySelectorAll('#inclusionsRepeater .repeater-row').length;
  const excCount = document.querySelectorAll('#exclusionsRepeater .repeater-row').length;
  const stopsCount = document.querySelectorAll('#routeRepeater .repeater-row').length;

  document.getElementById('reviewSummary').innerHTML = `
    <span style="font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:16px;">Package Summary</span>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
      <div style="padding:16px;border:1px solid rgba(255,255,255,0.06);">
        <span style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);">Package</span>
        <div style="font-size:15px;color:var(--text);margin-top:6px;font-weight:600;">${name}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px;">${days} days · ${nights} nights · ${cat}</div>
      </div>
      <div style="padding:16px;border:1px solid rgba(255,255,255,0.06);">
        <span style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);">Peak Price</span>
        <div style="font-size:22px;color:var(--gold);margin-top:6px;">$${Number(peakP).toLocaleString()}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px;">per person</div>
      </div>
      <div style="padding:16px;border:1px solid rgba(255,255,255,0.06);">
        <span style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);">Content</span>
        <div style="font-size:12px;color:var(--text);margin-top:6px;line-height:1.9;">
          ✓ ${daysCount} itinerary days<br>
          ✓ ${lodgesCount} lodge${lodgesCount !== 1 ? 's' : ''}<br>
          ✓ ${incCount} included / ${excCount} excluded<br>
          ✓ ${stopsCount} route stops
        </div>
      </div>
    </div>
  `;
}

// ── LOAD PACKAGES & DRAFTS ──
async function loadPackages() {
  const { data, error } = await db.from('packages').select('*').eq('is_published', true).order('created_at', { ascending: false });
  console.log('📦 Published packages:', data, '| Error:', error);
  renderPackageList(data, 'packageList', true);
}

async function loadDrafts() {
  const { data, error } = await db.from('packages').select('*').eq('is_published', false).order('created_at', { ascending: false });
  console.log('📝 Draft packages:', data, '| Error:', error);
  renderPackageList(data, 'draftList', false);
}

async function loadDashboard() {
  // Date display
  document.getElementById('dashDate').textContent = new Date().toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  // KPIs
  const [
    { count: publishedCount },
    { count: draftCount },
    { count: catCount },
    { data: recentPkgs }
  ] = await Promise.all([
    db.from('packages').select('*', { count:'exact', head:true }).eq('is_published', true),
    db.from('packages').select('*', { count:'exact', head:true }).eq('is_published', false),
    db.from('package_categories').select('*', { count:'exact', head:true }),
    db.from('packages').select('id,name,category,duration_days,price_high_season,is_published,is_featured,created_at').order('created_at', { ascending:false }).limit(6),
  ]);

  document.getElementById('kpi-published-num').textContent = publishedCount ?? '—';
  document.getElementById('kpi-drafts-num').textContent    = draftCount ?? '—';
  document.getElementById('kpi-categories-num').textContent = catCount ?? '—';
  // Members count
  const { count: membersCount } = await db.from('profiles').select('*', { count:'exact', head:true });
  document.getElementById('kpi-enquiries-num').textContent = membersCount ?? '—';

  // Enquiries count
  const { count: enqCount } = await db.from('enquiries').select('*', { count:'exact', head:true });
  // Update enquiries KPI label
  const enqKpi = document.getElementById('kpi-enquiries');
  if (enqKpi) {
    enqKpi.querySelector('.dash-kpi-label').textContent = 'Members';
    enqKpi.querySelector('.dash-kpi-sub').textContent   = 'Registered users';
  }

  // Booking placeholders
  document.getElementById('dash-new-enq').textContent  = '—';
  document.getElementById('dash-confirmed').textContent = '—';
  document.getElementById('dash-pending').textContent   = '—';

  // Recent packages
  const container = document.getElementById('dashRecentPackages');
  if (!recentPkgs?.length) {
    container.innerHTML = '<p style="color:var(--muted);font-size:12px;">No packages yet — create your first one.</p>';
    return;
  }
  container.innerHTML = recentPkgs.map(p => `
    <div class="dash-pkg-row">
      <div>
        <div class="dash-pkg-row-name">${p.name}</div>
        <div class="dash-pkg-row-meta">${p.category || '—'} · ${p.duration_days || '?'} days · $${(p.price_high_season||0).toLocaleString()}/person</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <span class="badge ${p.is_published ? 'badge-published' : 'badge-draft'}">${p.is_published ? 'Live' : 'Draft'}</span>
        <button class="btn btn-outline btn-sm" onclick="editPackage('${p.id}')">Edit</button>
      </div>
    </div>
  `).join('');
}  

function renderPackageList(data, containerId, isPublished) {
  const list = document.getElementById(containerId);
  if (!data?.length) {
    list.innerHTML = `<p style="color:var(--muted);">${isPublished ? 'No published packages yet.' : 'No drafts saved.'}</p>`;
    return;
  }
  list.innerHTML = data.map(p => `
    <div class="pkg-list-item">
      <div>
        <div class="pkg-list-name">${p.name}</div>
        <div class="pkg-list-meta">${p.category || '—'} · ${p.duration_days || '?'} days · from $${(p.price_high_season || 0).toLocaleString()}</div>
      </div>
      <span class="badge ${p.is_published ? 'badge-published' : 'badge-draft'}">${p.is_published ? 'Published' : 'Draft'}</span>
      ${p.is_featured ? '<span class="badge badge-featured">Featured</span>' : '<span></span>'}
      <div class="list-action-btn">
        ${!p.is_published ? `<button class="btn btn-publish btn-sm" onclick="publishPackage('${p.id}')">🚀 Publish</button>` : `<button class="btn btn-outline btn-sm" onclick="unpublishPackage('${p.id}')">Unpublish</button>`}
        <button class="btn btn-outline btn-sm" onclick="editPackage('${p.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deletePackage('${p.id}')">Delete</button>
        <button class="btn btn-outline btn-sm" onclick="generateDetailPage('${p.id}')">📄 Generate Page</button>
      </div>
    </div>
  `).join('');
}

async function publishPackage(id) {
  const { error } = await db.from('packages').update({ is_published: true }).eq('id', id);
  if (error) return showToast('Error: ' + error.message, 'error');
  showToast('Package published — now live on site ✓', 'success');
  loadDrafts();
  loadPackages();
}

async function unpublishPackage(id) {
  if (!confirm('Move this package back to drafts?')) return;
  await db.from('packages').update({ is_published: false }).eq('id', id);
  loadPackages();
  showToast('Moved to drafts');
}

// ── LOAD CATEGORIES ──
async function loadCategories() {
  const { data } = await db.from('package_categories').select('*').order('name');
  const select = document.getElementById('f-category');
  if (!data) return;
  select.innerHTML = '<option value="">Select category...</option>' +
    data.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

async function loadCategoriesList() {
  const { data } = await db.from('package_categories').select('*').order('name');
  const list = document.getElementById('categoriesList');
  if (!data?.length) { list.innerHTML = '<p style="color:var(--muted);">No categories yet.</p>'; return; }
  list.innerHTML = data.map(c => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--charcoal);border:1px solid var(--border);">
      <span>${c.name} <span style="color:var(--muted);font-size:11px;">/ ${c.slug}</span></span>
      <button class="btn btn-danger btn-sm" onclick="deleteCategory('${c.id}')">Remove</button>
    </div>
  `).join('');
}

async function addCategory() {
  const name = document.getElementById('newCatName').value.trim();
  const slug = document.getElementById('newCatSlug').value.trim();
  if (!name || !slug) return showToast('Name and slug required', 'error');
  await db.from('package_categories').insert({ name, slug });
  document.getElementById('newCatName').value = '';
  document.getElementById('newCatSlug').value = '';
  loadCategories();
  loadCategoriesList();
  showToast('Category added');
}

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  await db.from('package_categories').delete().eq('id', id);
  loadCategoriesList();
  showToast('Category deleted');
}

// ── REPEATER ROWS ──
let dayCount=0, lodgeCount=0, inclusionCount=0, exclusionCount=0, routeCount=0;

function clearEmptyState(repId) {
  const rep = document.getElementById(repId);
  const empty = rep.querySelector('.repeater-empty');
  if (empty) empty.remove();
}

function addDayRow(data = {}) {
  clearEmptyState('daysRepeater');
  dayCount++;
  const dnum = data.day_number || dayCount;
  const id = 'day-' + dayCount;
  const accoms = data.accommodations || {};
  const tierLabels = { flat: 'Standard Choice', down: 'Budget-Friendly Alternative', up: 'Premium Upgrade' };
  const tierBlocks = ['flat','down','up'].map(function(tier){
    const a = accoms[tier] || {};
    return `
      <div class="accom-tier-card" data-tier="${tier}">
        <div class="accom-tier-header">${tierLabels[tier]} <span style="font-weight:400;opacity:0.6;">(shown to guests as the ${tier==='flat'?'default':tier==='down'?'lower-cost':'upgrade'} option)</span></div>
        <div class="form-grid">
          <div class="form-group"><label>Lodge / Camp Name <span class="req">*</span></label><input type="text" class="accom-name" data-tier="${tier}" value="${a.name||''}" placeholder="e.g. Mara Plains Camp"></div>
          <div class="form-group"><label>Type</label><input type="text" class="accom-type" data-tier="${tier}" value="${a.type||''}" placeholder="e.g. Ultra-Luxury Tented"></div>
          ${imgUploadFieldHTML('accom-image-'+id+'-'+tier, 'Lodge Photo', a.image_url||'', 'accommodations/day-'+dnum+'-'+tier, true)}
          <div class="form-group full"><label>Description <span class="req">*</span> <span style="font-weight:400;font-size:8px;color:var(--muted);text-transform:none;">(min 40 chars \u2014 what makes this lodge special)</span></label><textarea class="accom-desc" data-tier="${tier}" rows="2" placeholder="Describe the lodge, its setting and standout features...">${a.description||''}</textarea></div>
          <div class="form-group full"><label>Getting There</label><input type="text" class="accom-getting" data-tier="${tier}" value="${a.getting_there||''}" placeholder="e.g. Charter Wilson to Mara airstrip, then 20-min transfer"></div>
        </div>
      </div>`;
  }).join('');
  const html = `
    <div class="repeater-row" id="${id}">
      <div class="repeater-row-header">
        <span class="repeater-row-title">Day ${dnum}</span>
        <button class="btn btn-danger btn-sm" onclick="document.getElementById('${id}').remove()">Remove</button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label>Day Number</label><input type="number" class="day-num" value="${dnum}"></div>
        <div class="form-group"><label>Title <span class="req">*</span></label><input type="text" class="day-title" value="${data.title || ''}" placeholder="e.g. Nairobi to Maasai Mara"></div>
        <div class="form-group"><label>Location <span class="req">*</span></label><input type="text" class="day-location" value="${data.location || ''}" placeholder="e.g. Wilson Airport, Mara"></div>
        <div class="form-group"><label>Description <span class="req">*</span> <span style="font-weight:400;font-size:8px;color:var(--muted);text-transform:none;">(min 40 chars)</span></label><textarea class="day-desc" rows="3" placeholder="What happens this day...">${data.description || ''}</textarea></div>
        <div class="form-group"><label>Activities <span style="font-weight:400;font-size:8px;color:var(--muted);text-transform:none;">(comma separated)</span></label><input type="text" class="day-activities" value="${(data.activities||[]).join(', ')}" placeholder="Private aircraft, Afternoon drive"></div>
        <div class="form-group"><label>Highlight Badges <span style="font-weight:400;font-size:8px;color:var(--muted);text-transform:none;">(comma separated)</span></label><input type="text" class="day-badges" value="${(data.highlight_badges||[]).join(', ')}" placeholder="Private Charter, Photographer"></div>
        <div class="form-group full"><label>Day Photo Gallery <span style="font-weight:400;font-size:8px;color:rgba(212,175,55,0.6);text-transform:none;">(up to 4 image URLs, one per line, .webp only)</span></label><textarea class="day-gallery" rows="4" placeholder="https://assets/day1-a.webp&#10;https://assets/day1-b.webp&#10;https://assets/day1-c.webp&#10;https://assets/day1-d.webp">${(data.gallery_images||[]).join('\n')}</textarea></div><div class="form-group full"><label>Gallery Image Captions <span style="font-weight:400;font-size:8px;color:var(--muted);text-transform:none;">(comma separated, matching order above)</span></label><input type="text" class="day-gallery-captions" value="${(data.gallery_captions||[]).join(', ')}" placeholder="Mara Plains, Private Charter, Lodge Pool, Afternoon Drive"></div>
      </div>
      <div class="accom-section">
        <div class="accom-section-title">Accommodation Options for This Day <span style="font-weight:400;font-size:9px;color:var(--muted);text-transform:none;">\u2014 guests will see all three and can choose</span></div>
        ${tierBlocks}
      </div>
    </div>`;
  document.getElementById('daysRepeater').insertAdjacentHTML('beforeend', html);
}

function addLodgeRow(data = {}) {
  clearEmptyState('lodgesRepeater');
  lodgeCount++;
  const id = 'lodge-' + lodgeCount;
  const html = `
    <div class="repeater-row" id="${id}">
      <div class="repeater-row-header">
        <span class="repeater-row-title">Lodge ${lodgeCount}</span>
        <button class="btn btn-danger btn-sm" onclick="document.getElementById('${id}').remove()">Remove</button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label>Destination <span class="req">*</span></label><input type="text" class="lodge-dest" value="${data.destination||''}" placeholder="e.g. Maasai Mara"></div>
        <div class="form-group"><label>Lodge Name <span class="req">*</span></label><input type="text" class="lodge-name" value="${data.lodge_name||''}" placeholder="e.g. Ultra-Luxury Mara Camp"></div>
        <div class="form-group"><label>Nights <span class="req">*</span></label><input type="number" class="lodge-nights" value="${data.nights||1}" min="1"></div>
        <div class="form-group"><label>Image URL <span style="font-weight:400;font-size:8px;color:rgba(212,175,55,0.6);text-transform:none;">(.webp only)</span></label><input type="text" class="lodge-img" value="${data.image_url||''}" placeholder="https://...lodge.webp"></div>
        <div class="form-group full"><label>Description</label><textarea class="lodge-desc" rows="2">${data.description||''}</textarea></div>
      </div>
    </div>`;
  document.getElementById('lodgesRepeater').insertAdjacentHTML('beforeend', html);
}

function addInclusionRow(included = true, data = {}) {
  const count = included ? ++inclusionCount : ++exclusionCount;
  const repId = included ? 'inclusionsRepeater' : 'exclusionsRepeater';
  clearEmptyState(repId);
  const id = (included ? 'inc-' : 'exc-') + count;
  const html = `
    <div class="repeater-row" id="${id}" style="padding:12px 16px;">
      <div style="display:flex;gap:12px;align-items:center;">
        <input type="hidden" class="inc-type" value="${included}">
        <input type="text" class="inc-text" value="${data.text||''}" placeholder="${included ? 'e.g. All private charter flights within Kenya' : 'e.g. International flights to Nairobi'}" style="flex:1;">
        <button class="btn btn-danger btn-sm" onclick="document.getElementById('${id}').remove()">✕</button>
      </div>
    </div>`;
  document.getElementById(repId).insertAdjacentHTML('beforeend', html);
}

function addRouteRow(data = {}) {
  clearEmptyState('routeRepeater');
  routeCount++;
  const id = 'route-' + routeCount;
  const html = `
    <div class="repeater-row" id="${id}">
      <div class="repeater-row-header">
        <span class="repeater-row-title">Stop ${routeCount}</span>
        <button class="btn btn-danger btn-sm" onclick="document.getElementById('${id}').remove()">Remove</button>
      </div>
      <div class="form-grid three">
        <div class="form-group"><label>Place Name <span class="req">*</span></label><input type="text" class="stop-name" value="${data.name||''}" placeholder="e.g. Nairobi"></div>
        <div class="form-group"><label>Day Label</label><input type="text" class="stop-day" value="${data.day_label||''}" placeholder="e.g. Days 1–2"></div>
        <div class="form-group"><label>Dot Colour (hex)</label><input type="text" class="stop-color" value="${data.color||'#d4af37'}" placeholder="#d4af37"></div>
        <div class="form-group"><label>Latitude <span class="req">*</span></label><input type="number" class="stop-lat" step="any" value="${data.lat||''}"></div>
        <div class="form-group"><label>Longitude <span class="req">*</span></label><input type="number" class="stop-lng" step="any" value="${data.lng||''}"></div>
        <div class="form-group"><label>Flight Duration to Next</label><input type="text" class="stop-flight" value="${data.flight_duration||''}" placeholder="e.g. 45 min"><span style="font-size:10px;color:var(--muted);display:block;margin-top:3px;font-style:italic;">Leave blank for the final stop</span></div>
      </div>
    </div>`;
  document.getElementById('routeRepeater').insertAdjacentHTML('beforeend', html);
}

// ── SAVE PACKAGE ──
async function savePackage(publish = false) {
  if (publish && !validatePackageForm()) {
    showToast('Please fix the highlighted fields before publishing. Draft saves are still allowed with incomplete fields.', 'error');
    return;
  }
  validatePackageForm(); // always run to show inline warnings, even on draft save
  const statusEl = document.getElementById('savingStatus');
  const publishBtn = document.getElementById('publishBtn');
  statusEl.textContent = publish ? 'Publishing...' : 'Saving draft...';
  publishBtn.disabled = true;

  const slug = document.getElementById('f-slug').value.trim();

  const pkg = {
    name:               document.getElementById('f-name').value.trim(),
    slug,
    tagline:            document.getElementById('f-tagline').value,
    badge:              document.getElementById('f-badge').value,
    category:           document.getElementById('f-category').value,
    transport_type:     document.getElementById('f-transport').value,
    duration_days:      parseInt(document.getElementById('f-days').value) || null,
    duration_nights:    parseInt(document.getElementById('f-nights').value) || null,
    destinations:       document.getElementById('f-destinations').value.split(',').map(s => s.trim()).filter(Boolean),
    overview_title:     document.getElementById('f-overview-title').value,
    overview_body:      document.getElementById('f-overview-body').value,
    overview_body_2:    document.getElementById('f-overview-body-2').value,
    hero_image_url:     document.getElementById('f-hero-image-url').value,
    price_peak_season:  parseFloat(document.getElementById('f-price-peak').value) || null,
    price_high_season:  parseFloat(document.getElementById('f-price-high').value) || null,
    price_green_season: parseFloat(document.getElementById('f-price-green').value) || null,
    price_solo:         parseFloat(document.getElementById('f-price-solo').value) || null,
    price_duo:          parseFloat(document.getElementById('f-price-duo').value) || null,
    price_group:        parseFloat(document.getElementById('f-price-group').value) || null,
    peak_months:        document.getElementById('f-peak-months').value.split(',').map(n => parseInt(n.trim())).filter(Boolean),
    high_months:        document.getElementById('f-high-months').value.split(',').map(n => parseInt(n.trim())).filter(Boolean),
    green_months:       document.getElementById('f-green-months').value.split(',').map(n => parseInt(n.trim())).filter(Boolean),
    is_published:       publish,
    is_featured:        document.getElementById('f-featured')?.value === 'true',
    card_bg_image_url:  document.getElementById('f-card-bg-url').value,
    short_highlights:   document.getElementById('f-short-highlights').value.split('\n').map(s => s.trim()).filter(Boolean),
    detail_page_url:    document.getElementById('f-detail-page-url').value || (slug + '.html'),
  };

  let packageId = editingPackageId;

  if (editingPackageId) {
    const { error } = await db.from('packages').update(pkg).eq('id', editingPackageId);
    if (error) { statusEl.textContent=''; publishBtn.disabled=false; return showToast('Error: ' + error.message, 'error'); }
  } else {
    const { data, error } = await db.from('packages').insert(pkg).select().single();
    if (error) { statusEl.textContent=''; publishBtn.disabled=false; return showToast('Error: ' + error.message, 'error'); }
    packageId = data.id;
    editingPackageId = packageId;
  }

  // Save sub-data
  await db.from('package_days').delete().eq('package_id', packageId);
  const days = Array.from(document.querySelectorAll('#daysRepeater .repeater-row')).map((row, i) => ({
    package_id: packageId, day_number: parseInt(row.querySelector('.day-num')?.value)||i+1,
    title: row.querySelector('.day-title')?.value||'', location: row.querySelector('.day-location')?.value||'',
    description: row.querySelector('.day-desc')?.value||'',
    activities: (row.querySelector('.day-activities')?.value||'').split(',').map(s=>s.trim()).filter(Boolean),
    highlight_badges: (row.querySelector('.day-badges')?.value||'').split(',').map(s=>s.trim()).filter(Boolean),
    gallery_images: (row.querySelector('.day-gallery')?.value||'').split('\n').map(s=>s.trim()).filter(Boolean),
    gallery_captions: (row.querySelector('.day-gallery-captions')?.value||'').split(',').map(s=>s.trim()).filter(Boolean),
    sort_order: i
  }));
  let insertedDays = [];
  if (days.length) {
    const dayRes = await db.from('package_days').insert(days).select();
    insertedDays = dayRes.data || [];
  }
  // Save per-day accommodation tiers (flat/down/up), linked to their day row
  const dayRows = Array.from(document.querySelectorAll('#daysRepeater .repeater-row'));
  for (let i = 0; i < dayRows.length; i++) {
    const dayId = insertedDays[i]?.id;
    if (!dayId) continue;
    await db.from('package_day_accommodations').delete().eq('package_day_id', dayId);
    const row = dayRows[i];
    const tierEls = row.querySelectorAll('.accom-tier-card');
    const accomRows = Array.from(tierEls).map((card, ti) => {
      const tier = card.dataset.tier;
      return {
        package_day_id: dayId,
        tier: tier,
        name: card.querySelector('.accom-name')?.value || '',
        type: card.querySelector('.accom-type')?.value || '',
        image_url: card.querySelector('input[type=hidden][class*="accom-image"]')?.value || '',
        description: card.querySelector('.accom-desc')?.value || '',
        getting_there: card.querySelector('.accom-getting')?.value || '',
        facts: [],
        sort_order: ti
      };
    }).filter(a => a.name); // skip empty tier cards
    if (accomRows.length) await db.from('package_day_accommodations').insert(accomRows);
  }

  await db.from('package_lodges').delete().eq('package_id', packageId);
  const lodges = Array.from(document.querySelectorAll('#lodgesRepeater .repeater-row')).map((row, i) => ({
    package_id: packageId, destination: row.querySelector('.lodge-dest')?.value||'',
    lodge_name: row.querySelector('.lodge-name')?.value||'',
    nights: parseInt(row.querySelector('.lodge-nights')?.value)||1,
    image_url: row.querySelector('.lodge-img')?.value||'',
    description: row.querySelector('.lodge-desc')?.value||'', sort_order: i
  }));
  if (lodges.length) await db.from('package_lodges').insert(lodges);

  await db.from('package_inclusions').delete().eq('package_id', packageId);
  const allInclusions = Array.from(document.querySelectorAll('#inclusionsRepeater .repeater-row, #exclusionsRepeater .repeater-row'))
    .map(row => ({ package_id: packageId, text: row.querySelector('.inc-text')?.value||'', included: row.querySelector('.inc-type')?.value==='true' }))
    .filter(r => r.text);
  if (allInclusions.length) await db.from('package_inclusions').insert(allInclusions);

  await db.from('package_route_stops').delete().eq('package_id', packageId);
  const stops = Array.from(document.querySelectorAll('#routeRepeater .repeater-row')).map((row, i) => ({
    package_id: packageId, name: row.querySelector('.stop-name')?.value||'',
    day_label: row.querySelector('.stop-day')?.value||'', color: row.querySelector('.stop-color')?.value||'#d4af37',
    lat: parseFloat(row.querySelector('.stop-lat')?.value)||null, lng: parseFloat(row.querySelector('.stop-lng')?.value)||null,
    flight_duration: row.querySelector('.stop-flight')?.value||'', sort_order: i
  }));
  if (stops.length) await db.from('package_route_stops').insert(stops);

  statusEl.textContent = '';
  publishBtn.disabled = false;

  clearStorageDraft();

  if (publish) {
    showToast('Package published — now live on the website 🚀', 'success');
    setTimeout(() => showView('packages'), 1800);
  } else {
    showToast('Saved as draft. You can publish anytime from the Drafts section.', '');
    setTimeout(() => showView('drafts'), 1800);
  }
}

// ── EDIT PACKAGE ──
async function editPackage(id) {
  editingPackageId = id;
  completedSteps = new Set([0,1,2,3,4,5]);
  resetForm(true);

  const [
    { data: pkg },
    { data: days },
    { data: lodges },
    { data: inclusions },
    { data: stops }
  ] = await Promise.all([
    db.from('packages').select('*').eq('id', id).single(),
    db.from('package_days').select('*').eq('package_id', id).order('sort_order'),
    db.from('package_lodges').select('*').eq('package_id', id).order('sort_order'),
    db.from('package_inclusions').select('*').eq('package_id', id),
    db.from('package_route_stops').select('*').eq('package_id', id).order('sort_order'),
  ]);
  // Fetch accommodation tiers for all this package's days in one query, then attach to each day
  if (days && days.length) {
    const dayIds = days.map(function(d){ return d.id; });
    const accomRes = await db.from('package_day_accommodations').select('*').in('package_day_id', dayIds);
    const accomRows = accomRes.data || [];
    days.forEach(function(d){
      d.accommodations = {};
      accomRows.filter(function(a){ return a.package_day_id === d.id; }).forEach(function(a){ d.accommodations[a.tier] = a; });
    });
  }

  document.getElementById('f-name').value           = pkg.name||'';
  document.getElementById('f-slug').value           = pkg.slug||'';
  document.getElementById('f-tagline').value        = pkg.tagline||'';
  document.getElementById('f-badge').value          = pkg.badge||'';
  document.getElementById('f-category').value       = pkg.category||'';
  document.getElementById('f-transport').value      = pkg.transport_type||'';
  document.getElementById('f-days').value           = pkg.duration_days||'';
  document.getElementById('f-nights').value         = pkg.duration_nights||'';
  document.getElementById('f-destinations').value   = (pkg.destinations||[]).join(', ');
  document.getElementById('f-overview-title').value = pkg.overview_title||'';
  document.getElementById('f-overview-body').value  = pkg.overview_body||'';
  document.getElementById('f-hero-image-url').value = pkg.hero_image_url||'';
  document.getElementById('f-price-peak').value     = pkg.price_peak_season||'';
  document.getElementById('f-price-high').value     = pkg.price_high_season||'';
  document.getElementById('f-price-green').value    = pkg.price_green_season||'';
  document.getElementById('f-price-solo').value     = pkg.price_solo||'';
  document.getElementById('f-price-duo').value      = pkg.price_duo||'';
  document.getElementById('f-price-group').value    = pkg.price_group||'';
  document.getElementById('f-peak-months').value    = (pkg.peak_months||[]).join(',');
  document.getElementById('f-high-months').value    = (pkg.high_months||[]).join(',');
  document.getElementById('f-green-months').value   = (pkg.green_months||[]).join(',');
  document.getElementById('f-card-bg-url').value    = pkg.card_bg_image_url||'';
  document.getElementById('f-featured').value        = String(pkg.is_featured || false);
  document.getElementById('f-short-highlights').value = (pkg.short_highlights||[]).join('\n');
  document.getElementById('f-detail-page-url').value  = pkg.detail_page_url||'';
  document.getElementById('f-overview-body-2').value = pkg.overview_body_2 || '';
  document.querySelectorAll('.f-label-opt').forEach(el => { el.checked = (pkg.labels||[]).includes(el.value); });

  days?.forEach(d => addDayRow(d));
  lodges?.forEach(l => addLodgeRow(l));
  inclusions?.filter(i => i.included).forEach(i => addInclusionRow(true, i));
  inclusions?.filter(i => !i.included).forEach(i => addInclusionRow(false, i));
  stops?.forEach(s => addRouteRow(s));

  document.getElementById('formModeLabel').textContent = 'Editing';
  document.getElementById('formTitleText').textContent = pkg.name;
  showView('new-package');
  goToStep(0);
}

// ── DELETE ──
async function deletePackage(id) {
  if (!confirm('Permanently delete this package? This cannot be undone.')) return;
  await db.from('packages').delete().eq('id', id);
  loadPackages();
  loadDrafts();
  showToast('Package deleted');
}

  async function generateDetailPage(id) {
  showToast('Fetching package data...');

  const [
    { data: pkg },
    { data: days },
    { data: lodges },
    { data: inclusions },
    { data: stops }
  ] = await Promise.all([
    db.from('packages').select('*').eq('id', id).single(),
    db.from('package_days').select('*').eq('package_id', id).order('sort_order'),
    db.from('package_lodges').select('*').eq('package_id', id).order('sort_order'),
    db.from('package_inclusions').select('*').eq('package_id', id),
    db.from('package_route_stops').select('*').eq('package_id', id).order('sort_order'),
  ]);

  if (!pkg) return showToast('Package not found', 'error');

  const included = (inclusions || []).filter(i => i.included);
  const excluded = (inclusions || []).filter(i => !i.included);

  const price = pkg.price_high_season || 0;
  const pricePeak = pkg.price_peak_season || price;
  const priceGreen = pkg.price_green_season || price;
  const priceSolo = pkg.price_solo || 0;
  const priceDuo = pkg.price_duo || price;
  const priceGroup = pkg.price_group || 0;

  const peakMonths = (pkg.peak_months || []).map(m => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]).join(' · ');
  const highMonths = (pkg.high_months || []).map(m => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]).join(' · ');
  const greenMonths = (pkg.green_months || []).map(m => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]).join(' · ');

  const seasonBarMonths = Array.from({length:12}, (_,i) => {
    const m = i + 1;
    const label = ['J','F','M','A','M','J','J','A','S','O','N','D'][i];
    let cls = 'season-off';
    if ((pkg.peak_months||[]).includes(m)) cls = 'season-peak';
    else if ((pkg.high_months||[]).includes(m)) cls = 'season-good';
    return `<div class="season-month"><span class="season-month-label">${label}</span><div class="season-indicator ${cls}"></div></div>`;
  }).join('');

  const daysHTML = (days || []).map(d => {
    const activities = (d.activities || []).map(a => `<li>${a}</li>`).join('');
    const badges = (d.highlight_badges || []).map(b => `<span class="fjt-highlight-badge">${b}</span>`).join('');
    const gallery = (d.gallery_images || []);
    const captions = (d.gallery_captions || []);
    const galleryHTML = gallery.length ? `
      <div class="fjt-gallery-label"><span>Visual Highlights</span></div>
      <div class="fjt-gallery">
        ${gallery.map((img, gi) => `
          <div class="fjt-gallery-item">
            <img src="${img}" alt="${captions[gi]||''}" loading="lazy">
            ${captions[gi] ? `<span class="fjt-gallery-caption">${captions[gi]}</span>` : ''}
          </div>`).join('')}
      </div>` : '';
    return `
      <div class="itinerary-day" id="fjt-day-${d.day_number}">
        <div class="day-header">
          <div class="day-header-left">
            <span class="day-number">Day ${String(d.day_number).padStart(2,'0')}</span>
            <h3 class="day-title">${d.title||''}</h3>
          </div>
          <div class="day-chevron"><svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="rgba(212,175,55,0.7)" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        </div>
        <div class="day-body">
          <span class="day-location">${d.location||''}</span>
          <p class="day-desc">${d.description||''}</p>
          ${activities ? `<ul class="day-activities">${activities}</ul>` : ''}
          ${galleryHTML}
          ${badges ? `<div class="fjt-day-highlight">${badges}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  const lodgesHTML = (lodges || []).map(l => `
    <div class="lodge-card">
      <div class="lodge-card-img">
        <img src="${l.image_url||''}" alt="${l.lodge_name||''}" loading="lazy">
      </div>
      <span class="lodge-card-nights">${l.nights} Night${l.nights!==1?'s':''}</span>
      <div class="lodge-card-body">
        <span class="lodge-card-dest">${l.destination||''}</span>
        <div class="lodge-card-name">${l.lodge_name||''}</div>
        <p class="lodge-card-desc">${l.description||''}</p>
      </div>
    </div>`).join('');

  const includedHTML = included.map(i => `<li>${i.text}</li>`).join('');
  const excludedHTML = excluded.map(i => `<li>${i.text}</li>`).join('');

  const mapLegendHTML = (stops||[]).map((s,si) => `
    <div class="map-stop">
      <div class="map-stop-dot" style="background:${s.color||'#d4af37'};box-shadow:0 0 8px ${s.color||'#d4af37'}55;"></div>
      <div class="map-stop-info">
        <span class="map-stop-day">${s.day_label||''}</span>
        <span class="map-stop-name">${s.name||''}</span>
      </div>
    </div>
    ${si < (stops.length-1) && s.flight_duration ? `<div class="map-flight-line"><span>${s.flight_duration}</span></div>` : ''}`).join('');

  const stopsJSON = JSON.stringify((stops||[]).map(s => ({
    lat: s.lat, lng: s.lng, color: s.color||'#d4af37',
    name: s.name, sub: s.day_label||''
  })));

  const pkgNameParts = pkg.name.split(' ');
  const heroTitleLine1 = pkgNameParts.slice(0, Math.ceil(pkgNameParts.length/2)).join(' ');
  const heroTitleLine2 = pkgNameParts.slice(Math.ceil(pkgNameParts.length/2)).join(' ');
  const destinations = (pkg.destinations||[]).join(' · ');
  const detailUrl = pkg.detail_page_url || (pkg.slug + '.html');

  const waMsg = encodeURIComponent(`Hello, I'd like to enquire about the ${pkg.name} - ${pkg.duration_days} Day Safari at $${price.toLocaleString()} per person.`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${pkg.name} — ${pkg.duration_days} Days — Filmax Jambo Tours</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cormorant+Garamond:wght@300;400;600&family=Jost:wght@200;300;400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --black: #080808; --deep: #0d0d0d; --charcoal: #141414; --card: #111111;
    --gold: #d4af37; --gold-light: #e8c84a; --gold-dim: rgba(212,175,55,0.12);
    --amber: #b8860b; --text: #f0ece4; --muted: #8a8074;
    --border: rgba(212,175,55,0.2); --border-subtle: rgba(255,255,255,0.05);
  }
  /* Global overflow guard */
  html { overflow-x: clip; width: 100%; }
  body { width: 100%; }
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth;overflow-x:hidden}
  body{background:var(--black);color:var(--text);font-family:'Jost',sans-serif;font-weight:300;cursor:none}
  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:var(--black)} ::-webkit-scrollbar-thumb{background:var(--gold)}
  .cursor{width:12px;height:12px;background:var(--gold);border-radius:50%;position:fixed;top:0;left:0;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .3s,height .3s;mix-blend-mode:difference}
  .cursor-ring{width:40px;height:40px;border:1px solid rgba(212,175,55,.5);border-radius:50%;position:fixed;top:0;left:0;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:transform .15s ease-out,width .4s,height .4s}
  nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;justify-content:space-between;align-items:center;padding:28px 48px;transition:background .4s,padding .4s}
  nav.scrolled{background:rgba(8,8,8,.95);backdrop-filter:blur(20px);padding:18px 48px;border-bottom:1px solid var(--border)}
  .nav-logo-link{display:flex;align-items:center;text-decoration:none;flex-shrink:0;line-height:0}
  .nav-logo-img{height:60px;width:auto;object-fit:contain;display:block;filter:drop-shadow(0 0 12px rgba(212,175,55,.5));animation:goldenPulse 4s ease-in-out infinite;transition:height .4s}
  nav.scrolled .nav-logo-img{height:46px}
  @keyframes goldenPulse{0%,100%{opacity:1}50%{opacity:.85}}
  .nav-back{font-family:'Jost',sans-serif;font-size:10px;font-weight:400;letter-spacing:4px;text-transform:uppercase;color:var(--gold);text-decoration:none;display:flex;align-items:center;gap:10px;transition:color .3s;cursor:none;}
  .nav-back::before{content:'';width:24px;height:1px;background:var(--gold);transition:width .3s,background .3s;}
  .nav-back:hover{color:var(--gold-light);}
  .nav-back:hover::before{width:36px;background:var(--gold-light);}
  .pkg-hero{position:relative;height:82vh;min-height:500px;display:flex;align-items:flex-end;overflow:hidden;padding-top:80px;}
  .pkg-hero-bg{position:absolute;inset:0}
  .pkg-hero-img{width:100%;height:100%;object-fit:cover;object-position:center 40%;transform:scale(1.04);animation:heroKenBurns 14s ease-in-out infinite alternate}
  @keyframes heroKenBurns{from{transform:scale(1.04) translateX(0)}to{transform:scale(1.08) translateX(-1%)}}
  .pkg-hero-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(8,8,8,.97) 0%,rgba(8,8,8,.55) 40%,rgba(8,8,8,.2) 70%,rgba(8,8,8,.5) 100%)}
  .pkg-hero-overlay-gold{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 80%,rgba(212,175,55,.08) 0%,transparent 60%)}
  .pkg-hero-content{position:relative;z-index:5;padding:0 48px 72px;width:100%}
  .pkg-hero-breadcrumb{display:flex;align-items:center;gap:12px;margin-bottom:24px}
  .pkg-hero-breadcrumb span{font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--muted)}
  .pkg-hero-breadcrumb .sep{color:var(--border)} .pkg-hero-breadcrumb .cur{color:var(--gold)}
  .pkg-hero-badge{display:inline-block;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--black);background:var(--gold);padding:5px 14px;margin-bottom:20px}
  .pkg-hero-title{font-family:'Playfair Display',serif;font-size:clamp(52px,8vw,108px);font-weight:900;line-height:.96;letter-spacing:-2px;margin-bottom:24px}
  .pkg-hero-title em{font-style:italic;font-weight:400;color:var(--gold);display:block}
  .pkg-hero-meta{display:flex;align-items:center;gap:40px;flex-wrap:wrap}
  .pkg-hero-meta-item{display:flex;flex-direction:column;gap:4px}
  .pkg-hero-meta-label{font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--muted)}
  .pkg-hero-meta-value{font-family:'Cormorant Garamond',serif;font-size:18px;color:var(--text)}
  .pkg-hero-meta-sep{width:1px;height:36px;background:var(--border)}
  .pkg-hero-price-hero{font-family:'Cormorant Garamond',serif;font-size:52px;font-weight:600;color:var(--gold);line-height:1}
  .pkg-hero-price-hero span{font-size:14px;font-family:'Jost',sans-serif;color:var(--muted);font-weight:300}
  .scroll-cue{position:absolute;right:52px;bottom:60px;z-index:5;display:flex;flex-direction:column;align-items:center;gap:8px}
  .scroll-cue span{font-size:8px;letter-spacing:4px;text-transform:uppercase;color:var(--muted);writing-mode:vertical-rl}
  .scroll-line{width:1px;height:60px;background:linear-gradient(to bottom,var(--gold),transparent);animation:scrollAnim 2s ease-in-out infinite}
  @keyframes scrollAnim{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}

  /* ============================================================
     MAIN LAYOUT — Two column with sticky sidebar
  ============================================================ */
.pkg-main {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 0;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 48px;
  }

.pkg-content {
    padding: 0 64px 120px 0;
    border-right: 1px solid var(--border-subtle);
    min-width: 0;
  }

  /* ============================================================
     TAB NAVIGATION
  ============================================================ */
  .pkg-tabs-wrapper {
    position: sticky;
    top: 72px;
    z-index: 50;
    background: rgba(8,8,8,0.97);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    margin-left: -64px;
    padding-left: 64px;
    margin-right: -1px;
  }

  .pkg-tabs {
    display: flex;
    align-items: stretch;
    gap: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .pkg-tabs::-webkit-scrollbar { display: none; }

  .pkg-tab {
    font-family: 'Jost', sans-serif;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--muted);
    padding: 20px 24px 18px;
    cursor: none;
    border: none;
    background: transparent;
    border-bottom: 2px solid transparent;
    transition: color 0.3s, border-color 0.3s;
    white-space: nowrap;
    position: relative;
  }
  @media (max-width: 1100px) {
  .pkg-tab {
    padding: 26px 24px 14px;
  }
}

  .pkg-tab:hover {
    color: var(--text);
  }

  .pkg-tab.active {
    color: var(--gold);
    border-bottom-color: var(--gold);
  }

  /* ============================================================
     TAB PANELS
  ============================================================ */
.pkg-tab-panel {
    display: none;
    padding-top: 64px;
  }
  .pkg-tab-panel.active {
    display: block;
  }

  /* MOBILE ONLY: show all panels stacked, ignore active/hidden state */
  @media (max-width: 1100px) {
    .pkg-tab-panel {
      display: block !important;
      padding-top: 48px;
      padding-bottom: 16px;
    }
  }

  /* ── Shared typography ── */
  .sec-label{font-size:9px;letter-spacing:5px;text-transform:uppercase;color:var(--gold);display:block;margin-bottom:16px}
  .sec-title{font-family:'Playfair Display',serif;font-size:clamp(28px,3vw,40px);font-weight:700;line-height:1.15;margin-bottom:20px}
  .sec-divider{width:60px;height:1px;background:linear-gradient(to right,var(--gold),transparent);margin:32px 0}

  /* ============================================================
     PANEL 1 — OVERVIEW
  ============================================================ */
  .overview-intro p {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    color: var(--muted);
    line-height: 1.85;
    font-style: italic;
    margin-bottom: 20px;
  }

  .overview-highlights {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border-subtle);
    margin: 48px 0;
  }
  .pkg-highlight-item{background:var(--card);padding:28px 24px;position:relative;overflow:hidden}
  .pkg-highlight-item::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(to right,var(--gold),transparent);transform:scaleX(0);transform-origin:left;transition:transform .4s}
  .pkg-highlight-item:hover::after{transform:scaleX(1)}
  .phi-icon{font-size:22px;margin-bottom:12px;display:block}
  .phi-label{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;display:block}
  .phi-value{font-family:'Playfair Display',serif;font-size:16px;color:var(--text)}

  /* Kenya Route Map */
  .overview-map-section {
    margin-top: 56px;
  }
  .kenya-map-container {
    position: relative;
    background: var(--charcoal);
    border: 1px solid var(--border);
    padding: 24px;
    overflow: hidden;
    height: 430px;
  }
  .kenya-map-container::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 60% 40%, rgba(212,175,55,0.04) 0%, transparent 70%);
    pointer-events: none;
  }
  .map-layout {
    display: grid;
    grid-template-columns: 1fr 220px;
    gap: 24px;
    align-items: start;
    height: 100%;
  }
  .kenya-svg-wrap {
    position: relative;
    height: 100%;
  }
  .kenya-svg-wrap svg {
    width: 100%;
    max-width: 420px;
    height: auto;
  }
  /* Route legend */
  .map-legend {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .map-legend-title {
    font-size: 8px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 20px;
    display: block;
  }
  .map-stop {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 0;
    border-bottom: 1px solid var(--border-subtle);
    position: relative;
  }
  .map-stop:last-child { border-bottom: none; }
  .map-stop-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 3px;
    position: relative;
  }
  .gm-style .gm-style-iw-c {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
}
.gm-style .gm-style-iw-d {
  overflow: hidden !important;
  padding: 0 !important;
}
.gm-style .gm-style-iw-tc::after {
  display: none !important;
}
.gm-style .gm-style-iw-t::after {
  display: none !important;
}
.gm-style-iw button {
  display: none !important;
}
  .map-stop-dot.nairobi { background: var(--gold); box-shadow: 0 0 8px rgba(212,175,55,0.5); }
  .map-stop-dot.mara { background: #e8884a; box-shadow: 0 0 8px rgba(232,136,74,0.4); }
  .map-stop-dot.amboseli { background: #7bb56e; box-shadow: 0 0 8px rgba(123,181,110,0.4); }
  .map-stop-dot.samburu { background: #6eb0c8; box-shadow: 0 0 8px rgba(110,176,200,0.4); }
  .map-stop-dot.diani { background: #9b6fd4; box-shadow: 0 0 8px rgba(155,111,212,0.4); }
  .map-stop-info {}
  .map-stop-day { font-size: 8px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 3px; }
  .map-stop-name { font-family: 'Playfair Display', serif; font-size: 15px; color: var(--text); }
  .map-flight-line {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 0 6px 24px;
  }
  .map-flight-line span { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); }
  .map-flight-line::before { content: '✈'; font-size: 9px; color: rgba(212,175,55,0.4); }

  /* ============================================================
     PANEL 2 — DAY BY DAY
  ============================================================ */
  .pkg-itinerary { margin-bottom: 40px; }
  .itinerary-days-wrapper {
    border-left: 1px solid var(--border);
    margin-top: 8px;
  }
  .itinerary-day { position: relative; margin-bottom: 0; }
  .itinerary-day::before {
    content: '';
    position: absolute;
    top: 22px;
    left: -5px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--charcoal);
    border: 1px solid rgba(212,175,55,0.3);
    box-shadow: 0 0 8px rgba(212,175,55,0.2);
    transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
    z-index: 2;
  }
  .itinerary-day.open::before {
    background: var(--gold);
    border-color: var(--gold);
    box-shadow: 0 0 14px rgba(212,175,55,0.6);
  }
  .day-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0 20px 32px;
    cursor: none;
    gap: 20px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    transition: background 0.3s;
    position: relative;
  }
  .day-header:hover { background: rgba(212,175,55,0.03); }
  .itinerary-day.open .day-header { border-bottom-color: transparent; }
  .day-header-left { display: flex; align-items: baseline; gap: 20px; flex: 1; }
  .day-number { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); flex-shrink: 0; display: block; }
  .day-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--text); line-height: 1.2; margin-bottom: 0; transition: color 0.3s; }
  .itinerary-day.open .day-title { color: var(--gold); }
  .day-chevron { width: 28px; height: 28px; border: 1px solid rgba(212,175,55,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 4px; transition: border-color 0.3s, background 0.3s, transform 0.4s cubic-bezier(0.22,1,0.36,1); }
  .itinerary-day.open .day-chevron { border-color: rgba(212,175,55,0.6); background: rgba(212,175,55,0.08); transform: rotate(180deg); }
  .day-chevron svg { display: block; }
  .day-body { overflow: hidden; max-height: 0; transition: max-height 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease, padding 0.4s ease; opacity: 0; padding: 0 0 0 32px; }
  .itinerary-day.open .day-body { max-height: 1200px; opacity: 1; padding: 4px 0 36px 32px; }
  .day-location { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .day-location::before { content: ''; width: 20px; height: 1px; background: var(--gold); flex-shrink: 0; }
  .day-desc { font-size: 14px; color: var(--muted); line-height: 1.85; margin-bottom: 16px; }
  .day-activities { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; }
  .day-activities li { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); border: 1px solid var(--border-subtle); padding: 5px 12px; transition: border-color .3s, color .3s; }
  .day-activities li:hover { border-color: var(--border); color: var(--text); }
  .fjt-gallery { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 24px; margin-bottom: 4px; }
  .fjt-gallery-item { position: relative; aspect-ratio: 4/3; overflow: hidden; background: var(--charcoal); }
  .fjt-gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s cubic-bezier(0.22,1,0.36,1), filter 0.4s ease; filter: brightness(0.88) saturate(0.9); }
  .fjt-gallery-item:hover img { transform: scale(1.07); filter: brightness(1) saturate(1.1); }
  .fjt-gallery-item::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(212,175,55,0.1), transparent 60%); opacity: 0; transition: opacity 0.4s ease; pointer-events: none; }
  .fjt-gallery-item:hover::after { opacity: 1; }
  .fjt-gallery-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px 10px 8px; background: linear-gradient(to top, rgba(8,8,8,0.85), transparent); font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: rgba(212,175,55,0.7); opacity: 0; transform: translateY(4px); transition: opacity 0.3s ease, transform 0.3s ease; pointer-events: none; }
  .fjt-gallery-item:hover .fjt-gallery-caption { opacity: 1; transform: translateY(0); }
  .fjt-gallery-item:first-child { grid-column: span 2; aspect-ratio: 16/9; }
  .fjt-gallery-label { display: flex; align-items: center; gap: 12px; margin-top: 22px; margin-bottom: 10px; }
  .fjt-gallery-label span { font-size: 8px; letter-spacing: 4px; text-transform: uppercase; color: var(--muted); }
  .fjt-gallery-label::before, .fjt-gallery-label::after { content: ''; flex: 1; height: 1px; background: var(--border-subtle); }
  .fjt-gallery-label::before { flex: 0 0 20px; background: var(--gold); opacity: 0.4; }
  .fjt-day-highlight { display: flex; align-items: center; gap: 8px; margin-top: 20px; padding: 12px 0 0; border-top: 1px solid var(--border-subtle); flex-wrap: wrap; }
  .fjt-highlight-badge { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); background: rgba(212,175,55,0.07); border: 1px solid rgba(212,175,55,0.18); padding: 5px 11px; display: flex; align-items: center; gap: 6px; transition: background 0.3s, border-color 0.3s; }
  .fjt-highlight-badge:hover { background: rgba(212,175,55,0.13); border-color: rgba(212,175,55,0.35); }
  .fjt-highlight-badge .fjt-badge-icon { font-size: 11px; line-height: 1; }

  /* ============================================================
     PANEL 3 — RATES
  ============================================================ */
  .rates-intro {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    color: var(--muted);
    line-height: 1.8;
    font-style: italic;
    margin-bottom: 48px;
  }
  .rates-season-banner {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border-subtle);
    margin-bottom: 56px;
  }
  .rates-season-card {
    background: var(--card);
    padding: 32px 28px;
    position: relative;
    overflow: hidden;
  }
  .rates-season-card.peak { background: linear-gradient(135deg, rgba(212,175,55,0.06), var(--card)); }
  .rates-season-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; }
  .rates-season-card.peak::after { background: var(--gold); }
  .rates-season-card.high::after { background: rgba(212,175,55,0.5); }
  .rates-season-card.value::after { background: rgba(212,175,55,0.2); }
  .rates-season-label { font-size: 8px; letter-spacing: 4px; text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 10px; }
  .rates-season-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .rates-season-months { font-size: 11px; color: var(--muted); letter-spacing: 1px; margin-bottom: 20px; display: block; }
  .rates-season-price { font-family: 'Cormorant Garamond', serif; font-size: 48px; font-weight: 600; color: var(--gold); line-height: 1; }
  .rates-season-price span { font-size: 12px; font-family: 'Jost', sans-serif; color: var(--muted); font-weight: 300; }
  .rates-season-note { font-size: 11px; color: var(--muted); margin-top: 12px; line-height: 1.6; }

  /* Quarterly breakdown table */
  .rates-table-section { margin-bottom: 56px; }
  .rates-table { width: 100%; border-collapse: collapse; }
  .rates-table thead tr { border-bottom: 1px solid var(--border); }
  .rates-table thead th { font-size: 8px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); padding: 14px 20px; text-align: left; font-weight: 400; }
  .rates-table tbody tr { border-bottom: 1px solid var(--border-subtle); transition: background 0.3s; }
  .rates-table tbody tr:hover { background: rgba(212,175,55,0.03); }
  .rates-table tbody td { padding: 18px 20px; font-size: 13px; color: var(--muted); vertical-align: middle; }
  .rates-table tbody td:first-child { font-family: 'Playfair Display', serif; font-size: 16px; color: var(--text); }
  .rates-table .price-cell { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: var(--gold); font-weight: 600; }
  .rates-table .badge-peak { display: inline-block; font-size: 7px; letter-spacing: 2px; text-transform: uppercase; background: var(--gold); color: var(--black); padding: 3px 8px; margin-left: 8px; vertical-align: middle; }
  .rates-table .badge-high { display: inline-block; font-size: 7px; letter-spacing: 2px; text-transform: uppercase; border: 1px solid rgba(212,175,55,0.4); color: var(--gold); padding: 3px 8px; margin-left: 8px; vertical-align: middle; }
  .rates-table .badge-value { display: inline-block; font-size: 7px; letter-spacing: 2px; text-transform: uppercase; border: 1px solid var(--border-subtle); color: var(--muted); padding: 3px 8px; margin-left: 8px; vertical-align: middle; }
  .rates-table .badge-closed { display: inline-block; font-size: 7px; letter-spacing: 2px; text-transform: uppercase; background: rgba(255,255,255,0.05); color: var(--muted); padding: 3px 8px; margin-left: 8px; vertical-align: middle; }

  /* Group pricing */
  .rates-group-section { margin-bottom: 56px; }
  .rates-group-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 28px; }
  .rates-group-card { background: var(--charcoal); border: 1px solid var(--border-subtle); padding: 28px 24px; position: relative; }
  .rates-group-size { font-size: 8px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 8px; }
  .rates-group-title { font-family: 'Playfair Display', serif; font-size: 18px; color: var(--text); margin-bottom: 4px; }
  .rates-group-price { font-family: 'Cormorant Garamond', serif; font-size: 36px; color: var(--gold); font-weight: 600; }
  .rates-group-note { font-size: 11px; color: var(--muted); margin-top: 8px; line-height: 1.5; }
  .rates-group-saving { font-size: 10px; color: rgba(123,181,110,0.9); margin-top: 6px; letter-spacing: 1px; }

  /* Rates notes */
  .rates-notes { background: rgba(212,175,55,0.04); border: 1px solid var(--border); border-left: 3px solid var(--gold); padding: 32px; margin-bottom: 16px; }
  .rates-notes-title { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 16px; }
  .rates-notes ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .rates-notes ul li { font-size: 13px; color: var(--muted); display: flex; align-items: flex-start; gap: 12px; line-height: 1.6; }
  .rates-notes ul li::before { content: '—'; color: rgba(212,175,55,0.4); flex-shrink: 0; }

  /* ============================================================
     PANEL 4 — INCLUSIONS
  ============================================================ */
  .inclusions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 56px; }
  .inclusion-group h4 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; margin-bottom: 20px; }
  .inclusion-list { list-style: none; }
  .inclusion-list li { font-size: 13px; color: var(--muted); padding: 12px 0; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: flex-start; gap: 12px; line-height: 1.6; }
  .inclusion-list li::before { content: ''; width: 16px; height: 1px; background: var(--gold); flex-shrink: 0; margin-top: 9px; }
  .inclusion-list.excl li::before { background: rgba(180,60,60,.6); }

  /* Accommodation showcase */
  .inclusions-lodges { margin-bottom: 56px; }
  .lodge-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 28px; }
  .lodge-card { background: var(--charcoal); border: 1px solid var(--border-subtle); overflow: hidden; position: relative; }
  .lodge-card-img { height: 180px; background: var(--card); position: relative; overflow: hidden; }
  .lodge-card-img img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.8) saturate(0.9); transition: transform 0.6s ease, filter 0.4s ease; }
  .lodge-card:hover .lodge-card-img img { transform: scale(1.06); filter: brightness(0.95) saturate(1.1); }
  .lodge-card-body { padding: 20px 20px 24px; }
  .lodge-card-dest { font-size: 8px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 6px; }
  .lodge-card-name { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .lodge-card-desc { font-size: 12px; color: var(--muted); line-height: 1.7; }
  .lodge-card-nights { position: absolute; top: 12px; right: 12px; background: rgba(8,8,8,0.85); border: 1px solid var(--border); font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); padding: 5px 12px; }

  /* ============================================================
     PANEL 5 — GETTING THERE
  ============================================================ */
  .getting-there-intro {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    color: var(--muted);
    line-height: 1.8;
    font-style: italic;
    margin-bottom: 48px;
  }
  .gt-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 56px; }
  .gt-card { background: var(--charcoal); border: 1px solid var(--border-subtle); padding: 28px 24px; }
  .gt-card-icon { font-size: 24px; margin-bottom: 12px; display: block; }
  .gt-card-label { font-size: 8px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 8px; }
  .gt-card-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
  .gt-card-desc { font-size: 13px; color: var(--muted); line-height: 1.75; }
  .gt-airlines { margin-bottom: 56px; }
  .gt-airline-list { display: flex; flex-direction: column; gap: 0; margin-top: 24px; }
  .gt-airline-item { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--border-subtle); }
  .gt-airline-item:last-child { border-bottom: none; }
  .gt-airline-from { font-size: 13px; color: var(--text); }
  .gt-airline-carriers { font-size: 11px; color: var(--muted); }
  .gt-airline-time { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: var(--gold); }
  .gt-practical { margin-bottom: 56px; }
  .practical-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 24px; }
  .practical-item { background: var(--charcoal); padding: 24px; border: 1px solid var(--border-subtle); }
  .practical-item-label { font-size: 9px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; display: block; }
  .practical-item-value { font-size: 14px; color: var(--text); line-height: 1.6; }

  /* ============================================================
     PANEL 6 — ABOUT THE OPERATOR
  ============================================================ */
  .operator-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; margin-bottom: 56px; }
  .operator-intro { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: var(--muted); line-height: 1.8; font-style: italic; }
  .operator-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--border-subtle); }
  .operator-stat { background: var(--card); padding: 24px; text-align: center; }
  .operator-stat-num { font-family: 'Cormorant Garamond', serif; font-size: 40px; color: var(--gold); font-weight: 600; line-height: 1; display: block; }
  .operator-stat-label { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-top: 6px; display: block; }
  .operator-values { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 56px; }
  .operator-value-card { background: var(--charcoal); border: 1px solid var(--border-subtle); padding: 28px 24px; border-top: 2px solid var(--gold); }
  .operator-value-icon { font-size: 22px; margin-bottom: 12px; display: block; }
  .operator-value-title { font-family: 'Playfair Display', serif; font-size: 17px; color: var(--text); margin-bottom: 8px; }
  .operator-value-desc { font-size: 12px; color: var(--muted); line-height: 1.7; }
  .operator-team { margin-bottom: 56px; }
  .operator-guide-card { background: var(--charcoal); border: 1px solid var(--border); padding: 28px; display: grid; grid-template-columns: auto 1fr; gap: 24px; align-items: start; }
  .operator-guide-avatar { width: 72px; height: 72px; border-radius: 50%; background: var(--card); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
  .operator-guide-role { font-size: 8px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 4px; }
  .operator-guide-name { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--text); margin-bottom: 8px; }
  .operator-guide-bio { font-size: 13px; color: var(--muted); line-height: 1.7; }
  .operator-certifications { margin-bottom: 48px; }
  .cert-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; }
  .cert-badge { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); border: 1px solid var(--border); padding: 8px 16px; display: flex; align-items: center; gap: 8px; }
  .cert-badge::before { content: '✓'; color: var(--gold); font-size: 10px; }

  /* Seasonal calendar */
  .pkg-seasons { margin-bottom: 56px; }
  .seasons-bar{display:grid;grid-template-columns:repeat(12,1fr);gap:3px;margin-top:28px}
  .season-month{text-align:center}
  .season-month-label{font-size:7px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:4px}
  .season-indicator{height:6px;border-radius:1px}
  .season-peak{background:var(--gold)} .season-good{background:rgba(212,175,55,.4)} .season-off{background:rgba(255,255,255,.1)}

  /* ============================================================
     SIDEBAR
  ============================================================ */
.pkg-sidebar { padding: 80px 0 80px 48px; }
  .sidebar-card { position: sticky; top: 100px; background: var(--charcoal); border: 1px solid var(--border); padding: 44px 36px; }
  .sidebar-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 0% 0%, rgba(212,175,55,.06) 0%, transparent 60%); pointer-events: none; }
  .sidebar-price { font-family: 'Cormorant Garamond', serif; font-size: 56px; font-weight: 600; color: var(--gold); line-height: 1; margin-bottom: 6px; position: relative; z-index: 1; }
  .sidebar-price span { font-size: 14px; font-family: 'Jost', sans-serif; color: var(--muted); font-weight: 300; }
  .sidebar-per { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-bottom: 32px; position: relative; z-index: 1; }
  .sidebar-divider { height: 1px; background: var(--border); margin: 24px 0; }
  .sidebar-detail { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-subtle); position: relative; z-index: 1; }
  .sidebar-detail:last-of-type { border-bottom: none; }
  .sidebar-detail-label { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); }
  .sidebar-detail-value { font-size: 13px; color: var(--text); text-align: right; }
  .sidebar-details { margin-bottom: 32px; }
  .btn-book-now { display: block; text-align: center; font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 4px; text-transform: uppercase; padding: 20px; background: linear-gradient(135deg, var(--gold), var(--amber)); color: var(--black); text-decoration: none; cursor: none; position: relative; overflow: hidden; transition: transform .3s, box-shadow .3s; margin-bottom: 12px; }
  .btn-book-now::before { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,.2); transform: translateX(-100%) skewX(-15deg); transition: transform .5s; }
  .btn-book-now:hover::before { transform: translateX(200%) skewX(-15deg); }
  .btn-book-now:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(212,175,55,.4); }
  /* ── Quote Builder Sidebar ── */
  .sq-label { font-size: 8px; letter-spacing: 4px; text-transform: uppercase; color: var(--gold); display: block; margin-bottom: 12px; }
  .sq-price-display { margin-bottom: 6px; }
  .sq-price-num { font-family: 'Cormorant Garamond', serif; font-size: 48px; font-weight: 600; color: var(--gold); line-height: 1; display: block; transition: all 0.4s ease; }
  .sq-price-meta { font-size: 10px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; }
  .sq-total-row { display: flex; justify-content: space-between; align-items: center; background: rgba(212,175,55,0.06); border: 1px solid var(--border); padding: 10px 14px; margin-top: 10px; position: relative; z-index: 1; }
  .sq-total-label { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); }
  .sq-total-val { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: var(--gold); font-weight: 600; transition: all 0.3s ease; }
  .sq-field { position: relative; z-index: 1; }
  .sq-field-label { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); display: block; margin-bottom: 10px; }
  .sq-field-note { font-size: 10px; color: var(--muted); margin-top: 6px; display: block; font-style: italic; line-height: 1.5; }
  .sq-date-wrap { position: relative; }
  .sq-date-input { width: 100%; background: var(--charcoal); border: 1px solid var(--border); color: var(--text); font-family: 'Jost', sans-serif; font-size: 13px; padding: 12px 40px 12px 14px; cursor: none; outline: none; letter-spacing: 1px; transition: border-color 0.3s; }
  .sq-date-input:focus, .sq-date-input.open { border-color: var(--gold); }
  .sq-date-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; pointer-events: none; }
  /* Calendar */
  .sq-calendar { display: none; background: #0f0f0f; border: 1px solid var(--border); padding: 16px; margin-top: 4px; position: relative; z-index: 200; }
  .sq-calendar.open { display: block; }
  .sq-cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .sq-cal-month { font-family: 'Playfair Display', serif; font-size: 15px; color: var(--text); }
  .sq-cal-nav { background: none; border: 1px solid var(--border); color: var(--gold); width: 28px; height: 28px; cursor: none; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: background 0.2s, border-color 0.2s; }
  .sq-cal-nav:hover { background: var(--gold-dim); border-color: var(--gold); }
  .sq-cal-days-header { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 6px; }
  .sq-cal-days-header span { font-size: 8px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); text-align: center; padding: 4px 0; }
  .sq-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
  .sq-cal-day { font-size: 11px; color: var(--muted); text-align: center; padding: 7px 2px; cursor: none; transition: background 0.2s, color 0.2s; position: relative; border-radius: 1px; }
  .sq-cal-day:hover:not(.empty):not(.past) { background: var(--gold-dim); color: var(--text); }
  .sq-cal-day.selected { background: var(--gold); color: var(--black); font-weight: 600; }
  .sq-cal-day.today { color: var(--gold); }
  .sq-cal-day.past { opacity: 0.25; pointer-events: none; }
  .sq-cal-day.empty { pointer-events: none; }
  .sq-cal-day.peak { border-bottom: 2px solid var(--gold); }
  .sq-cal-day.high { border-bottom: 2px solid rgba(212,175,55,0.4); }
  .sq-cal-day.green-season { border-bottom: 2px solid rgba(123,181,110,0.5); }
  .sq-cal-legend { display: flex; gap: 12px; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-subtle); }
  .sq-cal-leg-item { display: flex; align-items: center; gap: 5px; font-size: 9px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; }
  .sq-cal-leg-dot { width: 12px; height: 3px; border-radius: 1px; flex-shrink: 0; }
  .sq-cal-leg-dot.peak { background: var(--gold); }
  .sq-cal-leg-dot.high { background: rgba(212,175,55,0.4); }
  .sq-cal-leg-dot.green { background: rgba(123,181,110,0.5); }
  /* Counter */
  .sq-counter { display: flex; align-items: center; gap: 0; border: 1px solid var(--border); width: fit-content; }
  .sq-counter-btn { background: var(--charcoal); border: none; color: var(--gold); width: 36px; height: 36px; font-size: 18px; cursor: none; transition: background 0.2s; display: flex; align-items: center; justify-content: center; line-height: 1; }
  .sq-counter-btn:hover { background: var(--gold-dim); }
  .sq-counter-val { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: var(--text); width: 44px; text-align: center; background: transparent; font-weight: 600; }
  /* Children toggle */
  .sq-children-toggle { display: flex; align-items: center; justify-content: space-between; }
  .sq-toggle-wrap { position: relative; }
  .sq-toggle-input { display: none; }
  .sq-toggle-track { display: block; width: 44px; height: 24px; background: var(--charcoal); border: 1px solid var(--border); cursor: none; position: relative; transition: background 0.3s, border-color 0.3s; }
  .sq-toggle-input:checked + .sq-toggle-track { background: rgba(212,175,55,0.2); border-color: var(--gold); }
  .sq-toggle-thumb { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; background: var(--muted); transition: transform 0.3s, background 0.3s; }
  .sq-toggle-input:checked + .sq-toggle-track .sq-toggle-thumb { transform: translateX(20px); background: var(--gold); }
  .sq-children-section { display: none; }
  .sq-children-section.open { display: block; }
  .sq-child-ages { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
  .sq-child-age-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-subtle); }
  .sq-child-age-row:last-child { border-bottom: none; }
  .sq-child-age-label { font-size: 11px; color: var(--muted); letter-spacing: 1px; }
  .sq-child-age-select { background: var(--charcoal); border: 1px solid var(--border); color: var(--text); font-family: 'Jost', sans-serif; font-size: 11px; padding: 6px 10px; cursor: none; outline: none; transition: border-color 0.2s; appearance: none; -webkit-appearance: none; }
  .sq-child-age-select:focus { border-color: var(--gold); }
  /* Breakdown */
  .sq-breakdown { background: rgba(0,0,0,0.3); padding: 16px; border: 1px solid var(--border-subtle); }
  .sq-breakdown-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-subtle); font-size: 12px; color: var(--muted); }
  .sq-breakdown-row:last-child { border-bottom: none; }
  .sq-breakdown-row span:last-child { font-family: 'Cormorant Garamond', serif; font-size: 16px; color: var(--text); }
  .sq-breakdown-deposit { margin-top: 4px; }
  .sq-breakdown-deposit span:first-child { color: var(--gold); }
  .sq-breakdown-deposit span:last-child { color: var(--gold); font-size: 18px; font-weight: 600; }
  /* Flash animation when price updates */
  @keyframes priceFlash { 0%,100%{opacity:1} 50%{opacity:0.4} }
  .price-flash { animation: priceFlash 0.4s ease; }
  .btn-book-now-sub { font-size: 8px; letter-spacing: 2px; opacity: 0.7; font-weight: 300; display: block; margin-top: 4px; }
  .btn-whatsapp { display: flex; align-items: center; justify-content: center; gap: 10px; text-align: center; font-family: 'Jost', sans-serif; font-size: 10px; font-weight: 400; letter-spacing: 4px; text-transform: uppercase; padding: 16px; background: transparent; color: var(--gold); border: 1px solid var(--border); text-decoration: none; cursor: none; transition: background .3s, border-color .3s; }
  .btn-whatsapp:hover { background: var(--gold-dim); border-color: var(--gold); }
  .btn-whatsapp svg { width: 16px; height: 16px; fill: var(--gold); }
  .sidebar-note { margin-top: 20px; font-size: 11px; color: var(--muted); line-height: 1.7; text-align: center; font-style: italic; font-family: 'Cormorant Garamond', serif; position: relative; z-index: 1; }

  /* ============================================================
     REVEAL ANIMATION
  ============================================================ */
  .reveal { opacity: 0; transform: translateY(32px); transition: opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1); }
  .reveal.visible { opacity: 1; transform: translateY(0); }

  /* ============================================================
     RELATED & FOOTER
  ============================================================ */
  .pkg-related{background:var(--charcoal);padding:100px 0;}
  .pkg-related-inner{max-width:1400px;margin:0 auto;padding:0 48px}
  .related-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
  .related-card{background:var(--card);border:1px solid var(--border-subtle);padding:36px 28px;cursor:none;transition:transform .4s,border-color .4s,box-shadow .4s;text-decoration:none;display:block;color:inherit;position:relative;overflow:hidden}
  .related-card::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--gold-dim),transparent);opacity:0;transition:opacity .4s}
  .related-card:hover{transform:translateY(-6px);border-color:var(--border);box-shadow:0 24px 60px rgba(0,0,0,.5)}
  .related-card:hover::after{opacity:1}
  .related-duration{font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:10px;position:relative;z-index:1}
  .related-name{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;line-height:1.2;margin-bottom:12px;position:relative;z-index:1}
  .related-price{font-family:'Cormorant Garamond',serif;font-size:32px;color:var(--gold);position:relative;z-index:1}
  .related-price span{font-size:13px;color:var(--muted);font-family:'Jost',sans-serif;font-weight:300}
  .related-cta-text{margin-top:20px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:8px;position:relative;z-index:1}
  .related-cta-text::after{content:'';width:20px;height:1px;background:var(--gold);transition:width .3s}
  .related-card:hover .related-cta-text::after{width:36px}
  footer{background:var(--black);border-top:1px solid var(--border);padding:60px 0 40px;}
  .footer-inner-wrap{max-width:1400px;margin:0 auto;padding:0 48px}
  .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:60px;margin-bottom:40px}
  .footer-brand h2{font-family:'Playfair Display',serif;font-size:22px;color:var(--gold);margin-bottom:12px}
  .footer-brand p{font-size:13px;color:var(--muted);line-height:1.8;max-width:280px}
  .footer-col h4{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:16px}
  .footer-col a{display:block;font-size:13px;color:var(--muted);text-decoration:none;margin-bottom:8px;transition:color .3s;cursor:none}
  .footer-col a:hover{color:var(--text)}
  .footer-bottom{border-top:1px solid var(--border-subtle);padding-top:24px;display:flex;justify-content:space-between}
  .footer-bottom span{font-size:11px;color:var(--muted)}
  .whatsapp-fab{position:fixed;bottom:36px;right:36px;width:60px;height:60px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;z-index:90;text-decoration:none;box-shadow:0 8px 30px rgba(37,211,102,.4);cursor:none;transition:transform .3s,box-shadow .3s}
  .whatsapp-fab:hover{transform:scale(1.1);box-shadow:0 12px 40px rgba(37,211,102,.6)}
  .whatsapp-fab svg{width:28px;height:28px;fill:white}
  .wa-tooltip{position:absolute;right:70px;white-space:nowrap;background:rgba(10,10,10,.9);border:1px solid var(--border);color:var(--text);font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:8px 16px;opacity:0;transform:translateX(10px);transition:opacity .3s,transform .3s;pointer-events:none}
  .whatsapp-fab:hover .wa-tooltip{opacity:1;transform:translateX(0)}

  /* MOBILE RESERVE BUTTON — above related section, phone only */
.mobile-reserve-section {
  display: none;
}

@media (max-width: 1100px) {
  .mobile-reserve-section {
    display: block;
    padding: 48px 24px 56px;
    background: var(--black);
    border-top: 1px solid var(--border-subtle);
  }

  .mobile-reserve-btn {
    display: block;
    text-align: center;
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 4px;
    text-transform: uppercase;
    padding: 22px;
    background: linear-gradient(135deg, var(--gold), var(--amber));
    color: var(--black);
    text-decoration: none;
    cursor: none;
    position: relative;
    overflow: hidden;
    transition: transform .3s, box-shadow .3s;
  }

  .mobile-reserve-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,.2);
    transform: translateX(-100%) skewX(-15deg);
    transition: transform .5s;
  }

  .mobile-reserve-btn:hover::before {
    transform: translateX(200%) skewX(-15deg);
  }

  .mobile-reserve-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(212,175,55,.4);
  }

  .mobile-reserve-sub {
    font-size: 8px;
    letter-spacing: 2px;
    opacity: 0.7;
    font-weight: 300;
    display: block;
    margin-top: 5px;
  }
}

  /* ============================================================
     RESPONSIVE
  ============================================================ */
@media(max-width:1100px){
    .pkg-main{grid-template-columns:1fr;display:flex;flex-direction:column;}
    .pkg-content{padding-right:0;border-right:none;order:2;}
    .pkg-sidebar{padding:0 24px 40px;order:1;}
    .sidebar-card{position:relative;top:auto;}
    .pkg-tabs-wrapper{
      position:sticky;
      top:62px;
      z-index:99;
      margin-left:0;
      padding-left:0;
      margin-right:0;
    }
    .pkg-tabs-wrapper::after{content:'';position:absolute;top:0;right:0;width:48px;height:100%;background:linear-gradient(to right,transparent,rgba(8,8,8,0.85));pointer-events:none;z-index:10;}
    body{padding-bottom:90px;}
    .pkg-main{padding-top:0;}
    .pkg-main,
    .pkg-content,
    .pkg-sidebar,
    .pkg-tab-panel,
    .pkg-tabs-wrapper{
      max-width:100%;
    }
    .pkg-tabs-wrapper {
  position: sticky;
  top: 62px;
  z-index: 99;
  margin-left: 0;
  padding-left: 0;
  margin-right: 0;
  /* Ensure it only sticks within pkg-content, not beyond */
  align-self: flex-start;
}  
}
@media(max-width:900px){
    nav{padding:20px 24px}
    .pkg-hero-content{padding:0 24px 46px}
    .pkg-hero{height:72vh;min-height:460px;}
    .pkg-hero-title{font-size:48px}
    .pkg-main{padding:0 24px}
    .pkg-hero-price-item{display:none;}
    .pkg-hero-price-sep{display:none;}
    .overview-highlights{grid-template-columns:1fr}
    .rates-season-banner{grid-template-columns:1fr}
    .rates-group-grid{grid-template-columns:1fr}
    .inclusions-grid{grid-template-columns:1fr}
    .lodge-grid{grid-template-columns:1fr}
    .gt-grid{grid-template-columns:1fr}
    .practical-grid{grid-template-columns:1fr}
    .operator-hero{grid-template-columns:1fr}
    .operator-values{grid-template-columns:1fr}
    .related-grid{grid-template-columns:1fr}
    .footer-grid{grid-template-columns:1fr;gap:40px}
    .footer-inner-wrap{padding:0 24px}
    .footer-bottom{flex-direction:column;gap:8px}
    .map-layout{grid-template-columns:1fr}
    .fjt-gallery{grid-template-columns:repeat(2,1fr)}
    .fjt-gallery-item:first-child{grid-column:span 2}
    .rates-table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;}
    .gt-airline-item{flex-direction:column;align-items:flex-start;gap:4px;}
    .day-activities{gap:6px;}
}

  @media (max-width: 480px) {
  .pkg-main { padding: 0 16px; }
  .pkg-sidebar { padding: 0 16px 40px; }
  .mobile-reserve-section { padding: 36px 16px 48px; }
  .pkg-hero-content { padding: 0 16px 40px; }
  .pkg-hero-meta { gap: 20px; }

  .fjt-gallery {
    grid-template-columns: 1fr 1fr;
    gap: 4px;
  }

  .rates-table thead { display: none; }
  .rates-table tbody tr {
    display: block;
    border: 1px solid var(--border-subtle);
    margin-bottom: 12px;
    padding: 12px;
  }
  .rates-table tbody td {
    display: block;
    padding: 4px 0;
    font-size: 12px;
  }
  .rates-table tbody td:first-child {
    font-size: 14px;
    margin-bottom: 4px;
  }

  .sq-breakdown-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
}

  /* Mobile sticky bar */
  @media(max-width:1100px){
    .mobile-book-bar{display:flex;align-items:center;justify-content:space-between;position:fixed;bottom:0;left:0;right:0;z-index:200;background:rgba(8,8,8,0.97);border-top:1px solid var(--border);padding:14px 20px;backdrop-filter:blur(20px);gap:16px}
    .mobile-book-price{display:flex;flex-direction:column}
    .mobile-book-price-num{font-family:'Cormorant Garamond',serif;font-size:26px;color:var(--gold);line-height:1}
    .mobile-book-price-label{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin-top:2px}
    .mobile-book-btn{font-family:'Jost',sans-serif;font-size:9px;font-weight:500;letter-spacing:3px;text-transform:uppercase;padding:14px 20px;background:linear-gradient(135deg,var(--gold),var(--amber));color:var(--black);text-decoration:none;cursor:none;white-space:nowrap;flex-shrink:0}
  }
  @media(min-width:1101px){
    .mobile-book-bar{display:none}
    .mobile-quote-inject { display: none; }
  }
</style>
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="cursor-ring" id="cursorRing"></div>

<nav id="navbar">
  <a href="/home/" class="nav-logo-link">
    <img src="/assets/FILMAX_JAMBO_TOURS__1_-removebg-preview.webp" alt="Filmax Jambo Tours" class="nav-logo-img">
  </a>
  <a href="/packages/" class="nav-back">All Packages</a>
</nav>

<div class="pkg-hero">
  <div class="pkg-hero-bg">
    <img class="pkg-hero-img" src="${pkg.hero_image_url||''}" alt="${pkg.name}">
    <div class="pkg-hero-overlay"></div>
    <div class="pkg-hero-overlay-gold"></div>
  </div>
  <div class="pkg-hero-content">
    <div class="pkg-hero-breadcrumb">
      <span>Packages</span><span class="sep">—</span>
      <span>${pkg.category||''}</span><span class="sep">—</span>
      <span class="cur">${pkg.name}</span>
    </div>
    <span class="pkg-hero-badge">${pkg.badge||''}</span>
    <h1 class="pkg-hero-title">${heroTitleLine1}<br><em>${heroTitleLine2}</em></h1>
    <div class="pkg-hero-meta">
      <div class="pkg-hero-meta-item">
        <span class="pkg-hero-meta-label">Duration</span>
        <span class="pkg-hero-meta-value">${pkg.duration_days} Days · ${pkg.duration_nights} Nights</span>
      </div>
      <div class="pkg-hero-meta-sep"></div>
      <div class="pkg-hero-meta-item">
        <span class="pkg-hero-meta-label">Destinations</span>
        <span class="pkg-hero-meta-value">${destinations}</span>
      </div>
      <div class="pkg-hero-meta-sep"></div>
      <div class="pkg-hero-meta-item">
        <span class="pkg-hero-meta-label">Category</span>
        <span class="pkg-hero-meta-value">${pkg.category||''}</span>
      </div>
      <div class="pkg-hero-meta-sep pkg-hero-price-sep"></div>
      <div class="pkg-hero-meta-item pkg-hero-price-item">
        <span class="pkg-hero-meta-label">From</span>
        <div class="pkg-hero-price-hero">$${price.toLocaleString()} <span>/ person</span></div>
      </div>
    </div>
  </div>
  <div class="scroll-cue"><span>Scroll</span><div class="scroll-line"></div></div>
</div>

<div class="mobile-quote-inject" id="mobileQuoteInject"></div>
<div class="pkg-main" id="pkgMain">
  <div class="pkg-content">
    <div class="pkg-tabs-wrapper" id="pkgTabsWrapper">
      <div class="pkg-tabs" role="tablist">
        <button class="pkg-tab active" data-tab="overview">Overview</button>
        <button class="pkg-tab" data-tab="itinerary">Day by Day</button>
        <button class="pkg-tab" data-tab="rates">Rates &amp; Seasons</button>
        <button class="pkg-tab" data-tab="inclusions">Accommodation</button>
        <button class="pkg-tab" data-tab="getting-there">Getting There</button>
        <button class="pkg-tab" data-tab="operator">Offered By</button>
      </div>
    </div>

    <!-- OVERVIEW -->
    <div class="pkg-tab-panel active" id="panel-overview">
      <div class="overview-intro reveal">
        <span class="sec-label">The Journey</span>
        <h2 class="sec-title">${pkg.overview_title||pkg.name}</h2>
        <p>${pkg.overview_body||''}</p>
        ${pkg.overview_body_2 ? `<p>${pkg.overview_body_2}</p>` : ''}
        <div class="sec-divider"></div>
      </div>
      <div class="overview-map-section reveal">
        <span class="sec-label">Your Route</span>
        <h2 class="sec-title">${destinations}</h2>
        <div class="kenya-map-container">
          <div class="map-layout">
            <div class="kenya-svg-wrap">
              <div id="kenya-google-map" style="width:100%;height:100%;min-height:350px;"></div>
            </div>
            <div class="map-legend">
              <span class="map-legend-title">Route Sequence</span>
              ${mapLegendHTML}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ITINERARY -->
    <div class="pkg-tab-panel" id="panel-itinerary">
      <div class="pkg-itinerary reveal">
        <span class="sec-label">Day by Day</span>
        <h2 class="sec-title">Your Itinerary</h2>
        <div class="sec-divider"></div>
        <div class="itinerary-days-wrapper">
          ${daysHTML}
        </div>
      </div>
    </div>

    <!-- RATES -->
    <div class="pkg-tab-panel" id="panel-rates">
      <div class="reveal">
        <span class="sec-label">Investment</span>
        <h2 class="sec-title">Rates &amp; Seasonal Pricing</h2>
        <p class="rates-intro">All rates are per person, based on two guests sharing. Transparent pricing — no hidden fees.</p>
      </div>
      <div class="rates-season-banner reveal">
        <div class="rates-season-card peak">
          <span class="rates-season-label">Season</span>
          <div class="rates-season-title">Peak Season</div>
          <span class="rates-season-months">${peakMonths}</span>
          <div class="rates-season-price">$${pricePeak.toLocaleString()} <span>/ person</span></div>
        </div>
        <div class="rates-season-card high">
          <span class="rates-season-label">Season</span>
          <div class="rates-season-title">High Season</div>
          <span class="rates-season-months">${highMonths}</span>
          <div class="rates-season-price">$${price.toLocaleString()} <span>/ person</span></div>
        </div>
        <div class="rates-season-card value">
          <span class="rates-season-label">Season</span>
          <div class="rates-season-title">Green Season</div>
          <span class="rates-season-months">${greenMonths}</span>
          <div class="rates-season-price">$${priceGreen.toLocaleString()} <span>/ person</span></div>
        </div>
      </div>
      <div class="rates-group-section reveal">
        <span class="sec-label">Group Configuration</span>
        <h3 class="sec-title" style="font-size:26px">Pricing by Group Size</h3>
        <div class="sec-divider"></div>
        <div class="rates-group-grid">
          <div class="rates-group-card">
            <span class="rates-group-size">Solo Traveller</span>
            <div class="rates-group-title">Private Solo</div>
            <div class="rates-group-price">$${priceSolo.toLocaleString()}</div>
          </div>
          <div class="rates-group-card" style="border-color:rgba(212,175,55,0.3);">
            <span class="rates-group-size">2 Guests · Most Popular</span>
            <div class="rates-group-title">Couple / Duo</div>
            <div class="rates-group-price">$${priceDuo.toLocaleString()}</div>
            <p class="rates-group-saving">✓ Best value per person</p>
          </div>
          <div class="rates-group-card">
            <span class="rates-group-size">3–4 Guests</span>
            <div class="rates-group-title">Small Group</div>
            <div class="rates-group-price">$${priceGroup.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ACCOMMODATION -->
    <div class="pkg-tab-panel" id="panel-inclusions">
      <div class="inclusions-lodges reveal">
        <span class="sec-label">Where You Stay</span>
        <h3 class="sec-title" style="font-size:26px">Your Accommodation Portfolio</h3>
        <div class="sec-divider"></div>
        <div class="lodge-grid">${lodgesHTML}</div>
      </div>
      <div class="inclusions-grid reveal">
        <div class="inclusion-group">
          <span class="sec-label">Included</span>
          <h4>Everything Within</h4>
          <ul class="inclusion-list">${includedHTML}</ul>
        </div>
        <div class="inclusion-group">
          <span class="sec-label">Not Included</span>
          <h4>Arranged Separately</h4>
          <ul class="inclusion-list excl">${excludedHTML}</ul>
        </div>
      </div>
    </div>

    <!-- GETTING THERE (static — same for all Kenya packages) -->
    <div class="pkg-tab-panel" id="panel-getting-there">
      <div class="reveal">
        <span class="sec-label">Arrival &amp; Logistics</span>
        <h2 class="sec-title">Getting to Nairobi</h2>
        <p class="getting-there-intro">Your international journey ends at Jomo Kenyatta International Airport (NBO) in Nairobi. From there, Filmax Jambo takes complete charge — a dedicated transfer vehicle meets you at arrivals and delivers you to Wilson Airport or your pre-departure hotel.</p>
      </div>
      <div class="gt-grid reveal">
        <div class="gt-card"><span class="gt-card-icon">🛬</span><span class="gt-card-label">Your Gateway</span><div class="gt-card-title">Jomo Kenyatta International Airport</div><p class="gt-card-desc">IATA: NBO. 15 km from Nairobi CBD. All airport transfers arranged in private air-conditioned vehicles.</p></div>
        <div class="gt-card"><span class="gt-card-icon">✈️</span><span class="gt-card-label">Transport Type</span><div class="gt-card-title">${pkg.transport_type||'Safari Vehicle'}</div><p class="gt-card-desc">All internal transfers for this package are by ${pkg.transport_type||'private vehicle'}. Your concierge coordinates all logistics.</p></div>
        <div class="gt-card"><span class="gt-card-icon">🏨</span><span class="gt-card-label">Pre-Safari Option</span><div class="gt-card-title">Nairobi Pre-Safari Night</div><p class="gt-card-desc">We recommend arriving the night before. Hemingways Nairobi, The Norfolk, and Giraffe Manor available on request.</p></div>
        <div class="gt-card"><span class="gt-card-icon">💊</span><span class="gt-card-label">Health</span><div class="gt-card-title">Malaria &amp; Vaccinations</div><p class="gt-card-desc">Malaria prophylaxis required. Yellow fever certificate may be required depending on your origin country. Consult your GP 6–8 weeks before travel.</p></div>
      </div>
    </div>

    <!-- OFFERED BY -->
    <div class="pkg-tab-panel" id="panel-operator">
      <div class="reveal">
        <span class="sec-label">Your Hosts</span>
        <h2 class="sec-title">About Filmax Jambo Tours</h2>
      </div>
      <div class="operator-hero reveal">
        <div>
          <p class="operator-intro">Filmax Jambo Tours was founded in Nairobi with a single conviction: that a safari should be as extraordinary in its execution as Kenya is in its raw material. We design ultra-luxury journeys for discerning travellers who require complete exclusivity, expert guidance, and the certainty of encountering Kenya at its absolute finest.</p>
          <div class="sec-divider"></div>
          <p style="font-size:13px;color:var(--muted);line-height:1.8;">We work with a fixed roster of hand-selected guides, pilots, and lodge partners. Every journey is private and arranged from scratch for each guest.</p>
        </div>
        <div class="operator-stats">
          <div class="operator-stat"><span class="operator-stat-num">100%</span><span class="operator-stat-label">Private Journeys</span></div>
          <div class="operator-stat"><span class="operator-stat-num">4</span><span class="operator-stat-label">Ecosystems Mastered</span></div>
          <div class="operator-stat"><span class="operator-stat-num">48hr</span><span class="operator-stat-label">Response Guarantee</span></div>
          <div class="operator-stat"><span class="operator-stat-num">24/7</span><span class="operator-stat-label">In-Kenya Support</span></div>
        </div>
      </div>
      <div class="pkg-seasons reveal">
        <span class="sec-label">When to Go</span>
        <h3 class="sec-title" style="font-size:26px">Best Seasons for ${pkg.name}</h3>
        <div class="sec-divider"></div>
        <div class="seasons-bar">${seasonBarMonths}</div>
        <div style="display:flex;gap:20px;margin-top:12px;">
          <div style="display:flex;align-items:center;gap:8px;"><div style="width:20px;height:4px;background:var(--gold);border-radius:1px;"></div><span style="font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;">Peak</span></div>
          <div style="display:flex;align-items:center;gap:8px;"><div style="width:20px;height:4px;background:rgba(212,175,55,.4);border-radius:1px;"></div><span style="font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;">Good</span></div>
          <div style="display:flex;align-items:center;gap:8px;"><div style="width:20px;height:4px;background:rgba(255,255,255,.1);border-radius:1px;"></div><span style="font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;">Low</span></div>
        </div>
      </div>
    </div>

  </div><!-- /pkg-content -->

  <!-- SIDEBAR -->
  <div class="pkg-sidebar">
    <div class="sidebar-card reveal">
      <span class="sq-label">Plan Your Journey</span>
      <div class="sq-price-display">
        <span class="sq-price-num" id="sqPriceNum">$${price.toLocaleString()}</span>
        <span class="sq-price-meta">per person · <span id="sqSeason">High Season</span></span>
      </div>
      <div class="sq-total-row">
        <span class="sq-total-label">Estimated Total</span>
        <span class="sq-total-val" id="sqTotal">$${(price*2).toLocaleString()}</span>
      </div>
      <div class="sidebar-divider"></div>
      <div class="sq-field">
        <label class="sq-field-label">Departure Date</label>
        <div class="sq-date-wrap">
          <input type="text" id="sqDateInput" class="sq-date-input" placeholder="Select a date" readonly>
          <span class="sq-date-icon">📅</span>
        </div>
        <div class="sq-calendar" id="sqCalendar">
          <div class="sq-cal-header">
            <button class="sq-cal-nav" id="sqCalPrev">‹</button>
            <span class="sq-cal-month" id="sqCalMonth"></span>
            <button class="sq-cal-nav" id="sqCalNext">›</button>
          </div>
          <div class="sq-cal-days-header"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>
          <div class="sq-cal-grid" id="sqCalGrid"></div>
          <div class="sq-cal-legend">
            <span class="sq-cal-leg-item"><span class="sq-cal-leg-dot peak"></span>Peak</span>
            <span class="sq-cal-leg-item"><span class="sq-cal-leg-dot high"></span>High</span>
            <span class="sq-cal-leg-item"><span class="sq-cal-leg-dot green"></span>Green</span>
          </div>
        </div>
      </div>
      <div class="sidebar-divider"></div>
      <div class="sq-field">
        <label class="sq-field-label">Adult Travellers</label>
        <div class="sq-counter">
          <button class="sq-counter-btn" id="sqAdultMinus">−</button>
          <span class="sq-counter-val" id="sqAdultVal">2</span>
          <button class="sq-counter-btn" id="sqAdultPlus">+</button>
        </div>
        <span class="sq-field-note">Max 4 guests per private charter</span>
      </div>
      <div class="sidebar-divider"></div>
      <div class="sq-field">
        <div class="sq-children-toggle">
          <label class="sq-field-label" style="margin-bottom:0">Travelling with children?</label>
          <div class="sq-toggle-wrap">
            <input type="checkbox" id="sqChildToggle" class="sq-toggle-input">
            <label for="sqChildToggle" class="sq-toggle-track"><span class="sq-toggle-thumb"></span></label>
          </div>
        </div>
        <div class="sq-children-section" id="sqChildSection">
          <div class="sq-field" style="margin-top:16px;">
            <label class="sq-field-label">Number of Children</label>
            <div class="sq-counter">
              <button class="sq-counter-btn" id="sqChildMinus">−</button>
              <span class="sq-counter-val" id="sqChildVal">1</span>
              <button class="sq-counter-btn" id="sqChildPlus">+</button>
            </div>
          </div>
          <div id="sqChildAges" class="sq-child-ages"></div>
          <p class="sq-field-note" style="margin-top:10px;">Children under 5 travel free. Ages 5–11 at 50% rate. Ages 12+ at full adult rate.</p>
        </div>
      </div>
      <div class="sidebar-divider"></div>
      <div class="sq-breakdown" id="sqBreakdown">
        <div class="sq-breakdown-row"><span>Adults (2 × $${price.toLocaleString()})</span><span id="sqAdultTotal">$${(price*2).toLocaleString()}</span></div>
        <div class="sq-breakdown-row" id="sqChildRow" style="display:none"><span id="sqChildLabel">Children</span><span id="sqChildTotal">$0</span></div>
        <div class="sq-breakdown-row sq-breakdown-deposit"><span>30% Deposit</span><span id="sqDeposit">$${Math.round(price*2*0.3).toLocaleString()}</span></div>
      </div>
      <div class="sidebar-divider"></div>
      <a id="sidebarReserveBtn" href="/reserve/" class="btn-book-now">Reserve This Journey</a>
      <a href="https://wa.me/34672304384?text=${waMsg}" class="btn-whatsapp" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Enquire via WhatsApp
      </a>
      <p class="sidebar-note">Estimate updates live as you configure. Final quote confirmed by your concierge within 24 hours.</p>
    </div>
  </div>
</div>

<div class="mobile-book-bar">
  <div class="mobile-book-price">
    <span class="mobile-book-price-num">$${price.toLocaleString()}</span>
    <span class="mobile-book-price-label">per person</span>
  </div>
  <a href="/reserve/" class="mobile-book-btn">Reserve This Journey</a>
</div>

<footer style="width:100%;max-width:100%;box-sizing:border-box;">
  <div class="footer-inner-wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <h2>Filmax Jambo Tours</h2>
        <p>Kenya's most exclusive safari house. Crafting extraordinary wilderness encounters since 2025.</p>
      </div>
      <div class="footer-col">
        <h4>Explore</h4>
        <a href="/home/#highlights">Safaris</a>
        <a href="/packages/">All Packages</a>
        <a href="/home/#contact">Contact</a>
      </div>
      <div class="footer-col">
        <h4>Destinations</h4>
        ${(pkg.destinations||[]).map(d=>`<a href="/packages/?destination=${d.toLowerCase().replace(/\s+/g,'-')}">${d}</a>`).join('')}
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2025 Filmax Jambo Tours · All rights reserved</span>
      <span>Crafted with passion in Nairobi 🌍</span>
    </div>
  </div>
</footer>

<a href="https://wa.me/34672304384?text=${waMsg}" class="whatsapp-fab" target="_blank" rel="noopener">
  <span class="wa-tooltip">Book via WhatsApp</span>
  <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</a>

<script>
// Cursor
const cursor=document.getElementById('cursor'),ring=document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px';});
(function animRing(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animRing);})();
document.querySelectorAll('a,button,.day-header').forEach(el=>{el.addEventListener('mouseenter',()=>{cursor.style.width='20px';cursor.style.height='20px';ring.style.width='60px';ring.style.height='60px';});el.addEventListener('mouseleave',()=>{cursor.style.width='12px';cursor.style.height='12px';ring.style.width='40px';ring.style.height='40px';});});
// Navbar
const navbar=document.getElementById('navbar');
window.addEventListener('scroll',()=>navbar.classList.toggle('scrolled',window.scrollY>50));
// Reveal
const revObs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}),{threshold:.06,rootMargin:'0px 0px -30px 0px'});
document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));
// Tabs
const tabs=document.querySelectorAll('.pkg-tab'),panels=document.querySelectorAll('.pkg-tab-panel');
tabs.forEach(tab=>{tab.addEventListener('click',function(){const t=this.dataset.tab;if(window.innerWidth<=1100){tabs.forEach(x=>x.classList.remove('active'));this.classList.add('active');const p=document.getElementById('panel-'+t);if(p){p.querySelectorAll('.reveal').forEach(el=>{if(!el.classList.contains('visible'))setTimeout(()=>el.classList.add('visible'),80);});setTimeout(()=>{const top=p.getBoundingClientRect().top+window.pageYOffset-110;window.scrollTo({top,behavior:'smooth'});},50);}}else{tabs.forEach(x=>x.classList.remove('active'));panels.forEach(x=>x.classList.remove('active'));this.classList.add('active');const p=document.getElementById('panel-'+t);if(p){p.classList.add('active');p.querySelectorAll('.reveal').forEach(el=>{if(!el.classList.contains('visible'))setTimeout(()=>el.classList.add('visible'),80);});}const m=document.getElementById('pkgMain');if(m)window.scrollTo({top:m.getBoundingClientRect().top+window.pageYOffset-80,behavior:'smooth'});}});});
// Accordion
document.querySelectorAll('.day-header').forEach(h=>{h.addEventListener('click',function(){const d=h.closest('.itinerary-day');if(d)d.classList.toggle('open');});});
// Scroll spy
(function(){const tw=document.getElementById('pkgTabsWrapper');const allPanels=Array.from(document.querySelectorAll('.pkg-tab-panel'));const allTabs=Array.from(document.querySelectorAll('.pkg-tab'));window.addEventListener('scroll',function(){if(window.innerWidth>1100)return;const off=(tw?tw.offsetHeight:60)+62+20;let cur=null;allPanels.forEach(p=>{if(p.getBoundingClientRect().top<=off)cur=p;});if(cur){allTabs.forEach(t=>t.classList.remove('active'));const id=cur.id.replace('panel-','');const at=allTabs.find(t=>t.dataset.tab===id);if(at){at.classList.add('active');const tel=tw?tw.querySelector('.pkg-tabs'):null;if(tel){const sl=at.offsetLeft-(tel.offsetWidth/2)+(at.offsetWidth/2);tel.scrollLeft=sl;}}}},{passive:true});})();
<\/script>

<script>
// Season config for this package
const SEASONS={peak:[${(pkg.peak_months||[]).join(',')}],high:[${(pkg.high_months||[]).join(',')}],green:[${(pkg.green_months||[]).join(',')}]};
const RATES={peak:${pricePeak},high:${price},green:${priceGreen}};
const SEASON_NAMES={peak:'Peak Season',high:'High Season',green:'Green Season'};
function getSeasonForMonth(m){if(SEASONS.peak.includes(m))return'peak';if(SEASONS.green.includes(m))return'green';return'high';}
let state={adults:2,children:0,childAges:[],selectedDate:null,season:'high',baseRate:${price}};
let calView={year:new Date().getFullYear(),month:new Date().getMonth()};
const calEl=document.getElementById('sqCalendar'),dateInput=document.getElementById('sqDateInput'),calGrid=document.getElementById('sqCalGrid'),calMonthEl=document.getElementById('sqCalMonth');
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
function renderCalendar(){const{year,month}=calView;calMonthEl.textContent=MONTHS[month]+' '+year;const first=new Date(year,month,1).getDay(),days=new Date(year,month+1,0).getDate(),today=new Date();calGrid.innerHTML='';for(let i=0;i<first;i++){const b=document.createElement('div');b.className='sq-cal-day empty';calGrid.appendChild(b);}for(let d=1;d<=days;d++){const cell=document.createElement('div'),date=new Date(year,month,d),season=getSeasonForMonth(month+1),isPast=date<new Date(today.getFullYear(),today.getMonth(),today.getDate()),isSelected=state.selectedDate&&date.toDateString()===state.selectedDate.toDateString();cell.className='sq-cal-day'+(isPast?' past':'')+(isSelected?' selected':'')+(season==='peak'?' peak':season==='green'?' green-season':' high');cell.textContent=d;if(!isPast){cell.addEventListener('click',function(){state.selectedDate=date;state.season=season;state.baseRate=RATES[season];dateInput.value=d+' '+MONTHS[month].slice(0,3)+' '+year;calEl.classList.remove('open');dateInput.classList.remove('open');renderCalendar();updateQuote();});}calGrid.appendChild(cell);}}
dateInput.addEventListener('click',function(){calEl.classList.toggle('open');dateInput.classList.toggle('open');renderCalendar();});
document.addEventListener('click',function(e){if(!calEl.contains(e.target)&&e.target!==dateInput){calEl.classList.remove('open');dateInput.classList.remove('open');}});
document.getElementById('sqCalPrev').addEventListener('click',function(e){e.stopPropagation();calView.month--;if(calView.month<0){calView.month=11;calView.year--;}renderCalendar();});
document.getElementById('sqCalNext').addEventListener('click',function(e){e.stopPropagation();calView.month++;if(calView.month>11){calView.month=0;calView.year++;}renderCalendar();});
document.getElementById('sqAdultMinus').addEventListener('click',function(){if(state.adults>1){state.adults--;updateQuote();}});
document.getElementById('sqAdultPlus').addEventListener('click',function(){if(state.adults<4){state.adults++;updateQuote();}});
const childToggle=document.getElementById('sqChildToggle'),childSection=document.getElementById('sqChildSection');
childToggle.addEventListener('change',function(){if(this.checked){childSection.classList.add('open');if(state.children===0)state.children=1;}else{childSection.classList.remove('open');state.children=0;state.childAges=[];}renderChildAges();updateQuote();});
document.getElementById('sqChildMinus').addEventListener('click',function(){if(state.children>1){state.children--;renderChildAges();updateQuote();}});
document.getElementById('sqChildPlus').addEventListener('click',function(){if(state.children<6){state.children++;renderChildAges();updateQuote();}});
function renderChildAges(){document.getElementById('sqChildVal').textContent=state.children;const c=document.getElementById('sqChildAges');c.innerHTML='';for(let i=0;i<state.children;i++){const row=document.createElement('div');row.className='sq-child-age-row';const lbl=document.createElement('span');lbl.className='sq-child-age-label';lbl.textContent='Child '+(i+1)+' age';const sel=document.createElement('select');sel.className='sq-child-age-select';sel.innerHTML='<option value="">Select age</option>';for(let a=0;a<=17;a++){const opt=document.createElement('option');opt.value=a;opt.textContent=a===0?'Under 1':a+' yrs';if(state.childAges[i]!==undefined&&state.childAges[i]==a)opt.selected=true;sel.appendChild(opt);}const idx=i;sel.addEventListener('change',function(){state.childAges[idx]=parseInt(this.value);updateQuote();});row.appendChild(lbl);row.appendChild(sel);c.appendChild(row);}}
function getChildRate(age){if(isNaN(age)||age<5)return 0;if(age<12)return state.baseRate*0.5;return state.baseRate;}
function updateQuote(){const at=state.adults*state.baseRate;let ct=0;for(let i=0;i<state.children;i++)ct+=getChildRate(state.childAges[i]!==undefined?state.childAges[i]:NaN);const gt=at+ct,dep=Math.round(gt*0.3);document.getElementById('sqAdultVal').textContent=state.adults;document.getElementById('sqPriceNum').textContent='$'+state.baseRate.toLocaleString();document.getElementById('sqSeason').textContent=SEASON_NAMES[state.season];document.getElementById('sqTotal').textContent='$'+gt.toLocaleString();document.getElementById('sqAdultTotal').textContent='$'+at.toLocaleString();document.querySelector('#sqBreakdown .sq-breakdown-row:first-child span:first-child').textContent='Adults ('+state.adults+' × $'+state.baseRate.toLocaleString()+')';if(state.children>0&&ct>0){document.getElementById('sqChildRow').style.display='flex';document.getElementById('sqChildLabel').textContent='Children ('+state.children+')';document.getElementById('sqChildTotal').textContent='$'+ct.toLocaleString();}else{document.getElementById('sqChildRow').style.display='none';}document.getElementById('sqDeposit').textContent='$'+dep.toLocaleString();const mob=document.querySelector('.mobile-book-price-num');if(mob)mob.textContent='$'+gt.toLocaleString();}
renderCalendar();updateQuote();
<\/script>

<script>
function initKenyaMap(){
  const stopsData=${stopsJSON};
  const map=new google.maps.Map(document.getElementById('kenya-google-map'),{center:{lat:-1.2,lng:37.8},zoom:6,disableDefaultUI:true,gestureHandling:'none',keyboardShortcuts:false,styles:[{elementType:'geometry',stylers:[{color:'#0d0d0d'}]},{elementType:'labels.text.fill',stylers:[{color:'#8a8074'}]},{featureType:'administrative.country',elementType:'geometry.stroke',stylers:[{color:'#d4af37'},{weight:1.5}]},{featureType:'landscape',elementType:'geometry',stylers:[{color:'#111111'}]},{featureType:'road',stylers:[{visibility:'off'}]},{featureType:'poi',stylers:[{visibility:'off'}]},{featureType:'water',elementType:'geometry',stylers:[{color:'#0a0a14'}]}]});
  new google.maps.Polyline({path:stopsData.map(s=>({lat:s.lat,lng:s.lng})),geodesic:true,strokeOpacity:0,icons:[{icon:{path:'M 0,-1 0,1',strokeOpacity:0.6,strokeColor:'#d4af37',scale:3},offset:'0',repeat:'12px'}]}).setMap(map);
  stopsData.forEach(function(stop){
    const marker=new google.maps.Marker({position:{lat:stop.lat,lng:stop.lng},map:map,icon:{path:google.maps.SymbolPath.CIRCLE,scale:7,fillColor:stop.color,fillOpacity:1,strokeColor:'rgba(255,255,255,0.3)',strokeWeight:2}});
    new google.maps.InfoWindow({content:'<div style="background:rgba(8,8,8,0.82);border-left:2px solid '+stop.color+';padding:5px 10px 5px 8px;font-family:Jost,sans-serif;"><div style="font-size:8px;letter-spacing:2.5px;text-transform:uppercase;color:'+stop.color+';">'+stop.name+'</div><div style="font-size:7px;color:rgba(255,255,255,0.35);margin-top:2px;letter-spacing:1.5px;text-transform:uppercase;">'+stop.sub+'</div></div>',disableAutoPan:true,pixelOffset:new google.maps.Size(0,-2)}).open(map,marker);
  });
}
<\/script>
</body>
</html>`;

  // Download the file
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = detailUrl;
  a.click();
  URL.revokeObjectURL(url);

  showToast(`Page downloaded: ${detailUrl} — place it in your website root folder`, 'success');
}

// ── RESET FORM ──
function resetForm(keepEditing = false) {
  if (!keepEditing) {
    editingPackageId = null;
    completedSteps = new Set();
    clearStorageDraft();
  }
  dayCount=0; lodgeCount=0; inclusionCount=0; exclusionCount=0; routeCount=0;

  ['f-name','f-slug','f-tagline','f-badge','f-transport','f-days','f-nights',
   'f-destinations','f-overview-title','f-overview-body','f-hero-image-url',
   'f-price-peak','f-price-high','f-price-green','f-price-solo','f-price-duo',
   'f-price-group','f-peak-months','f-high-months','f-green-months',
   'f-card-bg-url','f-short-highlights','f-detail-page-url','f-overview-body-2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  ['daysRepeater','lodgesRepeater','inclusionsRepeater','exclusionsRepeater','routeRepeater'].forEach(id => {
    document.getElementById(id).innerHTML = '<div class="repeater-empty">No items added yet.</div>';
  });

  document.querySelectorAll('.validation-summary').forEach(vs => vs.classList.remove('show'));
  clearAllInvalid();

  const heroPreview = document.getElementById('heroPreview');
  if (heroPreview) heroPreview.style.display = 'none';
  const cardBgPreview = document.getElementById('cardBgPreview');
  if (cardBgPreview) cardBgPreview.style.display = 'none';
}

// ── IMAGE UPLOADS ──
async function handleHeroUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const img = document.getElementById('heroPreview');
  try {
    showToast('Uploading hero image...');
    const ext = file.name.split('.').pop().toLowerCase();
    const path = 'hero/' + Date.now() + '-' + Math.random().toString(36).slice(2,8) + '.' + ext;
    const upRes = await db.storage.from('package-images').upload(path, file);
    if (upRes.error) throw upRes.error;
    const pub = db.storage.from('package-images').getPublicUrl(path);
    img.src = pub.data.publicUrl;
    img.style.display = 'block';
    document.getElementById('f-hero-image-url').value = pub.data.publicUrl;
    showToast('Hero image uploaded');
  } catch (e) {
    showToast('Upload failed: ' + e.message, 'error');
    input.value = '';
  }
}
async function handleCardBgUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const img = document.getElementById('cardBgPreview');
  try {
    showToast('Uploading card background...');
    const ext = file.name.split('.').pop().toLowerCase();
    const path = 'card-bg/' + Date.now() + '-' + Math.random().toString(36).slice(2,8) + '.' + ext;
    const upRes = await db.storage.from('package-images').upload(path, file);
    if (upRes.error) throw upRes.error;
    const pub = db.storage.from('package-images').getPublicUrl(path);
    img.src = pub.data.publicUrl;
    img.style.display = 'block';
    document.getElementById('f-card-bg-url').value = pub.data.publicUrl;
    showToast('Card background uploaded');
  } catch (e) {
    showToast('Upload failed: ' + e.message, 'error');
    input.value = '';
  }
}
// ── TOAST ──
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  setTimeout(() => t.classList.remove('show'), 4000);
}

// ── AUTO SLUG ──
document.addEventListener('DOMContentLoaded', () => {
  const nameInput = document.getElementById('f-name');
  const slugInput = document.getElementById('f-slug');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (!editingPackageId) {
        slugInput.value = nameInput.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
      }
    });
  }

  // All nav items wired here as backup (onclick attributes handle primary)
  const navWires = {
    'nav-dashboard':   () => showView('dashboard'),
    'nav-packages':    () => showView('packages'),
    'nav-drafts':      () => showView('drafts'),
    'nav-categories':  () => showView('categories'),
    'nav-new':         () => startNewPackage(),
    'nav-enquiries':   () => showView('enquiries'),
    'nav-confirmed':   () => showView('confirmed'),
    'nav-blog-posts':  () => showView('blog-posts'),
    'nav-blog-drafts': () => showView('blog-drafts'),
    'nav-new-blog':    () => startNewBlog(),
    'nav-members':     () => showView('members'),
    'nav-testimonials':() => showView('testimonials'),
    'nav-team':        () => showView('team'),
    'nav-site':        () => showView('site-settings'),
  };
  Object.entries(navWires).forEach(([id, fn]) => {
    document.getElementById(id)?.addEventListener('click', fn);
  });

  // Clear invalid state on input
  document.addEventListener('input', e => {
    if (e.target.matches('input,select,textarea')) {
      e.target.classList.remove('invalid');
    }
  });

  // Attach persistence listeners to the wizard view
  attachPersistenceListeners();

  checkSession();
});

// ===========================
// MEMBERS MANAGEMENT
// ===========================

let allMembers = [];

async function loadMembers() {
  const list = document.getElementById('membersList');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--muted);">Loading members...</p>';

  const { data, error } = await db.from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    list.innerHTML = '<p style="color:var(--muted);">Could not load members. Check RLS policies.</p>';
    return;
  }

  allMembers = data;

  // KPI stats
  const now = new Date();
  const thisMonth = data.filter(m => {
    const d = new Date(m.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const withAvatar = data.filter(m => m.avatar_url && m.avatar_url.trim() !== '');

  document.getElementById('mem-total').textContent  = data.length;
  document.getElementById('mem-month').textContent  = thisMonth.length;
  document.getElementById('mem-avatar').textContent = withAvatar.length;

  // Google signups — check user metadata via auth (approximate with avatar_url from Google)
  const googleApprox = data.filter(m => m.avatar_url && m.avatar_url.includes('googleusercontent'));
  document.getElementById('mem-google').textContent = googleApprox.length;

  renderMembersList(data);
}

function renderMembersList(data) {
  const list = document.getElementById('membersList');
  if (!data.length) {
    list.innerHTML = '<p style="color:var(--muted);">No members found.</p>';
    return;
  }

  list.innerHTML = data.map(m => {
    const firstName = m.first_name || '';
    const lastName  = m.last_name  || '';
    const fullName  = (firstName + ' ' + lastName).trim() || 'Unknown';
    const initial   = firstName.charAt(0).toUpperCase() || '?';
    const email     = m.email || '—';
    const joined    = m.created_at
      ? new Date(m.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
      : '—';
    const tier      = m.tier || 'Explorer';
    const phone     = m.phone || '—';
    const nationality = m.nationality || '—';
    const points    = m.reward_points || 0;

    const avatarHTML = m.avatar_url
      ? `<div class="member-avatar"><img src="${m.avatar_url}" alt="${fullName}" onerror="this.parentNode.innerHTML='${initial}'"></div>`
      : `<div class="member-avatar">${initial}</div>`;

    return `
      <div class="member-row" id="member-${m.id}">
        ${avatarHTML}
        <div>
          <div class="member-name">${fullName}</div>
          <div class="member-meta">${email} · ${phone} · ${nationality} · ${points} pts</div>
        </div>
        <div class="member-tier">${tier}</div>
        <div class="member-date">
          ${joined}
          <div style="margin-top:6px;display:flex;gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="viewMemberDetail('${m.id}')">View</button>
            <button class="btn btn-danger btn-sm" onclick="deleteMember('${m.id}','${fullName}')">Remove</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function filterMembers(query) {
  if (!query.trim()) { renderMembersList(allMembers); return; }
  const q = query.toLowerCase();
  const filtered = allMembers.filter(m =>
    (m.first_name||'').toLowerCase().includes(q) ||
    (m.last_name||'').toLowerCase().includes(q)  ||
    (m.email||'').toLowerCase().includes(q)       ||
    (m.phone||'').toLowerCase().includes(q)       ||
    (m.nationality||'').toLowerCase().includes(q)
  );
  renderMembersList(filtered);
}

function viewMemberDetail(id) {
  const m = allMembers.find(x => x.id === id);
  if (!m) return;
  const fullName = ((m.first_name||'') + ' ' + (m.last_name||'')).trim() || 'Unknown';
  const joined   = m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : '—';
  const updated  = m.updated_at ? new Date(m.updated_at).toLocaleDateString('en-GB', { year:'numeric', month:'short', day:'numeric' }) : '—';

  const detail = `
    <div style="background:var(--charcoal);border:1px solid var(--border);padding:32px;max-width:640px;">
      <div style="position:absolute;top:0;left:10%;right:10%;height:2px;background:linear-gradient(to right,transparent,var(--gold),transparent);"></div>
      <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px;">
        <div class="member-avatar" style="width:56px;height:56px;font-size:22px;">
          ${m.avatar_url ? `<img src="${m.avatar_url}" alt="${fullName}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : (m.first_name||'?').charAt(0).toUpperCase()}
        </div>
        <div>
          <div style="font-size:20px;font-weight:700;color:var(--text);">${fullName}</div>
          <div style="font-size:10px;color:var(--gold);letter-spacing:3px;text-transform:uppercase;margin-top:4px;">${m.tier||'Explorer'} · ${m.reward_points||0} pts</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:12px;">
        <div><span style="color:var(--gold);font-size:9px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px;">Email</span><span style="color:var(--text);">${m.email||'—'}</span></div>
        <div><span style="color:var(--gold);font-size:9px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px;">Phone</span><span style="color:var(--text);">${m.phone||'—'}</span></div>
        <div><span style="color:var(--gold);font-size:9px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px;">Nationality</span><span style="color:var(--text);">${m.nationality||'—'}</span></div>
        <div><span style="color:var(--gold);font-size:9px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px;">Country</span><span style="color:var(--text);">${m.country||'—'}</span></div>
        <div><span style="color:var(--gold);font-size:9px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px;">Language</span><span style="color:var(--text);">${m.preferred_lang||'—'}</span></div>
        <div><span style="color:var(--gold);font-size:9px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px;">Timezone</span><span style="color:var(--text);">${m.timezone||'—'}</span></div>
        <div><span style="color:var(--gold);font-size:9px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px;">Emergency Contact</span><span style="color:var(--text);">${m.emerg_name||'—'} ${m.emerg_phone?'· '+m.emerg_phone:''}</span></div>
        <div><span style="color:var(--gold);font-size:9px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px;">Joined</span><span style="color:var(--text);">${joined}</span></div>
        <div><span style="color:var(--gold);font-size:9px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px;">Last Updated</span><span style="color:var(--text);">${updated}</span></div>
        <div><span style="color:var(--gold);font-size:9px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px;">Travel Style</span><span style="color:var(--text);">${(m.travel_styles||[]).join(', ')||'—'}</span></div>
        <div><span style="color:var(--gold);font-size:9px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px;">Dietary</span><span style="color:var(--text);">${m.dietary_restrictions||'—'}</span></div>
        <div><span style="color:var(--gold);font-size:9px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:4px;">Destinations Preferred</span><span style="color:var(--text);">${m.preferred_destinations||'—'}</span></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;">
        <a href="mailto:${m.email}" class="btn btn-gold btn-sm" style="text-decoration:none;">✉️ Email Member</a>
        ${m.phone ? `<a href="https://wa.me/${m.phone.replace(/\D/g,'')}" target="_blank" class="btn btn-outline btn-sm" style="text-decoration:none;">💬 WhatsApp</a>` : ''}
        <button class="btn btn-danger btn-sm" onclick="deleteMember('${m.id}','${fullName}')">Remove Account</button>
      </div>
    </div>`;

  // Show in a simple overlay
  let overlay = document.getElementById('memberDetailOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'memberDetailOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(8,6,2,0.75);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:24px;';
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = '<div style="position:relative;max-width:640px;width:100%;">' +
    '<button onclick="document.getElementById(\'memberDetailOverlay\').remove()" style="position:absolute;top:-36px;right:0;background:none;border:1px solid rgba(212,175,55,0.3);color:var(--gold);font-family:inherit;font-size:9px;letter-spacing:3px;text-transform:uppercase;padding:8px 16px;cursor:pointer;">Close</button>' +
    detail + '</div>';
}

async function deleteMember(id, name) {
  if (!confirm(`Remove ${name} from the platform? This cannot be undone.`)) return;
  const { error } = await db.from('profiles').delete().eq('id', id);
  if (error) { showToast('Error: ' + error.message, 'error'); return; }
  showToast(`${name} removed from platform`);
  loadMembers();
}

function exportMembersCSV() {
  if (!allMembers.length) { showToast('No members to export', 'error'); return; }
  const headers = ['First Name','Last Name','Email','Phone','Nationality','Country','Tier','Reward Points','Joined','Travel Styles','Dietary'];
  const rows = allMembers.map(m => [
    m.first_name||'', m.last_name||'', m.email||'', m.phone||'',
    m.nationality||'', m.country||'', m.tier||'Explorer', m.reward_points||0,
    m.created_at ? new Date(m.created_at).toLocaleDateString('en-GB') : '',
    (m.travel_styles||[]).join('; '),
    m.dietary_restrictions||''
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'filmax-members-' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Members exported as CSV ✓', 'success');
}

// ===========================
// TESTIMONIALS MODERATION
// ===========================

async function loadTestimonials(filter = 'pending') {
  const list = document.getElementById('testimonialsList');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--muted);">Loading...</p>';

  // Highlight active filter button
  ['pending','approved','rejected','all'].forEach(f => {
    const btn = document.getElementById('tFilter-' + f);
    if (btn) btn.className = 'btn btn-sm ' + (f === filter ? 'btn-gold' : 'btn-outline');
  });

  let query = db.from('testimonials_pending').select('*').order('created_at', { ascending: false });
  if (filter !== 'all') query = query.eq('status', filter);

  const { data, error } = await query;

  if (error) { list.innerHTML = '<p style="color:var(--muted);">Error loading testimonials: ' + error.message + '</p>'; return; }
  if (!data?.length) { list.innerHTML = '<p style="color:var(--muted);">No ' + filter + ' testimonials.</p>'; return; }

  list.innerHTML = data.map(t => {
    const stars = '★'.repeat(t.rating||5) + '☆'.repeat(5-(t.rating||5));
    const date  = t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—';
    return `
      <div class="testimonial-admin-card ${t.status||'pending'}">
        <div class="testimonial-admin-meta">
          <div>
            <div class="testimonial-admin-author">${t.author_name||'Anonymous'} <span style="color:var(--muted);font-size:11px;font-weight:400;">· ${t.author_loc||'—'}</span></div>
            ${t.destination ? `<div style="font-size:10px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-top:3px;">${t.destination}</div>` : ''}
          </div>
          <div style="text-align:right;">
            <div class="testimonial-admin-date">${date}</div>
            <span class="badge ${t.status==='approved'?'badge-published':t.status==='rejected'?'badge-draft':'badge-featured'}" style="margin-top:6px;display:inline-block;">${t.status||'pending'}</span>
          </div>
        </div>
        <div class="testimonial-admin-rating">${stars}</div>
        <div class="testimonial-admin-text">"${t.text||''}"</div>
        <div class="testimonial-admin-actions">
          ${t.status !== 'approved'  ? `<button class="btn btn-publish btn-sm" onclick="updateTestimonialStatus('${t.id}','approved')">✓ Approve</button>` : ''}
          ${t.status !== 'rejected'  ? `<button class="btn btn-danger btn-sm" onclick="updateTestimonialStatus('${t.id}','rejected')">✕ Reject</button>` : ''}
          ${t.status !== 'pending'   ? `<button class="btn btn-outline btn-sm" onclick="updateTestimonialStatus('${t.id}','pending')">Reset to Pending</button>` : ''}
          <button class="btn btn-danger btn-sm" onclick="deleteTestimonial('${t.id}')">Delete</button>
        </div>
      </div>`;
  }).join('');
}

async function updateTestimonialStatus(id, status) {
  const { error } = await db.from('testimonials_pending').update({ status }).eq('id', id);
  if (error) { showToast('Error: ' + error.message, 'error'); return; }
  showToast('Testimonial marked as ' + status);
  const activeFilter = document.querySelector('[id^="tFilter-"].btn-gold')?.id?.replace('tFilter-','') || 'pending';
  loadTestimonials(activeFilter);
}

async function deleteTestimonial(id) {
  if (!confirm('Permanently delete this testimonial?')) return;
  await db.from('testimonials_pending').delete().eq('id', id);
  showToast('Testimonial deleted');
  const activeFilter = document.querySelector('[id^="tFilter-"].btn-gold')?.id?.replace('tFilter-','') || 'pending';
  loadTestimonials(activeFilter);
}

// ===========================
// ENQUIRIES MANAGEMENT
// ===========================

let allEnquiries = [];

async function loadEnquiries(statusFilter = 'all') {
  const list = document.getElementById('enquiriesList');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--muted);">Loading enquiries...</p>';

  let query = db.from('enquiries').select('*').order('created_at', { ascending: false });
  if (statusFilter !== 'all') query = query.eq('status', statusFilter);

  const { data, error } = await query;

  if (error) { list.innerHTML = '<p style="color:var(--muted);">Error: ' + error.message + '</p>'; return; }

  allEnquiries = data || [];

  // KPI counts
  const [newCount, contactedCount, confirmedCount] = await Promise.all([
    db.from('enquiries').select('*', { count:'exact', head:true }).eq('status','new'),
    db.from('enquiries').select('*', { count:'exact', head:true }).eq('status','contacted'),
    db.from('enquiries').select('*', { count:'exact', head:true }).eq('status','confirmed'),
  ]);
  document.getElementById('enq-new').textContent       = newCount.count ?? '—';
  document.getElementById('enq-contacted').textContent  = contactedCount.count ?? '—';
  document.getElementById('enq-confirmed').textContent  = confirmedCount.count ?? '—';

  const now = new Date();
  const thisMonthCount = (data||[]).filter(e => {
    const d = new Date(e.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  document.getElementById('enq-month').textContent = thisMonthCount;

  if (!data?.length) {
    list.innerHTML = '<p style="color:var(--muted);">No enquiries found.</p>';
    return;
  }

  list.innerHTML = data.map(e => {
    const fullName = ((e.first_name||'') + ' ' + (e.last_name||'')).trim() || 'Unknown';
    const date = e.created_at
      ? new Date(e.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
      : '—';
    const waMsg = encodeURIComponent(`Hello ${e.first_name||''},\n\nThank you for your enquiry about ${e.package_name||'our safari packages'}. I am Amara from Filmax Jambo Tours and I would love to help you plan your perfect Kenya safari.\n\nCould we schedule a call to discuss your requirements?\n\nWarm regards,\nFilmax Jambo Tours`);

    return `
      <div class="enquiry-card status-${e.status||'new'}">
        <div class="enquiry-header">
          <div>
            <div class="enquiry-name">${fullName}</div>
            ${e.package_name ? `<div class="enquiry-package">${e.package_name}</div>` : ''}
          </div>
          <div class="enquiry-date">${date}</div>
        </div>
        <div class="enquiry-contact">
          ${e.email ? `<span>✉️ <a href="mailto:${e.email}" style="color:var(--gold);text-decoration:none;">${e.email}</a></span>` : ''}
          ${e.phone ? `<span>📞 ${e.phone}</span>` : ''}
          ${e.country ? `<span>🌍 ${e.country}</span>` : ''}
        </div>
        ${e.message ? `<div class="enquiry-message">"${e.message}"</div>` : ''}
        <div class="enquiry-actions">
          <select class="enquiry-status-select" onchange="updateEnquiryStatus('${e.id}',this.value)">
            <option value="new"       ${e.status==='new'       ?'selected':''}>New</option>
            <option value="contacted" ${e.status==='contacted' ?'selected':''}>Contacted</option>
            <option value="confirmed" ${e.status==='confirmed' ?'selected':''}>Confirmed</option>
            <option value="closed"    ${e.status==='closed'    ?'selected':''}>Closed</option>
          </select>
          ${e.email ? `<a href="mailto:${e.email}?subject=Your Filmax Jambo Safari Enquiry" class="btn btn-outline btn-sm" style="text-decoration:none;">✉️ Email</a>` : ''}
          ${e.phone ? `<a href="https://wa.me/${e.phone.replace(/\D/g,'')}?text=${waMsg}" target="_blank" class="btn btn-outline btn-sm" style="text-decoration:none;color:#25D366;border-color:rgba(37,211,102,0.4);">💬 WhatsApp</a>` : ''}
          <button class="btn btn-danger btn-sm" onclick="deleteEnquiry('${e.id}')">Delete</button>
        </div>
      </div>`;
  }).join('');
}

async function updateEnquiryStatus(id, status) {
  const { error } = await db.from('enquiries').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) { showToast('Error: ' + error.message, 'error'); return; }
  showToast('Status updated to ' + status);
}

async function deleteEnquiry(id) {
  if (!confirm('Delete this enquiry permanently?')) return;
  await db.from('enquiries').delete().eq('id', id);
  showToast('Enquiry deleted');
  loadEnquiries(document.getElementById('enqStatusFilter')?.value || 'all');
}

function exportEnquiriesCSV() {
  if (!allEnquiries.length) { showToast('No enquiries to export', 'error'); return; }
  const headers = ['Name','Email','Phone','Country','Package','Message','Status','Date'];
  const rows = allEnquiries.map(e => [
    ((e.first_name||'') + ' ' + (e.last_name||'')).trim(),
    e.email||'', e.phone||'', e.country||'', e.package_name||'',
    e.message||'', e.status||'new',
    e.created_at ? new Date(e.created_at).toLocaleDateString('en-GB') : ''
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'filmax-enquiries-' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Enquiries exported ✓', 'success');
}

// ===========================
// REAL-TIME NOTIFICATIONS
// ===========================

function initRealtime() {
  // New member signups
  db.channel('admin-members')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, payload => {
      const name = ((payload.new.first_name||'') + ' ' + (payload.new.last_name||'')).trim() || 'New member';
      showToast('🎉 New signup: ' + name, 'success');
      // Refresh members count in dashboard
      document.getElementById('kpi-enquiries-num').textContent = '↑';
      if (document.getElementById('view-members').classList.contains('active')) loadMembers();
    })
    .subscribe();

  // New enquiries
  db.channel('admin-enquiries')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'enquiries' }, payload => {
      const name = ((payload.new.first_name||'') + ' ' + (payload.new.last_name||'')).trim() || 'Someone';
      showToast('📋 New enquiry from ' + name + (payload.new.package_name ? ' — ' + payload.new.package_name : ''), 'success');
      if (document.getElementById('view-enquiries').classList.contains('active')) {
        loadEnquiries(document.getElementById('enqStatusFilter')?.value || 'all');
      }
    })
    .subscribe();

  // New testimonials
  db.channel('admin-testimonials')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'testimonials_pending' }, payload => {
      showToast('⭐ New testimonial from ' + (payload.new.author_name || 'a guest') + ' — awaiting review');
    })
    .subscribe();
}

// ===========================
// SITE SETTINGS
// ===========================

async function loadSiteSettings() {
  const { data, error } = await db.from('site_settings').select('*');
  if (error || !data) { showToast('Could not load site settings', 'error'); return; }

  data.forEach(row => {
    const v = row.value || {};
    if (row.id === 'concierge') {
      setVal('ss-concierge-name', v.name);
      setVal('ss-concierge-role', v.role);
      setVal('ss-whatsapp',       v.whatsapp);
      setVal('ss-email',          v.email);
      setVal('ss-concierge-bio',  v.bio);
    }
    if (row.id === 'hero') {
      setVal('ss-hero-eyebrow',  v.eyebrow);
      setVal('ss-hero-subtitle', v.subtitle);
    }
    if (row.id === 'business') {
      setVal('ss-office',      v.office);
      setVal('ss-hours',       v.hours);
      setVal('ss-phone',       v.phone);
      setVal('ss-footer-desc', v.footer_desc);
    }
    if (row.id === 'stats') {
      setVal('ss-stat1-num',   v.stat1_num);
      setVal('ss-stat1-label', v.stat1_label);
      setVal('ss-stat2-num',   v.stat2_num);
      setVal('ss-stat2-label', v.stat2_label);
      setVal('ss-stat3-num',   v.stat3_num);
      setVal('ss-stat3-label', v.stat3_label);
      setVal('ss-stat4-num',   v.stat4_num);
      setVal('ss-stat4-label', v.stat4_label);
    }
  });
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined && val !== null) el.value = val;
}

async function saveSiteSettings() {
  const rows = [
    { id: 'concierge', value: {
      name:     document.getElementById('ss-concierge-name')?.value || '',
      role:     document.getElementById('ss-concierge-role')?.value || '',
      whatsapp: document.getElementById('ss-whatsapp')?.value || '',
      email:    document.getElementById('ss-email')?.value || '',
      bio:      document.getElementById('ss-concierge-bio')?.value || '',
    }},
    { id: 'hero', value: {
      eyebrow:  document.getElementById('ss-hero-eyebrow')?.value || '',
      subtitle: document.getElementById('ss-hero-subtitle')?.value || '',
    }},
    { id: 'business', value: {
      office:      document.getElementById('ss-office')?.value || '',
      hours:       document.getElementById('ss-hours')?.value || '',
      phone:       document.getElementById('ss-phone')?.value || '',
      footer_desc: document.getElementById('ss-footer-desc')?.value || '',
    }},
    { id: 'stats', value: {
      stat1_num:   document.getElementById('ss-stat1-num')?.value || '',
      stat1_label: document.getElementById('ss-stat1-label')?.value || '',
      stat2_num:   document.getElementById('ss-stat2-num')?.value || '',
      stat2_label: document.getElementById('ss-stat2-label')?.value || '',
      stat3_num:   document.getElementById('ss-stat3-num')?.value || '',
      stat3_label: document.getElementById('ss-stat3-label')?.value || '',
      stat4_num:   document.getElementById('ss-stat4-num')?.value || '',
      stat4_label: document.getElementById('ss-stat4-label')?.value || '',
    }},
  ];

  for (const row of rows) {
    const { error } = await db.from('site_settings')
      .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (error) { showToast('Error saving ' + row.id + ': ' + error.message, 'error'); return; }
  }

  showToast('Site settings saved — website updates automatically ✓', 'success');
  const status = document.getElementById('siteSettingsSaveStatus');
  if (status) { status.textContent = '✓ Saved at ' + new Date().toLocaleTimeString(); status.style.opacity = '1'; setTimeout(() => status.style.opacity = '0', 3000); }
}
  
let editingBlogId = null;

async function ensureBlogsTable() {
  // Silently check if table exists by attempting a select
  try {
    await supa.from('blogs').select('id').limit(1);
    return true;
  } catch(e) {
    return false;
  }
}

function startNewBlog() {
  editingBlogId = null;
  resetBlogForm();
  document.getElementById('blogFormModeLabel').textContent = 'Create';
  document.getElementById('blogFormTitleText').textContent = 'New Blog Post';
  document.getElementById('bf-date').value = new Date().toISOString().split('T')[0];
  showView('new-blog');
}

function resetBlogForm() {
  ['bf-id','bf-title','bf-slug','bf-cover','bf-coveralt','bf-excerpt','bf-body','bf-author'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('bf-category').value = 'Wildlife';
  document.getElementById('bf-readtime').value = '5 min read';
  document.getElementById('bf-published').checked = false;
  document.getElementById('bf-cover-preview').style.display = 'none';
  document.getElementById('bf-excerpt-count').textContent = '0 / 180 characters';
  document.getElementById('bf-preview-url').textContent = 'Fill in a slug to see the preview URL';
  document.querySelectorAll('#view-new-blog .field-error').forEach(el => el.classList.remove('show'));
  document.querySelectorAll('#view-new-blog input, #view-new-blog textarea, #view-new-blog select').forEach(el => el.classList.remove('invalid'));
}

function blogAutoSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Auto-generate slug from title
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('bf-title');
    const slugInput  = document.getElementById('bf-slug');
    if (!titleInput || !slugInput) return;

    titleInput.addEventListener('input', () => {
      if (!editingBlogId) {
        slugInput.value = blogAutoSlug(titleInput.value);
        updateBlogPreviewUrl(slugInput.value);
      }
    });

    slugInput.addEventListener('input', () => {
      updateBlogPreviewUrl(slugInput.value);
    });

    const coverInput = document.getElementById('bf-cover');
    if (coverInput) {
      coverInput.addEventListener('input', () => {
        const url = coverInput.value.trim();
        const preview = document.getElementById('bf-cover-preview');
        const img = document.getElementById('bf-cover-img');
        if (url) {
          img.src = url;
          preview.style.display = 'block';
        } else {
          preview.style.display = 'none';
        }
      });
    }

    const excerptInput = document.getElementById('bf-excerpt');
    if (excerptInput) {
      excerptInput.addEventListener('input', () => {
        const len = excerptInput.value.length;
        const counter = document.getElementById('bf-excerpt-count');
        if (counter) {
          counter.textContent = len + ' / 180 characters';
          counter.style.color = len > 180 ? 'rgba(180,60,60,0.9)' : 'var(--muted)';
        }
      });
    }
  });
})();

function updateBlogPreviewUrl(slug) {
  const el = document.getElementById('bf-preview-url');
  if (!el) return;
  if (slug) {
    el.textContent = `blog/${slug}.html → loads from Supabase automatically`;
    el.style.color = 'var(--gold)';
  } else {
    el.textContent = 'Fill in a slug to see the preview URL';
    el.style.color = 'var(--muted)';
  }
}

function blogInsertTag(type) {
  const ta = document.getElementById('bf-body');
  if (!ta) return;
  const start = ta.selectionStart;
  const end   = ta.selectionEnd;
  const sel   = ta.value.substring(start, end);
  let insert  = '';
  switch(type) {
    case 'h2':        insert = `<h2>${sel || 'Section Heading'}</h2>`; break;
    case 'p':         insert = `<p>${sel || 'Your paragraph text here...'}</p>`; break;
    case 'blockquote':insert = `<blockquote><p>${sel || 'A memorable quote or highlight from the story.'}</p></blockquote>`; break;
    case 'ul-li':     insert = `<ul>\n  <li>${sel || 'First item'}</li>\n  <li>Second item</li>\n  <li>Third item</li>\n</ul>`; break;
    case 'strong':    insert = `<strong>${sel || 'bold text'}</strong>`; break;
    case 'em':        insert = `<em>${sel || 'italic / gold accent text'}</em>`; break;
    case 'divider':   insert = `<div class="post-divider"></div>`; break;
  }
  ta.focus();
  ta.setRangeText(insert, start, end, 'end');
}

function validateBlogForm() {
  let valid = true;
  const errors = [];

  const title = document.getElementById('bf-title').value.trim();
  const slug  = document.getElementById('bf-slug').value.trim();
  const cover = document.getElementById('bf-cover').value.trim();
  const excerpt = document.getElementById('bf-excerpt').value.trim();
  const date  = document.getElementById('bf-date').value;

  if (title.length < 5) {
    errors.push('Title is required (min 5 characters)');
    document.getElementById('bf-title').classList.add('invalid');
    document.getElementById('berr-title').classList.add('show');
    valid = false;
  }
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Slug required (lowercase letters, numbers, hyphens only)');
    document.getElementById('bf-slug').classList.add('invalid');
    document.getElementById('berr-slug').classList.add('show');
    valid = false;
  }
  if (!cover) {
    errors.push('Cover image URL is required');
    document.getElementById('bf-cover').classList.add('invalid');
    document.getElementById('berr-cover').classList.add('show');
    valid = false;
  }
  if (!excerpt) {
    errors.push('Excerpt is required');
    document.getElementById('bf-excerpt').classList.add('invalid');
    document.getElementById('berr-excerpt').classList.add('show');
    valid = false;
  }
  if (!date) {
    errors.push('Publish date is required');
    document.getElementById('bf-date').classList.add('invalid');
    document.getElementById('berr-date').classList.add('show');
    valid = false;
  }

  return valid;
}

async function saveBlogPost(publish) {
  // Clear previous validation state
  document.querySelectorAll('#view-new-blog .invalid').forEach(el => el.classList.remove('invalid'));
  document.querySelectorAll('#view-new-blog .field-error.show').forEach(el => el.classList.remove('show'));

  if (!validateBlogForm()) {
    showToast('Please fix the highlighted fields before saving.', 'error');
    return;
  }

  const statusEl = document.getElementById('blogSaveStatus');
  statusEl.textContent = publish ? 'Publishing...' : 'Saving draft...';
  statusEl.style.opacity = '1';

  const payload = {
    title:          document.getElementById('bf-title').value.trim(),
    slug:           document.getElementById('bf-slug').value.trim(),
    category:       document.getElementById('bf-category').value,
    published_date: document.getElementById('bf-date').value || null,
    read_time:      document.getElementById('bf-readtime').value.trim() || '5 min read',
    author:         document.getElementById('bf-author').value.trim(),
    cover_image_url:document.getElementById('bf-cover').value.trim(),
    cover_alt:      document.getElementById('bf-coveralt').value.trim(),
    excerpt:        document.getElementById('bf-excerpt').value.trim(),
    body_html:      document.getElementById('bf-body').value.trim(),
    is_published:   publish,
    updated_at:     new Date().toISOString(),
  };

  const existingId = document.getElementById('bf-id').value;
  let error;

  if (existingId) {
    const res = await db.from('blogs').update(payload).eq('id', existingId);
    error = res.error;
  } else {
    const res = await db.from('blogs').insert(payload);
    error = res.error;
  }

  statusEl.style.opacity = '0';

  if (error) {
    showToast('Error saving post: ' + error.message, 'error');
    return;
  }

  showToast(publish ? 'Post published — live on the website 🚀' : 'Saved as draft ✓', publish ? 'success' : '');
  setTimeout(() => showView(publish ? 'blog-posts' : 'blog-drafts'), 1600);
  loadBlogPosts();
  loadBlogDrafts();
}

async function loadBlogPosts() {
  const list = document.getElementById('blogPostList');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--muted);">Loading...</p>';
  const { data, error } = await db.from('blogs')
    .select('id,slug,title,category,published_date,is_published,read_time,cover_image_url')
    .eq('is_published', true)
    .order('published_date', { ascending: false });
  if (error || !data) { list.innerHTML = '<p style="color:var(--muted);">Could not load posts. Make sure the blogs table exists in Supabase.</p>'; return; }
  if (!data.length)   { list.innerHTML = '<p style="color:var(--muted);">No published posts yet.</p>'; return; }
  renderBlogList(data, list);
}

async function loadBlogDrafts() {
  const list = document.getElementById('blogDraftList');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--muted);">Loading...</p>';
  const { data, error } = await db.from('blogs')
    .select('id,slug,title,category,published_date,is_published,read_time,cover_image_url')
    .eq('is_published', false)
    .order('updated_at', { ascending: false });
  if (error || !data) { list.innerHTML = '<p style="color:var(--muted);">Could not load drafts. Make sure the blogs table exists in Supabase.</p>'; return; }
  if (!data.length)   { list.innerHTML = '<p style="color:var(--muted);">No draft posts.</p>'; return; }
  renderBlogList(data, list);
}

function renderBlogList(data, container) {
  container.innerHTML = data.map(b => {
    const dateStr = b.published_date ? new Date(b.published_date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : 'No date';
    const thumb   = b.cover_image_url ? `<img src="${b.cover_image_url}" style="width:60px;height:44px;object-fit:cover;border:1px solid var(--border);flex-shrink:0;" alt="">` : '<div style="width:60px;height:44px;background:var(--card);border:1px solid var(--border);flex-shrink:0;"></div>';
    return `
      <div class="pkg-list-item" style="grid-template-columns:60px 1fr auto auto auto;gap:14px;align-items:center;">
        ${thumb}
        <div>
          <div class="pkg-list-name" style="font-size:15px;">${b.title}</div>
          <div class="pkg-list-meta">${b.category} · ${b.read_time} · ${dateStr} · slug: ${b.slug}</div>
        </div>
        <span class="badge ${b.is_published ? 'badge-published' : 'badge-draft'}">${b.is_published ? 'Live' : 'Draft'}</span>
        <div class="list-action-btn">
          <a href="blog/${b.slug}.html" target="_blank" class="btn btn-outline btn-sm">View</a>
          <button class="btn btn-outline btn-sm" onclick="editBlogPost('${b.id}')">Edit</button>
          <button class="btn ${b.is_published ? 'btn-outline' : 'btn-publish'} btn-sm" onclick="toggleBlogPublish('${b.id}',${b.is_published})">${b.is_published ? 'Unpublish' : 'Publish'}</button>
          <button class="btn btn-danger btn-sm" onclick="deleteBlogPost('${b.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

async function editBlogPost(id) {
  const { data, error } = await db.from('blogs').select('*').eq('id', id).single();
  if (error || !data) { showToast('Could not load post', 'error'); return; }

  resetBlogForm();
  editingBlogId = id;

  document.getElementById('bf-id').value       = data.id || '';
  document.getElementById('bf-title').value    = data.title || '';
  document.getElementById('bf-slug').value     = data.slug || '';
  document.getElementById('bf-category').value = data.category || 'Wildlife';
  document.getElementById('bf-date').value     = data.published_date || '';
  document.getElementById('bf-readtime').value = data.read_time || '5 min read';
  document.getElementById('bf-author').value   = data.author || '';
  document.getElementById('bf-cover').value    = data.cover_image_url || '';
  document.getElementById('bf-coveralt').value = data.cover_alt || '';
  document.getElementById('bf-excerpt').value  = data.excerpt || '';
  document.getElementById('bf-body').value     = data.body_html || '';
  document.getElementById('bf-published').checked = !!data.is_published;

  // Show cover preview
  if (data.cover_image_url) {
    document.getElementById('bf-cover-img').src = data.cover_image_url;
    document.getElementById('bf-cover-preview').style.display = 'block';
  }

  // Update counters and preview URL
  const excerptLen = (data.excerpt || '').length;
  document.getElementById('bf-excerpt-count').textContent = excerptLen + ' / 180 characters';
  updateBlogPreviewUrl(data.slug);

  document.getElementById('blogFormModeLabel').textContent = 'Editing';
  document.getElementById('blogFormTitleText').textContent = data.title;
  showView('new-blog');
  openNavGroup('group-blog');
}

async function toggleBlogPublish(id, current) {
  const { error } = await db.from('blogs').update({ is_published: !current, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) { showToast('Error: ' + error.message, 'error'); return; }
  showToast(!current ? 'Post published — now live ✓' : 'Moved to drafts', !current ? 'success' : '');
  loadBlogPosts();
  loadBlogDrafts();
}

async function deleteBlogPost(id) {
  if (!confirm('Permanently delete this post? This cannot be undone.')) return;
  await db.from('blogs').delete().eq('id', id);
  loadBlogPosts();
  loadBlogDrafts();
  showToast('Post deleted');
}
 // ── ENQUIRIES MODULE ───────────────────────────────────
async function loadEnquiries(statusFilter) {
  const container = document.getElementById('enquiriesContainer');
  if (!container) return;

  statusFilter = statusFilter || 'all';

  // Filter buttons
  container.innerHTML = `
    <div class="enq-filter-row">
      <button class="enq-filter-btn ${statusFilter==='all'?'active':''}" onclick="loadEnquiries('all')">All</button>
      <button class="enq-filter-btn ${statusFilter==='new'?'active':''}" onclick="loadEnquiries('new')">New <span class="enq-count-badge" id="enqCountNew">…</span></button>
      <button class="enq-filter-btn ${statusFilter==='replied'?'active':''}" onclick="loadEnquiries('replied')">Replied</button>
      <button class="enq-filter-btn ${statusFilter==='closed'?'active':''}" onclick="loadEnquiries('closed')">Closed</button>
    </div>
    <div class="enq-overflow-wrap">
      <div style="text-align:center;padding:40px;color:rgba(138,128,116,0.6);font-family:'Cormorant Garamond',serif;font-size:16px;font-style:italic;">Loading enquiries…</div>
    </div>
  `;

  try {
    let query = supa.from('enquiries').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    const { data: enquiries, error } = await query;
    if (error) throw error;

    // Count new
    const { count: newCount } = await supa.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new');
    const newBadge = document.getElementById('enqCountNew');
    if (newBadge) newBadge.textContent = newCount || 0;

    const wrap = container.querySelector('.enq-overflow-wrap');
    if (!enquiries || !enquiries.length) {
      wrap.innerHTML = '<div class="enq-empty">No enquiries found.</div>';
      return;
    }

    wrap.innerHTML = `
      <table class="enq-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="enqTbody"></tbody>
      </table>
    `;

    const tbody = document.getElementById('enqTbody');
    enquiries.forEach(function(enq) {
      const date = new Date(enq.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight:600;color:#f0ece4;">${escHtml(enq.name || '—')}</div>
          <div class="enq-msg-preview" style="font-size:11px;color:#8a8074;margin-top:3px;" title="${escHtml(enq.message || '')}">${escHtml(enq.message || '')}</div>
        </td>
        <td><a href="mailto:${escHtml(enq.email||'')}" style="color:#d4af37;text-decoration:none;">${escHtml(enq.email||'—')}</a></td>
        <td>${escHtml(enq.phone||'—')}</td>
        <td style="white-space:nowrap;">${date}</td>
        <td><span class="enq-status ${enq.status||'new'}">${enq.status||'new'}</span></td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="enq-reply-btn" onclick="toggleReply('${enq.id}')">Reply</button>
            ${enq.status!=='closed'?`<button class="enq-reply-btn" style="border-color:rgba(138,128,116,0.2);color:rgba(138,128,116,0.7);" onclick="markEnquiry('${enq.id}','closed')">Close</button>`:''}
          </div>
          <div class="enq-reply-panel" id="reply-${enq.id}">
            <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.6);margin-bottom:8px;">Reply to ${escHtml(enq.name||enq.email)}</div>
            <textarea class="enq-reply-textarea" id="replyText-${enq.id}" placeholder="Type your reply…"></textarea>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px;">
              <button class="enq-send-btn" onclick="sendReply('${enq.id}','${escHtml(enq.email)}','${escHtml(enq.name||'')}')">Send Reply</button>
              <button onclick="markEnquiry('${enq.id}','replied')" style="font-family:'Jost',sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;padding:9px 16px;background:transparent;border:1px solid rgba(123,181,110,0.3);color:#7bb56e;cursor:pointer;">Mark Replied</button>
            </div>
            <div id="replyMsg-${enq.id}" style="display:none;margin-top:8px;font-size:11px;padding:10px;"></div>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch(e) {
    console.error('Enquiries error:', e);
    const wrap = container.querySelector('.enq-overflow-wrap');
    if (wrap) wrap.innerHTML = '<div class="enq-empty">Error loading enquiries: ' + escHtml(e.message) + '</div>';
  }
}

function toggleReply(id) {
  const panel = document.getElementById('reply-' + id);
  if (!panel) return;
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    const ta = document.getElementById('replyText-' + id);
    if (ta) setTimeout(function(){ ta.focus(); }, 80);
  }
}

async function markEnquiry(id, status) {
  try {
    await supa.from('enquiries').update({ status: status, updated_at: new Date().toISOString() }).eq('id', id);
    const badge = document.querySelector(`#reply-${id}`)?.closest('tr')?.querySelector('.enq-status');
    if (badge) { badge.textContent = status; badge.className = 'enq-status ' + status; }
  } catch(e) { alert('Error: ' + e.message); }
}

async function sendReply(id, toEmail, toName) {
  const ta  = document.getElementById('replyText-' + id);
  const msg = document.getElementById('replyMsg-' + id);
  const reply = ta?.value.trim();
  if (!reply) return;

  // Save reply to DB
  try {
    await supa.from('enquiry_replies').insert({
      enquiry_id: id,
      reply_text: reply,
      sent_at:    new Date().toISOString(),
      sent_by:    'admin'
    });
    await supa.from('enquiries').update({ status: 'replied', updated_at: new Date().toISOString() }).eq('id', id);

    // Show mailto fallback (server email requires backend — use mailto for now)
    const subject = encodeURIComponent('Re: Your Filmax Jambo Tours Enquiry');
    const body    = encodeURIComponent(reply + '\n\n— Filmax Jambo Tours Team\nhello@filmaxjambotours.co.ke');
    window.open(`mailto:${toEmail}?subject=${subject}&body=${body}`);

    if (msg) {
      msg.style.display = 'block';
      msg.style.background = 'rgba(123,181,110,0.1)';
      msg.style.border = '1px solid rgba(123,181,110,0.3)';
      msg.style.color = '#7bb56e';
      msg.textContent = '✓ Reply saved. Your email client opened to send the message.';
    }
    if (ta) ta.value = '';
    markEnquiry(id, 'replied');
  } catch(e) {
    if (msg) {
      msg.style.display = 'block';
      msg.style.background = 'rgba(224,85,85,0.1)';
      msg.style.border = '1px solid rgba(224,85,85,0.3)';
      msg.style.color = '#e07070';
      msg.textContent = 'Error: ' + e.message;
    }
  }
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
 // ── ADMIN DIRTY STATE ──────────────────────────────────
var _adminDirty = false;
var _adminDirtyCallbacks = [];

function adminMarkDirty(saveCallback) {
  _adminDirty = true;
  if (saveCallback) _adminDirtyCallbacks.push(saveCallback);
  document.getElementById('adminSaveBar')?.classList.add('visible');
}

async function adminSaveChanges() {
  try {
    for (var i = 0; i < _adminDirtyCallbacks.length; i++) {
      await _adminDirtyCallbacks[i]();
    }
    _adminDirty = false;
    _adminDirtyCallbacks = [];
    document.getElementById('adminSaveBar')?.classList.remove('visible');
    // Toast
    showAdminToast('Changes saved and live on website');
  } catch(e) {
    showAdminToast('Save failed: ' + e.message, true);
  }
}

function adminDiscardChanges() {
  if (!confirm('Discard all unsaved changes?')) return;
  _adminDirty = false;
  _adminDirtyCallbacks = [];
  document.getElementById('adminSaveBar')?.classList.remove('visible');
  location.reload();
}

function showAdminToast(msg, isError) {
  var toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:24px;right:24px;z-index:99999;font-family:Jost,sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:14px 24px;box-shadow:0 8px 32px rgba(0,0,0,0.4);opacity:0;transform:translateY(-8px);transition:all .35s;pointer-events:none;' + (isError ? 'background:rgba(224,85,85,0.9);color:#fff;' : 'background:linear-gradient(135deg,#d4af37,#b8860b);color:#080808;');
  toast.textContent = (isError ? '✕  ' : '✓  ') + msg;
  document.body.appendChild(toast);
  requestAnimationFrame(function(){ toast.style.opacity='1'; toast.style.transform='translateY(0)'; });
  setTimeout(function(){ toast.style.opacity='0'; setTimeout(function(){ toast.remove(); }, 400); }, 2800);
}

// Watch all admin form inputs for changes
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.admin-form input, .admin-form textarea, .admin-form select').forEach(function(el) {
    el.addEventListener('input', function() { adminMarkDirty(); });
    el.addEventListener('change', function() { adminMarkDirty(); });
  });
});

// Warn on page leave with unsaved changes
window.addEventListener('beforeunload', function(e) {
  if (_adminDirty) { e.preventDefault(); e.returnValue = ''; }
});

 // ── TESTIMONIALS ADMIN ──────────────────────────────────
async function loadTestimonialsAdmin() {
  const container = document.getElementById('testimonialsAdminContainer');
  if (!container) return;
  container.innerHTML = '<div style="color:rgba(138,128,116,0.6);font-style:italic;padding:20px;">Loading…</div>';
  try {
    const { data, error } = await supa.from('testimonials_pending').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || !data.length) {
      container.innerHTML = '<div style="text-align:center;padding:60px;font-family:\'Cormorant Garamond\',serif;font-size:17px;font-style:italic;color:rgba(138,128,116,0.6);">No pending testimonials.</div>';
      return;
    }
    container.innerHTML = data.map(function(t) {
      return `<div style="background:#111;border:1px solid rgba(212,175,55,0.12);padding:24px;margin-bottom:12px;position:relative;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
          <div style="flex:1;min-width:0;">
            <div style="font-family:'Playfair Display',serif;font-size:16px;color:#f0ece4;margin-bottom:4px;">${escHtml(t.author_name||'Anonymous')}</div>
            <div style="font-size:10px;letter-spacing:2px;color:#8a8074;margin-bottom:12px;">${escHtml(t.author_loc||'')} · ${new Date(t.created_at).toLocaleDateString('en-GB')}</div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:15px;font-style:italic;color:#8a8074;line-height:1.7;">"${escHtml(t.text)}"</div>
            <div style="margin-top:8px;">
              ${'★'.repeat(t.rating||5)}<span style="color:rgba(212,175,55,0.3)">${'★'.repeat(5-(t.rating||5))}</span>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;flex-shrink:0;">
            <button onclick="approveTestimonial('${t.id}')" style="font-family:'Jost',sans-serif;font-size:8px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:8px 14px;background:rgba(123,181,110,0.1);border:1px solid rgba(123,181,110,0.35);color:#7bb56e;cursor:pointer;">✓ Approve</button>
            <button onclick="rejectTestimonial('${t.id}')" style="font-family:'Jost',sans-serif;font-size:8px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:8px 14px;background:rgba(224,85,85,0.08);border:1px solid rgba(224,85,85,0.25);color:#e05555;cursor:pointer;">✕ Reject</button>
          </div>
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    container.innerHTML = '<div style="color:#e07070;padding:20px;">Error: ' + escHtml(e.message) + '</div>';
  }
}

async function approveTestimonial(id) {
  try {
    const { data: t } = await supa.from('testimonials_pending').select('*').eq('id', id).single();
    if (t) {
      await supa.from('testimonials').insert({ author_name: t.author_name, author_loc: t.author_loc, text: t.text, rating: t.rating, created_at: new Date().toISOString() });
    }
    await supa.from('testimonials_pending').delete().eq('id', id);
    loadTestimonialsAdmin();
  } catch(e) { alert('Error: ' + e.message); }
}

async function rejectTestimonial(id) {
  if (!confirm('Delete this testimonial?')) return;
  await supa.from('testimonials_pending').delete().eq('id', id);
  loadTestimonialsAdmin();
}

// ── BLOG ADMIN ──────────────────────────────────────────
async function loadBlogAdmin() {
  const container = document.getElementById('blogListContainer');
  if (!container) return;
  container.innerHTML = '<div style="color:rgba(138,128,116,0.6);font-style:italic;padding:20px;">Loading posts…</div>';
  try {
    const { data, error } = await supa.from('blogs').select('id,title,slug,category,is_published,published_date').order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || !data.length) {
      container.innerHTML = '<div style="text-align:center;padding:40px;font-style:italic;color:rgba(138,128,116,0.6);">No blog posts yet. Create your first post.</div>';
      return;
    }
    container.innerHTML = data.map(function(b) {
      return `<div style="display:flex;align-items:center;gap:16px;background:#111;border:1px solid rgba(212,175,55,0.1);padding:18px 20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:0;">
          <div style="font-family:'Playfair Display',serif;font-size:16px;color:#f0ece4;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(b.title)}</div>
          <div style="font-size:10px;color:#8a8074;letter-spacing:2px;">${escHtml(b.category||'Uncategorized')} · ${b.published_date?new Date(b.published_date).toLocaleDateString('en-GB'):'Draft'}</div>
        </div>
        <span style="font-size:8px;letter-spacing:3px;text-transform:uppercase;font-weight:700;padding:4px 10px;${b.is_published?'background:rgba(123,181,110,0.1);border:1px solid rgba(123,181,110,0.3);color:#7bb56e':'background:rgba(138,128,116,0.1);border:1px solid rgba(138,128,116,0.2);color:#8a8074'}">${b.is_published?'Published':'Draft'}</span>
        <div style="display:flex;gap:8px;flex-shrink:0;">
          <button onclick="togglePublish('${b.id}',${b.is_published})" style="font-family:'Jost',sans-serif;font-size:8px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:7px 14px;background:transparent;border:1px solid rgba(212,175,55,0.2);color:rgba(212,175,55,0.8);cursor:pointer;">${b.is_published?'Unpublish':'Publish'}</button>
          <button onclick="deleteBlogPost('${b.id}')" style="font-family:'Jost',sans-serif;font-size:8px;font-weight:700;letter-spacing:3px;text-transform:uppercase;padding:7px 12px;background:transparent;border:1px solid rgba(224,85,85,0.2);color:#e05555;cursor:pointer;">Delete</button>
        </div>
      </div>`;
    }).join('');
  } catch(e) {
    container.innerHTML = '<div style="color:#e07070;padding:20px;">Error: ' + escHtml(e.message) + '</div>';
  }
}

async function togglePublish(id, currentState) {
  await supa.from('blogs').update({ is_published: !currentState, updated_at: new Date().toISOString() }).eq('id', id);
  loadBlogAdmin();
}

async function deleteBlogPost(id) {
  if (!confirm('Delete this post permanently?')) return;
  await supa.from('blogs').delete().eq('id', id);
  loadBlogAdmin();
}
  

// ===========================
// RESERVATIONS (Bookings from reserve.html)
// ===========================
let allReservations = [];

async function loadReservations(statusFilter = 'all') {
  const list = document.getElementById('reservationsList');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--muted);">Loading reservations...</p>';

  let query = db.from('reservations').select('*').order('created_at', { ascending: false });
  if (statusFilter !== 'all') query = query.eq('status', statusFilter);
  const { data, error } = await query;

  if (error) { list.innerHTML = '<p style="color:var(--muted);">Error: ' + error.message + '</p>'; return; }
  allReservations = data || [];

  const [pendingCount, confirmedCount] = await Promise.all([
    db.from('reservations').select('*', { count:'exact', head:true }).eq('status','pending'),
    db.from('reservations').select('*', { count:'exact', head:true }).eq('status','confirmed'),
  ]);
  document.getElementById('res-pending').textContent = pendingCount.count ?? '—';
  document.getElementById('res-confirmed').textContent = confirmedCount.count ?? '—';

  const totalTravellers = (data||[]).reduce((sum,r) => sum + (r.adults||0) + (r.children||0), 0);
  document.getElementById('res-travellers').textContent = totalTravellers;

  const now = new Date();
  const thisMonthCount = (data||[]).filter(r => {
    const d = new Date(r.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  document.getElementById('res-month').textContent = thisMonthCount;

  if (!data?.length) {
    list.innerHTML = '<p style="color:var(--muted);">No reservations found.</p>';
    return;
  }

  list.innerHTML = data.map(r => {
    const fullName = ((r.first_name||'') + ' ' + (r.last_name||'')).trim() || 'Unknown';
    const date = r.created_at
      ? new Date(r.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
      : '—';
    const travellers = (r.adults||0) + ' Adult' + (r.adults===1?'':'s') + (r.children ? ' · ' + r.children + ' Child' + (r.children===1?'':'ren') : '');
    return `
      <div class="enquiry-card status-${r.status||'pending'}" style="cursor:pointer;" onclick="openReservationDetail('${r.id}')">
        <div class="enquiry-header">
          <div>
            <div class="enquiry-name">${fullName} <span style="color:var(--muted);font-weight:400;font-size:11px;">— ${r.ref_number||''}</span></div>
            ${r.package_name ? `<div class="enquiry-package">${r.package_name}</div>` : ''}
          </div>
          <div class="enquiry-date">${date}</div>
        </div>
        <div class="enquiry-contact">
          ${r.email ? `<span>✉️ ${r.email}</span>` : ''}
          ${r.phone ? `<span>📞 ${r.phone}</span>` : ''}
          ${r.country ? `<span>🌍 ${r.country}</span>` : ''}
          <span>👥 ${travellers}</span>
          ${r.travel_date ? `<span>📅 ${new Date(r.travel_date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>` : ''}
        </div>
        <div class="enquiry-actions" onclick="event.stopPropagation()">
          <select class="enquiry-status-select" onchange="updateReservationStatus('${r.id}',this.value)">
            <option value="pending"   ${r.status==='pending'   ?'selected':''}>Pending</option>
            <option value="confirmed" ${r.status==='confirmed' ?'selected':''}>Confirmed</option>
            <option value="cancelled" ${r.status==='cancelled' ?'selected':''}>Cancelled</option>
          </select>
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();openReservationDetail('${r.id}')">View Full Details</button>
          <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();deleteReservation('${r.id}')">Delete</button>
        </div>
      </div>`;
  }).join('');
}

function openReservationDetail(id) {
  const r = allReservations.find(x => x.id === id);
  if (!r) return;
  const fullName = ((r.first_name||'') + ' ' + (r.last_name||'')).trim() || 'Unknown';
  const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';
  const travelDate = r.travel_date ? new Date(r.travel_date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : 'Not specified';
  document.getElementById('resDetailContent').innerHTML = `
    <h2 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:4px;">${fullName}</h2>
    <p style="color:var(--gold);font-size:12px;letter-spacing:1px;margin-bottom:24px;">Reference: ${r.ref_number||'—'} · Submitted ${date}</p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
      <div>
        <span style="display:block;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">Package</span>
        <span style="font-size:14px;">${r.package_name||'—'}</span>
      </div>
      <div>
        <span style="display:block;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">Status</span>
        <span style="font-size:14px;text-transform:capitalize;">${r.status||'pending'}</span>
      </div>
      <div>
        <span style="display:block;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">Travellers</span>
        <span style="font-size:14px;">${r.adults||0} Adults, ${r.children||0} Children</span>
      </div>
      <div>
        <span style="display:block;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">Preferred Travel Date</span>
        <span style="font-size:14px;">${travelDate}</span>
      </div>
      <div>
        <span style="display:block;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">Email</span>
        <span style="font-size:14px;"><a href="mailto:${r.email||''}" style="color:var(--gold);">${r.email||'—'}</a></span>
      </div>
      <div>
        <span style="display:block;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">Phone / WhatsApp</span>
        <span style="font-size:14px;">${r.phone||'—'}</span>
      </div>
      <div>
        <span style="display:block;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">Country</span>
        <span style="font-size:14px;">${r.country||'—'}</span>
      </div>
      <div>
        <span style="display:block;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">How They Heard About Us</span>
        <span style="font-size:14px;">${r.how_heard||'—'}</span>
      </div>
    </div>

    ${r.message ? `
    <div style="margin-bottom:24px;">
      <span style="display:block;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:8px;">Message / Special Requests</span>
      <p style="font-family:'Cormorant Garamond',serif;font-size:16px;font-style:italic;color:var(--text);line-height:1.6;background:var(--card);padding:16px;border-left:2px solid var(--gold);">"${r.message}"</p>
    </div>` : ''}

    ${r.invoice_total ? `
    <div style="margin-bottom:24px;">
      <span style="display:block;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;">Invoice Total</span>
      <span style="font-size:22px;color:var(--gold);font-family:'Playfair Display',serif;">$${Number(r.invoice_total).toLocaleString()}</span>
    </div>` : ''}

    <div style="display:flex;gap:10px;flex-wrap:wrap;border-top:1px solid var(--border);padding-top:20px;">
      ${r.email ? `<a href="mailto:${r.email}" class="btn btn-outline btn-sm" style="text-decoration:none;">✉️ Email Traveller</a>` : ''}
      ${r.phone ? `<a href="https://wa.me/${r.phone.replace(/\D/g,'')}" target="_blank" class="btn btn-outline btn-sm" style="text-decoration:none;color:#25D366;border-color:rgba(37,211,102,0.4);">💬 WhatsApp</a>` : ''}
    </div>
  `;
  document.getElementById('resDetailOverlay').style.display = 'flex';
}

function closeReservationDetail() {
  document.getElementById('resDetailOverlay').style.display = 'none';
}

async function updateReservationStatus(id, status) {
  const { error } = await db.from('reservations').update({ status }).eq('id', id);
  if (error) { showToast('Error: ' + error.message, 'error'); return; }
  showToast('Reservation status updated to ' + status);
  loadReservations(document.getElementById('resStatusFilter')?.value || 'all');
}

async function deleteReservation(id) {
  if (!confirm('Delete this reservation permanently?')) return;
  await db.from('reservations').delete().eq('id', id);
  showToast('Reservation deleted');
  loadReservations(document.getElementById('resStatusFilter')?.value || 'all');
}

function exportReservationsCSV() {
  if (!allReservations.length) { showToast('No reservations to export', 'error'); return; }
  const headers = ['Reference','Name','Email','Phone','Country','Package','Adults','Children','Travel Date','Status','Submitted'];
  const rows = allReservations.map(r => [
    r.ref_number, ((r.first_name||'')+' '+(r.last_name||'')).trim(), r.email, r.phone, r.country,
    r.package_name, r.adults, r.children, r.travel_date, r.status, r.created_at
  ]);
  const csv = [headers, ...rows].map(row => row.map(v => `"${(v??'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'reservations.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════
// IMAGE UPLOAD — Supabase Storage ('package-images' bucket)
// Reusable across hero image, per-day accommodation images, activity images
// ═══════════════════════════════════════════════════════════════
function imgUploadFieldHTML(fieldClass, labelText, currentUrl, folder, required) {
  const req = required ? '<span class="req">*</span>' : '';
  return `
    <div class="form-group full">
      <label>${labelText} ${req} <span style="font-weight:400;font-size:8px;color:rgba(212,175,55,0.6);text-transform:none;">(upload an image, max 5MB)</span></label>
      <div class="img-upload-widget" data-folder="${folder}">
        <input type="hidden" class="${fieldClass}" value="${currentUrl||''}">
        <div class="img-upload-preview" style="${currentUrl?'':'display:none;'}">
          <img src="${currentUrl||''}" alt="">
          <button type="button" class="img-upload-remove" onclick="(function(btn){const w=btn.closest('.img-upload-widget');w.querySelector('input[type=hidden]').value='';w.querySelector('.img-upload-preview').style.display='none';w.querySelector('.img-upload-preview img').src='';}).call(this,this)">✕ Remove</button>
        </div>
        <input type="file" accept="image/*" class="img-upload-input" onchange="handleImageUpload(this)">
        <span class="img-upload-status"></span>
      </div>
    </div>`;
}

async function handleImageUpload(inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  const widget = inputEl.closest('.img-upload-widget');
  const hiddenField = widget.querySelector('input[type=hidden]');
  const preview = widget.querySelector('.img-upload-preview');
  const previewImg = preview.querySelector('img');
  const status = widget.querySelector('.img-upload-status');
  const folder = widget.dataset.folder || 'misc';

  if (!file.type.startsWith('image/')) {
    status.textContent = 'Please choose an image file.'; status.style.color = '#e05555';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    status.textContent = 'Image must be under 5MB.'; status.style.color = '#e05555';
    return;
  }

  status.textContent = 'Uploading...'; status.style.color = 'var(--muted)';
  try {
    const ext = file.name.split('.').pop().toLowerCase();
    const path = folder + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
    const { error: upErr } = await db.storage.from('package-images').upload(path, file);
    if (upErr) throw upErr;
    const { data } = db.storage.from('package-images').getPublicUrl(path);
    hiddenField.value = data.publicUrl;
    previewImg.src = data.publicUrl;
    preview.style.display = 'flex';
    status.textContent = 'Uploaded ✓'; status.style.color = '#7bb56e';
    inputEl.value = '';
    setTimeout(() => { status.textContent = ''; }, 2500);
  } catch (e) {
    status.textContent = 'Upload failed: ' + e.message; status.style.color = '#e05555';
  }
}

// ═══════════════════════════════════════════════════════════════
// PACKAGE FORM VALIDATION
// ═══════════════════════════════════════════════════════════════
function validatePackageForm() {
  document.querySelectorAll('#view-new-package .invalid').forEach(el => el.classList.remove('invalid'));
  document.querySelectorAll('#view-new-package .field-error.show').forEach(el => el.classList.remove('show'));

  let valid = true;
  function flag(fieldId, errId) {
    const f = document.getElementById(fieldId);
    const e = document.getElementById(errId);
    if (f) f.classList.add('invalid');
    if (e) e.classList.add('show');
    valid = false;
  }

  const name = document.getElementById('f-name')?.value.trim() || '';
  if (name.length < 5) flag('f-name', 'err-name');

  const slug = document.getElementById('f-slug')?.value.trim() || '';
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) flag('f-slug', 'err-slug');

  const tagline = document.getElementById('f-tagline')?.value.trim() || '';
  if (tagline.length < 10) flag('f-tagline', 'err-tagline');

  const badge = document.getElementById('f-badge')?.value.trim() || '';
  if (!badge) flag('f-badge', 'err-badge');

  const category = document.getElementById('f-category')?.value || '';
  if (!category) flag('f-category', 'err-category');

  const transport = document.getElementById('f-transport')?.value || '';
  if (!transport) flag('f-transport', 'err-transport');

  const days = parseInt(document.getElementById('f-days')?.value) || 0;
  if (days < 1) flag('f-days', 'err-days');

  const nights = document.getElementById('f-nights')?.value;
  if (!nights) flag('f-nights', 'err-nights');

  const destinations = (document.getElementById('f-destinations')?.value || '').split(',').map(s=>s.trim()).filter(Boolean);
  if (destinations.length < 2) flag('f-destinations', 'err-destinations');

  const overviewTitle = document.getElementById('f-overview-title')?.value.trim() || '';
  if (overviewTitle.length < 10) flag('f-overview-title', 'err-overview-title');

  const overviewBody = document.getElementById('f-overview-body')?.value.trim() || '';
  if (overviewBody.length < 80) flag('f-overview-body', 'err-overview-body');

  const heroUrl = document.getElementById('f-hero-image-url')?.value.trim() || '';
  if (!heroUrl) flag('f-hero-image-url', 'err-hero');

  const cardBgUrl = document.getElementById('f-card-bg-url')?.value.trim() || '';
  if (!cardBgUrl) flag('f-card-bg-url', 'err-card-bg');

  const highlights = (document.getElementById('f-short-highlights')?.value || '').split('\n').map(s=>s.trim()).filter(Boolean);
  if (highlights.length < 4 || highlights.length > 7) flag('f-short-highlights', 'err-highlights');

  const pricePeak = document.getElementById('f-price-peak')?.value;
  if (!pricePeak) flag('f-price-peak', 'err-price-peak');
  const priceHigh = document.getElementById('f-price-high')?.value;
  if (!priceHigh) flag('f-price-high', 'err-price-high');
  const priceGreen = document.getElementById('f-price-green')?.value;
  if (!priceGreen) flag('f-price-green', 'err-price-green');
  const priceSolo = document.getElementById('f-price-solo')?.value;
  if (!priceSolo) flag('f-price-solo', 'err-price-solo');
  const priceDuo = document.getElementById('f-price-duo')?.value;
  if (!priceDuo) flag('f-price-duo', 'err-price-duo');
  const priceGroup = document.getElementById('f-price-group')?.value;
  if (!priceGroup) flag('f-price-group', 'err-price-group');

  const peakMonths = document.getElementById('f-peak-months')?.value.trim() || '';
  if (!/^\d+(,\s*\d+)*$/.test(peakMonths)) flag('f-peak-months', 'err-peak-months');
  const highMonths = document.getElementById('f-high-months')?.value.trim() || '';
  if (!/^\d+(,\s*\d+)*$/.test(highMonths)) flag('f-high-months', 'err-high-months');
  const greenMonths = document.getElementById('f-green-months')?.value.trim() || '';
  if (!/^\d+(,\s*\d+)*$/.test(greenMonths)) flag('f-green-months', 'err-green-months');

  // Days repeater: require at least 1 day, and each day's title/location/description filled with enough length
  const dayRows = document.querySelectorAll('#daysRepeater .repeater-row');
  const dayIssues = [];
  if (dayRows.length === 0) {
    dayIssues.push('Add at least one day to the itinerary.');
    valid = false;
  }
  dayRows.forEach((row, i) => {
    const dTitle = row.querySelector('.day-title');
    const dLoc = row.querySelector('.day-location');
    const dDesc = row.querySelector('.day-desc');
    if (!dTitle?.value.trim()) { dTitle?.classList.add('invalid'); dayIssues.push(`Day ${i+1}: title is required.`); valid = false; }
    if (!dLoc?.value.trim()) { dLoc?.classList.add('invalid'); dayIssues.push(`Day ${i+1}: location is required.`); valid = false; }
    if ((dDesc?.value.trim()||'').length < 40) { dDesc?.classList.add('invalid'); dayIssues.push(`Day ${i+1}: description needs at least 40 characters (currently ${dDesc?.value.trim().length||0}) or it will look empty on the live page.`); valid = false; }

    // Each day's 3 accommodation tiers: name + description required
    const tierCards = row.querySelectorAll('.accom-tier-card');
    tierCards.forEach(card => {
      const tier = card.dataset.tier;
      const aName = card.querySelector('.accom-name');
      const aDesc = card.querySelector('.accom-desc');
      const aImg = card.querySelector('input[type=hidden][class*="accom-image"]');
      const hasAnyInput = aName?.value.trim() || aDesc?.value.trim();
      if (hasAnyInput) {
        // If they've started filling this tier, require it to be complete
        if (!aName?.value.trim()) { aName?.classList.add('invalid'); dayIssues.push(`Day ${i+1}, ${tier} option: lodge name is required.`); valid = false; }
        if ((aDesc?.value.trim()||'').length < 40) { aDesc?.classList.add('invalid'); dayIssues.push(`Day ${i+1}, ${tier} option: description needs at least 40 characters or it will look empty.`); valid = false; }
        if (!aImg?.value.trim()) { dayIssues.push(`Day ${i+1}, ${tier} option: no photo uploaded — this option will show a blank image.`); }
      }
    });
  });

  if (dayIssues.length) {
    let box = document.getElementById('dayValidationBox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'dayValidationBox';
      box.style.cssText = 'background:rgba(180,60,60,0.08);border:1px solid rgba(180,60,60,0.4);padding:14px 16px;margin-bottom:16px;font-size:12px;line-height:1.7;color:#e05555;';
      const repeater = document.getElementById('daysRepeater');
      repeater?.parentNode.insertBefore(box, repeater);
    }
    box.innerHTML = '<strong>Fix these before publishing:</strong><ul style="margin:8px 0 0 18px;">' + dayIssues.map(m => `<li>${m}</li>`).join('') + '</ul>';
  } else {
    document.getElementById('dayValidationBox')?.remove();
  }

  return valid;
}

// ═══════════════════════════════════════════════════════════════
// PACKAGE FORM VALIDATION
// ═══════════════════════════════════════════════════════════════
function validatePackageForm() {
  document.querySelectorAll('#view-new-package .invalid').forEach(el => el.classList.remove('invalid'));
  document.querySelectorAll('#view-new-package .field-error.show').forEach(el => el.classList.remove('show'));

  let valid = true;
  function flag(fieldId, errId) {
    const f = document.getElementById(fieldId);
    const e = document.getElementById(errId);
    if (f) f.classList.add('invalid');
    if (e) e.classList.add('show');
    valid = false;
  }

  const name = document.getElementById('f-name')?.value.trim() || '';
  if (name.length < 5) flag('f-name', 'err-name');

  const slug = document.getElementById('f-slug')?.value.trim() || '';
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) flag('f-slug', 'err-slug');

  const tagline = document.getElementById('f-tagline')?.value.trim() || '';
  if (tagline.length < 10) flag('f-tagline', 'err-tagline');

  const badge = document.getElementById('f-badge')?.value.trim() || '';
  if (!badge) flag('f-badge', 'err-badge');

  const category = document.getElementById('f-category')?.value || '';
  if (!category) flag('f-category', 'err-category');

  const transport = document.getElementById('f-transport')?.value || '';
  if (!transport) flag('f-transport', 'err-transport');

  const days = parseInt(document.getElementById('f-days')?.value) || 0;
  if (days < 1) flag('f-days', 'err-days');

  const nights = document.getElementById('f-nights')?.value;
  if (!nights) flag('f-nights', 'err-nights');

  const destinations = (document.getElementById('f-destinations')?.value || '').split(',').map(s=>s.trim()).filter(Boolean);
  if (destinations.length < 2) flag('f-destinations', 'err-destinations');

  const overviewTitle = document.getElementById('f-overview-title')?.value.trim() || '';
  if (overviewTitle.length < 10) flag('f-overview-title', 'err-overview-title');

  const overviewBody = document.getElementById('f-overview-body')?.value.trim() || '';
  if (overviewBody.length < 80) flag('f-overview-body', 'err-overview-body');

  const heroUrl = document.getElementById('f-hero-image-url')?.value.trim() || '';
  if (!heroUrl) flag('f-hero-image-url', 'err-hero');

  const cardBgUrl = document.getElementById('f-card-bg-url')?.value.trim() || '';
  if (!cardBgUrl) flag('f-card-bg-url', 'err-card-bg');

  const highlights = (document.getElementById('f-short-highlights')?.value || '').split('\n').map(s=>s.trim()).filter(Boolean);
  if (highlights.length < 4 || highlights.length > 7) flag('f-short-highlights', 'err-highlights');

  const pricePeak = document.getElementById('f-price-peak')?.value;
  if (!pricePeak) flag('f-price-peak', 'err-price-peak');
  const priceHigh = document.getElementById('f-price-high')?.value;
  if (!priceHigh) flag('f-price-high', 'err-price-high');
  const priceGreen = document.getElementById('f-price-green')?.value;
  if (!priceGreen) flag('f-price-green', 'err-price-green');
  const priceSolo = document.getElementById('f-price-solo')?.value;
  if (!priceSolo) flag('f-price-solo', 'err-price-solo');
  const priceDuo = document.getElementById('f-price-duo')?.value;
  if (!priceDuo) flag('f-price-duo', 'err-price-duo');
  const priceGroup = document.getElementById('f-price-group')?.value;
  if (!priceGroup) flag('f-price-group', 'err-price-group');

  const peakMonths = document.getElementById('f-peak-months')?.value.trim() || '';
  if (!/^\d+(,\s*\d+)*$/.test(peakMonths)) flag('f-peak-months', 'err-peak-months');
  const highMonths = document.getElementById('f-high-months')?.value.trim() || '';
  if (!/^\d+(,\s*\d+)*$/.test(highMonths)) flag('f-high-months', 'err-high-months');
  const greenMonths = document.getElementById('f-green-months')?.value.trim() || '';
  if (!/^\d+(,\s*\d+)*$/.test(greenMonths)) flag('f-green-months', 'err-green-months');

  // Days repeater: require at least 1 day, and each day's title/location/description filled with enough length
  const dayRows = document.querySelectorAll('#daysRepeater .repeater-row');
  const dayIssues = [];
  if (dayRows.length === 0) {
    dayIssues.push('Add at least one day to the itinerary.');
    valid = false;
  }
  dayRows.forEach((row, i) => {
    const dTitle = row.querySelector('.day-title');
    const dLoc = row.querySelector('.day-location');
    const dDesc = row.querySelector('.day-desc');
    if (!dTitle?.value.trim()) { dTitle?.classList.add('invalid'); dayIssues.push(`Day ${i+1}: title is required.`); valid = false; }
    if (!dLoc?.value.trim()) { dLoc?.classList.add('invalid'); dayIssues.push(`Day ${i+1}: location is required.`); valid = false; }
    if ((dDesc?.value.trim()||'').length < 40) { dDesc?.classList.add('invalid'); dayIssues.push(`Day ${i+1}: description needs at least 40 characters (currently ${dDesc?.value.trim().length||0}) or it will look empty on the live page.`); valid = false; }

    // Each day's 3 accommodation tiers: name + description required
    const tierCards = row.querySelectorAll('.accom-tier-card');
    tierCards.forEach(card => {
      const tier = card.dataset.tier;
      const aName = card.querySelector('.accom-name');
      const aDesc = card.querySelector('.accom-desc');
      const aImg = card.querySelector('input[type=hidden][class*="accom-image"]');
      const hasAnyInput = aName?.value.trim() || aDesc?.value.trim();
      if (hasAnyInput) {
        // If they've started filling this tier, require it to be complete
        if (!aName?.value.trim()) { aName?.classList.add('invalid'); dayIssues.push(`Day ${i+1}, ${tier} option: lodge name is required.`); valid = false; }
        if ((aDesc?.value.trim()||'').length < 40) { aDesc?.classList.add('invalid'); dayIssues.push(`Day ${i+1}, ${tier} option: description needs at least 40 characters or it will look empty.`); valid = false; }
        if (!aImg?.value.trim()) { dayIssues.push(`Day ${i+1}, ${tier} option: no photo uploaded — this option will show a blank image.`); }
      }
    });
  });

  if (dayIssues.length) {
    let box = document.getElementById('dayValidationBox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'dayValidationBox';
      box.style.cssText = 'background:rgba(180,60,60,0.08);border:1px solid rgba(180,60,60,0.4);padding:14px 16px;margin-bottom:16px;font-size:12px;line-height:1.7;color:#e05555;';
      const repeater = document.getElementById('daysRepeater');
      repeater?.parentNode.insertBefore(box, repeater);
    }
    box.innerHTML = '<strong>Fix these before publishing:</strong><ul style="margin:8px 0 0 18px;">' + dayIssues.map(m => `<li>${m}</li>`).join('') + '</ul>';
  } else {
    document.getElementById('dayValidationBox')?.remove();
  }

  return valid;
}
function toggleAuthPassword() {
  var f = document.getElementById('authPassword');
  var btn = document.getElementById('authPwToggle');
  if (f.type === 'password') { f.type = 'text'; btn.textContent = '🙈'; }
  else { f.type = 'password'; btn.textContent = '👁'; }
}

// ── CUSTOM CURSOR ──
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
    rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12;
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();
})();
