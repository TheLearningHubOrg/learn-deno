import { loadConfig } from "./config.ts";
import { createHandler } from "./server.ts";
import { MemoryItemStore, SAMPLE_ITEMS } from "./store.ts";

/** `server healthcheck` exits 0 when the running server answers /health. */
async function healthcheck(port: number): Promise<number> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    await res.body?.cancel();
    return res.ok ? 0 : 1;
  } catch {
    return 1;
  }
}

if (import.meta.main) {
  const config = loadConfig(Deno.env);

  if (Deno.args[0] === "healthcheck") {
    Deno.exit(await healthcheck(config.port));
  }

  const store = new MemoryItemStore({ seed: SAMPLE_ITEMS });
  const server = Deno.serve({
    hostname: config.hostname,
    port: config.port,
    onListen: ({ hostname, port }) => {
      console.log(`learn-deno listening on http://${hostname}:${port}`);
    },
  }, createHandler(store));

  // Docker sends SIGTERM on stop. Finish in-flight requests, then exit.
  if (Deno.build.os !== "windows") {
    Deno.addSignalListener("SIGTERM", () => {
      console.log("SIGTERM received, draining connections");
      server.shutdown();
    });
  }

  await server.finished;
}
