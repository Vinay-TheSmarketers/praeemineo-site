import { useEffect, useRef } from "react";
import * as THREE from "three";

export function FluidCanvas({ isLightMode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer, scene, camera, uniforms, rafId;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      return;
    }

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch (err) {
      console.warn("Fluid canvas failed to initialize renderer", err);
      return;
    }

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.42) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uLightMode: { value: isLightMode ? 1.0 : 0.0 },
    };

    const vertexShader = `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      uniform float uLightMode;

      float hash(vec2 p){
        return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
      }
      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0,0.0));
        float c = hash(i + vec2(0.0,1.0));
        float d = hash(i + vec2(1.0,1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
      }

      void main(){
        float aspect = uResolution.x / max(uResolution.y, 1.0);
        vec2 p = vec2(vUv.x * aspect, vUv.y);
        vec2 mouseP = vec2(uMouse.x * aspect, uMouse.y);

        float distM = length(p - mouseP);
        vec2 dir = (p - mouseP) / (distM + 0.0001);
        float push = smoothstep(0.6, 0.0, distM) * 0.14;
        p += dir * push;

        float t = uTime * 0.15;
        float lines = 0.0;
        for(int i=1; i<6; i++){
          float fi = float(i);
          float freq = fi * 2.1;
          float speed = 0.9 + fi*0.18;
          float amp = 0.22 / fi;
          float phase = noise(vec2(p.x*0.6, t*0.4 + fi)) * 1.8;
          float wave = sin(p.x*freq + t*speed + phase) * amp;
          float d = abs(p.y - 0.44 - wave);
          lines += smoothstep(0.03, 0.0, d) * (0.55/fi);
        }

        float grain = (hash(vUv*uResolution.xy*0.6 + uTime) - 0.5) * 0.035;

        vec3 dark   = vec3(0.011, 0.014, 0.019); // matched to deep ink -- #0B0E13
        vec3 mid    = vec3(0.03, 0.07, 0.20);
        vec3 bright = vec3(0.20, 0.33, 0.99); // cobalt-bright matching -- #3355FF

        if (uLightMode > 0.5) {
          dark   = vec3(0.97, 0.98, 1.0);    // soft cool white background
          mid    = vec3(0.78, 0.86, 0.98);   // soft blue transition
          bright = vec3(0.00, 0.27, 0.92);   // deep sapphire blue waves
        }

        float b = clamp(lines, 0.0, 1.0);
        vec3 color = mix(dark, mid, smoothstep(0.0, 0.5, b));
        color = mix(color, bright, smoothstep(0.4, 1.0, b));
        color += grain;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth || 1;
      const h = parent.clientHeight || 1;
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w, h);
    };

    window.addEventListener("resize", resize);
    resize();

    const target = { x: 0.5, y: 0.42 };
    const current = { x: 0.5, y: 0.42 };

    const onMouseMove = (e) => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const r = parent.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1.0 - (e.clientY - r.top) / r.height;
    };

    const onMouseLeave = () => {
      target.x = 0.5;
      target.y = 0.42;
    };

    const parent = canvas.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", onMouseMove);
      parent.addEventListener("mouseleave", onMouseLeave);
    }

    const clock = new THREE.Clock();
    let visible = true;

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(parent || canvas);

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!visible) return;
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      uniforms.uMouse.value.set(current.x, current.y);
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      if (parent) {
        parent.removeEventListener("mousemove", onMouseMove);
        parent.removeEventListener("mouseleave", onMouseLeave);
      }
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isLightMode]);

  return <canvas id="fluid-canvas" ref={canvasRef} />;
}
