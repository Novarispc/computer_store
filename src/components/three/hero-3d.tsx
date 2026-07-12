"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Next 16 forbids `dynamic(..., { ssr: false })` inside a Server Component, so
 * this thin client wrapper exists solely to hold that call. The actual <Canvas>
 * lives in ./scene.tsx, imported only from here.
 *
 * three/r3f/drei are never imported unless ALL of the following hold:
 *   - the component has mounted on the client
 *   - viewport is >=768px
 *   - the user has not requested reduced motion
 * Everyone else gets the static CSS hero and pays zero bytes for three.js.
 */
const Scene = dynamic(() => import("./scene"), { ssr: false });

function shouldRender3D(): boolean {
  if (typeof window === "undefined") return false;
  const wide = window.matchMedia("(min-width: 768px)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return wide && !reduced;
}

export function Hero3D({ fallback }: { fallback: React.ReactNode }) {
  const [render3D, setRender3D] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRender3D(shouldRender3D());

    const widthQuery = window.matchMedia("(min-width: 768px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setRender3D(shouldRender3D());
    widthQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);
    return () => {
      widthQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  // Before mount, and whenever 3D is unsuitable, render the static fallback —
  // it is also what SSR sends, so there is no layout jump on hydration.
  if (!mounted || !render3D) return <>{fallback}</>;

  return (
    <div className="absolute inset-0" aria-hidden>
      <Scene />
    </div>
  );
}
