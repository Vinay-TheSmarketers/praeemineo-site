/**
 * Minimal math helpers shared by the motion modules. Kept dependency-free
 * on purpose — these run inside per-frame hot paths (pointer loops, prism
 * rotation), so no allocation, no imports of a larger math lib for two
 * one-line functions.
 * @module utils/math
 */

/**
 * Clamp `value` into the inclusive range [min, max].
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Linear interpolation from `a` to `b` by `t` (typically 0..1).
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}
