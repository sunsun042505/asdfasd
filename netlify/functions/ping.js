export default async function handler() {
  return new Response(JSON.stringify({ ok: true, ts: new Date().toISOString() }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
