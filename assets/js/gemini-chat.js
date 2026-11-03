/* Filmax Jambo Tours — Safari concierge chat widget
 * Talks to the gemini-chat Supabase Edge Function.
 * Include on any page: <script src="/assets/js/gemini-chat.js" defer></script>
 */
(function () {
  var SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
  var ENDPOINT = SUPA_URL + '/functions/v1/gemini-chat';


  function init() {
    if (!document.querySelector('link[href*="gemini-chat.css"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/assets/css/gemini-chat.css?v=20261103';
      document.head.appendChild(link);
    }

    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<button id="fjt-chat-btn" type="button">Ask our safari concierge</button>' +
      '<div id="fjt-chat" role="dialog" aria-label="Safari concierge chat">' +
        '<header><strong>Safari Concierge</strong><button type="button" id="fjt-close" aria-label="Close">×</button></header>' +
        '<div id="fjt-log" aria-live="polite"></div>' +
        '<form id="fjt-form"><input id="fjt-input" type="text" maxlength="1000" placeholder="Ask about safaris, parks, timing…" autocomplete="off" required><button type="submit" id="fjt-send">Send</button></form>' +
      '</div>';
    document.body.appendChild(wrap);

    var box = document.getElementById('fjt-chat');
    var log = document.getElementById('fjt-log');
    var form = document.getElementById('fjt-form');
    var input = document.getElementById('fjt-input');
    var sendBtn = document.getElementById('fjt-send');
    var history = [];

    function add(role, text) {
      var div = document.createElement('div');
      div.className = 'fjt-msg fjt-' + role;
      div.textContent = text; // never innerHTML for model/user text
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
      return div;
    }

    document.getElementById('fjt-chat-btn').onclick = function () {
      box.classList.toggle('open');
      if (!log.children.length) add('model', 'Jambo! 👋 How can I help you plan your Kenya safari?');
      input.focus();
    };
    document.getElementById('fjt-close').onclick = function () { box.classList.remove('open'); };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var message = input.value.trim();
      if (!message) return;
      add('user', message);
      input.value = '';
      sendBtn.disabled = true;
      var thinking = add('model', '…');

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPA_KEY },
        body: JSON.stringify({ message: message, history: history })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var reply = data.reply || data.error || 'Something went wrong.';
          thinking.textContent = reply;
          if (data.reply) history.push({ role: 'user', text: message }, { role: 'model', text: reply });
        })
        .catch(function () {
          thinking.textContent = 'Connection problem — please try again, or reach us on WhatsApp.';
        })
        .finally(function () { sendBtn.disabled = false; input.focus(); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
