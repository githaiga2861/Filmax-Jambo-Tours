/* Filmax Jambo Tours — Private Concierge chat
 * Chat panel opened from the concierge button in the bottom dock (fjt-dock.js).
 * API: window.FJTChat.open() / close() / toggle() / isOpen() / onChange(cb)
 * Backend: Supabase Edge Function "gemini-chat".
 * Include on a page: <script src="/assets/js/gemini-chat.js" defer></script>
 */
(function () {
  if (window.__fjtChat) return;
  window.__fjtChat = true;

  var SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
  var ENDPOINT = SUPA_URL + '/functions/v1/gemini-chat';
  var LOGO = '/assets/FILMAX_JAMBO_TOURS__1_-removebg-preview.webp';
  var STORE = 'fjt-chat-v2';

  // Contact details: defaults, then the admin's site_settings, then whatever the function returns.
  var contact = { whatsapp: '34672304384', phone: '+34 672 304 384', email: 'hello@filmaxjambotours.com' };

  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5v-8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M8.5 8.5h7M8.5 11.5h4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.91-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35M12.05 21.79a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41Z"/></svg>';

  // Official channels (from linktr.ee/filmaxjambotours)
  var SOCIALS = [
    { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/Filmax_Jambo_Tours',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".8" fill="currentColor" stroke="none"/></svg>' },
    { id: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@filmax_jambo_tours',
      svg: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 2c.3 2.2 1.8 3.9 4 4.2v3c-1.5 0-2.9-.5-4-1.3v6.6a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v3.1a2.8 2.8 0 1 0 2 2.7V2h3z"/></svg>' },
    { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@filmaxjambotours',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.3l5 2.7-5 2.7z" fill="currentColor" stroke="none"/></svg>' },
    { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/Filmax-Jambo-Tours',
      svg: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21z"/></svg>' },
    { id: 'x', label: 'X', url: 'https://x.com/filmax_tours',
      svg: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.4 21H2.3l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>' },
    { id: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/34672304384', svg: null },
    { id: 'email', label: 'Email', url: 'mailto:hello@filmaxjambotours.com',
      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6 8.5-6"/></svg>' }
  ];
  var LINKTREE = 'https://linktr.ee/filmaxjambotours';

  var WA_REQUEST = /\b(whats\s?app|wa\.me|human|real person|an agent|live agent)\b/i;
  var CHIPS = [
    { label: 'Best time to visit', text: 'When is the best time to visit Kenya for a safari?' },
    { label: 'Honeymoon ideas', text: 'What honeymoon safaris do you recommend?' },
    { label: 'Family safaris', text: 'Which safaris work best for a family with children?' },
    { label: 'Under $3,000', text: 'What journeys do you offer for under $3,000 per person?' },
    { label: 'Follow our safaris', text: 'Where can I follow Filmax Jambo Tours on social media?' }
  ];

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html; // only ever used with static markup above
    return n;
  }
  function waLink(text) {
    return 'https://wa.me/' + String(contact.whatsapp).replace(/\D/g, '') +
      '?text=' + encodeURIComponent(text || "Hello Filmax Jambo Tours, I'd like to plan a safari.");
  }
  function openWhatsApp(text) {
    var w = window.open(waLink(text), '_blank', 'noopener');
    if (!w) location.href = waLink(text);
  }
  function load() { try { return JSON.parse(sessionStorage.getItem(STORE) || '[]'); } catch (e) { return []; } }
  function save(h) { try { sessionStorage.setItem(STORE, JSON.stringify(h.slice(-24))); } catch (e) {} }

  // Safe rich text: plain text with clickable links and "• " bullets, built with DOM nodes only.
  function richText(target, text) {
    var re = /(https?:\/\/[^\s)]+|filmaxjambotours\.com\/[^\s)]*|\/packages\/[a-z0-9-]+\/?(?:\?view=reserve)?)/gi;
    String(text).split('\n').forEach(function (line, i) {
      if (i) target.appendChild(document.createElement('br'));
      var last = 0, m;
      while ((m = re.exec(line))) {
        if (m.index > last) target.appendChild(document.createTextNode(line.slice(last, m.index)));
        var raw = m[0].replace(/[.,;:!?]+$/, '');
        var href = /^https?:/i.test(raw) ? raw : (raw.charAt(0) === '/' ? raw : 'https://' + raw);
        var a = document.createElement('a');
        a.href = href;
        a.textContent = raw.replace(/^https?:\/\/(www\.)?/, '');
        if (!/filmaxjambotours\.com|^\//.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
        target.appendChild(a);
        if (raw.length < m[0].length) target.appendChild(document.createTextNode(m[0].slice(raw.length)));
        last = m.index + m[0].length;
      }
      if (last < line.length) target.appendChild(document.createTextNode(line.slice(last)));
    });
  }

  function init() {
    if (!document.querySelector('link[href*="gemini-chat.css"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/assets/css/gemini-chat.css?v=20261103b';
      document.head.appendChild(link);
    }
    document.body.classList.add('fjt-chat-on');

    var changeListeners = [];

    // Panel
    var panel = el('div', 'fjt-panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Filmax Jambo Tours concierge');
    panel.innerHTML =
      '<div class="fjt-head">' +
        '<div class="fjt-brand"><span class="fjt-logo"><img src="' + LOGO + '" alt="Filmax Jambo Tours"></span>' +
        '<span class="fjt-brand-text"><span class="fjt-title">Filmax Concierge</span><span class="fjt-status"><i></i>Online now</span></span></div>' +
        '<div class="fjt-head-actions">' +
          '<button type="button" class="fjt-icon-btn fjt-wa-btn" aria-label="Chat with us on WhatsApp" title="WhatsApp">' + ICON_WA + '</button>' +
          '<button type="button" class="fjt-icon-btn fjt-close" aria-label="Close chat" title="Close">' + ICON_CLOSE + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="fjt-log" aria-live="polite"></div>' +
      '<div class="fjt-chips"></div>' +
      '<form class="fjt-form" autocomplete="off">' +
        '<input class="fjt-input" type="text" maxlength="1000" placeholder="Ask about journeys, parks, seasons…" aria-label="Your message">' +
        '<button type="submit" class="fjt-send" aria-label="Send">' + ICON_SEND + '</button>' +
      '</form>' +
      '<div class="fjt-social-bar"><span class="fjt-social-label">Follow us</span><span class="fjt-social-icons"></span></div>';

    document.body.appendChild(panel);

    function socialIcons(target, big) {
      SOCIALS.forEach(function (sx) {
        var a = document.createElement('a');
        a.className = 'fjt-soc fjt-soc-' + sx.id + (big ? ' fjt-soc-lg' : '');
        a.href = sx.url;
        if (sx.id !== 'email') { a.target = '_blank'; a.rel = 'noopener'; }
        a.setAttribute('aria-label', sx.label);
        a.title = sx.label;
        a.innerHTML = sx.svg || ICON_WA;
        target.appendChild(a);
      });
    }
    socialIcons(panel.querySelector('.fjt-social-icons'), false);

    var log = panel.querySelector('.fjt-log');
    var chips = panel.querySelector('.fjt-chips');
    var form = panel.querySelector('.fjt-form');
    var input = panel.querySelector('.fjt-input');
    var send = panel.querySelector('.fjt-send');
    var history = load();
    var busy = false;

    function scroll() { log.scrollTop = log.scrollHeight; }

    function bubble(role, text) {
      var row = el('div', 'fjt-row fjt-' + role);
      if (role === 'model') row.appendChild(el('span', 'fjt-avatar', '<img src="' + LOGO + '" alt="">'));
      var b = el('div', 'fjt-bubble');
      richText(b, text);
      row.appendChild(b);
      log.appendChild(row);
      scroll();
      return b;
    }

    function waButton(label, url) {
      var a = document.createElement('a');
      a.className = 'fjt-wa-cta';
      a.href = url || waLink();
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML = ICON_WA;
      a.appendChild(document.createTextNode(' ' + (label || 'Continue on WhatsApp')));
      return a;
    }

    function actionRow(node) {
      var row = el('div', 'fjt-row fjt-model fjt-action');
      row.appendChild(el('span', 'fjt-avatar fjt-avatar-ghost'));
      row.appendChild(node);
      log.appendChild(row);
      scroll();
    }

    function fallbackCard(intro) {
      var card = el('div', 'fjt-card');
      var p = el('p');
      p.textContent = intro || "I'm briefly unavailable, but our safari specialists are ready to help you directly:";
      card.appendChild(p);
      card.appendChild(waButton('Chat on WhatsApp', waLink("Hello Filmax Jambo Tours, I'd like help planning a safari.")));
      var links = el('div', 'fjt-card-links');
      var mail = document.createElement('a');
      mail.href = 'mailto:' + contact.email + '?subject=' + encodeURIComponent('Safari enquiry');
      mail.textContent = contact.email;
      var tel = document.createElement('a');
      tel.href = 'tel:' + String(contact.phone).replace(/[^\d+]/g, '');
      tel.textContent = 'Call ' + contact.phone;
      links.appendChild(mail);
      links.appendChild(tel);
      card.appendChild(links);
      actionRow(card);
    }

    function socialCard() {
      var card = el('div', 'fjt-card fjt-social-card');
      var p = el('p');
      p.textContent = 'Follow our journeys — daily wildlife, behind-the-scenes and guest moments:';
      card.appendChild(p);
      var row = el('div', 'fjt-social-row');
      socialIcons(row, true);
      card.appendChild(row);
      var all = document.createElement('a');
      all.className = 'fjt-social-all';
      all.href = LINKTREE;
      all.target = '_blank';
      all.rel = 'noopener';
      all.textContent = 'All our links →';
      card.appendChild(all);
      actionRow(card);
    }

    function typing() {
      var row = el('div', 'fjt-row fjt-model fjt-typing');
      row.appendChild(el('span', 'fjt-avatar', '<img src="' + LOGO + '" alt="">'));
      row.appendChild(el('div', 'fjt-bubble', '<span></span><span></span><span></span>'));
      log.appendChild(row);
      scroll();
      return row;
    }

    function renderChips() {
      chips.innerHTML = '';
      if (history.length) { chips.hidden = true; return; }
      chips.hidden = false;
      CHIPS.forEach(function (c) {
        var b = el('button', 'fjt-chip');
        b.type = 'button';
        b.textContent = c.label;
        b.onclick = function () { ask(c.text); };
        chips.appendChild(b);
      });
      var wa = el('button', 'fjt-chip fjt-chip-wa', ICON_WA);
      wa.type = 'button';
      wa.appendChild(document.createTextNode(' WhatsApp us'));
      wa.onclick = function () { openWhatsApp(); };
      chips.appendChild(wa);
    }

    function greet() {
      log.innerHTML = '';
      bubble('model', "Jambo, and welcome to Filmax Jambo Tours. I'm your private concierge — ask me about journeys, parks, seasons or prices, and I'll help shape your Kenya safari.");
      history.forEach(function (t) { bubble(t.role, t.text); });
      renderChips();
    }

    // ── Phones: freeze the page behind the chat and fit the chat above the keyboard ──
    var isPhone = function () { return window.matchMedia('(max-width: 600px)').matches; };
    var lockedY = null;
    function lockPage() {
      if (lockedY !== null || !isPhone()) return;
      lockedY = window.scrollY;
      var b = document.body.style;
      b.position = 'fixed'; b.top = (-lockedY) + 'px'; b.left = '0'; b.right = '0'; b.width = '100%'; b.overflow = 'hidden';
    }
    function unlockPage() {
      if (lockedY === null) return;
      var y = lockedY; lockedY = null;
      var b = document.body.style;
      b.position = ''; b.top = ''; b.left = ''; b.right = ''; b.width = ''; b.overflow = '';
      var html = document.documentElement, prev = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
      html.style.scrollBehavior = prev;
    }
    function fitToViewport() {
      var vv = window.visualViewport;
      if (!vv || !panel.classList.contains('open') || !isPhone()) {
        panel.style.top = ''; panel.style.bottom = ''; panel.style.height = '';
        return;
      }
      var keyboardUp = window.innerHeight - vv.height > 120;
      if (keyboardUp) {
        // occupy the visible area above the keyboard
        panel.style.top = Math.round(vv.offsetTop + 8) + 'px';
        panel.style.bottom = 'auto';
        panel.style.height = Math.round(vv.height - 16) + 'px';
      } else {
        panel.style.top = ''; panel.style.bottom = ''; panel.style.height = '';
      }
      scroll();
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fitToViewport);
      window.visualViewport.addEventListener('scroll', fitToViewport);
    }
    input.addEventListener('blur', function () {
      // keyboard closing: put the page back exactly where it was (iOS nudges it)
      setTimeout(function () {
        fitToViewport();
        if (lockedY !== null) { document.body.style.top = (-lockedY) + 'px'; window.scrollTo(0, 0); }
      }, 60);
    });

    function setOpen(open) {
      panel.classList.toggle('open', open);
      changeListeners.forEach(function (cb) { try { cb(open); } catch (e) {} });
      if (open) {
        lockPage();
        fitToViewport();
        if (!log.children.length) greet();
        if (!isPhone()) setTimeout(function () { input.focus(); }, 150); // no surprise keyboard on phones
      } else {
        input.blur();
        unlockPage();
        fitToViewport();
      }
    }

    function ask(message) {
      message = String(message || '').trim();
      if (!message || busy) return;

      // Explicit WhatsApp request: open it now, inside the click/submit gesture so it isn't blocked.
      if (WA_REQUEST.test(message)) openWhatsApp('Hello Filmax Jambo Tours, ' + message);

      chips.hidden = true;
      bubble('user', message);
      input.value = '';
      busy = true;
      send.disabled = true;
      var dots = typing();

      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 45000);

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPA_KEY, 'apikey': SUPA_KEY },
        body: JSON.stringify({ message: message, history: history }),
        signal: ctrl ? ctrl.signal : undefined
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, status: r.status, data: d }; }); })
        .then(function (res) {
          dots.remove();
          var d = res.data || {};
          if (d.contact) {
            if (d.contact.whatsapp) contact.whatsapp = d.contact.whatsapp;
            if (d.contact.phone) contact.phone = d.contact.phone;
          }
          if (res.ok && d.reply) {
            bubble('model', d.reply);
            history.push({ role: 'user', text: message }, { role: 'model', text: d.reply });
            save(history);
            (d.actions || []).forEach(function (a) {
              if (a.type === 'whatsapp') actionRow(waButton(a.label, a.url));
              if (a.type === 'socials') socialCard();
            });
            return;
          }
          if (res.status === 429 || d.error === 'busy' || d.error === 'rate_limited') {
            fallbackCard("Our concierge is attending to many travellers right now. Please try again in a moment, or reach our team directly:");
          } else {
            fallbackCard();
          }
        })
        .catch(function () {
          dots.remove();
          fallbackCard("I couldn't connect just now. Our safari specialists can help you directly:");
        })
        .then(function () {
          clearTimeout(timer);
          busy = false;
          send.disabled = false;
          input.focus();
        });
    }

    // Wheel/touch over the panel's fixed parts (header, chips, input) must not scroll the page;
    // over the conversation it scrolls the conversation only.
    function trapScroll(e) {
      if (!panel.classList.contains('open')) return;
      var inLog = log.contains(e.target);
      if (!inLog) { e.preventDefault(); return; }
      if (e.type === 'wheel') {
        var atTop = log.scrollTop <= 0, atEnd = log.scrollTop + log.clientHeight >= log.scrollHeight - 1;
        if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atEnd)) e.preventDefault();
      }
    }
    panel.addEventListener('wheel', trapScroll, { passive: false });
    panel.addEventListener('touchmove', trapScroll, { passive: false });

    window.FJTChat = {
      open: function () { setOpen(true); },
      close: function () { setOpen(false); },
      toggle: function () { setOpen(!panel.classList.contains('open')); },
      isOpen: function () { return panel.classList.contains('open'); },
      onChange: function (cb) { changeListeners.push(cb); }
    };
    panel.querySelector('.fjt-close').addEventListener('click', function () {
      setOpen(false);
      var b = document.querySelector('.fjt-dk-chat');
      if (b) b.focus();
    });
    panel.querySelector('.fjt-wa-btn').addEventListener('click', function () { openWhatsApp(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) setOpen(false); });
    form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });

    // Pick up the admin's live contact settings (same source the rest of the site uses).
    fetch(SUPA_URL + '/rest/v1/site_settings?select=id,value', { headers: { apikey: SUPA_KEY, Authorization: 'Bearer ' + SUPA_KEY } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        (rows || []).forEach(function (row) {
          var v = row.value || {};
          if (row.id === 'concierge') {
            if (v.whatsapp) contact.whatsapp = String(v.whatsapp).replace(/\D/g, '') || contact.whatsapp;
          }
          if (row.id === 'business' && v.phone) contact.phone = v.phone;
        });
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
