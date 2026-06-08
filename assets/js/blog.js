
const SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
const supa = supabase.createClient(SUPA_URL, SUPA_KEY);

const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; cursor.style.left=mx+'px'; cursor.style.top=my+'px'; });
function animateRing(){ rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(animateRing); }
animateRing();

// ── AUTH GATE ─────────────────────────────────────────────────────
// Check session. If not signed in, show paywall overlay instead of blogs.
let _blogCurrentUser = null;
(async function checkBlogAuth() {
  try {
    const { data } = await supa.auth.getSession();
    _blogCurrentUser = data?.session?.user || null;
  } catch(e) { _blogCurrentUser = null; }
  if (!_blogCurrentUser) {
    showBlogAuthGate();
  }
})();

supa.auth.onAuthStateChange((event, session) => {
  _blogCurrentUser = session?.user || null;
  if (_blogCurrentUser) {
    // User just signed in — remove gate and load blogs
    const gate = document.getElementById('blogAuthGate');
    if (gate) gate.remove();
    loadBlogs();
  }
});

function showBlogAuthGate() {
  // Blur/hide the masonry grid
  const masonry = document.getElementById('blogMasonry');
  if (masonry) {
    masonry.innerHTML = `
      <div class="blog-empty"><p>Sign in to read our safari stories.</p></div>
      <div class="blog-empty" style="display:none"></div>
      <div class="blog-empty" style="display:none"></div>
    `;
    masonry.style.filter = 'blur(6px)';
    masonry.style.pointerEvents = 'none';
    masonry.style.userSelect = 'none';
  }

  // Inject gate overlay
  const gateHTML = `
  <div id="blogAuthGate" style="
    position: fixed; inset: 0; z-index: 99980;
    display: flex; align-items: center; justify-content: center;
    background: rgba(4,4,4,0.88);
    backdrop-filter: blur(22px);
    padding: 24px;
  ">
    <div style="
      background: #0a0a0a;
      border: 1px solid rgba(212,175,55,0.28);
      max-width: 480px; width: 100%;
      padding: 0;
      position: relative;
      box-shadow: 0 0 0 1px rgba(212,175,55,0.06), 0 40px 120px rgba(0,0,0,0.98);
      overflow: hidden;
    ">
      <div style="height:2px;background:linear-gradient(to right,transparent,#d4af37 30%,#f0c84a 50%,#d4af37 70%,transparent);"></div>
      <div style="padding:52px 44px 48px;">
        <span style="font-family:'Jost',sans-serif;font-size:8px;letter-spacing:6px;text-transform:uppercase;color:rgba(212,175,55,0.6);display:block;margin-bottom:10px;">Safari Journal</span>
        <h2 style="font-family:'Playfair Display',serif;font-size:clamp(26px,4vw,34px);font-weight:900;line-height:1.1;color:#f0ece4;margin-bottom:10px;">
          Stories from<br><em style="color:#d4af37;font-weight:400;">the Wild</em>
        </h2>
        <p style="font-family:'Cormorant Garamond',serif;font-size:17px;font-style:italic;color:#8a8074;line-height:1.7;margin-bottom:36px;">
          Create a free account or sign in to read our dispatches, guides, and intimate wildlife encounters.
        </p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <button onclick="openBlogAuth('signup')" style="
            flex:1; min-width:160px;
            font-family:'Jost',sans-serif; font-size:10px; font-weight:700;
            letter-spacing:4px; text-transform:uppercase;
            padding:18px 24px;
            background:linear-gradient(135deg,#f0c84a 0%,#d4af37 35%,#b8860b 70%,#c9921a 100%);
            color:#080808; border:none; cursor:pointer;
            box-shadow: 0 2px 0 rgba(255,255,255,0.22) inset, 0 -2px 0 rgba(0,0,0,0.35) inset, 0 8px 28px rgba(212,175,55,0.35);
            transition:transform 0.2s,box-shadow 0.2s,filter 0.2s;
          " onmouseover="this.style.filter='brightness(1.1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.filter='';this.style.transform=''">
            Join Free
          </button>
          <button onclick="openBlogAuth('signin')" style="
            flex:1; min-width:140px;
            font-family:'Jost',sans-serif; font-size:10px; font-weight:600;
            letter-spacing:4px; text-transform:uppercase;
            padding:18px 24px;
            background:transparent; color:#d4af37;
            border:1.5px solid #d4af37; cursor:pointer;
            box-shadow:0 0 14px rgba(212,175,55,0.15);
            transition:background 0.25s,box-shadow 0.25s,transform 0.2s;
          " onmouseover="this.style.background='rgba(212,175,55,0.09)';this.style.boxShadow='0 0 22px rgba(212,175,55,0.3)';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='transparent';this.style.boxShadow='0 0 14px rgba(212,175,55,0.15)';this.style.transform=''">
            Sign In
          </button>
        </div>
        <p style="font-family:'Cormorant Garamond',serif;font-size:13px;font-style:italic;color:rgba(138,128,116,0.6);margin-top:20px;text-align:center;">
          Free to join · No credit card required
        </p>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', gateHTML);
}

// Inline auth for blog page (minimal modal reusing Supabase)
function openBlogAuth(tab) {
  // Build a self-contained lightweight modal for this page
  const existing = document.getElementById('blogAuthModal');
  if (existing) existing.remove();

  const isSignUp = tab === 'signup';
  const modalHTML = `
  <div id="blogAuthModal" style="
    position:fixed;inset:0;z-index:99990;
    background:rgba(2,2,2,0.95);backdrop-filter:blur(28px);
    display:flex;align-items:center;justify-content:center;padding:20px;
  " onclick="if(event.target===this){document.getElementById('blogAuthModal').remove();}">
    <div style="
      background:#0a0a0a;border:1px solid rgba(212,175,55,0.28);
      max-width:500px;width:100%;max-height:90vh;overflow-y:auto;
      position:relative;
      box-shadow:0 0 0 1px rgba(212,175,55,0.06),0 40px 120px rgba(0,0,0,0.98),inset 0 1px 0 rgba(212,175,55,0.1);
      scrollbar-width:thin;scrollbar-color:rgba(212,175,55,0.3) transparent;
    ">
      <div style="height:2px;background:linear-gradient(to right,transparent,#d4af37 30%,#f0c84a 50%,#d4af37 70%,transparent);"></div>
      <button onclick="document.getElementById('blogAuthModal').remove()" style="
        position:absolute;top:14px;right:16px;z-index:5;background:none;
        border:1px solid rgba(212,175,55,0.2);color:rgba(138,128,116,0.8);
        font-family:'Jost',sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;
        padding:8px 16px;cursor:pointer;transition:color 0.3s,border-color 0.3s;
      " onmouseover="this.style.color='#d4af37';this.style.borderColor='#d4af37'" onmouseout="this.style.color='rgba(138,128,116,0.8)';this.style.borderColor='rgba(212,175,55,0.2)'">Close</button>
      <div style="padding:48px 44px 44px;">
        <span style="font-family:'Jost',sans-serif;font-size:8px;letter-spacing:6px;text-transform:uppercase;color:rgba(212,175,55,0.6);display:block;margin-bottom:10px;">Filmax Jambo Tours</span>
        <h2 id="blogModalTitle" style="font-family:'Playfair Display',serif;font-size:30px;font-weight:900;line-height:1.1;color:#f0ece4;margin-bottom:8px;">
          ${isSignUp ? 'Join the<br><em style="color:#d4af37;font-weight:400;">Journey</em>' : 'Welcome<br><em style="color:#d4af37;font-weight:400;">Back</em>'}
        </h2>
        <p style="font-family:'Cormorant Garamond',serif;font-size:16px;font-style:italic;color:#8a8074;margin-bottom:32px;line-height:1.6;">
          ${isSignUp ? 'Create a free account to access all safari stories and guides.' : 'Sign in to read our full journal of stories from the wild.'}
        </p>
        <div style="display:flex;gap:0;margin-bottom:32px;border-bottom:1px solid rgba(212,175,55,0.12);">
          <button id="blogTabSI" onclick="switchBlogTab('signin')" style="font-family:'Jost',sans-serif;font-size:9px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${!isSignUp?'#d4af37':'rgba(138,128,116,0.8)'};background:none;border:none;border-bottom:2px solid ${!isSignUp?'#d4af37':'transparent'};padding:12px 28px 12px 0;cursor:pointer;margin-bottom:-1px;transition:color 0.3s,border-color 0.3s;">Sign In</button>
          <button id="blogTabSU" onclick="switchBlogTab('signup')" style="font-family:'Jost',sans-serif;font-size:9px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:${isSignUp?'#d4af37':'rgba(138,128,116,0.8)'};background:none;border:none;border-bottom:2px solid ${isSignUp?'#d4af37':'transparent'};padding:12px 28px 12px 0;cursor:pointer;margin-bottom:-1px;transition:color 0.3s,border-color 0.3s;">Create Account</button>
        </div>
        <div id="blogAuthErr" style="display:none;background:rgba(224,85,85,0.1);border:1px solid rgba(224,85,85,0.3);color:#e07070;font-family:'Jost',sans-serif;font-size:11px;padding:12px 16px;margin-bottom:16px;"></div>
        <div id="blogAuthOk"  style="display:none;background:rgba(123,181,110,0.1);border:1px solid rgba(123,181,110,0.3);color:#7bb56e;font-family:'Jost',sans-serif;font-size:11px;padding:12px 16px;margin-bottom:16px;text-align:center;"></div>

        <!-- Sign in panel -->
        <div id="blogPanelSI" style="display:${!isSignUp?'block':'none'};">
          <input id="blogSIEmail" type="email" placeholder="EMAIL ADDRESS" autocomplete="email" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,175,55,0.18);color:#f0ece4;font-family:'Jost',sans-serif;font-size:13px;padding:14px 0;margin-bottom:16px;outline:none;" onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor='rgba(212,175,55,0.18)'">
          <input id="blogSIPass"  type="password" placeholder="PASSWORD" autocomplete="current-password" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,175,55,0.18);color:#f0ece4;font-family:'Jost',sans-serif;font-size:13px;padding:14px 0;margin-bottom:24px;outline:none;" onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor='rgba(212,175,55,0.18)'" onkeydown="if(event.key==='Enter')blogSignIn()">
          <button onclick="blogSignIn()" id="blogSIBtn" style="width:100%;font-family:'Jost',sans-serif;font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;padding:20px;background:linear-gradient(135deg,#f0c84a 0%,#d4af37 35%,#b8860b 70%,#c9921a 100%);color:#080808;border:none;cursor:pointer;box-shadow:0 2px 0 rgba(255,255,255,0.22) inset,0 -2px 0 rgba(0,0,0,0.35) inset,0 8px 28px rgba(212,175,55,0.3);transition:filter 0.2s,transform 0.2s;" onmouseover="this.style.filter='brightness(1.1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.filter='';this.style.transform=''">Sign In to Read</button>
          <p style="text-align:center;margin-top:18px;font-family:'Jost',sans-serif;font-size:11px;color:rgba(138,128,116,0.7);">No account? <button onclick="switchBlogTab('signup')" style="background:none;border:none;color:#d4af37;font-family:'Jost',sans-serif;font-size:11px;cursor:pointer;text-decoration:underline;padding:0;">Create one free</button></p>
        </div>

        <!-- Sign up panel -->
        <div id="blogPanelSU" style="display:${isSignUp?'block':'none'};">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 20px;">
            <input id="blogSUFirst" type="text" placeholder="FIRST NAME" autocomplete="given-name" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,175,55,0.18);color:#f0ece4;font-family:'Jost',sans-serif;font-size:13px;padding:14px 0;margin-bottom:16px;outline:none;" onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor='rgba(212,175,55,0.18)'">
            <input id="blogSULast"  type="text" placeholder="LAST NAME" autocomplete="family-name" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,175,55,0.18);color:#f0ece4;font-family:'Jost',sans-serif;font-size:13px;padding:14px 0;margin-bottom:16px;outline:none;" onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor='rgba(212,175,55,0.18)'">
          </div>
          <input id="blogSUEmail" type="email" placeholder="EMAIL ADDRESS" autocomplete="email" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,175,55,0.18);color:#f0ece4;font-family:'Jost',sans-serif;font-size:13px;padding:14px 0;margin-bottom:16px;outline:none;" onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor='rgba(212,175,55,0.18)'">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 20px;">
            <input id="blogSUPass"  type="password" placeholder="PASSWORD (MIN 8)" autocomplete="new-password" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,175,55,0.18);color:#f0ece4;font-family:'Jost',sans-serif;font-size:13px;padding:14px 0;margin-bottom:24px;outline:none;" onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor='rgba(212,175,55,0.18)'">
            <input id="blogSUConf"  type="password" placeholder="CONFIRM PASSWORD" autocomplete="new-password" style="width:100%;background:transparent;border:none;border-bottom:1px solid rgba(212,175,55,0.18);color:#f0ece4;font-family:'Jost',sans-serif;font-size:13px;padding:14px 0;margin-bottom:24px;outline:none;" onfocus="this.style.borderBottomColor='#d4af37'" onblur="this.style.borderBottomColor='rgba(212,175,55,0.18)'">
          </div>
          <button onclick="blogSignUp()" id="blogSUBtn" style="width:100%;font-family:'Jost',sans-serif;font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;padding:20px;background:linear-gradient(135deg,#f0c84a 0%,#d4af37 35%,#b8860b 70%,#c9921a 100%);color:#080808;border:none;cursor:pointer;box-shadow:0 2px 0 rgba(255,255,255,0.22) inset,0 -2px 0 rgba(0,0,0,0.35) inset,0 8px 28px rgba(212,175,55,0.3);transition:filter 0.2s,transform 0.2s;" onmouseover="this.style.filter='brightness(1.1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.filter='';this.style.transform=''">Create Free Account</button>
          <p style="text-align:center;margin-top:18px;font-family:'Jost',sans-serif;font-size:11px;color:rgba(138,128,116,0.7);">Already have an account? <button onclick="switchBlogTab('signin')" style="background:none;border:none;color:#d4af37;font-family:'Jost',sans-serif;font-size:11px;cursor:pointer;text-decoration:underline;padding:0;">Sign in</button></p>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function switchBlogTab(tab) {
  const si = document.getElementById('blogPanelSI');
  const su = document.getElementById('blogPanelSU');
  const tSI = document.getElementById('blogTabSI');
  const tSU = document.getElementById('blogTabSU');
  const title = document.getElementById('blogModalTitle');
  if (!si || !su) return;
  const gold = '#d4af37', dim = 'rgba(138,128,116,0.8)';
  if (tab === 'signin') {
    si.style.display = 'block'; su.style.display = 'none';
    if (tSI) { tSI.style.color = gold; tSI.style.borderBottomColor = gold; }
    if (tSU) { tSU.style.color = dim;  tSU.style.borderBottomColor = 'transparent'; }
    if (title) title.innerHTML = 'Welcome<br><em style="color:#d4af37;font-weight:400;">Back</em>';
  } else {
    si.style.display = 'none'; su.style.display = 'block';
    if (tSU) { tSU.style.color = gold; tSU.style.borderBottomColor = gold; }
    if (tSI) { tSI.style.color = dim;  tSI.style.borderBottomColor = 'transparent'; }
    if (title) title.innerHTML = 'Join the<br><em style="color:#d4af37;font-weight:400;">Journey</em>';
  }
  document.getElementById('blogAuthErr').style.display = 'none';
  document.getElementById('blogAuthOk').style.display = 'none';
}

async function blogSignIn() {
  const email = document.getElementById('blogSIEmail')?.value.trim();
  const pass  = document.getElementById('blogSIPass')?.value;
  const err   = document.getElementById('blogAuthErr');
  const ok    = document.getElementById('blogAuthOk');
  const btn   = document.getElementById('blogSIBtn');
  if (!email || !pass) { if(err){err.textContent='Please enter your email and password.';err.style.display='block';} return; }
  if(btn) btn.textContent = 'Signing in…';
  try {
    const { data, error } = await supa.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    if (ok) { ok.textContent = 'Signed in! Loading stories…'; ok.style.display = 'block'; }
    if (err) err.style.display = 'none';
    setTimeout(() => { document.getElementById('blogAuthModal')?.remove(); document.getElementById('blogAuthGate')?.remove(); loadBlogs(); const masonry = document.getElementById('blogMasonry'); if(masonry){masonry.style.filter='';masonry.style.pointerEvents='';} }, 1000);
  } catch(e) {
    if (err) { err.textContent = e.message || 'Sign in failed.'; err.style.display = 'block'; }
    if (ok) ok.style.display = 'none';
  }
  if(btn) btn.textContent = 'Sign In to Read';
}

async function blogSignUp() {
  const firstName = document.getElementById('blogSUFirst')?.value.trim();
  const lastName  = document.getElementById('blogSULast')?.value.trim();
  const email     = document.getElementById('blogSUEmail')?.value.trim();
  const pass      = document.getElementById('blogSUPass')?.value;
  const conf      = document.getElementById('blogSUConf')?.value;
  const err       = document.getElementById('blogAuthErr');
  const ok        = document.getElementById('blogAuthOk');
  const btn       = document.getElementById('blogSUBtn');
  if (!firstName || !lastName) { if(err){err.textContent='Please enter your first and last name.';err.style.display='block';} return; }
  if (!email) { if(err){err.textContent='Please enter your email.';err.style.display='block';} return; }
  if (!pass || pass.length < 8) { if(err){err.textContent='Password must be at least 8 characters.';err.style.display='block';} return; }
  if (pass !== conf) { if(err){err.textContent='Passwords do not match.';err.style.display='block';} return; }
  if(btn) btn.textContent = 'Creating account…';
  try {
    const { data, error } = await supa.auth.signUp({
      email, password: pass,
      options: { data: { first_name: firstName, last_name: lastName } }
    });
    if (error) throw error;
    if (data?.user?.identities?.length === 0) {
      if (err) { err.textContent = 'Account already exists. Please sign in.'; err.style.display = 'block'; }
    } else {
      if (ok) { ok.textContent = 'Account created! Check your email to confirm, then sign in.'; ok.style.display = 'block'; }
      if (err) err.style.display = 'none';
    }
  } catch(e) {
    if (err) { err.textContent = e.message || 'Registration failed.'; err.style.display = 'block'; }
  }
  if(btn) btn.textContent = 'Create Free Account';
}
// ── END AUTH GATE ──────────────────────────────────────────────────

const fallbackBlogs = [
  { slug:'great-migration-guide', title:'The Great Migration: Everything You Need to Know Before You Go', excerpt:'Two million wildebeest. One river. An annual crossing that redefines what it means to witness nature at full force.', category:'Wildlife', date:'March 2025', read_time:'8 min read', cover_image:'assets/maasaimara.webp' },
  { slug:'best-time-kenya-safari', title:"When to Go: Kenya's Safari Seasons Decoded", excerpt:'Peak, shoulder, green — each season unlocks a different Kenya. Here is how to choose yours.', category:'Planning', date:'February 2025', read_time:'5 min read', cover_image:'assets/amboseli.webp' },
  { slug:'diani-beach-guide', title:"Diani Beach: Africa's Finest Coastline After Your Safari", excerpt:'Where the bush ends and the ocean begins. Why Diani is the perfect safari finale for every traveller.', category:'Coast', date:'January 2025', read_time:'6 min read', cover_image:'assets/dianibeach.webp' },
  { slug:'amboseli-elephants', title:'Amboseli at Dawn: Elephants, Kilimanjaro, and Perfect Silence', excerpt:"Africa's most iconic photograph is not taken — it is lived, early morning, in Amboseli.", category:'Wildlife', date:'April 2025', read_time:'6 min read', cover_image:'assets/amboseli.webp' },
  { slug:'maasai-culture', title:'The Maasai: Warriors, Guardians, and Storytellers of the Plains', excerpt:'A culture unchanged by centuries. What happens when the wild invites you in.', category:'Culture', date:'May 2025', read_time:'7 min read', cover_image:'assets/maasaimen.webp' },
  { slug:'luxury-lodges-kenya', title:"The Art of Sleeping in the Wild: Kenya's Best Luxury Camps", excerpt:'Canvas walls, starlit ceilings, and a lion coughing somewhere in the darkness.', category:'Luxury', date:'June 2025', read_time:'5 min read', cover_image:'assets/jwmarriott.webp' },
];

let allBlogs = [...fallbackBlogs];
let activeFilter = 'all';

async function loadBlogs() {
  try {
    const { data, error } = await supa
      .from('blogs')
      .select('slug,title,excerpt,category,published_date,read_time,cover_image_url,cover_alt,is_published')
      .eq('is_published', true)
      .order('published_date', { ascending: false });

    if (!error && data?.length) {
      const supaBlogs = data.map(b => ({
        slug: b.slug, title: b.title, excerpt: b.excerpt||'',
        category: b.category||'Safari',
        date: b.published_date ? new Date(b.published_date).toLocaleDateString('en-US',{month:'long',year:'numeric'}) : '',
        read_time: b.read_time||'5 min read',
        cover_image: b.cover_image_url||'assets/maasaimara.webp',
        cover_alt: b.cover_alt||b.title,
      }));
      const slugSet = new Set(supaBlogs.map(b=>b.slug));
      allBlogs = [...supaBlogs, ...fallbackBlogs.filter(b=>!slugSet.has(b.slug))];
    }
  } catch(e) {}
  renderGrid();
}

function buildCard(blog) {
  const page = blog.slug.startsWith('http') ? blog.slug : `blog/${blog.slug}.html`;
  return `<a href="${page}" class="blog-post-card reveal">
    <div class="blog-post-card-img-wrap">
      <img class="blog-post-card-img" src="${blog.cover_image}" alt="${blog.cover_alt||blog.title}" loading="lazy">
      <div class="blog-post-card-overlay"></div>
      <span class="blog-post-card-category">${blog.category}</span>
    </div>
    <div class="blog-post-card-body">
      <div class="blog-post-card-meta">
        <span class="blog-post-card-date">${blog.date}</span>
        <span class="blog-post-card-read">${blog.read_time}</span>
      </div>
      <h2 class="blog-post-card-title">${blog.title}</h2>
      <p class="blog-post-card-excerpt">${blog.excerpt}</p>
      <span class="blog-post-card-cta">Read the story</span>
    </div>
  </a>`;
}

function renderGrid() {
  const grid = document.getElementById('blogMasonry');
  const filtered = activeFilter === 'all' ? allBlogs : allBlogs.filter(b => b.category === activeFilter);
  if (!filtered.length) {
    grid.innerHTML = '<div class="blog-empty"><p>No stories in this category yet. Check back soon.</p></div>';
    return;
  }
  grid.innerHTML = filtered.map(buildCard).join('');
  // Re-run reveal observer
  grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  // Cursor effects
  grid.querySelectorAll('.blog-post-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.width='20px'; cursor.style.height='20px'; ring.style.width='60px'; ring.style.height='60px'; });
    el.addEventListener('mouseleave', () => { cursor.style.width='12px'; cursor.style.height='12px'; ring.style.width='40px'; ring.style.height='40px'; });
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('.blog-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!_blogCurrentUser) { openBlogAuth('signin'); return; }
    document.querySelectorAll('.blog-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderGrid();
  });
});

// Only load blogs if already authenticated (checkBlogAuth runs first)
if (_blogCurrentUser) loadBlogs();


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
      text: 'Filter stories by category — Wildlife, Planning, Coast and more.',
      targetId: 'blogMasonry',
      pointer: 'up',
      offsetX: 0, offsetY: -56,
      triggerElId: 'blogMasonry',
      triggerOffset: window.innerHeight * 0.8
    },
    {
      id: 'whatsapp-hint',
      label: 'Quick action',
      text: 'Tap the WhatsApp button to reach us and plan your safari now.',
      fixedPos: { bottom: 104, right: 100 },
      pointer: 'right',
      triggerScrollY: 600
    }
  ];

  function showHint(hint) {
    if (shown.has(hint.id)) return;
    shown.add(hint.id);
    var box = document.createElement('div');
    box.className = 'site-hint';
    box.innerHTML =
      '<span class="site-hint-label">' + hint.label + '</span>' +
      '<span class="site-hint-text">' + hint.text + '</span>' +
      '<button class="site-hint-close" aria-label="Dismiss">×</button>' +
      '<div class="site-hint-pointer ' + (hint.pointer||'down') + '"></div>' +
      '<div class="site-hint-bar"></div>';

    function positionBox() {
      if (hint.fixedPos) {
        box.style.position = 'fixed';
        if (hint.fixedPos.bottom !== undefined) box.style.bottom = hint.fixedPos.bottom + 'px';
        if (hint.fixedPos.right  !== undefined) box.style.right  = hint.fixedPos.right  + 'px';
        return;
      }
      var el = hint.targetId ? document.getElementById(hint.targetId) : null;
      if (!el) return;
      var rect = el.getBoundingClientRect();
      box.style.position = 'absolute';
      box.style.top  = (rect.top + window.pageYOffset + (hint.offsetY||0)) + 'px';
      box.style.left = Math.max(8, rect.left + window.pageXOffset + (hint.offsetX||0)) + 'px';
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
    box.querySelector('.site-hint-close').addEventListener('click', function(){ clearTimeout(autoTimer); dismiss(); });
  }

  function checkHints() {
    var scrollY = window.pageYOffset;
    hints.forEach(function(hint){
      if (shown.has(hint.id)) return;
      if (hint.triggerScrollY && scrollY >= hint.triggerScrollY) { showHint(hint); return; }
      if (hint.triggerElId) {
        var el = document.getElementById(hint.triggerElId);
        if (!el) return;
        var rect = el.getBoundingClientRect();
        if (rect.top <= (hint.triggerOffset || window.innerHeight * 0.75)) showHint(hint);
      }
    });
  }

  window.addEventListener('scroll', checkHints, { passive: true });
  setTimeout(checkHints, 1500);
})();
