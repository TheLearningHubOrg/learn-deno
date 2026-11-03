// Run: deno run examples/stage3/modules_demo.ts
// Shows the three kinds of specifiers and an import attribute.

import { assertEquals } from "@std/assert"; // bare: resolved by deno.json "imports"
import settings from "./settings.json" with { type: "json" }; // relative + attribute
import { parseArgs } from "node:util"; // Node built-in

assertEquals(settings.retries, 3);

const { values } = parseArgs({
  args: ["--name", "deno"],
  options: { name: { type: "string" } },
});

console.log(`${settings.appName}: hello ${values.name}`);
console.log("resolved @std/assert to", import.meta.resolve("@std/assert"));

// Dynamic import: loaded only when this line runs.
const { MemoryItemStore } = await import("../../src/store.ts");
console.log(
  "lazy-loaded store has",
  (await new MemoryItemStore().list()).length,
  "items",
);
