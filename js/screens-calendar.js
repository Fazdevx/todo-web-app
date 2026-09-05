// =============================================================
//  screens-calendar.js  -  Vista mensual de tareas
// =============================================================
const Calendar = (() => {
    let monthOffset = 0;
    let selectedDay = null;
    let tasks = [];

    const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const DOW = ['D','L','M','X','J','V','S'];

    function render() {
        const now = new Date();
        const cal = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
        const monthName = `${MONTHS[cal.getMonth()]} ${cal.getFullYear()}`;
        const daysInMonth = new Date(cal.getFullYear(), cal.getMonth() + 1, 0).getDate();
        const firstDow = cal.getDay();

        // inicializar selectedDay al dia actual solo si estamos en el mes actual
        if (selectedDay === null && monthOffset === 0) selectedDay = now.getDate();
        if (monthOffset !== 0) selectedDay = null;

        // agrupar tareas por dia del mes actual
        const map = new Map();
        for (const t of tasks) {
            if (!t.dueAt) continue;
            const d = new Date(t.dueAt);
            if (d.getFullYear() === cal.getFullYear() && d.getMonth() === cal.getMonth()) {
                const key = d.getDate();
                if (!map.has(key)) map.set(key, []);
                map.get(key).push(t);
            }
        }

        const cells = [];
        for (let i = 0; i < firstDow; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(d);
        while (cells.length % 7) cells.push(null);

        return `
        <div class="app">
            <header class="topbar">
                <button class="icon-btn" data-action="back">←</button>
                <h1>${monthName}</h1>
                <button class="icon-btn" data-action="prev">‹</button>
                <button class="icon-btn" data-action="next">›</button>
            </header>
            <div class="cal-wrap">
                <div class="cal-grid">
                    ${DOW.map(d => `<div class="dow">${d}</div>`).join('')}
                    ${cells.map(d => {
                        const has = d && map.has(d);
                        return `<button class="cal-cell ${selectedDay===d?'selected':''}" data-day="${d ?? ''}">
                            ${d ?? ''}
                            ${has ? '<span class="dot"></span>' : ''}
                        </button>`;
                    }).join('')}
                </div>
                <div class="section">
                    <h3>${selectedDay ? `Tareas del día ${selectedDay}` : 'Selecciona un día'}</h3>
                    <div id="day-tasks">
                        ${selectedDay && map.has(selectedDay) ? map.get(selectedDay).map(t => `
                            <div class="task-card" data-id="${t.id}">
                                <div class="body">
                                    <div class="title">${escapeHtml(t.title)}</div>
                                    <div class="meta">
                                        <span class="pill">${escapeHtml(t.category||'General')}</span>
                                    </div>
                                </div>
                            </div>`).join('') :
                            '<div class="sub" style="text-align:center;padding:16px">Sin tareas para este día</div>'
                        }
                    </div>
                </div>
            </div>
            <nav class="bottom-nav">
                <button data-route="agenda"><span class="icon">📋</span><span>Agenda</span></button>
                <button class="active" data-route="calendar"><span class="icon">📅</span><span>Calendario</span></button>
                <button data-route="settings"><span class="icon">⚙️</span><span>Ajustes</span></button>
            </nav>
        </div>`;
    }

    function bind() {
        document.querySelector('[data-action="back"]').addEventListener('click', () => App.navigate('agenda'));
        document.querySelector('[data-action="prev"]').addEventListener('click', () => { monthOffset--; refresh(); });
        document.querySelector('[data-action="next"]').addEventListener('click', () => { monthOffset++; refresh(); });
        document.querySelector('.cal-grid').addEventListener('click', e => {
            const d = e.target.closest('[data-day]');
            if (!d) return;
            const day = d.dataset.day;
            if (day) selectedDay = +day;
            refresh();
        });
        document.querySelectorAll('.bottom-nav button').forEach(b => {
            b.addEventListener('click', () => {
                const r = b.dataset.route;
                if (r !== 'calendar') App.navigate(r);
            });
        });
    }

    function refresh() {
        document.getElementById('app').innerHTML = render();
        bind();
    }

    async function mount() {
        tasks = Agenda._tasks || await loadTasks(App.user.id, App.user.role === 'ADMIN');
        monthOffset = 0; selectedDay = null;
        refresh();
    }

    return { mount, render, bind };
})();
