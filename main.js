/**
 * Entry point for the cinematic multi-axis scroll system. Everything is
 * wired up inside a single `gsap.matchMedia()` call so the reduced-motion
 * branch is a first-class state with its own setup/teardown — not an `if`
 * sprinkled through each module — and so the page adapts live if the user
 * flips their OS motion setting mid-session.
 *
 * This file is loaded as `<script type="module" src="./js/main.js">`, and
 * everything it imports is a plain ESM module — no bundler required, but
 * that also means the page must be served over http(s) (a local static
 * server is enough); browsers block `type="module"` imports over file://.
 * @module main
 */

import { initSmoothScroll } from './core/smooth-scroll.js';
import { initScrollMatrix } from './core/scroll-matrix.js';
import { initPointerParallax } from './core/pointer-parallax.js';
import { initTextReveal } from './core/text-reveal.js';
import { initPrism } from './components/prism.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { initScrollMatrix } from './scroll-matrix.js';
import { initPointerParallax } from './pointer-parallax.js';
import { initTextReveal } from './text-reveal.js';
import { initPrism } from './prism.js';

async function boot() {
  const gsap = /** @type {any} */ (window).gsap;
  const ScrollTrigger = /** @type {any} */ (window).ScrollTrigger;
  if (!gsap || !ScrollTrigger) {
    console.warn('[main] GSAP/ScrollTrigger not found on window — cinematic scroll system skipped.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add(
    {
      isReduced: '(prefers-reduced-motion: reduce)',
      isMotion: '(prefers-reduced-motion: no-preference)',
    },
    (/** @type {any} */ context) => {
      const { isReduced } = context.conditions;

      if (isReduced) {
        // Accessible fallback: strip every X/Z/rotation transform the
        // matrix would otherwise apply and replace with plain opacity
        // cross-fades. The prism still mounts its DOM (for layout/branding
        // continuity) but never animates — CSS collapses it to one flat face.
        initPrism(gsap, ScrollTrigger, true);

        gsap.utils
          .toArray('[data-scroll-x],[data-scroll-y],[data-scroll-z],[data-scroll-rotate]')
          .forEach((/** @type {HTMLElement} */ el) => gsap.set(el, { clearProps: 'transform' }));

        gsap.utils.toArray('[data-split-reveal]').forEach((/** @type {HTMLElement} */ el) => {
          gsap.fromTo(
            el,
            { opacity: 0 },
            { opacity: 1, duration: 0.5, scrollTrigger: { trigger: el, start: 'top 90%' } }
          );
        });

        return; // no cleanup needed — nothing above holds a live listener
      }

      // Full-motion branch.
      initSmoothScroll(gsap, ScrollTrigger).then(() => ScrollTrigger.refresh());
      initScrollMatrix(gsap, ScrollTrigger);
      initTextReveal(gsap, ScrollTrigger);
      const cleanupPointer = initPointerParallax(gsap);
      const cleanupPrism = initPrism(gsap, ScrollTrigger, false);

      // gsap.matchMedia invokes this automatically if the query stops
      // matching (e.g. the user turns reduced-motion on mid-session).
      return () => {
        cleanupPointer();
        cleanupPrism();
      };
    }
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
