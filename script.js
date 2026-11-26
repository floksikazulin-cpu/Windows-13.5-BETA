// ========== КОНФИГУРАЦИЯ ПРИЛОЖЕНИЙ ==========
const APPS = {
    explorer: {
        name: 'Проводник',
        icon: 'fas fa-folder',
        color: '#f7b731',
        content: '<div class="app-placeholder"><i class="fas fa-folder-open"></i><p>Проводник</p><p style="font-size:12px;color:#666;">Файловая система</p></div>'
    },
    edge: {
        name: 'Microsoft Edge',
        icon: 'fab fa-edge',
        color: '#0078d4',
        content: '<div class="app-placeholder"><i class="fab fa-edge"></i><p>Microsoft Edge</p><p style="font-size:12px;color:#666;">Браузер</p></div>'
    },
    settings: {
        name: 'Настройки',
        icon: 'fas fa-cog',
        color: '#00a4ef',
        content: '<div class="app-placeholder"><i class="fas fa-cog"></i><p>Настройки</p><p style="font-size:12px;color:#666;">Параметры системы</p></div>'
    },
    store: {
        name: 'Магазин',
        icon: 'fas fa-store',
        color: '#00b294',
        content: '<div class="app-placeholder"><i class="fas fa-store"></i><p>Microsoft Store</p><p style="font-size:12px;color:#666;">Магазин приложений</p></div>'
    },
    trash: {
        name: 'Корзина',
        icon: 'fas fa-trash-alt',
        color: '#888',
        content: '<div class="app-placeholder"><i class="fas fa-trash-alt"></i><p>Корзина</p><p style="font-size:12px;color:#666;">Пусто</p></div>'
    },
    computer: {
        name: 'Этот компьютер',
        icon: 'fas fa-desktop',
        color: '#3498db',
        content: '<div class="app-placeholder"><i class="fas fa-desktop"></i><p>Этот компьютер</p><p style="font-size:12px;color:#666;">Локальный диск (C:)</p></div>'
    },
    documents: {
        name: 'Документы',
        icon: 'fas fa-folder-open',
        color: '#f1c40f',
        content: '<div class="app-placeholder"><i class="fas fa-folder-open"></i><p>Документы</p><p style="font-size:12px;color:#666;">Папка с документами</p></div>'
    }
};

// Список всех приложений (включая те, что не в быстром доступе)
const ALL_APPS = Object.keys(APPS);

// Закрепленные приложения (6 штук)
const PINNED_APPS = ['explorer', 'edge', 'settings', 'store', 'trash', 'computer'];

// ========== ГЛОБАЛЬНОЕ СОСТОЯНИЕ ==========
let windowCounter = 0;
let activeWindowId = null;
const openWindows = new Map(); // id -> { element, appId, isMinimized, isMaximized, originalRect }

// ========== DOM ЭЛЕМЕНТЫ ==========
const desktop = document.getElementById('desktop');
const startMenu = document.getElementById('start-menu');
const startBtn = document.getElementById('start-btn');
const taskbarApps = document.getElementById('taskbar-apps');
const clockTime = document.getElementById('time');
const clockDate = document.getElementById('date');
const contextMenu = document.getElementById('context-menu');
const windowsContainer = document.getElementById('windows-container');
const pinnedGrid = document.getElementById('pinned-grid');
const allAppsList = document.getElementById('all-apps-list');
const startSearch = document.getElementById('start-search');
const powerBtn = document.getElementById('power-btn');
const windowTemplate = document.getElementById('window-template');

// ========== ИНИЦИАЛИЗАЦИЯ ==========

// Обновление часов
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockTime.textContent = `${hours}:${minutes}`;
    
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    clockDate.textContent = `${day}.${month}.${year}`;
}

// Заполнение закрепленных приложений в меню Пуск
function renderPinnedApps() {
    pinnedGrid.innerHTML = '';
    PINNED_APPS.forEach(appId => {
        const app = APPS[appId];
        if (!app) return;
        
        const item = document.createElement('div');
        item.className = 'pinned-app-item';
        item.innerHTML = `<i class="${app.icon}"></i><span>${app.name}</span>`;
        item.addEventListener('click', () => {
            openApp(appId);
            startMenu.classList.add('hidden');
        });
        pinnedGrid.appendChild(item);
    });
}

// Заполнение списка всех приложений
function renderAllApps(filter = '') {
    allAppsList.innerHTML = '';
    const filtered = ALL_APPS.filter(appId => {
        const app = APPS[appId];
        return app && app.name.toLowerCase().includes(filter.toLowerCase());
    });
    
    filtered.forEach(appId => {
        const app = APPS[appId];
        const item = document.createElement('div');
        item.className = 'all-app-item';
        item.innerHTML = `<i class="${app.icon}"></i><span>${app.name}</span>`;
        item.addEventListener('click', () => {
            openApp(appId);
            startMenu.classList.add('hidden');
        });
        allAppsList.appendChild(item);
    });
}

// ========== УПРАВЛЕНИЕ ОКНАМИ ==========

// Открыть приложение
function openApp(appId) {
    const app = APPS[appId];
    if (!app) return;
    
    // Проверяем, есть ли уже открытое окно этого приложения
    for (const [id, win] of openWindows) {
        if (win.appId === appId && !win.isMinimized) {
            // Восстанавливаем и фокусируем существующее окно
            win.element.style.display = 'flex';
            win.isMinimized = false;
            focusWindow(id);
            return;
        }
    }
    
    // Создаем новое окно
    const winId = `win-${++windowCounter}`;
    const clone = windowTemplate.content.cloneNode(true);
    const windowEl = clone.querySelector('.window');
    windowEl.dataset.windowId = winId;
    windowEl.dataset.appId = appId;
    windowEl.querySelector('.window-title').textContent = app.name;
    windowEl.querySelector('.window-content').innerHTML = app.content;
    
    // Начальная позиция (каскадом)
    const offset = (windowCounter - 1) * 30;
    windowEl.style.top = `${80 + offset}px`;
    windowEl.style.left = `${80 + offset}px`;
    windowEl.style.width = '600px';
    windowEl.style.height = '400px';
    
    // Сохраняем состояние
    openWindows.set(winId, {
        element: windowEl,
        appId: appId,
        isMinimized: false,
        isMaximized: false,
        originalRect: { top: 80 + offset, left: 80 + offset, width: 600, height: 400 }
    });
    
    // Добавляем обработчики
    setupWindowEvents(windowEl, winId);
    
    // Добавляем в контейнер
    windowsContainer.appendChild(windowEl);
    
    // Фокусируем
    focusWindow(winId);
    
    // Закрываем меню Пуск
    startMenu.classList.add('hidden');
}

// Настройка событий окна
function setupWindowEvents(windowEl, winId) {
    const header = windowEl.querySelector('.window-header');
    const minimizeBtn = windowEl.querySelector('.minimize');
    const maximizeBtn = windowEl.querySelector('.maximize');
    const closeBtn = windowEl.querySelector('.close');
    const content = windowEl.querySelector('.window-content');
    
    // Фокус при клике
    windowEl.addEventListener('mousedown', () => focusWindow(winId));
    
    // Перетаскивание
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.window-controls')) return;
        
        const win = openWindows.get(winId);
        if (win.isMaximized) return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = windowEl.offsetLeft;
        startTop = windowEl.offsetTop;
        document.body.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        windowEl.style.left = `${startLeft + dx}px`;
        windowEl.style.top = `${startTop + dy}px`;
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = '';
        }
    });
    
    // Свернуть
    minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const win = openWindows.get(winId);
        if (!win) return;
        win.isMinimized = true;
        windowEl.style.display = 'none';
    });
    
    // Развернуть/восстановить
    maximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const win = openWindows.get(winId);
        if (!win) return;
        
        if (win.isMaximized) {
            // Восстанавливаем
            windowEl.style.top = `${win.originalRect.top}px`;
            windowEl.style.left = `${win.originalRect.left}px`;
            windowEl.style.width = `${win.originalRect.width}px`;
            windowEl.style.height = `${win.originalRect.height}px`;
            windowEl.style.borderRadius = '10px';
            win.isMaximized = false;
            maximizeBtn.innerHTML = '<i class="fas fa-square"></i>';
        } else {
            // Сохраняем текущие размеры
            win.originalRect = {
                top: windowEl.offsetTop,
                left: windowEl.offsetLeft,
                width: windowEl.offsetWidth,
                height: windowEl.offsetHeight
            };
            // Разворачиваем на весь экран (кроме панели задач)
            windowEl.style.top = '0px';
            windowEl.style.left = '0px';
            windowEl.style.width = '100vw';
            windowEl.style.height = 'calc(100vh - 56px)';
            windowEl.style.borderRadius = '0';
            win.isMaximized = true;
            maximizeBtn.innerHTML = '<i class="fas fa-clone"></i>';
        }
    });
    
    // Закрыть
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeWindow(winId);
    });
}

// Фокусировка окна (поднятие наверх)
function focusWindow(winId) {
    // Убираем active у всех
    document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
    
    const win = openWindows.get(winId);
    if (!win) return;
    
    win.element.classList.add('active');
    win.element.style.zIndex = ++windowCounter + 100;
    activeWindowId = winId;
}

// Закрыть окно
function closeWindow(winId) {
    const win = openWindows.get(winId);
    if (!win) return;
    
    win.element.remove();
    openWindows.delete(winId);
    
    if (activeWindowId === winId) {
        activeWindowId = null;
        // Фокусируем последнее окно
        const remaining = Array.from(openWindows.keys());
        if (remaining.length > 0) {
            focusWindow(remaining[remaining.length - 1]);
        }
    }
}

// ========== МЕНЮ ПУСК ==========

// Открыть/закрыть меню Пуск
function toggleStartMenu() {
    startMenu.classList.toggle('hidden');
    if (!startMenu.classList.contains('hidden')) {
        startSearch.value = '';
        renderAllApps('');
        startSearch.focus();
    }
}

// ========== КОНТЕКСТНОЕ МЕНЮ ==========

// Показать контекстное меню
function showContextMenu(e) {
    e.preventDefault();
    
    // Позиционируем
    let x = e.clientX;
    let y = e.clientY;
    
    const menuWidth = 220;
    const menuHeight = 200;
    
    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;
    
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.classList.remove('hidden');
}

// Скрыть контекстное меню
function hideContextMenu() {
    contextMenu.classList.add('hidden');
}

// ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========

// Кнопка Пуск
startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleStartMenu();
});

// Поиск в меню Пуск
startSearch.addEventListener('input', (e) => {
    renderAllApps(e.target.value);
});

// Клик вне меню Пуск — закрыть
document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && e.target !== startBtn && !startBtn.contains(e.target)) {
        startMenu.classList.add('hidden');
    }
    hideContextMenu();
});

// Контекстное меню на рабочем столе
desktop.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.window') || e.target.closest('.desktop-icon')) return;
    showContextMenu(e);
});

// Обработка контекстного меню
contextMenu.addEventListener('click', (e) => {
    const item = e.target.closest('.context-item');
    if (!item) return;
    
    const action = item.dataset.action;
    hideContextMenu();
    
    switch (action) {
        case 'refresh':
            // Легкая имитация обновления
            desktop.style.opacity = '0.8';
            setTimeout(() => { desktop.style.opacity = '1'; }, 200);
            break;
        case 'new-folder':
            alert('Создание папки (демо)');
            break;
        case 'display-settings':
            openApp('settings');
            break;
        case 'personalize':
            openApp('settings');
            break;
    }
});

// Клик по рабочей иконке
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('dblclick', () => {
        const appId = icon.dataset.app;
        if (appId) openApp(appId);
    });
    
    // Одинарный клик — выделение
    icon.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.desktop-icon').forEach(i => i.style.background = '');
        icon.style.background = 'rgba(255,255,255,0.2)';
    });
});

// Клик по панели задач (приложения)
taskbarApps.querySelectorAll('.taskbar-app').forEach(btn => {
    btn.addEventListener('click', () => {
        const appId = btn.dataset.app;
        if (appId) openApp(appId);
    });
});

// Кнопка питания (демо)
powerBtn.addEventListener('click', () => {
    if (confirm('Завершить работу? (Демо)')) {
        // Просто скрываем всё
        document.querySelectorAll('.window').forEach(w => {
            const winId = w.dataset.windowId;
            if (winId) closeWindow(winId);
        });
        startMenu.classList.add('hidden');
    }
});

// Клик по рабочему столу — снять выделение
desktop.addEventListener('click', (e) => {
    if (e.target === desktop || e.target.classList.contains('desktop-icons')) {
        document.querySelectorAll('.desktop-icon').forEach(i => i.style.background = '');
    }
});

// Обновление времени каждую секунду
setInterval(updateClock, 1000);
updateClock();

// ========== ЗАПУСК ==========
renderPinnedApps();
renderAllApps();

// Открываем приветственное окно при первом запуске (демо)
setTimeout(() => {
    // Можно раскомментировать для приветствия
    // openApp('explorer');
}, 500);
