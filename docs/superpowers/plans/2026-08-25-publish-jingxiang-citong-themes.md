# Publish Jingxiang Chaxi and Citong Haibo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the completed Jingxiang Chaxi and Citong Haibo themes in the existing Guofeng gallery with real previews and downloadable strict three-file theme packages.

**Architecture:** Keep the current single-page React gallery and its embedded theme catalog. Add two catalog records, copy the verified live screenshots into the public theme-preview directory, and place the already validated ZIP packages under the public download path. A Node integration test verifies the built site exposes both cards and that each ZIP is present and non-empty; the existing Sites worker tests and production build remain the deployment gates.

**Tech Stack:** React 19, Vite 6, Node test runner, static ZIP/image assets, OpenAI Sites hosting.

**Spec:** User-approved live themes and `site/AGENTS.md` gallery-preview/download contract.

## Global Constraints

- Publish only `preset-jingxiang-chaxi` and `preset-citong-haibo` in this change.
- Use uncropped real Codex screenshots for gallery previews.
- Keep each downloadable ZIP as a normal `.zip` containing non-empty `theme.json`, `theme.css`, and the referenced background image.
- Preserve the existing gallery pagination, filtering, detail dialog, and download URL convention.
- Run `npm run build` and `npm run test:sites` before hosting.

---

### Task 1: Lock the two-theme publication contract

**Files:**
- Create: `site/tests/theme-publication.test.mjs`
- Test: `site/tests/theme-publication.test.mjs`

**Interfaces:**
- Consumes: built `dist/client/index.html` and public assets copied by Vite.
- Produces: a regression gate that fails if either published preview or ZIP is missing from the production build.

- [ ] **Step 1: Write the failing integration test**

Add two literal cases for `jingxiang-chaxi` and `citong-haibo`. Read each expected `dist/client/themes/<id>.png` and `dist/client/downloads/preset-<id>.zip`, assert both are non-empty, and assert the production JavaScript includes each Chinese name and download filename.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run build; node --test tests/theme-publication.test.mjs`

Expected: FAIL because the two public previews and packages are not published yet.

### Task 2: Add the gallery records and verified assets

**Files:**
- Modify: `site/src/App.jsx`
- Create: `site/public/themes/jingxiang-chaxi.png`
- Create: `site/public/themes/citong-haibo.png`
- Create: `site/public/downloads/preset-jingxiang-chaxi.zip`
- Create: `site/public/downloads/preset-citong-haibo.zip`

**Interfaces:**
- Consumes: `themes` catalog schema and `packageUri(theme)` URL convention in `site/src/App.jsx`.
- Produces: two searchable gallery cards, detail dialogs, real preview images, and download links.

- [ ] **Step 1: Copy the approved real screenshots and validated packages**

Use the approved `jingxiang-chaxi-live-final-20260825.png` and `citong-haibo-readable-20260825.png` evidence assets; copy the validated strict ZIP files into the matching public download filenames.

- [ ] **Step 2: Add minimal catalog records**

Append light-theme records for `jingxiang-chaxi` and `citong-haibo` with Chinese/romanized names, approved visual descriptions, palette swatches, and their `themes/<id>.png` image paths.

- [ ] **Step 3: Run the publication and Sites tests**

Run: `npm run build; node --test tests/theme-publication.test.mjs; npm run test:sites`

Expected: all tests PASS and the production build contains both previews and ZIPs.

### Task 3: Record and deploy the exact validated site

**Files:**
- Modify: `TASK_PROGRESS.md`
- Modify: `site/.openai/hosting.json` only when Sites returns a new project ID.

**Interfaces:**
- Consumes: successful site build, Sites project/credential, exact committed source state.
- Produces: a production Sites deployment URL and a durable progress record.

- [ ] **Step 1: Record theme and website verification evidence**

Add the two theme regression results, site build/test results, and publication scope to `TASK_PROGRESS.md` without changing client release claims.

- [ ] **Step 2: Run final repository checks**

Run: the two focused theme tests, `npm run build`, `node --test tests/theme-publication.test.mjs`, `npm run test:sites`, and `git diff --check`.

- [ ] **Step 3: Save and deploy the validated version**

Create or reuse the Sites project, push the exact source state, package the built output with the Sites helper, save one version, deploy it under the verified access policy, and wait for a successful production status.
