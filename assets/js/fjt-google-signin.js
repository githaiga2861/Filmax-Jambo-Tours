/* ═══════════════════════════════════════════════════════════════
   FJT GOOGLE SIGN-IN — Google Identity Services (GIS)
   Replaces the redirect-based "Continue with Google" so Google's window
   says "Sign in to filmaxjambotours.com" with the Filmax Jambo Tours name,
   instead of "<project-id>.supabase.co".

   Turn it on by putting the Web Client ID (the same one configured in
   Supabase → Authentication → Providers → Google) in GOOGLE_CLIENT_ID.
   While it's empty, the old redirect button keeps working unchanged.

   Google Cloud → Credentials → that OAuth client → Authorized JavaScript
   origins must include https://filmaxjambotours.com
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var GOOGLE_CLIENT_ID = '839673401261-rfeth1ekn1as5u927l9lva4il2b831bv.apps.googleusercontent.com'; // e.g. '1234567890-abc123.apps.googleusercontent.com'

  if (!GOOGLE_CLIENT_ID || window.__fjtGsi) return;
  window.__fjtGsi = true;

  var SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
  var SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
  var rawNonce = '';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) return resolve();
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  function waitFor(test, ms) {
    return new Promise(function (resolve) {
      var t0 = Date.now();
      (function poll() {
        if (test()) return resolve(true);
        if (Date.now() - t0 > ms) return resolve(false);
        setTimeout(poll, 100);
      })();
    });
  }
  async function sha256Hex(str) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  function randomNonce() {
    var a = new Uint8Array(24);
    crypto.getRandomValues(a);
    return Array.from(a).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  function message(text, isErr) {
    var el = document.getElementById(isErr ? 'authMsgErrorSignin' : 'authMsgSuccessSignin');
    if (!el) return;
    el.textContent = text;
    el.style.display = 'block';
  }

  async function onCredential(resp) {
    try {
      if (!window.supabase) await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      var client = window.supabase.createClient(SUPA_URL, SUPA_KEY);
      var res = await client.auth.signInWithIdToken({ provider: 'google', token: resp.credential, nonce: rawNonce });
      if (res.error) throw res.error;
      message('Signed in — welcome to Filmax Jambo Tours.');
      // Reload so every part of the page picks up the new session.
      setTimeout(function () { location.reload(); }, 700);
    } catch (e) {
      message((e && e.message) || 'Google sign-in failed. Please try again.', true);
    }
  }

  function renderInto(btn) {
    if (btn.dataset.gsiDone) return;
    btn.dataset.gsiDone = '1';
    var slot = document.createElement('div');
    slot.className = 'fjt-gsi-slot';
    slot.style.cssText = 'display:flex;justify-content:center;width:100%;min-height:44px;';
    btn.parentNode.insertBefore(slot, btn);
    var width = Math.min(400, Math.max(240, Math.round(btn.getBoundingClientRect().width || 320)));
    google.accounts.id.renderButton(slot, {
      type: 'standard', theme: 'filled_black', size: 'large', text: 'continue_with',
      shape: 'rectangular', logo_alignment: 'center', width: width
    });
    btn.style.display = 'none'; // keep the old button in the DOM as a fallback
  }

  async function init() {
    try {
      await loadScript('https://accounts.google.com/gsi/client');
      if (!(await waitFor(function () { return window.google && google.accounts && google.accounts.id; }, 8000))) return;
      rawNonce = randomNonce();
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: onCredential,
        nonce: await sha256Hex(rawNonce),
        ux_mode: 'popup',
        use_fedcm_for_prompt: true,
        context: 'signin',
        itp_support: true
      });
      var swap = function () {
        document.querySelectorAll('[onclick*="_doGoogleAuth"]').forEach(function (b) {
          if (b.offsetParent !== null || b.closest('#authOverlay')) renderInto(b);
        });
      };
      swap();
      // The modal is injected/opened later on some pages — watch for it.
      new MutationObserver(swap).observe(document.body, { childList: true, subtree: true });
    } catch (e) { /* GIS unavailable: the original redirect button stays */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
