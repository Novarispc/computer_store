import { MODE_STORAGE_KEY } from "@/lib/constants";

/**
 * Runs before first paint, inside <head>. Sets the .dark class from stored
 * preference (falling back to the OS) so there is no light-to-dark flash.
 */
export function ThemeInit({ nonce }: { nonce?: string }) {
  const js = `
(function(){
  try {
    var k = ${JSON.stringify(MODE_STORAGE_KEY)};
    var stored = localStorage.getItem(k);
    var mode = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var el = document.documentElement;
    el.classList.toggle("dark", mode === "dark");
    el.style.colorScheme = mode;
  } catch (e) {}
})();`.trim();

  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: js }} />;
}
