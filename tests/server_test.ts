import { assert, assertEquals, assertExists } from "@std/assert";
import { createHandler, type Handler } from "../src/server.ts";
import { MemoryItemStore } from "../src/store.ts";
import type { Item } from "../src/types.ts";

const BASE = "http://localhost";

/** A handler over an empty store with ids "1", "2", ... */
function freshHandler(): Handler {
  let n = 0;
  return createHandler(new MemoryItemStore({ newId: () => String(++n) }));
}

function post(handler: Handler, body: unknown): Promise<Response> {
  return handler(
    new Request(`${BASE}/api/v1/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

Deno.test("GET /health reports ok with runtime versions", async () => {
  const res = await freshHandler()(new Request(`${BASE}/health`));
  assertEquals(res.status, 200);
  assertEquals(res.headers.get("content-type"), "application/json");
  assertExists(res.headers.get("x-response-time-ms"));

  const body = await res.json();
  assertEquals(body.status, "ok");
  assertEquals(body.deno, Deno.version.deno);
});

Deno.test("GET / lists the endpoints", async () => {
  const res = await freshHandler()(new Request(`${BASE}/`));
  const body = await res.json();
  assert(body.endpoints.includes("/health"));
});

Deno.test("item lifecycle: create, list, get, delete", async (t) => {
  const handler = freshHandler();
  let created: Item;

  await t.step("POST creates an item and sets Location", async () => {
    const res = await post(handler, { title: "Read Stage 1" });
    assertEquals(res.status, 201);
    assertEquals(res.headers.get("location"), "/api/v1/items/1");
    created = (await res.json()).data;
    assertEquals(created.status, "pending");
  });

  await t.step("GET lists it", async () => {
    const res = await handler(new Request(`${BASE}/api/v1/items`));
    const body = await res.json();
    assertEquals(body.total, 1);
    assertEquals(body.data[0].id, created.id);
  });

  await t.step("GET by id returns it", async () => {
    const res = await handler(new Request(`${BASE}/api/v1/items/1`));
    assertEquals((await res.json()).data, created);
  });

  await t.step("DELETE removes it, a second DELETE is 404", async () => {
    const del = () =>
      handler(new Request(`${BASE}/api/v1/items/1`, { method: "DELETE" }));
    const first = await del();
    assertEquals(first.status, 204);
    assertEquals(first.body, null);
    const second = await del();
    assertEquals(second.status, 404);
    await second.body?.cancel();
  });
});

Deno.test("POST rejects malformed JSON and invalid fields", async () => {
  const handler = freshHandler();

  const malformed = await post(handler, "{not json");
  assertEquals(malformed.status, 400);
  assertEquals((await malformed.json()).error, "Body is not valid JSON");

  const invalid = await post(handler, { title: "x", status: "done" });
  assertEquals(invalid.status, 400);
  assertEquals(
    (await invalid.json()).error,
    "status must be one of: pending, in_progress, completed",
  );
});

Deno.test("unknown routes are 404, wrong methods are 405", async () => {
  const handler = freshHandler();

  const missing = await handler(new Request(`${BASE}/nope`));
  assertEquals(missing.status, 404);
  await missing.body?.cancel();

  const wrongMethod = await handler(
    new Request(`${BASE}/api/v1/items`, { method: "PUT" }),
  );
  assertEquals(wrongMethod.status, 405);
  assertEquals(wrongMethod.headers.get("allow"), "GET, POST");
});
