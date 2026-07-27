/* ═══════════════════════════════════════════════════════════════
   FJT WISHLIST — heart button on every package card
   Uses event delegation so dynamically re-rendered cards (the
   homepage rotator swaps innerHTML every 32s) keep working
   without re-binding listeners.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  var SUPA_URL='https://kwriicxzkgkcseorcqdi.supabase.co';
  var SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';

  var supa=null, savedSlugs={}, currentUser=null;

  function client(){
    if(!supa && window.supabase && window.supabase.createClient){
      supa=window.supabase.createClient(SUPA_URL,SUPA_KEY);
    }
    return supa;
  }

  var HEART_OUTLINE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-8-5.5-10-11a5 5 0 0 1 10-3 5 5 0 0 1 10 3c-2 5.5-10 11-10 11z"/></svg>';
  var HEART_FILLED='<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-8-5.5-10-11a5 5 0 0 1 10-3 5 5 0 0 1 10 3c-2 5.5-10 11-10 11z"/></svg>';

  // Build the button markup — called from card templates
  window.fjtWishBtn=function(slug,name,url,img){
    if(!slug) return '';
    var on=!!savedSlugs[slug];
    return '<button type="button" class="pkg-wish-btn'+(on?' is-saved':'')+'"'+
      ' data-wish-slug="'+String(slug).replace(/"/g,'&quot;')+'"'+
      ' data-wish-name="'+String(name||'').replace(/"/g,'&quot;')+'"'+
      ' data-wish-url="'+String(url||'').replace(/"/g,'&quot;')+'"'+
      ' data-wish-img="'+String(img||'').replace(/"/g,'&quot;')+'"'+
      ' aria-label="'+(on?'Remove from wishlist':'Save to wishlist')+'"'+
      ' title="'+(on?'Saved \u2014 tap to remove':'Save to your wishlist')+'">'+
      (on?HEART_FILLED:HEART_OUTLINE)+'</button>';
  };

  function paintAll(){
    document.querySelectorAll('.pkg-wish-btn').forEach(function(btn){
      var on=!!savedSlugs[btn.getAttribute('data-wish-slug')];
      btn.classList.toggle('is-saved',on);
      btn.innerHTML=on?HEART_FILLED:HEART_OUTLINE;
      btn.setAttribute('aria-label',on?'Remove from wishlist':'Save to wishlist');
    });
  }
  window.fjtWishRepaint=paintAll;

  function toast(msg){
    var t=document.getElementById('fjtWishToast');
    if(!t){
      t=document.createElement('div');
      t.id='fjtWishToast';
      document.body.appendChild(t);
    }
    t.textContent=msg;
    t.classList.add('show');
    clearTimeout(t._tm);
    t._tm=setTimeout(function(){ t.classList.remove('show'); },2400);
  }

  async function refreshSaved(){
    var db=client(); if(!db) return;
    var s=await db.auth.getSession();
    currentUser=(s.data&&s.data.session)?s.data.session.user:null;
    savedSlugs={};
    if(currentUser){
      var r=await db.from('wishlists').select('package_slug').eq('user_id',currentUser.id);
      if(!r.error&&r.data){ r.data.forEach(function(w){ savedSlugs[w.package_slug]=true; }); }
    }
    paintAll();
  }

  document.addEventListener('click',async function(e){
    var btn=e.target.closest?e.target.closest('.pkg-wish-btn'):null;
    if(!btn) return;
    e.preventDefault();
    e.stopPropagation();

    var db=client();
    if(!db){ toast('Wishlist unavailable right now'); return; }

    if(!currentUser){
      var s=await db.auth.getSession();
      currentUser=(s.data&&s.data.session)?s.data.session.user:null;
    }
    if(!currentUser){
      toast('Sign in to save packages to your wishlist');
      if(typeof window.openAuthModal==='function'){ window.openAuthModal(); }
      else { var am=document.getElementById('authModal'); if(am) am.classList.add('open'); }
      return;
    }

    var slug=btn.getAttribute('data-wish-slug');
    var isSaved=!!savedSlugs[slug];

    // optimistic paint
    savedSlugs[slug]=!isSaved;
    paintAll();

    if(isSaved){
      var del=await db.from('wishlists').delete().eq('user_id',currentUser.id).eq('package_slug',slug);
      if(del.error){ savedSlugs[slug]=true; paintAll(); toast('Could not remove'); return; }
      toast('Removed from your wishlist');
    } else {
      var ins=await db.from('wishlists').insert({
        user_id:currentUser.id,
        package_slug:slug,
        package_name:btn.getAttribute('data-wish-name')||slug,
        package_url:btn.getAttribute('data-wish-url')||null,
        image_url:btn.getAttribute('data-wish-img')||null
      });
      if(ins.error){
        // 23505 = already there (race/dupe) — treat as success
        if(ins.error.code!=='23505'){ savedSlugs[slug]=false; paintAll(); toast('Could not save'); return; }
      }
      toast('Saved to your wishlist');
    }
  });

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',refreshSaved);
  } else { refreshSaved(); }

  window.addEventListener('focus',refreshSaved);
})();
