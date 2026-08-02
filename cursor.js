/* 自定义圆圈光标（参考 Kimi 官网）：红点 + 红色圆环跟随，
   悬停可点击元素时圆环放大，按下时收缩。仅桌面端（pointer: fine）启用 */
(function () {
    if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;

    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add('custom-cursor');

    var mouseX = -100, mouseY = -100;
    var ringX = -100, ringY = -100;
    var shown = false;

    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = 'translate(' + (mouseX - 3) + 'px,' + (mouseY - 3) + 'px)';
        if (!shown) {
            shown = true;
            ringX = mouseX;
            ringY = mouseY;
            document.body.classList.add('cursor-live');
        }
    }, { passive: true });

    (function loop() {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        var half = ring.offsetWidth / 2;
        ring.style.transform = 'translate(' + (ringX - half) + 'px,' + (ringY - half) + 'px)';
        requestAnimationFrame(loop);
    })();

    var interactive = 'a, button, [role="button"], input, textarea, select, label, summary';
    document.addEventListener('mouseover', function (e) {
        if (e.target.closest && e.target.closest(interactive)) {
            ring.classList.add('cursor-hover');
        }
    }, { passive: true });
    document.addEventListener('mouseout', function (e) {
        if (e.target.closest && e.target.closest(interactive)) {
            ring.classList.remove('cursor-hover');
        }
    }, { passive: true });
    document.addEventListener('mousedown', function () { ring.classList.add('cursor-down'); });
    document.addEventListener('mouseup', function () { ring.classList.remove('cursor-down'); });
    document.addEventListener('mouseleave', function () {
        document.body.classList.remove('cursor-live');
    });
    document.addEventListener('mouseenter', function () {
        if (shown) document.body.classList.add('cursor-live');
    });
})();
