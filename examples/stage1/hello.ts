// Run: deno run examples/stage1/hello.ts
// No permission flags: this script only computes and prints.

interface RuntimeInfo {
  deno: string;
  v8: string;
  typescript: string;
  os: typeof Deno.build.os;
}

function describeRuntime(): RuntimeInfo {
  return {
    deno: Deno.version.deno,
    v8: Deno.version.v8,
    typescript: Deno.version.typescript,
    os: Deno.build.os,
  };
}

if (import.meta.main) {
  const info = describeRuntime();
  console.log(`Deno ${info.deno} on ${info.os}`);
  console.table(info);
  console.log("main module:", import.meta.filename ?? import.meta.url);
}
