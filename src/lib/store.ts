import { useSyncExternalStore } from 'react';

/** Маленькое глобальное состояние интерфейса без библиотек. */
type State = {
  ringsHidden: boolean;
  active: SectionId;
  modalOpen: boolean;
};
export type SectionId = 'cover' | 'about' | 'featured' | 'archive' | 'contacts';

let state: State = { ringsHidden: false, active: 'cover', modalOpen: false };
const listeners = new Set<() => void>();

export function setUi(patch: Partial<State>) {
  let changed = false;
  for (const k in patch) {
    const key = k as keyof State;
    if (state[key] !== patch[key]) changed = true;
  }
  if (!changed) return;
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useUi<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => sel(state),
  );
}

export const getUi = () => state;
