# Brand artwork

Drop the real Esquire artwork here and the site picks it up automatically —
no code change, no rebuild of any component. See `src/lib/brand-assets.ts`.

| File | Used by | Notes |
|---|---|---|
| `mascot.png` | The fly-in intro | **Transparent background.** The figure only — no wordmark, no plate. Tall crop, roughly 3:4. |
| `logo-full.png` | Site header | Mascot + wordmark lockup. Rendered at 28px tall, so keep it legible small. |
| `wordmark.png` | Reserved | Wordmark only. |

`.webp` and `.svg` are accepted for any of these too; the first match wins.

Until a file exists, the drawn SVG stand-ins in
`src/components/brand/logo.tsx` are used instead.
