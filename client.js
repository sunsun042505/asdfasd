export const $ = (id)=>document.getElementById(id);
export const digitsOnly = (s)=>String(s||"").replace(/\D/g,"");

export function pad2(n){return String(n).padStart(2,"0")}
export function startClock(el){
  if(!el) return;
  const tick=()=>{
    const d=new Date();
    el.textContent=`${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  };
  tick();
  setInterval(tick, 500);
}

export async function apiGet(path){
  const r = await fetch(path, {cache:"no-store"});
  const t = await r.text();
  let o; try{o=JSON.parse(t)}catch{ o={raw:t} }
  if(!r.ok) throw new Error(o?.error || ("HTTP_"+r.status));
  return o;
}
export async function apiPost(path, body){
  const r = await fetch(path, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(body),
    cache:"no-store"
  });
  const t = await r.text();
  let o; try{o=JSON.parse(t)}catch{ o={raw:t} }
  if(!r.ok) throw new Error(o?.error || ("HTTP_"+r.status));
  return o;
}

export function make12(){
  let s=""; for(let i=0;i<12;i++) s+=Math.floor(Math.random()*10);
  return s;
}
export function prefixByType(t){
  return ({DOMESTIC:"81",INTERNATIONAL:"23",ECONOMY_CVS:"30",RETURN:"37"})[t]||"81";
}
export function make18(prefix2){
  let s=String(prefix2);
  while(s.length<18) s += Math.floor(Math.random()*10);
  return s.slice(0,18);
}
export function typeLabel(t){ return ({DOMESTIC:"국내택배",INTERNATIONAL:"국제택배",ECONOMY_CVS:"반값택배",RETURN:"반품택배"})[t]||t||"-"; }
export function carrierLabel(t){
  if(t==="ECONOMY_CVS") return "선우네트웍스";
  if(t==="INTERNATIONAL") return "네버랩인터내셔널에어포트(주)(인천국제공항)";
  return "선우택배";
}
