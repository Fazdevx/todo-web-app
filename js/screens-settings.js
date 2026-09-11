// =============================================================
//  screens-settings.js  -  Tema, paleta, densidad, logout
// =============================================================
const Settings = (() => {
    const PALETTES = ['Azul','Verde','Morado','Naranja','Rosa','Lavanda Pastel','Rosa Suave','Verde Menta','Azul Cielo','Violeta Flores','Rosa Claro','Azul Suave','Rosa Pastel','Azul Real','Lavanda'];

    function render() {
        const theme = localStorage.getItem(CONFIG.KEY_THEME_MODE) || 'system';
        const palette = +(localStorage.getItem(CONFIG.KEY_PALETTE) ?? 0);
        const density = localStorage.getItem(CONFIG.KEY_DENSITY) || 'comfortable';
        const sound   = (localStorage.getItem(CONFIG.KEY_SOUND) ?? '1') === '1';
        const daily   = +(localStorage.getItem(CONFIG.KEY_DAILY_HOUR) ?? -1);

        return `
        <div class="app">
            <header class="topbar">
                <button class="icon-btn" data-action="back">←</button>
                <h1>Ajustes</h1>
                <button class="icon-btn" data-action="logout" title="Cerrar sesión">🚪</button>
            </header>

            <div class="cal-wrap">
                <div class="section">
                    <h3>Tema</h3>
                    <div class="chip-row" id="theme-row">
                        ${[['light','Claro'],['dark','Oscuro'],['system','Sistema']].map(([k,l]) =>
                            `<button class="chip ${theme===k?'active':''}" data-theme="${k}">${l}</button>`).join('')}
                    </div>
                </div>

                <div class="section">
                    <h3>Paleta</h3>
                    <div class="palette-row" id="palette-row">
                        ${PALETTES.map((name, i) => `<div class="palette-swatch p${i} ${palette===i?'active':''}" data-i="${i}" title="${name}"></div>`).join('')}
                    </div>
                    <div class="sub" style="margin-top:8px">Actual: ${PALETTES[palette]}</div>
                </div>

                <div class="section">
                    <h3>Densidad</h3>
                    <div class="chip-row">
                        <button class="chip ${density==='comfortable'?'active':''}" data-density="comfortable">Cómoda</button>
                        <button class="chip ${density==='compact'?'active':''}" data-density="compact">Compacta</button>
                    </div>
                </div>

                <div class="section">
                    <h3>Resumen diario</h3>
                    <div class="row-between">
                        <span>Hora del resumen</span>
                        <span>${daily < 0 ? 'Desactivado' : String(daily).padStart(2,'0') + ':00'}</span>
                    </div>
                </div>

                <div class="section">
                    <h3>Sonido de notificación</h3>
                    <div class="row-between">
                        <span>Activado</span>
                        <span>${sound ? '🔔 Sí' : '🔕 No'}</span>
                    </div>
                </div>

                <div class="section" style="text-align:center">
                    <button class="btn btn-ghost btn-block" data-action="install">📲 Instalar como app</button>
                    <div class="sub" style="margin-top:8px">Versión 1.0 · PWA</div>
                </div>
            </div>

            <nav class="bottom-nav">
                <button data-route="agenda"><span class="icon">📋</span><span>Agenda</span></button>
                <button data-route="calendar"><span class="icon">📅</span><span>Calendario</span></button>
                <button class="active" data-route="settings"><span class="icon">⚙️</span><span>Ajustes</span></button>
            </nav>
        </div>`;
    }

    function bind() {
        document.querySelector('[data-action="back"]').addEventListener('click', () => App.navigate('agenda'));
        document.querySelector('[data-action="logout"]').addEventListener('click', async () => {
            if (await confirmDialog('Cerrar sesión', '¿Salir de tu cuenta?')) {
                await Auth.logout();
                App.afterLogout();
            }
        });
        document.getElementById('theme-row').addEventListener('click', e => {
            const t = e.target.dataset.theme; if (!t) return;
            localStorage.setItem(CONFIG.KEY_THEME_MODE, t);
            App.applyTheme(); refresh();
        });
        document.getElementById('palette-row').addEventListener('click', e => {
            const i = e.target.dataset.i; if (i === undefined) return;
            localStorage.setItem(CONFIG.KEY_PALETTE, i);
            App.applyPalette(); refresh();
        });
        document.querySelectorAll('[data-density]').forEach(b => b.addEventListener('click', () => {
            localStorage.setItem(CONFIG.KEY_DENSITY, b.dataset.density);
            App.applyDensity(); refresh();
        }));
        document.querySelector('[data-action="install"]').addEventListener('click', () => {
            if (window.deferredInstall) {
                window.deferredInstall.prompt();
            } else {
                snack('En Chrome: menú ⋮ → "Instalar app"', 'success');
            }
        });
        document.querySelectorAll('.bottom-nav button').forEach(b => {
            b.addEventListener('click', () => {
                const r = b.dataset.route;
                if (r !== 'settings') App.navigate(r);
            });
        });
    }

    function refresh() {
        document.getElementById('app').innerHTML = render();
        bind();
    }

    function mount() { refresh(); }

    return { mount, render, bind };
})();
