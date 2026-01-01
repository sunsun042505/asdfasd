/**
 * netlify/functions/data.js (Sunwoo Takbae API) v1.0.6
 *
 * 핵심 수정:
 * - 이전 버전에서 store.set(...)에 객체를 그대로 넣어 "[object Object]"가 저장되는 문제가 있었음.
 * - 이제는 반드시 store.setJSON(...)로만 JSON 저장.
 * - 읽기(store.get type:json)가 깨지면(type: text)로 다시 읽어서 JSON.parse 시도.
 * - RES_KEY가 비어있거나 깨졌으면 레거시 키에서 자동 복구 후 RES_KEY에 "정상 JSON"으로 재저장.
 *
 * 라우트:
 *  GET  /api/ping
 *  GET  /api/kv/get?key=...
 *  POST /api/kv/set   {key,value}
 *  GET  /api/reservations
 *  POST /api/reservations            (upsert)
 *  POST /api/reservations/upsert     (upsert)
 *  GET  /api/reservations/byWaybill/:no
 *  GET  /api/debug/reservations
 */

import { getStore } from "@netlify/blobs";

const STORE_NAME = "sunwoo-takbae-v1";
const RES_KEY    = "DELIVERY_RESERVATIONS_V1";
const LEGACY_KEYS = [
  "DELIVERY_RESERVATIONS_V1",
  "DELIVERY_RESERVATIONS",
  "DELIVERY_RESERVATIONS_V0",
  "DELIVERY_RESERVATIONS_V2",
  "DELIVERY_RESERVATIONS_V3",
  "DELIVERY_RESERVATIONS_V4",
  "RESERVATIONS_V1",
  "RESERVATIONS",
];

const META_KEY_LAST_WRITE = "SUNWOO_LAST_WRITE_V1";

const store = getStore({ name: STORE_NAME, consistency: "strong" });

function nowISO(){ return new Date().toISOString(); }

function jsonResponse(obj, status=200){
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
    }
  });
}

function normNo(v){ return String(v ?? "").trim().replace(/[^0-9]/g, ""); }
function ensureArray(v){ return Array.isArray(v) ? v : []; }
function isProbablyBadString(v){
  return typeof v === "string" && (v.trim() === "[object Object]" || v.trim() === "undefined");
}

async function getText(key){
  try{
    return await store.get(key, { type: "text" });
  }catch{
    return null;
  }
}

async function getJsonSafe(key){
  // 1) preferred json parse
  try{
    const v = await store.get(key, { type: "json" });
    return v ?? null;
  }catch(e){
    // 2) fallback to text then JSON.parse
    const raw = await getText(key);
    if (raw == null) return null;
    if (isProbablyBadString(raw)) return null;
    try{
      return JSON.parse(raw);
    }catch{
      return null;
    }
  }
}

async function setJsonSafe(key, value){
  // ✅ CORRECT WAY: store.setJSON
  await store.setJSON(key, value);
}

function extractCandidates(rec){
  const keys = ["waybillNo","invoiceNo","invoice_no","waybill","wb","reserveNo"];
  const out = [];
  for (const k of keys) if (rec && rec[k]) out.push(normNo(rec[k]));
  return out.filter(Boolean);
}

function findByWaybill(list, wbRaw){
  const wb = normNo(wbRaw);
  if(!wb) return null;
  return list.find(rec => extractCandidates(rec).includes(wb)) || null;
}

function upsertByWaybillOrReserve(list, rec){
  const wb = normNo(rec?.waybillNo || rec?.invoiceNo || rec?.invoice_no || rec?.waybill || rec?.wb);
  const rn = String(rec?.reserveNo ?? "").trim();

  let idx = -1;
  if (wb) idx = list.findIndex(x => extractCandidates(x).includes(wb));
  if (idx === -1 && rn) idx = list.findIndex(x => String(x?.reserveNo ?? "").trim() === rn);

  const merged = {
    ...(idx >= 0 ? list[idx] : {}),
    ...rec,
    waybillNo: wb || (idx >= 0 ? list[idx]?.waybillNo : rec?.waybillNo) || "",
    reserveNo: rn || (idx >= 0 ? list[idx]?.reserveNo : rec?.reserveNo) || "",
    updatedAt: rec?.updatedAt || nowISO(),
  };

  if (idx >= 0) list[idx] = merged;
  else list.push(merged);
  return merged;
}

async function readReservationsWithMigration(){
  const mainVal = await getJsonSafe(RES_KEY);
  const main = ensureArray(mainVal);

  if (main.length > 0) return { list: main, migrated: false, from: RES_KEY };

  // main empty or broken -> migrate
  let merged = [];
  const found = [];

  for (const k of LEGACY_KEYS){
    const v = await getJsonSafe(k);
    const arr = ensureArray(v);
    if (arr.length){
      merged = merged.concat(arr);
      found.push({ key:k, count: arr.length });
    }
  }

  // de-dup
  const uniq = [];
  const seen = new Set();
  for (const rec of merged){
    const wb = normNo(rec?.waybillNo || rec?.invoiceNo || rec?.invoice_no || rec?.waybill || rec?.wb);
    const rn = String(rec?.reserveNo ?? "").trim();
    const id = wb ? `W:${wb}` : (rn ? `R:${rn}` : "");
    if (id && seen.has(id)) continue;
    if (id) seen.add(id);
    uniq.push(rec);
  }

  if (uniq.length){
    await setJsonSafe(RES_KEY, uniq);
    await setJsonSafe(META_KEY_LAST_WRITE, { at: nowISO(), note: "auto-migrated", found, version:"1.0.6" });
    return { list: uniq, migrated: true, from: "legacy", found };
  }

  return { list: [], migrated: false, from: "empty", found: [] };
}

function normalizePath(pathname){
  let path = pathname || "/";
  path = path.replace(/^\/\.netlify\/functions\/data/, "");
  path = path.replace(/^\/api/, "");
  if (!path.startsWith("/")) path = "/" + path;
  return path;
}

export default async (req) => {
  try{
    const url = new URL(req.url);
    const method = req.method.toUpperCase();
    const path = normalizePath(url.pathname);

    if (method === "OPTIONS") return jsonResponse({ ok:true }, 200);

    if (method === "GET" && path === "/ping"){
      return jsonResponse({ ok:true, time: nowISO(), store: STORE_NAME, version:"1.0.6" }, 200);
    }

    // KV get/set (JSON only)
    if (method === "GET" && path === "/kv/get"){
      const key = url.searchParams.get("key") || "";
      if(!key) return jsonResponse({ error:"MISSING_KEY" }, 400);
      const value = await getJsonSafe(key);
      return jsonResponse({ key, value: value ?? null }, 200);
    }

    if (method === "POST" && path === "/kv/set"){
      let body = null;
      try{ body = await req.json(); }catch{ body = null; }
      const key = body?.key;
      const value = body?.value;
      if(!key) return jsonResponse({ error:"MISSING_KEY" }, 400);

      await setJsonSafe(key, value);
      await setJsonSafe(META_KEY_LAST_WRITE, { at: nowISO(), note:`kv-set:${key}`, version:"1.0.6" });

      return jsonResponse({ ok:true, key }, 200);
    }

    // reservations list
    if (method === "GET" && path === "/reservations"){
      const { list } = await readReservationsWithMigration();
      return jsonResponse(list, 200);
    }

    // debug
    if (method === "GET" && path === "/debug/reservations"){
      const main = ensureArray(await getJsonSafe(RES_KEY));
      const legacy = [];
      for (const k of LEGACY_KEYS){
        const v = await getJsonSafe(k);
        const arr = ensureArray(v);
        if (arr.length) legacy.push({ key:k, count: arr.length });
        else{
          const raw = await getText(k);
          if (isProbablyBadString(raw)) legacy.push({ key:k, count:0, note:"bad-string:[object Object]" });
        }
      }
      const meta = await getJsonSafe(META_KEY_LAST_WRITE);
      return jsonResponse({
        store: STORE_NAME,
        version: "1.0.6",
        resKey: RES_KEY,
        mainCount: main.length,
        legacy,
        lastWrite: meta ?? null,
        time: nowISO(),
      }, 200);
    }

    // byWaybill
    const mWB = path.match(/^\/reservations\/byWaybill\/(.+)$/);
    if (method === "GET" && mWB){
      const wb = normNo(decodeURIComponent(mWB[1] || ""));
      const { list } = await readReservationsWithMigration();
      const rec = findByWaybill(list, wb);
      if(!rec) return jsonResponse({ error:"NOT_FOUND", waybillNo: wb }, 404);
      return jsonResponse(rec, 200);
    }

    // upsert
    if (method === "POST" && (path === "/reservations" || path === "/reservations/upsert")){
      let body = null;
      try{ body = await req.json(); }catch{ body = null; }
      const rec = body?.record ?? body;
      if(!rec || typeof rec !== "object") return jsonResponse({ error:"BAD_BODY" }, 400);

      const { list } = await readReservationsWithMigration();
      const merged = upsertByWaybillOrReserve(list, rec);

      await setJsonSafe(RES_KEY, list);
      await setJsonSafe(META_KEY_LAST_WRITE, { at: nowISO(), note:"upsert", waybillNo: merged?.waybillNo || "", version:"1.0.6" });

      return jsonResponse({ ok:true, record: merged, total: list.length }, 200);
    }

    return jsonResponse({ error:"NO_ROUTE", method, path }, 404);
  }catch(e){
    return jsonResponse({ error:"SERVER_ERROR", message: String(e?.message || e) }, 500);
  }
};
