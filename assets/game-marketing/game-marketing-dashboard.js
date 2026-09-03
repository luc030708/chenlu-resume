const template = document.createElement('template');
const stylesheetUrl = new URL('./game-marketing-dashboard.css', import.meta.url).href;

template.innerHTML = `
  <section class="dashboard" aria-live="polite">
    <header class="header">
      <div><h2 class="headline">每日游戏营销事件看板</h2><p class="updated">正在读取数据…</p></div>
      <time class="date"></time>
    </header>
    <div class="events"></div>
    <div class="insights"></div>
    <footer>自动读取 JSON · 点击营销事件展开热搜详情</footer>
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
      this.dispatchEvent(new CustomEvent('dashboard-loaded', { bubbles: true }));
    } catch (error) {
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
      const source = safeUrl(item.source);
      return `<details class="card">
        <summary>
          <span class="heat heat-${escapeHtml(item.heat)}">${escapeHtml(item.heat || '待定')}</span>
          <strong>${escapeHtml(item.game)}</strong>
          <span class="event-copy">${escapeHtml(item.event)}</span>
          <span class="hot ${hits.length ? 'has-hot' : ''}">${hits.length ? `${hits.length}条热搜` : '无热搜'}</span>
        </summary>
        <div class="detail">
          <div class="detail-title"><b>热搜监测详情</b>${source ? `<a href="${source}" target="_blank" rel="noopener noreferrer">事件来源 ↗</a>` : ''}</div>
          ${hits.length ? hits.map((hit) => this.hotSearch(hit, item.game)).join('') : `<p class="empty">截至 ${escapeHtml(item.hotSearchCheckedAt || data.updatedAt)}，暂无可验证的微博、抖音或小红书热榜命中。</p>`}
        </div>
      </details>`;
    }).join('');

    root.querySelector('.insights').innerHTML = `${data.trend ? `<p><b>趋势</b><span>${escapeHtml(data.trend)}</span></p>` : ''}${data.action ? `<p class="action"><b>建议</b><span>${escapeHtml(data.action)}</span></p>` : ''}`;
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
