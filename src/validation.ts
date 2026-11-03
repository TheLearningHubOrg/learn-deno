import { ITEM_STATUSES, type ItemStatus, type NewItem } from "./types.ts";

/** A discriminated union: check `ok` and TypeScript narrows the rest. */
export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export const MAX_TITLE_LENGTH = 200;

export function isItemStatus(value: unknown): value is ItemStatus {
  return typeof value === "string" &&
    (ITEM_STATUSES as readonly string[]).includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Turns an untrusted JSON body into a NewItem, or explains why it cannot.
 * The input is typed `unknown` on purpose: nothing from the network is
 * trusted until it has been checked.
 */
export function parseNewItem(input: unknown): ParseResult<NewItem> {
  if (!isRecord(input)) {
    return { ok: false, error: "Body must be a JSON object" };
  }

  const { title, description = "", status = "pending" } = input;

  if (typeof title !== "string" || title.trim() === "") {
    return { ok: false, error: "title is required" };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return {
      ok: false,
      error: `title must be at most ${MAX_TITLE_LENGTH} characters`,
    };
  }
  if (typeof description !== "string") {
    return { ok: false, error: "description must be a string" };
  }
  if (!isItemStatus(status)) {
    return {
      ok: false,
      error: `status must be one of: ${ITEM_STATUSES.join(", ")}`,
    };
  }

  return { ok: true, value: { title: title.trim(), description, status } };
}
