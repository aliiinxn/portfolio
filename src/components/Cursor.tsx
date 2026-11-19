import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReduced } from '../lib/motion';
import './cursor.css';

/** 7.10 Курсор: точка kraft 8px → стеклянный круг 48px с подписью «Открыть». Только десктоп. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled] = useState(() => window.matchMedia('(pointer: fine) and (min-width: 768px)').matches && !prefersReduced());
  const [mode, setMode] = useState<'dot' | 'ring' | 'open'>('dot');

  useEffect(() => {
    if (!enabled || !ref.current) return;
    document.documentElement.classList.add('has-cursor');
    const xTo = gsap.quickTo(ref.current, 'x', { duration: 0.25, ease: 'power3.out' });
    const yTo = gsap.quickTo(ref.current, 'y', { duration: 0.25, ease: 'power3.out' });
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX); yTo(e.clientY);
      const t = (e.target as HTMLElement).closest?.('[data-cursor="open"], a, button, [role="region"]');
      setMode(!t ? 'dot' : t.getAttribute('data-cursor') === 'open' ? 'open' : 'ring');
    };
    const onLeave = () => ref.current && (ref.current.style.opacity = '0');
    const onEnter = () => ref.current && (ref.current.style.opacity = '1');
    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div className={`cursor cursor--${mode}`} ref={ref} aria-hidden="true">
      <span className="cursor__dot" />
      <span className="cursor__glass" />
      <span className="cursor__label t-caption">Открыть</span>
    </div>
  );
}
