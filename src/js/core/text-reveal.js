/**
 * Zero-dependency text splitter + 3D staggered reveal for `[data-split-reveal]`
 * headers. Walks text nodes only (not `innerHTML`), so nested inline markup
 * like `<em>` inside a headline keeps its styling — each character becomes
 * an inline-block span in place, the wrapping element is untouched.
 *
 * Characters animate from `{ y:100%, rotateX:-90deg, opacity:0 }` to
 * baseline, staggered, on scroll-into-view — the "3D reveal matrix" from
 * the brief. A native splitter is used instead of SplitType/GSAP SplitText
 * to avoid a second CDN dependency on the critical path.
 * @module core/text-reveal
 */

/**
 * Split all text nodes under `root` into per-character spans, preserving
 * any element wrappers (e.g. `<em>`) and whitespace.
 * @param {HTMLElement} root
 * @returns {HTMLElement[]} the created character spans, in reading order
 */
function splitChars(root) {
  root.style.perspective = '600px';

  /** @type {HTMLElement[]} */
  const chars = [];

  // Snapshot text nodes before mutating — replacing nodes mid-walk would
  // desync a live TreeWalker.
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  /** @type {Text[]} */
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) textNodes.push(/** @type {Text} */ (node));

  textNodes.forEach((textNode) => {
    const parent = textNode.parentNode;
    if (!parent) return;
    const frag = document.createDocumentFragment();

    textNode.textContent.split(/(\s+)/).forEach((token) => {
      if (token === '') return;
      if (/^\s+$/.test(token)) {
        frag.appendChild(document.createTextNode(token));
        return;
      }
      [...token].forEach((ch) => {
        const span = document.createElement('span');
        span.textContent = ch;
        span.style.display = 'inline-block';
        span.style.transformStyle = 'preserve-3d';
        frag.appendChild(span);
        chars.push(span);
      });
    });

    parent.replaceChild(frag, textNode);
  });

  return chars;
}

/**
 * Clean, fail-safe text reveal animation for `[data-split-reveal]` headers.
 * Fades and slides headers smoothly into view without hiding text nodes in broken spans.
 * @module core/text-reveal
 */

/**
 * @param {typeof window.gsap} gsap
 * @param {typeof window.ScrollTrigger} ScrollTrigger
 */
export function initTextReveal(gsap, ScrollTrigger) {
  const targets = /** @type {HTMLElement[]} */ (Array.from(document.querySelectorAll('[data-split-reveal]')));
  if (!targets.length) return;

  targets.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 22, filter: 'blur(6px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.85,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
          invalidateOnRefresh: true,
        },
      }
    );
  });
}
