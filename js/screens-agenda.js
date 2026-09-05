// =============================================================
//  screens-agenda.js  -  Pantalla principal con lista de tareas
// =============================================================
const Agenda = (() => {
    let tasks = [];
    let filter = 'Todas';
    let category = null;
    let unsub = null;
    let user = null;

    function statusLabel(t) {
        if (t.done) return 'completada';
        if (t.dueAt && t.dueAt < Date.now()) return 'vencida';
        const map = { PENDIENTE: 'pendiente', EN_PROGRESO: 'en_progreso', COMPLETADA: 'completada', VENCIDA: 'vencida' };
        return map[t.status] || 'pendiente';
    }

    function priorityClass(p) {
        return `prio-${p || 0}`;
    }

    function priorityLabel(p) {
        const labels = ['Baja', 'Media', 'Alta', 'Urgente'];
        return labels[p || 0] || 'Baja';
    }

    function render() {
        const now = Date.now();
        const sevenDays = now + 7 * 24 * 60 * 60 * 1000;

        const filtered = tasks.filter(t => {
            const s = statusLabel(t);
            const byCategory = !category || t.category === category;
            let byFilter = true;
            if (filter === 'Pendientes') byFilter = !t.done;
            else if (filter === 'Hechas')   byFilter = t.done;
            else if (filter === 'Próximas') byFilter = t.dueAt && t.dueAt >= now && t.dueAt <= sevenDays && !t.done;
            else if (filter === 'Vencidas') byFilter = s === 'vencida';
            return byCategory && byFilter;
        });

        const categories = ['General', 'Trabajo', 'Personal', 'Estudio']
            .concat(tasks.map(t => t.category).filter(Boolean))
            .filter((v, i, a) => a.indexOf(v) === i);

        const pending = tasks.filter(t => !t.done).length;
        const done    = tasks.length - pending;

        return `
        <div class="app">
            <header class="topbar">
                <button class="icon-btn" id="go-cal">📅</button>
                <h1 style="display:flex;flex-direction:column;align-items:center;flex:1">
                    <span>Mi Agenda</span>
                    <span class="topbar-sub">${pending} pendientes · ${done} hechas</span>
                </h1>
                <button class="icon-btn" id="go-set">⚙️</button>
            </header>

            <nav class="filter-bar" id="filter-bar">
                ${['Todas','Pendientes','Hechas','Próximas','Vencidas']
                    .map(f => `<button class="chip ${f===filter?'active':''}" data-filter="${f}">${f}</button>`)
                    .join('')}
            </nav>

            <nav class="filter-bar" id="cat-bar" style="border-top:1px solid var(--outline-variant);">
                <button class="chip ${category===null?'active':''}" data-cat="">Todas</button>
                ${categories.map(c => `<button class="chip ${category===c?'active':''}" data-cat="${c}">${c}</button>`).join('')}
            </nav>

            <main class="task-list" id="task-list">
                ${filtered.length === 0 ? `
                    <div class="empty">
                        <div class="emoji">📝</div>
                        <div class="title">Sin tareas</div>
                        <div>Toca + para crear una</div>
                    </div>
                ` : filtered.map(renderCard).join('')}
            </main>

            <button class="fab" id="new-task" title="Nueva tarea">＋</button>

            <nav class="bottom-nav">
                <button class="active" data-route="agenda"><span class="icon">📋</span><span>Agenda</span></button>
                <button data-route="calendar"><span class="icon">📅</span><span>Calendario</span></button>
                <button data-route="settings"><span class="icon">⚙️</span><span>Ajustes</span></button>
            </nav>
        </div>`;
    }

    function renderCard(t) {
        const s = statusLabel(t);
        const colorMap = {
            pendiente:  '#607D8B',
            en_progreso:'#1976D2',
            completada: '#2E7D32',
            vencida:    '#C62828',
        };
        const stripe = colorMap[s] || '#888';
        const due = t.dueAt
            ? `<div class="sub">📆 ${formatRelative(t.dueAt)} · ${formatDate(t.dueAt)}</div>`
            : '';
        return `
        <div class="task-card" data-id="${t.id}" style="--p-color:${stripe}">
            <div class="stripe" style="background:${stripe}"></div>
            <div class="body" data-action="open">
                <div class="title" style="${t.done?'text-decoration:line-through;opacity:0.7':''}">${escapeHtml(t.title)}</div>
                <div class="meta">
                    <span class="pill status-${s}">${capitalize(s.replace('_',' '))}</span>
                    <span class="pill ${priorityClass(t.priority)}">${priorityLabel(t.priority)}</span>
                    <span class="pill">${escapeHtml(t.category||'General')}</span>
                </div>
                ${due}
            </div>
            <div class="actions">
                <button class="icon-btn" data-action="toggle" title="Marcar">${t.done?'✅':'⚪'}</button>
                <button class="icon-btn" data-action="delete" title="Borrar">🗑️</button>
            </div>
        </div>`;
    }

    function bind() {
        document.getElementById('go-cal').addEventListener('click',  () => App.navigate('calendar'));
        document.getElementById('go-set').addEventListener('click',  () => App.navigate('settings'));
        document.getElementById('new-task').addEventListener('click', () => App.navigate('editor', { taskId: null }));

        document.getElementById('filter-bar').addEventListener('click', e => {
            const f = e.target.dataset.filter;
            if (f) { filter = f; refresh(); }
        });
        document.getElementById('cat-bar').addEventListener('click', e => {
            const c = e.target.dataset.cat;
            category = c === '' ? null : c;
            refresh();
        });
        document.querySelectorAll('.bottom-nav button').forEach(b => {
            b.addEventListener('click', () => {
                const r = b.dataset.route;
                if (r === 'agenda') return;
                App.navigate(r);
            });
        });

        document.getElementById('task-list').addEventListener('click', async e => {
            const card = e.target.closest('.task-card');
            if (!card) return;
            const id = card.dataset.id;
            const action = e.target.closest('[data-action]')?.dataset.action;
            const t = tasks.find(x => x.id === id);
            if (!t) return;
            if (action === 'toggle') {
                t.done = !t.done;
                t.status = t.done ? 'COMPLETADA' : 'PENDIENTE';
                t.completedAt = t.done ? Date.now() : null;
                try { await updateTask(t); } catch (e) { snack(e.message, 'error'); }
                refresh();
            } else if (action === 'delete') {
                if (await confirmDialog('Borrar tarea', `¿Borrar "${t.title}"?`)) {
                    await deleteTask(t); tasks = tasks.filter(x => x.id !== id); refresh();
                }
            } else {
                App.navigate('editor', { taskId: id });
            }
        });
    }

    async function refresh() {
        const fresh = await loadTasks(user.id, user.role === 'ADMIN');
        tasks = fresh;
        Agenda._tasks = fresh;
        document.getElementById('app').innerHTML = render();
        bind();
    }

    async function mount(u) {
        user = u;
        await refresh();
        if (unsub) { try { unsub(); } catch (_) {} }
        unsub = subscribeTasks(({ type }) => refresh());
    }

    function unmount() {
        if (unsub) { try { unsub(); } catch (_) {} unsub = null; }
    }

    return { mount, unmount, render, bind, refresh };
})();
