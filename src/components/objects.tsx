import { forwardRef, type FocusEventHandler } from 'react';
import type { Project } from '../data/projects';
import { Glass } from './base';
import './objects.css';

export type OpenHandler = (p: Project, origin: HTMLElement) => void;

/* ================= Folder — хромированная папка ================= */
export function Folder({ project, onOpen }: { project: Project; onOpen: OpenHandler }) {
  return (
    <button
      type="button"
      className="folder"
      aria-label={`Открыть проект: ${project.title}`}
      data-cursor="open"
      onClick={(e) => onOpen(project, e.currentTarget.querySelector('.folder__sheet--1') as HTMLElement ?? e.currentTarget)}
    >
      <span className="folder__tab chrome-back" aria-hidden="true">
        <span className="t-caption engrave">{project.tab ?? project.category}</span>
      </span>
      <span className="folder__back chrome-back" aria-hidden="true" />
      <span className="folder__sheets" aria-hidden="true">
        {project.previews.map((src, i) => (
          <span className={`folder__sheet folder__sheet--${i}`} key={i}>
            <img src={src} alt="" loading="lazy" decoding="async" width="160" height="100" />
          </span>
        ))}
      </span>
      <span className="folder__front chrome-front">
        <span className="t-caption engrave">{project.num} · {project.year}</span>
        <span className="folder__title engrave">{project.title}</span>
      </span>
    </button>
  );
}

/* ================= Laptop — мокап ноутбука ================= */
export const Laptop = forwardRef<HTMLButtonElement, { project: Project; onOpen: OpenHandler; eager?: boolean; onFocus?: FocusEventHandler<HTMLButtonElement> }>(
  function Laptop({ project, onOpen, eager, onFocus }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className="laptop"
        aria-label={`Открыть проект: ${project.title}`}
        data-cursor="open"
        onFocus={onFocus}
        onClick={(e) => onOpen(project, e.currentTarget.querySelector('.laptop__screen') as HTMLElement)}
      >
        <span className="laptop__screen">
          <img src={project.main} alt={`Макет проекта «${project.title}»`} loading={eager ? 'eager' : 'lazy'} decoding="async" width="1600" height="1000" />
        </span>
        <span className="laptop__base" aria-hidden="true"><span className="laptop__notch" /></span>
        <Glass className="laptop__caption" blur="sm" aria-hidden="true">
          <span className="t-caption" style={{ color: 'var(--ink-muted)' }}>{project.category}</span>
          <span className="t-h3">{project.title}</span>
        </Glass>
      </button>
    );
  },
);
