const template = document.createElement('template');
const stylesheetUrl = new URL('./game-marketing-dashboard.css', import.meta.url).href;

template.innerHTML = `
  <section class="dashboard" aria-live="polite">
    <header class="header">
      <div><h2 class="headline">每日游戏营销事件看板</h2><p class="updated">正在读取数据…</p></div>
      <div class="sync-meta"><span class="sync-state"><i></i> 数据源连接中</span><time class="date"></time></div>
    </header>
    <div class="events"></div>
    <div class="insights"></div>
    <footer>自动读取 JSON · 点击营销事件展开官方帖子、线下动作与热搜证据</footer>
  </section>
`;

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char]));

const safeUrl = (value = '') => {
  if (!value) return ''; // bugfix: 空值会被 new URL 解析成本页地址，导致渲染破图
  try {
    const url = new URL(value, window.location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
};

class GameMarketingDashboard extends HTMLElement {
  static observedAttributes = ['data-url', 'refresh-ms'];

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = stylesheetUrl;
    root.append(stylesheet, template.content.cloneNode(true));
  }

  connectedCallback() { this.load(); }
  disconnectedCallback() { clearTimeout(this.timer); }
  attributeChangedCallback() { if (this.isConnected) this.load(); }

  async load() {
    clearTimeout(this.timer);
    const dataUrl = this.getAttribute('data-url') || './game-marketing-dashboard.json';
    try {
      const separator = dataUrl.includes('?') ? '&' : '?';
      const response = await fetch(`${dataUrl}${separator}_dashboard_ts=${Date.now()}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.render(await response.json());
      this.shadowRoot.querySelector('.sync-state').innerHTML = '<i></i> 在线读取 · 60 秒轮询';
      this.dispatchEvent(new CustomEvent('dashboard-loaded', { bubbles: true }));
    } catch (error) {
      this.shadowRoot.querySelector('.sync-state').innerHTML = '<i></i> 暂时离线';
      this.shadowRoot.querySelector('.events').innerHTML = `<p class="error">看板暂时无法读取：${escapeHtml(error.message)}</p>`;
      this.dispatchEvent(new CustomEvent('dashboard-error', { detail: error, bubbles: true }));
    }
    const refreshMs = Math.max(60000, Number(this.getAttribute('refresh-ms')) || 300000);
    this.timer = setTimeout(() => this.load(), refreshMs);
  }

  render(data) {
    const root = this.shadowRoot;
    root.querySelector('.headline').textContent = data.headline || '每日游戏营销事件看板';
    root.querySelector('.updated').textContent = `最后更新：${data.updatedAt || '未知'}`;
    root.querySelector('.date').textContent = data.date || '';
    root.querySelector('.date').dateTime = data.date || '';

    root.querySelector('.events').innerHTML = (data.items || []).slice(0, 6).map((item) => {
      const hits = Array.isArray(item.hotSearches) ? item.hotSearches : [];
      const posts = Array.isArray(item.officialPosts) ? item.officialPosts : [];
      const offline = Array.isArray(item.offlineActions) ? item.offlineActions : [];
      const verifiedPosts = posts.filter((post) => post.status === '已核验' && safeUrl(post.url));
      const verifiedOffline = offline.filter((action) => action.status === '已核验');
      const source = safeUrl(item.source);
      return `<details class="card">
        <summary>
          <span class="heat heat-${escapeHtml(item.heat)}">${escapeHtml(item.heat || '待定')}</span>
          <strong>${escapeHtml(item.game)}</strong>
          <span class="event-copy">${escapeHtml(item.event)}</span>
          <span class="signals">
            <span class="signal ${verifiedPosts.length ? 'has-post' : ''}">${verifiedPosts.length ? `${verifiedPosts.length}条官帖` : '官帖待核'}</span>
            <span class="signal ${verifiedOffline.length ? 'has-offline' : ''}">${verifiedOffline.length ? `${verifiedOffline.length}项线下` : '无线下'}</span>
            <span class="signal ${hits.length ? 'has-hot' : ''}">${hits.length ? `${hits.length}条热搜` : '无热搜'}</span>
          </span>
        </summary>
        <div class="detail">
          <div class="detail-title"><b>官方帖子矩阵</b>${source ? `<a href="${source}" target="_blank" rel="noopener noreferrer">事件主来源 ↗</a>` : ''}</div>
          <div class="evidence-list">${posts.length ? posts.map((post) => this.officialPost(post)).join('') : '<p class="empty">暂无已记录的官方渠道帖子。</p>'}</div>
          <div class="detail-title"><b>线下动作</b></div>
          <div class="evidence-list">${offline.length ? offline.map((action) => this.offlineAction(action)).join('') : '<p class="empty">未发现经核验的线下动作。</p>'}</div>
          <div class="detail-title"><b>热搜监测详情</b></div>
          ${hits.length ? hits.map((hit) => this.hotSearch(hit, item.game)).join('') : `<p class="empty">截至 ${escapeHtml(item.hotSearchCheckedAt || data.updatedAt)}，暂无可验证的微博、抖音或小红书热榜命中。</p>`}
        </div>
      </details>`;
    }).join('');

    root.querySelector('.insights').innerHTML = `${data.trend ? `<p><b>趋势</b><span>${escapeHtml(data.trend)}</span></p>` : ''}${data.action ? `<p class="action"><b>建议</b><span>${escapeHtml(data.action)}</span></p>` : ''}`;
  }

  officialPost(post) {
    const url = post.status === '已核验' ? safeUrl(post.url) : '';
    const label = url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.title || '打开官方原帖')} ↗</a>` : `<span>${escapeHtml(post.title || '未记录标题')}</span>`;
    return `<article class="evidence-row">
      <div class="evidence-meta"><b>${escapeHtml(post.platform || '官方渠道')}</b><span class="status status-${escapeHtml(post.status || '未发现')}">${escapeHtml(post.status || '未发现')}</span></div>
      <p>${label}</p>
      <small>${escapeHtml(post.publishedAt || '发布时间未知')}${post.foundAt ? ` · 发现于 ${escapeHtml(post.foundAt)}` : ''}</small>
    </article>`;
  }

  offlineAction(action) {
    const source = safeUrl(action.source);
    const place = [action.city, action.venue].filter(Boolean).map(escapeHtml).join(' · ');
    const period = [action.startAt, action.endAt].filter(Boolean).map(escapeHtml).join(' — ');
    return `<article class="evidence-row offline-row">
      <div class="evidence-meta"><b>${escapeHtml(action.title || '线下动作')}</b><span class="status status-${escapeHtml(action.status || '未发现')}">${escapeHtml(action.status || '未发现')}</span></div>
      ${place ? `<p>${place}</p>` : ''}
      ${period ? `<small>${period}</small>` : ''}
      ${source ? `<a class="board-link" href="${source}" target="_blank" rel="noopener noreferrer">查看线下来源 ↗</a>` : ''}
    </article>`;
  }

  hotSearch(hit, fallbackGame) {
    const screenshot = safeUrl(hit.screenshot);
    const source = safeUrl(hit.source);
    return `<article class="hot-row">
      <div class="hot-meta"><b>${escapeHtml(hit.platform)} · ${escapeHtml(hit.board || '热榜')}</b><span>${hit.rank ? `第${escapeHtml(hit.rank)}名` : '榜内'} · ${escapeHtml(hit.foundAt || '')}</span></div>
      <p class="keyword">#${escapeHtml(hit.keyword || fallbackGame)}#</p>
      ${screenshot ? `<a class="screenshot" href="${screenshot}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${screenshot}" alt="${escapeHtml(hit.platform)}热榜截图"><span>查看榜单截图</span></a>` : ''}
      ${source ? `<a class="board-link" href="${source}" target="_blank" rel="noopener noreferrer">打开榜单来源 ↗</a>` : ''}
    </article>`;
  }
}

if (!customElements.get('game-marketing-dashboard')) {
  customElements.define('game-marketing-dashboard', GameMarketingDashboard);
}
