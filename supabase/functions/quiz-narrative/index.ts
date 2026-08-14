// Supabase Edge Function: quiz-narrative
// Writes a short, personalized safari-matching narrative using Claude,
// grounded in the person's actual quiz answers and their top 3 matched
// packages. Falls back safely — if ANTHROPIC_API_KEY isn't set or the
// call fails, returns a non-200 status and the client keeps its
// existing generic text with zero visible disruption.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "not_configured" }), {
        status: 501,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const name = (body.name || "Explorer").toString().slice(0, 60);
    const answers = body.answers || {};
    const pkgs = Array.isArray(body.packages) ? body.packages.slice(0, 3) : [];

    if (!pkgs.length) {
      return new Response(JSON.stringify({ error: "no_packages" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const vibe = Array.isArray(answers.vibe) ? answers.vibe.join(", ") : "unspecified";
    const duration = answers.duration || "unspecified";
    const budget = answers.budget || "unspecified";

    const pkgList = pkgs
      .map((p: any, i: number) => `${i + 1}. ${p.name} — ${p.duration}, ${p.tier} tier, ${p.price}`)
      .join("\n");

    const prompt = `You are writing a short, warm, editorial-style safari-matching note for a luxury Kenya safari company called Filmax Jambo Tours. A visitor named ${name} just completed a 5-question quiz.

Their answers:
- Preferred travel vibe/style: ${vibe}
- Trip length preference: ${duration}
- Budget tier: ${budget}

Based on this, our system matched these 3 real packages (in order of fit):
${pkgList}

Write exactly 2 sentences (no more) introducing these matches to ${name}. Reference their actual preferences naturally, not as a list. Sound like a knowledgeable safari specialist, not a marketing bot — warm, specific, understated confidence. Do not invent facts about the packages beyond what's given above. Do not use exclamation marks. Output only the 2 sentences, nothing else.`;

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error("Anthropic API error:", claudeRes.status, errText);
      return new Response(JSON.stringify({ error: "upstream_failed" }), {
        status: 502,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const data = await claudeRes.json();
    const narrative = (data.content || [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join(" ")
      .trim();

    if (!narrative) {
      return new Response(JSON.stringify({ error: "empty_response" }), {
        status: 502,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ narrative }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("quiz-narrative error:", e);
    return new Response(JSON.stringify({ error: "internal" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
