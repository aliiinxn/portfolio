import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);
// Easing из токенов: --ease-out и --ease-flip
CustomEase.create('dossierOut', 'M0,0 C0.22,1 0.36,1 1,1');
CustomEase.create('dossierFlip', 'M0,0 C0.65,0 0.35,1 1,1');

/** Режим «альбома»: перелистывание с pin. Тот же запрос — в album.css. */
export const STAGE_QUERY = '(min-width: 768px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)';
export const MOBILE_QUERY = '(max-width: 767px)';
export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

export const prefersReduced = () => window.matchMedia(REDUCED_QUERY).matches;
export const isStage = () => window.matchMedia(STAGE_QUERY).matches;

let lenis: Lenis | null = null;

export function initSmoothScroll() {
  if (lenis || prefersReduced()) return lenis;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function getLenis() { return lenis; }

export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.2 });
  else window.scrollTo({ top: y, behavior: prefersReduced() ? 'auto' : 'smooth' });
}

export function lockScroll(lock: boolean) {
  if (lenis) { if (lock) lenis.stop(); else lenis.start(); }
  document.documentElement.style.overflow = lock ? 'hidden' : '';
}

/** Регистр «куда скроллить» для навигации: секции внутри pin-альбома — по прогрессу. */
const targets = new Map<string, () => number>();
export const registerTarget = (id: string, fn: () => number) => { targets.set(id, fn); };
export const unregisterTarget = (id: string) => { targets.delete(id); };
export function goTo(id: string) {
  const fn = targets.get(id);
  if (fn) { scrollToY(fn()); return; }
  const el = document.getElementById(id);
  if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY);
}

/** Слабое устройство или нет backdrop-filter → фолбэк стекла. */
export function detectGlassSupport() {
  const supports = CSS.supports('backdrop-filter', 'blur(1px)') || CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  const nav = navigator as Navigator & { deviceMemory?: number };
  const weak = (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) || (nav.deviceMemory && nav.deviceMemory <= 2);
  if (!supports || weak) document.documentElement.classList.add('no-glass');
}

export { gsap, ScrollTrigger };
