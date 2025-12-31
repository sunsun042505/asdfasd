import { getStore } from "@netlify/blobs";

const STORE_NAME = "sunwoo-takbae-v1";

function json(data, status=200){
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function bad(msg, status=400){
  return json({ ok:false, error: msg }, status);
}

export default async function handler(req){
  if(req.method === "OPTIONS") return new Response(null, { status: 204 });

  const url = new URL(req.url);
  const pathname = url.pathname;

  // action is the last path segment (e.g. .../kv/get or .../kv/set)
  const action = pathname.split("/").filter(Boolean).slice(-1)[0];

  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  if(req.method === "GET" && action === "get"){
    const key = url.searchParams.get("key");
    if(!key) return bad("MISSING_KEY");
    const value = await store.get(key, { type: "json" });
    return json({ key, value: value ?? null });
  }

  if(req.method === "POST" && action === "set"){
    let body = null;
    try{
      body = await req.json();
    }catch{
      return bad("INVALID_JSON");
    }
    const key = body?.key;
    if(!key) return bad("MISSING_KEY");
    const value = body?.value ?? null;

    // store JSON safely
    await store.setJSON(key, value);
    return json({ ok:true, key });
  }

  if(req.method === "DELETE"){
    const key = url.searchParams.get("key");
    if(!key) return bad("MISSING_KEY");
    await store.delete(key);
    return json({ ok:true, key });
  }

  return bad("NO_ROUTE", 404);
}
