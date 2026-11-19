import { forwardRef, useEffect, useState } from 'react';
import { Button, Glass, Grain, Icon, Selection, Sheet, Stamp } from '../components/base';
import { profile } from '../data/profile';
import { projects } from '../data/projects';
import { goTo, prefersReduced } from '../lib/motion';
import './cover.css';

/** 6.1 Обложка-досье. Главный приём — рамка выделения. */
export const Cover = forwardRef<HTMLElement>(function Cover(_, ref) {
  const previews = projects.map((p) => p.main);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (prefersReduced()) return;
    const t = window.setInterval(() => setIdx((i) => (i + 1) % previews.length), 3000);
    return () => window.clearInterval(t);
  }, [previews.length]);

  return (
    <Sheet as="section" ref={ref} id="cover" holes grain={0.05} className="album__sheet cover" aria-labelledby="cover-title">
      <div className="sheet-shade" aria-hidden="true" />
      <div className="cover__desk">
        <div className="dossier" data-anim="dossier">
          <Grain opacity={0.07} />
          <div className="dossier__fields">
            <p className="t-caption t-caption--13">Дело № 001</p>
            <dl className="dossier__dl t-caption t-caption--13">
              <div><dt>Дизайнер:</dt> <dd>{profile.firstName} {profile.lastName}</dd></div>
              <div><dt>Специализация:</dt> <dd>{profile.specialization}</dd></div>
              <div><dt>Статус:</dt> <dd>Открыто для проектов</dd></div>
            </dl>
          </div>

          <Stamp text="В работе" className="dossier__stamp" size={124} rotate={-4} center="2026" />

          <h1 className="dossier__title" id="cover-title">
            <span className="t-h1">{profile.firstName}</span>{' '}
            <Selection className="dossier__sel"><span className="t-display">{profile.role}</span></Selection>
          </h1>

          <div className="dossier__window" aria-hidden="true">
            {previews.map((src, i) => (
              <img key={src} src={src} alt="" className={i === idx ? 'is-on' : ''} decoding="async" />
            ))}
            <Glass className="dossier__window-glass" />
          </div>

          <div className="dossier__clasp">
            <span className="dossier__strap" aria-hidden="true" />
            <Button variant="dark" round icon={Icon.arrowRight} aria-label="Открыть досье" onClick={() => goTo('about')} />
          </div>
        </div>
      </div>
      <p className="cover__hint t-caption" aria-hidden="true">Листайте вниз</p>
    </Sheet>
  );
});
