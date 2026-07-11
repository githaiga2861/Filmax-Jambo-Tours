/* ═══════════════════════════════════════════════════════════════
   FJT SHARED AUTH MODULE — sign in / sign up modal
   Injects the auth modal HTML into the page, then wires all auth logic.
   Include this file (plus fjt-auth.css) on any page that needs sign-in.
   ═══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';
  var authHTML = `<!-- AUTH MODAL — REDESIGNED -->


<div id="authOverlay" style="display:none;opacity:0;pointer-events:none;">
  <div id="authModal">
    <div class="auth-modal-gold-line"></div>
    <button id="authModalClose">Close</button>

    <div class="auth-modal-inner">
      <span class="auth-modal-eyebrow">Filmax Jambo Tours</span>
      <h2 class="auth-modal-title" id="authModalTitle">Welcome<br><em>Back</em></h2>
      <p class="auth-modal-sub" id="authModalSub">Sign in to your account or create one to unlock your safari journey.</p>

      <div class="auth-tabs-row">
       <button class="auth-tab-btn active" id="tabSignin" onclick="window._switchAuthTab('signin')">Sign In</button>
        <button class="auth-tab-btn" id="tabSignup" onclick="window._switchAuthTab('signup')">Create Account</button>
      </div>

      <!-- Messages now appear inline above each panel's button -->

      <!-- SIGN IN PANEL -->
      <div id="authPanelSignin">
        <span class="auth-section-label">Your Credentials</span>
        <input id="siEmail" class="auth-input" type="email" placeholder="Email Address *" autocomplete="email"
          onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor=''">
        <div style="position:relative;">
          <input id="siPassword" class="auth-input" type="password" placeholder="Password *" autocomplete="current-password"
            style="padding-right:36px;"
            onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor=''">
          <button type="button" onclick="(function(){var f=document.getElementById('siPassword');f.type=f.type==='password'?'text':'password';this.textContent=f.type==='password'?'👁':'🙈';}).call(this)"
            style="position:absolute;right:0;top:14px;background:none;border:none;cursor:none;color:rgba(138,128,116,0.6);font-size:14px;padding:0;line-height:1;transition:color 0.2s;"
            onmouseover="this.style.color='#d4af37'" onmouseout="this.style.color='rgba(138,128,116,0.6)'">👁</button>
        </div>
        <div style="text-align:right;margin-bottom:8px;">
          <button id="forgotPwBtn" onclick="window._showForgotPassword()" style="background:none;border:none;font-family:'Jost',sans-serif;font-size:10px;letter-spacing:2px;color:rgba(212,175,55,0.6);cursor:none;padding:4px 0;transition:color 0.3s;" onmouseover="this.style.color='#d4af37'" onmouseout="this.style.color='rgba(212,175,55,0.6)'">Forgot Password?</button>
        </div>
        <div id="authMsgErrorSignin" class="auth-msg error"></div>
        <div id="authMsgSuccessSignin" class="auth-msg success"></div>
        <button class="auth-submit-btn" id="siSubmitBtn" onclick="window._doSignIn()">
          Sign In to Your Account
        </button>

        <div style="display:flex;align-items:center;gap:12px;margin:20px 0 4px;">
          <div style="flex:1;height:1px;background:rgba(212,175,55,0.15);"></div>
          <span style="font-family:'Jost',sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(138,128,116,0.5);">or</span>
          <div style="flex:1;height:1px;background:rgba(212,175,55,0.15);"></div>
        </div>

        <button onclick="window._doGoogleAuth()" style="width:100%;display:flex;align-items:center;justify-content:center;gap:12px;padding:13px 20px;background:transparent;border:1px solid rgba(212,175,55,0.25);color:var(--text);font-family:'Jost',sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;cursor:none;transition:border-color 0.3s,background 0.3s;margin-bottom:4px;" onmouseover="this.style.borderColor='rgba(212,175,55,0.6)';this.style.background='rgba(212,175,55,0.05)';" onmouseout="this.style.borderColor='rgba(212,175,55,0.25)';this.style.background='transparent';">
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
          Continue with Google
        </button>

        <p class="auth-alt-link" style="margin-top:16px;">No account? <button onclick="window._switchAuthTab('signup')">Create one free</button></p>
      </div>

      <!-- FORGOT PASSWORD PANEL -->
      <div id="authPanelForgot" style="display:none;">
        <span class="auth-section-label">Reset Your Password</span>
        <p style="font-family:'Cormorant Garamond',serif;font-size:15px;font-style:italic;color:var(--muted);margin-bottom:24px;line-height:1.7;">Enter the email address on your account and we will send you a secure reset link.</p>
        <input id="forgotEmail" class="auth-input" type="email" placeholder="Your Email Address *" autocomplete="email"
          onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor=''">
        <div id="authMsgErrorForgot" class="auth-msg error"></div>
        <div id="authMsgSuccessForgot" class="auth-msg success"></div>
        <button class="auth-submit-btn" id="forgotSubmitBtn" onclick="window._doForgotPassword()" style="margin-top:16px;">
          Send Reset Link
        </button>
        <p class="auth-alt-link" style="margin-top:16px;"><button onclick="window._switchAuthTab('signin')">← Back to Sign In</button></p>
      </div>

      <!-- SIGN UP PANEL -->
      <div id="authPanelSignup" style="display:none;">

        <span class="auth-section-label">Your Details</span>

        <input id="suFirstName" class="auth-input" type="text" placeholder="First Name *" autocomplete="given-name"
          onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor=''">

        <input id="suEmail" class="auth-input" type="email" placeholder="Email Address *" autocomplete="email"
          onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor=''">

        <div style="display:flex;gap:0;align-items:flex-end;margin-bottom:0;">
          <div class="auth-select-wrap" style="flex:0 0 110px;margin-bottom:0;">
            <select id="suPhoneCode" class="auth-input auth-select" style="padding-right:24px;font-size:12px;">
              <option value="+254">🇰🇪 +254</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+33">🇫🇷 +33</option>
              <option value="+49">🇩🇪 +49</option>
              <option value="+34">🇪🇸 +34</option>
              <option value="+39">🇮🇹 +39</option>
              <option value="+31">🇳🇱 +31</option>
              <option value="+32">🇧🇪 +32</option>
              <option value="+41">🇨🇭 +41</option>
              <option value="+43">🇦🇹 +43</option>
              <option value="+46">🇸🇪 +46</option>
              <option value="+47">🇳🇴 +47</option>
              <option value="+45">🇩🇰 +45</option>
              <option value="+358">🇫🇮 +358</option>
              <option value="+48">🇵🇱 +48</option>
              <option value="+7">🇷🇺 +7</option>
              <option value="+380">🇺🇦 +380</option>
              <option value="+351">🇵🇹 +351</option>
              <option value="+30">🇬🇷 +30</option>
              <option value="+90">🇹🇷 +90</option>
              <option value="+971">🇦🇪 +971</option>
              <option value="+966">🇸🇦 +966</option>
              <option value="+974">🇶🇦 +974</option>
              <option value="+965">🇰🇼 +965</option>
              <option value="+968">🇴🇲 +968</option>
              <option value="+962">🇯🇴 +962</option>
              <option value="+961">🇱🇧 +961</option>
              <option value="+20">🇪🇬 +20</option>
              <option value="+212">🇲🇦 +212</option>
              <option value="+213">🇩🇿 +213</option>
              <option value="+216">🇹🇳 +216</option>
              <option value="+218">🇱🇾 +218</option>
              <option value="+251">🇪🇹 +251</option>
              <option value="+255">🇹🇿 +255</option>
              <option value="+256">🇺🇬 +256</option>
              <option value="+250">🇷🇼 +250</option>
              <option value="+257">🇧🇮 +257</option>
              <option value="+253">🇩🇯 +253</option>
              <option value="+252">🇸🇴 +252</option>
              <option value="+249">🇸🇩 +249</option>
              <option value="+263">🇿🇼 +263</option>
              <option value="+260">🇿🇲 +260</option>
              <option value="+27">🇿🇦 +27</option>
              <option value="+264">🇳🇦 +264</option>
              <option value="+267">🇧🇼 +267</option>
              <option value="+265">🇲🇼 +265</option>
              <option value="+258">🇲🇿 +258</option>
              <option value="+261">🇲🇬 +261</option>
              <option value="+233">🇬🇭 +233</option>
              <option value="+234">🇳🇬 +234</option>
              <option value="+225">🇨🇮 +225</option>
              <option value="+221">🇸🇳 +221</option>
              <option value="+237">🇨🇲 +237</option>
              <option value="+243">🇨🇩 +243</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+92">🇵🇰 +92</option>
              <option value="+880">🇧🇩 +880</option>
              <option value="+94">🇱🇰 +94</option>
              <option value="+977">🇳🇵 +977</option>
              <option value="+86">🇨🇳 +86</option>
              <option value="+81">🇯🇵 +81</option>
              <option value="+82">🇰🇷 +82</option>
              <option value="+65">🇸🇬 +65</option>
              <option value="+60">🇲🇾 +60</option>
              <option value="+66">🇹🇭 +66</option>
              <option value="+62">🇮🇩 +62</option>
              <option value="+63">🇵🇭 +63</option>
              <option value="+84">🇻🇳 +84</option>
              <option value="+61">🇦🇺 +61</option>
              <option value="+64">🇳🇿 +64</option>
              <option value="+55">🇧🇷 +55</option>
              <option value="+54">🇦🇷 +54</option>
              <option value="+56">🇨🇱 +56</option>
              <option value="+57">🇨🇴 +57</option>
              <option value="+52">🇲🇽 +52</option>
              <option value="+1-CA">🇨🇦 +1</option>
            </select>
          </div>
          <input id="suPhone" class="auth-input" type="tel" placeholder="Phone / WhatsApp Number *" autocomplete="tel" style="flex:1;margin-left:8px;"
            onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor=''">
        </div>

        <input id="suNationality" class="auth-input" type="text" placeholder="Country of Residence *" autocomplete="country-name"
          onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor=''">

        <span class="auth-section-label" style="margin-top:28px;">Security</span>

        <div style="position:relative;">
          <input id="suPassword" class="auth-input" type="password" placeholder="Create Password (min 8 characters) *" autocomplete="new-password"
            style="padding-right:36px;"
            onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor=''">
          <button type="button" onclick="(function(){var f=document.getElementById('suPassword');f.type=f.type==='password'?'text':'password';this.textContent=f.type==='password'?'👁':'🙈';}).call(this)"
            style="position:absolute;right:0;top:14px;background:none;border:none;cursor:none;color:rgba(138,128,116,0.6);font-size:14px;padding:0;line-height:1;transition:color 0.2s;"
            onmouseover="this.style.color='#d4af37'" onmouseout="this.style.color='rgba(138,128,116,0.6)'">👁</button>
        </div>

        <div style="position:relative;">
          <input id="suPassConf" class="auth-input" type="password" placeholder="Confirm Password *" autocomplete="new-password"
            style="padding-right:36px;"
            onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor=''">
          <button type="button" onclick="(function(){var f=document.getElementById('suPassConf');f.type=f.type==='password'?'text':'password';this.textContent=f.type==='password'?'👁':'🙈';}).call(this)"
            style="position:absolute;right:0;top:14px;background:none;border:none;cursor:none;color:rgba(138,128,116,0.6);font-size:14px;padding:0;line-height:1;transition:color 0.2s;"
            onmouseover="this.style.color='#d4af37'" onmouseout="this.style.color='rgba(138,128,116,0.6)'">👁</button>
        </div>

        <div id="authMsgErrorSignup" class="auth-msg error" style="margin-top:12px;"></div>
        <div id="authMsgSuccessSignup" class="auth-msg success" style="margin-top:12px;"></div>

        <button class="auth-submit-btn" id="suSubmitBtn" onclick="window._doSignUp()" style="margin-top:20px;">
          Create My Safari Account
        </button>

        <div style="display:flex;align-items:center;gap:12px;margin:20px 0 4px;">
          <div style="flex:1;height:1px;background:rgba(212,175,55,0.15);"></div>
          <span style="font-family:'Jost',sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(138,128,116,0.5);">or</span>
          <div style="flex:1;height:1px;background:rgba(212,175,55,0.15);"></div>
        </div>

        <button onclick="window._doGoogleAuth()" style="width:100%;display:flex;align-items:center;justify-content:center;gap:12px;padding:13px 20px;background:transparent;border:1px solid rgba(212,175,55,0.25);color:var(--text);font-family:'Jost',sans-serif;font-size:11px;font-weight:600;letter-spacing:2px;cursor:none;transition:border-color 0.3s,background 0.3s;margin-bottom:4px;" onmouseover="this.style.borderColor='rgba(212,175,55,0.6)';this.style.background='rgba(212,175,55,0.05)';" onmouseout="this.style.borderColor='rgba(212,175,55,0.25)';this.style.background='transparent';">
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
          Sign up with Google
        </button>

        <p class="auth-alt-link" style="margin-top:16px;">Already have an account? <button onclick="window._switchAuthTab('signin')">Sign in here</button></p>
      </div>
    </div>
  </div>
</div>
`;
  document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('authOverlay')) {
      document.body.insertAdjacentHTML('beforeend', authHTML);
    }
  });
})();

(function() {
  'use strict';

  const SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';

  var _supaInstance = null;
  function getSupabase() {
    if (_supaInstance) return _supaInstance;
    if (!window.supabase) return null;
    _supaInstance = window.supabase.createClient(SUPA_URL, SUPA_KEY);
    return _supaInstance;
  }

  function v(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }

  function showMsg(type, text) {
    const err = document.getElementById('authMsgError');
    const ok  = document.getElementById('authMsgSuccess');
    if (!err || !ok) return;
    err.style.display = 'none'; ok.style.display = 'none';
    if (type === 'error')   { err.textContent = text; err.style.display = 'block'; }
    if (type === 'success') { ok.textContent  = text; ok.style.display  = 'block'; }
  }

  function clearMessages() {
  [
    'authMsgError',
    'authMsgSuccess',
    'authMsgErrorSignin',
    'authMsgSuccessSignin',
    'authMsgErrorSignup',
    'authMsgSuccessSignup',
    'authMsgErrorForgot',
    'authMsgSuccessForgot'
  ].forEach(function(id){
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

  window._openAuth = function(tab) {
    const ov = document.getElementById('authOverlay');
    if (!ov) return;
    // Hide FABs
    [document.querySelector('.whatsapp-fab'),document.getElementById('themeToggle'),document.getElementById('google_translate_element')].forEach(function(el){if(el){el.style.transition='opacity 0.3s ease';el.style.opacity='0';el.style.pointerEvents='none';}});
    ov.style.cssText = 'display:flex;opacity:0;pointer-events:none;position:fixed;inset:0;z-index:99990;background:rgba(8,6,2,0.45);backdrop-filter:blur(12px) saturate(1.4) brightness(0.7);-webkit-backdrop-filter:blur(12px) saturate(1.4) brightness(0.7);align-items:center;justify-content:center;padding:20px;transition:opacity 0.4s ease;';
    clearMessages();
    window._switchAuthTab(tab || 'signin');
    document.body.style.overflow = 'hidden';
    setTimeout(function() {
      ov.style.opacity = '1';
      ov.style.pointerEvents = 'all';
    }, 20);
  };

  window._closeAuth = function() {
    const ov = document.getElementById('authOverlay');
    if (!ov) return;
    ov.style.opacity = '0';
    ov.style.pointerEvents = 'none';
    ov.classList.remove('open');
    document.body.style.overflow = '';
    clearMessages();
    setTimeout(function() {
      ov.style.display = 'none';
      // Restore FABs
      [document.querySelector('.whatsapp-fab'),document.getElementById('themeToggle'),document.getElementById('google_translate_element')].forEach(function(el){if(el){el.style.opacity='1';el.style.pointerEvents='';}});
    }, 420);
  };


  window._switchAuthTab = function(tab) {
    const si  = document.getElementById('authPanelSignin');
    const su  = document.getElementById('authPanelSignup');
    const tsi = document.getElementById('tabSignin');
    const tsu = document.getElementById('tabSignup');
    const title = document.getElementById('authModalTitle');
    const sub   = document.getElementById('authModalSub');
    clearMessages();
    var fg = document.getElementById('authPanelForgot');
    if (fg) fg.style.display = 'none';
    if (tab === 'signup') {
      if (si) si.style.display = 'none';
      if (su) su.style.display = 'block';
      if (tsi) { tsi.classList.remove('active'); tsi.style.color=''; tsi.style.borderBottomColor='transparent'; }
      if (tsu) { tsu.classList.add('active');    tsu.style.color='#d4af37'; tsu.style.borderBottomColor='#d4af37'; }
      if (title) title.innerHTML = 'Join the<br><em>Journey</em>';
      if (sub)   sub.textContent = 'Create your free account to unlock the full safari experience.';
    } else {
      if (si) si.style.display = 'block';
      if (su) su.style.display = 'none';
      if (tsu) { tsu.classList.remove('active'); tsu.style.color=''; tsu.style.borderBottomColor='transparent'; }
      if (tsi) { tsi.classList.add('active');    tsi.style.color='#d4af37'; tsi.style.borderBottomColor='#d4af37'; }
      if (title) title.innerHTML = 'Welcome<br><em>Back</em>';
      if (sub)   sub.textContent = 'Sign in to access your safari journey and saved preferences.';
    }
  };

  window._doSignIn = async function() {
    const supa = getSupabase();
    if (!supa) { showMsg('error','Auth service unavailable. Please refresh.'); return; }
    const email = v('siEmail');
    const pass  = v('siPassword');
    if (!email) { showMsg('error','Please enter your email address.'); return; }
    if (!pass)  { showMsg('error','Please enter your password.'); return; }
    const btn = document.getElementById('siSubmitBtn');
    if (btn) { btn.textContent = 'Signing in…'; btn.disabled = true; }
    try {
      window._fjSigningInViaForm = true;
    const { data, error } = await supa.auth.signInWithPassword({ email, password: pass });
    setTimeout(function(){ window._fjSigningInViaForm = false; }, 200);
      if (error) {
        // Distinguish "invalid credentials" from "user not found"
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('invalid') || msg.includes('wrong') || msg.includes('credentials') || msg.includes('not found') || msg.includes('no user')) {
          showMsgSignin('error', '❌ No account found with this email. Please create an account first.');
          setTimeout(function(){ window._switchAuthTab('signup'); const el=document.getElementById('suEmail'); if(el){el.value=email;} }, 1800);
        } else {
          showMsgSignin('error', error.message || 'Sign in failed. Please try again.');
        }
        if (btn) { btn.textContent = 'Sign In to Your Account'; btn.disabled = false; }
        return;
      }
      // Success — show joy message, auto-close
      // Fetch real first name from profiles table for welcome message
      const _welcomeSupa = window.supabase
        ? window.supabase.createClient(
            'https://kwriicxzkgkcseorcqdi.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo'
          )
        : null;
      let _welcomeName = data.user?.user_metadata?.first_name || 'Explorer';
      if (_welcomeSupa && data.user?.id) {
        _welcomeSupa.from('profiles').select('first_name').eq('id', data.user.id).single()
          .then(({ data: pd }) => {
            if (pd?.first_name) _welcomeName = pd.first_name;
            showMsgSignin('success', '✓ Welcome back, ' + _welcomeName + '! You are now signed in.');
          })
          .catch(() => {
            showMsgSignin('success', '✓ Welcome back, ' + _welcomeName + '! You are now signed in.');
          });
      } else {
        showMsgSignin('success', '✓ Welcome back, ' + _welcomeName + '! You are now signed in.');
      }
      updateNavForUser(data.user);
      setTimeout(function(){
        window._closeAuth();
        // Brief in-page toast
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:99999;background:linear-gradient(135deg,#d4af37,#b8860b);color:#080808;font-family:Jost,sans-serif;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;padding:18px 40px;box-shadow:0 8px 40px rgba(212,175,55,0.5);opacity:0;transition:opacity 0.4s ease;';
        toast.textContent = '✓ Signed in successfully';
        document.body.appendChild(toast);
        requestAnimationFrame(function(){ toast.style.opacity='1'; });
        setTimeout(function(){ toast.style.opacity='0'; setTimeout(function(){toast.remove();},400); },2400);
        // Open profile modal after auth modal finishes closing
        setTimeout(function(){ if(window._fjCurrentUser) window._openProfile(); }, 520);
      }, 1200);
    } catch(e) {
      showMsgSignin('error', e.message || 'Sign in failed. Please try again.');
    }
    if (btn) { btn.textContent = 'Sign In to Your Account'; btn.disabled = false; }
  };

  function showMsgSignin(type, text) {
    var err = document.getElementById('authMsgErrorSignin');
    var ok  = document.getElementById('authMsgSuccessSignin');
    if (err) err.style.display = 'none';
    if (ok)  ok.style.display  = 'none';
    if (type === 'error'   && err) { err.textContent = text; err.style.display = 'block'; }
    if (type === 'success' && ok)  { ok.textContent  = text; ok.style.display  = 'block'; }
  }
  function showMsgSignup(type, text) {
    var err = document.getElementById('authMsgErrorSignup');
    var ok  = document.getElementById('authMsgSuccessSignup');
    if (err) err.style.display = 'none';
    if (ok)  ok.style.display  = 'none';
    if (type === 'error'   && err) { err.textContent = text; err.style.display = 'block'; }
    if (type === 'success' && ok)  { ok.textContent  = text; ok.style.display  = 'block'; }
  }
  function showMsgForgot(type, text) {
    var err = document.getElementById('authMsgErrorForgot');
    var ok  = document.getElementById('authMsgSuccessForgot');
    if (err) err.style.display = 'none';
    if (ok)  ok.style.display  = 'none';
    if (type === 'error'   && err) { err.textContent = text; err.style.display = 'block'; }
    if (type === 'success' && ok)  { ok.textContent  = text; ok.style.display  = 'block'; }
  }
  function togglePassword(id, eye) {
  const input = document.getElementById(id);

  if (input.type === "password") {
    input.type = "text";
    eye.textContent = "🙈";
  } else {
    input.type = "password";
    eye.textContent = "👁";
  }
}

  window._showForgotPassword = function() {
    document.getElementById('authPanelSignin').style.display = 'none';
    document.getElementById('authPanelForgot').style.display = 'block';
    var title = document.getElementById('authModalTitle');
    var sub   = document.getElementById('authModalSub');
    if (title) title.innerHTML = 'Reset Your<br><em>Password</em>';
    if (sub)   sub.textContent = 'We will send a secure link to your inbox.';
    var siEmail = document.getElementById('siEmail');
    var fgEmail = document.getElementById('forgotEmail');
    if (siEmail && fgEmail && siEmail.value) fgEmail.value = siEmail.value;
  };

  window._doGoogleAuth = async function() {
    const supa = getSupabase();
    if (!supa) { showMsgSignin('error','Auth service unavailable. Please refresh.'); return; }
    try {
      const { error } = await supa.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://githaiga2861.github.io/Filmax-Jambo-Tours/index.html',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
      // Google redirects away — no further UI needed
    } catch(e) {
      showMsgSignin('error', e.message || 'Google sign-in failed. Please try again.');
    }
  };

  window._doForgotPassword = async function() {
    const supa = getSupabase();
    if (!supa) { showMsgForgot('error','Auth service unavailable.'); return; }
    const email = v('forgotEmail');
    if (!email) { showMsgForgot('error','Please enter your email address.'); return; }
    const btn = document.getElementById('forgotSubmitBtn');
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
    try {
      const { error } = await supa.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://filmaxjambotours.com/reset-password.html'
      });
      if (error) throw error;
      showMsgForgot('success', '✓ Reset link sent! Check your inbox (and spam folder). You can close this.');
    } catch(e) {
      showMsgForgot('error', JSON.stringify(e) + ' | ' + (e.message||'') + ' | status:' + (e.status||'') + ' | code:' + (e.code||''));
    }
    if (btn) { btn.textContent = 'Send Reset Link'; btn.disabled = false; }
  };

  window._doSignUp = async function() {
    const supa = getSupabase();
    if (!supa) { showMsgSignup('error','Auth service unavailable. Please refresh.'); return; }

    // Clear previous messages
    ['authMsgErrorSignup','authMsgSuccessSignup'].forEach(function(id){
      var el = document.getElementById(id); if(el) el.style.display='none';
    });
    const firstName   = v('suFirstName');
    const email       = v('suEmail');
    const phoneCode   = v('suPhoneCode') || '+254';
    const phoneRaw    = v('suPhone');
    const phone       = phoneCode + phoneRaw;
    const nationality = v('suNationality');
    const pass        = v('suPassword');
    const passConf    = v('suPassConf');
    const dob       = v('suDob');
    const gender    = v('suGender');
    const budget    = v('suBudget');
    const style     = v('suStyle');
    const interest  = v('suInterest');
    const duration  = v('suDuration');
    const travelDate = v('suTravelDate');
    const emergName = v('suEmergName');
    const emergPhone= v('suEmergPhone');

    // Validate required fields
    if (!firstName)   { showMsgSignup('error','⚠ First name is required.'); return; }
    if (!email)       { showMsgSignup('error','⚠ Email address is required.'); return; }
    if (!phoneRaw)    { showMsgSignup('error','⚠ Phone number is required.'); return; }
    if (!nationality) { showMsgSignup('error','⚠ Country of residence is required.'); return; }
    if (!pass)        { showMsgSignup('error','⚠ Please create a password.'); return; }
    if (pass.length < 8) { showMsgSignup('error','⚠ Password must be at least 8 characters.'); return; }
    if (pass !== passConf) { showMsgSignup('error','⚠ Passwords do not match.'); return; }
    const btn = document.getElementById('suSubmitBtn');
    if (btn) { btn.textContent = 'Creating account…'; btn.disabled = true; }
    try {
      const meta = {
        first_name:  firstName,
        full_name:   firstName,
        phone:       phone,
        nationality: nationality
      };
      // First check if account already exists by attempting a password reset
      // (Supabase signUp with existing email returns identities=[])
      const { data, error } = await supa.auth.signUp({
        email:    email,
        password: pass,
        options:  { data: meta }
      });
      if (error) {
        // Handle specific "User already registered" error
        if (error.message && (error.message.toLowerCase().includes('already') || error.message.toLowerCase().includes('registered'))) {
          showMsgSignup('error', '⚠ An account with this email already exists.');
          setTimeout(function(){
            window._switchAuthTab('signin');
            var siEmail = document.getElementById('siEmail');
            if (siEmail) siEmail.value = email;
            showMsgSignin('error', '⚠ Account already exists. Please sign in with your password.');
          }, 1400);
          return;
        }
        throw error;
      }
      if (data?.user?.identities?.length === 0) {
        // Supabase signals existing account this way
        showMsgSignup('error', '⚠ An account with this email already exists.');
        setTimeout(function(){
          window._switchAuthTab('signin');
          var siEmail = document.getElementById('siEmail');
          if (siEmail) siEmail.value = email;
          showMsgSignin('error', '⚠ Account found. Please sign in with your password.');
        }, 1400);
        return;
      } else {
        // Also write to profiles table if it exists
        if (data.user) {
          try {
            await supa.from('profiles').upsert({
              id:           data.user.id,
              email:        email,
              first_name:   firstName,
              last_name:    '',
              phone:        phone,
              nationality:  nationality,
              country:      nationality,
              dob:          '',
              passport:     '',
              preferred_lang: '',
              emerg_name:   '',
              emerg_phone:  '',
              avatar_url:   '',
              reward_points: 420,
              timezone:     Intl.DateTimeFormat().resolvedOptions().timeZone,
              created_at:   new Date().toISOString(),
              updated_at:   new Date().toISOString()
            }, { onConflict: 'id' });
          } catch(e) { console.warn('Profile insert error:', e); }
        }
        // If Supabase returned a session (no email confirmation required), sign in and open profile
        if (data.session) {
          updateNavForUser(data.user);
          showMsgSignup('success', '✓ Account created! Welcome to Filmax Jambo Tours.');
          setTimeout(function(){
            window._closeAuth();
            setTimeout(function(){ if(window._fjCurrentUser) window._openProfile(); }, 520);
          }, 1200);
        } else {
          // Email confirmation required — prompt user to confirm then sign in
          showMsgSignup('success', '✓ Account created! Check your email to confirm, then sign in.');
          setTimeout(function(){
            window._switchAuthTab('signin');
            var siEmail = document.getElementById('siEmail');
            if (siEmail) siEmail.value = email;
          }, 2200);
        }
      }
    } catch(e) {
  console.error(e);
  showMsgSignup('error', e.message || 'Registration failed. Please try again.');
}
    if (btn) { btn.textContent = 'Create My Safari Account'; btn.disabled = false; }
  };

  window.updateNavForUser = function updateNavForUser(user) {
    window._fjCurrentUser = user;
    const flipWrap       = document.getElementById('authFlipWrap');
    const navLabel       = document.getElementById('authNavLabel');
    const menuName       = document.getElementById('userMenuName');
    const locked         = document.getElementById('testimonialFormLocked');
    const openFrm        = document.getElementById('testimonialFormOpen');
    const dropSignup     = document.getElementById('dropdownSignupBtn');
    const dropUserHeader = document.getElementById('dropdownUserHeader');
    const dropUserName   = document.getElementById('dropdownUserName');
    const dropAuthBtn    = document.getElementById('dropdownAuthBtn');

    if (user) {
      if (flipWrap) flipWrap.classList.add('signed-in');
      if (locked)   locked.style.display  = 'none';
      if (openFrm)  openFrm.style.display = '';
      if (dropUserHeader) dropUserHeader.style.display = 'block';
      if (dropAuthBtn)    dropAuthBtn.style.display    = 'none';
      if (dropSignup)     dropSignup.style.display     = 'none';

      // Always fetch first name from profiles table — never use email as name
      const SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
      const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';

      function applyName(firstName) {
        // Never show email — always show real first name
        const display = firstName || 'Member';
        if (navLabel)    navLabel.textContent    = display;
        if (menuName)    menuName.textContent    = display;
        if (dropUserName) dropUserName.textContent = display;
        window._fjUserMeta = { ...(user.user_metadata || {}), first_name: firstName };
      }

      // Try profiles table first
      try {
        const supa = getSupabase();

        if (supa) {
          // Always fetch fresh from Supabase — never rely on cached browser state
          supa.from('profiles')
            .select('first_name, last_name, avatar_url')
            .eq('id', user.id)
            .single()
            .then(({ data, error }) => {
              if (!error && data && data.first_name) {
                applyName(data.first_name);
              } else {
                // Fallback: try user_metadata (Google OAuth populates this)
                const m = user.user_metadata || {};
                const metaFirst = m.first_name
                  || (m.full_name ? m.full_name.split(' ')[0] : '')
                  || (m.name      ? m.name.split(' ')[0]      : '')
                  || '';
                applyName(metaFirst);
              }
            })
            .catch(() => {
              const m = user.user_metadata || {};
              applyName(m.first_name || '');
            });
        } else {
          // Supabase not ready — use metadata
          const m = user.user_metadata || {};
          applyName(m.first_name || '');
        }
      } catch (_) {
        const m = user.user_metadata || {};
        applyName(m.first_name || '');
      }

    } else {
      // Signed out
      if (flipWrap)  flipWrap.classList.remove('signed-in');
      if (navLabel)  navLabel.textContent = 'My Account';
      if (dropUserHeader) dropUserHeader.style.display = 'none';
      if (dropAuthBtn)    dropAuthBtn.style.display    = '';
      if (dropSignup)     dropSignup.style.display     = '';
      if (locked)  locked.style.display  = '';
      if (openFrm) openFrm.style.display = 'none';
      window._fjUserMeta = null;
    }
  };

  // Init session on load
  document.addEventListener('DOMContentLoaded', function() {
    const supa = getSupabase();
    if (!supa) return;

    var _hadSessionOnLoad = false;
    supa.auth.getSession().then(function(res) {
      if (res.data?.session?.user) {
        _hadSessionOnLoad = true;
        updateNavForUser(res.data.session.user);
      }
    });

    supa.auth.onAuthStateChange(function(event, session) {
      updateNavForUser(session?.user || null);
      if (event === 'SIGNED_IN' && !_hadSessionOnLoad && session?.user && !window._fjSigningInViaForm) {
        _hadSessionOnLoad = true;
        var m = session.user.user_metadata || {};
        var name = m.first_name || (m.full_name ? m.full_name.split(' ')[0] : '') || (m.name ? m.name.split(' ')[0] : '') || 'Explorer';
        var isNew = session.user.created_at && (Date.now() - new Date(session.user.created_at).getTime()) < 10000;
        var toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:99999;background:linear-gradient(135deg,#d4af37,#b8860b);color:#080808;font-family:Jost,sans-serif;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;padding:18px 40px;box-shadow:0 8px 40px rgba(212,175,55,0.5);opacity:0;transition:opacity 0.4s ease;white-space:nowrap;';
        toast.textContent = isNew ? '✓ Welcome to Filmax Jambo Tours, ' + name + '!' : '✓ Welcome back, ' + name + '!';
        document.body.appendChild(toast);
        requestAnimationFrame(function(){ toast.style.opacity = '1'; });
        setTimeout(function(){ toast.style.opacity = '0'; setTimeout(function(){ toast.remove(); }, 400); }, 3500);
      }
      if (event === 'SIGNED_IN') _hadSessionOnLoad = true;
    });

    // Close modal on overlay click
    const ov = document.getElementById('authOverlay');
    if (ov) ov.addEventListener('click', function(e) { if (e.target === ov) window._closeAuth(); });

    // Close on X button
    const closeBtn = document.getElementById('authModalClose');
    if (closeBtn) closeBtn.addEventListener('click', window._closeAuth);

    // Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') window._closeAuth();
    });

    // Enter key submits sign in
    const siPass = document.getElementById('siPassword');
    if (siPass) siPass.addEventListener('keydown', function(e) { if (e.key === 'Enter') window._doSignIn(); });

    // Sign out — both menu and hamburger
    async function doSignOut() {
      document.getElementById('userMenu')?.classList.remove('open');
      document.getElementById('menuBtn')?.classList.remove('open');
      document.getElementById('dropdown')?.classList.remove('open');
      await supa.auth.signOut();
      updateNavForUser(null);
    }
    const signOutBtn = document.getElementById('userMenuSignOut');
    if (signOutBtn) signOutBtn.addEventListener('click', doSignOut);
    const dropLogout = document.getElementById('dropdownLogoutBtn');
    if (dropLogout) dropLogout.addEventListener('click', doSignOut);

    // User chip — opens profile.html modal overlay
    const chip = document.getElementById('authUserChip');
    if (chip) chip.addEventListener('click', function () {
      document.getElementById('userMenu')?.classList.remove('open');
      window._fjCurrentUser ? window._openProfile() : window._openAuth('signin');
    });

    // Close user menu on outside click
    document.addEventListener('click', function(e) {
      const menu = document.getElementById('userMenu');
      const chip = document.getElementById('authUserChip');
      const wrap = document.getElementById('authFlipWrap');
      if (menu && !menu.contains(e.target) && chip && !chip.contains(e.target) && wrap && !wrap.contains(e.target)) {
        menu.classList.remove('open');
      }
    });

    // ── CONTACT FORM SUBMIT ────────────────────────────
    document.getElementById('sendEnquiryBtn')?.addEventListener('click', async function() {
      const btn = this;
      const fields   = document.querySelectorAll('#contact .contact-form input, #contact .contact-form textarea');
      const nameVal  = fields[0]?.value.trim() || '';
      const emailVal = fields[1]?.value.trim() || '';
      const phoneVal = fields[2]?.value.trim() || '';
      const msgVal   = fields[3]?.value.trim() || '';
      const msgEl    = document.getElementById('enquiryMsg');

      function showEnquiryMsg(type, text) {
        if (!msgEl) return;
        msgEl.style.display = 'block';
        msgEl.textContent = text;
        msgEl.style.background = type === 'success' ? 'rgba(123,181,110,0.1)' : 'rgba(224,85,85,0.1)';
        msgEl.style.border = type === 'success' ? '1px solid rgba(123,181,110,0.35)' : '1px solid rgba(224,85,85,0.35)';
        msgEl.style.color  = type === 'success' ? '#7bb56e' : '#e07070';
      }

      if (!nameVal || !emailVal || !msgVal) {
        showEnquiryMsg('error', '⚠ Please fill in your name, email and message.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        showEnquiryMsg('error', '⚠ Please enter a valid email address.');
        return;
      }

      btn.textContent = 'Sending…';
      btn.style.opacity = '0.6';
      btn.style.pointerEvents = 'none';

      try {
        const supa = window.supabase ? window.supabase.createClient(
          'https://kwriicxzkgkcseorcqdi.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo'
        ) : null;

        if (!supa) throw new Error('Database unavailable');

        const payload = {
          name:       nameVal,
          email:      emailVal,
          phone:      phoneVal || null,
          message:    msgVal,
          status:     'new',
          user_id:    window._fjCurrentUser?.id || null,
          created_at: new Date().toISOString(),
          source:     'contact_form'
        };

        const { error } = await supa.from('enquiries').insert(payload);
        if (error) throw error;

        showEnquiryMsg('success', '✓ Enquiry sent! Your email app will open to confirm. We reply within 24 hours.');
        // Also open the user's email client pre-filled to our inbox
        var _subj = encodeURIComponent('Safari Enquiry — ' + nameVal);
        var _body = encodeURIComponent('Name: ' + nameVal + '\n' + 'Email: ' + emailVal + '\n' + 'Phone: ' + (phoneVal || '—') + '\n\n' + msgVal);
        window.location.href = 'mailto:hello@filmaxjambotours.com?subject=' + _subj + '&body=' + _body;
        fields.forEach(function(f){ f.value = ''; });

      } catch(e) {
        console.error('Enquiry error:', e);
        showEnquiryMsg('error', '⚠ Could not send enquiry. Please email us directly at hello@filmaxjambotours.co.ke');
      }

      btn.textContent = 'Send Enquiry';
      btn.style.opacity = '';
      btn.style.pointerEvents = '';
    });

    // Auto-fill contact form
    document.querySelector('#contact')?.addEventListener('focusin', function() {
      const user = window._fjCurrentUser;
      if (!user) return;
      const m = user.user_metadata || {};
      const nf = document.querySelector('#contact input[type="text"]');
      const ef = document.querySelector('#contact input[type="email"]');
      const pf = document.querySelector('#contact input[type="tel"]');
      if (nf && !nf.value) nf.value = ((m.first_name||'') + ' ' + (m.last_name||'')).trim();
      if (ef && !ef.value) ef.value = user.email || '';
      if (pf && !pf.value) pf.value = m.phone || '';
    });

    // Star rating with label
    let selectedStars = 0;
    const starLabels = ['','Poor','Fair','Good','Great','Exceptional'];
    document.querySelectorAll('.star-btn').forEach(function(star) {
      star.addEventListener('mouseenter', function() {
        const hov = parseInt(star.dataset.val);
        document.querySelectorAll('.star-btn').forEach(function(s, i) {
          s.style.opacity   = i < hov ? '1' : '0.22';
          s.style.transform = i < hov ? 'scale(1.12)' : 'scale(1)';
        });
        const lbl = document.getElementById('starLabel');
        if (lbl) lbl.textContent = starLabels[hov] || '';
      });
      star.addEventListener('mouseleave', function() {
        document.querySelectorAll('.star-btn').forEach(function(s, i) {
          s.style.opacity   = i < selectedStars ? '1' : '0.28';
          s.style.transform = 'scale(1)';
        });
        const lbl = document.getElementById('starLabel');
        if (lbl) lbl.textContent = selectedStars ? starLabels[selectedStars] : '';
      });
      star.addEventListener('click', function() {
        selectedStars = parseInt(star.dataset.val);
        document.querySelectorAll('.star-btn').forEach(function(s, i) {
          s.style.opacity   = i < selectedStars ? '1' : '0.28';
          s.style.transform = 'scale(1)';
        });
        const lbl = document.getElementById('starLabel');
        if (lbl) { lbl.textContent = starLabels[selectedStars]; lbl.style.color = '#d4af37'; }
      });
    });

    // Testimonial submit
    const tBtn = document.getElementById('testimonialSubmitBtn');
    if (tBtn) tBtn.addEventListener('click', async function() {
      if (!window._fjCurrentUser) { window._openAuth('signin'); return; }
      const text = (document.getElementById('testimonialText')?.value || '').trim();
      const msg  = document.getElementById('testimonialFormMsg');
      if (text.length < 20) {
        if (msg) { msg.style.cssText='display:block;background:rgba(224,85,85,0.1);border:1px solid rgba(224,85,85,0.3);color:#e05555;font-size:12px;padding:12px 16px;margin-bottom:12px;'; msg.textContent='Please write at least 20 characters.'; }
        return;
      }
      tBtn.textContent = 'Submitting…';
      const m = window._fjCurrentUser.user_metadata || {};
      try {
        await supa.from('testimonials_pending').insert({
          user_id: window._fjCurrentUser.id,
          author_name: ((m.first_name||'') + ' ' + (m.last_name||'')).trim(),
          author_loc: m.nationality || '',
          text, rating: selectedStars || 5, status: 'pending',
          created_at: new Date().toISOString()
        });
        if (msg) { msg.style.cssText='display:block;background:rgba(123,181,110,0.1);border:1px solid rgba(123,181,110,0.3);color:#7bb56e;font-size:12px;padding:12px 16px;margin-bottom:12px;'; msg.textContent='Thank you! Your review is pending approval.'; }
        document.getElementById('testimonialText').value = '';
        selectedStars = 0;
        document.querySelectorAll('.star-btn').forEach(function(s) { s.style.opacity='0.35'; s.style.color=''; });
      } catch(e) {
        if (msg) { msg.style.cssText='display:block;background:rgba(224,85,85,0.1);border:1px solid rgba(224,85,85,0.3);color:#e05555;font-size:12px;padding:12px 16px;margin-bottom:12px;'; msg.textContent='Submission failed. Please try again.'; }
      }
      tBtn.textContent = 'Submit for Review';
    });
  });

  // Legacy alias so any remaining fjAuth.open() calls still work
  window.fjAuth = {
    open: window._openAuth,
    close: window._closeAuth,
    switchTab: window._switchAuthTab,
    signIn: window._doSignIn,
    signUp: window._doSignUp
  };

})();

