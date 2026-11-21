/* Arte clave procedural: cada proyecto recibe un "póster" de anime único,
   generado en SVG a partir de su identificador. Sin imágenes externas. */
(() => {
  'use strict';

  // Paletas: cielo arriba, cielo abajo, sol, silueta, acento
  const PALETTES = [
    { name: 'atardecer', top: '#3b1d8f', mid: '#ff3d8b', low: '#ffb347', sun: ['#fff4b0', '#ffcc29'], land: '#1a0f3d', accent: '#23d5e6' },
    { name: 'neón', top: '#0b0b2e', mid: '#3a1c9e', low: '#23d5e6', sun: ['#ffd6f0', '#ff3d8b'], land: '#0a0820', accent: '#ffcc29' },
    { name: 'amanecer', top: '#ff6f91', mid: '#ffb347', low: '#fff1a8', sun: ['#ffffff', '#ffe066'], land: '#5a1e5c', accent: '#7a5cff' },
    { name: 'galaxia', top: '#12062e', mid: '#7a5cff', low: '#ff5ea8', sun: ['#e9ddff', '#b39dff'], land: '#140a33', accent: '#ffcc29' },
    { name: 'bosque', top: '#0f3b5f', mid: '#12c2a0', low: '#d9ff7a', sun: ['#fffbe0', '#fff176'], land: '#08283a', accent: '#ff3d8b' },
    { name: 'océano', top: '#081a4a', mid: '#2b6cff', low: '#7af3ff', sun: ['#ffffff', '#bff7ff'], land: '#061235', accent: '#ff3d8b' },
  ];

  const KANA = {
    web: 'ウェブ', datos: 'データ', api: 'エーピーアイ', 'tiempo real': 'リアルタイム',
    herramientas: 'ツール', 'móvil': 'モバイル', movil: 'モバイル', juegos: 'ゲーム', ia: 'エーアイ',
  };
  const kanaFor = (cat) => KANA[(cat || '').toLowerCase()] || 'プロジェクト';

  function hash(str) {
    let h = 2166136261;
    for (const ch of String(str)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return h >>> 0;
  }
  function rng(seed) {
    let a = hash(seed) || 1;
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  let uid = 0;
  const paletteFor = (seed, index) => PALETTES[(index ?? hash(seed)) % PALETTES.length];

  /**
   * @param {string} seed      identificador estable (slug)
   * @param {object} o         { palette, kana, layout: 'wide'|'poster', sunX, title }
   */
  function keyArt(seed, o = {}) {
    const r = rng(seed);
    const p = o.palette || paletteFor(seed);
    const poster = o.layout === 'poster';
    const W = poster ? 600 : 1600;
    const H = poster ? 900 : 900;
    const id = 'a' + (hash(seed + (o.layout || '')) % 1e6) + '_' + (++uid); // único por instancia: el mismo arte se repite en varias secciones
    const sx = poster ? W * (0.35 + r() * 0.3) : W * (o.sunX ?? 0.66 + r() * 0.14);
    const sy = H * (poster ? 0.38 : 0.42);
    const sr = poster ? 170 + r() * 40 : 220 + r() * 60;
    const horizon = H * (poster ? 0.66 : 0.7);
    const kind = Math.floor(r() * 3); // 0 ciudad, 1 montañas, 2 olas

    // líneas de velocidad desde el sol
    let speed = '';
    const rays = 46;
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2 + r() * 0.05;
      const w = 0.006 + r() * 0.02;
      const L = 2200;
      const x1 = sx + Math.cos(a - w) * L, y1 = sy + Math.sin(a - w) * L;
      const x2 = sx + Math.cos(a + w) * L, y2 = sy + Math.sin(a + w) * L;
      speed += `<path d="M${sx.toFixed(0)} ${sy.toFixed(0)}L${x1.toFixed(0)} ${y1.toFixed(0)}L${x2.toFixed(0)} ${y2.toFixed(0)}Z" opacity="${(0.05 + r() * 0.12).toFixed(2)}"/>`;
    }

    // estrellas / destellos
    let sparks = '';
    const nS = poster ? 10 : 18;
    for (let i = 0; i < nS; i++) {
      const x = r() * W, y = r() * horizon * 0.7, s = 4 + r() * (i % 4 === 0 ? 18 : 7);
      sparks += `<path transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${(s / 12).toFixed(2)})" d="M0-12C.7-5 5-.7 12 0 5 .7.7 5 0 12-.7 5-5 .7-12 0-5-.7-.7-5 0-12z" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
    }

    // silueta del paisaje
    let land = '';
    if (kind === 0) {
      let x = -10;
      let back = '';
      while (x < W + 10) {
        const bw = 30 + r() * (poster ? 60 : 90);
        const bh = 60 + r() * (poster ? 200 : 260);
        back += `<rect x="${x.toFixed(0)}" y="${(horizon - bh * 0.7).toFixed(0)}" width="${bw.toFixed(0)}" height="${(H).toFixed(0)}"/>`;
        x += bw * (0.7 + r() * 0.5);
      }
      x = -10;
      let front = '', wins = '';
      while (x < W + 10) {
        const bw = 40 + r() * (poster ? 70 : 110);
        const bh = 40 + r() * (poster ? 170 : 230);
        const top = horizon - bh + 60;
        front += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${bw.toFixed(0)}" height="${H}"/>`;
        if (r() > 0.3) {
          for (let wy = top + 16; wy < H - 10; wy += 22) {
            for (let wx = x + 9; wx < x + bw - 12; wx += 16) {
              if (r() > 0.72) wins += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="6" height="9"/>`;
            }
          }
        }
        if (r() > 0.75) front += `<rect x="${(x + bw / 2 - 2).toFixed(0)}" y="${(top - 50).toFixed(0)}" width="4" height="50"/>`;
        x += bw + r() * 6;
      }
      land = `<g fill="${p.land}" opacity=".55">${back}</g><g fill="${p.land}">${front}</g><g fill="${p.sun[1]}" opacity=".85">${wins}</g>`;
    } else if (kind === 1) {
      const ridge = (base, amp, step, op) => {
        let d = `M0 ${H}L0 ${base}`;
        for (let x = 0; x <= W + step; x += step) d += `L${x} ${(base - r() * amp).toFixed(0)}`;
        return `<path d="${d}L${W} ${H}Z" fill="${p.land}" opacity="${op}"/>`;
      };
      land = ridge(horizon - 40, 220, poster ? 90 : 140, 0.45) + ridge(horizon + 10, 150, poster ? 60 : 90, 0.75) + ridge(horizon + 70, 80, poster ? 40 : 60, 1);
    } else {
      let waves = '';
      for (let k = 0; k < 6; k++) {
        const y0 = horizon + k * 38;
        let d = `M0 ${H}L0 ${y0}`;
        const step = poster ? 60 : 100;
        for (let x = 0; x <= W + step; x += step) d += `Q${x + step / 2} ${(y0 - 22 - r() * 16).toFixed(0)} ${x + step} ${y0}`;
        waves += `<path d="${d}L${W} ${H}Z" fill="${p.land}" opacity="${(0.4 + k * 0.12).toFixed(2)}"/>`;
      }
      land = waves;
    }

    // franjas del sol (estilo retro)
    let stripes = '';
    for (let i = 0; i < 7; i++) {
      const y = sy + sr * 0.15 + i * (sr * 0.13);
      stripes += `<rect x="${(sx - sr - 2).toFixed(0)}" y="${y.toFixed(0)}" width="${(sr * 2 + 4).toFixed(0)}" height="${(3 + i * 2.4).toFixed(1)}"/>`;
    }

    const kana = o.kana || '';
    const kanaSize = poster ? 150 : 230;
    const kanaY = poster ? H * 0.9 : H * 0.95;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.top}"/><stop offset=".55" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.low}"/></linearGradient>
<linearGradient id="${id}u" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.sun[0]}"/><stop offset="1" stop-color="${p.sun[1]}"/></linearGradient>
<radialGradient id="${id}g" cx="${(sx / W).toFixed(3)}" cy="${(sy / H).toFixed(3)}" r=".55"><stop offset="0" stop-color="${p.sun[0]}" stop-opacity=".55"/><stop offset="1" stop-color="${p.sun[0]}" stop-opacity="0"/></radialGradient>
<pattern id="${id}h" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.4" fill="${p.land}"/></pattern>
<linearGradient id="${id}m" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".9"/></linearGradient>
<mask id="${id}k"><rect width="${W}" height="${H}" fill="url(#${id}m)"/></mask>
<mask id="${id}c"><rect width="${W}" height="${H}" fill="#fff"/><g fill="#000">${stripes}</g></mask>
</defs>
<rect width="${W}" height="${H}" fill="url(#${id}s)"/>
<rect width="${W}" height="${H}" fill="url(#${id}g)"/>
<g fill="#fff">${speed}</g>
<g fill="#fff">${sparks}</g>
<circle cx="${sx.toFixed(0)}" cy="${sy.toFixed(0)}" r="${sr.toFixed(0)}" fill="url(#${id}u)" mask="url(#${id}c)"/>
${kana ? `<text x="${poster ? W / 2 : W * 0.04}" y="${kanaY.toFixed(0)}" text-anchor="${poster ? 'middle' : 'start'}" font-family="Dela Gothic One" font-size="${kanaSize}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="3"${poster ? ` textLength="${W * 0.9}" lengthAdjust="spacingAndGlyphs"` : ''}>${kana}</text>` : ''}
${land}
<rect width="${W}" height="${H}" fill="url(#${id}h)" mask="url(#${id}k)" opacity=".55"/>
<path d="M${W * (poster ? 0.72 : 0.84)} 0L${W} 0L${W} ${H * (poster ? 0.2 : 0.32)}Z" fill="${p.accent}" opacity=".9"/>
</svg>`;
  }

  window.KeyArt = { keyArt, paletteFor, kanaFor, PALETTES, hash };
})();
