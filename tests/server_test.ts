import { assertEquals, assertExists } from '@std/assert';
import { handleRequest } from '../src/server.ts';

Deno.test('GET / returns Deno metadata', async () => {
  const req = new Request('http://localhost:8000/');
  const res = await handleRequest(req);
  assertEquals(res.status, 200);

  const body = (await res.json()) as { runtime: string; version: string };
  assertEquals(body.runtime, 'Deno');
  assertEquals(body.version, '1.0.0');
});

Deno.test('GET /health returns diagnostics and timing headers', async () => {
  const req = new Request('http://localhost:8000/health');
  const res = await handleRequest(req);
  assertEquals(res.status, 200);
  assertEquals(res.headers.get('X-Runtime'), 'Deno-2');
  assertExists(res.headers.get('X-Response-Time-Ms'));

  const body = (await res.json()) as { status: string; diagnostics: { runtime: string } };
  assertEquals(body.status, 'healthy');
  assertEquals(body.diagnostics.runtime, 'Deno');
});

Deno.test('CRUD operations on /api/v1/items', async () => {
  // 1. List
  const listReq = new Request('http://localhost:8000/api/v1/items');
  const listRes = await handleRequest(listReq);
  assertEquals(listRes.status, 200);

  // 2. Create
  const createReq = new Request('http://localhost:8000/api/v1/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Automated Deno Test',
      description: 'Testing in-memory KV operations'
    })
  });
  const createRes = await handleRequest(createReq);
  assertEquals(createRes.status, 201);
  const created = (await createRes.json()) as { success: boolean; data: { id: string; title: string } };
  assertEquals(created.success, true);
  assertEquals(created.data.title, 'Automated Deno Test');

  // 3. Delete
  const deleteReq = new Request(`http://localhost:8000/api/v1/items/${created.data.id}`, {
    method: 'DELETE'
  });
  const deleteRes = await handleRequest(deleteReq);
  assertEquals(deleteRes.status, 200);
});
