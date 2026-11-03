import type { ItemStore } from "./store.ts";
import type { HealthReport } from "./types.ts";
import { parseNewItem } from "./validation.ts";

export type Handler = (req: Request) => Promise<Response>;

const ITEMS_PATH = "/api/v1/items";
const ITEM_BY_ID = new URLPattern({ pathname: `${ITEMS_PATH}/:id` });

function errorResponse(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

function methodNotAllowed(allow: string): Response {
  return new Response(null, { status: 405, headers: { Allow: allow } });
}

/**
 * Builds the request handler. The store is a parameter, so tests can hand
 * in a fresh one and never need a socket or a permission flag.
 */
export function createHandler(
  store: ItemStore,
  startedAt: number = performance.now(),
): Handler {
  async function route(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const { pathname } = url;

    if (pathname === "/") {
      if (req.method !== "GET") return methodNotAllowed("GET");
      return Response.json({
        name: "learn-deno starter",
        endpoints: ["/health", ITEMS_PATH, `${ITEMS_PATH}/:id`],
      });
    }

    if (pathname === "/health") {
      if (req.method !== "GET") return methodNotAllowed("GET");
      const report: HealthReport = {
        status: "ok",
        deno: Deno.version.deno,
        v8: Deno.version.v8,
        typescript: Deno.version.typescript,
        target: Deno.build.target,
        uptimeSeconds: Math.round((performance.now() - startedAt) / 1000),
      };
      return Response.json(report);
    }

    if (pathname === ITEMS_PATH) {
      if (req.method === "GET") {
        const items = await store.list();
        return Response.json({ data: items, total: items.length });
      }
      if (req.method === "POST") {
        let body: unknown;
        try {
          body = await req.json();
        } catch {
          return errorResponse(400, "Body is not valid JSON");
        }
        const parsed = parseNewItem(body);
        if (!parsed.ok) return errorResponse(400, parsed.error);

        const item = await store.create(parsed.value);
        return Response.json({ data: item }, {
          status: 201,
          headers: { Location: `${ITEMS_PATH}/${item.id}` },
        });
      }
      return methodNotAllowed("GET, POST");
    }

    const match = ITEM_BY_ID.exec(url);
    if (match) {
      const id = match.pathname.groups.id ?? "";
      if (req.method === "GET") {
        const item = await store.get(id);
        return item
          ? Response.json({ data: item })
          : errorResponse(404, `Item ${id} not found`);
      }
      if (req.method === "DELETE") {
        const deleted = await store.delete(id);
        return deleted
          ? new Response(null, { status: 204 })
          : errorResponse(404, `Item ${id} not found`);
      }
      return methodNotAllowed("GET, DELETE");
    }

    return errorResponse(404, `No route for ${req.method} ${pathname}`);
  }

  return async (req) => {
    const start = performance.now();
    let res: Response;
    try {
      res = await route(req);
    } catch (err) {
      console.error("unhandled error", err);
      res = errorResponse(500, "Internal server error");
    }
    res.headers.set(
      "X-Response-Time-Ms",
      (performance.now() - start).toFixed(2),
    );
    return res;
  };
}
