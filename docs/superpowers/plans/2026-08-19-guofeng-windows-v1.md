# Codex 国风主题工坊 Windows v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Windows-only Codex Guofeng Themes derivative with Zhuqing as the safe fresh-install default and Zhuqing, Zhusha, and Moyun available from the existing tray theme switcher.

**Architecture:** Keep the upstream CDP injector, managed state directory, import contract, rollback flow, and internal DreamSkin identifiers intact. Add a small validated bundled-preset catalog that drives Windows theme seeding, then deliver each visual as a pure 16:9 background plus `theme.json` and Safe CSS. Rebrand user-facing Windows and repository copy without changing internal compatibility paths or protocols.

**Tech Stack:** PowerShell 5.1/7, Node.js 24 for existing validators/tests, JSON theme contracts, Safe CSS, Inno Setup, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-08-19-guofeng-windows-v1-design.md`

## Global Constraints

- Windows 10/11 x64 only for this release; do not claim macOS support.
- Do not modify `WindowsApps`, `app.asar`, official signatures, ACLs, or Codex binaries.
- Preserve `%LOCALAPPDATA%\CodexDreamSkin`, internal `DreamSkin` function names, and `dreamskin://` compatibility.
- New themes contain exactly one background image plus non-empty `theme.json` and `theme.css`.
- Backgrounds are pure 16:9 art with no UI, text, logo, sidebar, cards, buttons, or composer.
- Safe CSS uses only selectors, states, variables, and properties allowed by `runtime/safe-css-policy.json`.
- Fresh installs default to `preset-zhuqing`; existing active or custom themes are never replaced.
- User-facing name is `Codex 国风主题工坊`; English subtitle is `Codex Guofeng Themes`.
- Preserve MIT license, notices, upstream attribution, and label DreamSkin.cc as an upstream-compatible service.
- Do not merge, tag, or publish a Release without separate authorization.

---

### Task 1: Lock the bundled-theme catalog contract with failing tests

**Files:**
- Modify: `windows/tests/run-tests.ps1`
- Modify: `windows/tests/installer-static.tests.ps1`
- Test: `windows/tests/run-tests.ps1`

**Interfaces:**
- Consumes: existing `Initialize-DreamSkinThemeStore`, `Get-DreamSkinSavedThemes`, runtime inventory assertions.
- Produces: executable expectations for `windows/presets/catalog.json`, three IDs, fresh default, idempotent reinitialization, and installer payload completeness.

- [ ] **Step 1: Replace the old two-preset expectations with the new three-theme contract**

Add assertions equivalent to:

```powershell
$initialTheme = Read-DreamSkinTheme -ThemeDirectory $themePaths.Active
if ($initialTheme.Theme.id -cne 'preset-zhuqing' -or
  $initialTheme.Theme.name -cne '竹青' -or
  $initialTheme.Theme.appearance -cne 'light') {
  throw 'Fresh Windows theme state did not default to Zhuqing.'
}
$preseededThemes = @(Get-DreamSkinSavedThemes -StateRoot $themeStateRoot)
$preseededIds = @($preseededThemes | ForEach-Object { $_.Id } | Sort-Object)
$expectedIds = @('preset-moyun', 'preset-zhuqing', 'preset-zhusha')
if (Compare-Object $expectedIds $preseededIds) {
  throw 'Windows did not preseed exactly the three Guofeng themes.'
}
foreach ($theme in $preseededThemes) {
  if ($theme.SafeCssStatus -cne 'validated') {
    throw "Bundled Guofeng theme did not validate Safe CSS: $($theme.Id)"
  }
}
```

- [ ] **Step 2: Assert catalog and payload inventory**

Add exact file checks for:

```powershell
$guofengPayload = @(
  'presets\catalog.json',
  'presets\preset-zhuqing\background.jpg',
  'presets\preset-zhuqing\theme.json',
  'presets\preset-zhuqing\theme.css',
  'presets\preset-zhusha\background.jpg',
  'presets\preset-zhusha\theme.json',
  'presets\preset-zhusha\theme.css',
  'presets\preset-moyun\background.jpg',
  'presets\preset-moyun\theme.json',
  'presets\preset-moyun\theme.css'
)
```

Verify both source and staged engine contain every entry.

- [ ] **Step 3: Run the focused tests and confirm RED**

Run:

```powershell
$node = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$env:Path = (Split-Path -Parent $node) + ';' + $env:Path
pwsh -NoProfile -File .\windows\tests\run-tests.ps1
```

Expected: FAIL because fresh state still uses `preset-arina-hashimoto` and the catalog/Guofeng files do not exist.

- [ ] **Step 4: Commit the failing contract**

```powershell
git add windows/tests/run-tests.ps1 windows/tests/installer-static.tests.ps1
git commit -m "test: define bundled guofeng theme contract"
```

### Task 2: Add the three production theme packs and catalog

**Files:**
- Create: `windows/presets/catalog.json`
- Create: `windows/presets/preset-zhuqing/background.jpg`
- Create: `windows/presets/preset-zhuqing/theme.json`
- Create: `windows/presets/preset-zhuqing/theme.css`
- Create: `windows/presets/preset-zhusha/background.jpg`
- Create: `windows/presets/preset-zhusha/theme.json`
- Create: `windows/presets/preset-zhusha/theme.css`
- Create: `windows/presets/preset-moyun/background.jpg`
- Create: `windows/presets/preset-moyun/theme.json`
- Create: `windows/presets/preset-moyun/theme.css`
- Replace: `windows/assets/dream-reference.jpg`
- Modify: `windows/assets/theme.json`
- Create: `windows/assets/theme.css`
- Test: `windows/tests/run-tests.ps1`

**Interfaces:**
- Consumes: schema version 1 theme JSON and `dreamskin-safe-css/1` policy.
- Produces: ordered catalog IDs and three independently valid saved-theme directories; `windows/assets` is a compatibility copy of Zhuqing for fresh activation.

- [ ] **Step 1: Generate pure background assets**

Generate three independent 2048×1152 or 2560×1440 JPEG-compatible backgrounds from the approved previews:

- Zhuqing: paper-white field, pale bamboo shadows only at right/right-bottom, open center and left.
- Zhusha: porcelain-white field, cinnabar moon-gate arc and lattice shadow at far right, no clouds or festive objects.
- Moyun: cool xuan paper, distant mountains/river/flying-white brush texture at far right and lower right, no plants or bamboo.

Inspect every image directly. Reject any image containing UI, text, logo, character, watermark, or central high-contrast detail.

- [ ] **Step 2: Write the catalog**

```json
{
  "schemaVersion": 1,
  "defaultThemeId": "preset-zhuqing",
  "themes": [
    "preset-zhuqing",
    "preset-zhusha",
    "preset-moyun"
  ]
}
```

- [ ] **Step 3: Write exact theme contracts**

Each `theme.json` uses `image: "background.jpg"`, `appearance: "light"`, `safeArea: "left"`, and `taskMode: "ambient"`. Use these color identities:

```json
{
  "preset-zhuqing": {
    "background": "#f4f7f1", "panel": "#edf4ec", "panelAlt": "#e4efe5",
    "accent": "#3f7b5c", "accentAlt": "#74a98a", "secondary": "#a9c9b4",
    "highlight": "#286347", "text": "#203b2e", "muted": "#66786e",
    "line": "rgba(63, 123, 92, .24)"
  },
  "preset-zhusha": {
    "background": "#f7f0e5", "panel": "#f7f1e9", "panelAlt": "#efe2d5",
    "accent": "#9f2f28", "accentAlt": "#c86a56", "secondary": "#d7b9a5",
    "highlight": "#741f1a", "text": "#322522", "muted": "#776963",
    "line": "rgba(159, 47, 40, .22)"
  },
  "preset-moyun": {
    "background": "#f2f1ec", "panel": "#f0f1ed", "panelAlt": "#e5e8e4",
    "accent": "#2f5452", "accentAlt": "#839391", "secondary": "#b7bfba",
    "highlight": "#1f3f3e", "text": "#1f2424", "muted": "#6d7572",
    "line": "rgba(47, 84, 82, .24)"
  }
}
```

- [ ] **Step 4: Write policy-compliant theme CSS**

Use only registered parts and allowed properties, for example:

```css
[data-ds-part="root"] {
  --ds-theme-font-family: "Microsoft YaHei UI", "Noto Sans SC", sans-serif;
  --ds-theme-surface-opacity: .82;
  --ds-theme-surface-blur: 14px;
  --ds-theme-surface-radius: 16px;
  --ds-theme-surface-border-alpha: .22;
  --ds-theme-density-scale: 1;
  --ds-theme-motion-level: .7;
}
[data-ds-part="sidebar"],
[data-ds-part="composer"] {
  border-color: var(--ds-theme-color-line);
  box-shadow: 0 12px 32px rgba(31, 36, 36, .06);
}
```

Keep each file visually distinct through approved variables, border treatment, and surface opacity without using unregistered selectors or properties.

- [ ] **Step 5: Validate each pack before integration**

Run for all three CSS files:

```powershell
$node = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node .\windows\scripts\validate-safe-css-file.mjs `
  .\windows\presets\preset-zhuqing\theme.css
```

Expected: exit 0 for Zhuqing, Zhusha, and Moyun.

- [ ] **Step 6: Commit theme assets**

```powershell
git add windows/assets windows/presets
git commit -m "feat: add Zhuqing Zhusha and Moyun themes"
```

### Task 3: Implement data-driven preset seeding and staged-runtime validation

**Files:**
- Modify: `windows/scripts/theme-windows.ps1`
- Modify: `windows/scripts/common-windows.ps1`
- Modify: `windows/installer/setup-bootstrap.ps1`
- Modify: `windows/installer/build-release.ps1`
- Test: `windows/tests/run-tests.ps1`
- Test: `windows/tests/installer-static.tests.ps1`

**Interfaces:**
- Consumes: `windows/presets/catalog.json` schema `{schemaVersion, defaultThemeId, themes[]}`.
- Produces: `Read-DreamSkinBundledPresetCatalog -SkillRoot [string]` and `Sync-DreamSkinBundledPresets -SkillRoot [string] -Paths [object]`; initialization returns the unchanged existing paths object.

- [ ] **Step 1: Add strict catalog parsing**

Implement checks that:

- file is strict UTF-8 and valid JSON object;
- `schemaVersion` equals integer `1`;
- `defaultThemeId` equals `preset-zhuqing` and occurs once in `themes`;
- list contains exactly three unique IDs matching `^preset-[A-Za-z0-9_-]{1,72}$`;
- each directory name equals the theme JSON `id`;
- each pack contains exactly one referenced image and non-empty Safe CSS that validates locally.

- [ ] **Step 2: Replace the hard-coded Gothic seeding block with catalog iteration**

Use the existing managed-directory, no-reparse, image metadata, UTF-8, and atomic-copy helpers. For every catalog ID, refresh its saved copy by copying `background.jpg`, `theme.json`, and `theme.css`; never delete other user themes.

- [ ] **Step 3: Preserve fresh/default and upgrade behavior**

On a missing active theme, copy the Zhuqing compatibility files from `windows/assets`. On an existing theme, refresh active metadata only when its ID matches a catalog preset; preserve custom themes exactly.

- [ ] **Step 4: Extend required runtime inventory**

Add `assets\theme.css`, catalog, and all nine preset files to both source and installed-engine lists. Ensure `build-release.ps1` stages the same relative files and does not depend on macOS preset sources.

- [ ] **Step 5: Run focused RED-to-GREEN loop**

Run the Windows suite. Expected after implementation: fresh active ID `preset-zhuqing`; exactly three saved IDs; all CSS validated; second initialization preserves custom active theme and saved-theme count.

- [ ] **Step 6: Commit preset engine integration**

```powershell
git add windows/scripts windows/installer windows/tests
git commit -m "feat(windows): seed catalog-driven guofeng themes"
```

### Task 4: Rebrand Windows-facing UI without breaking compatibility

**Files:**
- Modify: `windows/scripts/localization-windows.ps1`
- Modify: `windows/scripts/tray-dream-skin.ps1`
- Modify: `windows/scripts/check-update.ps1`
- Modify: `windows/installer/codex-dream-skin.iss`
- Modify: `windows/README.md`
- Modify: `windows/README.en.md`
- Test: `windows/tests/localization-contract.test.mjs`
- Test: `windows/tests/installer-static.tests.ps1`

**Interfaces:**
- Consumes: existing localization keys and installer AppId/state paths.
- Produces: user-visible `Codex 国风主题工坊` / `Codex Guofeng Themes` titles while internal script/function/path/protocol identifiers remain unchanged.

- [ ] **Step 1: Write failing display-name assertions**

Require Chinese tray/update/import titles and installer AppName to contain `Codex 国风主题工坊`, and English equivalents to contain `Codex Guofeng Themes`. Assert that AppId, `%LOCALAPPDATA%\CodexDreamSkin`, `dreamskin://`, restore entry points, and RemoteSigned policy remain unchanged.

- [ ] **Step 2: Update localization and installer display copy**

Change only user-facing strings. Keep the existing installer AppId and default directory for upgrade/recovery compatibility. Change the product URL to the fork repository and keep Gallery/Studio labels explicitly marked as upstream-compatible.

- [ ] **Step 3: Run localization and installer tests**

```powershell
$node = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node .\windows\tests\localization-contract.test.mjs
pwsh -NoProfile -File .\windows\tests\installer-static.tests.ps1
```

Expected: PASS in PowerShell 7; source remains parseable by Windows PowerShell 5.1 static checks.

- [ ] **Step 4: Commit Windows branding**

```powershell
git add windows
git commit -m "feat(windows): brand the Guofeng theme workshop"
```

### Task 5: Replace repository presentation and add approved previews

**Files:**
- Modify: `README.md`
- Modify: `README.en.md`
- Create: `docs/images/guofeng/zhuqing-preview.png`
- Create: `docs/images/guofeng/zhusha-preview.png`
- Create: `docs/images/guofeng/moyun-preview.png`
- Modify: `SECURITY.md` only if product-name text needs clarification; do not weaken controls.
- Modify: `TASK_PROGRESS.md`

**Interfaces:**
- Consumes: approved previews and actual implemented theme IDs/files.
- Produces: bilingual onboarding, attribution, screenshots, install/recover explanation, and honest Windows-only support status.

- [ ] **Step 1: Copy approved previews into the repository**

Use stable descriptive filenames. Do not use a UI preview as any theme's `background.jpg`.

- [ ] **Step 2: Rewrite the root README hero and quick start**

Lead with the product name, three-theme preview row, Windows install path, tray switching, safe restore, non-official statement, and exact upstream attribution. Remove inherited sponsor copy and any claim that DreamSkin.cc is this fork's own service.

- [ ] **Step 3: Add honest compatibility wording**

State that current official Store Codex builds may block CDP; never promise compatibility without a verified local endpoint. Explain that internal DreamSkin names remain for safe upgrade/rollback compatibility.

- [ ] **Step 4: Verify Markdown links and asset references**

```powershell
rg -n "Fei-Away|DreamSkin\.cc|codex-guofeng-themes|preset-(zhuqing|zhusha|moyun)" README.md README.en.md windows docs
git diff --check
```

- [ ] **Step 5: Commit documentation and preview assets**

```powershell
git add README.md README.en.md docs windows/README.md windows/README.en.md TASK_PROGRESS.md
git commit -m "docs: present Codex Guofeng Themes"
```

### Task 6: Complete verification, review, and GitHub handoff

**Files:**
- Modify: `TASK_PROGRESS.md`
- Verify: all changed files

**Interfaces:**
- Consumes: completed implementation commits.
- Produces: evidence-backed branch, pushed remote head, and a draft PR; no merge/tag/Release.

- [ ] **Step 1: Run syntax and focused checks**

```powershell
$node = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
& $node --check .\windows\scripts\injector.mjs
& $node --check .\windows\assets\renderer-inject.js
Get-ChildItem .\windows\scripts\*.ps1 | ForEach-Object {
  [void][scriptblock]::Create([System.IO.File]::ReadAllText($_.FullName))
}
git diff --check
```

- [ ] **Step 2: Run the full Windows regression suite**

```powershell
$node = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$env:Path = (Split-Path -Parent $node) + ';' + $env:Path
pwsh -NoProfile -File .\windows\tests\run-tests.ps1
```

Expected: exit 0. Record exact pass/fail output and any intentional fault-injection warnings.

- [ ] **Step 3: Build or statically validate Setup.exe**

Run `windows/installer/build-release.ps1` when Inno Setup is available. Otherwise run the repository's installer static suite and record Setup build as a CI gate rather than claiming it passed locally.

- [ ] **Step 4: Perform visual smoke when the local Codex build allows CDP**

Install only from the worktree after tests pass, launch through the managed shortcut, switch Zhuqing → Zhusha → Moyun, capture screenshots, verify sidebar/cards/composer/project selector remain interactive, then restore official appearance. If the current Store build exposes no validated endpoint, record the upstream block and keep preview images labeled simulated.

- [ ] **Step 5: Review the complete diff and update durable progress**

Record branch, commits, exact tests, visual result, unresolved upstream compatibility, and release status. Ensure no credentials, user paths in public docs, generated temp files, or unrelated upstream changes are staged.

- [ ] **Step 6: Push branch and open a draft PR**

```powershell
git push -u origin codex/guofeng-windows-v1
gh pr create --draft --base main --head codex/guofeng-windows-v1 `
  --title "feat(windows): launch Codex Guofeng Themes" `
  --body-file .github/pull_request_template.md
```

Replace the template-only body with an accurate summary, tests, screenshots, attribution, and known limitations. Do not merge, tag, or publish a Release.
