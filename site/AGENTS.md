# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

For theme previews, preserve each source image's natural aspect ratio. Do not crop or stretch preview art to make cards uniform. The home hero keeps a large right-side preview that uses the available width without leaving conspicuous dead space, but it must show the original image directly without a museum-label header or launch seal; use only a restrained theme-name caption such as “竹青”. On desktop, the gallery uses three large cards per row so the interface previews remain legible; detail previews must also prioritize the complete uncropped image over decorative framing.

All newly published theme previews use one shared synthetic Windows Codex interface. Only the background, palette, and explicitly selected sidebar composition may vary; never use the user's real desktop or real conversation content. Full-window art must remain clear in the sidebar without backdrop blur, native top bars use an opaque theme-matched color, and injected brand/status decorations must not overlap native task chrome.

Gallery cards use a rounded outer container plus an inset, rounded preview frame with a visible paper-colored breathing ring, light border, and restrained shadow. Preview images must not sit flush against the outer card edge.

Every gallery card exposes two real actions. `一键换肤` must use the strict local bundled-preset protocol `dreamskin://preset?theme=preset-<id>`; it must never put a download URL, file path, or command into the protocol. `查看详情` opens the complete uncropped preview in the existing accessible detail dialog. Keep these actions visually inside the rounded card rather than overlaying the artwork.

The detail dialog itself is one rounded, clipped surface. Its left preview and right information panel must stay inside the same outer radius; never leave the full dialog as a square rectangle while rounding only the image or inner controls.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
