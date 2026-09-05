import { Client, Account, Databases, Teams, Query, ID } from 'appwrite';

export const CONFIG = {
  APPWRITE_ENDPOINT: 'https://sfo.cloud.appwrite.io/v1',
  APPWRITE_PROJECT_ID: '6a9ae03900212553bc49',
  APPWRITE_DB_ID: 'agenda',
  APPWRITE_TASKS_COLLECTION: '6a9ae6c6000fc548ad8a',
  APPWRITE_NOTIFS_COLLECTION: '6a9aea2a00227e8b1ecd',
  APPWRITE_TEAM_ADMINS: 'admins',
  APPWRITE_TEAM_WORKERS: 'workers',
};

const client = new Client()
  .setEndpoint(CONFIG.APPWRITE_ENDPOINT)
  .setProject(CONFIG.APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const teams = new Teams(client);

// ---------------- Authentication ----------------
export async function getCurrentUser() {
  try {
    const u = await account.get();
    const role = await resolveRole(u);
    return { id: u.$id, name: u.name || u.email.split('@')[0], email: u.email, role };
  } catch {
    return null;
  }
}

export async function resolveRole(user) {
  // 1) Prefs role
  try {
    const prefs = await account.getPrefs();
    if (prefs?.role) {
      const r = String(prefs.role).toUpperCase();
      if (['ADMIN', 'WORKER', 'UNKNOWN'].includes(r)) return r;
    }
  } catch {}

  // 2) Membership in admins team
  try {
    const m = await teams.listMemberships(CONFIG.APPWRITE_TEAM_ADMINS);
    if (m.memberships?.some((x) => x.userId === user.$id)) return 'ADMIN';
  } catch {}

  // 3) Membership in workers team
  try {
    const m = await teams.listMemberships(CONFIG.APPWRITE_TEAM_WORKERS);
    if (m.memberships?.some((x) => x.userId === user.$id)) return 'WORKER';
  } catch {}

  return 'WORKER'; // Default to WORKER if role is not set
}

async function createAuthSession(email, password) {
  if (typeof account.createEmailPasswordSession === 'function') {
    return await account.createEmailPasswordSession(email, password);
  }
  return await account.createEmailSession(email, password);
}

export async function login(email, password) {
  await createAuthSession(email.trim(), password);
  return getCurrentUser();
}

export async function registerAccount(name, email, password) {
  await account.create(ID.unique(), email.trim(), password, name.trim());
  await createAuthSession(email.trim(), password);
  return getCurrentUser();
}

export async function logout() {
  try {
    await account.deleteSession('current');
  } catch {}
}

// ---------------- Tasks (Self-Healing) ----------------
const unsupportedAttributes = new Set();

export function taskToJson(t) {
  const json = {
    title: t.title,
    description: t.description || '',
    category: t.category || 'General',
    priority: t.priority ?? 1,
    subtasks: Array.isArray(t.subtasks) ? t.subtasks.join('\u001F') : (t.subtasks || ''),
    done: t.done ?? false,
    createdAt: t.createdAt || Date.now(),
    dueAt: t.dueAt || null,
    status: t.status || 'PENDIENTE',
    reminderOffsetMs: t.reminderOffsetMs ?? 3 * 60 * 60 * 1000,
    assignedTo: t.assignedTo || '',
    assignedToName: t.assignedToName || '',
    createdBy: t.createdBy || '',
    completedAt: t.completedAt || null,
  };

  for (const key of unsupportedAttributes) {
    delete json[key];
  }
  return json;
}

export function docToTask(d) {
  const createdTs = d.createdAt
    ? Number(d.createdAt)
    : (d.$createdAt ? new Date(d.$createdAt).getTime() : Date.now());

  return {
    id: d.$id,
    title: d.title || 'Sin título',
    description: d.description || '',
    category: d.category || 'General',
    priority: d.priority ?? 1,
    subtasks: typeof d.subtasks === 'string' ? d.subtasks.split('\u001F').filter(Boolean) : (Array.isArray(d.subtasks) ? d.subtasks : []),
    done: d.done ?? false,
    createdAt: createdTs,
    dueAt: d.dueAt ?? null,
    status: d.status || (d.done ? 'COMPLETADA' : 'PENDIENTE'),
    reminderOffsetMs: d.reminderOffsetMs ?? 3 * 60 * 60 * 1000,
    assignedTo: d.assignedTo || '',
    assignedToName: d.assignedToName || '',
    createdBy: d.createdBy || '',
    completedAt: d.completedAt ?? null,
  };
}

export async function loadTasks(userId, isAdmin) {
  try {
    const queries = [Query.orderDesc('$createdAt'), Query.limit(500)];
    if (!isAdmin) {
      queries.push(Query.equal('assignedTo', userId));
    }
    const res = await databases.listDocuments(
      CONFIG.APPWRITE_DB_ID,
      CONFIG.APPWRITE_TASKS_COLLECTION,
      queries
    );
    return res.documents.map(docToTask);
  } catch {
    // Fallback: list without orderDesc and sort client-side
    try {
      const queries = [Query.limit(500)];
      if (!isAdmin) {
        queries.push(Query.equal('assignedTo', userId));
      }
      const res = await databases.listDocuments(
        CONFIG.APPWRITE_DB_ID,
        CONFIG.APPWRITE_TASKS_COLLECTION,
        queries
      );
      const tasks = res.documents.map(docToTask);
      return tasks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (err) {
      console.error('loadTasks failed', err);
      return [];
    }
  }
}

export async function createTask(task) {
  let payload = taskToJson(task);
  let attempts = 0;
  while (attempts < 15) {
    attempts++;
    try {
      const d = await databases.createDocument(
        CONFIG.APPWRITE_DB_ID,
        CONFIG.APPWRITE_TASKS_COLLECTION,
        ID.unique(),
        payload
      );
      return docToTask(d);
    } catch (e) {
      const match = e.message && e.message.match(/Unknown attribute:\s*"([^"]+)"/i);
      if (match && match[1]) {
        const unknownAttr = match[1];
        unsupportedAttributes.add(unknownAttr);
        delete payload[unknownAttr];
      } else {
        console.error('createTask error', e);
        throw e;
      }
    }
  }
  throw new Error('No se pudo crear la tarea por límites del esquema');
}

export async function updateTask(task) {
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
        unsupportedAttributes.add(unknownAttr);
        delete payload[unknownAttr];
      } else {
        console.error('updateTask error', e);
        throw e;
      }
    }
  }
  throw new Error('No se pudo actualizar la tarea');
}

export async function deleteTask(taskId) {
  try {
    await databases.deleteDocument(
      CONFIG.APPWRITE_DB_ID,
      CONFIG.APPWRITE_TASKS_COLLECTION,
      taskId
    );
  } catch (e) {
    console.error('deleteTask error', e);
  }
}

// Realtime WebSocket Subscription
export function subscribeTasks(onChange) {
  const channel = `databases.${CONFIG.APPWRITE_DB_ID}.collections.${CONFIG.APPWRITE_TASKS_COLLECTION}.documents`;
  return client.subscribe(channel, (msg) => {
    const ev = msg.events?.[0] || '';
    if (ev.endsWith('.create')) onChange({ type: 'create', task: docToTask(msg.payload) });
    if (ev.endsWith('.update')) onChange({ type: 'update', task: docToTask(msg.payload) });
    if (ev.endsWith('.delete')) onChange({ type: 'delete', id: msg.payload.$id });
  });
}
