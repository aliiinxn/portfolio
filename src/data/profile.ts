/** Личные данные читаются из content/site.json — его редактирует админка (/admin). */
import site from '../../content/site.json';
import { asset } from './projects';

const handle = (v: string) => v.replace(/^@/, '').replace(/^https?:\/\/(www\.)?[^/]+\//, '').replace(/\/$/, '');
const tg = handle(site.telegram);
const ig = handle(site.instagram);
const be = site.behance.startsWith('http') ? site.behance : `https://www.behance.net/${handle(site.behance)}`;

export const profile = {
  firstName: site.firstName,
  lastName: site.lastName,
  role: site.role,
  specialization: site.specialization,
  location: site.location,
  year: site.year,
  experience: site.experience,
  about: site.about,
  ctaTitle: site.ctaTitle,
  ctaText: site.ctaText,
  photo: { src: asset(site.photo), alt: site.photoAlt },
  contacts: {
    telegram: { label: `@${tg}`, href: `https://t.me/${tg}` },
    email: { label: site.email, href: `mailto:${site.email}` },
    behance: { label: be.replace(/^https?:\/\/(www\.)?/, ''), href: be },
    instagram: { label: `@${ig}`, href: `https://instagram.com/${ig}/` },
  },
  pdf: asset(site.pdf),
};

export const stickers: { label: string; text: string }[] = site.stickers;
