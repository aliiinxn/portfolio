# Творческое досье — портфолио Алины Гасевской

React + Vite + TypeScript, GSAP/ScrollTrigger, Lenis. Значения стилей — только токены из `src/styles/tokens.css`.

## Запуск
```
npm install
npm run dev      # разработка
npm run build    # сборка в dist/
```

## Админка (без кода)
Сайт на Netlify, контент — в `content/`. Откройте `https://alina-gasevskaya.netlify.app/admin`, войдите,
поменяйте тексты/проекты/картинки и нажмите «Опубликовать». Netlify пересоберёт сайт за 1–2 минуты.
Вход — по почте и паролю (Netlify Identity + Git Gateway, регистрация только по приглашению).
Настройки админки — `public/admin/config.yml`.

## Где что менять (вручную)
- `content/projects/*.json` — проекты (один файл = один проект). Картинки — в `public/uploads/` (WebP, ~1600×1000).
- `content/site.json` — имя, текст «Обо мне», стикеры, контакты, ссылка на PDF.
- `public/portfolio.pdf` — положите сюда PDF-портфолио.
- `public/og-cover.png` — картинка для Open Graph (1200×630, обложка досье).
- Всё в [скобках] — плейсхолдеры, заменить.
- `…/#showcase` — витрина компонентов (токены, кнопки, стекло, папки).

## Структура
- `components/base.tsx` — Grain, Tape, Rings, Holes, Sheet, Glass, Button, Sticker, Selection, Stamp
- `components/objects.tsx` — Folder (хром), Laptop
- `components/ProjectModal.tsx` — модалка (FLIP, выноски, focus-trap, Esc)
- `sections/` — Cover, About, Featured, Archive, Final
- `App.tsx` — сценарий альбома (pin + перелистывание), кольца, навигация
