import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon } from '../components/base';
import { profile } from '../data/profile';
import { projects } from '../data/projects';
import { layoutLines } from '../lib/blockFont';
import { prefersReduced } from '../lib/motion';
import './final.css';

const VB = { w: 1000, h: 560 };

/** 6.5 Финал — вырубленные буквы и свет. */
export function Final() {
  const sectionRef = useRef<HTMLElement>(null);
  const worksRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<SVGFEDropShadowElement>(null);
  const works = useMemo(() => projects.flatMap((p) => [p.main, p.gallery[1]]), []);
  const [idx, setIdx] = useState(0);

  const glyphs = useMemo(
    () => layoutLines(['ДАВАЙ', 'РАБОТАТЬ'], { x: 44, y: 44, w: VB.w - 88, h: VB.h - 88 }, 18, 26),
    [],
  );

  // медленная смена работ в прорезях
  useEffect(() => {
    if (prefersReduced()) return;
    const t = window.setInterval(() => setIdx((i) => (i + 1) % works.length), 3800);
    return () => window.clearInterval(t);
  }, [works.length]);

  // параллакс света и теней за курсором (5–10px)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || prefersReduced() || !window.matchMedia('(pointer: fine)').matches) return;
    let raf = 0, nx = 0, ny = 0;
    const apply = () => {
      raf = 0;
      if (worksRef.current) worksRef.current.style.transform = `translate(${(-nx * 8).toFixed(1)}px, ${(-ny * 6).toFixed(1)}px) scale(1.04)`;
      if (beamRef.current) beamRef.current.style.transform = `translateX(${(nx * 10).toFixed(1)}px) skewX(${(nx * -2).toFixed(2)}deg)`;
      shadowRef.current?.setAttribute('dx', (4 - nx * 8).toFixed(1));
      shadowRef.current?.setAttribute('dy', (7 - ny * 6).toFixed(1));
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      nx = (e.clientX - r.left) / r.width - 0.5;
      ny = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    el.addEventListener('pointermove', onMove);
    return () => { el.removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, []);

  const c = profile.contacts;

  return (
    <section ref={sectionRef} id="contacts" className="final on-dark" aria-labelledby="final-title">
      <div className="final__scene">
        <div className="final__glow" aria-hidden="true" />
        <div className="final__cover" role="img" aria-label="Обложка папки с вырубленной надписью «Давай работать», сквозь буквы видны работы">
          <div className="final__works" ref={worksRef} aria-hidden="true">
            {works.map((src, i) => (
              <img key={src + i} src={src} alt="" loading="lazy" decoding="async" className={i === idx ? 'is-on' : ''} />
            ))}
          </div>
          <svg className="final__card" viewBox={`0 0 ${VB.w} ${VB.h}`} aria-hidden="true">
            <defs>
              <mask id="cut" maskUnits="userSpaceOnUse" x="0" y="0" width={VB.w} height={VB.h}>
                <rect width={VB.w} height={VB.h} fill="white" />
                {glyphs.map((g, i) => (
                  <path key={i} d={g.d} fill="black" transform={`translate(${g.x.toFixed(2)} ${g.y.toFixed(2)}) scale(${g.sx.toFixed(3)} ${g.sy.toFixed(3)})`} />
                ))}
              </mask>
              {/* Тень картона внутрь прорезей */}
              <filter id="cutShadow" x="-5%" y="-5%" width="110%" height="115%">
                <feDropShadow ref={shadowRef} dx="4" dy="7" stdDeviation="5" floodOpacity="0.85" className="final__shadow" />
              </filter>
              <filter id="kraftGrain" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5" />
                <feColorMatrix values="0 0 0 0 0.08  0 0 0 0 0.086  0 0 0 0 0.04  0 0 0 1 0" />
              </filter>
            </defs>
            <g filter="url(#cutShadow)">
              <rect width={VB.w} height={VB.h} rx="24" mask="url(#cut)" className="final__kraft" />
            </g>
            <rect width={VB.w} height={VB.h} rx="24" mask="url(#cut)" filter="url(#kraftGrain)" opacity="0.07" />
          </svg>
        </div>

        <div className="final__beam-wrap" aria-hidden="true"><div className="final__beam" ref={beamRef} /></div>

        <div className="final__content">
          <h2 className="t-h2" id="final-title">{profile.ctaTitle}</h2>
          <p className="t-body-l">{profile.ctaText}</p>
          <ul className="final__contacts t-label">
            <li><a href={c.telegram.href} target="_blank" rel="noopener noreferrer"><span>Telegram</span> {c.telegram.label}</a></li>
            <li><a href={c.email.href}><span>Почта</span> {c.email.label}</a></li>
            <li><a href={c.behance.href} target="_blank" rel="noopener noreferrer"><span>Behance</span> {c.behance.label}</a></li>
            <li><a href={c.instagram.href} target="_blank" rel="noopener noreferrer"><span>Instagram</span> {c.instagram.label}</a></li>
          </ul>
          <div className="final__actions">
            <Button variant="primary" href={c.telegram.href} target="_blank" rel="noopener noreferrer" icon={Icon.arrowRight}>Обсудить проект</Button>
            <Button variant="dark" href={profile.pdf} download>Скачать PDF-портфолио</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
