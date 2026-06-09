# **CLAUDE: Read this entire file before starting any task. This is your memory and rulebook for Filmax Jambo Tours.**

---

## 1. PROJECT OVERVIEW

**Name:** Filmax Jambo Tours  
**Purpose:** Premium Kenyan safari tour booking website offering curated luxury safari experiences  
**Live URL:** https://filmaxjambotours.com  
**GitHub Repo:** https://github.com/githaiga2861/Filmax-Jambo-Tours  
**Hosting:** GitHub Pages (static site)  
**Established:** 2025

---

## 2. TECH STACK

### Core
- **HTML5** - Static pages
- **CSS3** - External stylesheets per page (assets/css/)
- **Vanilla JavaScript** - External scripts per page (assets/js/)

### External Libraries & CDNs
- **Supabase JS v2** - `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- **Google Fonts**:
  - Playfair Display (400, 500, 700, 900, italic)
  - Cormorant Garamond (300, 400, 500, 600)
  - Jost (200, 300, 400, 500, 600, 700, 800)

### Supabase Setup Pattern
```javascript
const SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
```

### APIs & Features
- Supabase Auth (email/password + Google OAuth)
- Supabase Database (profiles, packages, blog_posts, reservations, testimonials, enquiries, categories)
- WhatsApp Business API links
- Google Translate widget

---

## 3. FILE STRUCTURE

```
Filmax-Jambo-Tours/
├── index.html              # Homepage - hero, highlights, packages, testimonials, gallery, blog, quiz, contact
├── packages.html           # All packages listing with advanced filters
├── reserve.html            # Reservation wizard (3-step: details → review → success)
├── blog.html               # Blog/journal listing page
├── blog-template.html      # Dynamic blog post template (loads from Supabase)
├── admin.html              # Admin dashboard for managing packages, blog, members, settings
├── profile.html            # User profile page (embedded in modal iframe)
├── pkg-*.html (16 files)   # Individual package detail pages:
│   ├── pkg-aerial-kenya.html
│   ├── pkg-amboseli-express.html
│   ├── pkg-birding-kenya.html
│   ├── pkg-family-wild.html
│   ├── pkg-grand-odyssey.html
│   ├── pkg-hells-gate-trek.html
│   ├── pkg-lake-nakuru-escape.html
│   ├── pkg-lamu-archipelago.html
│   ├── pkg-mara-awakening.html
│   ├── pkg-migration-witness.html
│   ├── pkg-nairobi-wild.html
│   ├── pkg-photography-expedition.html
│   ├── pkg-private-conservancy.html
│   ├── pkg-safari-and-sea.html
│   ├── pkg-samburu-secrets.html
│   ├── pkg-tsavo-red-earth.html
│   └── pkg-ultimate-kenya.html
├── hints.js                # Site hints system v2.0 - tooltip guide system
├── assets/
│   ├── css/
│   │   ├── index.css       # Main stylesheet (6800+ lines)
│   │   ├── packages.css
│   │   ├── blog.css
│   │   ├── blog-template.css
│   │   ├── admin.css
│   │   └── pkg-*.css       # Per-package stylesheets
│   └── js/
│       ├── index.head.js   # Early-load scripts (theme, loader)
│       ├── index.js        # Homepage functionality
│       ├── packages.js
│       ├── blog.js
│       ├── blog-template.js
│       ├── admin.js
│       └── pkg-*.js        # Per-package scripts
├── favicon.ico
├── CNAME                   # filmaxjambotours.com
└── README.md
```

---

## 4. DESIGN SYSTEM

### CSS Variables (Dark Mode - Default)
```css
:root {
  --black: #080808;
  --deep: #0d0d0d;
  --charcoal: #141414;
  --card: #111111;
  --gold: #d4af37;
  --gold-light: #e8c84a;
  --gold-dim: rgba(212,175,55,0.15);
  --amber: #b8860b;
  --text: #ffffff;
  --muted: #ffffff;
  --border: rgba(212,175,55,0.2);
}
```

### CSS Variables (Light Mode)
```css
body.light-mode {
  --black: #ebebea;
  --deep: #e4e4e2;
  --charcoal: #dcdcda;
  --card: #e4e4e2;
  --gold: #996515;
  --gold-light: #b07a1f;
  --gold-dim: rgba(153,101,21,0.18);
  --amber: #7a5500;
  --text: #0a0a0a;
  --muted: #2a2a2a;
  --border: rgba(0,0,0,0.15);
}
```

### Typography
- **Playfair Display** - Headings, titles, hero text (serif, elegant)
- **Cormorant Garamond** - Body text, quotes, testimonials (serif, italic style)
- **Jost** - UI elements, buttons, labels, navigation (sans-serif, clean)

### Primary Button Style (View All Packages / btn-primary)
```css
.view-all-btn, .btn-primary {
  font-family: 'Jost', sans-serif;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 4px;
  text-transform: uppercase;
  padding: 18px 44px; /* or 18px 52px for view-all-btn */
  background: linear-gradient(135deg, #f0c84a 0%, #d4af37 35%, #b8860b 65%, #c9921a 100%);
  color: #080808;
  border: none;
  cursor: none;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 2px 0 rgba(255,255,255,0.25) inset,
    0 -2px 0 rgba(0,0,0,0.35) inset,
    0 4px 16px rgba(212,175,55,0.4),
    0 1px 3px rgba(0,0,0,0.5);
  transition: transform 0.3s, box-shadow 0.3s, filter 0.3s;
  animation: pulseCTA 3s ease-in-out infinite 2s;
}

/* Hover state */
.btn-primary:hover, .view-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 48px rgba(212,175,55,0.5);
  animation: none;
}

/* Metal shine effect on hover */
.btn-primary::before, .view-all-btn::before {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.08) 70%, transparent 100%);
  transform: skewX(-15deg);
}
```

### Secondary/Ghost Button Style
```css
.btn-ghost, .btn-outline {
  font-family: 'Jost', sans-serif;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 4px;
  text-transform: uppercase;
  padding: 17px 44px;
  background: transparent;
  color: var(--gold);
  border: 1px solid var(--border);
  cursor: none;
  transition: background 0.3s, border-color 0.3s;
}
.btn-ghost:hover {
  background: rgba(212,175,55,0.08);
  border-color: var(--gold);
}
```

---

## 5. COMPLETED WORK LOG

### Recent Commits
1. **d810a63** - Refactor: separate JS and CSS into external files for performance and scalability
2. **aec0840** - Fix site hints: strict one-at-a-time queue with 6s interval and precise positioning
3. **3590566** - Update CNAME
4. **3ebf0cb** - Create CNAME
5. **18a1740** - Enhanced site hints with precise targeting and refined logo loader

### Major Enhancements Completed
- JS/CSS separation for all pages (was inline, now external files)
- Site hints system v2.0 with precise positioning and queue management
- Logo loader refinement
- Dark/light mode theme toggle on all pages
- WhatsApp FAB on all pages
- Custom cursor system
- Auth modal with Google OAuth integration
- Admin dashboard with package/blog management
- Reservation wizard with Supabase integration

---

## 6. STRICT RULES FOR EVERY SESSION

### NEVER DO
- **Never change the existing design, colors, fonts, or layout**
- **Never break dark mode OR light mode** - both must work perfectly
- **Never remove or modify CSS variables**
- **Never change button gradients, shadows, or animations**
- **Never alter the premium visual aesthetic**
- **Never break existing JavaScript functionality**
- **Never remove features that already work**
- **Never change the Supabase configuration pattern**

### ALWAYS DO
- **Preserve the exact gold gradient**: `linear-gradient(135deg, #f0c84a 0%, #d4af37 35%, #b8860b 65%, #c9921a 100%)`
- **All primary CTAs must match View All Packages button style exactly**
- **Test both dark and light modes after any change**
- **Ensure WhatsApp FAB is present on all pages**
- **Ensure theme toggle works on all pages**
- **Run `git push` after completing changes**
- **Keep external CSS/JS file structure (don't inline)**

### Button Consistency Rules
- **Primary buttons** (Book Now, Reserve, View Package, Enquire, Submit, Explore, See More): Gold gradient, dark text, metal shine hover
- **Secondary buttons** (Cancel, Back, Reset, Close): Transparent background, gold border, gold text
- **All buttons**: `cursor: none;` (custom cursor), `font-family: 'Jost', sans-serif`, uppercase, letter-spacing: 4px

---

## 7. SUPABASE CONFIGURATION

### Client Initialization
```javascript
const SUPA_URL = 'https://kwriicxzkgkcseorcqdi.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3cmlpY3h6a2drY3Nlb3JjcWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTk2NzcsImV4cCI6MjA4OTQ5NTY3N30.h186_IAOxXkaW1m9mtFX4zLJRhTN-v9N4EF_yrpAkJo';
const supa = window.supabase.createClient(SUPA_URL, SUPA_KEY);
```

### Tables Found in Codebase
- `profiles` - User profile data
- `packages` - Safari package listings
- `categories` - Package categories
- `blog_posts` - Blog/journal articles
- `reservations` - Booking reservations
- `testimonials` - User reviews
- `enquiries` - Contact form submissions

### Auth Patterns
- `supa.auth.getSession()` - Check current session
- `supa.auth.signInWithPassword()` - Email/password login
- `supa.auth.signUp()` - New user registration
- `supa.auth.signInWithOAuth({ provider: 'google' })` - Google OAuth

---

## 8. PENDING TASKS

- None currently tracked

---

## 9. GIT WORKFLOW

### Repository
- **Remote:** origin → GitHub
- **Main Branch:** main
- **User:** githaiga2861

### Standard Workflow
```bash
git add -A
git commit -m "Description of changes"
git push
```

### After Every Session
Always end with `git push` to deploy changes to GitHub Pages.

---

## 10. CONTACT & BUSINESS INFO

- **WhatsApp:** +34672304384
- **Email:** hello@filmaxjambotours.co.ke
- **Office:** Nairobi, Kenya
- **Hours:** Mon–Sat, 8am–7pm EAT

---

*Last Updated: 2026-06-09*
