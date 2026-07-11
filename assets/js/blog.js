
const SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h886_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
const supa = supabase.createClient(SUPA_URL, SUPA_KEY);

const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; cursor.style.left=mx+'px'; cursor.style.top=my+'px'; });
function animateRing(){ rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(animateRing); }
animateRing();


const fallbackBlogs = [
  { slug:'great-migration-guide', title:'The Great Migration: Everything You Need to Know Before You Go', excerpt:'Two million wildebeest. One river. An annual crossing that redefines what it means to witness nature at full force.', category:'Wildlife', date:'March 2025', read_time:'8 min read', cover_image:'/assets/maasaimara.webp' },
  { slug:'best-time-kenya-safari', title:"When to Go: Kenya's Safari Seasons Decoded", excerpt:'Peak, shoulder, green — each season unlocks a different Kenya. Here is how to choose yours.', category:'Planning', date:'February 2025', read_time:'5 min read', cover_image:'/assets/amboseli.webp' },
  { slug:'diani-beach-guide', title:"Diani Beach: Africa's Finest Coastline After Your Safari", excerpt:'Where the bush ends and the ocean begins. Why Diani is the perfect safari finale for every traveller.', category:'Coast', date:'January 2025', read_time:'6 min read', cover_image:'/assets/dianibeach.webp' },
  { slug:'amboseli-elephants', title:'Amboseli at Dawn: Elephants, Kilimanjaro, and Perfect Silence', excerpt:"Africa's most iconic photograph is not taken — it is lived, early morning, in Amboseli.", category:'Wildlife', date:'April 2025', read_time:'6 min read', cover_image:'/assets/amboseli.webp' },
  { slug:'maasai-culture', title:'The Maasai: Warriors, Guardians, and Storytellers of the Plains', excerpt:'A culture unchanged by centuries. What happens when the wild invites you in.', category:'Culture', date:'May 2025', read_time:'7 min read', cover_image:'/assets/maasaimen.webp' },
  { slug:'luxury-lodges-kenya', title:"The Art of Sleeping in the Wild: Kenya's Best Luxury Camps", excerpt:'Canvas walls, starlit ceilings, and a lion coughing somewhere in the darkness.', category:'Luxury', date:'June 2025', read_time:'5 min read', cover_image:'/assets/jwmarriott.webp' },
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
        cover_image: b.cover_image_url||'/assets/maasaimara.webp',
        cover_alt: b.cover_alt||b.title,
      }));
      const slugSet = new Set(supaBlogs.map(b=>b.slug));
      allBlogs = [...supaBlogs, ...fallbackBlogs.filter(b=>!slugSet.has(b.slug))];
    }
  } catch(e) {}
  renderGrid();
}

function buildCard(blog) {
  const page = blog.slug.startsWith('http') ? blog.slug : `/journal/${blog.slug}/`;
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
  var BETWEEN_HINTS = 4000;
  var activeHint = null;

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
