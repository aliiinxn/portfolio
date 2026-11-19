import { useEffect } from 'react';
import { Button, Glass, Icon, Rings, Selection, Sheet, Stamp, Sticker, Tape } from './components/base';
import { Folder, Laptop } from './components/objects';
import { projects } from './data/projects';
import { detectGlassSupport } from './lib/motion';
import './showcase.css';

const SWATCHES = [
  ['--ink', '#15160A'], ['--kraft', '#6F5B42'], ['--sand', '#B5A892'], ['--stone', '#BEBBB4'], ['--paper', '#D2D2D1'],
  ['--ink-muted', '#3F3B2E'], ['--kraft-deep', '#4E3F2E'], ['--paper-light', '#F2F0EA'],
  ['--chrome-light', '#F7F6F3'], ['--chrome-mid', '#A9A7A1'], ['--chrome-shade', '#6E6C67'],
];

/** Витрина компонентов (шаг 1). Открывается по адресу …#showcase */
export function Showcase() {
  useEffect(() => { detectGlassSupport(); document.querySelectorAll('.selection').forEach((s) => s.classList.add('is-drawn')); }, []);
  const noop = () => {};
  return (
    <>
      <Rings />
      <main className="showcase">
        <Sheet as="section" holes className="sc-sheet" aria-labelledby="sc-title">
          <p className="t-caption sc-muted">Творческое досье · витрина компонентов</p>
          <h1 className="t-h1" id="sc-title">Система <span className="t-display">досье</span></h1>
          <p className="t-body-l sc-lead">Бумага — содержание. Стекло — интерфейс. Хром — вещи. <a href="#">← на сайт</a></p>

          <h2 className="t-h3 sc-h">Палитра</h2>
          <ul className="sc-swatches">
            {SWATCHES.map(([n, hex]) => (
              <li key={n}><span style={{ background: `var(${n})` }} /><b className="t-label">{n}</b><span className="t-caption sc-muted">{hex}</span></li>
            ))}
          </ul>

          <h2 className="t-h3 sc-h">Типографика</h2>
          <div className="sc-type">
            <p className="t-h1">Алина <span className="t-display">дизайнер</span></p>
            <p className="t-h2">H2 · Избранное</p>
            <p className="t-h3">H3 · Название проекта</p>
            <p className="t-body-l">Body L — Работаю по понятной системе, каждый этап согласовываем.</p>
            <p className="t-body">Body — основной текст 16px, не мельче.</p>
            <p className="t-label">Label — кнопки, навигация, язычки</p>
            <p className="t-caption">Caption — поля досье, подписи выносок</p>
            <p className="t-sticker">Sticker — Сначала смысл, потом красота</p>
            <p className="t-note" style={{ color: 'var(--kraft-deep)' }}>Note — пометка от руки</p>
          </div>

          <h2 className="t-h3 sc-h">Кнопки — толстое стекло с фаской</h2>
          <div className="sc-row sc-photo-bg">
            <Button>Прозрачная</Button>
            <Button variant="primary" icon={Icon.arrowRight}>Основная</Button>
            <Button round icon={Icon.close} aria-label="Закрыть" />
            <Button disabled>Disabled</Button>
          </div>
          <div className="sc-row sc-dark on-dark">
            <Button variant="dark">Стекло на тёмном</Button>
            <Button variant="primary">Обсудить проект</Button>
            <Button variant="dark" round icon={Icon.menu} aria-label="Меню" />
          </div>

          <h2 className="t-h3 sc-h">Стекло</h2>
          <div className="sc-row sc-photo-bg">
            <Glass className="sc-glass"><span className="t-caption">Glass · light</span><span className="t-h3">Выноска / окно</span></Glass>
            <Glass tone="strong" size="lg" className="sc-glass"><span className="t-caption">Glass · strong</span><span className="t-body">Плотное — для модалки с текстом</span></Glass>
            <Glass tone="dark" size="lg" className="sc-glass"><span className="t-caption">Glass · dark</span><span className="t-body">Кромка ярче, текст paper-light</span></Glass>
          </div>

          <h2 className="t-h3 sc-h">Бумага, стикеры, печати, выделение</h2>
          <div className="sc-row">
            <Sheet size="small" className="sc-small">
              <Tape rotate={-3} style={{ top: -10, left: 30 }} />
              <span className="t-caption sc-muted">Лист · Sheet</span>
              <span className="t-h3">Название</span>
              <span className="t-note" style={{ color: 'var(--kraft-deep)' }}>пометка</span>
            </Sheet>
            <Sticker label="Подход" text="Не шаблоны. Системы." rotate={-2} />
            <Sticker label="Сроки" text="Дедлайн — не враг, а план" rotate={2} tone="light" />
            <div className="sc-kraft"><Stamp text="В работе" center="2026" /></div>
            <Stamp text="Готово" color="var(--kraft)" textColor="var(--ink)" center="04" />
            <p className="t-h2"><Selection>выделение</Selection></p>
          </div>

          <h2 className="t-h3 sc-h">Хром: папка · ноутбук</h2>
          <div className="sc-row sc-objects">
            <Folder project={projects[0]} onOpen={noop} />
            <Folder project={projects[1]} onOpen={noop} />
            <div style={{ width: 360 }}><Laptop project={projects[1]} onOpen={noop} /></div>
          </div>
        </Sheet>
      </main>
    </>
  );
}
