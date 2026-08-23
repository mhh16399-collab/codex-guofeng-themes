const targets = await fetch("http://127.0.0.1:9335/json/list").then((response) => response.json());
const target = targets.find((item) => item.type === "page" && !item.url.includes("avatar-overlay"));
if (!target?.webSocketDebuggerUrl) throw new Error("No Codex page target");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let nextId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  const waiter = pending.get(message.id);
  if (!waiter) return;
  pending.delete(message.id);
  waiter(message);
});
const send = (method, params = {}) => new Promise((resolve) => {
  const id = ++nextId;
  pending.set(id, resolve);
  socket.send(JSON.stringify({ id, method, params }));
});

const expression = `(() => {
  const summarize = (node) => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return {
      tag: node.tagName,
      className: String(node.className || ''),
      dsPart: node.getAttribute('data-ds-part'),
      background: style.background,
      backdropFilter: style.backdropFilter,
      opacity: style.opacity,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    };
  };
  const edited = [...document.querySelectorAll('*')].find((node) =>
    node.childElementCount === 0 && /已编辑\s*\d+\s*个文件/.test(node.textContent || '')
  );
  const editedChain = [];
  for (let node = edited; node && editedChain.length < 12; node = node.parentElement) {
    editedChain.push(summarize(node));
  }
  const points = [[120, 18], [610, 18], [1100, 18], [650, 285], [650, 390], [650, 615]];
  return {
    visibility: document.visibilityState,
    viewport: { width: innerWidth, height: innerHeight },
    editedChain,
    points: points.map(([x, y]) => {
      const chain = [];
      for (let node = document.elementFromPoint(x, y); node && chain.length < 8; node = node.parentElement) {
        chain.push(summarize(node));
      }
      return { x, y, chain };
    }),
  };
})()`;
const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
console.log(JSON.stringify(response.result?.result?.value ?? response, null, 2));
socket.close();
