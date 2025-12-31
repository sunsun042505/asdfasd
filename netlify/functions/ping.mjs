import { getStore } from "@netlify/blobs";

function json(data, status=200){
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export default async function handler(req){
  // Simple healthcheck for your Functions + Blobs
  if(req.method === "OPTIONS") return new Response(null, { status: 204 });
  try{
    // Create store (site-wide, shared across deploys)
    const store = getStore({ name: "sunwoo-takbae-v1", consistency: "strong" });
    // Touch a harmless read to ensure environment ok
    await store.get("__ping__", { type: "text" });
    return json({ ok: true, ts: Date.now() });
  }catch(e){
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
}
