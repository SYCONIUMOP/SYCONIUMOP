"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

export function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      canvas.dataset.failed = "true";
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    camera.position.z = 7.3;
    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const light = new THREE.DirectionalLight(0xffffff, 3.2);
    light.position.set(-3, 5, 7);
    scene.add(light);

    const group = new THREE.Group();
    scene.add(group);
    const material = (color: string, metalness = 0.04) =>
      new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness });
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.91, 40, 40), material("#7864f6"));
    sphere.position.x = -0.1;
    group.add(sphere);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.23, 0.018, 10, 100), material("#a99eff", 0.3));
    ring.rotation.set(0.78, 0.3, -0.38);
    group.add(ring);
    const goldRing = new THREE.Mesh(new THREE.TorusGeometry(1.43, 0.012, 8, 100), material("#c9a227", 0.45));
    goldRing.rotation.set(1.18, -0.5, 0.42);
    group.add(goldRing);
    const mint = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), material("#d9f27a"));
    mint.position.set(1.08, 0.82, 0.38);
    group.add(mint);
    const coral = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), material("#fa7658"));
    coral.position.set(-1.03, -0.9, 0.52);
    group.add(coral);
    const cream = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.34), material("#fffefa"));
    cream.position.set(1.2, -0.83, 0.35);
    group.add(cream);

    let pointerX = 0;
    let pointerY = 0;
    let frame = 0;
    const handlePointer = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 0.3;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 0.2;
    };
    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("pointermove", handlePointer, { passive: true });
    const clock = new THREE.Clock();
    const render = () => {
      const time = clock.getElapsedTime();
      group.rotation.y = Math.sin(time * 0.25) * 0.12 + pointerX;
      group.rotation.x = Math.sin(time * 0.21) * 0.08 + pointerY;
      group.position.y = Math.sin(time * 0.75) * 0.06;
      mint.rotation.x = time * 0.48;
      mint.rotation.y = time * 0.7;
      coral.rotation.x = -time * 0.35;
      coral.rotation.y = time * 0.4;
      cream.rotation.y = time * 0.45;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    resize();
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointer);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((item) => item.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-three" aria-hidden="true" />;
}
