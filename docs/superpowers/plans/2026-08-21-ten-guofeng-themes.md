# Ten Guofeng Themes Implementation Plan

> Approved visual source of truth: the ten previews generated and accepted on 2026-08-21. Do not redesign their composition, subject placement, palette, contrast, or light/dark mode.

## Theme map

| Order | Preset ID | Name | Appearance | Visual lock |
| --- | --- | --- | --- | --- |
| 09 | `preset-qianli-jiangshan` | 千里江山 | light | mineral blue-green landscape, warm ivory center, gold contour lines |
| 10 | `preset-jingtai-hualan` | 景泰华蓝 | dark | navy gallery, cloisonné vessel at right, turquoise enamel and gold wire |
| 11 | `preset-heiqi-luodian` | 黑漆螺钿 | dark | black lacquer, mother-of-pearl bird and plum screen at right |
| 12 | `preset-chayan-songfeng` | 茶烟松风 | light | rice paper, pine upper-right, Yixing tea ware lower-right |
| 13 | `preset-sunmao-danying` | 榫卯丹楹 | light | parchment, warm timber bracket set at upper/right, cinnabar details |
| 14 | `preset-ruihe-lingxiao` | 瑞鹤凌霄 | light | mist blue and ivory, red-crowned cranes, clouds and distant palace |
| 15 | `preset-tangsancai` | 唐三彩 | light | cream field, sancai horse at right, amber/olive/green glazed edges |
| 16 | `preset-hanjian-mohen` | 汉简墨痕 | dark | roasted-tea brown, bamboo slips, ink marks and bronze patina |
| 17 | `preset-luoshui-liuxia` | 洛水流霞 | dark | indigo/aubergine moonlit water city, violet ribbons, rose-gold accents |
| 18 | `preset-jinling-yunjin` | 金陵云锦 | light | cool silk-ivory center, midnight-navy sidebar, peacock-blue and emerald brocade with gold thread at right and bottom |

## Execution

1. Extend the Windows and gallery contract tests from eight to eighteen reviewed themes and confirm they fail.
2. Persist the approved preview PNGs inside the repository.
3. Derive pure no-UI backgrounds from those previews, preserving their exact art direction and negative space.
4. Add ten complete Windows preset directories with schema-valid JSON, safe CSS and reviewed backgrounds.
5. Add the ten presets to the catalog, installer repair payload, release payload and reviewed hash manifest.
6. Add the ten themes to the gallery and update all visible counts from eight to eighteen.
7. Run the fast changed-theme validator for the ten new preset IDs, then run the gallery tests/build, Windows theme tests, installer static tests, one release-gate Windows full regression, `git diff --check`, and visual comparison.

## Future theme batches

- Daily theme work uses `windows/tests/run-theme-change-tests.ps1 -PresetIds <changed IDs>` so only the newly added or edited presets are fully validated.
- The focused lane checks the changed theme files, Safe CSS, catalog membership, gallery preview, installer/repair payload entries, and current SHA-256 manifest values. It does not re-run historical ZIP attack fixtures.
- `windows/tests/run-tests.ps1` remains the release gate for changes to the importer, recovery engine, protocol handler, installer, or a tagged release. Run it once after a batch is complete rather than after every new theme.
