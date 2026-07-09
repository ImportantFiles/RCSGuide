// ============================================================
// Ask Jhezel — Cloudflare Worker (Groq proxy)
// FREE setup, no login needed for users.
//
// DEPLOY STEPS (kung wala ka pang existing Worker):
// 1. dash.cloudflare.com > Workers & Pages > Create Worker
// 2. Paste this code, then Deploy
// 3. Settings > Variables > Add secret: GROQ_API_KEY
//    (get free key at console.groq.com)
// 4. Copy the Worker URL (xxxx.workers.dev) and paste it as
//    WORKER_URL in index.html / ask-jhezel-widget-final.html
// ============================================================

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*", // or "https://importantfiles.github.io"
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }
    if (request.method !== "POST") {
      return new Response("POST only", { status: 405, headers: cors });
    }

    try {
      const body = await request.json();
      const messages = body.messages || [];
      const model = body.model || "llama-3.3-70b-versatile";

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + env.GROQ_API_KEY
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.6,
          max_tokens: 1024
        })
      });

      const data = await groqRes.text();
      return new Response(data, {
        status: groqRes.status,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }
  }
};
