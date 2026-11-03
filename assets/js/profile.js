/* Filmax Jambo Tours — My Account (profile/index.html)
 * Opened in the homepage's profile modal (iframe) or directly at /profile/.
 * Talks to the parent with the FJ_* postMessage events the homepage already handles.
 */
(function () {
  'use strict';
  var SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
  var supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);

  var EMAIL = 'hello@filmaxjambotours.com';
  var WHATSAPP = '34672304384';

  var user = null, profile = {}, dirty = false;
  var reservations = [], wishlist = [];
  var inFrame = window.top !== window.self;

  if (document.documentElement.classList.contains('pf-light-boot')) document.body.classList.add('light-mode');

  /* ---------- icons ---------- */
  var I = {
    home: '<svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    trip: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>',
    help: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/></svg>',
    pen: '<svg viewBox="0 0 24 24"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    people: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .6 3.2 2.2 3.8 5"/></svg>',
    tag: '<svg viewBox="0 0 24 24"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.2"/></svg>',
    compass: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8c-1-.4-1.8-1.2-2.2-2.2l.8-1-1-2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" class="pf-arrow"><path d="M9 6l6 6-6 6"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  /* ---------- parent bridge ---------- */
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.type === 'FJ_THEME') document.body.classList.toggle('light-mode', !!d.light);
    if (d.type === 'FJ_PROFILE_CHECK_DIRTY') {
      if (!dirty) post('FJ_PROFILE_CLOSE_CONFIRMED');
      else if (confirm('You have unsaved changes. Close anyway?')) { setDirty(false); post('FJ_PROFILE_CLOSE_CONFIRMED'); }
    }
  });
  function post(type, extra) {
    try { window.top.postMessage(Object.assign({ type: type }, extra || {}), '*'); } catch (err) {}
  }
  function leave() {
    if (inFrame) post('FJ_PROFILE_CLOSE_CONFIRMED');
    else location.href = '/home/';
  }

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function val(id) { var el = $(id); return el ? el.value.trim() : ''; }
  var toastTimer;
  function toast(msg, isErr) {
    var t = $('toast');
    t.textContent = msg;
    t.className = 'pf-toast show' + (isErr ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = 'pf-toast'; }, 2800);
  }
  function fmtDate(d, opts) {
    if (!d) return '';
    var dt = new Date(d);
    return isNaN(dt) ? '' : dt.toLocaleDateString('en-GB', opts || { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function guests(b) {
    var a = b.adults || 1, c = b.children || 0;
    return a + ' adult' + (a !== 1 ? 's' : '') + (c > 0 ? ', ' + c + ' child' + (c !== 1 ? 'ren' : '') : '');
  }
  function waLink(text) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text); }
  function packageLink(name) {
    var slug = String(name || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return slug ? '/packages/' + slug + '/' : '/packages/';
  }
  function setDirty(on) {
    dirty = on;
    var ind = $('dirtyInd');
    if (ind) {
      ind.classList.toggle('on', on);
      ind.lastChild.nodeValue = on ? ' Unsaved changes' : ' All changes saved';
    }
  }
  var STATUS = { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' };

  $('backBtn').addEventListener('click', function () {
    if (dirty && !confirm('You have unsaved changes. Close anyway?')) return;
    setDirty(false);
    leave();
  });
  $('signOutBtn').addEventListener('click', async function () {
    if (dirty && !confirm('You have unsaved changes. Sign out anyway?')) return;
    await supa.auth.signOut();
    if (inFrame) post('FJ_PROFILE_SIGNED_OUT');
    else location.href = '/home/';
  });
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- tabs ---------- */
  var TABS = [
    { id: 'overview', label: 'Overview', icon: I.home },
    { id: 'details', label: 'My Details', icon: I.user },
    { id: 'trips', label: 'Reservations', icon: I.trip, count: function () { return reservations.length; } },
    { id: 'wishlist', label: 'Wishlist', icon: I.heart, count: function () { return wishlist.length; } },
    { id: 'help', label: 'Help', icon: I.help }
  ];
  function showTab(id) {
    document.querySelectorAll('.pf-tab').forEach(function (t) {
      var on = t.getAttribute('data-tab') === id;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
      if (on && t.scrollIntoView) { try { t.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {} }
    });
    document.querySelectorAll('.pf-panel').forEach(function (p) { p.classList.toggle('active', p.id === 'panel-' + id); });
    try { sessionStorage.setItem('pf-tab', id); } catch (e) {}
  }
  function refreshCounts() {
    TABS.forEach(function (t) {
      if (!t.count) return;
      var el = document.querySelector('.pf-tab[data-tab="' + t.id + '"] .pf-count');
      if (el) el.textContent = t.count();
    });
    if ($('statTrips')) $('statTrips').textContent = reservations.length;
    if ($('statWish')) $('statWish').textContent = wishlist.length;
  }

  /* ---------- render shell ---------- */
  function render() {
    var first = profile.first_name || '', last = profile.last_name || '';
    var full = (first + ' ' + last).trim() || 'Explorer';
    var initial = (first || user.email || 'E').charAt(0).toUpperCase();
    var joined = fmtDate(user.created_at, { month: 'long', year: 'numeric' });

    $('root').innerHTML =
      '<section class="pf-hero">' +
        '<div class="pf-avatar-wrap">' +
          '<div class="pf-avatar" id="avatarBox">' +
            (profile.avatar_url ? '<img src="' + esc(profile.avatar_url) + '" alt="">' : '<span>' + esc(initial) + '</span>') +
          '</div>' +
          '<button type="button" class="pf-avatar-btn" id="avatarBtn" title="Change photo" aria-label="Change profile photo">' + I.pen + '</button>' +
        '</div>' +
        '<div>' +
          '<span class="pf-eyebrow">Welcome back</span>' +
          '<div class="pf-name" id="heroName">' + esc(full) + '</div>' +
          '<div class="pf-meta">' + esc(user.email) + (joined ? ' · Member since ' + esc(joined) : '') + '</div>' +
        '</div>' +
        '<div class="pf-stats">' +
          '<button type="button" class="pf-stat" data-go="trips"><b id="statTrips">–</b><small>Reservations</small></button>' +
          '<button type="button" class="pf-stat" data-go="wishlist"><b id="statWish">–</b><small>Saved</small></button>' +
        '</div>' +
      '</section>' +

      '<nav class="pf-tabs" role="tablist">' +
        TABS.map(function (t) {
          return '<button type="button" class="pf-tab" role="tab" data-tab="' + t.id + '">' + t.icon + t.label +
            (t.count ? '<span class="pf-count">–</span>' : '') + '</button>';
        }).join('') +
      '</nav>' +

      '<section class="pf-panel" id="panel-overview"></section>' +
      '<section class="pf-panel" id="panel-details"></section>' +
      '<section class="pf-panel" id="panel-trips"><div class="pf-loading"><span class="pf-spinner"></span>Loading reservations…</div></section>' +
      '<section class="pf-panel" id="panel-wishlist"><div class="pf-loading"><span class="pf-spinner"></span>Loading wishlist…</div></section>' +
      '<section class="pf-panel" id="panel-help"></section>';

    document.querySelectorAll('.pf-tab').forEach(function (t) {
      t.addEventListener('click', function () { showTab(t.getAttribute('data-tab')); });
    });
    document.querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () { showTab(b.getAttribute('data-go')); });
    });
    $('avatarBtn').addEventListener('click', function () { $('avatarInput').click(); });

    renderDetails();
    renderHelp();
    renderOverview();
    var start = 'overview';
    try { start = sessionStorage.getItem('pf-tab') || 'overview'; } catch (e) {}
    showTab(TABS.some(function (t) { return t.id === start; }) ? start : 'overview');

    loadReservations();
    loadWishlist();
  }

  /* ---------- overview ---------- */
  function completeness() {
    var fields = ['first_name', 'last_name', 'phone', 'country', 'avatar_url'];
    var done = fields.filter(function (f) { return profile[f]; }).length;
    return Math.round(done / fields.length * 100);
  }
  function nextTrip() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var upcoming = reservations.filter(function (b) {
      return b.status !== 'cancelled' && b.status !== 'completed' && b.travel_date && new Date(b.travel_date) >= today;
    }).sort(function (a, b) { return new Date(a.travel_date) - new Date(b.travel_date); });
    return upcoming[0] || reservations.filter(function (b) { return b.status === 'pending' && !b.travel_date; })[0] || null;
  }
  function renderOverview() {
    var trip = nextTrip();
    var pct = completeness();
    var tripHtml;
    if (trip) {
      var days = trip.travel_date ? Math.ceil((new Date(trip.travel_date) - new Date()) / 86400000) : null;
      tripHtml =
        '<span class="pf-label">Your next journey</span>' +
        '<div class="pf-trip-name">' + esc(trip.package_name || 'Safari') + '</div>' +
        (days != null && days >= 0 ? '<div class="pf-countdown"><b>' + days + '</b><small>' + (days === 1 ? 'day to go' : 'days to go') + '</small></div>' : '') +
        '<div class="pf-trip-facts">' +
          '<span>' + I.cal + esc(fmtDate(trip.travel_date) || 'Date to be confirmed') + '</span>' +
          '<span>' + I.people + esc(guests(trip)) + '</span>' +
          (trip.ref_number ? '<span>' + I.tag + 'Ref ' + esc(trip.ref_number) + '</span>' : '') +
        '</div>' +
        '<span class="pf-pill ' + esc(trip.status || 'pending') + '">' + esc(STATUS[trip.status] || 'Pending') + '</span>' +
        '<div class="pf-res-actions" style="margin-top:18px">' +
          '<button type="button" class="pf-btn pf-btn-ghost pf-btn-sm" data-go="trips">All reservations</button>' +
          '<a class="pf-btn pf-btn-ghost pf-btn-sm" target="_blank" rel="noopener" href="' + waLink('Hello Filmax Jambo Tours, about my reservation' + (trip.ref_number ? ' ' + trip.ref_number : '') + ' (' + (trip.package_name || 'safari') + ').') + '">' + I.wa + 'Ask about it</a>' +
        '</div>';
    } else {
      tripHtml =
        '<span class="pf-label">Your next journey</span>' +
        '<div class="pf-trip-name">Not booked yet</div>' +
        '<p class="pf-card-sub" style="margin-bottom:20px">Explore our curated journeys, or let our team design one around you.</p>' +
        '<a class="pf-btn pf-btn-gold" href="/packages/" target="_top">Explore journeys</a>';
    }

    $('panel-overview').innerHTML =
      '<div class="pf-grid-2">' +
        '<div class="pf-card">' + tripHtml + '</div>' +
        '<div class="pf-card">' +
          '<span class="pf-label">Quick actions</span>' +
          '<div class="pf-quick" style="margin-top:14px">' +
            '<button type="button" data-go="details">' + I.user + '<span><strong>Update my details</strong><small>Name, phone and country</small></span>' + I.arrow + '</button>' +
            '<a href="/packages/" target="_top">' + I.compass + '<span><strong>Browse journeys</strong><small>All safari collections</small></span>' + I.arrow + '</a>' +
            '<a href="' + waLink("Hello Filmax Jambo Tours, I'd like help planning a safari.") + '" target="_blank" rel="noopener">' + I.wa + '<span><strong>Plan with a specialist</strong><small>Chat on WhatsApp</small></span>' + I.arrow + '</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="pf-card">' +
        '<div class="pf-card-head"><div><div class="pf-card-title">Profile ' + (pct === 100 ? 'complete' : pct + '% complete') + '</div>' +
        '<div class="pf-card-sub">' + (pct === 100 ? 'Thank you — we have everything we need to reach you.' : 'Add your phone, country and photo so our team can reach you quickly.') + '</div></div>' +
        (pct < 100 ? '<button type="button" class="pf-btn pf-btn-ghost pf-btn-sm" data-go="details">Complete</button>' : '') + '</div>' +
        '<div class="pf-progress"><i style="width:' + pct + '%"></i></div>' +
      '</div>';

    $('panel-overview').querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () { showTab(b.getAttribute('data-go')); });
    });
  }

  /* ---------- details ---------- */
  function renderDetails() {
    $('panel-details').innerHTML =
      '<div class="pf-card">' +
        '<div class="pf-card-head"><div><div class="pf-card-title">My Details</div>' +
        '<div class="pf-card-sub">Keep these current so we can reach you about your safari.</div></div></div>' +
        '<form class="pf-form" id="detailsForm" novalidate>' +
          '<div class="pf-field"><label for="pfFirst">First name <em>*</em></label><input id="pfFirst" autocomplete="given-name" value="' + esc(profile.first_name || '') + '"></div>' +
          '<div class="pf-field"><label for="pfLast">Last name</label><input id="pfLast" autocomplete="family-name" value="' + esc(profile.last_name || '') + '"></div>' +
          '<div class="pf-field"><label for="pfPhone">Phone / WhatsApp</label><input id="pfPhone" type="tel" autocomplete="tel" placeholder="+254 …" value="' + esc(profile.phone || '') + '"><span class="pf-hint">Include your country code.</span></div>' +
          '<div class="pf-field"><label for="pfCountry">Country of residence</label><input id="pfCountry" autocomplete="country-name" value="' + esc(profile.country || '') + '"></div>' +
          '<div class="pf-field full"><label for="pfEmail">Sign-in email</label><input id="pfEmail" value="' + esc(user.email) + '" readonly><span class="pf-hint">To change your sign-in email, contact ' + EMAIL + '.</span></div>' +
        '</form>' +
        '<div class="pf-savebar">' +
          '<span class="pf-dirty" id="dirtyInd"><i></i> All changes saved</span>' +
          '<button type="button" class="pf-btn pf-btn-gold" id="saveBtn">Save changes</button>' +
        '</div>' +
      '</div>';

    ['pfFirst', 'pfLast', 'pfPhone', 'pfCountry'].forEach(function (id) {
      $(id).addEventListener('input', function () { $(id).classList.remove('invalid'); setDirty(true); });
    });
    $('detailsForm').addEventListener('submit', function (e) { e.preventDefault(); saveDetails(); });
    $('saveBtn').addEventListener('click', saveDetails);
  }

  async function saveDetails() {
    var btn = $('saveBtn');
    var first = val('pfFirst');
    if (!first) { $('pfFirst').classList.add('invalid'); $('pfFirst').focus(); toast('First name is required', true); return; }
    btn.disabled = true; btn.textContent = 'Saving…';
    var payload = {
      id: user.id, email: user.email,
      first_name: first, last_name: val('pfLast'),
      phone: val('pfPhone'), country: val('pfCountry'),
      updated_at: new Date().toISOString()
    };
    var res = await supa.from('profiles').upsert(payload, { onConflict: 'id' });
    btn.disabled = false; btn.textContent = 'Save changes';
    if (res.error) { toast('Could not save: ' + res.error.message, true); return; }
    profile = Object.assign(profile, payload);
    setDirty(false);
    toast('Your details have been saved');
    post('FJ_PROFILE_SAVED', { firstName: payload.first_name, lastName: payload.last_name });
    $('heroName').textContent = (payload.first_name + ' ' + payload.last_name).trim();
    renderOverview();
  }

  /* ---------- avatar ---------- */
  $('avatarInput').addEventListener('change', async function () {
    var input = this, file = input.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { toast('Image must be under 4MB', true); input.value = ''; return; }
    toast('Uploading photo…');
    var ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    var path = user.id + '/avatar-' + Date.now() + '.' + ext;
    var up = await supa.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
    if (up.error) { toast('Upload failed: ' + up.error.message, true); input.value = ''; return; }
    var pub = supa.storage.from('avatars').getPublicUrl(path);
    var url = pub.data && pub.data.publicUrl;
    if (!url) { toast('Could not read image URL', true); input.value = ''; return; }
    await supa.from('profiles').upsert({ id: user.id, avatar_url: url, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    profile.avatar_url = url;
    $('avatarBox').innerHTML = '<img src="' + esc(url) + '?t=' + Date.now() + '" alt="">';
    toast('Photo updated');
    input.value = '';
    renderOverview();
  });

  /* ---------- reservations ---------- */
  async function loadReservations() {
    var r = await supa.from('reservations').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    reservations = (!r.error && r.data) ? r.data : [];
    var el = $('panel-trips');
    if (!reservations.length) {
      el.innerHTML =
        '<div class="pf-empty">' + I.trip + '<p>No reservations yet — your first journey is waiting.</p>' +
        '<a class="pf-btn pf-btn-gold" href="/packages/" target="_top">Explore journeys</a></div>';
    } else {
      el.innerHTML = reservations.map(function (b) {
        var st = STATUS[b.status] ? b.status : 'pending';
        return '<article class="pf-res">' +
          '<div class="pf-res-name">' + esc(b.package_name || 'Safari') + '</div>' +
          '<span class="pf-pill ' + st + '">' + STATUS[st] + '</span>' +
          '<div class="pf-res-facts">' +
            '<span>' + I.cal + esc(fmtDate(b.travel_date) || 'Date to be confirmed') + '</span>' +
            '<span>' + I.people + esc(guests(b)) + '</span>' +
            (b.ref_number ? '<span>' + I.tag + 'Ref ' + esc(b.ref_number) + '</span>' : '') +
            (b.created_at ? '<span>Booked ' + esc(fmtDate(b.created_at, { day: 'numeric', month: 'short', year: 'numeric' })) + '</span>' : '') +
          '</div>' +
          '<div class="pf-res-actions">' +
            '<a class="pf-btn pf-btn-ghost pf-btn-sm" target="_blank" rel="noopener" href="' + waLink('Hello Filmax Jambo Tours, about my reservation' + (b.ref_number ? ' ' + b.ref_number : '') + ' (' + (b.package_name || 'safari') + ').') + '">' + I.wa + 'WhatsApp us</a>' +
            '<a class="pf-btn pf-btn-ghost pf-btn-sm" href="mailto:' + EMAIL + '?subject=' + encodeURIComponent('Reservation ' + (b.ref_number || '') + ' — ' + (b.package_name || 'Safari')) + '">' + I.mail + 'Email</a>' +
          '</div>' +
        '</article>';
      }).join('');
    }
    refreshCounts();
    renderOverview();
  }

  /* ---------- wishlist ---------- */
  async function loadWishlist() {
    var r = await supa.from('wishlists').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    var el = $('panel-wishlist');
    if (r.error) { el.innerHTML = '<div class="pf-empty">' + I.heart + '<p>Your wishlist is unavailable right now.</p></div>'; return; }
    wishlist = r.data || [];
    drawWishlist();
  }
  function drawWishlist() {
    var el = $('panel-wishlist');
    refreshCounts();
    if (!wishlist.length) {
      el.innerHTML =
        '<div class="pf-empty">' + I.heart + '<p>Nothing saved yet — tap the heart on any package to keep it here.</p>' +
        '<a class="pf-btn pf-btn-gold" href="/packages/" target="_top">Browse journeys</a></div>';
      return;
    }
    el.innerHTML = '<div class="pf-wish-grid">' + wishlist.map(function (w) {
      var url = w.package_url || packageLink(w.package_name);
      return '<article class="pf-wish" data-wid="' + esc(w.id) + '">' +
        '<div class="pf-wish-img">' + (w.image_url ? '<img src="' + esc(w.image_url) + '" alt="" loading="lazy">' : '') +
          '<button type="button" class="pf-wish-remove" data-remove="' + esc(w.id) + '" title="Remove" aria-label="Remove ' + esc(w.package_name) + ' from wishlist">' + I.x + '</button></div>' +
        '<div class="pf-wish-body">' +
          '<div class="pf-wish-name">' + esc(String(w.package_name || 'Saved journey').replace(/<br\s*\/?>/gi, ' ')) + '</div>' +
          '<div class="pf-wish-actions">' +
            '<a class="pf-btn pf-btn-ghost" href="' + esc(url) + '" target="_top">View</a>' +
            '<a class="pf-btn pf-btn-gold" href="' + esc(url) + (url.indexOf('?') > -1 ? '&' : '?') + 'view=reserve" target="_top">Reserve</a>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('') + '</div>';
    el.querySelectorAll('[data-remove]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var id = btn.getAttribute('data-remove');
        btn.disabled = true;
        var del = await supa.from('wishlists').delete().eq('id', id);
        if (del.error) { btn.disabled = false; toast('Could not remove', true); return; }
        wishlist = wishlist.filter(function (w) { return String(w.id) !== String(id); });
        drawWishlist();
        toast('Removed from wishlist');
      });
    });
  }

  /* ---------- help ---------- */
  function renderHelp() {
    $('panel-help').innerHTML =
      '<div class="pf-card">' +
        '<div class="pf-card-head"><div><div class="pf-card-title">How can we help?</div>' +
        '<div class="pf-card-sub">Our team replies Mon–Sat, 8am–7pm EAT.</div></div></div>' +
        '<div class="pf-help pf-quick">' +
          '<a href="' + waLink('Hello Filmax Jambo Tours, I need some help with my account.') + '" target="_blank" rel="noopener">' + I.wa + '<span><strong>WhatsApp</strong><small>+34 672 304 384</small></span>' + I.arrow + '</a>' +
          '<a href="mailto:' + EMAIL + '">' + I.mail + '<span><strong>Email</strong><small>' + EMAIL + '</small></span>' + I.arrow + '</a>' +
          '<a href="/packages/" target="_top">' + I.compass + '<span><strong>All journeys</strong><small>Browse and reserve</small></span>' + I.arrow + '</a>' +
        '</div>' +
      '</div>';
  }

  /* ---------- boot ---------- */
  (async function () {
    var s = await supa.auth.getSession();
    user = s.data && s.data.session ? s.data.session.user : null;
    if (!user) {
      $('root').innerHTML =
        '<div class="pf-empty" style="margin-top:40px">' + I.user + '<p>You are signed out. Please sign in again to see your account.</p>' +
        '<button type="button" class="pf-btn pf-btn-gold" id="signedOutBack">Back to the site</button></div>';
      $('signedOutBack').addEventListener('click', leave);
      return;
    }
    var p = await supa.from('profiles').select('*').eq('id', user.id).single();
    profile = p.data || {};
    if (!profile.id) {
      var meta = user.user_metadata || {};
      var nm = (meta.full_name || meta.name || '').split(' ');
      profile = { id: user.id, email: user.email, first_name: meta.first_name || nm[0] || '', last_name: meta.last_name || nm.slice(1).join(' ') || '', avatar_url: meta.avatar_url || '' };
      await supa.from('profiles').upsert(profile, { onConflict: 'id' });
    }
    render();
  })();
})();
