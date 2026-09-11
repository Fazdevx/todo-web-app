import { Client, Account, Databases, Teams, Query, ID, Storage } from 'appwrite';

export const CONFIG = {
  APPWRITE_ENDPOINT: 'https://sfo.cloud.appwrite.io/v1',
  APPWRITE_PROJECT_ID: '6a9ae03900212553bc49',
  APPWRITE_DB_ID: 'agenda',
  APPWRITE_TASKS_COLLECTION: '6a9ae6c6000fc548ad8a',
  APPWRITE_NOTIFS_COLLECTION: '6a9aea2a00227e8b1ecd',
  APPWRITE_TEAM_ADMINS: 'admins',
  APPWRITE_TEAM_WORKERS: 'workers',
  // Real bucket id from the Appwrite console (the old hardcoded name
  // 'galileo-files' does not exist -> 404 on every upload):
  // https://appwrite.io/projects/6a9ae03900212553bc49/storage/6aa3167a000dc5934fa6
  APPWRITE_BUCKET_ID: '6aa3167a000dc5934fa6',
};

const client = new Client()
  .setEndpoint(CONFIG.APPWRITE_ENDPOINT)
  .setProject(CONFIG.APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const teams = new Teams(client);
export const storage = new Storage(client);

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

// Some collections were created with a typo'd "prority" attribute instead of
// the canonical "priority". We detect the real attribute name from loaded
// documents and fall back to whichever spelling the server actually accepts.
let priorityAttr = null;

// The set of attribute names the live collection really exposes, learned from
// the documents we read. The legacy collection uses "prority" + "attachments"
// and has NO "createdAt"; the canonical one has "priority" + "createdAt".
// Appwrite answers 400 ("Unknown attribute: <name>") when a payload contains a
// key the schema does not define, so once we know the schema we only ever write
// keys that we have actually seen on a real document.
let knownAttributes = null; // Set<string> | null

function learnSchema(doc) {
  if (!doc || typeof doc !== 'object') return;
  if (!knownAttributes) knownAttributes = new Set();
  for (const key of Object.keys(doc)) {
    if (key.startsWith('$')) continue; // $id, $createdAt, ... are server-managed
    knownAttributes.add(key);
  }
  if (knownAttributes.has('priority')) priorityAttr = 'priority';
  else if (knownAttributes.has('prority')) priorityAttr = 'prority';
}

const SCHEMA_MAX = {
  title: 200,
  description: 2000,
  category: 100,
  subtasks: 5000,
  status: 30,
  assignedTo: 64,
  assignedToName: 200,
  createdBy: 64,
};

// Attributes the server will not let us remove (required by the schema).
const REQUIRED_ATTRS = new Set(['title', 'createdAt', 'createdBy']);

// Optional attributes we may shed if the server rejects the whole payload.
const OPTIONAL_FALLBACK = [
  'prority',
  'priority',
  'reminderOffsetMs',
  'status',
  'dueAt',
  'completedAt',
  'assignedToName',
  'assignedTo',
  'subtasks',
  'description',
  'category',
];

function clampString(value, max) {
  const s = value == null ? '' : String(value);
  return s.length > max ? s.slice(0, max) : s;
}

function coerceInt(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

// Inspects an Appwrite write error. If the payload can be repaired by removing
// (or renaming) a rejected attribute, it mutates `payload` and returns true so
// the caller can retry. Otherwise it logs the full error and returns false.
function resolveWriteError(e, payload, label) {
  const msg = String((e && (e.message || e.error)) || '');
  const code = e && e.code;

  // 1) The server explicitly names an unknown attribute -> drop it and retry.
  const unknownMatch = msg.match(/unknown attribute[:\s]+"?([\w$]+)"?/i);
  if (unknownMatch && unknownMatch[1]) {
    const attr = unknownMatch[1];
    unsupportedAttributes.add(attr);
    if (attr === 'priority') priorityAttr = 'prority';
    if (attr === 'prority') priorityAttr = 'priority';
    delete payload[attr];
    console.warn(`[${label}] Unknown attribute "${attr}" removed. Retrying...`);
    return true;
  }

  if (code === 400 || /400|bad request/i.test(msg)) {
    // 2) The error mentions a specific attribute -> drop it when optional.
    const attrMatch = msg.match(/attribute\s+"?([\w$]+)"?/i);
    if (attrMatch && attrMatch[1] && attrMatch[1] in payload && !REQUIRED_ATTRS.has(attrMatch[1])) {
      const attr = attrMatch[1];
      unsupportedAttributes.add(attr);
      delete payload[attr];
      console.warn(`[${label}] Dropping optional attribute "${attr}" after 400: ${msg}`);
      return true;
    }

    // 3) No attribute named -> shed optional attributes one at a time.
    const fallback = OPTIONAL_FALLBACK.find((k) => k in payload && !unsupportedAttributes.has(k));
    if (fallback) {
      unsupportedAttributes.add(fallback);
      delete payload[fallback];
      console.warn(`[${label}] 400 without attribute name. Dropping optional "${fallback}" and retrying. Server said: ${msg}`);
      return true;
    }

    console.error(`[${label}] 400 Bad Request`, {
      message: msg,
      code,
      payload: JSON.stringify(payload, null, 2),
    });
  } else {
    console.error(`[${label}] request failed`, e);
  }
  return false;
}

export function taskToJson(t, { patch = false } = {}) {
  // In patch mode (used by updates) only attributes the caller actually
  // provided get included. Otherwise an attachment-only update would
  // overwrite title/description/status/etc. with their default values.
  const has = (key) => Object.prototype.hasOwnProperty.call(t, key);
  const json = {};
  const set = (key, value) => {
    if (!patch || has(key)) json[key] = value;
  };

  set('title', clampString(t.title, SCHEMA_MAX.title));
  set('description', clampString(t.description, SCHEMA_MAX.description));
  set('category', clampString(t.category || 'General', SCHEMA_MAX.category));
  set(priorityAttr || 'priority', coerceInt(t.priority, 1));
  set('subtasks', clampString(Array.isArray(t.subtasks) ? t.subtasks.join('\u001F') : (t.subtasks || ''), SCHEMA_MAX.subtasks));
  set('done', Boolean(t.done ?? false));
  set('createdAt', coerceInt(t.createdAt, Date.now()));
  set('status', clampString(t.status || 'PENDIENTE', SCHEMA_MAX.status));
  set('assignedTo', clampString(t.assignedTo, SCHEMA_MAX.assignedTo));
  set('assignedToName', clampString(t.assignedToName, SCHEMA_MAX.assignedToName));
  set('createdBy', clampString(t.createdBy, SCHEMA_MAX.createdBy));

  // Only include optional integer fields when they hold a real value
  // (Appwrite rejects null/invalid values for integer attributes).
  const dueAt = coerceInt(t.dueAt, null);
  if (dueAt !== null) json.dueAt = dueAt;
  const completedAt = coerceInt(t.completedAt, null);
  if (completedAt !== null) json.completedAt = completedAt;

  // Attachments are stored as an array of file IDs (the live collection has a
  // string[] "attachments" attribute; objects are rejected by Appwrite).
  if (Array.isArray(t.attachments)) {
    set('attachments', t.attachments
      .map((a) => (typeof a === 'string' ? a : a?.id))
      .filter(Boolean));
  }

  for (const key of unsupportedAttributes) {
    delete json[key];
  }

  // Once the collection schema is known, drop anything it does not define so
  // Appwrite never answers 400 for an unknown attribute (e.g. legacy
  // collections have no "createdAt").
  if (knownAttributes) {
    for (const key of Object.keys(json)) {
      if (!knownAttributes.has(key)) delete json[key];
    }
  }
  return json;
}

export async function docToTask(d) {
  // Learn the collection schema (attribute names + real priority spelling)
  // from the documents we read.
  learnSchema(d);

  const createdTs = d.createdAt
    ? Number(d.createdAt)
    : (d.$createdAt ? new Date(d.$createdAt).getTime() : Date.now());

  const attachments = Array.isArray(d.attachments) ? d.attachments : [];
  const resolved = await Promise.all(
    attachments.map((aid) => (typeof aid === 'string' ? getFileMeta(aid) : Promise.resolve(aid)))
  );
  const clean = resolved.filter(Boolean);

  return {
    id: d.$id,
    title: d.title || 'Sin título',
    description: d.description || '',
    category: d.category || 'General',
    priority: typeof d.priority === 'number' ? d.priority : (typeof d.prority === 'number' ? d.prority : 1),
    subtasks: typeof d.subtasks === 'string' ? d.subtasks.split('\u001F').filter(Boolean) : (Array.isArray(d.subtasks) ? d.subtasks : []),
    done: d.done ?? false,
    createdAt: createdTs,
    dueAt: d.dueAt ?? null,
    status: d.status || (d.done ? 'COMPLETADA' : 'PENDIENTE'),
    assignedTo: d.assignedTo || '',
    assignedToName: d.assignedToName || '',
    createdBy: d.createdBy || '',
    completedAt: d.completedAt ?? null,
    attachments: clean,
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
    const mapped = await Promise.all(res.documents.map(docToTask));
    return mapped;
  } catch {
    try {
      const queries = [Query.limit(500)];
      const res = await databases.listDocuments(
        CONFIG.APPWRITE_DB_ID,
        CONFIG.APPWRITE_TASKS_COLLECTION,
        queries
      );
      const mapped = await Promise.all(res.documents.map(docToTask));
      return mapped.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (err) {
      console.error('loadTasks failed', err);
      return [];
    }
  }
}

export async function createTask(task) {
  const payload = taskToJson(task);
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
      if (resolveWriteError(e, payload, 'createTask')) continue;
      throw e;
    }
  }
  throw new Error('No se pudo crear la tarea por límites del esquema');
}

export async function updateTask(task) {
  // Patch semantics: only send the fields the caller provided, so
  // attachment updates never wipe title/status/etc.
  const payload = taskToJson(task, { patch: true });
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
      if (resolveWriteError(e, payload, 'updateTask')) continue;
      throw e;
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
  return client.subscribe(channel, async (msg) => {
    const ev = msg.events?.[0] || '';
    if (ev.endsWith('.create')) {
      const task = await docToTask(msg.payload);
      onChange({ type: 'create', task });
    }
    if (ev.endsWith('.update')) {
      const task = await docToTask(msg.payload);
      onChange({ type: 'update', task });
    }
    if (ev.endsWith('.delete')) onChange({ type: 'delete', id: msg.payload.$id });
  });
}

// ---------------- Storage ----------------
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (Appwrite limit)
const MAX_OPTIMIZED_SIZE = 8 * 1024 * 1024; // 8MB target for free plan

export async function uploadFile(file, onProgress) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`El archivo excede 50MB (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
  }

  const fileId = ID.unique();
  const optimizedFile = await optimizeFile(file);

  const xhr = new XMLHttpRequest();
  const uploadPromise = new Promise((resolve, reject) => {
    // Standard XHR upload-progress event. (xhr.upload is a non-standard,
    // deprecated property that does not exist in most browsers.)
    xhr.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });
    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    // Appwrite v2: create the file at the collection endpoint and pass the id
    // as a multipart form field (POST .../files/{fileId} is not a v2 route).
    xhr.open('POST', `${CONFIG.APPWRITE_ENDPOINT}/storage/buckets/${CONFIG.APPWRITE_BUCKET_ID}/files`);
    xhr.setRequestHeader('X-Appwrite-Project', CONFIG.APPWRITE_PROJECT_ID);
    xhr.setRequestHeader('X-Appwrite-Response-Format', '1.5.0');

    const formData = new FormData();
    formData.append('fileId', fileId);
    formData.append('file', optimizedFile);
    xhr.send(formData);
  });

  const fileDoc = await uploadPromise;
  return {
    id: fileDoc.$id,
    name: optimizedFile.name,
    size: optimizedFile.size,
    mimeType: optimizedFile.type,
    originalSize: file.size,
    url: getFileUrl(fileDoc.$id),
  };
}

export async function deleteFile(fileId) {
  await storage.deleteFile(CONFIG.APPWRITE_BUCKET_ID, fileId);
}

export function getFileUrl(fileId) {
  // CONFIG.APPWRITE_ENDPOINT already ends with /v1
  return `${CONFIG.APPWRITE_ENDPOINT}/storage/buckets/${CONFIG.APPWRITE_BUCKET_ID}/files/${fileId}/view`;
}

export function getFileDownloadUrl(fileId) {
  return `${CONFIG.APPWRITE_ENDPOINT}/storage/buckets/${CONFIG.APPWRITE_BUCKET_ID}/files/${fileId}?project=${CONFIG.APPWRITE_PROJECT_ID}`;
}

export async function getFileMeta(fileId) {
  try {
    const f = await storage.getFile(CONFIG.APPWRITE_BUCKET_ID, fileId);
    return {
      id: f.$id,
      name: f.name,
      size: f.sizeOriginal || f.size || 0,
      mimeType: f.mimeType,
      url: getFileUrl(f.$id),
    };
  } catch {
    return null;
  }
}

async function optimizeFile(file) {
  if (file.type.startsWith('image/')) {
    return optimizeImage(file);
  }
  if (file.type === 'application/pdf') {
    return optimizePdf(file);
  }
  return file;
}

function optimizeImage(file) {
  // Client-side re-encode is best-effort: canvas.toBlob / new Image() are not
  // standard browser APIs, so on any failure we fall back to the ORIGINAL file
  // instead of crashing the upload.
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        try {
          const maxWidth = 1920;
          const maxHeight = 1920;
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          if (typeof canvas.toBlob !== 'function') {
            // Not available: upload the original image untouched.
            return resolve(file);
          }
          canvas.toBlob(
            (blob) => {
              const optimized = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, '.webp'),
                { type: 'image/webp' }
              );
              resolve(optimized);
            },
            'image/webp',
            0.75
          );
        } catch {
          resolve(file);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    } catch {
      resolve(file);
    }
  });
}

function optimizePdf(file) {
  if (file.size > MAX_OPTIMIZED_SIZE) {
    console.warn(`PDF ${file.name} is ${(file.size / 1024 / 1024).toFixed(1)}MB. Client-side PDF optimization requires pdf-lib. Consider compressing before upload.`);
  }
  return Promise.resolve(file);
}
