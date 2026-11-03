// Run: deno run examples/stage1/event_loop.ts
// Prints the order in which the event loop runs each kind of callback.

const order: string[] = [];

setTimeout(() => order.push("4. timer (macrotask)"), 0);
queueMicrotask(() => order.push("2. queueMicrotask"));
Promise.resolve().then(() => order.push("3. promise.then"));
order.push("1. synchronous code");

// An async op: the promise settles on a later loop turn.
await new Promise<void>((resolve) => setTimeout(resolve, 10));
order.push("5. after awaiting a 10 ms timer");

console.log(order.join("\n"));
