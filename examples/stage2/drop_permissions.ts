// Run: deno run --allow-read=. --allow-write=./tmp-demo examples/stage2/drop_permissions.ts
// Reads config while it may, then revokes write access for the rest of the run.

await Deno.mkdir("./tmp-demo", { recursive: true });
await Deno.writeTextFile(
  "./tmp-demo/boot.log",
  `booted ${new Date().toISOString()}\n`,
);

const revoked = await Deno.permissions.revoke({ name: "write" });
console.log("write permission is now:", revoked.state); // "prompt" or "denied"

try {
  await Deno.writeTextFile("./tmp-demo/late.log", "too late\n");
} catch (err) {
  console.log("late write blocked:", err instanceof Deno.errors.NotCapable);
}

console.log(await Deno.readTextFile("./tmp-demo/boot.log"));
