import { getStore } from "@netlify/blobs";

const STORE_NAME = "sunwoo-takbae-v1";
const RES_KEY = "DELIVERY_RESERVATIONS_V1";

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
  if(req.method === "OPTIONS") return new Response(null, { status: 204 });

  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  if(req.method === "GET"){
    const arr = await store.get(RES_KEY, { type: "json" });
    return json(Array.isArray(arr) ? arr : []);
  }

  // Optional: allow overwrite for debugging (not used by your UI)
  if(req.method === "POST"){
    const body = await req.json().catch(()=>null);
    const value = body?.value;
    if(!Array.isArray(value)) return json({ ok:false, error:"VALUE_MUST_BE_ARRAY" }, 400);
    await store.setJSON(RES_KEY, value);
    return json({ ok:true, count: value.length });
  }

  return json({ error:"NO_ROUTE" }, 404);
}
