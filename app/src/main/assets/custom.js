// 🚫 МЕГА БЛОКИРОВЩИК РЕКЛАМЫ - ВСЕ В ОДНОМ
(function () {
    'use strict';

    console.log('🚫 Запуск МЕГА блокировщика рекламы...');

    // 📋 СПИСКИ ДЛЯ БЛОКИРОВКИ
    let adSelectors = [
        '.ad', '.ads', '.advertisement', '.banner', '.popup', '.adsbygoogle',
        '.ad-container', '.ad-banner', '.ad-block', '.sponsored', '.promo',
        '.commercial', '.adsense', 'ins[class*="adsbygoogle"]', '.google-ad',
        '.gpt-ad', 'div[id*="google_ads"]', '.yandex-ad', '.begun-ad',
        '.criteo-ad', '.outbrain', '.taboola', '.mgid', '.video-ad',
        '.mobile-ad', '.interstitial', '.app-ad', '#ad', '#ads', '#banner'
    ];

    let adDomains = [
        'googlesyndication.com', 'googleadservices.com', 'doubleclick.net',
        'googletagmanager.com', 'google-analytics.com', 'x47b2v9.com',
        's.x47b2v9.com', 'popads.net', 'popcash.net', 'propellerads.com',
        'an.yandex.ru', 'adfox.ru', 'begun.ru', 'adriver.ru', 'criteo.com',
        'outbrain.com', 'taboola.com', 'media.net', 'adnxs.com'
    ];

    // 🎯 ПРОВЕРКА НА РЕКЛАМУ
    function isAdDomain(url) {
        if (!url) return false;

        // Проверяем известные домены
        if (adDomains.some(domain => url.includes(domain))) {
            return true;
        }

        // Агрессивные паттерны
        const patterns = [
            /[a-z0-9]{6,}\.com\/d\.php/i,
            /[a-z0-9]{6,}\.com\/[a-z]\.php/i,
            /\/ads?\//i, /\/banner/i, /\/popup/i,
            /clickfunnels|popunder|interstitial/i
        ];

        return patterns.some(pattern => pattern.test(url));
    }

    // 🔥 ПЕРЕХВАТ СЕТЕВЫХ ЗАПРОСОВ
    function interceptRequests() {
        // Fetch
        const origFetch = window.fetch;
        window.fetch = function (url) {
            const urlStr = typeof url === 'string' ? url : url.toString();
            if (isAdDomain(urlStr)) {
                console.log('🚫 FETCH заблокирован:', urlStr);
                return Promise.reject('blocked');
            }
            return origFetch.apply(this, arguments);
        };

        // XMLHttpRequest
        const origOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            if (isAdDomain(url)) {
                console.log('🚫 XHR заблокирован:', url);
                return;
            }
            return origOpen.apply(this, arguments);
        };
    }

    // 🧹 УДАЛЕНИЕ РЕКЛАМНЫХ ЭЛЕМЕНТОВ
    function removeAds() {
        let removed = 0;

        // По селекторам
        adSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.remove();
                removed++;
            });
        });

        // Специально для вашего HTML - элементы с заголовком "AD"
        document.querySelectorAll('div.item.thumb').forEach(item => {
            const adHeader = item.querySelector('header');
            if (adHeader && adHeader.textContent.trim() === 'AD') {
                console.log('🚫 Удален блок с заголовком AD');
                item.remove();
                removed++;
                return;
            }

            const adLink = item.querySelector('a[href*="x47b2v9.com"], a[title="Advertisement"]');
            if (adLink) {
                console.log('🚫 Удален рекламный блок');
                item.remove();
                removed++;
            }
        });

        // Удаляем любые ссылки на рекламные домены
        document.querySelectorAll('*[src], *[href]').forEach(el => {
            const url = el.src || el.href;
            if (url && isAdDomain(url)) {
                const parent = el.closest('.item') || el.closest('div') || el;
                parent.remove();
                removed++;
            }
        });

        if (removed > 0) {
            console.log(`🚫 Удалено ${removed} рекламных элементов`);
        }
    }

    // Кнопка удалена - не нужна

    // Режим ручного удаления убран - не нужен

    // Уведомления убраны - не нужны

    // 🔗 ВАШ СУЩЕСТВУЮЩИЙ КОД С УЛУЧШЕНИЯМИ
    const hookClick = (e) => {
        const origin = e.target.closest('a');
        const isBaseTargetBlank = document.querySelector('head base[target="_blank"]');

        // АГРЕССИВНАЯ БЛОКИРОВКА РЕКЛАМНЫХ КЛИКОВ
        if (origin && origin.href) {
            if (isAdDomain(origin.href) || origin.title === 'Advertisement') {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚫 КЛИК ЗАБЛОКИРОВАН:', origin.href);
                showNotification('🚫 Рекламный клик заблокирован!', '#ff4444');
                return false;
            }
        }

        console.log('origin', origin, isBaseTargetBlank);
        if ((origin && origin.href && origin.target === '_blank') ||
            (origin && origin.href && isBaseTargetBlank)) {
            e.preventDefault();
            console.log('handle origin', origin);
            location.href = origin.href;
        } else {
            console.log('not handle origin', origin);
        }
    };

    // БЛОКИРОВКА WINDOW.OPEN
    window.open = function (url, target, features) {
        console.log('open', url, target, features);

        if (isAdDomain(url)) {
            console.log('🚫 WINDOW.OPEN ЗАБЛОКИРОВАН:', url);
            return null;
        }

        location.href = url;
    };

    // 🚀 ИНИЦИАЛИЗАЦИЯ ВСЕГО
    function initMegaAdBlock() {
        console.log('🚀 Инициализация МЕГА блокировщика...');

        // Перехватываем сетевые запросы
        interceptRequests();

        // Удаляем существующую рекламу
        removeAds();

        // Устанавливаем обработчик кликов
        document.addEventListener('click', hookClick, { capture: true });

        // Наблюдатель за новыми элементами
        new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    setTimeout(removeAds, 100);
                }
            });
        }).observe(document.body, { childList: true, subtree: true });

        // Периодическая очистка
        setInterval(removeAds, 2000);

        // Глобальные функции
        window.blockDomain = function (domain) {
            adDomains.push(domain);
            console.log('🚫 Домен добавлен в блокировку:', domain);
        };

        console.log('✅ МЕГА блокировщик активирован!');
    }

    // ЗАПУСК
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMegaAdBlock);
    } else {
        initMegaAdBlock();
    }

})();