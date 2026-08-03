import Lenis from 'lenis';

let lenisInstance = null;

/**
 * Boot Lenis and hand rAF control to GSAP's own ticker, so the whole page
 * runs one requestAnimationFrame loop instead of Lenis and GSAP each
 * scheduling their own.
 * @param {typeof window.gsap} gsap
 * @param {typeof window.ScrollTrigger} ScrollTrigger
 * @returns {Promise<any>} the Lenis instance
 */
export async function initSmoothScroll(gsap, ScrollTrigger) {
  if (lenisInstance) return lenisInstance;

  const lenis = new Lenis({
    duration: 1.05,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    syncTouch: false, // let touch devices keep their native inertia
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
 * @returns {any | null} the active Lenis instance
 */
export function getLenis() {
  return lenisInstance;
}
