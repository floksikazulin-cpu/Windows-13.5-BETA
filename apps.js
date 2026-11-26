const APPS = {
    explorer: { name: 'Проводник', icon: 'fas fa-folder', color: '#f7b731', content: '<h2>📁 Проводник</h2><p>Быстрый доступ к файлам.</p>' },
    edge: { name: 'Edge', icon: 'fab fa-edge', color: '#0078d4', content: '<h2>🌐 Microsoft Edge</h2><p>Браузер нового поколения.</p>' },
    settings: { name: 'Параметры', icon: 'fas fa-cog', color: '#777', content: '<h2>⚙️ Параметры</h2><p>Система • Bluetooth • Персонализация</p>' },
    store: { name: 'Store', icon: 'fas fa-store', color: '#00b294', content: '<h2>🛍️ Microsoft Store</h2><p>Приложения, игры и развлечения.</p>' },
    trash: { name: 'Корзина', icon: 'fas fa-trash-alt', color: '#888', content: '<h2>🗑️ Корзина пуста</h2>' },
    computer: { name: 'Этот ПК', icon: 'fas fa-desktop', color: '#3498db', content: '<h2>💻 Этот компьютер</h2><p>Локальный диск (C:): 500 ГБ свободно</p>' },
    documents: { name: 'Документы', icon: 'fas fa-folder-open', color: '#f1c40f', content: '<h2>📂 Документы</h2><p>Ваши личные файлы.</p>' },
    terminal: { name: 'Терминал', icon: 'fas fa-terminal', color: '#333', content: '<h2>💻 PowerShell</h2><pre>PS C:\\Users\\User> _</pre>' }
};

const PINNED_APPS = ['explorer', 'edge', 'settings', 'store', 'computer', 'terminal'];
const ALL_APPS_LIST = Object.keys(APPS);
