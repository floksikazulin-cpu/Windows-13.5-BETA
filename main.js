document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const startMenu = document.getElementById('start-menu');
    const searchInput = document.getElementById('start-search');
    const pinnedGrid = document.getElementById('pinned-grid');
    const allAppsList = document.getElementById('all-apps-list');
    const ctxMenu = document.getElementById('context-menu');

    // Рендер меню Пуск
    function renderApps(filter = '') {
        pinnedGrid.innerHTML = '';
        allAppsList.innerHTML = '';
        
        PINNED_APPS.forEach(id => {
            if (APPS[id].name.toLowerCase().includes(filter)) {
                const div = document.createElement('div');
                div.className = 'pinned-app-item';
                div.innerHTML = `<i class="${APPS[id].icon}"></i><span>${APPS[id].name}</span>`;
                div.onclick = () => { createWindow(id); toggleStart(); };
                pinnedGrid.appendChild(div);
            }
        });

        ALL_APPS_LIST.forEach(id => {
            if (APPS[id].name.toLowerCase().includes(filter)) {
                const div = document.createElement('div');
                div.className = 'ctx-item';
                div.innerHTML = `<i class="${APPS[id].icon}"></i> ${APPS[id].name}`;
                div.onclick = () => { createWindow(id); toggleStart(); };
                allAppsList.appendChild(div);
            }
        });
    }

    function toggleStart() {
        startMenu.classList.toggle('show');
        startBtn.classList.toggle('active');
        if (startMenu.classList.contains('show')) {
            searchInput.value = '';
            renderApps();
            searchInput.focus();
        }
    }

    // Часы
    function updateClock() {
        const now = new Date();
        document.getElementById('time').textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        document.getElementById('date').textContent = now.toLocaleDateString();
    }
    setInterval(updateClock, 1000);
    updateClock();

    // События
    startBtn.onclick = (e) => { e.stopPropagation(); toggleStart(); };
    searchInput.oninput = (e) => renderApps(e.target.value.toLowerCase());
    
    document.onclick = (e) => {
        if (!startMenu.contains(e.target) && e.target !== startBtn) {
            startMenu.classList.remove('show');
            startBtn.classList.remove('active');
        }
        ctxMenu.classList.remove('show');
    };

    // Контекстное меню рабочего стола
    document.getElementById('desktop').oncontextmenu = (e) => {
        if (e.target.closest('.window')) return;
        e.preventDefault();
        ctxMenu.style.left = `${e.clientX}px`;
        ctxMenu.style.top = `${e.clientY}px`;
        ctxMenu.classList.add('show');
    };

    ctxMenu.querySelectorAll('.ctx-item').forEach(item => {
        item.onclick = () => {
            if (item.dataset.action === 'settings') createWindow('settings');
            ctxMenu.classList.remove('show');
        };
    });

    // Иконки рабочего стола
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.ondblclick = () => createWindow(icon.dataset.app);
    });

    // Кнопка питания
    document.getElementById('power-btn').onclick = () => {
        if(confirm('Завершить работу?')) location.reload();
    };

    // Инициализация
    renderApps();
});
