import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Saira, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeInit } from "@/components/theme/theme-init";
import { getActiveTheme, themeCss } from "@/lib/theme";

export const dynamic = "force-dynamic";

const saira = Saira({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-saira",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Esquire Computers - Two Decades of Service. A Lifetime of Trust",
    template: "%s - Esquire Computers",
  },
  description:
    "Laptops, gaming rigs, workstations, monitors, printers, CCTV, power backup and IT solutions. Multi-brand dealer serving all Kerala since 1998.",
  applicationName: "Esquire Computers",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#08090b" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [theme, requestHeaders] = await Promise.all([getActiveTheme(), headers()]);
  const css = themeCss(theme);
  const nonce = requestHeaders.get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={saira.variable + " " + manrope.variable + " " + jetbrains.variable}
      suppressHydrationWarning
    >
      <head>
        <ThemeInit nonce={nonce} />
        {css ? <style id="active-theme" nonce={nonce} dangerouslySetInnerHTML={{ __html: css }} /> : null}
      </head>
      <body>{children}</body>
    </html>
  );
}
