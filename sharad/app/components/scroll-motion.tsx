"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LocomotiveScroll from "locomotive-scroll";

export function ScrollMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const locomotive = new LocomotiveScroll({
      lenisOptions: { smoothWheel: true, smoothTouch: false, lerp: 0.085, wheelMultiplier: 0.9 },
      scrollCallback: () => ScrollTrigger.update(),
    });
    const revealItems = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    const reveals = revealItems.map((element) =>
      gsap.fromTo(
        element,
        // Keep reveal motion off `transform`: interactive cards also use
        // transform for their hover lift, and competing transform writes
        // caused a visible box flicker while scrolling.
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.42,
          ease: "power3.out",
          clearProps: "opacity,visibility",
          immediateRender: false,
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        },
      ),
    );
    const lineItems = gsap.utils.toArray<SVGPathElement>(".animated-line path");
    const lines = lineItems.map((path) =>
      gsap.fromTo(
        path,
        { strokeDashoffset: 380 },
        {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: "power2.out",
          immediateRender: false,
          scrollTrigger: { trigger: path, start: "top 91%", once: true },
        },
      ),
    );
    const hero = document.querySelector(".hero-orbit-wrap")
      ? gsap.to(".hero-orbit-wrap", {
          y: 34,
          ease: "none",
          scrollTrigger: { trigger: ".theme-hero", start: "top top", end: "bottom top", scrub: true },
        })
      : null;
    ScrollTrigger.refresh();
    return () => {
      reveals.forEach((animation) => animation.scrollTrigger?.kill());
      lines.forEach((animation) => animation.scrollTrigger?.kill());
      hero?.scrollTrigger?.kill();
      locomotive.destroy();
      reveals.forEach((animation) => animation.kill());
      lines.forEach((animation) => animation.kill());
      hero?.kill();
    };
  }, []);

  return null;
}
