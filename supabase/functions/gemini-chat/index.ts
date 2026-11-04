// Supabase Edge Function: gemini-chat
// Premium safari concierge for the site chat widget (assets/js/gemini-chat.js).
//
// Knowledge = the built-in company brief below + LIVE data pulled from this
// Supabase project on each cold start (published packages, their day-by-day
// itineraries, inclusions, lodges, team, journal posts and contact settings),
// refreshed every 10 minutes. Anything edited in the admin dashboard reaches
// the concierge automatically.
//
// Secrets:
//   supabase secrets set GEMINI_API_KEY=your-key
//   (optional) supabase secrets set GEMINI_MODEL=<model id from AI Studio>
// SUPABASE_URL and SUPABASE_ANON_KEY are provided by Supabase automatically.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://filmaxjambotours.com",
  "https://www.filmaxjambotours.com",
];

const MAX_MESSAGE_CHARS = 1000;
const MAX_HISTORY_TURNS = 12;
const RATE_LIMIT_PER_MIN = 6;
const KNOWLEDGE_TTL_MS = 10 * 60 * 1000;

const DEFAULT_CONTACT = {
  whatsapp: "34672304384",
  phone: "+34 672 304 384",
  email: "hello@filmaxjambotours.com",
  office: "Nairobi, Kenya",
  hours: "Mon–Sat, 8am–7pm EAT",
};

// ───────────────────────── Built-in company brief ─────────────────────────
const COMPANY_BRIEF = `
ABOUT FILMAX JAMBO TOURS
- Premium Nairobi-based safari house, established 2025. Private, tailor-made safaris across Kenya and East Africa.
- Founded by guides who grew up tracking lion in the Mara and counting flamingos on Nakuru's shores.
- Promise: "No templates, only journeys" — every itinerary is bespoke; the same safari is never run twice.
- Standard: every detail handled from first enquiry to the flight home; concierge team available 24/7 during trips.
- Stats: 100% private safaris, 16+ curated journeys, 153+ guests hosted, 27 unique destinations, 5-star guest rating.
- Why us: curated journeys (icons plus hidden experiences), local mastery (guides who know the land), effortless luxury.

TEAM
- Filmer Mageto — Founder & Lead Guide; over a decade guiding Kenya's finest reserves.
- Amara Wanjiku — Safari Experience Director; logistics and luxury, from arrival transfers to sunset dinners.
- Githaiga Njoroge — Wildlife Naturalist; born near the Mara, expert on migrations and the Big Five.

DESTINATIONS
Maasai Mara (Kenya's crown jewel, Great Migration), Amboseli (elephants beneath Kilimanjaro), Samburu (rare northern
species: Grevy's zebra, reticulated giraffe, gerenuk, Somali ostrich), Lake Nakuru (flamingos, rhino), Tsavo East & West
(red elephants, vast wilderness), Mount Kenya & Aberdares (highlands, forest), Hell's Gate & Lake Naivasha (cycling,
gorge walks, boat rides), Nairobi National Park & Giraffe Centre, private conservancies (Ol Pejeta, Mara North),
Diani Beach and the Lamu Archipelago (Indian Ocean coast, dhows, UNESCO Old Town), Kakamega Forest (birding).

SAFARI STYLES
Luxury, mid-range and budget tiers; honeymoon, family (Junior Ranger programme), solo, group, birding, photography,
aerial/balloon, beach-and-bush combinations. Trips range from 2-day Nairobi escapes to 10–12 day grand journeys.
Private 4x4 vehicles on every safari; charter flights on premium journeys.

SEASONS & PRICING
- Prices are per person in US dollars and vary by season (peak, high, green/low) and group size (solo, duo, group).
  The website shows them converted into the visitor's local currency.
- July–October: peak season and Great Migration river crossings in the Mara.
- January–March: warm, dry, fewer crowds; superb for Amboseli.
- April–May (long rains) and November (short rains): green season, lush landscapes, lower prices.
- Kenya is excellent for wildlife year-round.

FAQ
- What makes us one of the best safari companies in Kenya: Kenya-based operator specialising in tailor-made, luxury and
  family safaris; itineraries designed by guides with deep local knowledge; hand-picked lodges and camps; attentive personal
  service from enquiry to departure.
- Cost: depends on trip length, number of parks and accommodation level, from short 2-day escapes near Nairobi to grand
  10-day journeys, each with transparent per-person pricing.
- Parks visited: Maasai Mara, Amboseli, Samburu, Lake Nakuru, Tsavo East and West, private conservancies such as Ol Pejeta
  and Mara North, plus Diani Beach and Lamu.
- Safety: Kenya is a well-established safari destination with a mature tourism industry; we work with experienced,
  licensed guides and reputable lodges, and our concierge supports guests before, during and after the trip.

SOCIAL MEDIA & OFFICIAL CHANNELS (all links: https://linktr.ee/filmaxjambotours)
- Instagram: https://www.instagram.com/Filmax_Jambo_Tours — wildlife photography, lodges, guest moments
- TikTok: https://www.tiktok.com/@filmax_jambo_tours — short safari clips, migration and Big Five moments
- YouTube: https://www.youtube.com/@filmaxjambotours — longer safari films and destination guides
- Facebook: https://www.facebook.com/Fimax-Jambo-Tours — news, offers and guest stories
- X: https://x.com/filmax_tours — updates and quick travel tips
- WhatsApp: https://wa.me/34672304384 · Email: hello@filmaxjambotours.com
- Website: https://filmaxjambotours.com

HOW TO BOOK
- Browse all journeys: https://filmaxjambotours.com/packages/
- Each package page has a "Reserve This Journey" option (add ?view=reserve to the package link).
- The homepage "Safari Matchmaker" quiz suggests three matching packages in five questions.
- Bespoke trips, quotes and questions: the enquiry form on the homepage (#contact), email or WhatsApp.

WEBSITE CATALOGUE (fallback list; prices "from", USD per person)
- Nairobi Wild — 2D/1N, budget, from $680: Nairobi National Park, giraffes & elephants, boutique city-edge lodge. /packages/nairobi-wild/
- Hell's Gate Trek — 2D/1N, budget, from $590: cycling the gorge, rappelling, Lake Naivasha boat ride, 2–8 guests. /packages/hells-gate-trek/
- Amboseli Escape — 3D/2N, budget, from $1,950: Kilimanjaro views, private game drives, bush breakfast. /packages/amboseli-express/
- Mara Awakening — 4D/3N, mid, from $2,800: private 4x4 Land Cruiser, luxury tented camp, sundowners. /packages/mara-awakening/
- Samburu Wilderness — 5D/4N, mid, from $3,400: rare northern species, private tented camp, camel safari. /packages/samburu-secrets/
- Lamu Archipelago — 5D/4N, mid, from $4,200: Lamu & Manda, heritage hotel, private dhow, ideal for couples. /packages/lamu-archipelago/
- Migration Witness — 5D/4N, luxury, from $8,900: river crossings, July–October only, private river camp, charter flights. /packages/migration-witness/
- Coastal Safari Blend — 6D/5N, mid, from $4,200: Tsavo East & West plus Diani Beach, snorkelling. /packages/safari-and-sea/
- Birding Kenya — 6D/5N, mid, from $4,800: Nakuru, Kakamega & Mara, 250–400 species, 2–6 guests. /packages/birding-kenya/
- Family Wild — 6D/5N, mid, from $4,100: Nairobi + Maasai Mara, Junior Ranger programme, private vehicle. /packages/family-wild/
- Private Conservancy — 6D/5N, ultra-luxury, from $14,800: full conservancy buyout, exclusive tented villa, butler. /packages/private-conservancy/
- Grand Odyssey — 7D/6N, luxury, from $6,500: Mara + Amboseli + Samburu, charter flights, balloon safari. /packages/grand-odyssey/
- Photography Expedition — 7D/6N, luxury, from $7,400: Mara + Amboseli, pro photo guide, max 4 guests. /packages/photography-expedition/
- Lakes & Highlands — 8D/7N, mid, from $5,100: Nakuru & Naivasha, Aberdares, flamingo boat trip, Mount Kenya foothills. /packages/lake-nakuru-escape/
- Ultimate Kenya — 10D/9N, luxury, from $11,200: five parks, private conservancy, night drives, Diani marine trip. /packages/ultimate-kenya/
- Kenya Mastery — 12D/11N, luxury, from $14,500: six parks & conservancies, helicopter transfer, bush camp, balloon.
Also offered: Aerial Kenya, Family Coast Discovery, Family Mara & Nakuru, Group Kenya Explorer, Group Mara Expedition,
Honeymoon Lamu Escape, Honeymoon Mara & Coast, Solo Mara Soul, Solo Northern Circuit, Tsavo Red Earth.
`;

// ───────────────────────── Live knowledge from Supabase ─────────────────────────
let cache: { at: number; text: string; contact: typeof DEFAULT_CONTACT } | null = null;

async function sb(path: string): Promise<any[]> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !key) return [];
  try {
    const r = await fetch(`${url}/rest/v1/${path}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const clip = (s: unknown, n: number) => {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
};
const money = (v: unknown) => (v ? "$" + Number(v).toLocaleString("en-US") : "");
const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const months = (a: unknown) => (Array.isArray(a) ? a.map((m) => MONTHS[Number(m)] || "").filter(Boolean).join(", ") : "");

async function loadKnowledge() {
  if (cache && Date.now() - cache.at < KNOWLEDGE_TTL_MS) return cache;

  const [pkgs, days, incs, lodges, team, blogs, settings] = await Promise.all([
    sb("packages?is_published=eq.true&select=id,name,slug,tagline,category,tier,transport_type,duration_days,duration_nights,destinations,overview_body,price_peak_season,price_high_season,price_green_season,price_solo,price_duo,price_group,peak_months,high_months,green_months,short_highlights,detail_page_url&order=duration_days.asc"),
    sb("package_days?select=package_id,day_number,title,location&order=day_number.asc&limit=600"),
    sb("package_inclusions?select=package_id,text,included&limit=800"),
    sb("package_lodges?select=package_id,lodge_name,destination,nights&order=sort_order.asc&limit=300"),
    sb("team_members?select=*&limit=20"),
    sb("blogs?is_published=eq.true&select=slug,title,excerpt,category&order=published_date.desc&limit=12"),
    sb("site_settings?select=id,value"),
  ]);

  const contact = { ...DEFAULT_CONTACT };
  for (const row of settings) {
    const v = row?.value || {};
    if (row.id === "concierge") {
      if (v.whatsapp) contact.whatsapp = String(v.whatsapp).replace(/\D/g, "") || contact.whatsapp;
      // Email is fixed to hello@filmaxjambotours.com — settings never override it.
    }
    if (row.id === "business") {
      if (v.phone) contact.phone = v.phone;
      if (v.office) contact.office = v.office;
      if (v.hours) contact.hours = v.hours;
    }
  }

  const by = (rows: any[]) => {
    const m = new Map<string, any[]>();
    for (const r of rows) {
      const k = String(r.package_id);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(r);
    }
    return m;
  };
  const dMap = by(days), iMap = by(incs), lMap = by(lodges);

  const pkgLines = pkgs.map((p) => {
    const id = String(p.id);
    const prices = [
      p.price_peak_season && `peak ${money(p.price_peak_season)}${months(p.peak_months) ? ` (${months(p.peak_months)})` : ""}`,
      p.price_high_season && `high ${money(p.price_high_season)}${months(p.high_months) ? ` (${months(p.high_months)})` : ""}`,
      p.price_green_season && `green ${money(p.price_green_season)}${months(p.green_months) ? ` (${months(p.green_months)})` : ""}`,
      p.price_solo && `solo ${money(p.price_solo)}`,
      p.price_duo && `duo ${money(p.price_duo)}`,
      p.price_group && `group ${money(p.price_group)}`,
    ].filter(Boolean).join("; ");
    const itin = (dMap.get(id) || []).map((d) => `D${d.day_number} ${clip(d.title, 50)}${d.location ? ` @ ${clip(d.location, 30)}` : ""}`).join(" | ");
    const inc = (iMap.get(id) || []).filter((r) => r.included).map((r) => clip(r.text, 50)).slice(0, 10).join(", ");
    const exc = (iMap.get(id) || []).filter((r) => !r.included).map((r) => clip(r.text, 50)).slice(0, 6).join(", ");
    const stay = (lMap.get(id) || []).map((l) => `${clip(l.lodge_name, 40)} (${l.destination || ""}, ${l.nights || 1}N)`).join(", ");
    const link = p.detail_page_url && String(p.detail_page_url).startsWith("/") ? p.detail_page_url : `/packages/${p.slug}/`;
    return [
      `■ ${p.name} — ${p.duration_days || "?"}D/${p.duration_nights || "?"}N, ${p.tier || p.category || ""}${p.transport_type ? `, ${p.transport_type}` : ""}`,
      p.tagline && `  Tagline: ${clip(p.tagline, 140)}`,
      Array.isArray(p.destinations) && p.destinations.length && `  Destinations: ${p.destinations.join(", ")}`,
      prices && `  Prices per person (USD): ${prices}`,
      Array.isArray(p.short_highlights) && p.short_highlights.length && `  Highlights: ${p.short_highlights.join(", ")}`,
      p.overview_body && `  Overview: ${clip(p.overview_body, 320)}`,
      itin && `  Itinerary: ${itin}`,
      stay && `  Stays: ${stay}`,
      inc && `  Included: ${inc}`,
      exc && `  Not included: ${exc}`,
      `  Link: https://filmaxjambotours.com${link}  (reserve: add ?view=reserve)`,
    ].filter(Boolean).join("\n");
  });

  const teamLines = team.map((t) => `- ${t.name || t.full_name || ""} — ${t.role || t.title || ""}${t.bio ? `: ${clip(t.bio, 160)}` : ""}`).filter((l) => l.length > 5);
  const blogLines = blogs.map((b) => `- ${clip(b.title, 100)} (${b.category || "Journal"}): ${clip(b.excerpt, 160)} https://filmaxjambotours.com/journal/${b.slug}/`);

  let text = "";
  if (pkgLines.length) text += `\nLIVE PACKAGE CATALOGUE (authoritative — use these over the fallback list)\n${pkgLines.join("\n")}\n`;
  if (teamLines.length) text += `\nLIVE TEAM\n${teamLines.join("\n")}\n`;
  if (blogLines.length) text += `\nSAFARI JOURNAL ARTICLES\n${blogLines.join("\n")}\n`;

  cache = { at: Date.now(), text, contact };
  return cache;
}

function systemPrompt(live: string, c: typeof DEFAULT_CONTACT) {
  return `You are "Jambo", the private safari concierge of Filmax Jambo Tours, chatting on filmaxjambotours.com.

VOICE
- Warm, polished and knowledgeable, like a five-star lodge concierge. Understated confidence, never pushy.
- Be concise: usually 2–4 short sentences, at most ~110 words. Use short "• " bullets only when listing options.
- Plain text only. No markdown headers, bold, asterisks or tables.
- Reply in the visitor's language.
- Ask one thoughtful question when it helps (dates, group size, interests, budget) to guide them to the right journey.

FACTS
- Use only the knowledge below. Quote package prices as "from $X per person" in USD and mention prices vary by season and
  group size. Never invent prices, availability, discounts, lodge names or confirmations.
- If unsure, say a specialist will confirm and offer WhatsApp.
- When recommending a package, give its name and its link.
- Off-topic requests: answer briefly if harmless, then steer back to travel in Kenya/East Africa.

PROMOTE OUR SOCIAL MEDIA (important)
- Our social pages are where travellers see real safaris before booking. Invite people to follow us warmly and often:
  after a greeting, when someone is still exploring or undecided, after describing a destination/animal/season
  ("see it on our TikTok/Instagram"), when they say thanks or goodbye, and whenever they ask about photos, videos,
  reviews or social media.
- Name the best-fitting platform with its link (TikTok/Instagram for short clips, YouTube for films).
- Keep it natural: one short line, never more than once every two replies, and never instead of answering the question.
- When you invite them to follow us, end your reply with the token [[SOCIALS]] on its own line; the website shows
  all our social buttons. Don't use it in the same reply as [[WHATSAPP]].

WHATSAPP HANDOFF
- When the visitor asks for WhatsApp, a human, a call, a quote, availability, to book/reserve, or to customise a trip,
  end your reply with the exact token [[WHATSAPP]] on its own line. The website turns it into a WhatsApp button.
- Don't write the WhatsApp link yourself when you use the token.

CONTACT
WhatsApp/phone: ${c.phone} (wa.me/${c.whatsapp}) · Email: ${c.email} · Office: ${c.office} · Hours: ${c.hours}

${COMPANY_BRIEF}
${live}`;
}

// ───────────────────────── Request handling ─────────────────────────
const hits = new Map<string, number[]>();
function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => t > now - 60_000);
  const ok = recent.length < RATE_LIMIT_PER_MIN;
  if (ok) recent.push(now);
  hits.set(ip, recent);
  return ok;
}

const SOCIAL_INTENT = /\b(social|instagram|insta|tiktok|tik tok|youtube|facebook|twitter|x\.com|follow|videos?|photos?|reels?|linktree)\b/i;
const WA_INTENT = /\b(whats\s?app|wa\.me|human|real person|agent|call me|speak to|talk to|book(ing)?|reserve|reservation|quote|availability|available)\b/i;

function waUrl(num: string, text: string) {
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  const CORS = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return json(403, { error: "origin_not_allowed" });

  const knowledge = await loadKnowledge();
  const c = knowledge.contact;
  const contact = { whatsapp: c.whatsapp, phone: c.phone, email: c.email };

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json(503, { error: "not_configured", contact });

  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  if (!rateLimitOk(ip)) return json(429, { error: "rate_limited", contact });

  try {
    let body: any = {};
    try { body = await req.json(); } catch { return json(400, { error: "bad_json", contact }); }
    const message = String(body.message || "").trim().slice(0, MAX_MESSAGE_CHARS);
    if (!message) return json(400, { error: "empty", contact });

    const history = Array.isArray(body.history) ? body.history.slice(-MAX_HISTORY_TURNS) : [];
    const contents = history
      .map((t: any) => ({
        role: t?.role === "model" ? "model" : "user",
        parts: [{ text: String(t?.text || "").trim().slice(0, MAX_MESSAGE_CHARS) }],
      }))
      .filter((m: any) => m.parts[0].text);
    contents.push({ role: "user", parts: [{ text: message }] });

    // Try the configured model first, then lighter fallbacks. Free-tier models are often
    // briefly overloaded (503) or slow, so each attempt gets a short timeout and the
    // whole request stays within ~40s.
    const models = [
      ...(Deno.env.get("GEMINI_MODEL") || "").split(",").map((m) => m.trim()).filter(Boolean),
      "gemini-flash-latest",
      "gemini-flash-lite-latest",
    ].filter((m, i, a) => a.indexOf(m) === i);

    const sys = systemPrompt(knowledge.text, c);
    const started = Date.now();
    let data: any = null;
    let lastStatus = 0;

    attempts:
    for (const model of models) {
      // First try with "thinking" switched off (much faster); if this model rejects that
      // option (400), retry the same model without it.
      for (const fast of [true, false]) {
        const remaining = 40000 - (Date.now() - started);
        if (remaining < 4000) break attempts;
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: sys }] },
                contents,
                generationConfig: {
                  temperature: 0.6,
                  maxOutputTokens: 600,
                  ...(fast ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
                },
              }),
              signal: AbortSignal.timeout(Math.min(18000, remaining)),
            },
          );
          lastStatus = res.status;
          if (res.ok) { data = await res.json(); break attempts; }
          const errText = (await res.text()).slice(0, 400);
          console.error(`Gemini ${model} (${fast ? "fast" : "std"}) HTTP ${res.status}:`, errText);
          if (res.status === 400 && fast) continue;   // option not supported → retry without it
          if (res.status === 401 || res.status === 403) break attempts; // key problem; fallbacks won't help
          break; // 404/429/500/503 → next model
        } catch (err) {
          lastStatus = 504;
          console.error(`Gemini ${model} attempt failed:`, String(err));
          break; // timeout/network → next model
        }
      }
    }

    if (!data) {
      if ([429, 500, 503, 504].includes(lastStatus)) return json(503, { error: "busy", status: lastStatus, contact });
      return json(502, { error: "upstream_failed", status: lastStatus, contact });
    }

    let reply = (data?.candidates?.[0]?.content?.parts || [])
      .map((p: any) => p.text || "")
      .join("")
      .trim();

    const wantsWa = /\[\[WHATSAPP\]\]/.test(reply) || WA_INTENT.test(message);
    const wantsSocials = !wantsWa && (/\[\[SOCIALS\]\]/.test(reply) || SOCIAL_INTENT.test(message));
    reply = reply.replace(/\[\[(WHATSAPP|SOCIALS)\]\]/g, "").replace(/\*\*/g, "").trim();
    if (!reply) return json(502, { error: "empty_reply", contact });

    const actions = wantsSocials
      ? [{ type: "socials" }]
      : wantsWa
      ? [{
        type: "whatsapp",
        label: "Continue on WhatsApp",
        url: waUrl(c.whatsapp, `Hello Filmax Jambo Tours, I was chatting with your concierge on the website. ${message}`.slice(0, 500)),
      }]
      : [];

    return json(200, { reply, actions, contact });
  } catch (err) {
    console.error("gemini-chat error:", err);
    return json(500, { error: "server_error", contact });
  }
});
