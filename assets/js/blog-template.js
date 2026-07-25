
const SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
const supa = supabase.createClient(SUPA_URL, SUPA_KEY);

// ── AUTH GATE — individual blog posts ──
(async function guardPost() {
  let user = null;
  try {
    const { data } = await supa.auth.getSession();
    user = data?.session?.user || null;
  } catch(e) {}
  if (!user) {
    showPostAuthGate();
  }
})();

function showPostAuthGate() {
  const body = document.getElementById('postBody');
  if (body) { body.style.filter = 'blur(10px)'; body.style.pointerEvents = 'none'; body.style.userSelect = 'none'; }
  const hero = document.getElementById('postHero');
  if (hero) { hero.style.filter = 'blur(4px)'; }

  const gateHTML = `
  <div id="postAuthGate" style="
    position:fixed;inset:0;z-index:99990;
    display:flex;align-items:center;justify-content:center;
    background:rgba(4,4,4,0.9);backdrop-filter:blur(24px);
    padding:20px;
  " onclick="if(event.target===this){}">
    <div style="
      background:#0a0a0a;border:1px solid rgba(212,175,55,0.28);
      max-width:480px;width:100%;padding:0;
      position:relative;
      box-shadow:0 0 0 1px rgba(212,175,55,0.06),0 40px 120px rgba(0,0,0,0.98),inset 0 1px 0 rgba(212,175,55,0.1);
      overflow:hidden;
    ">
      <div style="height:2px;background:linear-gradient(to right,transparent,#d4af37 30%,#f0c84a 50%,#d4af37 70%,transparent);"></div>
      <div style="padding:48px 44px 44px;">
        <span style="font-family:'Jost',sans-serif;font-size:8px;letter-spacing:6px;text-transform:uppercase;color:rgba(212,175,55,0.6);display:block;margin-bottom:10px;">Members Only</span>
        <h2 style="font-family:'Playfair Display',serif;font-size:clamp(24px,4vw,32px);font-weight:900;line-height:1.1;color:#f0ece4;margin-bottom:10px;">
          Read the<br><em style="color:#d4af37;font-weight:400;">Full Story</em>
        </h2>
        <p style="font-family:'Cormorant Garamond',serif;font-size:17px;font-style:italic;color:#8a8074;line-height:1.7;margin-bottom:36px;">
          Sign in or create a free account to read this story and our entire safari journal.
        </p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;">
          <button onclick="openPostAuth('signup')" style="flex:1;min-width:140px;font-family:'Jost',sans-serif;font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;padding:18px 20px;background:linear-gradient(135deg,#f0c84a 0%,#d4af37 35%,#b8860b 70%,#c9921a 100%);color:#080808;border:none;cursor:pointer;box-shadow:0 2px 0 rgba(255,255,255,0.22) inset,0 -2px 0 rgba(0,0,0,0.35) inset,0 8px 28px rgba(212,175,55,0.3);transition:filter 0.2s,transform 0.2s;" onmouseover="this.style.filter='brightness(1.1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.filter='';this.style.transform=''">Join Free</button>
          <button onclick="openPostAuth('signin')" style="flex:1;min-width:120px;font-family:'Jost',sans-serif;font-size:10px;font-weight:600;letter-spacing:4px;text-transform:uppercase;padding:18px 20px;background:transparent;color:#d4af37;border:1.5px solid #d4af37;cursor:pointer;transition:background 0.25s,transform 0.2s;" onmouseover="this.style.background='rgba(212,175,55,0.09)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='transparent';this.style.transform=''">Sign In</button>
        </div>
        <a href="../blog.html" style="display:block;text-align:center;font-family:'Cormorant Garamond',serif;font-size:14px;font-style:italic;color:rgba(138,128,116,0.6);text-decoration:none;transition:color 0.3s;" onmouseover="this.style.color='#d4af37'" onmouseout="this.style.color='rgba(138,128,116,0.6)'"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-3px;"><path d="M19 12H5M11 6l-6 6 6 6"/></svg> Back to Journal</a>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', gateHTML);
}

function openPostAuth(tab) {
  const existing = document.getElementById('postAuthModal');
  if (existing) existing.remove();
  const isSignUp = tab === 'signup';
  const html = `
  <div id="postAuthModal" style="position:fixed;inset:0;z-index:99995;background:rgba(2,2,2,0.95);backdrop-filter:blur(28px);display:flex;align-items:center;justify-content:center;padding:20px;" onclick="if(event.target===this)document.getElementById('postAuthModal').remove()">
    <div style="background:#0a0a0a;border:1px solid rgba(212,175,55,0.28);max-width:480px;width:100%;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 40px 120px rgba(0,0,0,0.98);scrollbar-width:thin;scrollbar-color:rgba(212,175,55,0.3) transparent;">
      <div style="height:2px;background:linear-gradient(to right,transparent,#d4af37 30%,#f0c84a 50%,#d4af37 70%,transparent);"></div>
      <button onclick="document.getElementById('postAuthModal').remove()" style="position:absolute;top:14px;right:16px;background:none;border:1px solid rgba(212,175,55,0.2);color:rgba(138,128,116,0.8);font-family:'Jost',sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;padding:8px 16px;cursor:pointer;" onmouseover="this.style.color='#d4af37';this.style.borderColor='#d4af37'" onmouseout="this.style.color='rgba(138,128,116,0.8)';this.style.borderColor='rgba(212,175,55,0.2)'">Close</button>
      <div style="padding:48px 44px 44px;">
        <span style="font-family:'Jost',sans-serif;font-size:8px;letter-spacing:6px;text-transform:uppercase;color:rgba(212,175,55,0.6);display:block;margin-bottom:10px;">Filmax Jambo Tours</span>
        <h2 id="postModalTitle" style="font-family:'Playfair Display',serif;font-size:28px;font-weight:900;line-height:1.1;color:#f0ece4;margin-bottom:8px;">${isSignUp?'Join the<br><em style="color:#d4af37;font-weight:400;">Journey</em>':'Welcome<br><em style="color:#d4af37;font-weight:400;">Back</em>'}</h2>
        <p style="font-family:'Cormorant Garamond',serif;font-size:16px;font-style:italic;color:#8a8074;margin-bottom:28px;line-height:1.6;">${isSignUp?'Create a free account to read all safari stories.':'Sign in to continue reading.'}</p>
        <div style="display:flex;gap:0;margin-bottom:28px;border-bottom:1px solid rgba(212,175,55,0.12);">
          <button id="pTabSI" onclick="switchPostTab('signin')" style="font-family:'Jost',sans-serif;font-size:9px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${!isSignUp?'#d4af37':'rgba(138,128,116,0.8)'};background:none;border:none;border-bottom:2px solid ${!isSignUp?'#d4af37':'transparent'};padding:11px 24px 11px 0;cursor:pointer;margin-bottom:-1px;">Sign In</button>
          <button id="pTabSU" onclick="switchPostTab('signup')" style="font-family:'Jost',sans-serif;font-size:9px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${isSignUp?'#d4af37':'rgba(138,128,116,0.8)'};background:none;border:none;border-bottom:2px solid ${isSignUp?'#d4af37':'transparent'};padding:11px 24px 11px 0;cursor:pointer;margin-bottom:-1px;">Create Account</button>
        </div>
        <div id="pErr" style="display:none;background:rgba(224,85,85,0.1);border:1px solid rgba(224,85,85,0.3);color:#e07070;font-family:'Jost',sans-serif;font-size:11px;padding:12px 16px;margin-bottom:14px;"></div>
        <div id="pOk"  style="display:none;background:rgba(123,181,110,0.1);border:1px solid rgba(123,181,110,0.3);color:#7bb56e;font-family:'Jost',sans-serif;font-size:11px;padding:12px 16px;margin-bottom:14px;text-align:center;"></div>
        <div id="pPanelSI" style="display:${!isSignUp?'block':'none'}">
          <input id="pSIEmail" type="email" placeholder="EMAIL ADDRESS" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,175,55,0.18);color:#f0ece4;font-family:'Jost',sans-serif;font-size:13px;padding:13px 0;margin-bottom:14px;outline:none;" onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor='rgba(212,175,55,0.18)'">
          <input id="pSIPass" type="password" placeholder="PASSWORD" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,175,55,0.18);color:#f0ece4;font-family:'Jost',sans-serif;font-size:13px;padding:13px 0;margin-bottom:22px;outline:none;" onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor='rgba(212,175,55,0.18)'" onkeydown="if(event.key==='Enter')postSignIn()">
          <button onclick="postSignIn()" id="pSIBtn" style="width:100%;font-family:'Jost',sans-serif;font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;padding:19px;background:linear-gradient(135deg,#f0c84a 0%,#d4af37 35%,#b8860b 70%,#c9921a 100%);color:#080808;border:none;cursor:pointer;box-shadow:0 2px 0 rgba(255,255,255,0.22) inset,0 -2px 0 rgba(0,0,0,0.35) inset,0 8px 28px rgba(212,175,55,0.3);">Sign In to Read</button>
          <p style="text-align:center;margin-top:16px;font-family:'Jost',sans-serif;font-size:11px;color:rgba(138,128,116,0.7);">No account? <button onclick="switchPostTab('signup')" style="background:none;border:none;color:#d4af37;font-size:11px;cursor:pointer;text-decoration:underline;">Create one free</button></p>
        </div>
        <div id="pPanelSU" style="display:${isSignUp?'block':'none'}">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 18px;">
            <input id="pSUFirst" type="text" placeholder="FIRST NAME" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,175,55,0.18);color:#f0ece4;font-family:'Jost',sans-serif;font-size:13px;padding:13px 0;margin-bottom:14px;outline:none;" onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor='rgba(212,175,55,0.18)'">
            <input id="pSULast" type="text" placeholder="LAST NAME" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,175,55,0.18);color:#f0ece4;font-family:'Jost',sans-serif;font-size:13px;padding:13px 0;margin-bottom:14px;outline:none;" onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor='rgba(212,175,55,0.18)'">
          </div>
          <input id="pSUEmail" type="email" placeholder="EMAIL ADDRESS" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,175,55,0.18);color:#f0ece4;font-family:'Jost',sans-serif;font-size:13px;padding:13px 0;margin-bottom:14px;outline:none;" onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor='rgba(212,175,55,0.18)'">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 18px;">
            <input id="pSUPass" type="password" placeholder="PASSWORD (MIN 8)" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,175,55,0.18);color:#f0ece4;font-family:'Jost',sans-serif;font-size:13px;padding:13px 0;margin-bottom:22px;outline:none;" onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor='rgba(212,175,55,0.18)'">
            <input id="pSUConf" type="password" placeholder="CONFIRM" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,175,55,0.18);color:#f0ece4;font-family:'Jost',sans-serif;font-size:13px;padding:13px 0;margin-bottom:22px;outline:none;" onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor='rgba(212,175,55,0.18)'">
          </div>
          <button onclick="postSignUp()" id="pSUBtn" style="width:100%;font-family:'Jost',sans-serif;font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;padding:19px;background:linear-gradient(135deg,#f0c84a 0%,#d4af37 35%,#b8860b 70%,#c9921a 100%);color:#080808;border:none;cursor:pointer;box-shadow:0 2px 0 rgba(255,255,255,0.22) inset,0 -2px 0 rgba(0,0,0,0.35) inset,0 8px 28px rgba(212,175,55,0.3);">Create Free Account</button>
          <p style="text-align:center;margin-top:16px;font-family:'Jost',sans-serif;font-size:11px;color:rgba(138,128,116,0.7);">Already have an account? <button onclick="switchPostTab('signin')" style="background:none;border:none;color:#d4af37;font-size:11px;cursor:pointer;text-decoration:underline;">Sign in</button></p>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function switchPostTab(tab) {
  const si = document.getElementById('pPanelSI');
  const su = document.getElementById('pPanelSU');
  const tSI = document.getElementById('pTabSI');
  const tSU = document.getElementById('pTabSU');
  const title = document.getElementById('postModalTitle');
  const gold = '#d4af37', dim = 'rgba(138,128,116,0.8)';
  if (tab === 'signin') {
    if(si) si.style.display='block'; if(su) su.style.display='none';
    if(tSI){tSI.style.color=gold;tSI.style.borderBottomColor=gold;} if(tSU){tSU.style.color=dim;tSU.style.borderBottomColor='transparent';}
    if(title) title.innerHTML='Welcome<br><em style="color:#d4af37;font-weight:400;">Back</em>';
  } else {
    if(si) si.style.display='none'; if(su) su.style.display='block';
    if(tSU){tSU.style.color=gold;tSU.style.borderBottomColor=gold;} if(tSI){tSI.style.color=dim;tSI.style.borderBottomColor='transparent';}
    if(title) title.innerHTML='Join the<br><em style="color:#d4af37;font-weight:400;">Journey</em>';
  }
  ['pErr','pOk'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
}

async function postSignIn() {
  const email = document.getElementById('pSIEmail')?.value.trim();
  const pass  = document.getElementById('pSIPass')?.value;
  const err = document.getElementById('pErr'); const ok = document.getElementById('pOk');
  const btn = document.getElementById('pSIBtn');
  if (!email||!pass){if(err){err.textContent='Please enter email and password.';err.style.display='block';}return;}
  if(btn)btn.textContent='Signing in…';
  try {
    const {error} = await supa.auth.signInWithPassword({email,password:pass});
    if(error)throw error;
    if(ok){ok.textContent='Signed in! Loading article…';ok.style.display='block';}
    if(err)err.style.display='none';
    setTimeout(()=>{
      document.getElementById('postAuthModal')?.remove();
      document.getElementById('postAuthGate')?.remove();
      const b=document.getElementById('postBody'); const h=document.getElementById('postHero');
      if(b){b.style.filter='';b.style.pointerEvents='';b.style.userSelect='';}
      if(h)h.style.filter='';
    },900);
  } catch(e){if(err){err.textContent=e.message||'Sign in failed.';err.style.display='block';}if(ok)ok.style.display='none';}
  if(btn)btn.textContent='Sign In to Read';
}

async function postSignUp() {
  const firstName=document.getElementById('pSUFirst')?.value.trim();
  const lastName=document.getElementById('pSULast')?.value.trim();
  const email=document.getElementById('pSUEmail')?.value.trim();
  const pass=document.getElementById('pSUPass')?.value;
  const conf=document.getElementById('pSUConf')?.value;
  const err=document.getElementById('pErr'); const ok=document.getElementById('pOk');
  const btn=document.getElementById('pSUBtn');
  if(!firstName||!lastName){if(err){err.textContent='Please enter your name.';err.style.display='block';}return;}
  if(!email){if(err){err.textContent='Please enter your email.';err.style.display='block';}return;}
  if(!pass||pass.length<8){if(err){err.textContent='Password must be at least 8 characters.';err.style.display='block';}return;}
  if(pass!==conf){if(err){err.textContent='Passwords do not match.';err.style.display='block';}return;}
  if(btn)btn.textContent='Creating account…';
  try {
    const {data,error}=await supa.auth.signUp({email,password:pass,options:{data:{first_name:firstName,last_name:lastName}}});
    if(error)throw error;
    if(data?.user?.identities?.length===0){if(err){err.textContent='Account already exists. Please sign in.';err.style.display='block';}}
    else{if(ok){ok.textContent='Account created! Please confirm your email, then sign in.';ok.style.display='block';}if(err)err.style.display='none';}
  } catch(e){if(err){err.textContent=e.message||'Registration failed.';err.style.display='block';}}
  if(btn)btn.textContent='Create Free Account';
}

// ── END AUTH GATE ──

// Cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e=>{ mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px'; });
function animateRing(){ rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(animateRing); }
animateRing();

// Get slug from filename (e.g. great-migration-guide.html <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-3px;"><path d="M5 12h14M13 6l6 6-6 6"/></svg> great-migration-guide)
// OR from URL param ?slug=...
function getSlug() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('slug')) return params.get('slug');
  const filename = window.location.pathname.split('/').pop().replace('.html','');
  return filename === 'post-template' ? null : filename;
}

function renderPost(post) {
  document.title = post.title + ' — Filmax Jambo Tours';

  const assetBase = '../';
  const heroImg = post.cover_image_url || (assetBase + 'assets/maasaimara.webp');
  const dateStr = post.published_date
    ? new Date(post.published_date).toLocaleDateString('en-US',{day:'numeric',month:'long',year:'numeric'})
    : (post.date || '');

  document.getElementById('postHero').innerHTML = `
    <div class="post-hero">
      <img class="post-hero-img" src="${heroImg}" alt="${post.cover_alt||post.title}">
      <div class="post-hero-overlay"></div>
      <div class="post-hero-content">
        <span class="post-category">${post.category||'Safari'}</span>
        <h1 class="post-title">${post.title}</h1>
        <div class="post-meta">
          <span class="post-meta-item">${dateStr}</span>
          <div class="post-meta-sep"></div>
          <span class="post-meta-item">${post.read_time||'5 min read'}</span>
          ${post.author ? `<div class="post-meta-sep"></div><span class="post-meta-item">By ${post.author}</span>` : ''}
        </div>
      </div>
    </div>
  `;

  // Render body — supports HTML content from Supabase, or a placeholder
  const bodyContent = post.body_html || post.content_html
    ? `<div>${post.body_html || post.content_html}</div>`
    : `<p class="post-placeholder">Full story coming soon — check back shortly.</p>`;

  document.getElementById('postBody').innerHTML = `<div class="post-body">${bodyContent}</div>`;
}

function renderFallback(slug) {
  // Fallback content map for static HTML files in the blog/ folder
  const fallbacks = {
    'great-migration-guide': {
      title:'The Great Migration: Everything You Need to Know Before You Go',
      category:'Wildlife', date:'March 2025', read_time:'8 min read',
      cover_image_url:'../assets/maasaimara.webp', cover_alt:'The Great Migration',
      body_html:`
        <p>Every year, approximately two million wildebeest, zebra, and gazelle undertake one of the most extraordinary journeys in the natural world — a circular migration across the Serengeti and Maasai Mara that has no beginning and no end.</p>
        <div class="post-divider"></div>
        <h2>When Does It Happen?</h2>
        <p>The migration is year-round, but the drama peaks between <strong>July and October</strong> when the herds cross the Mara River into Kenya. The crocodile-filled crossings are the moments that define this spectacle — raw, chaotic, and utterly unforgettable.</p>
        <blockquote><p>There are moments in the Mara when time stops entirely. A wildebeest standing at the riverbank, the whole herd waiting, the crocodiles patient below. Then, chaos.</p></blockquote>
        <h2>Where to Watch</h2>
        <p>The Maasai Mara National Reserve offers the most concentrated viewing. Private conservancies bordering the Mara — like Mara North and Ol Kinyei — provide exclusive access without the crowds.</p>
        <h2>How to Book</h2>
        <p>The migration is one of the most sought-after experiences in Africa. Camps fill up <em>twelve to eighteen months in advance</em> for peak season. Contact our safari team early to secure your dates.</p>
      `
    },
    'best-time-kenya-safari': {
      title:"When to Go: Kenya's Safari Seasons Decoded",
      category:'Planning', date:'February 2025', read_time:'5 min read',
      cover_image_url:'../assets/amboseli.webp', cover_alt:'Kenya Safari Seasons',
      body_html:`
        <p>Kenya has two primary seasons — dry and green — and both offer remarkable but very different safari experiences. Knowing which one suits you is the first step to crafting a perfect itinerary.</p>
        <div class="post-divider"></div>
        <h2>The Dry Season (June – October)</h2>
        <p>This is <strong>peak season</strong> for a reason. Wildlife congregates around shrinking water sources, making game-viewing easier and more dramatic. The long grass has died back, giving you clear sightlines across the plains. This is also when the Great Migration river crossings happen in the Maasai Mara.</p>
        <h2>The Green Season (November – May)</h2>
        <p>Kenya transforms. The land turns an almost impossibly vivid green. Newborn animals appear across the parks. Bird life explodes — over 1,000 species in Kenya, and a significant proportion are migratory birds present only now. Rates drop. Camps are quieter. <em>For photographers and birders, this is the secret season.</em></p>
        <h2>Our Recommendation</h2>
        <p>If it is your first safari: <strong>July–September</strong>. If you want solitude and don't mind occasional rain: <strong>November–December</strong> or <strong>March–April</strong>.</p>
      `
    },
    'diani-beach-guide': {
      title:"Diani Beach: Africa's Finest Coastline After Your Safari",
      category:'Coast', date:'January 2025', read_time:'6 min read',
      cover_image_url:'../assets/dianibeach.webp', cover_alt:'Diani Beach',
      body_html:`
        <p>There is a particular kind of luxury in stepping off a safari vehicle after ten days of early mornings and red dust, and stepping directly onto the ivory sands of Diani Beach. It is, for many guests, the most perfect ending to a Kenyan journey.</p>
        <div class="post-divider"></div>
        <h2>The Beach</h2>
        <p>Diani stretches for approximately 17 kilometres south of Mombasa along the Indian Ocean coast. The sand is the kind of white that forces you to squint. The water is an improbable turquoise. A reef system just offshore keeps the waves gentle — perfect for swimming year-round.</p>
        <h2>What to Do</h2>
        <ul>
          <li>Snorkelling and diving at the Diani Marine Reserve</li>
          <li>Glass-bottom boat excursions over coral gardens</li>
          <li>Kitesurfing — Diani is one of Africa's best spots</li>
          <li>Colobus Conservation — a rescue centre for the rare Angola colobus monkey</li>
        </ul>
        <h2>Combining Safari and Coast</h2>
        <p>Most of our <em>coastal safari blend</em> packages include a seamless transfer from your final park directly to a Diani beachfront property. No airports, no fuss — just the quiet transition from wild to ocean.</p>
      `
    },
  };
  const fb = fallbacks[slug];
  if (fb) { renderPost(fb); return; }

  // Generic fallback
  document.getElementById('postHero').innerHTML = `
    <div class="post-hero" style="min-height:300px;background:var(--charcoal);display:flex;align-items:center;justify-content:center;">
      <div class="post-hero-content" style="text-align:center;">
        <h1 class="post-title" style="font-size:36px;">Story Loading…</h1>
      </div>
    </div>`;
  document.getElementById('postBody').innerHTML = `<div class="post-body"><p class="post-placeholder">This story is being loaded. Please check back shortly.</p></div>`;
}

async function init() {
  const slug = getSlug();
  if (!slug) { renderFallback('generic'); return; }

  try {
    const { data, error } = await supa
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (!error && data) { renderPost(data); return; }
  } catch(e) {}

  renderFallback(slug);
}

init();


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
  if (!container) return;
  var shown = new Set();
  var DURATION = 5000;
  var BETWEEN_HINTS = 4000;
  var activeHint = null;
  var hints = [
    {
      id: 'journal-hint',
      label: 'Safari Journal',
      text: 'Click "Back to Journal" to explore all our stories and guides.',
      targetId: 'backToJournalBtn',
      pointer: 'up',
      offsetX: 0, offsetY: 34,
      triggerScrollY: 400
    },
    {
      id: 'book-hint',
      label: 'Ready to go?',
      text: 'Inspired? Hit "Book Your Safari" at the bottom of the page to start planning.',
      targetId: 'bookSafariBtn',
      pointer: 'up',
      offsetX: 0, offsetY: 34,
      triggerScrollY: 900
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
  function positionBox(box, hint) {
    if (hint.fixedPos) {
      box.style.position = 'fixed';
      Object.keys(hint.fixedPos).forEach(function(k){ box.style[k] = hint.fixedPos[k] + 'px'; });
      return;
    }
    var rect = getTargetRect(hint);
    if (!rect) return;
    var scrollY = window.pageYOffset, scrollX = window.pageXOffset;
    box.style.position = 'absolute';
    box.style.top = (rect.top + scrollY + (hint.offsetY||0)) + 'px';
    box.style.left = Math.max(8, Math.min(rect.left + scrollX + (hint.offsetX||0), window.innerWidth - 280)) + 'px';
  }
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
    var scrollHandler = function(){ positionBox(box, hint); };
    positionBox(box, hint);
    container.appendChild(box);
    if (!hint.fixedPos) window.addEventListener('scroll', scrollHandler, { passive: true });
    function dismiss() {
      box.classList.add('hiding');
      if (!hint.fixedPos) window.removeEventListener('scroll', scrollHandler);
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
      if (hint.triggerScrollY && scrollY >= hint.triggerScrollY) showHint(hint);
    });
  }
  window.addEventListener('scroll', checkHints, { passive: true });
})();

