/* 详情页左侧目录：自动从分块标题（.detail-content > h3 / .exp-item .card-title）生成
   少于 2 个分块的页面自动跳过；点击丝滑滚动，滚动时红色高亮当前主题 */
(function () {
    var items = [];
    var seen = {};
    function add(el, text) {
        text = (text || '').trim();
        if (!el || !text || seen[text]) return;
        seen[text] = true;
        items.push({ el: el, text: text });
    }
    // 详情页：分块标题
    Array.prototype.forEach.call(
        document.querySelectorAll('.detail-content > h3, .exp-item .card-title'),
        function (h) { add(h, h.textContent); }
    );
    // 首页：板块锚点（关于我 / 教育 / 作品集 / 联系）
    if (items.length < 2) {
        Array.prototype.forEach.call(
            document.querySelectorAll('section.section[id]'),
            function (s) {
                var lab = s.querySelector('.section-label');
                var h2 = s.querySelector('.section-title');
                add(s, lab ? lab.textContent : (h2 ? h2.textContent : ''));
            }
        );
    }
    if (items.length < 2) return;

    var toc = document.createElement('nav');
    toc.className = 'page-toc';
    toc.setAttribute('aria-label', '页面目录');
    var title = document.createElement('div');
    title.className = 'page-toc-title';
    title.textContent = '目录 INDEX';
    toc.appendChild(title);

    var links = items.map(function (item, i) {
        var h = item.el;
        if (!h.id) h.id = 'toc-sec-' + i;
        h.style.scrollMarginTop = '96px';
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = item.text;
        a.title = item.text;
        a.addEventListener('click', function (e) {
            e.preventDefault();
            h.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (history.replaceState) history.replaceState(null, '', '#' + h.id);
        });
        toc.appendChild(a);
        return { a: a, h: h };
    });

    document.body.appendChild(toc);
    setTimeout(function () { toc.classList.add('toc-ready'); }, 80);

    var ticking = false;
    function update() {
        var y = window.scrollY + window.innerHeight * 0.35;
        var current = links[0];
        links.forEach(function (l) {
            var top = l.h.getBoundingClientRect().top + window.scrollY;
            if (top <= y) current = l;
        });
        links.forEach(function (l) {
            l.a.classList.toggle('active', l === current);
        });
        ticking = false;
    }
    window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
})();
