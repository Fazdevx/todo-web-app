// =============================================================
//  screens-editor.js  -  Crear / editar tareas
// =============================================================
const Editor = (() => {
    let state = {
        id: null,
        title: '',
        description: '',
        category: 'General',
        priority: 1,
        status: 'PENDIENTE',
        dueAt: null,
        subtasks: [],
        reminderOffsetMs: 3 * 60 * 60 * 1000,
        assignedTo: '',
        assignedToName: '',
        createdBy: '',
        done: false,
        createdAt: 0,
        completedAt: null,
    };
    let user = null;

    const CATEGORIES = ['General', 'Trabajo', 'Personal', 'Estudio'];
    const PRIORITIES = [{v:0,l:'Baja'},{v:1,l:'Media'},{v:2,l:'Alta'},{v:3,l:'Urgente'}];
    const REMINDERS  = [
        {ms: 1*60*60*1000,  l:'1 h'},
        {ms: 3*60*60*1000,  l:'3 h'},
        {ms: 24*60*60*1000, l:'1 día'},
        {ms: 7*24*60*60*1000, l:'1 sem'},
    ];

    function render() {
        return `
        <div class="app">
            <header class="topbar">
                <button class="icon-btn" data-action="close">←</button>
                <h1>${state.id ? 'Editar tarea' : 'Nueva tarea'}</h1>
                <button class="text-btn" data-action="save" ${!state.title.trim()?'disabled':''}>Guardar</button>
            </header>

            <div class="editor">
                <input class="title-field" id="f-title" placeholder="Título" value="${escapeHtml(state.title)}" />

                <div class="row" style="margin: 8px 0 4px;">
                    <button class="chip" id="cat-chip">${escapeHtml(state.category)}</button>
                    <button class="chip" id="status-chip">${state.status}</button>
                </div>

                <div class="field">
                    <label>Descripción</label>
                    <textarea class="textarea" id="f-desc" placeholder="Notas…">${escapeHtml(state.description)}</textarea>
                </div>

                <div class="divider"></div>
                <div class="field">
                    <label>Prioridad</label>
                    <div class="chip-row" id="prio-row">
                        ${PRIORITIES.map(p => `<button class="chip ${state.priority===p.v?'active':''}" data-v="${p.v}">${p.l}</button>`).join('')}
                    </div>
                </div>

                <div class="field">
                    <label>Fecha de entrega</label>
                    <div class="row">
                        <input class="input" id="f-date" type="date" value="${state.dueAt ? ymd(state.dueAt) : ''}" style="max-width:180px" />
                        <input class="input" id="f-time" type="time" value="${state.dueAt ? hm(state.dueAt) : ''}" style="max-width:120px" />
                        ${state.dueAt ? `<button class="icon-btn" data-action="clear-due">✕</button>` : ''}
                    </div>
                    ${state.dueAt ? `<div class="sub" style="margin-top:4px">${formatRelative(state.dueAt)} · ${formatDate(state.dueAt)}</div>` : ''}
                </div>

                <div class="field">
                    <label>Recordatorio previo</label>
                    <div class="chip-row" id="rem-row">
                        ${REMINDERS.map(r => `<button class="chip ${state.reminderOffsetMs===r.ms?'active':''}" data-ms="${r.ms}">${r.l}</button>`).join('')}
                    </div>
                </div>

                <div class="field">
                    <label>Puntos a tratar</label>
                    <div class="row">
                        <input class="input" id="f-sub" placeholder="Añadir punto…" />
                        <button class="btn" data-action="add-sub">＋</button>
                    </div>
                    <div id="sub-list" style="margin-top:8px">
                        ${state.subtasks.map((s,i) => `
                            <div class="row" style="margin:4px 0">
                                <span style="flex:1">• ${escapeHtml(s)}</span>
                                <button class="icon-btn" data-action="rm-sub" data-i="${i}">🗑️</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>`;
    }

    function bind() {
        document.querySelector('[data-action="close"]').addEventListener('click', () => App.navigate('agenda'));
        document.querySelector('[data-action="save"]').addEventListener('click', save);

        document.getElementById('f-title').addEventListener('input', e => {
            state.title = e.target.value;
            document.querySelector('[data-action="save"]').disabled = !state.title.trim();
        });
        document.getElementById('f-desc').addEventListener('input',  e => { state.description = e.target.value; });
        document.getElementById('cat-chip').addEventListener('click',  cycleCategory);
        document.getElementById('status-chip').addEventListener('click', cycleStatus);

        document.getElementById('prio-row').addEventListener('click', e => {
            const v = +e.target.dataset.v; if (Number.isFinite(v)) { state.priority = v; refresh(); }
        });

        document.getElementById('rem-row').addEventListener('click', e => {
            const ms = +e.target.dataset.ms; if (Number.isFinite(ms)) { state.reminderOffsetMs = ms; refresh(); }
        });

        document.getElementById('f-date').addEventListener('change', e => { updateDue(e.target.value, document.getElementById('f-time').value); refresh(); });
        document.getElementById('f-time').addEventListener('change', e => { updateDue(document.getElementById('f-date').value, e.target.value); refresh(); });
        document.querySelector('[data-action="clear-due"]')?.addEventListener('click', () => { state.dueAt = null; refresh(); });

        document.querySelector('[data-action="add-sub"]').addEventListener('click', addSub);
        document.getElementById('f-sub').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSub(); }});
        document.getElementById('sub-list').addEventListener('click', e => {
            const b = e.target.closest('[data-action="rm-sub"]');
            if (!b) return;
            const i = +b.dataset.i;
            state.subtasks = state.subtasks.filter((_, idx) => idx !== i);
            refresh();
        });
    }

    function addSub() {
        const inp = document.getElementById('f-sub');
        const v = (inp.value || '').trim();
        if (!v) return;
        state.subtasks.push(v);
        inp.value = '';
        refresh();
    }

    function cycleCategory() {
        const i = CATEGORIES.indexOf(state.category);
        state.category = CATEGORIES[(i + 1) % CATEGORIES.length];
        refresh();
    }
    function cycleStatus() {
        const order = ['PENDIENTE','EN_PROGRESO','COMPLETADA','VENCIDA'];
        const i = order.indexOf(state.status);
        state.status = order[(i + 1) % order.length];
        if (state.status === 'COMPLETADA') state.done = true;
        else if (state.status === 'PENDIENTE' || state.status === 'EN_PROGRESO') state.done = false;
        refresh();
    }

    function updateDue(date, time) {
        if (!date) { state.dueAt = null; return; }
        const [y,m,d] = date.split('-').map(Number);
        const [hh,mm] = (time || '12:00').split(':').map(Number);
        const c = new Date(y, m-1, d, hh, mm, 0, 0);
        state.dueAt = c.getTime();
    }

    async function save() {
        if (!state.title.trim()) return snack('El título es obligatorio', 'error');
        const t = {
            ...state,
            createdBy: state.createdBy || user.id,
            assignedTo: state.assignedTo || user.id,
            assignedToName: state.assignedToName || user.name,
            createdAt: state.createdAt || Date.now(),
        };
        try {
            if (t.id) await updateTask(t);
            else      await createTask(t);
            App.navigate('agenda');
        } catch (e) {
            snack(e.message || 'Error al guardar', 'error');
        }
    }

    function refresh() {
        document.getElementById('app').innerHTML = render();
        bind();
    }

    function mount(u, { taskId } = {}) {
        user = u;
        if (taskId) {
            const list = Agenda._tasks || [];
            const t = list.find(x => x.id === taskId);
            if (t) state = { ...t };
        } else {
            state = {
                id: null,
                title: '',
                description: '',
                category: 'General',
                priority: 1,
                status: 'PENDIENTE',
                dueAt: null,
                subtasks: [],
                reminderOffsetMs: 3 * 60 * 60 * 1000,
                assignedTo: '',
                assignedToName: '',
                createdBy: '',
                done: false,
                createdAt: 0,
                completedAt: null,
            };
        }
        refresh();
    }

    return { mount, render, bind, _state: state };
})();
