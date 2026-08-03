// Ambient type declarations for the Praeemineo cinematic-scroll motion system.
// No build step compiles this — it exists so editors and `tsc --checkJs`
// can typecheck the JSDoc-annotated .js modules against a shared contract.
// Reference it from any module with:  /** @typedef {import('../types').ScrollMatrixConfig} ScrollMatrixConfig */

export interface ScrollMatrixConfig {
  /** Horizontal drift in px at full scroll progress through the trigger. Positive = right. */
  x: number;
  /** Vertical drift in px at full scroll progress through the trigger. */
  y: number;
  /** Depth translation in px (translateZ). Negative pushes the element away from camera. */
  z: number;
  /** Rotation in degrees. Runtime clamps this to [-15, 15] regardless of the source value. */
  rotate: number;
  /** Which axis `rotate` is applied to. */
  rotateAxis: 'x' | 'y' | 'z';
}

export interface PointerParallaxConfig {
  /** Multiplier applied to the normalized (-1..1) pointer offset. */
  strength: number;
  /** 'drift' translates x/y; 'tilt' rotates rotationX/rotationY. */
  mode: 'drift' | 'tilt';
}

export interface PrismMotionState {
  /** 0..1 scroll progress across the whole document. */
  scroll: number;
  /** Continuously increasing idle-rotation accumulator, in degrees. */
  idle: number;
  /** Smoothed, normalized pointer X, -1..1. */
  pointerX: number;
  /** Smoothed, normalized pointer Y, -1..1. */
  pointerY: number;
}

// Augment the DOM's dataset typing so `el.dataset.scrollX` etc. resolve
// to `string | undefined` instead of `any` under `tsc --checkJs`.
declare global {
  interface DOMStringMap {
    scrollX?: string;
    scrollY?: string;
    scrollZ?: string;
    scrollRotate?: string;
    scrollRotateAxis?: string;
    parallaxPointer?: string;
    parallaxStrength?: string;
    parallaxMode?: string;
    splitReveal?: string;
  }
}

export {};
