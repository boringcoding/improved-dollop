import { ImageResponse } from 'workers-og';
import { generate, matchOf } from './aura.js';

import fontRegular from '../fonts/Poppins-Regular.ttf';
import fontSemi from '../fonts/Poppins-SemiBold.ttf';
import fontBold from '../fonts/Poppins-Bold.ttf';

// Where the static app actually lives (GitHub Pages stays the source of truth).
const UPSTREAM = 'https://boringcoding.github.io/improved-dollop';

const FONTS = [
  { name: 'Poppins', data: fontRegular, weight: 400, style: 'normal' },
  { name: 'Poppins', data: fontSemi,    weight: 600, style: 'normal' },
  { name: 'Poppins', data: fontBold,    weight: 700, style: 'normal' },
];

const esc = s => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/* ---------- OG card markup (Satori-friendly HTML) ---------- */

function glow(rgb, x, y, size, a){
  const c = `${rgb[0]},${rgb[1]},${rgb[2]}`;
  return `<div style="position:absolute;display:flex;left:${x}px;top:${y}px;width:${size}px;height:${size}px;
    background-image:radial-gradient(circle, rgba(${c},${a}) 0%, rgba(${c},${a*0.45}) 34%, rgba(${c},0) 70%);"></div>`;
}

function auraCard(d){
  return `
  <div style="display:flex;width:1200px;height:630px;position:relative;background:#05050c;font-family:Poppins;overflow:hidden;">
    ${glow(d.rgb1, 40, 40, 640, 0.6)}
    ${glow(d.rgb2, 230, 210, 580, 0.55)}
    ${glow(d.rgb3, 60, 320, 520, 0.5)}
    ${glow(d.rgb1, 330, 110, 430, 0.45)}
    <div style="position:absolute;display:flex;left:0;top:0;width:1200px;height:630px;
      background-image:linear-gradient(90deg, rgba(5,5,12,0) 28%, rgba(5,5,12,0.86) 58%, #05050c 78%);"></div>
    <div style="display:flex;flex-direction:column;justify-content:center;position:absolute;left:600px;top:0;width:540px;height:630px;">
      <div style="display:flex;color:#9b97c9;font-size:24px;letter-spacing:6px;font-weight:600;">A U R A</div>
      <div style="display:flex;margin-top:26px;color:#cdc9f4;font-size:26px;font-weight:600;letter-spacing:1px;">${esc(d.rarity.toUpperCase())}</div>
      <div style="display:flex;margin-top:8px;color:#8a86b8;font-size:24px;letter-spacing:3px;">${esc((d.name ? 'THE AURA OF '+d.name : 'THE AURA OF YOU').toUpperCase())}</div>
      <div style="display:flex;margin-top:6px;font-size:84px;line-height:1.04;font-weight:700;
        background-image:linear-gradient(110deg, ${d.c1}, ${d.c2});-webkit-background-clip:text;background-clip:text;color:transparent;">${esc(d.auraName)}</div>
      <div style="display:flex;margin-top:30px;color:#c9c5ee;font-size:27px;">What does your soul look like?</div>
    </div>
  </div>`;
}

function matchCard(nameA, nameB, dA, dB, m){
  return `
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:1200px;height:630px;position:relative;background:#05050c;font-family:Poppins;overflow:hidden;">
    ${glow(dA.rgb1, 150, -30, 560, 0.62)}
    ${glow(dA.rgb2, 150, 150, 460, 0.5)}
    ${glow(dB.rgb1, 490, -30, 560, 0.62)}
    ${glow(dB.rgb2, 590, 150, 460, 0.5)}
    ${glow(dA.rgb1, 390, 90, 420, 0.5)}
    <div style="position:absolute;display:flex;left:0;top:0;width:1200px;height:630px;
      background-image:radial-gradient(circle at 50% 45%, rgba(5,5,12,0) 46%, rgba(5,5,12,0.5) 78%, rgba(5,5,12,0.78) 100%);"></div>
    <div style="display:flex;position:absolute;top:90px;color:#f0eeff;font-size:32px;letter-spacing:8px;font-weight:600;">
      ${esc((nameA||'you').toUpperCase())} × ${esc((nameB||'them').toUpperCase())}
    </div>
    <div style="display:flex;font-size:240px;font-weight:700;line-height:1;
      background-image:linear-gradient(110deg, ${dA.c1}, ${dB.c2});-webkit-background-clip:text;background-clip:text;color:transparent;">${m.pct}%</div>
    <div style="display:flex;position:absolute;bottom:116px;color:#ffffff;font-size:34px;max-width:920px;text-align:center;">${esc(m.verdict)}</div>
    <div style="display:flex;position:absolute;bottom:56px;color:#8480ad;font-size:24px;letter-spacing:4px;">AURA · COMPATIBILITY</div>
  </div>`;
}

function ogResponse(html){
  return new ImageResponse(html, {
    width: 1200, height: 630, format: 'png', fonts: FONTS,
    headers: { 'cache-control': 'public, max-age=86400, s-maxage=604800' },
  });
}

/* ---------- meta-tag rewrite for link previews ---------- */

class AttrSetter {
  constructor(attr, value){ this.attr = attr; this.value = value; }
  element(el){ el.setAttribute(this.attr, this.value); }
}
class TextSetter {
  constructor(value){ this.value = value; }
  element(el){ el.setInnerContent(this.value); }
}

async function rewritePage(request, url){
  const name  = url.searchParams.get('name');
  const match = url.searchParams.get('match');
  const origin = url.origin;

  let title, desc, ogImage;
  if(name !== null && match !== null){
    const m = matchOf(name, match);
    title = `${name || 'You'} ✕ ${match} — ${m.pct}% aura match · AURA`;
    desc  = `${m.verdict} ✦ Reveal your aura and match it with anyone.`;
    ogImage = `${origin}/og?name=${encodeURIComponent(name)}&match=${encodeURIComponent(match)}`;
  } else if(name !== null){
    const d = generate(name);
    title = `${name ? name+"'s" : 'Your'} aura is ${d.auraName} · AURA`;
    desc  = `${d.auraName} — ${d.rarity}. ✦ What does your soul look like?`;
    ogImage = `${origin}/og?name=${encodeURIComponent(name)}`;
  } else {
    title = 'AURA · What does your soul look like?';
    desc  = 'Type your name and watch your one-of-a-kind aura come alive — then match it with a friend. ✦';
    ogImage = `${origin}/og`;
  }

  const upstream = await fetch(UPSTREAM + '/index.html', { cf: { cacheTtl: 300, cacheEverything: true } });
  const rw = new HTMLRewriter()
    .on('title', new TextSetter(title))
    .on('meta[property="og:title"]', new AttrSetter('content', title))
    .on('meta[name="twitter:title"]', new AttrSetter('content', title))
    .on('meta[property="og:description"]', new AttrSetter('content', desc))
    .on('meta[name="description"]', new AttrSetter('content', desc))
    .on('meta[name="twitter:description"]', new AttrSetter('content', desc))
    .on('meta[property="og:image"]', new AttrSetter('content', ogImage))
    .on('meta[name="twitter:image"]', new AttrSetter('content', ogImage))
    .on('meta[property="og:url"]', new AttrSetter('content', url.href));

  const res = rw.transform(upstream);
  const headers = new Headers(res.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'public, max-age=120');
  return new Response(res.body, { status: 200, headers });
}

export default {
  async fetch(request){
    const url = new URL(request.url);
    const path = url.pathname;

    try{
      if(path === '/og'){
        const name = url.searchParams.get('name');
        const match = url.searchParams.get('match');
        if(name !== null && match !== null){
          return ogResponse(matchCard(name, match, generate(name), generate(match), matchOf(name, match)));
        }
        return ogResponse(auraCard(generate(name || '')));
      }

      if(path === '/' || path === '/index.html'){
        return await rewritePage(request, url);
      }

      // everything else: proxy the static asset from the upstream site
      const assetUrl = UPSTREAM + path + url.search;
      const res = await fetch(assetUrl, { cf: { cacheEverything: true, cacheTtl: 3600 } });
      return new Response(res.body, { status: res.status, headers: res.headers });
    }catch(err){
      return new Response('aura error: ' + (err && err.message), { status: 500 });
    }
  }
};
