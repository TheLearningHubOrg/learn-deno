import type { Item, NewItem } from "./types.ts";

/**
 * The storage contract the HTTP layer depends on. Stage 5 adds a Deno KV
 * implementation of the same interface; the handler does not change.
 */
export interface ItemStore {
  list(): Promise<Item[]>;
  get(id: string): Promise<Item | undefined>;
  create(input: NewItem): Promise<Item>;
  delete(id: string): Promise<boolean>;
}

export interface MemoryStoreOptions {
  /** Id generator. Tests pass a counter to get predictable ids. */
  newId?: () => string;
  /** Clock. Tests pass a fixed date. */
  now?: () => Date;
  /** Items to start with. */
  seed?: NewItem[];
}

export const SAMPLE_ITEMS: NewItem[] = [
  {
    title: "Run the starter with scoped permissions",
    description: "deno task start uses the default permission set",
    status: "completed",
  },
  {
    title: "Swap the memory store for Deno KV",
    description: "Stage 5 keeps the same ItemStore interface",
    status: "pending",
  },
];

/** In-memory store. Fine for one process; data is lost on restart. */
export class MemoryItemStore implements ItemStore {
  readonly #items = new Map<string, Item>();
  readonly #newId: () => string;
  readonly #now: () => Date;

  constructor(options: MemoryStoreOptions = {}) {
    this.#newId = options.newId ?? (() => crypto.randomUUID());
    this.#now = options.now ?? (() => new Date());
    for (const item of options.seed ?? []) {
      this.#insert(item);
    }
  }

  list(): Promise<Item[]> {
    return Promise.resolve([...this.#items.values()]);
  }

  get(id: string): Promise<Item | undefined> {
    return Promise.resolve(this.#items.get(id));
  }

  create(input: NewItem): Promise<Item> {
    return Promise.resolve(this.#insert(input));
  }

  delete(id: string): Promise<boolean> {
    return Promise.resolve(this.#items.delete(id));
  }

  #insert(input: NewItem): Item {
    const item: Item = {
      id: this.#newId(),
      ...input,
      createdAt: this.#now().toISOString(),
    };
    this.#items.set(item.id, item);
    return item;
  }
}
