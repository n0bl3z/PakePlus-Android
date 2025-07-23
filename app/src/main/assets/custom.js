// JavaScript версия uBlock Origin - основные функции
(function() {
    'use strict';
    
    console.log('🛡️ uBlock Origin JS запущен');
    
    // EasyList правила (упрощенная версия)
    const easyListRules = [
        // Домены
        'googlesyndication.com', 'googleadservices.com', 'doubleclick.net',
        'x47b2v9.com', 's.x47b2v9.com', 'popads.net', 'popcash.net',
        'propellerads.com', 'adnxs.com', 'adsystem.com', 'criteo.com',
        
        // Селекторы
        '.ad', '.ads', '.advertisement', '.banner', '.adsbygoogle',
        '.sponsored', '.promo', '#ad', '#ads',
        
        // Паттерны URL
        '/ads/', '/banner/', '/popup/', '/d.php'
    ];
    
    // Проверка правил как в uBlock Origin
    function matchesFilter(url, element) {
        if (!url) return false;
        
        // Проверяем домены
        for (const rule of easyListRules) {
            if (rule.includes('.com') || rule.includes('.net') || rule.includes('.org')) {
                if (url.includes(rule)) return true;
            }
        }
        
        // Проверяем паттерны URL
        for (const rule of easyListRules) {
            if (rule.startsWith('/') && rule.endsWith('/')) {
                if (url.includes(rule.slice(1, -1))) return true;
            }
        }
        
        // Проверяем селекторы элементов
        if (element) {
            for (const rule of easyListRules) {
                if (rule.startsWith('.') || rule.startsWith('#')) {
                    if (element.matches && element.matches(rule)) return true;
                    if (element.closest && element.closest(rule)) return true;
                }
            }
        }
        
        return false;
    }
    
    // Блокировка сетевых запросов (как в uBlock Origin)
    function blockNetworkRequests() {
        // Fetch API
        const originalFetch = window.fetch;
        window.fetch = function(resource, options) {
            const url = typeof resource === 'string' ? resource : resource.url;
            
            // Разрешаем запросы к тому же домену
            if (url.startsWith('/') || url.includes(window.location.hostname)) {
                return originalFetch.apply(this, arguments);
            }
            
            if (matchesFilter(url)) {
                console.log('🛡️ uBlock: FETCH заблокирован', url);
                return Promise.reject(new Error('uBlock: blocked'));
            }
            
            return originalFetch.apply(this, arguments);
        };
        
        // XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            // Разрешаем запросы к тому же домену
            if (url && (url.startsWith('/') || url.includes(window.location.hostname))) {
                return originalOpen.apply(this, arguments);
            }
            
            if (matchesFilter(url)) {
                console.log('🛡️ uBlock: XHR заблокирован', url);
                return;
            }
            
            return originalOpen.apply(this, arguments);
        };
    }
    
    // Блокировка элементов DOM (как в uBlock Origin)
    function blockDOMElements() {
        // Удаляем существующие элементы
        easyListRules.forEach(rule => {
            if (rule.startsWith('.') || rule.startsWith('#')) {
                document.querySelectorAll(rule).forEach(el => {
                    console.log('🛡️ uBlock: Элемент удален', rule);
                    el.remove();
                });
            }
        });
        
        // Специальная обработка для вашего случая
        document.querySelectorAll('div.item.thumb').forEach(item => {
            const header = item.querySelector('header');
            if (header && header.textContent.trim() === 'AD') {
                console.log('🛡️ uBlock: Реклама с заголовком AD удалена');
                item.remove();
                return;
            }
            
            const link = item.querySelector('a[href*="x47b2v9.com"], a[title="Advertisement"]');
            if (link) {
                console.log('🛡️ uBlock: Рекламный блок удален');
                item.remove();
            }
        });
        
        // Удаляем элементы с рекламными ссылками
        document.querySelectorAll('*[src], *[href]').forEach(el => {
            const url = el.src || el.href;
            if (matchesFilter(url, el)) {
                const parent = el.closest('.item') || el.closest('div') || el;
                console.log('🛡️ uBlock: Элемент с рекламной ссылкой удален');
                parent.remove();
            }
        });
    }
    
    // Блокировка всплывающих окон (как в uBlock Origin)
    function blockPopups() {
        const originalWindowOpen = window.open;
        window.open = function(url, target, features) {
            // Разрешаем окна с того же домена (нужные для сайта)
            if (!url || url.startsWith('/') || url.includes(window.location.hostname)) {
                console.log('🛡️ uBlock: Разрешено окно с того же домена');
                return originalWindowOpen.call(this, url, target, features);
            }
            
            if (matchesFilter(url)) {
                console.log('🛡️ uBlock: Всплывающее окно заблокировано', url);
                return null;
            }
            
            return originalWindowOpen.call(this, url, target, features);
        };
    }
    
    // Наблюдатель за изменениями DOM (как в uBlock Origin)
    function observeDOM() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        // Проверяем новый элемент
                        if (matchesFilter(node.src || node.href, node)) {
                            console.log('🛡️ uBlock: Новый рекламный элемент заблокирован');
                            node.remove();
                            return;
                        }
                        
                        // Проверяем вложенные элементы
                        if (node.querySelectorAll) {
                            easyListRules.forEach(rule => {
                                if (rule.startsWith('.') || rule.startsWith('#')) {
                                    node.querySelectorAll(rule).forEach(el => {
                                        console.log('🛡️ uBlock: Вложенный рекламный элемент удален');
                                        el.remove();
                                    });
                                }
                            });
                        }
                    }
                });
            });
            
            // Периодическая очистка после изменений
            setTimeout(blockDOMElements, 100);
        });
        
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
    
    // Ваш существующий код
    const hookClick = (e) => {
        const origin = e.target.closest('a');
        const isBaseTargetBlank = document.querySelector('head base[target="_blank"]');
        
        // Блокируем рекламные клики
        if (origin && origin.href && matchesFilter(origin.href, origin)) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🛡️ uBlock: Клик по рекламе заблокирован', origin.href);
            return false;
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
    
    // Инициализация uBlock Origin JS
    function initUBlockJS() {
        console.log('🛡️ Инициализация uBlock Origin JS...');
        
        // Запускаем все модули
        blockNetworkRequests();
        blockDOMElements();
        blockPopups();
        observeDOM();
        
        // Устанавливаем обработчик кликов
        document.addEventListener('click', hookClick, { capture: true });
        
        // Периодическая очистка (как в uBlock Origin)
        setInterval(blockDOMElements, 2000);
        
        // Дополнительная очистка для x47b2v9.com
        setInterval(() => {
            document.querySelectorAll('*[href*="x47b2v9.com"], *[src*="x47b2v9.com"]').forEach(el => {
                const parent = el.closest('.item') || el.closest('div') || el;
                parent.remove();
            });
        }, 1000);
        
        console.log('🛡️ uBlock Origin JS активирован!');
        console.log('🛡️ Загружено правил:', easyListRules.length);
    }
    
    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUBlockJS);
    } else {
        initUBlockJS();
    }
    
})();