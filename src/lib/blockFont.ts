/**
 * Геометрический «вырубной» шрифт: буквы из прямоугольников и полуколец.
 * Сетка глифа 4×6 единиц. Используется в маске финальной обложки.
 */
const T = 1.3; // толщина штриха

const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}Z`;
const ringTop = (cx: number, cy: number, R: number, r: number) =>
  `M${cx - R} ${cy}A${R} ${R} 0 0 1 ${cx + R} ${cy}L${cx + r} ${cy}A${r} ${r} 0 0 0 ${cx - r} ${cy}Z`;
const ringBottom = (cx: number, cy: number, R: number, r: number) =>
  `M${cx - R} ${cy}A${R} ${R} 0 0 0 ${cx + R} ${cy}L${cx + r} ${cy}A${r} ${r} 0 0 1 ${cx - r} ${cy}Z`;
const ringRight = (cx: number, cy: number, R: number, r: number) =>
  `M${cx} ${cy - R}A${R} ${R} 0 0 1 ${cx} ${cy + R}L${cx} ${cy + r}A${r} ${r} 0 0 0 ${cx} ${cy - r}Z`;

const lowerBowl = () => rect(T, 2.4, 2.2 - T, T) + rect(T, 6 - T, 2.2 - T, T) + ringRight(2.2, 4.2, 1.8, 1.8 - T);

export const GLYPHS: Record<string, string> = {
  А: ringTop(2, 2, 2, 2 - T) + rect(0, 2, T, 4) + rect(4 - T, 2, T, 4) + rect(T, 3.3, 4 - 2 * T, 1.1),
  Б: rect(0, 0, T, 6) + rect(T, 0, 4 - T, 1.2) + lowerBowl(),
  В: rect(0, 0, T, 6)
    + rect(T, 0, 2.4 - T, 1.15) + rect(T, 1.75, 2.4 - T, 1.15) + ringRight(2.4, 1.45, 1.45, 0.3)
    + rect(T, 2.6, 2.3 - T, 1.25) + rect(T, 4.75, 2.3 - T, 1.25) + ringRight(2.3, 4.3, 1.7, 0.45),
  Д: rect(0.9, 0, 3.1, T) + rect(0.9, 0, T, 4.4) + rect(4 - T, 0, T, 4.4) + rect(0, 4.2, 4, 1.2) + rect(0, 5.4, 1, 0.6) + rect(3, 5.4, 1, 0.6),
  Й: rect(0, 1.4, T, 4.6) + rect(4 - T, 1.4, T, 4.6) + rect(T, 3.9, 0.8, 1.2) + rect(T + 0.7, 2.7, 4 - 2 * T - 0.7, 1.2) + ringBottom(2, 0, 1.1, 0.45),
  Р: rect(0, 0, T, 6) + rect(T, 0, 2.2 - T, T) + rect(T, 3.6 - T, 2.2 - T, T) + ringRight(2.2, 1.8, 1.8, 1.8 - T),
  О: ringTop(2, 2, 2, 2 - T) + rect(0, 2, T, 2) + rect(4 - T, 2, T, 2) + ringBottom(2, 4, 2, 2 - T),
  Т: rect(0, 0, 4, T) + rect(2 - T / 2, 0, T, 6),
  Ь: rect(0, 0, T, 6) + lowerBowl(),
  Н: rect(0, 0, T, 6) + rect(4 - T, 0, T, 6) + rect(T, 2.4, 4 - 2 * T, 1.2),
  И: rect(0, 0, T, 6) + rect(4 - T, 0, T, 6) + rect(T, 3.4, 0.8, 1.2) + rect(T + 0.7, 2.2, 4 - 2 * T - 0.7, 1.2),
  П: rect(0, 0, 4, T) + rect(0, 0, T, 6) + rect(4 - T, 0, T, 6),
  Ш: rect(0, 0, 1.1, 6) + rect(1.45, 0, 1.1, 6) + rect(2.9, 0, 1.1, 6) + rect(0, 4.8, 4, 1.2),
  М: rect(0, 0, T, 6) + rect(4 - T, 0, T, 6) + ringBottom(2, 0, 2 - T + 0.01, 0.01) + rect(1.5, 0, 1, 2.6),
  Е: rect(0, 0, T, 6) + rect(T, 0, 4 - T, 1.2) + rect(T, 2.4, 2.6 - T, 1.2) + rect(T, 4.8, 4 - T, 1.2),
};

export type Placed = { d: string; x: number; y: number; sx: number; sy: number };

/** Раскладывает строки так, чтобы они плотно заполнили прямоугольник (как узор). */
export function layoutLines(lines: string[], box: { x: number; y: number; w: number; h: number }, gapX: number, gapY: number): Placed[] {
  const out: Placed[] = [];
  const lh = (box.h - gapY * (lines.length - 1)) / lines.length;
  lines.forEach((line, li) => {
    const chars = [...line];
    const n = chars.length;
    const uw = (box.w - gapX * (n - 1)) / n; // ширина буквы
    chars.forEach((ch, i) => {
      const d = GLYPHS[ch];
      if (!d) return;
      out.push({ d, x: box.x + i * (uw + gapX), y: box.y + li * (lh + gapY), sx: uw / 4, sy: lh / 6 });
    });
  });
  return out;
}
