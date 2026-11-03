// Supabase Edge Function: gemini-chat
// Safari concierge chat for the homepage widget (assets/js/gemini-chat.js).
// Calls the Gemini API with the GEMINI_API_KEY secret, so the key never
// reaches the browser. Set it with:
//   supabase secrets set GEMINI_API_KEY=your-key
// Optional: GEMINI_MODEL (defaults to gemini-flash-latest — use a model
// marked "free tier" in Google AI Studio).

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://filmaxjambotours.com",
  "https://www.filmaxjambotours.com",
];

const MAX_MESSAGE_CHARS = 1000;
const MAX_HISTORY_TURNS = 10;
const RATE_LIMIT_PER_MIN = 5;

const SYSTEM_PROMPT = `You are the friendly online safari concierge for Filmax Jambo Tours, a Nairobi-based
company offering private, tailor-made safaris across Kenya and East Africa.

Destinations we cover: Maasai Mara, Amboseli, Samburu, Lake Nakuru, Tsavo East and West,
Mount Kenya, Hell's Gate, Ol Pejeta and Mara North conservancies, Diani Beach and Lamu.
Trip styles: luxury, mid-range and budget; family, honeymoon, solo, group, birding,
photography and aerial safaris; from 2-day escapes near Nairobi to 10-day journeys.
Best timing: July–October for the Great Migration in the Mara; January–March is dry
with fewer crowds, great for Amboseli.

Contact: email hello@filmaxjambotours.com, WhatsApp +34 672 304 384,
Mon–Sat 8am–7pm EAT. All packages: https://filmaxjambotours.com/packages/

Rules:
- Keep answers short (under 120 words), warm and practical. Plain text, no markdown.
- Never invent exact prices, availability or booking confirmations. For quotes or
  bookings, point the visitor to the packages page, enquiry form, email or WhatsApp.
- If asked about something unrelated to travel in Kenya/East Africa, politely steer back.`;

// Best-effort per-IP limiter (per function instance).
const hits = new Map<string, number[]>();
function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => t > now - 60_000);
  if (recent.length >= RATE_LIMIT_PER_MIN) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

function corsFor(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  const CORS = corsFor(origin);
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "Use POST." });
  if (origin && !ALLOWED_ORIGINS.includes(origin)) return json(403, { error: "Origin not allowed." });

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json(501, { error: "Chat is not configured yet." });

  const ip = (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  if (!rateLimitOk(ip)) {
    return json(429, { error: "You're sending messages quickly — please wait a moment." });
  }

  try {
    const body = await req.json();
    const message = String(body.message || "").trim().slice(0, MAX_MESSAGE_CHARS);
    if (!message) return json(400, { error: "Message is empty." });

    const history = Array.isArray(body.history) ? body.history.slice(-MAX_HISTORY_TURNS) : [];
    const contents = history
      .map((t: any) => ({
        role: t?.role === "model" ? "model" : "user",
        parts: [{ text: String(t?.text || "").trim().slice(0, MAX_MESSAGE_CHARS) }],
      }))
      .filter((c: any) => c.parts[0].text);
    contents.push({ role: "user", parts: [{ text: message }] });

    const model = Deno.env.get("GEMINI_MODEL") || "gemini-flash-latest";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
        }),
      },
    );

    if (res.status === 429) {
      return json(429, {
        error: "Our assistant is busy right now — please try again shortly, or message us on WhatsApp.",
      });
    }
    if (!res.ok) {
      console.error("Gemini API error:", res.status, (await res.text()).slice(0, 500));
      return json(502, { error: "The assistant had a problem. Please try again." });
    }

    const data = await res.json();
    const reply = (data?.candidates?.[0]?.content?.parts || [])
      .map((p: any) => p.text || "")
      .join("")
      .trim();

    return json(200, {
      reply: reply ||
        "Sorry, I couldn't answer that. Please email hello@filmaxjambotours.com or reach us on WhatsApp.",
    });
  } catch (err) {
    console.error("gemini-chat error:", err);
    return json(500, { error: "Something went wrong. Please try again." });
  }
});
