# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## ValuePrism visual direction

- Open with a full-screen, luminous blue-violet 3D core and soft orbital light, using the supplied Neuron.ai screenshot as the visual reference for scale, depth, restraint, and atmosphere.
- Pace explanatory copy as small, standalone text fragments that flow separately after the core visual; preserve generous negative space.
- Build the ValuePrism progressively from the core into People, Business, and Customer faces, then the Assess/Design/Implement orbit and nine behaviors.
- Conclude with a complete 3D ValuePrism. Use reversible GSAP scroll choreography, responsive parallax, and a professional stacked mobile experience.
