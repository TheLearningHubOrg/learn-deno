/** Every status an item can be in. `as const` keeps the literal types. */
export const ITEM_STATUSES = ["pending", "in_progress", "completed"] as const;

/** "pending" | "in_progress" | "completed", derived from the array above. */
export type ItemStatus = typeof ITEM_STATUSES[number];

export interface Item {
  id: string;
  title: string;
  description: string;
  status: ItemStatus;
  createdAt: string;
}

/** The fields a client may send when it creates an item. */
export type NewItem = Pick<Item, "title" | "description" | "status">;

export interface HealthReport {
  status: "ok";
  deno: string;
  v8: string;
  typescript: string;
  target: string;
  uptimeSeconds: number;
}
