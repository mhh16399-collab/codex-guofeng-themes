const targets = await fetch("http://127.0.0.1:9335/json/list").then((response) => response.json());
const target = targets.find((item) => item.type === "page");
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
  const width = innerWidth;
  const candidates = [...document.querySelectorAll('button, [role="button"], [class*="Window"], [class*="Title"], [class*="Caption"], svg')]
    .map((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      const svg = node.matches('svg') ? node : node.querySelector('svg');
      const svgStyle = svg ? getComputedStyle(svg) : null;
      return {
        tag: node.tagName,
        className: String(node.className?.baseVal ?? node.className ?? ''),
        ariaLabel: node.getAttribute('aria-label'),
        title: node.getAttribute('title'),
        text: node.textContent?.trim().slice(0, 40) || '',
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        color: style.color,
        fill: style.fill,
        stroke: style.stroke,
        svgColor: svgStyle?.color ?? null,
        svgFill: svgStyle?.fill ?? null,
        svgStroke: svgStyle?.stroke ?? null,
      };
    })
    .filter((item) => item.rect.x > width - 260 && item.rect.y < 80 && item.rect.width > 0 && item.rect.height > 0);
  return { width, visibility: document.visibilityState, candidates };
})()`;

const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
console.log(JSON.stringify(response.result?.result?.value ?? response, null, 2));
socket.close();
