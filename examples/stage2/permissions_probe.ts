// Run without flags, then with some, and compare the output:
//   deno run --no-prompt examples/stage2/permissions_probe.ts
//   deno run --allow-env=HOME --allow-read=. examples/stage2/permissions_probe.ts

const probes: Deno.PermissionDescriptor[] = [
  { name: "env", variable: "HOME" },
  { name: "read", path: "." },
  { name: "write", path: "/tmp" },
  { name: "net", host: "jsr.io:443" },
  { name: "run", command: "git" },
  { name: "sys", kind: "hostname" },
];

for (const descriptor of probes) {
  const status = await Deno.permissions.query(descriptor);
  console.log(`${JSON.stringify(descriptor).padEnd(40)} ${status.state}`);
}

// Touching a resource without permission throws Deno.errors.NotCapable.
try {
  Deno.env.get("HOME");
  console.log("HOME is readable");
} catch (err) {
  if (err instanceof Deno.errors.NotCapable) {
    console.log(`blocked: ${err.message}`);
  } else {
    throw err;
  }
}
