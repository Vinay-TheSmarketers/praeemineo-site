/**
 * Multi-axis scroll matrix: reads `data-scroll-x` / `data-scroll-y` /
 * `data-scroll-z` / `data-scroll-rotate` / `data-scroll-rotate-axis` off any
 * element and drives it with one scrubbed ScrollTrigger tween that animates
 * x, y, z and rotation together — a single composited transform per
 * element, so translation, depth push and orbital rotation read as one
 * camera move rather than three fighting animations.
 *
 * Usage (in the HTML, no JS wiring needed per-element):
 *   <div data-scroll-x="-48" data-scroll-z="-30" data-scroll-rotate="-4">
 *
 * @module core/scroll-matrix
 */

import { clamp } from '../utils/math.js';

/** @typedef {import('../types').ScrollMatrixConfig} ScrollMatrixConfig */

const ROTATE_CLAMP_DEG = 15; // spec: orbital rotation stays within -15..15deg

/**
 * @param {HTMLElement} el
 * @returns {ScrollMatrixConfig}
 */
function readConfig(el) {
  const rotateAxis = /** @type {ScrollMatrixConfig['rotateAxis']} */ (el.dataset.scrollRotateAxis || 'z');
  return {
    x: Number(el.dataset.scrollX || 0),
    y: Number(el.dataset.scrollY || 0),
    z: Number(el.dataset.scrollZ || 0),
    rotate: clamp(Number(el.dataset.scrollRotate || 0), -ROTATE_CLAMP_DEG, ROTATE_CLAMP_DEG),
    rotateAxis: rotateAxis === 'x' || rotateAxis === 'y' ? rotateAxis : 'z',
  };
}

/**
 * Wires every `[data-scroll-*]` element on the page into the matrix.
 * @param {typeof window.gsap} gsap
 * @param {typeof window.ScrollTrigger} ScrollTrigger
 * @returns {gsap.core.Tween[]}
 */
export function initScrollMatrix(gsap, ScrollTrigger) {
  const nodes = /** @type {HTMLElement[]} */ (
    Array.from(document.querySelectorAll('[data-scroll-x],[data-scroll-y],[data-scroll-z],[data-scroll-rotate]'))
  );
  if (!nodes.length) return [];

  return nodes.map((el) => {
    const cfg = readConfig(el);
    const rotateProp = cfg.rotateAxis === 'x' ? 'rotationX' : cfg.rotateAxis === 'y' ? 'rotationY' : 'rotation';

    // Layout isolation: this layer moves independently on its own axis for
    // the whole scroll range, so contain it to stop the browser repainting
    // sibling content every time the matrix recalculates.
    el.style.contain = 'layout paint style';
    el.style.willChange = 'transform';

    const scroller = /** @type {HTMLElement} */ (el.closest('section') || el.parentElement || el);

    return gsap.fromTo(
      el,
      { x: -cfg.x, y: -cfg.y, z: -cfg.z, [rotateProp]: -cfg.rotate },
      {
        x: cfg.x,
        y: cfg.y,
        z: cfg.z,
        [rotateProp]: cfg.rotate,
        ease: 'none',
        scrollTrigger: {
          trigger: scroller,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      }
    );
  });
}
