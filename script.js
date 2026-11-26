/* Tema: varsayılan AÇIK (beyaz). Sadece kullanıcı düğmeyle koyuyu seçerse koyu olur. */
(function () {
    var root = document.documentElement;
    var theme = null;
    try { theme = localStorage.getItem('theme'); } catch (e) {}
    function applyTheme(value) {
        var dark = value === 'dark';
        root.setAttribute('data-theme', dark ? 'dark' : 'light');
        document.querySelectorAll('.theme-toggle').forEach(function (button) {
            button.setAttribute('aria-pressed', dark ? 'true' : 'false');
            button.setAttribute('aria-label', dark ? 'Açık moda geç' : 'Koyu moda geç');
            var label = button.querySelector('.theme-label');
            var icon = button.querySelector('.theme-icon');
            if (label) label.textContent = dark ? 'Açık mod' : 'Koyu mod';
            if (icon) icon.textContent = dark ? '☀' : '☾';
        });
        var themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) themeColor.setAttribute('content', dark ? '#000000' : '#ffffff');
    }
    applyTheme(theme);

    /* Tıklamayı belgeye bağladık: düğme sayfada nerede olursa olsun çalışır */
    document.addEventListener('click', function (e) {
        if (!e.target.closest || !e.target.closest('.theme-toggle')) return;
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem('theme', next); } catch (err) {}
    });

    document.addEventListener('DOMContentLoaded', function () {
        applyTheme(root.getAttribute('data-theme'));
        /* Yazılar sayfası: arama ve etiket filtresi (etiketler kartlardan otomatik çıkar) */
        var list = document.querySelector('.post-list');
        if (!list) return;
        var cards = Array.prototype.slice.call(list.querySelectorAll('.post-card'));
        var search = document.getElementById('search');
        var filters = document.querySelector('.tag-filters');
        var empty = document.getElementById('empty');
        var active = 'Hepsi';
        var tags = ['Hepsi'];
        cards.forEach(function (c) {
            (c.getAttribute('data-tags') || '').split(',').forEach(function (t) {
                t = t.trim();
                if (t && tags.indexOf(t) === -1) tags.push(t);
            });
        });
        tags.forEach(function (t) {
            var b = document.createElement('button');
            b.type = 'button'; b.className = 'tag-filter'; b.textContent = t;
            b.setAttribute('aria-pressed', t === active ? 'true' : 'false');
            b.addEventListener('click', function () {
                active = t;
                Array.prototype.forEach.call(filters.children, function (x) {
                    x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
                });
                apply();
            });
            filters.appendChild(b);
        });
        function apply() {
            var q = search.value.toLowerCase().trim(), shown = 0;
            cards.forEach(function (c) {
                var ct = (c.getAttribute('data-tags') || '').split(',').map(function (x) { return x.trim(); });
                var ok = (active === 'Hepsi' || ct.indexOf(active) !== -1) && c.textContent.toLowerCase().indexOf(q) !== -1;
                c.hidden = !ok;
                if (ok) shown++;
            });
            empty.hidden = shown > 0;
        }
        search.addEventListener('input', apply);
    });
})();
