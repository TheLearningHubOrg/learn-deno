import type { Item } from '../types.ts';

// In-memory fallback if Deno KV is not activated or running without --unstable-kv
class MemoryKvStore {
  private store: Map<string, Item> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    this.store.set('1', {
      id: '1',
      title: 'Master Deno 2 V8 Isolates & Rust Tokio',
      description: 'Understand capabilities, zero-overhead ops, and security flags',
      status: 'completed',
      createdAt: new Date().toISOString()
    });
    this.store.set('2', {
      id: '2',
      title: 'Deploy Deno KV with Atomic Transactions',
      description: 'Distributed consistency and secondary index patterns',
      status: 'in_progress',
      createdAt: new Date().toISOString()
    });
  }

  async getAll(): Promise<Item[]> {
    return Array.from(this.store.values());
  }

  async getById(id: string): Promise<Item | null> {
    return this.store.get(id) || null;
  }

  async create(title: string, description = '', status: Item['status'] = 'pending'): Promise<Item> {
    const id = String(this.store.size + 1);
    const item: Item = {
      id,
      title,
      description,
      status,
      createdAt: new Date().toISOString()
    };
    this.store.set(id, item);
    return item;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

export const itemStore = new MemoryKvStore();
