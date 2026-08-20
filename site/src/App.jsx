import { useEffect, useMemo, useRef, useState } from "react";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

const themes = [
  { id: "zhuqing", name: "竹青", romanized: "Zhu Qing", tone: "light", toneLabel: "浅色", tagline: "竹影入窗，纸白生青", story: "以宣纸白承接青竹的清透，把长时间工作的界面收束成安静、克制的书斋。", colors: ["#edf3eb", "#a9d8bd", "#16815f"], image: "themes/zhuqing.png" },
  { id: "zhusha", name: "朱砂", romanized: "Zhu Sha", tone: "light", toneLabel: "浅色", tagline: "宫墙留影，朱砂点睛", story: "取宫墙朱红、暖瓷白与窗棂影，不做节庆堆砌，保留东方建筑的秩序与留白。", colors: ["#fff6e9", "#d9aa83", "#a93826"], image: "themes/zhusha.png" },
  { id: "moyun", name: "墨韵", romanized: "Mo Yun", tone: "light", toneLabel: "浅色", tagline: "山水入墨，飞白成章", story: "用冷宣纸、远山与飞白墨痕构成低干扰工作空间，水墨层次清晰而不喧宾夺主。", colors: ["#f0f0eb", "#9ea6a2", "#303735"], image: "themes/moyun.png" },
  { id: "ruyao-tianqing", name: "汝窑天青", romanized: "Ruyao Tianqing", tone: "light", toneLabel: "浅色", tagline: "雨过天青，开片有光", story: "雨过天青釉与细密开片铺陈界面，瓷片和柔和器影让工作区清润但不单薄。", colors: ["#e9f1ec", "#abc9bf", "#668e83"], image: "themes/ruyao-tianqing.png" },
  { id: "dunhuang-liujin", name: "敦煌鎏金", romanized: "Dunhuang Liujin", tone: "dark", toneLabel: "深色", tagline: "矿彩凝光，壁上千年", story: "深靛壁色承托飞天、藻井与神兽纹样，以石青、朱砂和鎏金勾勒沉浸式夜间工作场。", colors: ["#111d28", "#2a6e70", "#c89549"], image: "themes/dunhuang-liujin.png" },
  { id: "qinghua-ci", name: "青花瓷", romanized: "Qinghua Ci", tone: "light", toneLabel: "浅色", tagline: "釉白藏蓝，一器一境", story: "青花瓷器、折枝纹与淡米釉白共同降低蓝色饱和度，既有器物感，也适合长期阅读。", colors: ["#f7f2e8", "#c8d9d8", "#386b86"], image: "themes/qinghua-ci.png" },
  { id: "haitang-songjin", name: "海棠宋锦", romanized: "Haitang Songjin", tone: "light", toneLabel: "浅色", tagline: "经纬生花，海棠成锦", story: "将海棠纹、宋锦经纬与克制的胭脂色织入卡片边界，温润细密，却不压过代码内容。", colors: ["#f6eee7", "#d7aaa4", "#9f4b4d"], image: "themes/haitang-songjin.png" },
  { id: "jiye-xinghe", name: "霁夜星河", romanized: "Jiye Xinghe", tone: "dark", toneLabel: "深色", tagline: "星汉低垂，霁色如洗", story: "以宋代观星意象、浑仪和霁蓝夜空构成深色主题，金线星轨带来清晰的操作层级。", colors: ["#10182b", "#1e3b5c", "#c9a461"], image: "themes/jiye-xinghe.png" },
];

function updateQuery(filter, query) {
  const params = new URLSearchParams(window.location.search);
  filter === "all" ? params.delete("tone") : params.set("tone", filter);
  query ? params.set("q", query) : params.delete("q");
  const next = `${window.location.pathname}${params.size ? `?${params}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", next);
}

export function App() {
  const params = new URLSearchParams(window.location.search);
  const initialTone = params.get("tone");
  const [filter, setFilter] = useState(["light", "dark"].includes(initialTone) ? initialTone : "all");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [selected, setSelected] = useState(null);
  const closeButtonRef = useRef(null);
  const returnFocusRef = useRef(null);

  const filteredThemes = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("zh-CN");
    return themes.filter((theme) => {
      const matchesTone = filter === "all" || theme.tone === filter;
      const haystack = `${theme.name} ${theme.romanized} ${theme.tagline}`.toLocaleLowerCase("zh-CN");
      return matchesTone && (!needle || haystack.includes(needle));
    });
  }, [filter, query]);

  useEffect(() => updateQuery(filter, query), [filter, query]);
  useEffect(() => {
    if (!selected) return undefined;
    closeButtonRef.current?.focus();
    const onKeyDown = (event) => { if (event.key === "Escape") setSelected(null); };
    document.body.classList.add("dialog-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("dialog-open");
      window.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [selected]);

  const openDetails = (theme, trigger) => {
    returnFocusRef.current = trigger;
    setSelected(theme);
  };

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Codex 国风主题首页">
          <img src={asset("brand/guofeng-mark.png")} alt="" />
          <span><b>Codex 国风主题</b><small>Guofeng Themes</small></span>
        </a>
        <nav aria-label="主导航">
          <a href="#top">主题馆</a>
          <a href="#gallery">主题图鉴</a>
          <a href="#install">使用指南</a>
          <a href="https://github.com/mhh16399-collab/codex-guofeng-themes/blob/main/windows/CHANGELOG.md" target="_blank" rel="noreferrer">更新日志</a>
          <a className="github-nav" href="https://github.com/mhh16399-collab/codex-guofeng-themes" target="_blank" rel="noreferrer">在 GitHub 上收藏此馆</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <img className="hero-bamboo" src={asset("decor/zhuqing-paper.jpg")} alt="" />
          <div className="hero-copy">
            <p className="eyebrow">CODEX · 东方数字展馆</p>
            <h1 id="hero-title">为你的 Codex<br />换一袭东方颜色</h1>
            <p className="hero-lead">八套原创国风主题，把瓷、锦、壁画、山水与星河带进熟悉的工作界面。Windows 一键切换，随时恢复官方外观。</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#gallery">浏览八套主题</a>
              <a className="button button-quiet" href="https://github.com/mhh16399-collab/codex-guofeng-themes" target="_blank" rel="noreferrer">在 GitHub 上收藏此馆</a>
            </div>
          </div>

          <div className="featured-frame">
            <div className="frame-label"><span>馆藏一号</span><b>竹青 · Zhu Qing</b></div>
            <img src={asset("themes/zhuqing.png")} alt="竹青主题在 Codex Windows 客户端中的预览" />
            <div className="seal" aria-hidden="true">首发</div>
          </div>
        </section>

        <section className="gallery-section" id="gallery" aria-labelledby="gallery-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THEME COLLECTION</p>
              <h2 id="gallery-title">八色成卷，各有风骨</h2>
              <p>每套都包含背景、配色和安全样式，不修改 Codex 安装包。</p>
            </div>
            <span className="collection-count">馆藏 {String(filteredThemes.length).padStart(2, "0")} / 08</span>
          </div>

          <div className="gallery-tools">
            <label className="search-field">
              <span>检索</span>
              <input type="search" placeholder="搜索主题 / 拼音 / 意境" value={query} onChange={(event) => setQuery(event.target.value)} />
            </label>
            <div className="tone-filters" aria-label="主题明暗筛选">
              {[["all", "全部主题"], ["light", "浅色"], ["dark", "深色"]].map(([value, label]) => (
                <button className={filter === value ? "active" : ""} key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>
              ))}
            </div>
          </div>

          {filteredThemes.length ? (
            <div className="theme-grid">
              {filteredThemes.map((theme, index) => (
                <article className="theme-card" key={theme.id}>
                  <button className="preview-button" type="button" onClick={(event) => openDetails(theme, event.currentTarget)} aria-label={`查看${theme.name}详情`}>
                    <img loading={index > 2 ? "lazy" : "eager"} src={asset(theme.image)} alt={`${theme.name} Codex 界面预览`} />
                  </button>
                  <div className="card-body">
                    <div className="card-number">{String(themes.indexOf(theme) + 1).padStart(2, "0")}</div>
                    <div className="card-copy">
                      <div className="card-title-row">
                        <div><h3>{theme.name}</h3><p>{theme.romanized}</p></div>
                        <span className={`tone-badge ${theme.tone}`}>{theme.toneLabel}</span>
                      </div>
                      <p className="card-tagline">{theme.tagline}</p>
                      <div className="card-footer">
                        <div className="swatches" aria-label={`${theme.name}配色`}>{theme.colors.map((color) => <i key={color} style={{ background: color }} />)}</div>
                        <button type="button" onClick={(event) => openDetails(theme, event.currentTarget)}>查看详情</button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="empty-state"><b>没有找到相符主题</b><p>换个关键词，或切回“全部主题”再看看。</p></div>}
        </section>

        <section className="install-section" id="install" aria-labelledby="install-title">
          <div className="install-copy">
            <p className="eyebrow">WINDOWS INSTALLER</p>
            <h2 id="install-title">一套安装包，八套都带走</h2>
            <p>安装后从系统托盘直接切换主题。所有动作可恢复，不替换官方 Codex 文件，也不需要关闭自动更新。</p>
            <a className="button button-primary" href="https://github.com/mhh16399-collab/codex-guofeng-themes/releases/latest" target="_blank" rel="noreferrer">下载 Windows 安装包</a>
          </div>
          <ol className="install-steps">
            <li><span>壹</span><div><b>下载安装</b><p>从 GitHub Release 获取经过校验的 Setup.exe。</p></div></li>
            <li><span>贰</span><div><b>托盘切换</b><p>打开“已保存主题”，八套国风皮肤一键生效。</p></div></li>
            <li><span>叁</span><div><b>随时恢复</b><p>选择“恢复官方外观”，回到 Codex 原生界面。</p></div></li>
          </ol>
        </section>
      </main>

      <footer>
        <div className="brand footer-brand"><img src={asset("brand/guofeng-mark.png")} alt="" /><span><b>Codex 国风主题</b><small>非官方开源主题项目</small></span></div>
        <p>基于 Codex Dream Skin 的可恢复换肤内核构建。Codex 与 OpenAI 商标归其各自权利人所有。</p>
        <a href="https://github.com/mhh16399-collab/codex-guofeng-themes" target="_blank" rel="noreferrer">查看源码与许可证</a>
      </footer>

      {selected && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section className="theme-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <button ref={closeButtonRef} className="dialog-close" type="button" onClick={() => setSelected(null)}>关闭</button>
            <img src={asset(selected.image)} alt={`${selected.name}完整预览`} />
            <div className="dialog-copy">
              <p className="eyebrow">{selected.toneLabel}主题 · {selected.romanized}</p>
              <h2 id="dialog-title">{selected.name}</h2>
              <p className="dialog-tagline">{selected.tagline}</p>
              <p>{selected.story}</p>
              <div className="dialog-actions">
                <a className="button button-primary" href="https://github.com/mhh16399-collab/codex-guofeng-themes/releases/latest" target="_blank" rel="noreferrer">下载整套安装包</a>
                <button className="button button-quiet" type="button" onClick={() => setSelected(null)}>继续逛主题馆</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
