import { handleRequest } from './server.ts';

const port = Number(Deno.env.get('PORT')) || 8000;

console.log(`[learn-deno] Deno 2 server starting on http://localhost:${port}`);
console.log(`[learn-deno] Engine: Google V8 v${Deno.version.v8} | Core: Rust Tokio`);

Deno.serve({ port }, handleRequest);
