// =============================================================
//  app.js  -  Router, helpers, bootstrap
// =============================================================

// ----------------- helpers -----------------
function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function formatRelative(ts) {
    const diff = ts - Date.now();
    const abs  = Math.abs(diff);
    const min  = 60_000, hour = 60*min, day = 24*hour;
    const sign = diff < 0 ? 'hace ' : 'en ';
    if (abs < hour)   return `${sign}${Math.round(abs/min)} min`;
    if (abs < day)    return `${sign}${Math.round(abs/hour)} h`;
    if (abs < 7*day)  return `${sign}${Math.round(abs/day)} días`;
    return formatDate(ts);
}
function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('es', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
}
function ymd(ts) { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function hm(ts)  { const d = new Date(ts); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }

let snackTimer = null;
function snack(msg, kind = '') {
    const el = document.getElementById('snackbar');
    el.textContent = msg;
    el.className = 'snackbar show ' + kind;
    if (snackTimer) clearTimeout(snackTimer);
    snackTimer = setTimeout(() => { el.className = 'snackbar ' + kind; }, 2500);
}

function confirmDialog(title, message) {
    return new Promise(resolve => {
        const dlg = document.getElementById('dialog');
        document.getElementById('dialog-title').textContent = title;
        document.getElementById('dialog-message').textContent = message;
        dlg.style.display = 'flex';
        const ok = document.getElementById('dialog-ok');
        const cancel = document.getElementById('dialog-cancel');
        const close = (v) => {
            dlg.style.display = 'none';
            ok.removeEventListener('click', onOk);
            cancel.removeEventListener('click', onCancel);
            resolve(v);
        };
        const onOk = () => close(true);
        const onCancel = () => close(false);
        ok.addEventListener('click', onOk);
        cancel.addEventListener('click', onCancel);
    });
}

// ----------------- theme / palette -----------------
function applyTheme() {
    const m = localStorage.getItem(CONFIG.KEY_THEME_MODE) || 'system';
    const t = m === 'system'
        ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : m;
    document.documentElement.setAttribute('data-theme', t);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#1976D2');
}
function applyPalette() {
    const i = localStorage.getItem(CONFIG.KEY_PALETTE) ?? 0;
    document.documentElement.setAttribute('data-palette', i);
}
function applyDensity() {
    const d = localStorage.getItem(CONFIG.KEY_DENSITY) || 'comfortable';
    document.documentElement.setAttribute('data-density', d);
}

// ----------------- App principal -----------------
const App = {
    user: null,

    async start() {
        applyTheme(); applyPalette(); applyDensity();
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

        window.addEventListener('beforeinstallprompt', e => {
            e.preventDefault();
            window.deferredInstall = e;
        });

        const splash = document.getElementById('splash');
        const appEl  = document.getElementById('app');

        try {
            const user = await Auth.getUser();
            if (user && user.role !== 'UNKNOWN') {
                App.user = user;
                Agenda.mount(user);
            } else if (user && user.role === 'UNKNOWN') {
                await Auth.logout();
                App.showAuth();
            } else {
                App.showAuth();
            }
        } catch (e) {
            console.error('start failed', e);
            App.showAuth();
        } finally {
            splash.style.display = 'none';
            appEl.style.display = '';
        }
    },

    showAuth() {
        document.getElementById('app').innerHTML = renderAuth('login');
        bindAuth();
    },

    afterLogin(user) {
        App.user = user;
        Agenda.mount(user);
    },

    afterLogout() {
        App.user = null;
        if (Agenda.unmount) Agenda.unmount();
        App.showAuth();
    },

    navigate(route, params = {}) {
        if (route === 'auth')     { App.showAuth(); return; }
        if (route === 'agenda')   { Agenda.mount(App.user); return; }
        if (route === 'editor')   { Editor.mount(App.user, params); return; }
        if (route === 'calendar') { Calendar.mount(); return; }
        if (route === 'settings') { Settings.mount(); return; }
    },

    applyTheme, applyPalette, applyDensity,
};

// ----------------- boot -----------------
document.addEventListener('DOMContentLoaded', () => App.start());
