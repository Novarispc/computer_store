import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // These components hydrate browser-only preferences and media queries.
      // Their synchronous initialization is intentional; refactor to external
      // stores when those components are next substantially changed.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([".next/**", "build/**", "graphify-out/**", "next-env.d.ts"]),
]);
