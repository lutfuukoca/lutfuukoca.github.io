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
        /* Ana sayfadaki küçük Java programı demoları */
        var integerPattern = /^[+-]?\d+$/;
        function errorFor(form, field, message) {
            var target = form.querySelector('[data-error="' + field + '"]');
            if (target) target.textContent = message || '';
        }
        function resultFor(form, message, variant) {
            var result = form.querySelector('[data-result]');
            if (!result) return;
            result.textContent = message || '';
            result.hidden = !message;
            result.classList.toggle('is-negative', variant === 'negative');
        }
        function readInteger(value) {
            var clean = value.trim();
            if (!integerPattern.test(clean)) return null;
            var number = Number(clean);
            return Number.isInteger(number) && number >= -2147483648 && number <= 2147483647 ? number : null;
        }
        function readPositiveNumber(value) {
            var clean = value.trim().replace(',', '.');
            if (!clean) return null;
            var number = Number(clean);
            return Number.isFinite(number) && number > 0 ? number : null;
        }
        function formatNumber(value, digits) {
            return value.toLocaleString('tr-TR', { maximumFractionDigits: digits });
        }
        document.querySelectorAll('.demo-form').forEach(function (form) {
            form.addEventListener('reset', function () {
                window.setTimeout(function () {
                    form.querySelectorAll('[data-error]').forEach(function (field) { field.textContent = ''; });
                    resultFor(form, '');
                    var detail = form.querySelector('[data-interest-detail]');
                    if (detail) detail.textContent = '';
                    var steps = form.querySelector('[data-leap-steps]');
                    if (steps) steps.hidden = true;
                }, 0);
            });
        });

        var largestForm = document.querySelector('[data-demo="largest"]');
        if (largestForm) largestForm.addEventListener('submit', function (event) {
            event.preventDefault();
            resultFor(largestForm, '');
            var values = ['first', 'second', 'third'].map(function (name) {
                var input = largestForm.elements[name];
                var number = readInteger(input.value);
                errorFor(largestForm, name, number === null ? 'Geçerli bir tam sayı girin.' : '');
                return number;
            });
            if (values.some(function (number) { return number === null; })) return;
            resultFor(largestForm, 'En büyük: ' + Math.max.apply(Math, values));
        });

        var interestForm = document.querySelector('[data-demo="interest"]');
        var rateForm = document.querySelector('[data-rate-form]');
        var annualRate = 7;
        if (rateForm) {
            var rateDisplay = document.querySelector('[data-rate-display]');
            rateForm.addEventListener('submit', function (event) {
                event.preventDefault();
                var rateInput = rateForm.elements.rate;
                var rate = readPositiveNumber(rateInput.value);
                var rateError = rateForm.querySelector('[data-rate-error]');
                var rateStatus = rateForm.querySelector('[data-rate-status]');
                if (rate === null) {
                    rateError.textContent = 'Pozitif bir faiz oranı girin.';
                    return;
                }
                annualRate = rate;
                rateError.textContent = '';
                rateDisplay.textContent = '%' + formatNumber(annualRate, 6);
                rateStatus.textContent = 'Faiz oranı kaydedildi.';
                if (interestForm) {
                    resultFor(interestForm, '');
                    var detail = interestForm.querySelector('[data-interest-detail]');
                    if (detail) detail.textContent = '';
                }
            });
        }
        if (interestForm) interestForm.addEventListener('submit', function (event) {
            event.preventDefault();
            resultFor(interestForm, '');
            var detail = interestForm.querySelector('[data-interest-detail]');
            if (detail) detail.textContent = '';
            var start = readPositiveNumber(interestForm.elements.start.value);
            var target = readPositiveNumber(interestForm.elements.target.value);
            errorFor(interestForm, 'start', start === null ? 'Pozitif bir tutar girin.' : '');
            errorFor(interestForm, 'target', target === null ? 'Pozitif bir tutar girin.' : '');
            if (start === null || target === null) return;

            var amount = start;
            var factor = 1 + annualRate / 100;
            var years = 0;
            while (amount <= target && years < 10000) {
                amount *= factor;
                years++;
            }
            if (amount <= target) {
                errorFor(interestForm, 'target', 'Hedefe 10.000 yılda ulaşılamıyor.');
                return;
            }
            resultFor(interestForm, 'Yıl: ' + years);
            if (detail) detail.textContent = 'Son tutar: ' + formatNumber(amount, 2) + ' TL';
        });

        var leapForm = document.querySelector('[data-demo="leap"]');
        if (leapForm) leapForm.addEventListener('submit', function (event) {
            event.preventDefault();
            resultFor(leapForm, '');
            var year = readInteger(leapForm.elements.year.value);
            errorFor(leapForm, 'year', year === null || year < 1 ? 'Geçerli bir yıl girin (1 veya daha büyük tam sayı).' : '');
            var steps = leapForm.querySelector('[data-leap-steps]');
            if (year === null || year < 1) {
                steps.hidden = true;
                return;
            }

            var divisibleBy4 = year % 4 === 0;
            var divisibleBy100 = divisibleBy4 ? year % 100 === 0 : null;
            var divisibleBy400 = divisibleBy100 ? year % 400 === 0 : null;
            var isLeap = divisibleBy4 && (divisibleBy100 === false || divisibleBy400 === true);
            function showStep(name, value) {
                var label = steps.querySelector('[data-step="' + name + '"]');
                label.textContent = value === null ? 'Gerekmedi' : value ? 'Evet' : 'Hayır';
                label.className = value === null ? 'skip' : value ? 'yes' : 'no';
            }
            showStep('four', divisibleBy4);
            showStep('hundred', divisibleBy100);
            showStep('four-hundred', divisibleBy400);
            steps.hidden = false;
            resultFor(leapForm, year + (isLeap ? ' artık yıldır.' : ' artık yıl değildir.'), isLeap ? '' : 'negative');
        });

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
