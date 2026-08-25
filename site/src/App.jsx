import { useEffect, useMemo, useRef, useState } from "react";
import { paginateThemes } from "./pagination.js";

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;
const applyUri = (theme) => `dreamskin://preset?theme=preset-${theme.id}`;
const packageUri = (theme) => asset(`downloads/preset-${theme.id}.zip`);
const PAGE_SIZE = 6;

const themes = [
  { id: "zhuqing", name: "竹青", romanized: "Zhu Qing", tone: "light", toneLabel: "浅色", tagline: "竹影入窗，纸白生青", story: "以宣纸白承接青竹的清透，把长时间工作的界面收束成安静、克制的书斋。", colors: ["#edf3eb", "#a9d8bd", "#16815f"], image: "themes/zhuqing.png" },
  { id: "zhusha", name: "朱砂", romanized: "Zhu Sha", tone: "light", toneLabel: "浅色", tagline: "宫墙留影，朱砂点睛", story: "取宫墙朱红、暖瓷白与窗棂影，不做节庆堆砌，保留东方建筑的秩序与留白。", colors: ["#fff6e9", "#d9aa83", "#a93826"], image: "themes/zhusha.png" },
  { id: "moyun", name: "墨韵", romanized: "Mo Yun", tone: "light", toneLabel: "浅色", tagline: "山水入墨，飞白成章", story: "用冷宣纸、远山与飞白墨痕构成低干扰工作空间，水墨层次清晰而不喧宾夺主。", colors: ["#f0f0eb", "#9ea6a2", "#303735"], image: "themes/moyun.png" },
  { id: "ruyao-tianqing", name: "汝窑天青", romanized: "Ruyao Tianqing", tone: "light", toneLabel: "浅色", tagline: "雨过天青，开片有光", story: "雨过天青釉与细密开片铺陈界面，瓷片和柔和器影让工作区清润但不单薄。", colors: ["#e9f1ec", "#abc9bf", "#668e83"], image: "themes/ruyao-tianqing.png" },
  { id: "dunhuang-liujin", name: "敦煌鎏金", romanized: "Dunhuang Liujin", tone: "dark", toneLabel: "深色", tagline: "矿彩凝光，壁上千年", story: "深靛壁色承托飞天、藻井与神兽纹样，以石青、朱砂和鎏金勾勒沉浸式夜间工作场。", colors: ["#111d28", "#2a6e70", "#c89549"], image: "themes/dunhuang-liujin.png" },
  { id: "qinghua-ci", name: "青花瓷", romanized: "Qinghua Ci", tone: "light", toneLabel: "浅色", tagline: "釉白藏蓝，一器一境", story: "青花瓷器、折枝纹与淡米釉白共同降低蓝色饱和度，既有器物感，也适合长期阅读。", colors: ["#f7f2e8", "#c8d9d8", "#386b86"], image: "themes/qinghua-ci.png" },
  { id: "haitang-songjin", name: "海棠宋锦", romanized: "Haitang Songjin", tone: "light", toneLabel: "浅色", tagline: "经纬生花，海棠成锦", story: "将海棠纹、宋锦经纬与克制的胭脂色织入卡片边界，温润细密，却不压过代码内容。", colors: ["#f6eee7", "#d7aaa4", "#9f4b4d"], image: "themes/haitang-songjin.png" },
  { id: "jiye-xinghe", name: "霁夜星河", romanized: "Jiye Xinghe", tone: "dark", toneLabel: "深色", tagline: "星汉低垂，霁色如洗", story: "以宋代观星意象、浑仪和霁蓝夜空构成深色主题，金线星轨带来清晰的操作层级。", colors: ["#10182b", "#1e3b5c", "#c9a461"], image: "themes/jiye-xinghe.png" },
  { id: "qianli-jiangshan", name: "千里江山", romanized: "Qianli Jiangshan", tone: "light", toneLabel: "浅色", tagline: "层峦入卷，碧水生辉", story: "矿物石青与石绿沿江山层叠铺展，鎏金轮廓收住气韵，为中央工作区留下一片温润开阔的宣纸。", colors: ["#f4efdf", "#4f9e91", "#c6a45a"], image: "themes/qianli-jiangshan.png" },
  { id: "jingtai-hualan", name: "景泰华蓝", romanized: "Jingtai Hualan", tone: "dark", toneLabel: "深色", tagline: "铜丝点翠，华蓝凝光", story: "深海军蓝承托景泰蓝器的松石釉色与鎏金铜丝，把暗色工作界面做成克制的夜间展厅。", colors: ["#061729", "#2f9aa1", "#d3aa53"], image: "themes/jingtai-hualan.png" },
  { id: "heiqi-luodian", name: "黑漆螺钿", romanized: "Heiqi Luodian", tone: "dark", toneLabel: "深色", tagline: "漆夜藏彩，螺光入屏", story: "黑漆的深沉与螺钿鸟梅屏的虹彩形成低调层次，贝母冷光只在操作边界轻轻浮现。", colors: ["#090a0b", "#72b9b0", "#8579a6"], image: "themes/heiqi-luodian.png" },
  { id: "chayan-songfeng", name: "茶烟松风", romanized: "Chayan Songfeng", tone: "light", toneLabel: "浅色", tagline: "松风入盏，茶烟徐生", story: "松针、紫砂与一缕茶烟落在暖宣纸上，色彩朴素却不空，适合安静而长久的阅读与编写。", colors: ["#f5ead7", "#526d4c", "#8b5438"], image: "themes/chayan-songfeng.png" },
  { id: "sunmao-danying", name: "榫卯丹楹", romanized: "Sunmao Danying", tone: "light", toneLabel: "浅色", tagline: "木构有序，丹楹承章", story: "以斗拱、榫卯结构和淡淡营造图谱组织界面，暖木与一笔丹红让工程秩序也有东方气韵。", colors: ["#f4eadb", "#8b4f2d", "#a73527"], image: "themes/sunmao-danying.png" },
  { id: "ruihe-lingxiao", name: "瑞鹤凌霄", romanized: "Ruihe Lingxiao", tone: "light", toneLabel: "浅色", tagline: "云开鹤起，凌霄见晴", story: "雾蓝云海、丹顶鹤与远处宫阙构成轻盈天空，金线云纹保持细节，中心仍然清透易读。", colors: ["#f5f1e8", "#688c98", "#a34d45"], image: "themes/ruihe-lingxiao.png" },
  { id: "tangsancai", name: "唐三彩", romanized: "Tang Sancai", tone: "light", toneLabel: "浅色", tagline: "三彩流釉，骏影生辉", story: "乳白陶胎上流动琥珀、橄榄与翠绿釉色，一匹三彩骏马镇住画面，古朴但不显沉闷。", colors: ["#f4e5c8", "#6f803e", "#d59a37"], image: "themes/tangsancai.png" },
  { id: "hanjian-mohen", name: "汉简墨痕", romanized: "Hanjian Mohen", tone: "dark", toneLabel: "深色", tagline: "简牍藏字，墨痕有声", story: "焦茶色纸纤维、竹简与青铜绿锈构成沉静暗色书案，适合喜欢考古质感与低亮度界面的用户。", colors: ["#17120e", "#8f633f", "#385c51"], image: "themes/hanjian-mohen.png" },
  { id: "luoshui-liuxia", name: "洛水流霞", romanized: "Luoshui Liuxia", tone: "dark", toneLabel: "深色", tagline: "月照洛水，流霞成绮", story: "靛青月夜映着水城、桥影与紫色流霞，玫瑰金的细光沿水面铺开，柔美而不甜腻。", colors: ["#17172b", "#9b78ad", "#d6a27e"], image: "themes/luoshui-liuxia.png" },
  { id: "jinling-yunjin", name: "金陵云锦", romanized: "Jinling Yunjin", tone: "light", toneLabel: "浅色", tagline: "寸锦寸金，孔雀成章", story: "孔雀蓝、宝石绿与真金线织出云锦团花和孔雀羽纹，冷象牙丝面保持通透，也与海棠宋锦清晰区分。", colors: ["#f1eee5", "#0c5672", "#c99f41"], image: "themes/jinling-yunjin.png" },
  { id: "jingxiang-chaxi", name: "静香茶席", romanized: "Jingxiang Chaxi", tone: "light", toneLabel: "浅色", tagline: "静火温盏，香篆入席", story: "暖褐茶室、暗木格与一席茶器围住浅宣纸阅读区，让顶栏与侧栏连成安静的茶席，同时保持正文清楚易读。", colors: ["#f1dfc2", "#9b7651", "#2a2119"], image: "themes/jingxiang-chaxi.png" },
  { id: "citong-haibo", name: "刺桐海舶", romanized: "Citong Haibo", tone: "light", toneLabel: "浅色", tagline: "刺桐潮起，海舶云集", story: "深蓝黑船腹框住左侧导航，雾海与湿船坞铺开中央留白，右侧巨型福船在旧铜与灰蓝色里静静泊岸。", colors: ["#d8d9d0", "#6d8581", "#172a31"], image: "themes/citong-haibo.png" },
  { id: "qingming-changjuan", name: "清明长卷", romanized: "Qingming Changjuan", tone: "light", toneLabel: "浅色", tagline: "汴水入卷，清明有声", story: "宣纸长卷从城门、市井一路铺向汴河与虹桥，左侧保留清晰画面，右侧卷轴与朱印收住古意，整窗连续而不虚化。", colors: ["#efe5cf", "#827564", "#a45135"], image: "themes/qingming-changjuan.png" },
  { id: "yanlan-liubai", name: "烟岚留白", romanized: "Yanlan Liubai", tone: "light", toneLabel: "浅色", tagline: "一舟入烟岚，千峰留素白", story: "冷灰水墨山峦、孤舟与一轮淡朱日构成大面积留白，左侧山石松影直接入画，清晰克制，适合长时间阅读。", colors: ["#e8ebe7", "#687779", "#b54b3d"], image: "themes/yanlan-liubai.png" },
  { id: "bingqing-yuanxiu", name: "冰青远岫", romanized: "Bingqing Yuanxiu", tone: "light", toneLabel: "浅色", tagline: "冰青入岫，云水无声", story: "冰青与浅玉色山体以现代几何层次向远处递进，冷灰顶栏和通透侧栏保持统一，画面轻盈而富有辨识度。", colors: ["#e8eeee", "#6e8f95", "#5b8f97"], image: "themes/bingqing-yuanxiu.png" },
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
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [launchHint, setLaunchHint] = useState(null);
  const closeButtonRef = useRef(null);
  const returnFocusRef = useRef(null);
  const galleryRef = useRef(null);

  const filteredThemes = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("zh-CN");
    return themes.filter((theme) => {
      const matchesTone = filter === "all" || theme.tone === filter;
      const haystack = `${theme.name} ${theme.romanized} ${theme.tagline}`.toLocaleLowerCase("zh-CN");
      return matchesTone && (!needle || haystack.includes(needle));
    });
  }, [filter, query]);
  const pagination = paginateThemes(filteredThemes, page, PAGE_SIZE);

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

  const changePage = (nextPage) => {
    setPage(nextPage);
    window.requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      galleryRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
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
            <h1 id="hero-title"><span>为你的 Codex</span><span>换一袭东方颜色</span></h1>
            <p className="hero-lead">持续扩展的原创国风主题库，把瓷、锦、壁画、山水与星河带进熟悉的工作界面。兼容原版 DreamSkin，随时恢复官方外观。</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#gallery">浏览当前馆藏</a>
              <a className="button button-quiet" href="https://github.com/mhh16399-collab/codex-guofeng-themes" target="_blank" rel="noreferrer">在 GitHub 上收藏此馆</a>
            </div>
          </div>

          <figure className="featured-frame">
            <img src={asset("themes/zhuqing.png")} alt="竹青主题在 Codex Windows 客户端中的预览" />
            <figcaption>竹青</figcaption>
          </figure>
        </section>

        <section ref={galleryRef} className="gallery-section" id="gallery" aria-labelledby="gallery-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THEME COLLECTION</p>
              <h2 id="gallery-title">百色成卷，各有风骨</h2>
              <p>每套都包含背景、配色和安全样式，不修改 Codex 安装包。</p>
            </div>
            <span className="collection-count">馆藏 {String(filteredThemes.length).padStart(2, "0")} / {String(themes.length).padStart(2, "0")}</span>
          </div>

          <div className="gallery-tools">
            <label className="search-field">
              <span>检索</span>
              <input type="search" placeholder="搜索主题 / 拼音 / 意境" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
            </label>
            <div className="tone-filters" aria-label="主题明暗筛选">
              {[["all", "全部主题"], ["light", "浅色"], ["dark", "深色"]].map(([value, label]) => (
                <button className={filter === value ? "active" : ""} key={value} type="button" aria-pressed={filter === value} onClick={() => { setFilter(value); setPage(1); }}>{label}</button>
              ))}
            </div>
          </div>

          {filteredThemes.length ? (
            <div className="theme-grid">
              {pagination.items.map((theme, index) => (
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
                      </div>
                      <div className="card-actions">
                        <a href={applyUri(theme)} onClick={() => setLaunchHint(theme.id)}>一键换肤</a>
                        <button type="button" onClick={(event) => openDetails(theme, event.currentTarget)}>查看详情</button>
                      </div>
                      {launchHint === theme.id && <p className="launch-hint">没有唤起客户端？请先下载安装桌面端。</p>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="empty-state"><b>没有找到相符主题</b><p>换个关键词，或切回“全部主题”再看看。</p></div>}

          {filteredThemes.length > PAGE_SIZE && (
            <nav className="pagination" aria-label="主题馆分页">
              <button type="button" disabled={pagination.page === 1} onClick={() => changePage(pagination.page - 1)}>上一页</button>
              <div className="page-numbers">
                {Array.from({ length: pagination.pageCount }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    className={pagination.page === pageNumber ? "active" : ""}
                    type="button"
                    key={pageNumber}
                    aria-label={`第 ${pageNumber} 页`}
                    aria-current={pagination.page === pageNumber ? "page" : undefined}
                    onClick={() => changePage(pageNumber)}
                  >{pageNumber}</button>
                ))}
              </div>
              <button type="button" disabled={pagination.page === pagination.pageCount} onClick={() => changePage(pagination.page + 1)}>下一页</button>
            </nav>
          )}
        </section>

        <section className="install-section" id="install" aria-labelledby="install-title">
          <div className="install-copy">
            <p className="eyebrow">WINDOWS INSTALLER</p>
            <h2 id="install-title">一套安装包，当前馆藏都带走</h2>
            <p>先安装原版 DreamSkin，再从系统托盘导入国风主题 ZIP。网页的一键换肤按钮会调用本机已捆绑主题，详情中也可下载 ZIP 导入。</p>
            <a className="button button-primary" href="https://github.com/Fei-Away/Codex-Dream-Skin/releases/latest" target="_blank" rel="noreferrer">下载原版 DreamSkin</a>
          </div>
          <ol className="install-steps">
            <li><span>壹</span><div><b>安装原版客户端</b><p>从原项目 GitHub Release 获取经过校验的 Setup.exe。</p></div></li>
            <li><span>贰</span><div><b>导入主题</b><p>下载国风主题 ZIP，在 DreamSkin 托盘菜单中导入并应用。</p></div></li>
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
                <a className="button button-primary" href={packageUri(selected)} download>下载主题包</a>
                <button className="button button-quiet" type="button" onClick={() => setSelected(null)}>继续逛主题馆</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
