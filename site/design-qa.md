# Design QA — 梅雪书斋、宋园花窗、长安灯市

## Comparison target

- Source visual truth:
  - `C:\Users\wangxiaohui\.codex\generated_images\01a03785-15e7-71b0-9a84-b69e9a28c987\exec-1542b733-3261-4b2a-a7d7-eb22d6503629.png` — 梅雪书斋 selected mock.
  - `C:\Users\wangxiaohui\.codex\generated_images\01a03785-15e7-71b0-9a84-b69e9a28c987\exec-8d2df3e1-3504-4723-ac47-f59ba95c701b.png` — 宋园花窗 selected mock.
  - `C:\Users\wangxiaohui\.codex\generated_images\01a03785-15e7-71b0-9a84-b69e9a28c987\exec-1683228d-f410-4bb7-a405-35e6ff6a3fe4.png` — 长安灯市 selected mock.
- Browser-rendered implementation screenshots:
  - `D:\CodexWorktrees\codex-guofeng-privacy-clean\site\public\themes\meixue-shuzhai.png`
  - `D:\CodexWorktrees\codex-guofeng-privacy-clean\site\public\themes\songyuan-huachuang.png`
  - `D:\CodexWorktrees\codex-guofeng-privacy-clean\site\public\themes\changan-dengshi.png`
- Combined comparison evidence:
  - `D:\CodexTemp\guofeng-design-qa-20260907\meixue-comparison.png`
  - `D:\CodexTemp\guofeng-design-qa-20260907\songyuan-comparison.png`
  - `D:\CodexTemp\guofeng-design-qa-20260907\changan-comparison.png`
- Viewport and normalization: every source and implementation is 1680 × 934 pixels, CSS viewport 1680 × 934, device scale factor 1. Comparisons place source left and implementation right without resizing or cropping.
- State: synthetic Windows Codex home screen with fixed sidebar, home prompt and composer.

## Findings

No actionable P0, P1, or P2 findings remain.

- Fonts and typography: the implementation intentionally uses the established fixed Windows template and Segoe UI / Microsoft YaHei UI stack instead of copying small generation artifacts. Type sizes, weights, wrapping and hierarchy remain consistent across all three themes and are legible against their backgrounds.
- Spacing and layout rhythm: all implementations use the same 52 px title bar, 360 px sidebar, fixed navigation density and bottom composer geometry. This intentional normalization differs slightly from the generated mocks but directly satisfies the approved cross-theme interface constraint.
- Colors and visual tokens: each opaque title bar matches its theme; no yellow strip or blurred glass remains. The two light themes retain dark readable text, while 长安灯市 uses warm light text over midnight indigo.
- Image quality and asset fidelity: each runtime background is a dedicated 1680 × 934 UI-free PNG. Sidebar imagery is separately composed within the left region and remains clear under a non-blurred overlay. No real desktop, conversation, taskbar or user content is present.
- Copy and content: all previews use the same synthetic project and task labels. Theme names, romanization, taglines, descriptions, stable IDs and download links are consistent between packages and gallery data.

## Full-view comparison evidence

- 梅雪书斋 preserves the warm interior, broad ivory reading zone, desk objects and snow-plum window while using the fixed production shell.
- 宋园花窗 preserves the clean white wall, moon gate, pine, jade water and independent left flower-window composition without the rejected gray or dirty treatment.
- 长安灯市 preserves the midnight avenue, lantern depth, distant gate and independent left eave/lantern composition; the central prompt remains readable.
- The implementation deliberately prioritizes the fixed Windows template over generated UI irregularities, so all three share identical shell geometry.

## Focused-region evidence

No extra crops were required because the 3360 × 934 combined comparisons keep title bars, sidebar text, prompt, composer controls and image boundaries legible at the same pixel density.

## Browser and interaction verification

- The production build was opened in the Codex in-app browser at `http://127.0.0.1:4173/codex-guofeng-themes/`.
- The gallery reports `馆藏 29 / 29`.
- Page 5 visibly contains 梅雪书斋, 宋园花窗 and 长安灯市 with their correct previews and strict `dreamskin://preset?theme=preset-*` links.
- The 长安灯市 detail dialog opened successfully and exposed its full preview and ZIP download route.
- Searching `宋园花窗` returned exactly one matching card.
- Browser warning/error log: none.

## Comparison history

1. Earlier 荷塘听雨 and 剑门蜀道 concepts were rejected for muddy gray texture. They were removed rather than shipped.
2. The first 梅雪映窗 revision duplicated the white-wall garden structure of 宋园花窗. It was replaced with the indoor 梅雪书斋 composition.
3. Final browser-rendered previews were regenerated through one fixed Windows template, eliminating UI drift between themes and keeping title bars opaque and palette-matched.

## Follow-up polish

- P3 accepted: the fixed production prompt wording is shorter than the generated mock copy. This is intentional so the shared template remains consistent.
- P3 accepted: gallery cards show different scene brightness by design; card framing and image aspect ratios remain identical.

## Implementation checklist

- [x] Three UI-free runtime backgrounds.
- [x] Three Safe CSS theme files with no blur.
- [x] Three schema-valid theme manifests.
- [x] Three strict root-level ZIP packages.
- [x] Three fixed-layout synthetic previews and provenance hashes.
- [x] Gallery catalog, pagination, detail and search verification.

final result: passed
