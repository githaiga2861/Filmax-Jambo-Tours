
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

