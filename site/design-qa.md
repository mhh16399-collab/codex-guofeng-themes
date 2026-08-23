# Design QA — natural-ratio theme previews

## Comparison target

- Source visual truth:
  - `D:\CodexTemp\guofeng-design-qa\source-hero-annotated.png` (2755 × 1394): the annotated home screen identifying the oversized decorative frame, unwanted header strip, launch seal, and undersized preview.
  - `D:\CodexTemp\guofeng-design-qa\source-gallery-reference.png` (2675 × 1394): the supplied gallery reference for readable, landscape-oriented theme previews.
  - `D:\CodexTemp\guofeng-design-qa\source-modal-before.png` (2328 × 1168): the rejected detail state showing the image cropped inside a fixed-height split panel.
  - `C:\Users\WANGXI~1\AppData\Local\Temp\codex-clipboard-f4c06349-2296-486f-9d0d-80859ccabc7c.png`: rounded gallery-card reference, including the inset preview ring.
  - `C:\Users\WANGXI~1\AppData\Local\Temp\codex-clipboard-1036f57a-251d-4e0b-b6c9-5fe55aa3d105.png`: three-column community-gallery proportion reference.
  - `C:\Users\WANGXI~1\AppData\Local\Temp\codex-clipboard-19395aa5-2f04-40e9-a4ee-2e15098e8e54.png`: functional card reference for client launch and detail preview.
- Browser-rendered implementation:
  - `D:\CodexTemp\guofeng-design-qa\implementation-hero.png` (1265 × 712)
  - `D:\CodexTemp\guofeng-design-qa\implementation-gallery.png` (1265 × 712)
  - `D:\CodexTemp\guofeng-design-qa\implementation-modal.png` (1280 × 720)
  - `D:\CodexTemp\guofeng-design-qa\implementation-hero-v2.png` (final enlarged hero)
  - `D:\CodexTemp\guofeng-design-qa\implementation-gallery-v2.png` (final three-column gallery)
  - `D:\CodexTemp\guofeng-design-qa\implementation-gallery-18-mobile.png` (final eighteen-theme responsive gallery)
  - `D:\CodexTemp\guofeng-design-qa\implementation-jinling-detail-mobile.png` (final rounded 金陵云锦 detail dialog)
- Combined comparison evidence:
  - `D:\CodexTemp\guofeng-design-qa\compare-hero.png`
  - `D:\CodexTemp\guofeng-design-qa\compare-gallery.png`
  - `D:\CodexTemp\guofeng-design-qa\compare-modal.png`
- Desktop CSS viewport: 1280 × 720, client width 1265, `devicePixelRatio: 2`. Browser screenshots were normalized by the capture surface to approximately CSS-pixel dimensions before comparison.
- Mobile check: 390 × 844 viewport, client width 375. No horizontal overflow (`scrollWidth === clientWidth`).
- State: home hero, gallery with all eighteen themes, and the open 金陵云锦 detail dialog.

## Findings

No actionable P0, P1, or P2 findings remain.

- Fonts and typography: the home title retains the established Song-style hierarchy and now stays on two desktop lines. Mobile wrapping remains deliberate and readable.
- Spacing and layout rhythm: the desktop hero preview grew from about 692 px to 844 px at the tested viewport, while the hero's bottom padding was reduced to 28 px. The former museum-label header and launch seal are gone; the only remaining label is a restrained right-aligned `竹青` caption. The desktop gallery now uses three 396 px cards per row instead of four 289 px cards.
- Colors and visual tokens: the existing paper, bamboo-green, and cinnabar token system is unchanged. Removing the red launch seal reduces unnecessary emphasis without altering brand identity.
- Image quality and asset fidelity: previews use the approved PNG files directly. The hero renders at 1.596 versus its 1.599 natural ratio. Browser measurements confirmed every new preview at its exact 1.500 natural ratio, with `object-fit: contain`; the 金陵云锦 detail image also renders at 1.500. No source is cropped or stretched.
- Copy and content: no functional gallery or installation copy changed. `馆藏一号` and `首发` were removed as requested; `竹青` remains as the sole hero caption.

## Full-view comparison evidence

- Hero comparison confirms the preview is materially larger, the header strip and launch seal are absent, and the original theme screenshot is visible edge to edge.
- Gallery comparison confirms each theme screenshot is presented as a readable landscape preview rather than a forced uniform crop.
- The final follow-up view confirms the hero uses nearly all available right-column width and the gallery previews are materially larger without changing their natural ratios.
- Detail comparison confirms the complete Codex preview is visible, the information/actions remain usable, and the preview itself now carries a rounded edge instead of merely relying on the outer dialog.

## Focused-region evidence

Additional crops were not required because the full-view comparisons keep the relevant preview boundaries, title wrapping, caption, and dialog controls legible. Computed browser measurements were used to verify image ratios precisely.

## Interaction and console checks

- Main navigation to the gallery works.
- Opening and closing the 金陵云锦 dialog works.
- The gallery exposes 18 cards and 18 strict `dreamskin://preset?theme=preset-*` launch links.
- Searching `金陵云锦` returns exactly one theme; clearing the search restores all 18.
- Browser console warnings/errors: none.

## Comparison history

1. Initial P1: the hero forced the 1.599 source into a 1.780 crop and displayed an extra museum label plus launch seal. Fix: removed the fixed aspect ratio and decorative header/seal, widened the right column, and added a minimal `竹青` caption. Post-fix evidence: 769 × 482 rendered image, ratio 1.596, no `.frame-label`, no `.seal`.
2. Initial P2: gallery cards forced every image into 1.580 with `object-fit: cover`, cropping themes whose originals range from 1.500 to 1.599. Fix: natural `height: auto` plus `object-fit: contain`. Post-fix evidence: rendered ratios equal their natural ratios.
3. Initial P1: detail preview used a fixed-height `object-fit: cover` panel. Fix: enlarged the dialog and rendered the source at natural height with `object-fit: contain`. Post-fix evidence: 876 × 548 image, rendered and natural ratio both 1.599.
4. Follow-up P2: widening the preview caused the desktop title to wrap to three lines. Fix: split the title into two desktop no-wrap lines while preserving normal mobile wrapping. Post-fix evidence: two desktop lines and no viewport overflow at 390 px.
5. Follow-up P2: the 769 px hero still left too much unused horizontal space and the four-column gallery remained visually undersized. Fix: narrowed the copy rail, expanded the hero image to 844 × 528, reduced hero padding, and changed the desktop gallery to three 396 px cards. Post-fix evidence: hero ratio 1.597, gallery preview ratio 1.599, three columns at 1280 px, two at 1000 px, one at 760 px.

## Follow-up polish

- P3 accepted: card image heights vary by up to roughly 12 px because the source images have different natural ratios. This is intentional and follows the explicit requirement to show the original images without cropping.
- Gallery cards now use a 14 px outer radius and 14 px inset breathing ring; preview frames use a 10 px radius, visible border, and restrained shadow. The hero preview uses a 16 px radius.
- Each of the eighteen cards exposes `一键换肤` and `查看详情`. The former emits only a strict local bundled-preset URI; the latter reuses the accessible uncropped detail dialog.
- Static contract coverage checks all eighteen action pairs, the exact local URI prefix, the rounded/inset card contract, the rounded hero, and the rounded detail preview. Windows tests reject noncanonical, injected, path-bearing, and case-shifted preset URIs.
- Latest annotation: the dialog container already had a 16 px outer radius, but the preview image itself still computed to `0px`, leaving visible square image corners. The desktop image now uses `15px 0 0 15px`; the stacked responsive layout uses `15px 15px 0 0`. A focused regression test failed before the change and passes afterward, and the post-fix browser measurement reports `15px` image corners.

## Final result

The desktop and responsive comparisons pass. All ten new 1536 × 1024 previews preserve their natural 1.500 ratio in the browser, the eighteen-card gallery/search/detail interactions work, and the post-fix rounded 金陵云锦 detail capture is recorded above.

final result: pass
