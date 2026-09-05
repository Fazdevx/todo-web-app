// =============================================================
//  api.js  -  Wrapper de Appwrite (DB + Auth + Realtime)
// =============================================================
const {
    Client, Account, Databases, Teams, Query, ID
} = Appwrite;

const client = new Client()
    .setEndpoint(CONFIG.APPWRITE_ENDPOINT)
    .setProject(CONFIG.APPWRITE_PROJECT_ID);

const account    = new Account(client);
const databases  = new Databases(client);
const teams      = new Teams(client);

// ----------------- Sesion -----------------
async function getCurrentUser() {
    try {
        const u = await account.get();
        const role = await resolveRole(u);
        return { id: u.$id, name: u.name, email: u.email, role };
    } catch (e) {
        return null;
    }
}

async function resolveRole(user) {
    // 1) prefs.role (si esta seteado)
    try {
        const prefs = await account.getPrefs();
        if (prefs?.role) {
            const r = String(prefs.role).toUpperCase();
            if (['ADMIN','WORKER','UNKNOWN'].includes(r)) return r;
        }
    } catch (_) {}
    // 2) membresia en team admins -> ADMIN
    try {
        const m = await teams.listMemberships(CONFIG.APPWRITE_TEAM_ADMINS);
        if (m.memberships?.some(x => x.userId === user.$id)) return 'ADMIN';
    } catch (_) {}
    // 3) membresia en team workers -> WORKER
    try {
        const m = await teams.listMemberships(CONFIG.APPWRITE_TEAM_WORKERS);
        if (m.memberships?.some(x => x.userId === user.$id)) return 'WORKER';
    } catch (_) {}
    return 'UNKNOWN';
}

async function createSession(email, password) {
    if (typeof account.createEmailPasswordSession === 'function') {
        return await account.createEmailPasswordSession(email, password);
    }
    return await account.createEmailSession(email, password);
}

async function login(email, password) {
    await createSession(email.trim(), password);
    return getCurrentUser();
}

async function registerAccount(name, email, password) {
    await account.create(ID.unique(), email.trim(), password, name.trim());
    await createSession(email.trim(), password);
    return getCurrentUser();
}

async function logout() {
    try { await account.deleteSession('current'); } catch (_) {}
}

const unsupportedTaskAttributes = new Set();

function taskToJson(t) {
    const json = {
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        subtasks: Array.isArray(t.subtasks) ? t.subtasks.join('\u001F') : (t.subtasks || ''),
        done: t.done,
        createdAt: t.createdAt,
        dueAt: t.dueAt,
        status: t.status,
        reminderOffsetMs: t.reminderOffsetMs,
        assignedTo: t.assignedTo,
        assignedToName: t.assignedToName,
        createdBy: t.createdBy,
        completedAt: t.completedAt,
    };

    for (const key of unsupportedTaskAttributes) {
        delete json[key];
    }
    return json;
}

function docToTask(d) {
    const createdTs = d.createdAt ? Number(d.createdAt) : (d.$createdAt ? new Date(d.$createdAt).getTime() : Date.now());
    return {
        id: d.$id,
        title: d.title || '',
        description: d.description || '',
        category: d.category || 'General',
        priority: d.priority ?? 0,
        subtasks: (d.subtasks || '').split('\u001F').filter(Boolean),
        done: d.done ?? false,
        createdAt: createdTs,
        dueAt: d.dueAt ?? null,
        status: d.status || 'PENDIENTE',
        reminderOffsetMs: d.reminderOffsetMs ?? 3 * 60 * 60 * 1000,
        assignedTo: d.assignedTo || '',
        assignedToName: d.assignedToName || '',
        createdBy: d.createdBy || '',
        completedAt: d.completedAt ?? null,
    };
}

async function loadTasks(userId, isAdmin) {
    try {
        const queries = [Query.orderDesc('$createdAt'), Query.limit(500)];
        if (!isAdmin) queries.push(Query.equal('assignedTo', userId));
        const res = await databases.listDocuments(
            CONFIG.APPWRITE_DB_ID,
            CONFIG.APPWRITE_TASKS_COLLECTION,
            queries
        );
        return res.documents.map(docToTask);
    } catch (e) {
        console.warn('loadTasks with $createdAt failed, trying fallback query', e);
        try {
            const queries = [Query.limit(500)];
            if (!isAdmin) queries.push(Query.equal('assignedTo', userId));
            const res = await databases.listDocuments(
                CONFIG.APPWRITE_DB_ID,
                CONFIG.APPWRITE_TASKS_COLLECTION,
                queries
            );
            const tasks = res.documents.map(docToTask);
            return tasks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        } catch (err) {
            console.error('loadTasks failed completely', err);
            return [];
        }
    }
}

async function createTask(task) {
    let payload = taskToJson(task);
    const perms = task.createdBy ? [
        `read("user:${task.createdBy}")`,
        `update("user:${task.createdBy}")`,
        `delete("user:${task.createdBy}")`,
    ] : undefined;

    let attempts = 0;
    while (attempts < 15) {
        attempts++;
        try {
            const d = await databases.createDocument(
                CONFIG.APPWRITE_DB_ID,
                CONFIG.APPWRITE_TASKS_COLLECTION,
                ID.unique(),
                payload,
                perms
            );
            return docToTask(d);
        } catch (e) {
            const match = e.message && e.message.match(/Unknown attribute:\s*"([^"]+)"/i);
            if (match && match[1]) {
                const unknownAttr = match[1];
                console.warn(`Appwrite collection schema missing attribute "${unknownAttr}". Stripping attribute and retrying...`);
                unsupportedTaskAttributes.add(unknownAttr);
                delete payload[unknownAttr];
            } else {
                if (perms && e.message && e.message.includes('permissions')) {
                    try {
                        const d = await databases.createDocument(
                            CONFIG.APPWRITE_DB_ID,
                            CONFIG.APPWRITE_TASKS_COLLECTION,
                            ID.unique(),
                            payload
                        );
                        return docToTask(d);
                    } catch (err2) {
                        console.error('createTask failed', err2);
                        throw err2;
                    }
                }
                console.error('createTask failed', e);
                throw e;
            }
        }
    }
    throw new Error('No se pudo crear la tarea');
}

async function updateTask(task) {
    let payload = taskToJson(task);
    let attempts = 0;
    while (attempts < 15) {
        attempts++;
        try {
            const d = await databases.updateDocument(
                CONFIG.APPWRITE_DB_ID,
                CONFIG.APPWRITE_TASKS_COLLECTION,
                task.id,
                payload
            );
            return docToTask(d);
        } catch (e) {
            const match = e.message && e.message.match(/Unknown attribute:\s*"([^"]+)"/i);
            if (match && match[1]) {
                const unknownAttr = match[1];
                console.warn(`Appwrite collection schema missing attribute "${unknownAttr}". Stripping attribute and retrying...`);
                unsupportedTaskAttributes.add(unknownAttr);
                delete payload[unknownAttr];
            } else {
                console.error('updateTask failed', e);
                throw e;
            }
        }
    }
    throw new Error('No se pudo actualizar la tarea');
}

async function deleteTask(task) {
    try {
        await databases.deleteDocument(
            CONFIG.APPWRITE_DB_ID,
            CONFIG.APPWRITE_TASKS_COLLECTION,
            task.id
        );
    } catch (e) { console.error('deleteTask failed', e); }
}

// ----------------- Notifications -----------------
async function loadNotifications(userId) {
    try {
        const res = await databases.listDocuments(
            CONFIG.APPWRITE_DB_ID,
            CONFIG.APPWRITE_NOTIFS_COLLECTION,
            [
                Query.equal('userId', userId),
                Query.orderDesc('$createdAt'),
                Query.limit(50),
            ]
        );
        return res.documents;
    } catch (e) {
        try {
            const res = await databases.listDocuments(
                CONFIG.APPWRITE_DB_ID,
                CONFIG.APPWRITE_NOTIFS_COLLECTION,
                [
                    Query.equal('userId', userId),
                    Query.limit(50),
                ]
            );
            return res.documents;
        } catch (_) {
            return [];
        }
    }
}

// ----------------- Realtime -----------------
function subscribeTasks(onChange) {
    const channel = `databases.${CONFIG.APPWRITE_DB_ID}.collections.${CONFIG.APPWRITE_TASKS_COLLECTION}.documents`;
    return client.subscribe(channel, msg => {
        const ev = msg.events?.[0] || '';
        if (ev.endsWith('.create'))   onChange({ type: 'create', task: docToTask(msg.payload) });
        if (ev.endsWith('.update'))   onChange({ type: 'update', task: docToTask(msg.payload) });
        if (ev.endsWith('.delete'))   onChange({ type: 'delete', id: msg.payload.$id });
    });
}
