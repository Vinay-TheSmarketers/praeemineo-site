/**
 * High-fidelity inertia scrolling via Lenis, synced to GSAP's ScrollTrigger
 * so every scrub-based animation reads Lenis' interpolated scroll position
 * instead of the raw, stepped native scroll event. Lenis is loaded from a
 * CDN ESM build at runtime (not bundled) so the page keeps working — minus
 * the inertia smoothing — if the CDN is unreachable.
 * @module core/smooth-scroll
 */

let lenisInstance = null;

/**
 * Boot Lenis and hand rAF control to GSAP's own ticker, so the whole page
 * runs one requestAnimationFrame loop instead of Lenis and GSAP each
 * scheduling their own.
 * @param {typeof window.gsap} gsap
 * @param {typeof window.ScrollTrigger} ScrollTrigger
 * @returns {Promise<any | null>} the Lenis instance, or null if it failed to load
 */
export async function initSmoothScroll(gsap, ScrollTrigger) {
  if (lenisInstance) return lenisInstance;

  let Lenis;
  try {
    ({ default: Lenis } = await import('https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.mjs'));
  } catch (err) {
    console.warn('[smooth-scroll] Lenis failed to load — continuing with native scroll.', err);
    return null;
  }

  const lenis = new Lenis({
    duration: 1.05,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    syncTouch: false, // let touch devices keep their native (already-good) inertia
    touchMultiplier: 1.1,
  });

  // Keep ScrollTrigger's cached measurements in step with Lenis' virtual scroll.
  lenis.on('scroll', ScrollTrigger.update);

  // One shared rAF loop: GSAP drives Lenis instead of Lenis driving itself.
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  lenisInstance = lenis;
  return lenis;
}

/**
 * @returns {any | null} the active Lenis instance, if smooth scroll booted successfully
 */
export function getLenis() {
  return lenisInstance;
}
