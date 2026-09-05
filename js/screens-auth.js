// =============================================================
//  screens-auth.js  -  Login / Registro
// =============================================================
function renderAuth(mode = 'login') {
    return `
    <div class="auth-wrap">
        <form class="auth-card" id="auth-form" autocomplete="on">
            <h1 class="auth-title">📋 Agenda</h1>
            <p class="auth-sub">${mode === 'login' ? 'Iniciá sesión' : 'Crear cuenta'}</p>

            <div class="field" id="name-field" style="display:${mode === 'register' ? 'flex' : 'none'}">
                <label>Nombre</label>
                <input class="input" name="name" type="text" ${mode === 'register' ? 'required' : ''} placeholder="Tu nombre" />
            </div>

            <div class="field">
                <label>Email</label>
                <input class="input" name="email" type="email" required inputmode="email" placeholder="tu@email.com" />
            </div>

            <div class="field">
                <label>Contraseña</label>
                <input class="input" name="password" type="password" required minlength="8" placeholder="Mínimo 8 caracteres" />
            </div>

            <div class="auth-error" id="auth-error"></div>
            <div class="auth-info"  id="auth-info"></div>

            <button class="btn btn-block" type="submit" id="auth-submit" style="margin-top:12px">
                ${mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>

            <button class="btn btn-block btn-ghost" type="button" id="toggle-mode" style="margin-top:8px">
                ${mode === 'login' ? '¿No tenés cuenta? Crear una' : 'Ya tengo cuenta'}
            </button>
        </form>
    </div>`;
}

function bindAuth() {
    const form    = document.getElementById('auth-form');
    const errorEl = document.getElementById('auth-error');
    const infoEl  = document.getElementById('auth-info');
    const submit  = document.getElementById('auth-submit');
    const toggle  = document.getElementById('toggle-mode');
    const nameFld = document.getElementById('name-field');
    let mode = 'login';

    const updateMode = (m) => {
        mode = m;
        errorEl.textContent = '';
        infoEl.textContent = '';
        submit.textContent = m === 'login' ? 'Entrar' : 'Crear cuenta';
        toggle.textContent = m === 'login' ? '¿No tenés cuenta? Crear una' : 'Ya tengo cuenta';
        nameFld.style.display = m === 'register' ? 'flex' : 'none';
        const nameInput = form.querySelector('input[name="name"]');
        if (nameInput) nameInput.required = (m === 'register');
    };

    toggle.addEventListener('click', () => updateMode(mode === 'login' ? 'register' : 'login'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.textContent = '';
        infoEl.textContent  = mode === 'login' ? 'Conectando…' : 'Creando cuenta…';
        submit.disabled = true;

        const fd = new FormData(form);
        const email = String(fd.get('email') || '').trim();
        const pwd   = String(fd.get('password') || '');
        const name  = String(fd.get('name') || '').trim();

        try {
            if (mode === 'login') {
                await Auth.login(email, pwd);
            } else {
                await Auth.register(name, email, pwd);
            }
            const u = await Auth.getUser();
            if (!u) throw new Error('No se pudo obtener el usuario');
            if (u.role === 'UNKNOWN') {
                await Auth.logout();
                throw new Error('Tu cuenta no tiene rol asignado. Pedile al administrador que en Appwrite Cloud → Auth → Users → Preferences agregue {"role":"ADMIN"} o {"role":"WORKER"}.');
            }
            App.afterLogin(u);
        } catch (err) {
            errorEl.textContent = err.message || 'Error desconocido';
            infoEl.textContent  = '';
        } finally {
            submit.disabled = false;
        }
    });
}
