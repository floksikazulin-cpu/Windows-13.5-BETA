// ========== УПРАВЛЕНИЕ ОКНАМИ ==========

let windowCounter = 0;
let activeWindowId = null;
const openWindows = new Map(); // id -> { element, appId, isMinimized, isMaximized, originalRect }

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
            win.element.classList.remove('minimized');
            focusWindow(id);
            return;
        }
    }
    
    // Создаем новое окно
    const winId = `win-${++windowCounter}`;
    const windowTemplate = document.getElementById('window-template');
    const clone = windowTemplate.content.cloneNode(true);
    const windowEl = clone.querySelector('.window');
    
    windowEl.dataset.windowId = winId;
    windowEl.dataset.appId = appId;
    windowEl.querySelector('.window-title').textContent = app.name;
    windowEl.querySelector('.window-content').innerHTML = app.content;
    
    // Начальная позиция (каскадом)
    const offset = (windowCounter - 1) * 30;
    const startX = Math.min(80 + offset, window.innerWidth - 650);
    const startY = Math.min(80 + offset, window.innerHeight - 450);
    
    windowEl.style.top = `${startY}px`;
    windowEl.style.left = `${startX}px`;
    windowEl.style.width = '600px';
    windowEl.style.height = '400px';
    
    // Сохраняем состояние
    openWindows.set(winId, {
        element: windowEl,
        appId: appId,
        isMinimized: false,
        isMaximized: false,
        originalRect: { 
            top: startY, 
            left: startX, 
            width: 600, 
            height: 400 
        }
    });
    
    // Добавляем обработчики
    setupWindowEvents(windowEl, winId);
    
    // Добавляем в контейнер
    const windowsContainer = document.getElementById('windows-container');
    windowsContainer.appendChild(windowEl);
    
    // Фокусируем
    focusWindow(winId);
    
    // Закрываем меню Пуск
    const startMenu = document.getElementById('start-menu');
    startMenu.classList.add('hidden');
    
    // Обновляем панель задач
    updateTaskbar();
}

// Настройка событий окна
function setupWindowEvents(windowEl, winId) {
    const header = windowEl.querySelector('.window-header');
    const minimizeBtn = windowEl.querySelector('.minimize');
    const maximizeBtn = windowEl.querySelector('.maximize');
    const closeBtn = windowEl.querySelector('.close');
    
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
        
        let newLeft = startLeft + dx;
        let newTop = startTop + dy;
        
        // Ограничения
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 100));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - 100));
        
        windowEl.style.left = `${newLeft}px`;
        windowEl.style.top = `${newTop}px`;
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = '';
        }
    });
    
    // Двойной клик по заголовку - развернуть/восстановить
    header.addEventListener('dblclick', (e) => {
        if (e.target.closest('.window-controls')) return;
        toggleMaximize(winId);
    });
    
    // Свернуть
    minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        minimizeWindow(winId);
    });
    
    // Развернуть/восстановить
    maximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMaximize(winId);
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
    
    // Обновляем панель задач
    updateTaskbar();
}

// Свернуть окно
function minimizeWindow(winId) {
    const win = openWindows.get(winId);
    if (!win) return;
    
    win.isMinimized = true;
    win.element.classList.add('minimized');
    
    if (activeWindowId === winId) {
        activeWindowId = null;
        // Фокусируем последнее видимое окно
        const remaining = Array.from(openWindows.entries())
            .filter(([id, w]) => !w.isMinimized)
            .map(([id]) => id);
        
        if (remaining.length > 0) {
            focusWindow(remaining[remaining.length - 1]);
        }
    }
    
    updateTaskbar();
}

// Развернуть/восстановить окно
function toggleMaximize(winId) {
    const win = openWindows.get(winId);
    if (!win) return;
    
    const maximizeBtn = win.element.querySelector('.maximize');
    
    if (win.isMaximized) {
        // Восстанавливаем
        win.element.style.top = `${win.originalRect.top}px`;
        win.element.style.left = `${win.originalRect.left}px`;
        win.element.style.width = `${win.originalRect.width}px`;
        win.element.style.height = `${win.originalRect.height}px`;
        win.element.classList.remove('maximized');
        win.isMaximized = false;
        maximizeBtn.innerHTML = '<i class="fas fa-square"></i>';
    } else {
        // Сохраняем текущие размеры
        win.originalRect = {
            top: win.element.offsetTop,
            left: win.element.offsetLeft,
            width: win.element.offsetWidth,
            height: win.element.offsetHeight
        };
        
        // Разворачиваем
        win.element.classList.add('maximized');
        win.isMaximized = true;
        maximizeBtn.innerHTML = '<i class="fas fa-clone"></i>';
    }
}

// Закрыть окно
function closeWindow(winId) {
    const win = openWindows.get(winId);
    if (!win) return;
    
    // Анимация закрытия
    win.element.classList.add('closing');
    
    setTimeout(() => {
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
        
        updateTaskbar();
    }, 150);
}

// Обновление панели задач
function updateTaskbar() {
    const taskbarApps = document.getElementById('taskbar-apps');
    taskbarApps.innerHTML = '';
    
    // Добавляем закрепленные приложения
    const pinnedApps = ['explorer', 'edge', 'settings', 'store'];
    pinnedApps.forEach(appId => {
        const app = APPS[appId];
        if (!app) return;
        
        const btn = document.createElement('button');
        btn.className = 'taskbar-app';
        btn.dataset.app = appId;
        btn.innerHTML = `<i class="${app.icon}"></i>`;
        
        // Проверяем, открыто ли приложение
        const isOpen = Array.from(openWindows.values()).some(w => w.appId === appId && !w.isMinimized);
        if (isOpen) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', () => openApp(appId));
        taskbarApps.appendChild(btn);
    });
    
    // Добавляем открытые окна, которых нет в закрепленных
    const openedAppIds = new Set(pinnedApps);
    openWindows.forEach((win, id) => {
        if (!openedAppIds.has(win.appId) && !win.isMinimized) {
            const app = APPS[win.appId];
            if (!app) return;
            
            const btn = document.createElement('button');
            btn.className = 'taskbar-app active';
            btn.dataset.app = win.appId;
            btn.innerHTML = `<i class="${app.icon}"></i>`;
            btn.addEventListener('click', () => focusWindow(id));
            taskbarApps.appendChild(btn);
        }
    });
}
