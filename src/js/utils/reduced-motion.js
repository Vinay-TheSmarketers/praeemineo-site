/**
 * Central reduced-motion signal shared by every motion module. Wraps
 * `matchMedia('(prefers-reduced-motion: reduce)')` and stays live if the
 * user flips the OS-level setting mid-session (matters because
 * `gsap.matchMedia()` in main.js re-runs its handlers automatically when
 * this query's match state changes).
 * @module utils/reduced-motion
 */

const query = window.matchMedia('(prefers-reduced-motion: reduce)');

/** @type {Set<(reduced: boolean) => void>} */
const listeners = new Set();

/**
 * @returns {boolean} whether the user currently prefers reduced motion
 */
export function prefersReducedMotion() {
  return query.matches;
}

/**
 * Subscribe to changes in the reduced-motion preference.
 * @param {(reduced: boolean) => void} fn
 * @returns {() => void} unsubscribe function
 */
export function onReducedMotionChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

query.addEventListener('change', (e) => {
  listeners.forEach((fn) => fn(e.matches));
});
