# Codex 国风主题馆与五套新主题 v2 实施计划

> **执行要求：** 使用测试先行；每个阶段先观察目标失败，再写最小实现。客户端安全/恢复逻辑不得为适配新主题而降低断言。

**目标：** 将 Windows 内置主题扩展到 8 套，并按用户选择的“东方数字展馆”视觉稿实现可部署到 GitHub Pages 的响应式主题馆。

**架构：** 上游注入、恢复、ZIP 与 Safe CSS 内核保持不动；五套主题作为 `windows/presets/` 数据增量加入。站点位于 `site/`，采用 Product Design Vite/React 模板，主题内容集中在一份类型化数据文件中。GitHub Pages 只托管构建后的静态站点，主题 ZIP 与安装器由 GitHub Release 承载。

**技术栈：** PowerShell 7、Node.js 24（Codex bundled runtime）、Node test runner、Vite、React、TypeScript、CSS、GitHub Actions/Pages、Inno Setup。

---

## 任务 1：锁定上游兼容基线与测试绿线

**文件：**
- 修改：`TASK_PROGRESS.md`
- 验证：`windows/tests/run-tests.ps1`

1. 将 Codex bundled Node 目录临时前置到当前进程 `PATH`。
2. 运行完整 Windows wrapper，记录退出码和主要 PASS 证据。
3. 确认 `origin/main` 是 `upstream/main@95423d84` 的直接后继且 behind 为 0。
4. 在 `TASK_PROGRESS.md` 写入基线已通过；不提交本机绝对 Node 路径。

## 任务 2：为 8 套 Catalog 写失败测试

**文件：**
- 修改：`windows/tests/guofeng-bundled-themes.tests.ps1`
- 修改：`windows/tests/run-tests.ps1`
- 修改：`windows/tests/installer-static.tests.ps1`
- 修改：`windows/tests/theme-schema-contract.test.mjs`

1. 把主题 ID 期望列表改为 8 套，并明确顺序和默认竹青。
2. 增加 Catalog 数量上界、重复 ID、非法 ID、缺件、额外文件和非法 Safe CSS 用例。
3. 增加五套新主题的 appearance、完整十色、背景文件名和题材元数据断言。
4. 运行聚焦测试，确认因目录和 Catalog 尚未实现而失败，保存失败摘要。

## 任务 3：生成并校验五套运行时纯背景

**文件：**
- 新增：`windows/presets/preset-ruyao-tianqing/background.jpg`
- 新增：`windows/presets/preset-dunhuang-liujin/background.jpg`
- 新增：`windows/presets/preset-qinghua-ci/background.jpg`
- 新增：`windows/presets/preset-haitang-songjin/background.jpg`
- 新增：`windows/presets/preset-jiye-xinghe/background.jpg`

1. 用 ImageGen 分别生成五张无 UI、无文字、无 Logo 的东方艺术背景。
2. 机械裁切/缩放为统一 16:9 JPEG，控制在主题限制内；不得从带 Codex UI 的预览图裁背景。
3. 逐张检查主题辨识度、安全留白、压缩质量、尺寸和文件体积。
4. 用现有图片元数据测试验证魔数、尺寸、像素与大小边界。

## 任务 4：实现五套主题包与 Catalog

**文件：**
- 修改：`windows/presets/catalog.json`
- 新增：五个新预设目录下的 `theme.json`
- 新增：五个新预设目录下的 `theme.css`
- 修改：`windows/scripts/theme-windows.ps1`
- 修改：`windows/scripts/common-windows.ps1`

1. 为五套主题写完整 schema 1 JSON、十色、明暗、焦点、安全区与任务模式。
2. 为五套主题写只作用于公开 `data-ds-part` 的 Safe CSS。
3. 将 Catalog 扩展为 8 套，竹青保持默认。
4. 将“恰好 3 套”硬编码改为有界 `1..32`，同时保持重复/非法/缺件 fail closed。
5. 更新受管引擎 required files，确保同版本修复和升级包含五套新主题。
6. 运行任务 2 的聚焦测试，确认转绿。

## 任务 5：更新安装器审核哈希与 8 套发布清单

**文件：**
- 修改：`windows/installer/build-release.ps1`
- 修改：`windows/installer/setup-bootstrap.ps1`
- 修改：`windows/tests/installer-static.tests.ps1`

1. 先让安装器测试期待 8 套并观察失败。
2. 更新有序主题 ID、Catalog 和 24 个主题文件的固定 SHA-256。
3. 保留文本规范化哈希与 JPEG 原始字节哈希的区别。
4. 构建 staging payload，确认没有漏装、额外文件或旧 3 套硬编码。

## 任务 6：初始化 Product Design 站点骨架

**文件：**
- 新增：`site/` Product Design prototype template
- 修改：`site/src/Prototype.tsx`
- 修改：`site/src/prototype.css`
- 新增：`site/src/data/themes.ts`

1. 用官方 bootstrap 脚本在 `site/` 初始化 web prototype 模板。
2. 安装依赖，先运行模板 runtime 检查和测试。
3. 写主题数据测试：8 套、唯一 slug、明暗枚举、有效资源与版本化下载状态。
4. 实现页面数据类型和基础结构，保持模板受保护文件不变。

## 任务 7：准备“东方数字展馆”真实视觉素材

**文件：**
- 新增：`site/public/assets/brand/guofeng-mark.png`
- 新增：`site/public/assets/decor/xuan-bamboo-mountains.jpg`
- 新增：`site/public/assets/themes/*-preview.png`

1. 复制三套现有预览和五套已批准预览到站点资产目录。
2. 生成独立站点标识与宣纸竹影/远山装饰，不用 CSS 图形或占位框冒充。
3. 为卡片生成统一缩略图版本，保留原始预览供详情查看。
4. 核对每个资源的裁切、清晰度、命名和主题对应关系。

## 任务 8：按选中视觉稿实现核心页面与交互

**文件：**
- 修改：`site/src/Prototype.tsx`
- 修改：`site/src/prototype.css`
- 新增/修改：`site/src/components/*`
- 新增/修改：`site/src/**/*.test.*`

1. 实现顶部导航、沉浸首展、两枚主操作、主题图鉴、搜索和明暗筛选。
2. 实现 8 张册页卡片和主题详情抽屉，显示大图、色板、标签、说明和安装入口。
3. 让“浏览主题”滚动到图鉴，“收藏此馆”跳转 GitHub，“安装”跳到安装说明。
4. 实现键盘焦点、Esc 关闭详情、焦点回收、空搜索状态和减少动效。
5. 实现 1366/1440/1536 桌面、平板和单列手机布局，无横向溢出。
6. 运行组件/数据测试、类型检查和生产构建。

## 任务 9：GitHub Pages 与站点合同测试

**文件：**
- 新增：`.github/workflows/pages.yml`
- 新增/修改：`site/scripts/*`
- 修改：`.github/workflows/ci.yml`

1. 添加站点 CI：安装、测试、runtime check、build 和输出文件验证。
2. 添加 Pages workflow，使用官方 Actions 的完整 SHA 与最小 `pages/id-token/contents` 权限。
3. 确认项目子路径 `/codex-guofeng-themes/` 下资源和路由可用。
4. 在 Release 未发布时不生成失效下载按钮，显示“随 v1.7.0 发布”。

## 任务 10：文档、版本与更新日志

**文件：**
- 修改：`README.md`
- 修改：`README.en.md`
- 修改：`windows/README.md`
- 修改：`docs/install-windows.md`
- 修改：`windows/CHANGELOG.md`
- 修改：六处版本源及版本绑定测试

1. README 从“三套”更新为“八套”，加入主题馆入口和五套新作图鉴。
2. 说明 Pages、内置主题、单独 ZIP、安装器和恢复的关系。
3. 将六处发布版本一致更新到 1.7.0，修正版本绑定测试。
4. 不声称 Pages 或 Release 已公开，直到远端真实验证完成。

## 任务 11：浏览器视觉 QA 与交互验收

**文件：**
- 新增：`design-qa.md`
- 新增：QA 截图证据目录（不提交临时浏览器文件时在报告中注明）

1. 启动本地站点并用 Codex 应用内浏览器打开。
2. 在与视觉稿相同的 1536×1024 状态捕获实现截图。
3. 将选中视觉稿和实现截图合成同一比较输入，检查字体、比例、颜色、图片、文案和交互。
4. 修复所有 P0/P1/P2，再次同尺寸比较；`design-qa.md` 最终必须为 `passed`。
5. 额外测试搜索、筛选、详情、Esc、CTA、移动视口和控制台错误。

## 任务 12：完整客户端与发布产物验证

**文件：**
- 验证整个工作树

1. 运行完整 Windows wrapper、Node 测试、PowerShell 解析、runtime sync、`git diff --check`。
2. 构建 v1.7.0 Setup.exe，核对 8 套主题和 SHA-256。
3. 在安全可用的官方 Codex 会话中做 8 套切换与恢复 smoke；若 CDP 受阻，如实记录。
4. 更新 `TASK_PROGRESS.md`，清楚写明本地、测试、提交、推送、Pages、Release 各自状态。
5. 按用户单独授权执行提交、推送、PR、合并、Pages 启用和 Release；每一步后验证真实远端结果。
