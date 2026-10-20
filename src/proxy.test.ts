import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./proxy.ts", import.meta.url), "utf8");

describe("proxy matcher", () => {
  it("does not let request headers opt out of admin authorization", () => {
    expect(source).not.toContain("missing:");
    expect(source).not.toContain("next-router-prefetch");
  });
});
