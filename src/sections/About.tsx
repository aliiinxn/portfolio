import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Grain, Sheet, Sticker, Tape } from '../components/base';
import { profile, stickers } from '../data/profile';
import { gsap, prefersReduced } from '../lib/motion';
import './about.css';

export type AboutHandle = {
  sheet: HTMLElement | null;
  collage: HTMLElement | null;
  playStickers: () => void;
  /** 0..1 — «дыхание» тонера */
  breathe: (p: number) => void;
};

const COLS = 3, ROWS = 4;
// Детерминированные смещения фрагментов: ±4–10px, повороты ±1–3°
const frags = Array.from({ length: COLS * ROWS }, (_, i) => {
  const s = (n: number) => (Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1;
  const sign = (v: number) => (v >= 0 ? 1 : -1);
  const a = s(1), b = s(2), c = s(3);
  return {
    dx: sign(a) * (4 + Math.abs(a) * 6),
    dy: sign(b) * (4 + Math.abs(b) * 6),
    r: sign(c) * (1 + Math.abs(c) * 2),
    col: i % COLS, row: Math.floor(i / COLS),
  };
});

const stickerRot = [-3, 2, -1.5, 3, -2, 1.5];

export const About = forwardRef<AboutHandle>(function About(_, ref) {
  const sheetRef = useRef<HTMLElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);
  const warpRef = useRef<SVGFETurbulenceElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const played = useRef(false);

  useImperativeHandle(ref, () => ({
    get sheet() { return sheetRef.current; },
    get collage() { return collageRef.current; },
    playStickers() {
      if (played.current || !sheetRef.current) return;
      played.current = true;
      const els = sheetRef.current.querySelectorAll('.about__sticker');
      if (prefersReduced()) { gsap.to(els, { opacity: 1, duration: 0.2 }); return; }
      gsap.fromTo(els,
        { opacity: 0, scale: 1.08, rotate: (i) => stickerRot[i] + (i % 2 ? 4 : -4) },
        { opacity: 1, scale: 1, rotate: (i) => stickerRot[i], duration: 0.3, stagger: 0.08, ease: 'back.out(2)' });
    },
    breathe(p: number) {
      if (prefersReduced()) return;
      const f = 0.010 + Math.sin(p * Math.PI * 2) * 0.002 + p * 0.002;
      warpRef.current?.setAttribute('baseFrequency', `${f.toFixed(4)} ${(f * 1.6).toFixed(4)}`);
      dispRef.current?.setAttribute('scale', `${(26 + Math.sin(p * Math.PI) * 14).toFixed(1)}`);
    },
  }));

  return (
    <Sheet as="section" ref={sheetRef} id="about" holes grain={0.05} className="album__sheet about" aria-labelledby="about-title">
      <div className="sheet-shade" aria-hidden="true" />

      {/* Огромное слово, рассыпанное в тонер */}
      <svg className="about__word" viewBox="0 0 1600 600" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="toner" x="-5%" y="-15%" width="110%" height="130%" colorInterpolationFilters="sRGB">
            <feTurbulence ref={warpRef} type="fractalNoise" baseFrequency="0.011 0.018" numOctaves="2" seed="4" result="warp" />
            <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="warp" scale="30" xChannelSelector="R" yChannelSelector="G" result="disp" />
            <feGaussianBlur in="disp" stdDeviation="6" result="blur" />
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="11" result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="grainA" />
            <feComposite in="blur" in2="grainA" operator="arithmetic" k1="0" k2="1.2" k3="1" k4="-0.85" result="mix" />
            <feComponentTransfer in="mix" result="thr">
              <feFuncA type="discrete" tableValues="0 0 .3 .8 1" />
            </feComponentTransfer>
            <feFlood floodOpacity="0.85" /> {/* flood-color = --ink через CSS */}
            <feComposite in2="thr" operator="in" />
          </filter>
        </defs>
        <text x="800" y="505" textAnchor="middle" textLength="1540" lengthAdjust="spacingAndGlyphs"
          filter="url(#toner)"
          style={{ font: '800 560px var(--font-heading)', letterSpacing: '-0.03em' }}>ДИЗАЙН</text>
      </svg>

      <p className="about__corner about__corner--tl t-caption" aria-hidden="true">Не один стиль</p>
      <p className="about__corner about__corner--tr t-caption" aria-hidden="true">Каждый проект — история</p>
      <p className="about__corner about__corner--bl t-caption" aria-hidden="true">{profile.location}</p>
      <p className="about__corner about__corner--br t-caption" aria-hidden="true">{profile.year}</p>

      <div className="about__layout">
        <div className="about__stickers about__stickers--l">
          {stickers.slice(0, 3).map((s, i) => (
            <Sticker key={s.label} className={`about__sticker about__sticker--${i}`} label={s.label} text={s.text} rotate={stickerRot[i]} tone={i === 1 ? 'light' : 'sand'} />
          ))}
        </div>

        <figure className="about__photo">
          <div className="collage" ref={collageRef} role="img" aria-label={profile.photo.alt}
            style={{ ['--photo' as string]: `url("${new URL(profile.photo.src, document.baseURI).href}")` }}>
            {frags.map((f, i) => (
              <span key={i} className="collage__frag" aria-hidden="true"
                style={{
                  ['--dx' as string]: `${f.dx.toFixed(1)}px`, ['--dy' as string]: `${f.dy.toFixed(1)}px`, ['--r' as string]: `${f.r.toFixed(2)}deg`,
                  gridColumn: f.col + 1, gridRow: f.row + 1,
                }}>
                <span className="collage__img" style={{ backgroundPosition: `${f.col * 50}% ${(f.row * 100) / 3}%` }} />
              </span>
            ))}
          </div>
        </figure>

        <div className="about__stickers about__stickers--r">
          {stickers.slice(3).map((s, i) => (
            <Sticker key={s.label} className={`about__sticker about__sticker--${i + 3}`} label={s.label} text={s.text} rotate={stickerRot[i + 3]} tone={i === 1 ? 'light' : 'sand'} />
          ))}
        </div>

        {/* Текст — на отдельном светлом листе поверх тонера: так абзац остаётся читаемым (AA) */}
        <div className="about__text">
          <Grain opacity={0.04} />
          <Tape rotate={-3} style={{ top: -10, left: 40 }} />
          <h2 className="t-h2" id="about-title">Обо мне</h2>
          <p className="t-body-l">{profile.about}</p>
          <p className="t-note about__sign">— {profile.firstName}</p>
        </div>
      </div>
    </Sheet>
  );
});
