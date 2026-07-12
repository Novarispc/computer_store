"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, ContactShadows, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";

/**
 * A realistic silver notebook, built entirely from primitives — no useGLTF, no
 * model downloads. The whole 3D cost of the site is this file, which is
 * dynamically imported client-only from hero-3d.tsx and lands in a home-only
 * chunk.
 *
 * Geometry: rounded aluminium chassis + lid, a real key grid, trackpad, hinge
 * barrel, and a screen lit by a procedurally drawn wallpaper texture.
 */

const ALUMINIUM = "#b9bec6";
const ALUMINIUM_DARK = "#8f959e";
const KEY = "#2e3238";

/** Desktop wallpaper drawn to a canvas — cheaper and sharper than an image fetch. */
function useScreenTexture() {
  return useMemo(() => {
    const w = 1024;
    const h = 640;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Deep blue base
    const base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, "#0b1533");
    base.addColorStop(0.55, "#15295c");
    base.addColorStop(1, "#2b1b4d");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    // Sweeping ribbons, echoing the attached reference wallpaper
    const ribbons: [string, number, number][] = [
      ["rgba(56,189,248,0.55)", 0.24, 190],
      ["rgba(129,140,248,0.5)", 0.42, 150],
      ["rgba(236,72,153,0.38)", 0.62, 130],
      ["rgba(45,212,191,0.32)", 0.8, 110],
    ];
    for (const [colour, yFactor, amp] of ribbons) {
      ctx.beginPath();
      ctx.moveTo(0, h * yFactor);
      for (let x = 0; x <= w; x += 8) {
        const y = h * yFactor + Math.sin((x / w) * Math.PI * 1.6) * amp * 0.35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = colour;
      ctx.fill();
    }

    // Clock, like the reference lock screen
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.textAlign = "center";
    ctx.font = "600 132px system-ui, sans-serif";
    ctx.fillText("2:30", w / 2, h / 2 + 10);
    ctx.font = "400 34px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    ctx.fillText("Wednesday 1st October", w / 2, h / 2 + 62);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, []);
}

const BASE_W = 3.3;
const BASE_D = 2.3;
const BASE_T = 0.11;
const LID_H = 2.15;
const LID_T = 0.07;

function Keyboard() {
  // 6 rows; the top row is the half-height function row.
  const keys = useMemo(() => {
    const out: { x: number; z: number; w: number; d: number }[] = [];
    const rows = 6;
    const cols = 15;
    const keyW = 0.155;
    const keyD = 0.145;
    const gapX = 0.022;
    const gapZ = 0.024;

    const totalW = cols * keyW + (cols - 1) * gapX;
    const startX = -totalW / 2 + keyW / 2;
    const startZ = -0.62;

    for (let r = 0; r < rows; r++) {
      const isFn = r === 0;
      const d = isFn ? keyD * 0.62 : keyD;
      const z = startZ + r * (keyD + gapZ);
      for (let c = 0; c < cols; c++) {
        // Widen the last key of the bottom rows to suggest Enter / Shift.
        const wide = !isFn && (r === 3 || r === 4) && c === cols - 1;
        out.push({
          x: startX + c * (keyW + gapX),
          z,
          w: wide ? keyW * 1.35 : keyW,
          d,
        });
      }
    }
    return out;
  }, []);

  const top = BASE_T / 2 + 0.006;

  return (
    <group>
      {/* Recessed keyboard well */}
      <mesh position={[0, BASE_T / 2 + 0.001, -0.2]} receiveShadow>
        <boxGeometry args={[2.75, 0.01, 1.3]} />
        <meshStandardMaterial color={ALUMINIUM_DARK} metalness={0.6} roughness={0.6} />
      </mesh>

      {keys.map((k, i) => (
        <mesh key={i} position={[k.x, top, k.z]} castShadow>
          <boxGeometry args={[k.w, 0.022, k.d]} />
          <meshStandardMaterial color={KEY} metalness={0.25} roughness={0.75} />
        </mesh>
      ))}

      {/* Trackpad */}
      <mesh position={[0, top - 0.004, 0.62]}>
        <boxGeometry args={[1.02, 0.012, 0.66]} />
        <meshStandardMaterial color="#a7acb4" metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Laptop() {
  const ref = useRef<Group>(null);
  const screen = useScreenTexture();

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.12;
    // Gentle breathing tilt, so it never looks like a static render.
    ref.current.rotation.x = -0.06 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
  });

  return (
    <group ref={ref} rotation={[-0.06, -0.5, 0]}>
      {/* Base chassis */}
      <RoundedBox args={[BASE_W, BASE_T, BASE_D]} radius={0.035} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={ALUMINIUM} metalness={0.86} roughness={0.32} />
      </RoundedBox>

      <Keyboard />

      {/* Hinge barrel */}
      <mesh position={[0, BASE_T / 2, -BASE_D / 2 + 0.03]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.032, 0.032, BASE_W * 0.72, 20]} />
        <meshStandardMaterial color="#6f757e" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Lid — hinged at the back edge, leaning back ~19deg past vertical */}
      <group position={[0, BASE_T / 2, -BASE_D / 2 + 0.03]} rotation={[-0.33, 0, 0]}>
        <RoundedBox
          args={[BASE_W, LID_H, LID_T]}
          radius={0.03}
          smoothness={4}
          position={[0, LID_H / 2, 0]}
          castShadow
        >
          <meshStandardMaterial color={ALUMINIUM} metalness={0.86} roughness={0.34} />
        </RoundedBox>

        {/* Screen bezel */}
        <mesh position={[0, LID_H / 2, LID_T / 2 + 0.002]}>
          <planeGeometry args={[BASE_W - 0.12, LID_H - 0.12]} />
          <meshStandardMaterial color="#101318" metalness={0.2} roughness={0.6} />
        </mesh>

        {/* Panel */}
        <mesh position={[0, LID_H / 2 + 0.015, LID_T / 2 + 0.006]}>
          <planeGeometry args={[BASE_W - 0.2, LID_H - 0.26]} />
          {screen ? (
            <meshStandardMaterial
              map={screen}
              emissiveMap={screen}
              emissive="#ffffff"
              emissiveIntensity={0.62}
              roughness={0.22}
              metalness={0}
            />
          ) : (
            <meshStandardMaterial color="#1a2340" />
          )}
        </mesh>

        {/* Webcam dot */}
        <mesh position={[0, LID_H - 0.05, LID_T / 2 + 0.007]}>
          <circleGeometry args={[0.012, 12]} />
          <meshStandardMaterial color="#05070a" />
        </mesh>
      </group>
    </group>
  );
}

/** A few chamfer-red accent motes, tying the scene to the brand without noise. */
function Motes() {
  return (
    <>
      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.9}>
        <mesh position={[2.5, 0.9, -0.6]}>
          <boxGeometry args={[0.1, 0.5, 0.32]} />
          <meshStandardMaterial color="#ff2b3d" emissive="#ff2b3d" emissiveIntensity={1.1} />
        </mesh>
      </Float>
      <Float speed={1.7} rotationIntensity={0.5} floatIntensity={0.7}>
        <mesh position={[-2.6, 1.35, -0.3]} rotation={[0.3, 0.4, 0.1]}>
          <boxGeometry args={[0.62, 0.16, 0.3]} />
          <meshStandardMaterial color="#1b2028" metalness={0.7} roughness={0.35} />
        </mesh>
      </Float>
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0.2, 2.3, 5.3], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.55} />
      {/* Key light */}
      <directionalLight position={[4, 6, 5]} intensity={2.1} castShadow />
      {/* Cool fill from behind, so the aluminium edge reads */}
      <pointLight position={[-5, 2, -3]} intensity={22} color="#9ec5ff" />
      {/* Brand rim */}
      <pointLight position={[-2.4, 0.6, 2.6]} intensity={16} color="#ff2b3d" />

      <group position={[0, -0.55, 0]}>
        <Laptop />
        <Motes />
        <ContactShadows position={[0, -0.12, 0]} opacity={0.42} scale={11} blur={2.6} far={3} />
      </group>
    </Canvas>
  );
}
