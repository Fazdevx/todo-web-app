// =============================================================
//  config.js  -  Edita estos valores con los IDs de tu Appwrite
// =============================================================
window.CONFIG = {
    // Appwrite (consola -> Settings -> Endpoints / Project ID)
    APPWRITE_ENDPOINT: 'https://sfo.cloud.appwrite.io/v1',
    APPWRITE_PROJECT_ID: '6a9ae03900212553bc49',

    // Database y collections (pegar los IDs que devuelve setup_collections.ps1)
    APPWRITE_DB_ID: 'agenda',
    APPWRITE_TASKS_COLLECTION: '6a9ae6c6000fc548ad8a',
    APPWRITE_NOTIFS_COLLECTION: '6a9aea2a00227e8b1ecd',

    // Teams (opcional, para roles ADMIN/WORKER)
    APPWRITE_TEAM_ADMINS: 'admins',
    APPWRITE_TEAM_WORKERS: 'workers',

    // LocalStorage keys
    KEY_THEME_MODE: 'agenda.themeMode',
    KEY_PALETTE: 'agenda.palette',
    KEY_DENSITY: 'agenda.density',
    KEY_SOUND: 'agenda.sound',
    KEY_DAILY_HOUR: 'agenda.dailyHour',
};
