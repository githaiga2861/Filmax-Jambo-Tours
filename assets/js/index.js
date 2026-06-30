
  const SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
  const supa = supabase.createClient(SUPA_URL, SUPA_KEY);

window._fjt_fresh=!sessionStorage.getItem('loaderSeen');

// ====================================================
// GLOBAL AUTH — defined first, before anything else
// ====================================================
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

        showEnquiryMsg('success', '✓ Enquiry sent! We\'ll be in touch within 24 hours.');
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
      { name:'Mara Awakening',             price:'$2,800',  duration:'4 Days', page:'pkg-mara-awakening.html',          tier:'mid',    vibe:['wildlife'],              durationKey:'short',  priceRaw:2800  },
      { name:'Grand Odyssey',              price:'$6,500',  duration:'7 Days', page:'pkg-grand-odyssey.html',           tier:'luxury', vibe:['wildlife','culture'],    durationKey:'medium', priceRaw:6500  },
      { name:'Ultimate Kenya',             price:'$11,200', duration:'10 Days',page:'pkg-ultimate-kenya.html',          tier:'luxury', vibe:['wildlife','adventure'],  durationKey:'long',   priceRaw:11200 },
      { name:'Amboseli Escape',            price:'$1,950',  duration:'3 Days', page:'pkg-amboseli-express.html',        tier:'budget', vibe:['wildlife'],              durationKey:'short',  priceRaw:1950  },
      { name:'Samburu Wilderness',         price:'$3,400',  duration:'5 Days', page:'pkg-samburu-secrets.html',         tier:'mid',    vibe:['wildlife','adventure'],  durationKey:'medium', priceRaw:3400  },
      { name:'Coastal Safari Blend',       price:'$4,200',  duration:'6 Days', page:'pkg-safari-and-sea.html',          tier:'mid',    vibe:['beach','wildlife'],      durationKey:'medium', priceRaw:4200  },
      { name:'Lakes & Highlands',          price:'$5,100',  duration:'8 Days', page:'pkg-lake-nakuru-escape.html',      tier:'mid',    vibe:['adventure','culture'],   durationKey:'long',   priceRaw:5100  },
      { name:'Kenya Mastery',              price:'$14,500', duration:'12 Days',page:'pkg-grand-odyssey.html',           tier:'ultra',  vibe:['wildlife','culture'],    durationKey:'grand',  priceRaw:14500 },
      { name:'Nairobi Wild',               price:'$680',    duration:'2 Days', page:'pkg-nairobi-wild.html',            tier:'budget', vibe:['wildlife'],              durationKey:'short',  priceRaw:680   },
      { name:"Hell's Gate Trek",           price:'$590',    duration:'2 Days', page:'pkg-hells-gate-trek.html',         tier:'budget', vibe:['adventure'],             durationKey:'short',  priceRaw:590   },
      { name:'Lamu Archipelago',           price:'$4,200',  duration:'5 Days', page:'pkg-lamu-archipelago.html',        tier:'mid',    vibe:['beach','culture'],       durationKey:'medium', priceRaw:4200  },
      { name:'Birding Kenya',              price:'$4,800',  duration:'6 Days', page:'pkg-birding-kenya.html',           tier:'mid',    vibe:['wildlife','adventure'],  durationKey:'medium', priceRaw:4800  },
      { name:'Family Wild',                price:'$4,100',  duration:'6 Days', page:'pkg-family-wild.html',             tier:'mid',    vibe:['wildlife','culture'],    durationKey:'medium', priceRaw:4100  },
      { name:'Photography Expedition',     price:'$7,400',  duration:'7 Days', page:'pkg-photography-expedition.html',  tier:'luxury', vibe:['wildlife'],              durationKey:'medium', priceRaw:7400  },
      { name:'Private Conservancy Sojourn',price:'$14,800', duration:'6 Days', page:'pkg-private-conservancy.html',     tier:'ultra',  vibe:['wildlife'],              durationKey:'medium', priceRaw:14800 },
      { name:'Migration Witness',          price:'$8,900',  duration:'5 Days', page:'pkg-migration-witness.html',       tier:'luxury', vibe:['wildlife'],              durationKey:'medium', priceRaw:8900  },
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
      // if bare "#" or "index.html" pointing to current page, prevent reload
      if(!href||href==='#'||href===window.location.pathname||href==='index.html'){
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
  {badge:null,        duration:'4 Days · 3 Nights',   name:'Mara<br>Awakening',             price:'$2,800',  page:'pkg-mara-awakening.html',        tier:'mid',    cardBg:'assets/maasaimara.webp',   features:['Maasai Mara Game Reserve','Private 4x4 Land Cruiser','Luxury Tented Camp','Expert Naturalist Guide','All Meals Included','Sundowner Cocktails']},
  {badge:'Most Exclusive',duration:'7 Days · 6 Nights',name:'Grand<br>Odyssey',             price:'$6,500',  page:'pkg-grand-odyssey.html',         tier:'luxury', cardBg:'assets/jungle.webp',       features:['Mara + Amboseli + Samburu','Private Charter Flights','5-Star Lodge & Tented Camps','Sunrise Balloon Safari','Cultural Maasai Immersion','Butler & Concierge Service','All-Inclusive Premium']},
  {badge:null,        duration:'10 Days · 9 Nights',  name:'Ultimate<br>Kenya',             price:'$11,200', page:'pkg-ultimate-kenya.html',        tier:'luxury', cardBg:'assets/Coolelephant.webp', features:['5 Iconic National Parks','Private Conservancy Access','Exclusive Use Bush Camp','Night Safari Drives','Marine Excursion, Diani','Photography Guide Included','Bespoke Farewell Dinner']},
  {badge:'New',       duration:'3 Days · 2 Nights',   name:'Amboseli<br>Escape',            price:'$1,950',  page:'pkg-amboseli-express.html',      tier:'budget', cardBg:'assets/amboseli.webp',     features:['Amboseli National Park','Kilimanjaro Panorama Views','Private Game Drives','Bush Breakfast Experience','All Meals Included','Expert Naturalist Guide']},
  {badge:null,        duration:'5 Days · 4 Nights',   name:'Samburu<br>Wilderness',         price:'$3,400',  page:'pkg-samburu-secrets.html',       tier:'mid',    cardBg:'assets/maasaimen.webp',    features:['Samburu National Reserve','Rare Northern Species','Private Tented Camp','Camel Safari Experience','Cultural Village Visit','All Meals & Transfers']},
  {badge:'Popular',   duration:'6 Days · 5 Nights',   name:'Coastal<br>Safari Blend',       price:'$4,200',  page:'pkg-safari-and-sea.html',        tier:'mid',    cardBg:'assets/dianibeach.webp',   features:['Tsavo East & West','Diani Beach Extension','Ocean-View Lodge','Snorkelling & Marine Park','Private Game Drives','All-Inclusive Package']},
  {badge:null,        duration:'8 Days · 7 Nights',   name:'Lakes &<br>Highlands',          price:'$5,100',  page:'pkg-lake-nakuru-escape.html',    tier:'mid',    cardBg:'assets/lakenakuru.webp',   features:['Lake Nakuru & Naivasha','Aberdare Forest Walks','Flamingo Boat Excursion','Mount Kenya Foothills','Luxury Lodge Stays','All Meals & Flights']},
  {badge:'Signature', duration:'12 Days · 11 Nights', name:'Kenya<br>Mastery',              price:'$14,500', page:'pkg-grand-odyssey.html',         tier:'luxury', cardBg:'assets/mountkenya.webp',   features:['6 Parks & Conservancies','Private Helicopter Transfer','Exclusive Bush Camp','Hot Air Balloon Safari','Michelin-Inspired Bush Dining','Dedicated Personal Guide','Fully Bespoke Itinerary']},
  {badge:null,        duration:'2 Days · 1 Night',    name:'Nairobi<br>Wild',               price:'$680',    page:'pkg-nairobi-wild.html',          tier:'budget', cardBg:'assets/maasaimara.webp',   features:['Nairobi National Park','Giraffes & Elephants','Boutique City-Edge Lodge','Private 4x4 Throughout','Full Board','Expert Naturalist Guide']},
  {badge:null,        duration:'2 Days · 1 Night',    name:"Hell's<br>Gate Trek",           price:'$590',    page:'pkg-hells-gate-trek.html',       tier:'budget', cardBg:'assets/maasaimara.webp',   features:["Hell's Gate National Park",'Cycling Through Gorge','Rappelling & Gorge Walk','Lake Naivasha Boat Ride','Full Board','2–8 Guests']},
  {badge:null,        duration:'5 Days · 4 Nights',   name:'Lamu<br>Archipelago',           price:'$4,200',  page:'pkg-lamu-archipelago.html',      tier:'mid',    cardBg:'assets/dianibeach.webp',   features:['Lamu & Manda Island','Boutique Heritage Hotel','Charter & Private Dhow','UNESCO Old Town','Full Board & Sundowners','Ideal for Couples']},
  {badge:null,        duration:'6 Days · 5 Nights',   name:'Birding<br>Kenya',              price:'$4,800',  page:'pkg-birding-kenya.html',         tier:'mid',    cardBg:'assets/lakenakuru.webp',   features:['Nakuru, Kakamega & Mara','250–400 Bird Species','African Bird Club Guide','Full Board','2–6 Guests','All Transfers Included']},
  {badge:null,        duration:'6 Days · 5 Nights',   name:'Family<br>Wild',                price:'$4,100',  page:'pkg-family-wild.html',           tier:'mid',    cardBg:'assets/maasaimara.webp',   features:['Nairobi + Maasai Mara','Junior Ranger Programme','Private Vehicle Always','Full Board','6 Days Family Adventure','Expert Family Guide']},
  {badge:null,        duration:'7 Days · 6 Nights',   name:'Photography<br>Expedition',     price:'$7,400',  page:'pkg-photography-expedition.html',tier:'luxury', cardBg:'assets/maasaimara.webp',   features:['Mara + Amboseli Locations','Nat Geo Professional Guide','Max 4 Guests Strictly','Private Charter Flights','All-Inclusive Premium','Full Photography Tuition']},
  {badge:'Exclusive', duration:'6 Days · 5 Nights',   name:'Private<br>Conservancy',        price:'$14,800', page:'pkg-private-conservancy.html',   tier:'ultra',  cardBg:'assets/maasaimara.webp',   features:['Full Conservancy Buyout','Exclusive-Use Tented Villa','Private Charter Flights','All-Inclusive Premium','Per Couple — Fully Private','Bespoke Butler Service']},
  {badge:null,        duration:'5 Days · 4 Nights',   name:'Migration<br>Witness',          price:'$8,900',  page:'pkg-migration-witness.html',     tier:'luxury', cardBg:'assets/maasaimara.webp',   features:['Great Migration River Crossings','July–October Only','Private River Camp','Private Charter Flights','All-Inclusive Fine Dining','Expert Migration Guide']},
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

var cardBgs=['assets/Coolelephant.webp','assets/jungle.webp','assets/zebra.webp'];

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
      {name:'Mara Awakening',price:'$2,800',duration:'4 Days',page:'pkg-mara-awakening.html',tier:'mid',vibe:['wildlife'],durationKey:'short',priceRaw:2800},
      {name:'Grand Odyssey',price:'$6,500',duration:'7 Days',page:'pkg-grand-odyssey.html',tier:'luxury',vibe:['wildlife','culture'],durationKey:'medium',priceRaw:6500},
      {name:'Ultimate Kenya',price:'$11,200',duration:'10 Days',page:'pkg-ultimate-kenya.html',tier:'luxury',vibe:['wildlife','adventure'],durationKey:'long',priceRaw:11200},
      {name:'Amboseli Escape',price:'$1,950',duration:'3 Days',page:'pkg-amboseli-express.html',tier:'budget',vibe:['wildlife'],durationKey:'short',priceRaw:1950},
      {name:'Samburu Wilderness',price:'$3,400',duration:'5 Days',page:'pkg-samburu-secrets.html',tier:'mid',vibe:['wildlife','adventure'],durationKey:'medium',priceRaw:3400},
      {name:'Coastal Safari Blend',price:'$4,200',duration:'6 Days',page:'pkg-safari-and-sea.html',tier:'mid',vibe:['beach','wildlife'],durationKey:'medium',priceRaw:4200},
      {name:'Lakes & Highlands',price:'$5,100',duration:'8 Days',page:'pkg-lake-nakuru-escape.html',tier:'mid',vibe:['adventure','culture'],durationKey:'long',priceRaw:5100},
      {name:'Kenya Mastery',price:'$14,500',duration:'12 Days',page:'pkg-grand-odyssey.html',tier:'ultra',vibe:['wildlife','culture'],durationKey:'grand',priceRaw:14500},
      {name:'Nairobi Wild',price:'$680',duration:'2 Days',page:'pkg-nairobi-wild.html',tier:'budget',vibe:['wildlife'],durationKey:'short',priceRaw:680},
      {name:"Hell's Gate Trek",price:'$590',duration:'2 Days',page:'pkg-hells-gate-trek.html',tier:'budget',vibe:['adventure'],durationKey:'short',priceRaw:590},
      {name:'Lamu Archipelago',price:'$4,200',duration:'5 Days',page:'pkg-lamu-archipelago.html',tier:'mid',vibe:['beach','culture'],durationKey:'medium',priceRaw:4200},
      {name:'Birding Kenya',price:'$4,800',duration:'6 Days',page:'pkg-birding-kenya.html',tier:'mid',vibe:['wildlife','adventure'],durationKey:'medium',priceRaw:4800},
      {name:'Family Wild',price:'$4,100',duration:'6 Days',page:'pkg-family-wild.html',tier:'mid',vibe:['wildlife','culture'],durationKey:'medium',priceRaw:4100},
      {name:'Photography Expedition',price:'$7,400',duration:'7 Days',page:'pkg-photography-expedition.html',tier:'luxury',vibe:['wildlife'],durationKey:'medium',priceRaw:7400},
      {name:'Private Conservancy Sojourn',price:'$14,800',duration:'6 Days',page:'pkg-private-conservancy.html',tier:'ultra',vibe:['wildlife'],durationKey:'medium',priceRaw:14800},
      {name:'Migration Witness',price:'$8,900',duration:'5 Days',page:'pkg-migration-witness.html',tier:'luxury',vibe:['wildlife'],durationKey:'medium',priceRaw:8900},
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
    {slug:'great-migration-guide',title:'The Great Migration: Everything You Need to Know Before You Go',excerpt:'Two million wildebeest. One river. An annual crossing that redefines what it means to witness nature at full force.',category:'Wildlife',date:'March 2025',read_time:'8 min read',cover_image:'assets/maasaimara.webp',cover_alt:'The Great Migration'},
    {slug:'best-time-kenya-safari',title:"When to Go: Kenya's Safari Seasons Decoded",excerpt:'Peak, shoulder, green — each season unlocks a different Kenya. Here is how to choose yours.',category:'Planning',date:'February 2025',read_time:'5 min read',cover_image:'assets/amboseli.webp',cover_alt:'Best time for Kenya safari'},
    {slug:'diani-beach-guide',title:"Diani Beach: Africa's Finest Coastline After Your Safari",excerpt:'Where the bush ends and the ocean begins.',category:'Coast',date:'January 2025',read_time:'6 min read',cover_image:'assets/dianibeach.webp',cover_alt:'Diani Beach Guide'},
  ];
  var allBlogs=fallbackBlogs.slice();

  function buildBlogCardHTML(blog){
    var page=blog.slug&&blog.slug.startsWith('http')?blog.slug:'blog/'+blog.slug+'.html';
    return'<div class="blog-card-img-wrap"><img class="blog-card-img" src="'+blog.cover_image+'" alt="'+(blog.cover_alt||blog.title)+'" loading="lazy"><div class="blog-card-img-overlay"></div><span class="blog-card-category">'+blog.category+'</span></div>'+
      '<div class="blog-card-body"><div class="blog-card-meta"><span class="blog-card-date">'+blog.date+'</span><span class="blog-card-read">'+blog.read_time+'</span></div>'+
      '<h3 class="blog-card-title">'+blog.title+'</h3><p class="blog-card-excerpt">'+blog.excerpt+'</p>'+
      '<span class="blog-card-cta">Read the story</span></div>';
  }

  function setCard(el,blog){
    if(!el||!blog)return;
    var page=blog.slug&&blog.slug.startsWith('http')?blog.slug:'blog/'+blog.slug+'.html';
    el.innerHTML=buildBlogCardHTML(blog);
    el.style.cursor='none'; el.onclick=function(){window.location.href=page;};
  }

  async function loadBlogs(){
    try{
      var supa=window.supabase?window.supabase.createClient('https://kwriicxzkgkcseorcqdi.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo'):null;
      if(supa){
        var res=await supa.from('blogs').select('slug,title,excerpt,category,published_date,read_time,cover_image_url,cover_alt,is_published').eq('is_published',true).order('published_date',{ascending:false});
        if(!res.error&&res.data&&res.data.length){
          var sb=res.data.map(function(b){return{slug:b.slug,title:b.title,excerpt:b.excerpt||'',category:b.category||'Safari',date:b.published_date?new Date(b.published_date).toLocaleDateString('en-US',{month:'long',year:'numeric'}):'',read_time:b.read_time||'5 min read',cover_image:b.cover_image_url||'assets/maasaimara.webp',cover_alt:b.cover_alt||b.title};});
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
// GALLERY SLIDESHOW
// ===========================
(function(){
  var track=document.getElementById('galTrack');
  if(!track)return;
  var slides=Array.from(track.querySelectorAll('.gsl-slide'));
  var slideshow=document.getElementById('galSlideshow');
  var dotsWrap=document.getElementById('galDots');
  var progress=document.getElementById('galProgress');
  var curNum=document.getElementById('galCurNum');
  var totNum=document.getElementById('galTotalNum');
  var prevBtn=document.getElementById('galPrev');
  var nextBtn=document.getElementById('galNext');
  var thumbs=document.getElementById('galThumbs');
  var lightbox=document.getElementById('galLightbox');
  var lbImg=document.getElementById('galLbImg');
  var lbClose=document.getElementById('galLbClose');
  var lbPrev=document.getElementById('galLbPrev');
  var lbNext=document.getElementById('galLbNext');
  var lbCur=document.getElementById('galLbCur');
  var lbTotal=document.getElementById('galLbTotal');
  var total=slides.length, current=0, timer=null, isHovered=false, trackOffset=0;
  var INTERVAL=4800;

  if(totNum)totNum.textContent=total;
  if(lbTotal)lbTotal.textContent=total;

  slides.forEach(function(_,i){
    var dot=document.createElement('div');dot.className='gsl-dot'+(i===0?' active':'');
    dot.addEventListener('click',function(){goTo(i);startTimer();});
    if(dotsWrap)dotsWrap.appendChild(dot);
    if(thumbs){
      var th=document.createElement('div');th.className='gsl-thumb'+(i===0?' active':'');
      var src=slides[i].dataset.src||slides[i].querySelector('.gsl-img')?.src||'';
      th.innerHTML='<img src="'+src+'" alt="" loading="lazy">';
      th.addEventListener('click',function(){goTo(i);startTimer();});
      thumbs.appendChild(th);
    }
  });

  function getClass(pos){if(pos===0)return'gsl-active';if(pos===1)return'gsl-next';if(pos===total-1)return'gsl-prev-slide';if(pos===2||pos===total-2)return'gsl-far';return'';}

  function centerActive(){
    if(!slideshow)return;
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      var sw=slideshow.offsetWidth,ae=slides[current],aw=ae.offsetWidth,gap=20,padL=sw*0.18,before=0;
      slides.forEach(function(s,i){if(i<current)before+=s.offsetWidth+gap;});
      trackOffset=(sw-aw)/2-before-padL;
      track.style.transform='translateX('+trackOffset+'px)';
    });});
  }

  function updateSlides(){
    slides.forEach(function(sl,i){
      sl.classList.remove('gsl-active','gsl-next','gsl-prev-slide','gsl-far');
      var pos=(i-current+total)%total,cls=getClass(pos);
      if(cls)sl.classList.add(cls);
      sl.style.visibility=(pos>2&&pos<total-2)?'hidden':'visible';
    });
    if(dotsWrap)dotsWrap.querySelectorAll('.gsl-dot').forEach(function(d,i){d.classList.toggle('active',i===current);if(i===current){d.innerHTML='';void d.offsetWidth;}});
    if(thumbs)thumbs.querySelectorAll('.gsl-thumb').forEach(function(t,i){t.classList.toggle('active',i===current);});
    centerActive();
    if(curNum)curNum.textContent=current+1;
    if(lbCur)lbCur.textContent=current+1;
  }

  function restartProgress(){
    if(!progress)return;
    progress.classList.remove('running');progress.style.transition='none';progress.style.width='0';
    void progress.offsetWidth;progress.classList.add('running');
  }

  function goTo(index){current=(index+total)%total;updateSlides();restartProgress();}
  function startTimer(){clearInterval(timer);timer=setInterval(function(){if(!isHovered)goTo(current+1);},INTERVAL);}

  if(prevBtn)prevBtn.addEventListener('click',function(){goTo(current-1);startTimer();});
  if(nextBtn)nextBtn.addEventListener('click',function(){goTo(current+1);startTimer();});

  if(slideshow){slideshow.addEventListener('mouseenter',function(){isHovered=true;});slideshow.addEventListener('mouseleave',function(){isHovered=false;});}

  var tx=0,dragging=false;
  if(slideshow){
    slideshow.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;dragging=true;clearInterval(timer);},{passive:true});
    slideshow.addEventListener('touchend',function(e){if(!dragging)return;dragging=false;var dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>48){dx<0?goTo(current+1):goTo(current-1);}startTimer();},{passive:true});
  }

  function openLightbox(index){
    current=index;
    var src=slides[index].dataset.src||slides[index].querySelector('.gsl-img')?.src||'';
    if(lbImg){lbImg.src=src;}
    if(lbCur)lbCur.textContent=index+1;
    if(lightbox)lightbox.classList.add('open');
    document.body.style.overflow='hidden';clearInterval(timer);
  }
  function closeLightbox(){if(lightbox)lightbox.classList.remove('open');document.body.style.overflow='';startTimer();}

  slides.forEach(function(sl,i){
    var zb=sl.querySelector('.gsl-zoom-btn');
    if(zb)zb.addEventListener('click',function(e){e.stopPropagation();openLightbox(i);});
    sl.addEventListener('click',function(e){if(!e.target.closest('.gsl-zoom-btn')&&sl.classList.contains('gsl-active'))openLightbox(i);});
  });

  if(lbClose)lbClose.addEventListener('click',closeLightbox);
  if(lightbox)lightbox.addEventListener('click',function(e){if(e.target===lightbox||e.target.classList.contains('gsl-lb-inner'))closeLightbox();});
  if(lbPrev)lbPrev.addEventListener('click',function(e){e.stopPropagation();openLightbox((current-1+total)%total);});
  if(lbNext)lbNext.addEventListener('click',function(e){e.stopPropagation();openLightbox((current+1)%total);});
  document.addEventListener('keydown',function(e){if(lightbox&&lightbox.classList.contains('open')){if(e.key==='ArrowRight')openLightbox((current+1)%total);if(e.key==='ArrowLeft')openLightbox((current-1+total)%total);if(e.key==='Escape')closeLightbox();}});

  window.addEventListener('resize',function(){centerActive();});
  updateSlides();restartProgress();startTimer();
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
      fr.src = 'profile.html';
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
  if (savedScroll && document.referrer.includes('profile.html')) {
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
      img:'assets/team-filmer.webp',
      wildlifeImg:'assets/maasaimara.webp',
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
      img:'assets/team-amara.webp',
      wildlifeImg:'assets/amboseli.webp',
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
      img:'assets/team-githaiga.webp',
      wildlifeImg:'assets/zebra.webp',
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

  var PAGE_LOAD_TIME = Date.now();
  var FIRST_HINT_DELAY = 15000; // 15 seconds before first hint
  var BETWEEN_HINTS = 5000;     // 5 seconds between hints
  var shown = new Set();
  var activeHint = null;
  var hintsQueue = [];
  var hintsStarted = false;
  var hintCount = 0;
  var processingQueue = false;

  var hints = [
    {id:'theme',    label:'Tip',         text:'Switch between dark and light mode using the sun/moon button at bottom-left.'},
    {id:'slides',   label:'Navigate',    text:'Swipe left or right — or click the glowing arrows — to explore each Kenyan destination.'},
    {id:'quiz',     label:'Safari Match',text:'Answer 5 quick questions below and we\'ll find your perfect safari package instantly.'},
    {id:'gallery',  label:'Gallery',     text:'Click the magnify icon on any gallery image to view it in stunning full screen.'},
    {id:'packages', label:'Filter',      text:'Use the filter bar to sort safari packages by budget — from backpacker to ultra-luxury.'},
    {id:'whatsapp', label:'Quick action',text:'Tap the green WhatsApp button at bottom-right to reach our team within the hour.'},
    {id:'team',     label:'Meet Us',     text:'Click "View Profile" on any team member card to learn more about your guide.'},
    {id:'review',   label:'Your Voice',  text:'Scroll to the bottom of testimonials to leave your own review after your safari.'},
  ];

  function buildHintBox(hint, isThird) {
    var box = document.createElement('div');
    box.className = 'site-hint';
    box.id = 'fj-hint-' + hint.id;
    box.style.cssText = 'position:fixed;bottom:160px;right:36px;z-index:99980;max-width:280px;';
    var inner = '<span class="site-hint-label">' + hint.label + '</span>' +
      '<span class="site-hint-text">' + hint.text + '</span>';
    if (isThird) {
      inner += '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">' +
        '<button id="fj-hint-yes" style="font-family:Jost,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;padding:8px 16px;background:var(--gold);color:#080808;border:none;cursor:none;font-weight:700;">Yes, keep them</button>' +
        '<button id="fj-hint-no" style="font-family:Jost,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;padding:8px 16px;background:transparent;color:var(--muted);border:1px solid var(--border);cursor:none;">No thanks</button>' +
        '</div>';
    }
    inner += '<button class="site-hint-close" aria-label="Dismiss" style="position:absolute;top:10px;right:10px;background:none;border:none;color:var(--muted);font-size:14px;cursor:none;padding:2px 5px;">×</button>';
    inner += '<div class="site-hint-bar"></div>';
    box.innerHTML = inner;
    return box;
  }

  function showNextHint() {
    if (processingQueue || activeHint || localStorage.getItem('fj-hints-disabled')==='true') return;
    if (!hintsQueue.length) return;
    processingQueue = true;
    var hint = hintsQueue.shift();
    if (shown.has(hint.id)) { processingQueue = false; showNextHint(); return; }
    shown.add(hint.id);
    hintCount++;
    activeHint = hint.id;
    var isThird = hintCount === 3;
    var box = buildHintBox(hint, isThird);
    document.body.appendChild(box);
    requestAnimationFrame(function(){ box.style.opacity = '1'; });

    function dismiss(scheduleNext) {
      box.classList.add('hiding');
      setTimeout(function(){
        if(box.parentNode) box.parentNode.removeChild(box);
        activeHint = null;
        processingQueue = false;
        if (scheduleNext !== false && localStorage.getItem('fj-hints-disabled') !== 'true') {
          setTimeout(showNextHint, BETWEEN_HINTS);
        }
      }, 380);
    }

    box.querySelector('.site-hint-close').addEventListener('click', function(){ dismiss(true); });

    if (isThird) {
      var yesBtn = box.querySelector('#fj-hint-yes');
      var noBtn  = box.querySelector('#fj-hint-no');
      if (yesBtn) yesBtn.addEventListener('click', function(){ localStorage.setItem('fj-hints-disabled','false'); dismiss(true); });
      if (noBtn)  noBtn.addEventListener('click',  function(){ localStorage.setItem('fj-hints-disabled','true');  dismiss(false); hintsQueue = []; });
    }

    var autoTimer = isThird ? null : setTimeout(function(){ dismiss(true); }, 5200);
    if (!isThird && box.querySelector('.site-hint-close')) {
      box.querySelector('.site-hint-close').addEventListener('click', function(){ clearTimeout(autoTimer); });
    }
  }

  function queueHint(hint) {
    if (shown.has(hint.id)) return;
    if (hintsQueue.find(function(h){ return h.id === hint.id; })) return;
    hintsQueue.push(hint);
  }

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
      // Concierge name
      document.querySelectorAll('.concierge-name').forEach(el => el.textContent = v.name || el.textContent);
      // WhatsApp links sitewide
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
      // Contact email
      document.querySelectorAll('.contact-detail-value').forEach(el => {
        if (el.textContent.includes('@filmaxjambotours') && v.email) el.textContent = v.email;
      });
      // Concierge bio
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

  // Load on page visit
  async function loadSiteSettings() {
    const { data } = await supa.from('site_settings').select('*');
    if (data) data.forEach(applySettings);
  }

  // Real-time: apply instantly when admin saves
  supa.channel('site-settings-live')
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'site_settings'
    }, payload => {
      applySettings(payload.new);
    })
    .subscribe();

  loadSiteSettings();
})();

  // Pre-queue all hints immediately, but don't show until 15s in
  hints.forEach(function(h){ queueHint(h); });

  setTimeout(function(){
    hintsStarted = true;
    showNextHint();
    // Also keep checking scroll for more
    window.addEventListener('scroll', function(){
      if (!hintsStarted) return;
      if (!activeHint && hintsQueue.length && !processingQueue) {
        setTimeout(showNextHint, BETWEEN_HINTS);
      }
    }, { passive: true });
  }, FIRST_HINT_DELAY);
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
