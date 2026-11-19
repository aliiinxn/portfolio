import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Rings } from './components/base';
import { Nav } from './components/Nav';
import { Cursor } from './components/Cursor';
import { ProjectModal } from './components/ProjectModal';
import type { OpenHandler } from './components/objects';
import type { Project } from './data/projects';
import { profile } from './data/profile';
import { Cover } from './sections/Cover';
import { About, type AboutHandle } from './sections/About';
import { Featured, type FeaturedHandle } from './sections/Featured';
import { Archive } from './sections/Archive';
import { Final } from './sections/Final';
import { Showcase } from './Showcase';
import {
  gsap, ScrollTrigger, STAGE_QUERY, MOBILE_QUERY, REDUCED_QUERY,
  detectGlassSupport, initSmoothScroll, registerTarget, scrollToY,
} from './lib/motion';
import { setUi, type SectionId } from './lib/store';
import './sections/album.css';

const T = 6; // длина сценария альбома в «экранах»

function Site() {
  const [modal, setModal] = useState<{ p: Project; origin: HTMLElement } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<AboutHandle>(null);
  const featuredRef = useRef<FeaturedHandle>(null);
  const stageST = useRef<ScrollTrigger | null>(null);

  const open: OpenHandler = useCallback((p, origin) => setModal({ p, origin }), []);

  const focusFeatured = useCallback((i: number, n: number) => {
    const st = stageST.current;
    if (!st) return;
    const u = 3.4 + 2.4 * (n > 1 ? i / (n - 1) : 0);
    scrollToY(st.start + (u / T) * (st.end - st.start));
  }, []);

  useLayoutEffect(() => {
    detectGlassSupport();
    initSmoothScroll();
    const mm = gsap.matchMedia();
    const cover = coverRef.current!;
    const about = aboutRef.current!;
    const featured = featuredRef.current!;

    mm.add({ stage: STAGE_QUERY, mobile: MOBILE_QUERY, reduced: REDUCED_QUERY }, (ctx) => {
      const { stage, mobile, reduced } = ctx.conditions as Record<string, boolean>;

      /* --- Загрузка обложки: появление → рамка выделения → ручки --- */
      const dossier = cover.querySelector('.dossier');
      const sel = cover.querySelector('.dossier__sel');
      if (reduced) {
        gsap.fromTo(dossier, { opacity: 0 }, { opacity: 1, duration: 0.2 });
        sel?.classList.add('is-drawn');
      } else {
        gsap.fromTo(dossier, { opacity: 0, y: 24 }, {
          opacity: 1, y: 0, duration: 0.7, ease: 'dossierOut', delay: 0.15,
          onComplete: () => sel?.classList.add('is-drawn'),
        });
      }

      const sectionActive = (id: SectionId, el: Element | null) => el && ScrollTrigger.create({
        trigger: el, start: 'top center', end: 'bottom center',
        onToggle: (s) => { if (s.isActive) setUi({ active: id }); },
      });

      if (stage) {
        /* --- Альбом: pin + перелистывание вокруг колец --- */
        const state = { p: 0 };
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stageRef.current, pin: true, start: 'top top',
            end: () => `+=${window.innerHeight * T * 0.85}`,
            scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => {
              const u = self.progress * T;
              setUi({ active: u < 0.6 ? 'cover' : u < 2.9 ? 'about' : 'featured' });
              if (u > 0.55) about.playStickers();
              about.breathe(Math.min(1, Math.max(0, (u - 0.6) / 2.4)));
            },
          },
        });
        tl.to(cover, { rotateY: -160, duration: 1, ease: 'dossierFlip' }, 0)
          .fromTo(about.sheet!.querySelector('.sheet-shade'), { opacity: 1 }, { opacity: 0, duration: 1 }, 0)
          .fromTo(about.collage, { '--spread': 1 }, { '--spread': 0.22, duration: 1.2 }, 1)
          .to(about.sheet, { rotateY: -160, duration: 1, ease: 'dossierFlip' }, 2.4)
          .fromTo(featured.sheet!.querySelector('.sheet-shade'), { opacity: 1 }, { opacity: 0, duration: 1 }, 2.4)
          .fromTo(state, { p: 0 }, { p: 1, duration: 2.4, onUpdate: () => featured.setProgress(state.p) }, 3.4)
          .to({}, { duration: 0.2 }, 5.8);
        featured.setProgress(0);
        const st = tl.scrollTrigger!;
        stageST.current = st;
        const at = (u: number) => () => st.start + (u / T) * (st.end - st.start);
        registerTarget('cover', at(0));
        registerTarget('about', at(1.2));
        registerTarget('featured', at(3.45));
      } else {
        /* --- Поток: листы друг под другом --- */
        stageST.current = null;
        registerTarget('cover', () => 0);
        ['about', 'featured'].forEach((id) => registerTarget(id, () => {
          const el = document.getElementById(id)!;
          return el.getBoundingClientRect().top + window.scrollY - 8;
        }));
        sectionActive('cover', cover);
        sectionActive('about', about.sheet);
        sectionActive('featured', featured.sheet);
        ScrollTrigger.create({ trigger: about.sheet, start: 'top 70%', once: true, onEnter: () => about.playStickers() });
        featured.setProgress(0.5);

        if (!reduced) {
          gsap.fromTo(about.collage, { '--spread': 1 }, {
            '--spread': 0.22, ease: 'none',
            scrollTrigger: { trigger: about.collage, start: 'top 90%', end: 'center 45%', scrub: true },
          });
          ScrollTrigger.create({
            trigger: about.sheet, start: 'top bottom', end: 'bottom top',
            onUpdate: (s) => about.breathe(s.progress),
          });
          if (mobile) {
            // Мобайл: лист «перелистывается вверх» вокруг колец сверху
            [cover, about.sheet].forEach((el) => gsap.to(el, {
              rotateX: 38, transformPerspective: 1400, ease: 'none',
              scrollTrigger: { trigger: el, start: 'bottom 55%', end: 'bottom top', scrub: true },
            }));
          }
        } else {
          gsap.set(about.collage, { '--spread': 0.22 });
        }
      }

      /* --- Архив и Финал: колец нет — уезжают за край --- */
      ScrollTrigger.create({
        trigger: '#archive', start: 'top 75%',
        onEnter: () => setUi({ ringsHidden: true }),
        onLeaveBack: () => setUi({ ringsHidden: false, active: 'featured' }),
      });
      sectionActive('archive', document.getElementById('archive'));
      ScrollTrigger.create({
        trigger: '#contacts', start: 'top 55%', end: 'bottom top',
        onToggle: (s) => setUi({ active: s.isActive ? 'contacts' : 'archive' }),
      });
    });

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => mm.revert();
  }, []);

  return (
    <>
      <Rings />
      <Nav />
      <Cursor />
      <main id="main" tabIndex={-1}>
        <div className="album">
          <div className="album__stage" ref={stageRef}>
            <Cover ref={coverRef} />
            <About ref={aboutRef} />
            <Featured ref={featuredRef} onOpen={open} onFocusItem={focusFeatured} />
          </div>
        </div>
        <Archive onOpen={open} />
        <Final />
      </main>
      <footer className="site-footer">
        <p className="t-caption">© {profile.firstName} {profile.lastName}, {profile.year} · Дело закрыто — до нового проекта</p>
      </footer>
      <ProjectModal project={modal?.p ?? null} origin={modal?.origin ?? null} onClose={() => setModal(null)} />
    </>
  );
}

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash === '#showcase' ? <Showcase /> : <Site />;
}
