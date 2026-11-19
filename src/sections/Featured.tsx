import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { Sheet } from '../components/base';
import { Laptop, type OpenHandler } from '../components/objects';
import { projects } from '../data/projects';
import { MOBILE_QUERY } from '../lib/motion';
import { useMedia } from '../lib/useMedia';
import './featured.css';

export type FeaturedHandle = {
  sheet: HTMLElement | null;
  setProgress: (p: number) => void;
};

const featured = projects.filter((p) => p.featured);
const N = featured.length;
const GAP = 24; // % длины кривой между ноутбуками

/** 6.3 Избранное — лента-киноплёнка из ноутбуков. Главный приём — лента. */
export const Featured = forwardRef<FeaturedHandle, { onOpen: OpenHandler; onFocusItem?: (i: number, n: number) => void }>(
  function Featured({ onOpen, onFocusItem }, ref) {
    const sheetRef = useRef<HTMLElement>(null);
    const ribbonRef = useRef<HTMLDivElement>(null);
    const tracks = useRef<(HTMLDivElement | null)[]>([]);
    const perfRef = useRef<SVGPathElement>(null);
    const pathEls = useRef<SVGPathElement[]>([]);
    const progress = useRef(0.5);
    const lenRef = useRef(1);
    const mobile = useMedia(MOBILE_QUERY);

    const render = useCallback((p: number) => {
      progress.current = p;
      const travel = (N - 1) * GAP;
      tracks.current.forEach((el, i) => {
        if (!el) return;
        const d = 50 + i * GAP - p * travel;
        const far = Math.min(1, Math.abs(d - 50) / 50);
        el.style.offsetDistance = `${Math.max(-20, Math.min(120, d))}%`;
        el.style.transform = `scale(${(1 - far * 0.38).toFixed(3)})`;
        // ноутбук остаётся непрозрачным; «бледность» — бумажная вуаль поверх (opacity)
        el.style.opacity = d < -6 || d > 106 ? '0' : '1';
        el.style.setProperty('--wash', (far * 0.55).toFixed(3));
        el.style.zIndex = String(100 - Math.round(far * 50));
      });
      if (perfRef.current) perfRef.current.style.strokeDashoffset = `${(p * travel / 100) * lenRef.current}`;
    }, []);

    const layout = useCallback(() => {
      const box = ribbonRef.current;
      if (!box || mobile) return;
      const w = box.clientWidth, h = box.clientHeight;
      // Пологая S-кривая: углы касательной небольшие, ноутбуки почти не «кренятся»
      const d = `M ${-0.2 * w} ${0.62 * h} C ${0.12 * w} ${0.66 * h}, ${0.22 * w} ${0.34 * h}, ${0.5 * w} ${0.42 * h} S ${0.86 * w} ${0.66 * h}, ${1.2 * w} ${0.36 * h}`;
      pathEls.current.forEach((el) => el?.setAttribute('d', d));
      box.querySelector('svg')?.setAttribute('viewBox', `0 0 ${w} ${h}`);
      lenRef.current = pathEls.current[0]?.getTotalLength() ?? 1;
      tracks.current.forEach((el) => { if (el) el.style.offsetPath = `path("${d}")`; });
      render(progress.current);
    }, [mobile, render]);

    useEffect(() => {
      if (mobile) return;
      layout();
      const ro = new ResizeObserver(layout);
      if (ribbonRef.current) ro.observe(ribbonRef.current);
      return () => ro.disconnect();
    }, [layout, mobile]);

    useImperativeHandle(ref, () => ({
      get sheet() { return sheetRef.current; },
      setProgress: render,
    }), [render]);

    return (
      <Sheet as="section" ref={sheetRef} id="featured" holes grain={0.05} className="album__sheet featured" aria-labelledby="featured-title">
        <div className="sheet-shade" aria-hidden="true" />
        <header className="featured__head">
          <h2 className="t-h2" id="featured-title">Избранное</h2>
          <p className="t-caption featured__count">Лента · {String(N).padStart(2, '0')} проектов</p>
        </header>

        {!mobile ? (
          <div className="ribbon" ref={ribbonRef}>
            <svg className="ribbon__svg" aria-hidden="true" preserveAspectRatio="none">
              <path ref={(el) => { if (el) pathEls.current[0] = el; }} className="ribbon__edge" />
              <path ref={(el) => { if (el) pathEls.current[1] = el; }} className="ribbon__band" />
              <path ref={(el) => { if (el) { pathEls.current[2] = el; perfRef.current = el; } }} className="ribbon__perf" />
              <path ref={(el) => { if (el) pathEls.current[3] = el; }} className="ribbon__core" />
            </svg>
            <ul className="ribbon__list">
              {featured.map((p, i) => (
                <li key={p.id} className="ribbon__track" ref={(el) => { tracks.current[i] = el as unknown as HTMLDivElement; }}>
                  <Laptop project={p} onOpen={onOpen} eager={i < 2} onFocus={() => onFocusItem?.(i, N)} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="featured__column">
            {featured.map((p, i) => (
              <li key={p.id} className="featured__item" style={{ ['--tilt' as string]: `${i % 2 ? 2 : -2}deg` }}>
                <Laptop project={p} onOpen={onOpen} />
                <p className="featured__meta">
                  <span className="t-caption">{p.category} · {p.year}</span>
                  <span className="t-h3">{p.title}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    );
  },
);
