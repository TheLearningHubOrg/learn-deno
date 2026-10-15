import { itemStore } from './kv/store.ts';
import type { SystemDiagnostics } from './types.ts';

export function handleRequest(req: Request): Response | Promise<Response> {
  const url = new URL(req.url);
  const start = performance.now();

  const jsonResponse = (data: unknown, status = 200) => {
    const elapsedMs = (performance.now() - start).toFixed(3);
    return new Response(JSON.stringify(data, null, 2), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Response-Time-Ms': elapsedMs,
        'X-Runtime': 'Deno-2'
      }
    });
  };

  // 1. Root Discovery
  if (url.pathname === '/' && req.method === 'GET') {
    return jsonResponse({
      name: 'Learn Deno 2 Edge Cloud Masterclass API',
      version: '1.0.0',
      runtime: 'Deno',
      denoVersion: Deno.version.deno,
      v8Version: Deno.version.v8,
      endpoints: {
        health: '/health',
        items: '/api/v1/items'
      }
    });
  }

  // 2. Health & System Diagnostics
  if (url.pathname === '/health' && req.method === 'GET') {
    const mem = Deno.memoryUsage();
    const diagnostics: SystemDiagnostics = {
      runtime: 'Deno',
      denoVersion: Deno.version.deno,
      v8Version: Deno.version.v8,
      typescriptVersion: Deno.version.typescript,
      target: Deno.build.target,
      uptimeSeconds: Math.round(performance.now() / 1000),
      memoryUsageMb: Math.round(mem.heapUsed / 1024 / 1024)
    };
    return jsonResponse({ status: 'healthy', diagnostics });
  }

  // 3. GET /api/v1/items
  if (url.pathname === '/api/v1/items' && req.method === 'GET') {
    return (async () => {
      const items = await itemStore.getAll();
      return jsonResponse({ success: true, data: items, meta: { total: items.length } });
    })();
  }

  // 4. POST /api/v1/items
  if (url.pathname === '/api/v1/items' && req.method === 'POST') {
    return (async () => {
      try {
        const body = (await req.json()) as { title?: string; description?: string; status?: string };
        if (!body.title || typeof body.title !== 'string') {
          return jsonResponse({ success: false, error: 'Title is required' }, 400);
        }
        const created = await itemStore.create(
          body.title,
          body.description || '',
          (body.status as any) || 'pending'
        );
        return jsonResponse({ success: true, data: created }, 201);
      } catch {
        return jsonResponse({ success: false, error: 'Malformed JSON payload' }, 400);
      }
    })();
  }

  // 5. DELETE /api/v1/items/:id
  if (url.pathname.startsWith('/api/v1/items/') && req.method === 'DELETE') {
    return (async () => {
      const id = url.pathname.split('/').pop() || '';
      const deleted = await itemStore.delete(id);
      if (!deleted) {
        return jsonResponse({ success: false, error: `Item with id ${id} not found` }, 404);
      }
      return jsonResponse({ success: true, data: { deletedId: id } });
    })();
  }

  // 404 Not Found
  return jsonResponse({ success: false, error: `Route not found: ${req.method} ${url.pathname}` }, 404);
}
