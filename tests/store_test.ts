import { assertEquals, assertNotEquals } from "@std/assert";
import { MemoryItemStore } from "../src/store.ts";

const FIXED_DATE = new Date("2026-01-01T00:00:00.000Z");

function counterIds(): () => string {
  let n = 0;
  return () => String(++n);
}

Deno.test("MemoryItemStore creates, reads and deletes items", async () => {
  const store = new MemoryItemStore({
    newId: counterIds(),
    now: () => FIXED_DATE,
  });

  const created = await store.create({
    title: "Write a test",
    description: "",
    status: "pending",
  });
  assertEquals(created, {
    id: "1",
    title: "Write a test",
    description: "",
    status: "pending",
    createdAt: "2026-01-01T00:00:00.000Z",
  });
  assertEquals(await store.get("1"), created);
  assertEquals(await store.delete("1"), true);
  assertEquals(await store.delete("1"), false);
  assertEquals(await store.list(), []);
});

Deno.test("ids stay unique after a delete", async () => {
  // Regression test: an id derived from map size reuses ids after a delete.
  const store = new MemoryItemStore();
  const input = { title: "t", description: "", status: "pending" } as const;
  const a = await store.create(input);
  const b = await store.create(input);
  await store.delete(a.id);
  const c = await store.create(input);

  assertNotEquals(c.id, b.id);
  assertEquals((await store.list()).length, 2);
});

Deno.test("seed items are loaded in order", async () => {
  const store = new MemoryItemStore({
    newId: counterIds(),
    seed: [
      { title: "first", description: "", status: "completed" },
      { title: "second", description: "", status: "pending" },
    ],
  });
  const titles = (await store.list()).map((item) => item.title);
  assertEquals(titles, ["first", "second"]);
});
