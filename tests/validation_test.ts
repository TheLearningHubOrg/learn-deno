import { assertEquals } from "@std/assert";
import {
  isItemStatus,
  MAX_TITLE_LENGTH,
  parseNewItem,
} from "../src/validation.ts";

Deno.test("parseNewItem applies defaults and trims the title", () => {
  assertEquals(parseNewItem({ title: "  Learn JSR  " }), {
    ok: true,
    value: { title: "Learn JSR", description: "", status: "pending" },
  });
});

Deno.test("parseNewItem rejects bad input with a reason", async (t) => {
  const cases: Array<[string, unknown, string]> = [
    ["not an object", "hello", "Body must be a JSON object"],
    ["array", [], "Body must be a JSON object"],
    ["null", null, "Body must be a JSON object"],
    ["missing title", {}, "title is required"],
    ["blank title", { title: "   " }, "title is required"],
    ["numeric title", { title: 42 }, "title is required"],
    [
      "long title",
      { title: "x".repeat(MAX_TITLE_LENGTH + 1) },
      `title must be at most ${MAX_TITLE_LENGTH} characters`,
    ],
    [
      "numeric description",
      { title: "ok", description: 1 },
      "description must be a string",
    ],
    [
      "unknown status",
      { title: "ok", status: "done" },
      "status must be one of: pending, in_progress, completed",
    ],
  ];

  for (const [name, input, error] of cases) {
    await t.step(name, () => {
      assertEquals(parseNewItem(input), { ok: false, error });
    });
  }
});

Deno.test("isItemStatus narrows only known statuses", () => {
  assertEquals(isItemStatus("completed"), true);
  assertEquals(isItemStatus("COMPLETED"), false);
  assertEquals(isItemStatus(undefined), false);
});
