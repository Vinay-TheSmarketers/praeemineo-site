import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const glow = context.createRadialGradient(128, 128, 4, 128, 128, 126);
  glow.addColorStop(0, "rgba(164, 198, 255, 0.95)");
  glow.addColorStop(.2, "rgba(51, 85, 255, 0.75)");
  glow.addColorStop(.55, "rgba(176, 141, 63, 0.22)");
  glow.addColorStop(1, "rgba(11, 14, 19, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function midpoint([ax, ay], [bx, by]) {
  return [(ax + bx) / 2, (ay + by) / 2];
}

function centroid(points) {
  return [
    points.reduce((sum, [x]) => sum + x, 0) / points.length,
    points.reduce((sum, [, y]) => sum + y, 0) / points.length,
  ];
}

function makeGlassFacet(points, color, edgeColor, index) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();

  const depth = .25;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: .022,
    bevelThickness: .028,
  });
  geometry.translate(0, 0, -depth / 2);

  const material = new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity: 0,
    roughness: .08,
    metalness: .05,
    transmission: .28,
    thickness: .5,
    ior: 1.45,
    iridescence: 0.9,
    iridescenceIOR: 1.32,
    iridescenceThicknessRange: [150, 400],
    clearcoat: 1,
    clearcoatRoughness: .03,
    specularIntensity: .95,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: edgeColor,
    transparent: true,
    opacity: 0,
  });

  const mesh = new THREE.Mesh(geometry, material);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 20), edgeMaterial);
  const group = new THREE.Group();
  group.add(mesh, edges);
  return { group, material, edgeMaterial };
}

function makeFacetedWedge(points, palette, edgeColor) {
  const color = palette[2] || palette[0];
  const facet = makeGlassFacet(points, color, edgeColor, 0);
  const group = new THREE.Group();
  group.add(facet.group);
  group.scale.setScalar(.85);
  return {
    group,
    facets: [facet],
    materials: [facet.material],
    edgeMaterials: [facet.edgeMaterial],
  };
}

export function ValuePrismStage() {
  const hostRef = useRef(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0e13, .055);

    const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
    camera.position.set(0, .05, 12.4);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const parallaxGroup = new THREE.Group();
    const modelGroup = new THREE.Group();
    const objectGroup = new THREE.Group();
    modelGroup.position.y = window.innerHeight < 650 && window.innerWidth > 680 ? .6 : -.5;
    scene.add(parallaxGroup);
    parallaxGroup.add(modelGroup);
    modelGroup.add(objectGroup);

    scene.add(new THREE.HemisphereLight(0x8dbdff, 0x03030d, 1.6));
    const blueLight = new THREE.PointLight(0x3355FF, 48, 18, 2);
    blueLight.position.set(-1.4, 2.6, 3.7);
    const brassLight = new THREE.PointLight(0xB08D3F, 34, 18, 2);
    brassLight.position.set(1.45, 1.85, 2.8);
    const rimLight = new THREE.PointLight(0xffffff, 18, 15, 2);
    rimLight.position.set(0, -2.2, 3.4);
    scene.add(blueLight, brassLight, rimLight);

    const glowTexture = makeGlowTexture();
    const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffffff,
      transparent: true,
      opacity: .88,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    glowSprite.scale.set(4.7, 4.7, 1);
    glowSprite.position.z = -.75;

    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0a1442,
      emissive: 0x1f3cff,
      emissiveIntensity: 0.9,
      roughness: 0.12,
      metalness: 0.4,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(1, 72, 72), coreMaterial);
    const shellMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xadc8ff,
      transparent: true,
      opacity: .16,
      roughness: .04,
      metalness: .05,
      transmission: .55,
      thickness: .3,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1.22, 64, 64), shellMaterial);
    const coreGroup = new THREE.Group();
    coreGroup.add(glowSprite, core, shell);
    coreGroup.position.y = .14;
    objectGroup.add(coreGroup);

    const ringGroup = new THREE.Group();
    const rings = [
      { radius: 1.75, tube: .018, opacity: .34, scale: 1 },
      { radius: 2.12, tube: .014, opacity: .2, scale: 1.22 },
      { radius: 2.5, tube: .011, opacity: .1, scale: 1.42 },
    ].map((spec, index) => {
      const material = new THREE.MeshBasicMaterial({
        color: index === 0 ? 0x91a5ff : 0x6f7dea,
        transparent: true,
        opacity: spec.opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(spec.radius, spec.tube, 12, 160), material);
      ring.rotation.x = 1.22;
      ring.scale.setScalar(spec.scale);
      ring.position.y = -.36 - index * .07;
      ring.userData.material = material;
      ringGroup.add(ring);
      return ring;
    });
    objectGroup.add(ringGroup);

    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    for (let index = 0; index < 150; index += 1) {
      const angle = index * 2.39996;
      const radius = 3.4 + (index % 17) * .27;
      starPositions.push(Math.cos(angle) * radius, Math.sin(angle * .7) * radius * .52, -2.5 - (index % 9) * .42);
    }
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({
      color: 0x9cbcff,
      transparent: true,
      opacity: .2,
      size: .018,
      depthWrite: false,
    }));
    scene.add(stars);

    const top = [0, 1.732];
    const left = [-1.5, -0.866];
    const right = [1.5, -0.866];
    const center = [0, 0];
    const people = makeFacetedWedge([left, center, top], [0x5C4616, 0x6E5523, 0x8A6D32, 0xB08D3F], 0xffe2a3);
    const business = makeFacetedWedge([left, right, center], [0x161C24, 0x2A2F3A, 0x3D434F, 0x4A505C], 0xd0d5e0);
    const customer = makeFacetedWedge([center, right, top], [0x10216B, 0x1E3BB3, 0x3355FF, 0x5C7CFF], 0xa3baff);
    const wedges = [people, business, customer];
    const prismGroup = new THREE.Group();
    wedges.forEach(({ group }) => prismGroup.add(group));
    prismGroup.position.y = -.12;
    prismGroup.position.z = -.06;
    objectGroup.add(prismGroup);

    const orbitPoints = [
      new THREE.Vector3(0, 2.5, -.2),
      new THREE.Vector3(1.85, 1.25, -.2),
      new THREE.Vector3(2.65, -1.42, -.2),
      new THREE.Vector3(1.82, -1.82, -.2),
      new THREE.Vector3(-1.82, -1.82, -.2),
      new THREE.Vector3(-2.65, -1.42, -.2),
      new THREE.Vector3(-1.85, 1.25, -.2),
    ];
    const orbitCurve = new THREE.CatmullRomCurve3(orbitPoints, true, "centripetal", .26);
    const sampledOrbit = orbitCurve.getPoints(280);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(sampledOrbit);
    orbitGeometry.setDrawRange(0, 0);
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0xdff5ff,
      transparent: true,
      opacity: .86,
    });
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    objectGroup.add(orbit);
    const orbitTubeMaterial = new THREE.MeshBasicMaterial({
      color: 0xb9dcf2,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const orbitTube = new THREE.Mesh(new THREE.TubeGeometry(orbitCurve, 220, .012, 8, true), orbitTubeMaterial);
    objectGroup.add(orbitTube);

    const nodeMeshes = Array.from({ length: 9 }, (_, index) => {
      const material = new THREE.MeshBasicMaterial({ color: 0xdff6ff, transparent: true, opacity: 0 });
      const node = new THREE.Mesh(new THREE.SphereGeometry(.032, 16, 16), material);
      node.position.copy(orbitCurve.getPointAt(index / 9));
      node.scale.setScalar(.01);
      objectGroup.add(node);
      return { node, material };
    });

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 760 ? 13.3 : 12.4;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const pointerTarget = { x: 0, y: 0 };
    const onPointerMove = (event) => {
      pointerTarget.x = (event.clientX / window.innerWidth - .5) * 2;
      pointerTarget.y = (event.clientY / window.innerHeight - .5) * 2;
    };
    if (!reducedMotion) window.addEventListener("pointermove", onPointerMove, { passive: true });

    const drawState = { count: 0 };
    const animationContext = gsap.context(() => {
      gsap.set(".core-badge, .prism-label, .process-pill, .method-node", { autoAlpha: 0, filter: "blur(8px)" });

      if (reducedMotion) {
        coreGroup.scale.setScalar(.4);
        coreMaterial.color.set(0xf6fbff);
        coreMaterial.emissive.set(0x164b70);
        wedges.forEach(({ materials, edgeMaterials }) => {
          materials.forEach((material) => { material.opacity = .74; });
          edgeMaterials.forEach((material) => { material.opacity = .34; });
        });
        orbitGeometry.setDrawRange(0, sampledOrbit.length);
        nodeMeshes.forEach(({ node, material }) => { node.scale.setScalar(1); material.opacity = .9; });
        gsap.set(".core-badge, .prism-label, .process-pill, .method-node", { autoAlpha: 1, filter: "blur(0px)" });
      } else {
        const timeline = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: ".scroll-flow",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.25,
            invalidateOnRefresh: true,
          },
        });

        timeline
          // Phase 1: Rings fade out quickly, shell dims, core starts shrinking
          .to(rings.map((ring) => ring.userData.material), { opacity: 0, duration: .6, stagger: .06 }, .6)
          .to(shellMaterial, { opacity: .08, duration: .9 }, .8)
          .to(coreGroup.scale, { x: .86, y: .86, z: .86, duration: 1.1 }, 1.2)

          // Phase 2: Core shrinks to final size, glow + color shifts, core-badge appears
          .to(coreGroup.scale, { x: .4, y: .4, z: .4, duration: 1.15 }, 2.2)
          .to(glowSprite.material, { opacity: .34, duration: .9 }, 2.3)
          .to(shellMaterial, { opacity: .05, duration: .9 }, 2.3)
          .to(coreMaterial.color, { r: .96, g: .99, b: 1, duration: 1 }, 2.3)
          .to(coreMaterial.emissive, { r: .02, g: .16, b: .25, duration: 1 }, 2.3)
          .to(".core-badge", { autoAlpha: 1, filter: "blur(0px)", duration: .65 }, 2.7)

          // Phase 3: Wedges build — People, Business, Customer — each label flows in with its wedge
          .to(people.materials, { opacity: .82, duration: .8 }, 3.0)
          .to(people.edgeMaterials, { opacity: .22, duration: .75 }, 3.05)
          .to(".label-people", { autoAlpha: 1, filter: "blur(0px)", duration: .55 }, 3.3)
          .to(business.materials, { opacity: .8, duration: .8 }, 3.8)
          .to(business.edgeMaterials, { opacity: .2, duration: .75 }, 3.85)
          .to(".label-business", { autoAlpha: 1, filter: "blur(0px)", duration: .55 }, 4.1)
          .to(customer.materials, { opacity: .82, duration: .8 }, 4.6)
          .to(customer.edgeMaterials, { opacity: .24, duration: .75 }, 4.65)
          .to(".label-customer", { autoAlpha: 1, filter: "blur(0px)", duration: .55 }, 4.9)

          // Phase 4: Model settles, orbit draws, process pills + nodes flow in
          .to(modelGroup.rotation, { x: -.025, y: .035, z: 0, duration: 1.1 }, 5.3)
          .to(drawState, { count: sampledOrbit.length, duration: 1.05, ease: "power1.inOut", onUpdate: () => orbitGeometry.setDrawRange(0, Math.round(drawState.count)) }, 5.5)
          .to(orbitTubeMaterial, { opacity: .36, duration: .7 }, 6.2)
          .to(".process-pill", { autoAlpha: 1, filter: "blur(0px)", duration: .65, stagger: .08 }, 5.9)
          .set(nodeMeshes.map(({ node }) => node.scale), { x: 1, y: 1, z: 1 }, 6.5)
          .to(nodeMeshes.map(({ material }) => material), { opacity: .24, duration: .5, stagger: .05 }, 6.5)
          .to(".method-node", { autoAlpha: 1, filter: "blur(0px)", duration: .5, stagger: .05 }, 6.55)

          // Phase 5: Final composition shift
          .to(modelGroup.position, { x: () => window.innerWidth < 680 ? 0 : window.innerWidth < 1100 ? 1.05 : 1.65, duration: 1.25 }, 7.2)
          .to(modelGroup.rotation, { y: -.045, x: -.02, duration: 1.25 }, 7.2)
          .to(".scene-interface", { x: () => window.innerWidth < 680 ? 0 : window.innerWidth < 1100 ? 100 : Math.min(180, window.innerWidth * .18), duration: 1.25 }, 7.2)
          .to(glowSprite.material, { opacity: .44, duration: 1.2 }, 7.2);
      }
    });

    const startedAt = performance.now();
    let frameId;
    const render = () => {
      const elapsed = (performance.now() - startedAt) / 1000;
      if (!reducedMotion) {
        parallaxGroup.rotation.y = THREE.MathUtils.lerp(parallaxGroup.rotation.y, pointerTarget.x * .035, .025);
        parallaxGroup.rotation.x = THREE.MathUtils.lerp(parallaxGroup.rotation.x, -pointerTarget.y * .02, .025);
        objectGroup.position.y = Math.sin(elapsed * .38) * .012;
        ringGroup.rotation.z = elapsed * .006;
        stars.rotation.z = elapsed * .002;
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frameId);
      animationContext.revert();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      scene.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
        else object.material?.dispose?.();
      });
      glowTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className="three-host" />;
}
