import { Sheet } from '../components/base';
import { Folder, type OpenHandler } from '../components/objects';
import { projects } from '../data/projects';
import './archive.css';

/** 6.4 Архив — хромированные папки. Колец и отверстий нет. */
export function Archive({ onOpen }: { onOpen: OpenHandler }) {
  return (
    <Sheet as="section" id="archive" grain={0.05} className="archive" aria-labelledby="archive-title">
      <div className="archive__inner container">
        <header className="archive__head">
          <h2 className="t-h2" id="archive-title">Архив</h2>
          <p className="t-caption archive__count">{String(projects.length).padStart(2, '0')} дел · все проекты</p>
        </header>
        <ul className="archive__row">
          {projects.map((p) => (
            <li key={p.id}><Folder project={p} onOpen={onOpen} /></li>
          ))}
        </ul>
        <p className="t-note archive__note" aria-hidden="true">наведите — папка приоткроется</p>
      </div>
    </Sheet>
  );
}
