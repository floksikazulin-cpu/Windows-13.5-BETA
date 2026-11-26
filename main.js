// ========== ГЛОБАЛЬНОЕ СОСТОЯНИЕ ==========
const desktop = document.getElementById('desktop');
const startMenu = document.getElementById('start-menu');
const startBtn = document.getElementById('start-btn');
const contextMenu = document.getElementById('context-menu');
const pinnedGrid = document.getElementById('pinned-grid');
const allAppsList = document.getElementById('all-apps-list');
const startSearch = document.getElementById('start-search');
const powerBtn = document.getElementById('power-btn');

// ========== ИНИЦИАЛИЗАЦИЯ ==========

// Обновление часов
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('time').textContent = `${hours}:${minutes}`;
    
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    document.getElementById('date').textContent = `${day}.${month}.${year}`;
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

// ========== МЕНЮ ПУСК ==========

// Открыть/закрыть меню Пуск
function toggleStartMenu() {
    startMenu.classList.toggle('hidden');
    startBtn.classList.toggle('active');
    
    if (!startMenu.classList.contains('hidden')) {
        startSearch.value = '';
        renderAllApps('');
        setTimeout(() => startSearch.focus(), 100);
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
        startBtn.classList.remove('active');
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
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
    });
});

// Клик по рабочему столу — снять выделение
desktop.addEventListener('click', (e) => {
    if (e.target === desktop || e.target.classList.contains('desktop-icons')) {
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    }
});

// Кнопка питания (демо)
powerBtn.addEventListener('click', () => {
    if (confirm('Завершить работу? (Демо)')) {
        // Закрываем все окна
        Array.from(openWindows.keys()).forEach(winId => closeWindow(winId));
        startMenu.classList.add('hidden');
        startBtn.classList.remove('active');
    }
});

// Горячие клавиши
document.addEventListener('keydown', (e) => {
    // Win + D - показать рабочий стол
    if (e.key === 'd' && e.metaKey) {
        e.preventDefault();
        Array.from(openWindows.keys()).forEach(winId => {
            const win = openWindows.get(winId);
            if (win && !win.isMinimized) {
                minimizeWindow(winId);
            }
        });
    }
    
    // Win + E - открыть проводник
    if (e.key === 'e' && e.metaKey) {
        e.preventDefault();
        openApp('explorer');
    }
    
    // Win + I - открыть настройки
    if (e.key === 'i' && e.metaKey) {
        e.preventDefault();
        openApp('settings');
    }
    
    // Escape - закрыть меню Пуск
    if (e.key === 'Escape') {
        startMenu.classList.add('hidden');
        startBtn.classList.remove('active');
        hideContextMenu();
    }
});

// Переключение темы (для демонстрации)
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Загрузка сохраненной темы
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
}

// ========== ЗАПУСК ==========

// Инициализация
renderPinnedApps();
renderAllApps();
updateClock();
loadTheme();

// Обновление времени каждую секунду
setInterval(updateClock, 1000);

// Приветственное сообщение
setTimeout(() => {
    console.log('Windows 13.5 Beta загружена успешно!');
}, 500);
