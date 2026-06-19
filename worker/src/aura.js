// Real astrology + numerology engine — a byte-compatible port of the client
// logic in index.html, so OG previews match exactly what the visitor sees.
// (RGB helpers return 0–255 ints here because the OG card needs CSS rgba().)

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
const hsl = (h,s,l)=>`hsl(${h} ${s}% ${l}%)`;
function toRgb(h,s,l){
  h/=360;s/=100;l/=100;
  const k=n=>(n+h*12)%12, a=s*Math.min(l,1-l);
  const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
  return [Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255)];
}
const pick=(a,rnd)=>a[Math.floor(rnd()*a.length)];
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

const ADJ=["Electric","Velvet","Lunar","Solar","Cosmic","Wild","Quiet","Molten","Crystal","Ember",
  "Tidal","Feral","Gilded","Neon","Ancient","Radiant","Static","Obsidian","Aurora","Seraph",
  "Phantom","Saffron","Glacial","Verdant","Magnetic","Twilight","Opal","Thunder","Sovereign","Astral"];
const NOUN=["Phoenix","Tide","Comet","Bloom","Wolf","Mirror","Flame","Oracle","Drift","Halo",
  "Nova","Garden","Storm","Lantern","Serpent","Prism","Echo","Falcon","Current","Spark",
  "Monsoon","Willow","Beacon","Voyager","Ghost","Quartz","Meteor","Lotus","Raven","Dawn"];
const ENERGIES=[
  {k:"Fire",c:"#ff5e7a"},{k:"Water",c:"#3ad0ff"},{k:"Air",c:"#b69bff"},
  {k:"Earth",c:"#5fe39a"},{k:"Aether",c:"#ffd66b"}];
const RARITY=["1 in a generation","rarer than 99% of souls","rarer than 97% of souls",
  "rarer than 94% of souls","rarer than 88% of souls","beautifully uncommon","one of a kind"];

const ELEMENTS={ Fire:{glyph:"🔥",hue:8}, Earth:{glyph:"🌿",hue:138}, Air:{glyph:"💨",hue:255}, Water:{glyph:"💧",hue:198} };
const CUTS=[[119,"Capricorn"],[218,"Aquarius"],[320,"Pisces"],[419,"Aries"],
  [520,"Taurus"],[620,"Gemini"],[722,"Cancer"],[822,"Leo"],[922,"Virgo"],
  [1022,"Libra"],[1121,"Scorpio"],[1221,"Sagittarius"],[1231,"Capricorn"]];
const SIGN={
  Aries:{glyph:"♈",el:"Fire",mod:"Cardinal",ru:"Mars",pol:"Yang",kw:["bold","direct","fearless"],blurb:"first to leap, built to begin"},
  Taurus:{glyph:"♉",el:"Earth",mod:"Fixed",ru:"Venus",pol:"Yin",kw:["steady","sensual","loyal"],blurb:"immovable, and worth the wait"},
  Gemini:{glyph:"♊",el:"Air",mod:"Mutable",ru:"Mercury",pol:"Yang",kw:["quick","curious","witty"],blurb:"many minds, one bright spark"},
  Cancer:{glyph:"♋",el:"Water",mod:"Cardinal",ru:"Moon",pol:"Yin",kw:["tender","tidal","devoted"],blurb:"soft shell, fierce heart"},
  Leo:{glyph:"♌",el:"Fire",mod:"Fixed",ru:"Sun",pol:"Yang",kw:["radiant","proud","warm"],blurb:"born to be seen, made to give light"},
  Virgo:{glyph:"♍",el:"Earth",mod:"Mutable",ru:"Mercury",pol:"Yin",kw:["precise","devoted","sharp"],blurb:"quietly brilliant, endlessly kind"},
  Libra:{glyph:"♎",el:"Air",mod:"Cardinal",ru:"Venus",pol:"Yang",kw:["charming","fair","graceful"],blurb:"lives for balance and beautiful things"},
  Scorpio:{glyph:"♏",el:"Water",mod:"Fixed",ru:"Pluto",pol:"Yin",kw:["intense","magnetic","deep"],blurb:"all or nothing, always"},
  Sagittarius:{glyph:"♐",el:"Fire",mod:"Mutable",ru:"Jupiter",pol:"Yang",kw:["free","honest","restless"],blurb:"chasing the horizon, allergic to cages"},
  Capricorn:{glyph:"♑",el:"Earth",mod:"Cardinal",ru:"Saturn",pol:"Yin",kw:["driven","patient","solid"],blurb:"built to last, climbing quietly"},
  Aquarius:{glyph:"♒",el:"Air",mod:"Fixed",ru:"Uranus",pol:"Yang",kw:["original","electric","free"],blurb:"ahead of time, allergic to normal"},
  Pisces:{glyph:"♓",el:"Water",mod:"Mutable",ru:"Neptune",pol:"Yin",kw:["dreamy","intuitive","gentle"],blurb:"endlessly deep, quietly psychic"}
};
const SIGN_ORDER=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
export function sunSign(m,d){
  const md=m*100+d; let name="Capricorn";
  for(const c of CUTS){ if(md<=c[0]){name=c[1];break;} }
  return {name, ...SIGN[name]};
}
const LIFEPATH={
  1:{title:"The Leader",line:"independent, pioneering, self-made."},
  2:{title:"The Peacemaker",line:"intuitive, diplomatic, deeply feeling."},
  3:{title:"The Creator",line:"expressive, joyful, magnetic."},
  4:{title:"The Builder",line:"grounded, loyal, relentlessly reliable."},
  5:{title:"The Free Spirit",line:"adventurous, restless, alive to change."},
  6:{title:"The Nurturer",line:"loving, responsible, the heart of the room."},
  7:{title:"The Seeker",line:"analytical, spiritual, an old soul."},
  8:{title:"The Powerhouse",line:"ambitious, magnetic, built for big things."},
  9:{title:"The Humanitarian",line:"compassionate, wise, here for everyone."},
  11:{title:"Master 11 · The Intuitive",line:"visionary, sensitive, lit from within."},
  22:{title:"Master 22 · The Builder",line:"dreams made real, at scale."},
  33:{title:"Master 33 · The Teacher",line:"love as a calling."}
};
function reduceNum(n,keepMaster){
  while(n>9 && !(keepMaster&&(n===11||n===22||n===33))){
    n=String(n).split('').reduce((a,c)=>a+ +c,0);
  }
  return n;
}
export function lifePath(y,m,d){
  const part=x=>reduceNum(x,true);
  const n=reduceNum(part(y)+part(m)+part(d),true);
  return {n, master:(n===11||n===22||n===33), ...LIFEPATH[n]};
}
const ANIMALS=[
  {a:"Rat",g:"🐀",t:"clever and quick"},{a:"Ox",g:"🐂",t:"steady and strong"},
  {a:"Tiger",g:"🐅",t:"brave and bold"},{a:"Rabbit",g:"🐇",t:"gentle and lucky"},
  {a:"Dragon",g:"🐉",t:"magnetic and fearless"},{a:"Snake",g:"🐍",t:"wise and intuitive"},
  {a:"Horse",g:"🐎",t:"free and warm"},{a:"Goat",g:"🐐",t:"tender and creative"},
  {a:"Monkey",g:"🐒",t:"witty and inventive"},{a:"Rooster",g:"🐓",t:"sharp and proud"},
  {a:"Dog",g:"🐕",t:"loyal and honest"},{a:"Pig",g:"🐖",t:"generous and easy to love"}
];
const CH_EL=["Wood","Fire","Earth","Metal","Water"];
export function chinese(y,m,d){
  let yr=y; if(m<2||(m===2&&d<4)) yr--;
  const ai=((yr-4)%12+12)%12;
  const ei=Math.floor((((yr-4)%10)+10)%10/2);
  const an=ANIMALS[ai];
  return {animal:an.a, glyph:an.g, trait:an.t, element:CH_EL[ei]};
}
function buildEnergy(sunEl,chiEl,mod,lp,rnd){
  const w={Fire:6,Water:6,Air:6,Earth:6,Aether:6};
  w[sunEl]+=34;
  const chiMap={Fire:"Fire",Water:"Water",Earth:"Earth",Metal:"Air",Wood:"Aether"};
  w[chiMap[chiEl]]+=16;
  const modMap={Cardinal:"Fire",Fixed:"Earth",Mutable:"Air"};
  w[modMap[mod]]+=8;
  w.Aether+=(lp.master?12:4);
  for(const k in w) w[k]+=rnd()*6;
  const total=Object.values(w).reduce((a,b)=>a+b,0);
  const arr=ENERGIES.map(e=>({...e,pct:Math.round(w[e.k]/total*100)}));
  arr[0].pct+=100-arr.reduce((a,b)=>a+b.pct,0);
  return arr.sort((a,b)=>b.pct-a.pct);
}

export function validDate(y,m,d){
  if(!y||!m||!d) return false;
  if(m<1||m>12||d<1||d>31) return false;
  if(y<1900||y>new Date().getFullYear()+1) return false;
  const dt=new Date(Date.UTC(y,m-1,d));
  return dt.getUTCFullYear()===y&&dt.getUTCMonth()===m-1&&dt.getUTCDate()===d;
}
export function parseDob(str){
  if(!str) return null;
  const s=String(str).replace(/\D/g,'');
  if(s.length!==8) return null;
  const y=+s.slice(0,4),m=+s.slice(4,6),d=+s.slice(6,8);
  return validDate(y,m,d)?{y,m,d}:null;
}

export function generate(rawName, dob){
  const name=(rawName||"").trim();
  if(!dob){ return generateFromName(name); }
  const {y,m,d}=dob;
  const sign=sunSign(m,d);
  const lp=lifePath(y,m,d);
  const chi=chinese(y,m,d);
  const seedKey=name.toLowerCase().replace(/\s+/g,' ')+'|'+y+'-'+m+'-'+d;
  const seed=hashStr(seedKey);
  const rnd=mulberry32(seed);
  const base=ELEMENTS[sign.el].hue;
  const h1=((base+Math.floor(rnd()*30)-15)%360+360)%360;
  const h2=(h1+30+Math.floor(rnd()*45))%360;
  const h3=(h1+200+Math.floor(rnd()*80))%360;
  const energy=buildEnergy(sign.el,chi.element,sign.mod,lp,rnd);
  const auraName=pick(ADJ,rnd)+" "+pick(NOUN,rnd);
  const reading=`${sign.name} — ${sign.el.toLowerCase()} & ${sign.mod.toLowerCase()}, ruled by ${sign.ru}. ${cap(sign.blurb)}.`;
  const rarity=lp.master?"1 in a generation":pick(RARITY,rnd);
  return {name, dob, sign, lifePath:lp, chinese:chi, auraName, rarity, reading, energy,
    h1,h2,h3,
    c1:hsl(h1,95,64),c2:hsl(h2,92,60),c3:hsl(h3,90,62),
    rgb1:toRgb(h1,95,64),rgb2:toRgb(h2,92,60),rgb3:toRgb(h3,90,62)};
}
function generateFromName(name){
  const seedKey=(name||'').toLowerCase().replace(/\s+/g,' ')||"stranger";
  const seed=hashStr(seedKey); const rnd=mulberry32(seed);
  const auraName=pick(ADJ,rnd)+" "+pick(NOUN,rnd);
  const baseHue=Math.floor(rnd()*360);
  const h1=baseHue,h2=(baseHue+40+Math.floor(rnd()*120))%360,h3=(baseHue+200+Math.floor(rnd()*100))%360;
  return {name, dob:null, sign:null, lifePath:null, chinese:null,
    auraName, rarity:pick(RARITY,rnd), reading:"", energy:[],
    h1,h2,h3,
    c1:hsl(h1,95,64),c2:hsl(h2,92,60),c3:hsl(h3,90,62),
    rgb1:toRgb(h1,95,64),rgb2:toRgb(h2,92,60),rgb3:toRgb(h3,90,62)};
}

/* ---- compatibility (real synastry rules) ---- */
function elemPair(a,b){
  if(a===b) return 82;
  const has=(x,y)=>(a===x&&b===y)||(a===y&&b===x);
  if(has("Fire","Air")) return 92;
  if(has("Earth","Water")) return 92;
  if(has("Air","Water")) return 64;
  if(has("Fire","Earth")) return 58;
  if(has("Air","Earth")) return 55;
  if(has("Fire","Water")) return 50;
  return 60;
}
function aspectInfo(sA,sB){
  const i=SIGN_ORDER.indexOf(sA), j=SIGN_ORDER.indexOf(sB);
  const dist=Math.min((i-j+12)%12,(j-i+12)%12);
  const M={0:[78,"Conjunction"],1:[55,"Semi-sextile"],2:[85,"Sextile"],
    3:[52,"Square"],4:[95,"Trine"],5:[50,"Quincunx"],6:[72,"Opposition"]};
  return {score:M[dist][0], name:M[dist][1]};
}
function numPair(a,b){
  if(a===b) return 80;
  const great=[[1,5],[1,7],[2,6],[2,8],[3,6],[3,9],[4,8],[5,7],[6,9],[11,2],[22,4],[33,6]];
  const r=x=>reduceNum(x,false);
  for(const g of great){ const x=g[0],y=g[1];
    if((a===x&&b===y)||(a===y&&b===x)||(r(a)===x&&r(b)===y)||(r(a)===y&&r(b)===x)) return 90; }
  return Math.max(48, 86-Math.abs(r(a)-r(b))*6);
}
function verdictFor(pct){
  if(pct>=95) return "Cosmically entangled. Two flames, one fire. 🔥";
  if(pct>=85) return "Rare resonance — your charts finish each other's light. ✨";
  if(pct>=72) return "Warm, magnetic harmony. You make each other brighter. 💫";
  if(pct>=58) return "Beautiful contrast — opposites that orbit close. 🪐";
  return "Different frequencies, but sparks fly at the edges. ⚡";
}
export function synastry(A,B){
  if(A.sign&&B.sign){
    const e=elemPair(A.sign.el,B.sign.el);
    const asp=aspectInfo(A.sign.name,B.sign.name);
    const nm=numPair(A.lifePath.n,B.lifePath.n);
    let pct=Math.round(0.4*e+0.35*asp.score+0.25*nm);
    const j=mulberry32(hashStr((A.name||'')+'|'+(B.name||'')+'|'+(A.dob?A.dob.y:0)+'|'+(B.dob?B.dob.y:0)));
    pct=Math.max(34,Math.min(99,pct+Math.floor(j()*5-2)));
    if(A.dob&&B.dob&&A.dob.y===B.dob.y&&A.dob.m===B.dob.m&&A.dob.d===B.dob.d&&(A.name||'').toLowerCase()===(B.name||'').toLowerCase()) pct=100;
    const breakdown=[
      {label:"Elements",pct:e,note:`${A.sign.el} × ${B.sign.el}`},
      {label:"Signs",pct:asp.score,note:asp.name},
      {label:"Numbers",pct:nm,note:`${A.lifePath.n} & ${B.lifePath.n}`}
    ];
    return {pct,verdict:verdictFor(pct),breakdown};
  }
  const key=[(A.name||'').toLowerCase(),(B.name||'').toLowerCase()].sort().join('|');
  const r=mulberry32(hashStr('match:'+key));
  const pct=Math.floor(48+r()*52);
  return {pct,verdict:verdictFor(pct),breakdown:[]};
}
