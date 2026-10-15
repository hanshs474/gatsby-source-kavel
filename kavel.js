// Minimal Kavel client: prompt in, { url, watermarked } out.
const crypto = require("crypto");
const BASE_URL = "https://www.kavel.ai";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generate(prompt, { apiKey, aspectRatio = "1:1", timeoutMs = 360000 } = {}) {
  const auth = apiKey ? { authorization: `Bearer ${apiKey}` } : { "x-anon-id": "gatsby-" + crypto.randomBytes(8).toString("hex") };
  const res = await fetch(`${BASE_URL}/api/ai/generate`, {
    method: "POST",
    headers: { "content-type": "application/json", ...auth },
    body: JSON.stringify({ provider: "kie", mediaType: "image", model: "kavel-image-v1", scene: "text-to-image", prompt, options: { aspect_ratio: aspectRatio } }),
  });
  const env = await res.json();
  if (env.code !== 0) throw new Error(env.message || "request refused");
  const d = env.data || {};
  if (d.wall === true) throw new Error(`free allowance spent for now — set an apiKey from ${BASE_URL}/settings/apikeys`);
  if (!d.id) throw new Error("the service returned no task id");
  // Polling is what moves a queued run forward.
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await sleep(5000);
    let q;
    try {
      const r = apiKey
        ? await fetch(`${BASE_URL}/api/ai/query`, { method: "POST", headers: { "content-type": "application/json", ...auth }, body: JSON.stringify({ taskId: d.id }) })
        : await fetch(`${BASE_URL}/api/ai/anon-query?taskId=${encodeURIComponent(d.id)}&provider=kie&mediaType=image`, { headers: auth });
      q = await r.json();
    } catch { continue; }
    if (q.code !== 0) continue;
    const qd = q.data || {};
    if (qd.cleanImages && qd.cleanImages.length) return { url: qd.cleanImages[0], watermarked: false };
    if (qd.images && qd.images.length) return { url: qd.images[0], watermarked: Boolean(qd.watermarked && qd.watermarked[0]) };
    if (qd.status === "failed" || qd.status === "error") throw new Error("prompt refused");
  }
  throw new Error("timed out");
}

module.exports = { generate };
