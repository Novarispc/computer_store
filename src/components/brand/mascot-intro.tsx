"use client";

import { useEffect, useRef, useState } from "react";
import { Mascot, WordmarkPlate } from "@/components/brand/logo";
import { INTRO_STORAGE_KEY } from "@/lib/constants";

/**
 * The mascot appears in place with a soft fade + scale-up, settles, and the
 * lock-up fades out to hand the page over. No cross-viewport flight — this is
 * a calm materialisation, not an entrance.
 *
 * Rules, in order of importance:
 *   - `prefers-reduced-motion` ⇒ the intro never mounts at all. Not a shorter
 *     animation: none. The page renders normally.
 *   - Once per session (sessionStorage), so internal navigation never replays it.
 *   - Skippable by any click, key, scroll or touch.
 *   - Compositor-only: animates `transform` and `opacity`, nothing that lays out.
 *   - `pointer-events: none` on the figure, so a skip click always lands.
 */

const APPEAR_MS = 900;
const HOLD_MS = 550;
const FADE_MS = 500;

export function MascotIntro({ mascotSrc }: { mascotSrc?: string | null }) {
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reduced motion: never play, and never write the session flag either, so
    // the user's preference is re-read rather than cached into a "seen" state.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return;
    }

    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_STORAGE_KEY) === "1";
    } catch {
      // Private mode / storage disabled — treat as unseen but do not crash.
    }
    if (seen) {
      setPhase("done");
      return;
    }

    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {}

    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;

    const finish = () => setPhase("done");
    const total = APPEAR_MS + HOLD_MS + FADE_MS;
    const timer = window.setTimeout(finish, total);

    // Any intent to interact skips the rest immediately.
    const skip = () => finish();
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("wheel", skip, { once: true, passive: true });
    window.addEventListener("touchstart", skip, { once: true, passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
    };
  }, [phase]);

  if (phase !== "playing") return null;

  return (
    <div
      ref={overlay}
      data-testid="mascot-intro"
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-background"
      style={{
        animation: `esq-overlay-out ${FADE_MS}ms ease-in ${APPEAR_MS + HOLD_MS}ms forwards`,
      }}
    >
      {/* circuit backdrop */}
      <div className="circuit-field absolute inset-0 opacity-60" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 50% 40% at 50% 45%, var(--glow), transparent 70%)" }}
      />

      <div className="relative flex flex-col items-center">
        <div
          className="pointer-events-none"
          style={{ animation: `esq-appear ${APPEAR_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both` }}
        >
          {mascotSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mascotSrc} alt="" className="h-[220px] w-auto sm:h-[280px]" />
          ) : (
            <Mascot size={180} className="h-auto w-[150px] sm:w-[190px]" />
          )}
        </div>

        <div
          className="mt-4"
          style={{ animation: `esq-settle 620ms ease-out ${APPEAR_MS - 260}ms both` }}
        >
          <WordmarkPlate />
        </div>
      </div>

      <style>{`
        @keyframes esq-appear {
          from {
            transform: scale(0.85);
            opacity: 0;
            filter: blur(6px);
          }
          to {
            transform: scale(1);
            opacity: 1;
            filter: blur(0);
          }
        }
        @keyframes esq-settle {
          from { transform: translate3d(0, 16px, 0) scale(0.94); opacity: 0; }
          to   { transform: none; opacity: 1; }
        }
        @keyframes esq-overlay-out {
          to { opacity: 0; visibility: hidden; }
        }
      `}</style>
    </div>
  );
}
