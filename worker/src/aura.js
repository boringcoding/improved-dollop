// Deterministic aura generation — must match the client (index.html) exactly.

function hashStr(str){
  let h = 2166136261 >>> 0;
  for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const ADJ = ["Electric","Velvet","Lunar","Solar","Cosmic","Wild","Quiet","Molten","Crystal","Ember",
  "Tidal","Feral","Gilded","Neon","Ancient","Radiant","Static","Obsidian","Aurora","Seraph",
  "Phantom","Saffron","Glacial","Verdant","Magnetic","Twilight","Opal","Thunder","Sovereign","Astral"];
const NOUN = ["Phoenix","Tide","Comet","Bloom","Wolf","Mirror","Flame","Oracle","Drift","Halo",
  "Nova","Garden","Storm","Lantern","Serpent","Prism","Echo","Falcon","Current","Spark",
  "Monsoon","Willow","Beacon","Voyager","Ghost","Quartz","Meteor","Lotus","Raven","Dawn"];
const ENERGIES = [
  {k:"Fire",c:"#ff5e7a"},{k:"Water",c:"#3ad0ff"},{k:"Air",c:"#b69bff"},
  {k:"Earth",c:"#5fe39a"},{k:"Aether",c:"#ffd66b"}];
const RARITY = ["1 in a generation","rarer than 99% of souls","rarer than 97% of souls",
  "rarer than 94% of souls","rarer than 88% of souls","beautifully uncommon","one of a kind"];

export function generate(rawName){
  const name = (rawName||"").trim();
  const seedKey = name.toLowerCase().replace(/\s+/g,' ') || "stranger";
  const rnd = mulberry32(hashStr(seedKey));
  const pick = a => a[Math.floor(rnd()*a.length)];

  const auraName = pick(ADJ) + " " + pick(NOUN);
  const baseHue = Math.floor(rnd()*360);
  const h1 = baseHue, h2 = (baseHue+40+Math.floor(rnd()*120))%360, h3 = (baseHue+200+Math.floor(rnd()*100))%360;

  let raw = ENERGIES.map(()=> 0.15 + rnd());
  const sum = raw.reduce((a,b)=>a+b,0);
  let ints = raw.map(v=> Math.round(v/sum*100));
  ints[0] += 100 - ints.reduce((a,b)=>a+b,0);
  const energy = ENERGIES.map((e,i)=>({...e, pct: ints[i]})).sort((a,b)=> b.pct - a.pct);

  const rarity = pick(RARITY);
  const hsl = (h,s,l)=>`hsl(${h} ${s}% ${l}%)`;
  const toRgb = (h,s,l)=>{
    h/=360;s/=100;l/=100;
    const k=n=>(n+h*12)%12, a=s*Math.min(l,1-l);
    const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
    return [Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255)];
  };
  return {
    name, auraName, rarity,
    h1,h2,h3,
    c1: hsl(h1,95,64), c2: hsl(h2,92,60), c3: hsl(h3,90,62),
    rgb1: toRgb(h1,95,64), rgb2: toRgb(h2,92,60), rgb3: toRgb(h3,90,62),
    energy
  };
}

export function matchOf(a,b){
  const A=(a||'').trim().toLowerCase(), B=(b||'').trim().toLowerCase();
  const key=[A,B].sort().join('|');
  const r=mulberry32(hashStr('match:'+key));
  let pct=Math.floor(48+r()*52);
  if(A&&A===B) pct=100;
  let verdict;
  if(pct>=95) verdict="Cosmically entangled. Two flames, one fire.";
  else if(pct>=85) verdict="Rare resonance — your auras finish each other's light.";
  else if(pct>=72) verdict="Warm, magnetic harmony. You make each other brighter.";
  else if(pct>=58) verdict="Beautiful contrast — opposites that orbit close.";
  else verdict="Different frequencies, but sparks fly at the edges.";
  return {pct,verdict};
}
