"use client";

/**
 * Coordinación entre el preloader y la animación de entrada del hero.
 * El hero espera a que el preloader termine (o arranca de inmediato si no hay).
 */
const EVENT = "ch:intro-complete";

declare global {
  interface Window {
    __chIntroDone?: boolean;
  }
}

export function markIntroComplete() {
  window.__chIntroDone = true;
  window.dispatchEvent(new Event(EVENT));
}

export function onIntroComplete(cb: () => void) {
  if (window.__chIntroDone) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener(EVENT, handler, { once: true });
  return () => window.removeEventListener(EVENT, handler);
}
