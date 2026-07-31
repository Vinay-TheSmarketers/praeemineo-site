/**
 * The Prism — the brand diamond mark (previously a static SVG that only
 * ever appeared once, in the preloader) rebuilt as a live 3D object: six
 * wireframe faces arranged in a cube with `transform-style: preserve-3d`,
 * pinned in the viewport corner for the entire scroll.
 *
 * Its rotation each frame is a sum of three signals:
 *   idle autorotation   — a slow constant drift so it never sits still
 *   scroll progress     — ties it to the page's overall camera position
 *   pointer / touch tilt — the "sensitive touch" component: high-gain,
 *                          fast-settling response to cursor or finger
 *
 * All three are combined and written with `quickSetter`, so the touch path
 * never creates a tween — it just nudges a running total that gets painted
 * every tick alongside the idle and scroll terms.
 * @module components/prism
 */

const FACES = [
  { cls: 'face-front', transform: 'rotateY(0deg) translateZ(42px)' },
  { cls: 'face-right', transform: 'rotateY(90deg) translateZ(42px)' },
  { cls: 'face-back', transform: 'rotateY(180deg) translateZ(42px)' },
  { cls: 'face-left', transform: 'rotateY(-90deg) translateZ(42px)' },
  { cls: 'face-top', transform: 'rotateX(90deg) translateZ(42px)' },
  { cls: 'face-bottom', transform: 'rotateX(-90deg) translateZ(42px)' },
];

const DIAMOND_SVG =
  '<svg viewBox="0 0 240 240" aria-hidden="true"><polygon points="120,66 174,120 120,174 66,120"/></svg>';

/**
 * @param {HTMLElement} prism
 */
function buildFaces(prism) {
  if (prism.childElementCount) return; // already built (e.g. hot-reload during dev)
  const frag = document.createDocumentFragment();
  FACES.forEach(({ cls, transform }) => {
    const face = document.createElement('div');
    face.className = `prism-face ${cls}`;
    face.style.transform = transform;
    face.innerHTML = DIAMOND_SVG;
    frag.appendChild(face);
  });
  prism.appendChild(frag);
}

/**
 * @param {typeof window.gsap} gsap
 * @param {typeof window.ScrollTrigger} ScrollTrigger
 * @param {boolean} reduced - when true, faces are mounted but never animated;
 *   the CSS reduced-motion rules collapse the shape to a single flat face.
 * @returns {() => void} teardown function
 */
export function initPrism(gsap, ScrollTrigger, reduced) {
  const stage = /** @type {HTMLElement | null} */ (document.querySelector('.prism-stage'));
  const prism = /** @type {HTMLElement | null} */ (document.querySelector('.prism'));
  if (!stage || !prism) return () => {};

  buildFaces(prism);
  if (reduced) return () => {};

  const state = { idle: 0, scroll: 0, pointerX: 0, pointerY: 0 };
  const targetPointer = { x: 0, y: 0 };

  const setRotateY = gsap.quickSetter(prism, 'rotationY', 'deg');
  const setRotateX = gsap.quickSetter(prism, 'rotationX', 'deg');

  /** @param {number} clientX @param {number} clientY */
  function setPointerTarget(clientX, clientY) {
    targetPointer.x = (clientX / window.innerWidth) * 2 - 1;
    targetPointer.y = (clientY / window.innerHeight) * 2 - 1;
  }

  const handleMove = (/** @type {PointerEvent} */ e) => setPointerTarget(e.clientX, e.clientY);
  const handleTouch = (/** @type {TouchEvent} */ e) => {
    if (e.touches.length) setPointerTarget(e.touches[0].clientX, e.touches[0].clientY);
  };

  window.addEventListener('pointermove', handleMove, { passive: true });
  window.addEventListener('touchmove', handleTouch, { passive: true });

  const scrollTrigger = ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      state.scroll = self.progress;
    },
  });

  const tick = (/** @type {number} */ _time, /** @type {number} */ deltaMs) => {
    state.idle += deltaMs * 0.012; // ~one slow turn every 30s at rest

    // "Sensitive" touch response: fast lerp gain toward the live pointer
    // target so the tilt reads as immediate rather than lagged.
    state.pointerX += (targetPointer.x - state.pointerX) * 0.18;
    state.pointerY += (targetPointer.y - state.pointerY) * 0.18;

    const rotateY = state.idle + state.scroll * 720 + state.pointerX * 26;
    const rotateX = -18 + Math.sin(state.idle * 0.4) * 6 - state.pointerY * 18;

    setRotateY(rotateY);
    setRotateX(rotateX);
  };

  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    scrollTrigger.kill();
    window.removeEventListener('pointermove', handleMove);
    window.removeEventListener('touchmove', handleTouch);
  };
}
