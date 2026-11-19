import { useEffect, useRef, useState } from 'react';
import { Button, Glass, Icon } from './base';
import { goTo } from '../lib/motion';
import { useUi, type SectionId } from '../lib/store';
import './nav.css';

const LINKS: { id: SectionId; label: string }[] = [
  { id: 'about', label: 'Обо мне' },
  { id: 'featured', label: 'Избранное' },
  { id: 'archive', label: 'Архив' },
  { id: 'contacts', label: 'Контакты' },
];

export function Nav() {
  const active = useUi((s) => s.active);
  const modal = useUi((s) => s.modalOpen);
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dark = active === 'contacts';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault(); setOpen(false); goTo(id);
  };

  const list = (
    <ul className="nav__list">
      {LINKS.map((l) => (
        <li key={l.id}>
          <a href={`#${l.id}`} className={`nav__link t-label${active === l.id ? ' is-active' : ''}`}
            aria-current={active === l.id ? 'true' : undefined} onClick={go(l.id)}>{l.label}</a>
        </li>
      ))}
    </ul>
  );

  return (
    <header className={`site-header${modal ? ' is-hidden' : ''}${dark ? ' on-dark' : ''}`}>
      <a href="#main" className="skip-link btn btn--clear">К содержанию</a>
      <nav aria-label="Основная навигация">
        <Glass size="pill" tone={dark ? 'dark' : 'light'} className="nav nav--desktop">{list}</Glass>
        <div className="nav--mobile">
          <Button ref={btnRef} round variant={dark ? 'dark' : 'clear'} icon={open ? Icon.close : Icon.menu}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open} aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)} />
          {open && (
            <Glass id="mobile-menu" size="lg" tone={dark ? 'dark' : 'light'} className="nav__panel">{list}</Glass>
          )}
        </div>
      </nav>
    </header>
  );
}
