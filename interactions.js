/* 全站互动组件：点击光粒迸溅 + 卡片3D倾斜 + 按钮磁吸 + 详情页阅读进度条
   视觉语言与全站「光子流」一致（红金配色）。桌面端增强，移动端自动降级。 */
(function () {
    var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 1. 点击光粒迸溅 ---------- */
    if (!reduced) {
        var COLORS = ['#e63946', '#f4a261', '#ffd166', '#e63946', '#ffb3ba'];
        document.addEventListener('pointerdown', function (e) {
            var t = e.target;
            if (t && t.closest && t.closest('input, textarea, select, [contenteditable="true"]')) return;
            var n = 9 + Math.floor(Math.random() * 4);
            for (var i = 0; i < n; i++) {
                var p = document.createElement('div');
                p.className = 'spark-particle';
                var size = 3 + Math.random() * 4;
                p.style.cssText = 'position:fixed;left:' + e.clientX + 'px;top:' + e.clientY + 'px;' +
                    'width:' + size + 'px;height:' + size + 'px;border-radius:50%;' +
                    'background:' + COLORS[i % COLORS.length] + ';pointer-events:none;z-index:10001;' +
                    'box-shadow:0 0 6px 1px rgba(230,57,70,0.55);';
                document.body.appendChild(p);
                var angle = Math.random() * Math.PI * 2;
                var speed = 2.2 + Math.random() * 3.4;
                var vx = Math.cos(angle) * speed;
                var vy = Math.sin(angle) * speed - 1.2;
                var life = 0, maxLife = 34 + Math.random() * 18;
                (function (el, vx, vy) {
                    var x = 0, y = 0;
                    function step() {
                        life++;
                        vx *= 0.965; vy = vy * 0.965 + 0.09;
                        x += vx; y += vy;
                        var k = 1 - life / maxLife;
                        el.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + Math.max(k, 0.1) + ')';
                        el.style.opacity = k;
                        if (life < maxLife) requestAnimationFrame(step);
                        else el.remove();
                    }
                    requestAnimationFrame(step);
                })(p, vx, vy);
            }
        }, { passive: true });
    }

    if (fine && !reduced) {
        /* ---------- 2. 卡片 3D 倾斜 ---------- */
        var TILT_SEL = '.card, .portfolio-card, .triad, .metric-card, .nine-q-item';
        var MAX = 5; // 最大倾角（度）
        document.querySelectorAll(TILT_SEL).forEach(function (el) {
            el.classList.add('tiltable');
            el.addEventListener('mousemove', function (e) {
                var r = el.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width - 0.5;
                var py = (e.clientY - r.top) / r.height - 0.5;
                el.style.transform = 'perspective(900px) rotateX(' + (-py * MAX) + 'deg) rotateY(' + (px * MAX) + 'deg) translateY(-3px)';
            });
            el.addEventListener('mouseleave', function () {
                el.style.transform = '';
            });
        });

        /* ---------- 3. 按钮磁吸 ---------- */
        document.querySelectorAll('.btn').forEach(function (el) {
            el.classList.add('magnetic');
            el.addEventListener('mousemove', function (e) {
                var r = el.getBoundingClientRect();
                var dx = e.clientX - (r.left + r.width / 2);
                var dy = e.clientY - (r.top + r.height / 2);
                el.style.transform = 'translate(' + dx * 0.12 + 'px,' + dy * 0.18 + 'px)';
            });
            el.addEventListener('mouseleave', function () {
                el.style.transform = '';
            });
        });
    }

    /* ---------- 4. 详情页阅读进度条 ---------- */
    if (document.querySelector('.detail-hero')) {
        var bar = document.createElement('div');
        bar.className = 'read-progress';
        document.body.appendChild(bar);
        var ticking = false;
        function update() {
            ticking = false;
            var h = document.documentElement;
            var max = h.scrollHeight - h.clientHeight;
            var pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
            bar.style.width = pct + '%';
        }
        document.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
    }
})();
