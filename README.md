# Running this locally

`praeemineo-web.html` loads its motion system as real ES modules
(`<script type="module" src="./js/main.js">`), which browsers refuse to
import over `file://`. Double-clicking the HTML file will show the page
with **no** cinematic scroll, prism, or text-reveal — just the original
static layout.

Serve the folder instead (from this directory, keeping `js/` alongside the
HTML file), for example:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/praeemineo-web.html
```

or `npx serve .`, or VS Code's "Live Server" extension — anything that
serves plain static files over http will do.

## What's here

```
praeemineo-web.html
js/
  main.js                    entry point, wraps everything in gsap.matchMedia()
  types.d.ts                 shared JSDoc/tsc type contract for the data-* attributes
  core/
    smooth-scroll.js         Lenis, synced into GSAP's ticker + ScrollTrigger
    scroll-matrix.js         reads data-scroll-x/y/z/rotate, drives scrubbed 3D transforms
    pointer-parallax.js      quickSetter-based mouse/touch drift & tilt
    text-reveal.js           recursive char-splitter + 3D stagger reveal
  components/
    prism.js                 the 3D corner mark: idle spin + scroll + touch tilt
  utils/
    math.js, reduced-motion.js
```

Everything is plain JSDoc-typed JavaScript (runs natively as ESM, no build
step) rather than compiled `.ts` — that's the practical equivalent for a
no-bundler static page, and it typechecks fine under `tsc --checkJs` against
`types.d.ts` if you want to verify that. If you'd rather have this as actual
`.ts` source feeding a bundler (Vite/esbuild) for a real build pipeline, say
so and I'll restructure it that way instead.
