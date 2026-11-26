let zIndexCounter = 100;
const openWindows = new Map();

function createWindow(appId) {
    const app = APPS[appId];
    if (!app) return;

    // Если окно уже открыто - просто фокус
    for (const [id, win] of openWindows) {
        if (win.appId === appId && !win.minimized) {
            focusWindow(id);
            return;
        }
    }

    const id = `win-${Date.now()}`;
    const tpl = document.getElementById('window-template').content.cloneNode(true);
    const el = tpl.querySelector('.window');
    
    el.id = id;
    el.querySelector('.window-title').textContent = app.name;
    el.querySelector('.window-content').innerHTML = app.content;
    
    // Каскадное позиционирование
    const offset = (openWindows.size * 30) % 200;
    el.style.top = `${80 + offset}px`;
    el.style.left = `${80 + offset}px`;
    el.style.width = '600px';
    el.style.height = '400px';

    document.getElementById('windows-container').appendChild(el);
    
    const winData = { el, appId, minimized: false, maximized: false };
    openWindows.set(id, winData);
    
    setupDrag(el, id);
    setupControls(el, id);
    focusWindow(id);
    updateTaskbar();
}

function focusWindow(id) {
    document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
    const win = openWindows.get(id);
    if (win) {
        win.el.style.zIndex = ++zIndexCounter;
        win.el.classList.add('active');
        if (win.minimized) {
            win.minimized = false;
            win.el.style.display = 'flex';
        }
    }
    updateTaskbar();
}

function closeWindow(id) {
    const win = openWindows.get(id);
    if (win) {
        win.el.style.animation = 'winOpen 0.15s reverse forwards';
        setTimeout(() => {
            win.el.remove();
            openWindows.delete(id);
            updateTaskbar();
        }, 150);
    }
}

function toggleMaximize(id) {
    const win = openWindows.get(id);
    if (!win) return;
    win.maximized = !win.maximized;
    win.el.classList.toggle('maximized', win.maximized);
    const btn = win.el.querySelector('.maximize i');
    btn.className = win.maximized ? 'far fa-copy' : 'far fa-square';
}

function minimizeWindow(id) {
    const win = openWindows.get(id);
    if (win) {
        win.minimized = true;
        win.el.style.display = 'none';
        updateTaskbar();
    }
}

// Drag & Drop логика
function setupDrag(el, id) {
    const header = el.querySelector('.window-header');
    let isDragging = false, startX, startY, initLeft, initTop;

    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.window-controls')) return;
        const win = openWindows.get(id);
        if (win?.maximized) return;
        
        isDragging = true;
        startX = e.clientX; startY = e.clientY;
        initLeft = el.offsetLeft; initTop = el.offsetTop;
        focusWindow(id);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        el.style.left = `${initLeft + (e.clientX - startX)}px`;
        el.style.top = `${initTop + (e.clientY - startY)}px`;
    });

    window.addEventListener('mouseup', () => isDragging = false);
}

function setupControls(el, id) {
    el.querySelector('.minimize').onclick = () => minimizeWindow(id);
    el.querySelector('.maximize').onclick = () => toggleMaximize(id);
    el.querySelector('.close').onclick = () => closeWindow(id);
    el.onmousedown = () => focusWindow(id);
}

function updateTaskbar() {
    const container = document.getElementById('taskbar-apps');
    container.innerHTML = '';
    const pinned = ['explorer', 'edge', 'settings', 'store'];
    
    // Закрепленные
    pinned.forEach(appId => {
        const app = APPS[appId];
        const isOpen = Array.from(openWindows.values()).some(w => w.appId === appId && !w.minimized);
        const btn = document.createElement('button');
        btn.className = `taskbar-app ${isOpen ? 'active' : ''}`;
        btn.innerHTML = `<i class="${app.icon}"></i>`;
        btn.onclick = () => createWindow(appId);
        container.appendChild(btn);
    });

    // Открытые не закрепленные
    openWindows.forEach((win, id) => {
        if (!pinned.includes(win.appId) && !win.minimized) {
            const app = APPS[win.appId];
            const btn = document.createElement('button');
            btn.className = 'taskbar-app active';
            btn.innerHTML = `<i class="${app.icon}"></i>`;
            btn.onclick = () => focusWindow(id);
            container.appendChild(btn);
        }
    });
}
