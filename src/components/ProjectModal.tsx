import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Project } from '../data/projects';
import { Button, Glass, Grain, Icon, Stamp, Tape } from './base';
import { gsap, lockScroll, prefersReduced } from '../lib/motion';
import { setUi } from '../lib/store';
import './modal.css';

type Props = { project: Project | null; origin: HTMLElement | null; onClose: () => void };

/** Выноски: координаты в % контейнера. Мокап занимает x 24–76%, y ≈ 21–79%. Линии не пересекаются. */
type CalloutDef = { key: string; side: 'l' | 'r'; y: number; pts: [number, number][]; value: (p: Project) => string; swatch?: boolean };
const CALLOUTS: CalloutDef[] = [
  { key: 'Шрифт', side: 'l', y: 16, pts: [[22, 16], [34, 16], [34, 30]], value: (p) => p.fonts },
  { key: 'Цвет', side: 'l', y: 50, pts: [[22, 50], [42, 50]], value: (p) => p.colors[0], swatch: true },
  { key: 'Сетка', side: 'l', y: 84, pts: [[22, 84], [30, 84], [30, 72]], value: (p) => p.grid },
  { key: 'Задача', side: 'r', y: 24, pts: [[78, 24], [66, 24], [66, 34]], value: (p) => p.task },
  { key: 'Результат', side: 'r', y: 78, pts: [[78, 78], [60, 78], [60, 64]], value: (p) => p.result },
];

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ProjectModal({ project, origin, onClose }: Props) {
  const [shown, setShown] = useState<Project | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [drawn, setDrawn] = useState(false);
  const closing = useRef(false);

  useEffect(() => { if (project) { setShown(project); closing.current = false; } }, [project]);

  // Открытие: FLIP из папки/ноутбука в центр
  useLayoutEffect(() => {
    if (!shown || !panelRef.current) return;
    lockScroll(true);
    setUi({ modalOpen: true });
    const panel = panelRef.current;
    const reduced = prefersReduced();
    setDrawn(false);
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: reduced ? 0.2 : 0.35, ease: 'dossierOut' });
    if (reduced || !origin) {
      gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.2, onComplete: () => setDrawn(true) });
    } else {
      const a = origin.getBoundingClientRect();
      const b = panel.getBoundingClientRect();
      gsap.fromTo(panel,
        { x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2), scaleX: a.width / b.width, scaleY: a.height / b.height, opacity: 0.4 },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.5, ease: 'dossierOut', onComplete: () => setDrawn(true) });
    }
    panel.querySelector<HTMLElement>('.modal__close')?.focus({ preventScroll: true });
    panel.querySelector<HTMLElement>('.modal__scroll')?.scrollTo(0, 0);
  }, [shown, origin]);

  // Размер сцены выносок
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [shown]);

  const close = () => {
    if (!shown || closing.current) return;
    closing.current = true;
    const panel = panelRef.current!;
    const done = () => {
      setShown(null); setDrawn(false);
      lockScroll(false); setUi({ modalOpen: false });
      origin?.closest('button')?.focus({ preventScroll: true });
      onClose();
    };
    if (prefersReduced() || !origin) {
      gsap.to([panel, overlayRef.current], { opacity: 0, duration: 0.2, onComplete: done });
      return;
    }
    const a = origin.getBoundingClientRect();
    const b = panel.getBoundingClientRect();
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'dossierOut' });
    gsap.to(panel, {
      x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2),
      scaleX: a.width / b.width, scaleY: a.height / b.height, opacity: 0, duration: 0.42, ease: 'dossierFlip', onComplete: done,
    });
  };

  // Esc + ловушка фокуса
  useEffect(() => {
    if (!shown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  if (!shown) return null;
  const p = shown;
  const px = (v: number, axis: 'w' | 'h') => (v / 100) * size[axis];

  return createPortal(
    <div className={`modal${drawn ? ' is-drawn' : ''}`} ref={rootRef}>
      <div className="modal__overlay" ref={overlayRef} onClick={close} aria-hidden="true" />
      <div className="modal__panel glass glass--lg glass--strong" ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <Button className="modal__close" round icon={Icon.close} aria-label="Закрыть проект" onClick={close} />
        <div className="modal__scroll" data-lenis-prevent>
          {/* Обложка кейса */}
          <header className="case-cover">
            <Grain opacity={0.06} />
            <Tape rotate={-4} style={{ top: -10, left: 40 }} />
            <Tape rotate={3} style={{ top: -10, right: 40 }} />
            <p className="t-caption case-cover__meta">Проект {p.num} · {p.category}</p>
            <h2 className="t-h2" id="modal-title">{p.title}</h2>
            <div className="case-cover__row">
              <span className="case-badge t-label">{p.badge}</span>
              <span className="t-caption case-cover__year">{p.year}</span>
            </div>
            <Stamp text="Готово" color="var(--kraft)" textColor="var(--ink)" size={108} rotate={4} className="case-cover__stamp" center={p.num} />
          </header>

          {/* Главный макет с выносками */}
          <section className="case-mock" aria-label="Разбор макета">
            <div className="case-mock__stage" ref={stageRef}>
              <img className="case-mock__img" src={p.main} alt={`Главный макет проекта «${p.title}»`} decoding="async" />
              <svg className="case-mock__lines" width={size.w} height={size.h} aria-hidden="true">
                {CALLOUTS.map((c, i) => (
                  <polyline key={c.key} pathLength={1} style={{ transitionDelay: `${i * 90}ms` }}
                    points={c.pts.map(([x, y]) => `${px(x, 'w').toFixed(1)},${px(y, 'h').toFixed(1)}`).join(' ')} />
                ))}
              </svg>
              {CALLOUTS.map((c, i) => {
                const end = c.pts[c.pts.length - 1];
                return (
                  <span key={c.key + 'dot'} className="case-mock__dot" aria-hidden="true"
                    style={{ left: `${end[0]}%`, top: `${end[1]}%`, transitionDelay: `${700 + i * 90}ms` }} />
                );
              })}
            </div>
            <ul className="callouts">
              {CALLOUTS.map((c, i) => (
                <li key={c.key} className={`callout callout--${c.side}`} style={{ top: `${c.y}%`, transitionDelay: `${900 + i * 80}ms` }}>
                  <Glass blur="sm" className="callout__box">
                    <span className="t-caption callout__key">{c.key} →</span>
                    <span className="callout__value">
                      {c.swatch && <span className="callout__swatch" style={{ background: c.value(p) }} aria-hidden="true" />}
                      {c.value(p)}
                    </span>
                  </Glass>
                </li>
              ))}
            </ul>
          </section>

          {/* Палитра проекта */}
          <ul className="case-palette" aria-label="Цвета проекта">
            {p.colors.map((hex) => (
              <li key={hex}><span className="case-palette__chip" style={{ background: hex }} aria-hidden="true" /><span className="t-caption">{hex}</span></li>
            ))}
          </ul>

          {/* Галерея */}
          <section className="case-gallery" aria-label="Галерея проекта">
            <div className="case-gallery__track" tabIndex={0} role="region" aria-label="Изображения проекта, листаются горизонтально">
              {p.gallery.map((src, i) => (
                <figure key={src} className="case-gallery__item">
                  <img src={src} alt={`«${p.title}» — изображение ${i + 1} из ${p.gallery.length}`} loading="lazy" decoding="async" />
                </figure>
              ))}
            </div>
          </section>

          <p className="t-body case-desc">{p.description}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
