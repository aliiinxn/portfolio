// Генератор плейсхолдер-превью проектов (SVG, 1600×1000).
// Только цвета дизайн-системы. Замените файлы в public/works/ своими работами (WebP/AVIF).
import { writeFileSync, mkdirSync } from 'node:fs';

const C = {
  ink: '#15160A', kraft: '#6F5B42', sand: '#B5A892', stone: '#BEBBB4', paper: '#D2D2D1',
  inkMuted: '#3F3B2E', kraftDeep: '#4E3F2E', paperLight: '#F2F0EA',
};
const W = 1600, H = 1000;

function rng(seed) {
  let s = seed * 9301 + 49297;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

const schemes = [
  { bg: C.paperLight, a: C.kraft, b: C.ink, c: C.sand, d: C.stone },
  { bg: C.ink, a: C.sand, b: C.paperLight, c: C.kraft, d: C.inkMuted },
  { bg: C.sand, a: C.ink, b: C.paperLight, c: C.kraftDeep, d: C.stone },
  { bg: C.stone, a: C.kraftDeep, b: C.ink, c: C.paperLight, d: C.sand },
  { bg: C.kraft, a: C.paperLight, b: C.sand, c: C.ink, d: C.kraftDeep },
];

const bar = (x, y, w, h, f, r = h / 2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}"/>`;

function web(s, r, v) {
  let o = `<rect width="${W}" height="${H}" fill="${s.bg}"/>`;
  o += bar(80, 60, 140, 28, s.b, 6) + bar(1060, 66, 90, 16, s.d) + bar(1180, 66, 90, 16, s.d) + bar(1300, 66, 90, 16, s.d) + bar(1420, 56, 110, 36, s.a, 18);
  const split = v % 2 === 0;
  const tx = split ? 80 : 820;
  o += bar(tx, 220, 640, 64, s.b, 8) + bar(tx, 304, 520, 64, s.b, 8) + bar(tx, 400, 560, 18, s.d) + bar(tx, 432, 480, 18, s.d) + bar(tx, 500, 220, 56, s.a, 28);
  const ix = split ? 820 : 80;
  o += `<rect x="${ix}" y="200" width="700" height="420" rx="24" fill="${s.c}"/>`;
  o += `<circle cx="${ix + 350 + (r() - .5) * 200}" cy="${410}" r="${120 + r() * 60}" fill="${s.a}" opacity=".85"/>`;
  o += `<rect x="${ix + 80}" y="${300 + r() * 80}" width="${200 + r() * 160}" height="${180}" rx="12" fill="${s.bg}" opacity=".6"/>`;
  for (let i = 0; i < 3; i++) {
    const x = 80 + i * 490;
    o += `<rect x="${x}" y="680" width="460" height="260" rx="18" fill="${s.d}" opacity=".55"/>`;
    o += bar(x + 32, 720, 180, 22, s.b, 6) + bar(x + 32, 760, 340, 14, s.b) + bar(x + 32, 786, 280, 14, s.b);
    o += `<rect x="${x + 32}" y="830" width="${120 + r() * 200}" height="70" rx="10" fill="${s.a}" opacity=".7"/>`;
  }
  return o;
}

function identity(s, r, v) {
  let o = `<rect width="${W}" height="${H}" fill="${s.bg}"/>`;
  const cx = 520, cy = 420;
  if (v % 3 === 0) {
    o += `<circle cx="${cx}" cy="${cy}" r="220" fill="${s.a}"/><rect x="${cx - 40}" y="${cy - 220}" width="80" height="440" fill="${s.bg}"/>`;
  } else if (v % 3 === 1) {
    o += `<path d="M${cx - 220} ${cy + 220} V${cy} A220 220 0 0 1 ${cx + 220} ${cy} V${cy + 220} H${cx + 90} V${cy} A90 90 0 0 0 ${cx - 90} ${cy} V${cy + 220} Z" fill="${s.a}"/>`;
  } else {
    o += `<rect x="${cx - 220}" y="${cy - 220}" width="200" height="440" rx="100" fill="${s.a}"/><rect x="${cx + 20}" y="${cy - 220}" width="200" height="200" rx="100" fill="${s.b}"/><rect x="${cx + 20}" y="${cy + 20}" width="200" height="200" fill="${s.c}"/>`;
  }
  o += bar(860, 330, 560, 80, s.b, 10) + bar(860, 440, 380, 24, s.d) + bar(860, 480, 300, 24, s.d);
  const sw = [s.a, s.b, s.c, s.d, s.bg];
  sw.forEach((f, i) => { o += `<rect x="${80 + i * 290}" y="760" width="260" height="160" rx="14" fill="${f}" stroke="${s.b}" stroke-opacity=".2" stroke-width="2"/>`; });
  o += `<circle cx="${1460 + r() * 20}" cy="${120}" r="40" fill="none" stroke="${s.b}" stroke-width="4" opacity=".4"/>`;
  return o;
}

function social(s, r) {
  let o = `<rect width="${W}" height="${H}" fill="${s.bg}"/>`;
  const size = 280, gap = 20, x0 = (W - (size * 3 + gap * 2)) / 2 + 260, y0 = 70;
  o += bar(120, 120, 380, 60, s.b, 8) + bar(120, 210, 300, 20, s.d) + bar(120, 246, 260, 20, s.d) + `<circle cx="210" cy="420" r="90" fill="${s.a}"/>` + bar(120, 560, 200, 52, s.c, 26);
  const fills = [s.a, s.c, s.d, s.b];
  for (let i = 0; i < 9; i++) {
    const x = x0 + (i % 3) * (size + gap), y = y0 + Math.floor(i / 3) * (size + gap);
    const f = fills[Math.floor(r() * fills.length)];
    o += `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="10" fill="${f}" opacity=".9"/>`;
    const k = Math.floor(r() * 3);
    if (k === 0) o += `<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${60 + r() * 50}" fill="${s.bg}" opacity=".7"/>`;
    if (k === 1) o += bar(x + 30, y + size - 90, size - 60, 26, s.bg, 6) + bar(x + 30, y + size - 52, size - 120, 16, s.bg);
    if (k === 2) o += `<rect x="${x + 40}" y="${y + 40}" width="${size - 80}" height="${size - 80}" rx="${(size - 80) / 2}" fill="none" stroke="${s.bg}" stroke-width="8" opacity=".7"/>`;
  }
  return o;
}

const projects = [
  { id: 'p1', kind: identity, scheme: 0 },
  { id: 'p2', kind: web, scheme: 3 },
  { id: 'p3', kind: social, scheme: 2 },
  { id: 'p4', kind: web, scheme: 1 },
  { id: 'p5', kind: identity, scheme: 4 },
];

mkdirSync('public/works', { recursive: true });
for (const p of projects) {
  const names = ['main', 'prev-1', 'prev-2', 'prev-3', 'gal-1', 'gal-2', 'gal-3', 'gal-4'];
  names.forEach((n, i) => {
    const r = rng(p.id.charCodeAt(1) * 31 + i * 7);
    const s = schemes[(p.scheme + (n.startsWith('gal') ? i % 2 : 0)) % schemes.length];
    const kind = n.startsWith('gal') && i % 3 === 0 ? (p.kind === web ? identity : web) : p.kind;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${kind(s, r, i)}</svg>`;
    writeFileSync(`public/works/${p.id}-${n}.svg`, svg);
  });
}
console.log('ok');
