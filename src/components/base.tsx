import { forwardRef } from 'react';
import type { CSSProperties, ElementType, ReactNode, AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, Ref } from 'react';
import { useUi } from '../lib/store';
import './base.css';

/* ================= Grain ================= */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.08 0 0 0 0 0.086 0 0 0 0 0.04 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Зерно поверх бумаги. opacity 0.03–0.07 (обложка — 0.06–0.08). */
export function Grain({ opacity = 0.05 }: { opacity?: number }) {
  return <span className="grain" aria-hidden="true" style={{ opacity, backgroundImage: NOISE }} />;
}

/* ================= Tape ================= */
export function Tape({ style, rotate = -3 }: { style?: CSSProperties; rotate?: number }) {
  return <span className="tape" aria-hidden="true" style={{ transform: `rotate(${rotate}deg)`, ...style }} />;
}

/* ================= Rings ================= */
export function Rings() {
  const hidden = useUi((s) => s.ringsHidden);
  return (
    <div className={`rings${hidden ? ' rings--hidden' : ''}`} aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <span className="rings__slot" key={i}>
          <span className="ring-shadow"><span className="ring" /></span>
        </span>
      ))}
    </div>
  );
}

/** Отверстия в листе — ровно напротив колец (sticky-колонка повторяет сетку колец). */
export function Holes() {
  return (
    <span className="holes" aria-hidden="true">
      <span className="holes__track">
        {Array.from({ length: 6 }, (_, i) => (
          <span className="holes__slot" key={i}><span className="hole" /></span>
        ))}
      </span>
    </span>
  );
}

/* ================= Sheet ================= */
type SheetProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  holes?: boolean;
  grain?: number;
  size?: 'page' | 'small';
};
export const Sheet = forwardRef<HTMLElement, SheetProps>(function Sheet(
  { as: Tag = 'div', className = '', children, holes, grain = 0.05, size = 'page', ...rest }, ref) {
  return (
    <Tag ref={ref} className={`sheet sheet--${size} ${holes ? 'sheet--holes' : ''} ${className}`} {...rest}>
      {grain > 0 && <Grain opacity={grain} />}
      {holes && <Holes />}
      {children}
    </Tag>
  );
});

/* ================= Glass ================= */
type GlassProps = {
  as?: ElementType;
  tone?: 'light' | 'strong' | 'dark';
  size?: 'md' | 'lg' | 'pill';
  blur?: 'md' | 'sm';
  className?: string;
  children?: ReactNode;
  [k: string]: unknown;
};
export function Glass({ as: Tag = 'div', tone = 'light', size = 'md', blur = 'md', className = '', children, ...rest }: GlassProps) {
  const cls = [
    'glass',
    size === 'lg' && 'glass--lg',
    size === 'pill' && 'glass--pill',
    tone === 'strong' && 'glass--strong',
    tone === 'dark' && 'glass--dark',
    blur === 'sm' && 'glass--sm',
    className,
  ].filter(Boolean).join(' ');
  return <Tag className={cls} {...rest}>{children}</Tag>;
}

/* ================= Button ================= */
type BtnBase = {
  variant?: 'clear' | 'primary' | 'dark';
  round?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
};
type BtnAsButton = BtnBase & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined; ref?: Ref<HTMLButtonElement> };
type BtnAsLink = BtnBase & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Button(props: BtnAsButton | BtnAsLink) {
  const { variant = 'clear', round, icon, children, className = '', ...rest } = props;
  const cls = `btn btn--${variant}${round ? ' btn--round' : ''} ${className}`;
  const inner = (<>{icon && <span className="btn__icon" aria-hidden="true">{icon}</span>}{children && <span className="btn__text">{children}</span>}</>);
  if ('href' in rest && rest.href !== undefined) {
    return <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{inner}</a>;
  }
  return <button type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>{inner}</button>;
}

/* Линейные иконки 22px, stroke 1.8 */
export const Icon = {
  close: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>),
  arrowRight: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>),
  arrowDown: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>),
  menu: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 8h16M4 16h16" /></svg>),
  chevronLeft: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>),
  chevronRight: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>),
};

/* ================= Sticker ================= */
export function Sticker({ label, text, tone = 'sand', rotate = 0, className = '', style }:
  { label: string; text: string; tone?: 'sand' | 'light'; rotate?: number; className?: string; style?: CSSProperties }) {
  return (
    <div className={`sticker sticker--${tone} ${className}`} style={{ ...style, ['--rot' as string]: `${rotate}deg` }}>
      <Grain opacity={0.05} />
      <Tape rotate={rotate > 0 ? -4 : 3} style={{ top: -10, left: '50%', marginLeft: -40 }} />
      <span className="t-caption sticker__label">{label}</span>
      <span className="t-sticker sticker__text">{text}</span>
    </div>
  );
}

/* ================= Selection (рамка выделения как в Figma) ================= */
export function Selection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`selection ${className}`}>
      <span className="selection__plate" aria-hidden="true" />
      <span className="selection__text">{children}</span>
      <span className="selection__handle selection__handle--bl" aria-hidden="true" />
      <span className="selection__handle selection__handle--tr" aria-hidden="true" />
    </span>
  );
}

/* ================= Stamp (круглая печать, текст по кругу) ================= */
export function Stamp({ text, color = 'var(--paper-light)', textColor, size = 120, rotate = -4, center, className = '' }:
  { text: string; color?: string; textColor?: string; size?: number; rotate?: number; center?: string; className?: string }) {
  const id = `stamp-${text.replace(/\s/g, '')}-${size}`;
  const full = `${text} · ${text} · `;
  return (
    <svg className={`stamp ${className}`} width={size} height={size} viewBox="0 0 120 120" style={{ transform: `rotate(${rotate}deg)` }} role="img" aria-label={`Печать: ${text}`}>
      <defs><path id={id} d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" /></defs>
      <circle cx="60" cy="60" r="57" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="60" cy="60" r="33" fill="none" stroke={color} strokeWidth="1.25" />
      <text fill={textColor ?? color} style={{ font: '600 12px var(--font-body)', letterSpacing: '.16em' }}>
        <textPath href={`#${id}`} textLength="272">{full.toUpperCase()}</textPath>
      </text>
      {center && <text x="60" y="65" textAnchor="middle" fill={textColor ?? color} style={{ font: '800 14px var(--font-heading)' }}>{center}</text>}
    </svg>
  );
}
