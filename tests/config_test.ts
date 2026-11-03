import { assertEquals, assertThrows } from "@std/assert";
import { DEFAULT_PORT, type EnvReader, loadConfig } from "../src/config.ts";

/** A fake Deno.env, so the test needs no --allow-env. */
function fakeEnv(values: Record<string, string>): EnvReader {
  return { get: (key) => values[key] };
}

Deno.test("loadConfig falls back to the default port", () => {
  assertEquals(loadConfig(fakeEnv({})), {
    hostname: "0.0.0.0",
    port: DEFAULT_PORT,
  });
});

Deno.test("loadConfig reads PORT", () => {
  assertEquals(loadConfig(fakeEnv({ PORT: "9090" })).port, 9090);
});

Deno.test("loadConfig rejects ports that are not valid TCP ports", () => {
  for (const bad of ["abc", "0", "65536", "80.5", "-1"]) {
    assertThrows(
      () => loadConfig(fakeEnv({ PORT: bad })),
      RangeError,
      "PORT must be an integer",
    );
  }
});
