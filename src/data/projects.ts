/**
 * Проекты читаются из content/projects/*.json — их редактирует админка (/admin).
 * Порядок — по полю num.
 */
export type Project = {
  id: string;
  num: string;
  title: string;
  category: string;
  tab?: string;           // короткая подпись на язычке папки
  year: string;
  featured: boolean;
  previews: string[];     // 2–3 листа-превью в папке
  main: string;           // главный макет (по нему выноски)
  fonts: string;
  colors: string[];       // 3–5 HEX проекта
  grid: string;
  task: string;
  result: string;
  badge: string;
  gallery: string[];
  description: string;
};

/** Путь из админки (/uploads/x.webp) → путь с учётом base. */
export const asset = (p?: string) => {
  if (!p) return '';
  if (/^(https?:|data:)/.test(p)) return p;
  return import.meta.env.BASE_URL + p.replace(/^\/+/, '');
};

type Raw = Partial<Project> & { previews?: unknown; gallery?: unknown; colors?: unknown };
const files = import.meta.glob<Raw>('../../content/projects/*.json', { eager: true, import: 'default' });

const list = (v: unknown) => (Array.isArray(v) ? v.filter(Boolean).map(String) : []);

export const projects: Project[] = Object.entries(files)
  .map(([path, r]) => {
    const main = asset(r.main);
    const previews = list(r.previews).map(asset).slice(0, 3);
    const gallery = list(r.gallery).map(asset);
    const colors = list(r.colors);
    return {
      id: path.split('/').pop()!.replace('.json', ''),
      num: String(r.num ?? ''),
      title: r.title ?? 'Без названия',
      category: r.category ?? '',
      tab: r.tab || undefined,
      year: String(r.year ?? ''),
      featured: r.featured !== false,
      previews: previews.length ? previews : [main],
      main: main || previews[0] || '',
      fonts: r.fonts ?? '',
      colors: colors.length ? colors : ['#6F5B42'],
      grid: r.grid ?? '',
      task: r.task ?? '',
      result: r.result ?? '',
      badge: r.badge ?? '',
      gallery: gallery.length ? gallery : [main],
      description: r.description ?? '',
    };
  })
  .sort((a, b) => a.num.localeCompare(b.num, 'ru', { numeric: true }));
