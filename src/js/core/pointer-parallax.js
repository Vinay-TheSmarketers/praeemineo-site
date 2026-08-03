/**
 * Non-blocking pointer-coupled parallax, layered on top of the scroll
 * matrix. Elements flagged `data-parallax-pointer` get a gentle drift or
 * tilt that tracks the cursor (mouse) or first touch point, independent of
 * whatever the scroll matrix is doing to the same element's transform-origin
 * chain — GSAP composites both into one matrix per tick.
 *
 * The per-frame write goes through `gsap.quickSetter`, which bypasses tween
 * creation entirely (no object allocation, nothing for the garbage
 * collector to chase), which is what keeps this loop steady at the
 * display's refresh rate instead of dropping frames under GC pressure.
 * @module core/pointer-parallax
 */

/** @typedef {import('../types').PointerParallaxConfig} PointerParallaxConfig */

/**
 * @param {HTMLElement} el
 * @returns {PointerParallaxConfig}
 */
function readConfig(el) {
  const mode = el.dataset.parallaxMode === 'tilt' ? 'tilt' : 'drift';
  return { strength: Number(el.dataset.parallaxStrength || 1), mode };
}

/**
 * @param {typeof window.gsap} gsap
 * @returns {() => void} teardown function
 */
export function initPointerParallax(gsap) {
  const nodes = /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll('[data-parallax-pointer]')));
  if (!nodes.length) return () => {};

  const registry = nodes.map((el) => {
    const cfg = readConfig(el);
    el.style.willChange = 'transform';
    return {
      setX: gsap.quickSetter(el, 'x', 'px'),
      setY: gsap.quickSetter(el, 'y', 'px'),
      setRotX: gsap.quickSetter(el, 'rotationX', 'deg'),
      setRotY: gsap.quickSetter(el, 'rotationY', 'deg'),
      ...cfg,
    };
  });

  const pointer = { x: 0, y: 0 }; // smoothed, -1..1
  const targetPointer = { x: 0, y: 0 };

  /** @param {number} clientX @param {number} clientY */
  function setTarget(clientX, clientY) {
    targetPointer.x = (clientX / window.innerWidth) * 2 - 1;
    targetPointer.y = (clientY / window.innerHeight) * 2 - 1;
  }

  const handlePointerMove = (/** @type {PointerEvent} */ e) => setTarget(e.clientX, e.clientY);
  const handleTouchMove = (/** @type {TouchEvent} */ e) => {
    if (e.touches.length) setTarget(e.touches[0].clientX, e.touches[0].clientY);
  };
  const handleLeave = () => {
    targetPointer.x = 0;
    targetPointer.y = 0;
  };

  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('pointerleave', handleLeave, { passive: true });
  document.addEventListener('touchend', handleLeave, { passive: true });

  const tick = () => {
    // Sensitive-but-not-jittery: 0.12 lerp toward the raw target every tick,
    // so the response reads as immediate (~a few frames of settle) without
    // the visible snap of writing the raw pointer position directly.
    pointer.x += (targetPointer.x - pointer.x) * 0.12;
    pointer.y += (targetPointer.y - pointer.y) * 0.12;

    for (const node of registry) {
      if (node.mode === 'tilt') {
        node.setRotY(pointer.x * 8 * node.strength);
        node.setRotX(-pointer.y * 8 * node.strength);
      } else {
        node.setX(pointer.x * 14 * node.strength);
        node.setY(pointer.y * 10 * node.strength);
      }
    }
  };

  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('pointerleave', handleLeave);
    document.removeEventListener('touchend', handleLeave);
  };
}
