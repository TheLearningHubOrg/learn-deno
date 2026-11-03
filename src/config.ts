export interface Config {
  hostname: string;
  port: number;
}

/** The one method of `Deno.env` this module needs. Tests pass a fake. */
export interface EnvReader {
  get(key: string): string | undefined;
}

export const DEFAULT_PORT = 8000;

/**
 * Reads PORT from the environment. Binding 0.0.0.0 (not localhost) lets
 * the server accept traffic from outside a container.
 */
export function loadConfig(env: EnvReader): Config {
  const raw = env.get("PORT");
  if (raw === undefined || raw === "") {
    return { hostname: "0.0.0.0", port: DEFAULT_PORT };
  }

  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new RangeError(
      `PORT must be an integer from 1 to 65535, got "${raw}"`,
    );
  }
  return { hostname: "0.0.0.0", port };
}
