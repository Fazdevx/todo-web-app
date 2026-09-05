// =============================================================
//  auth.js  -  Helpers de sesion
// =============================================================
const Auth = {
    async getUser() { return getCurrentUser(); },
    async login(email, pwd) { return login(email, pwd); },
    async register(name, email, pwd) { return registerAccount(name, email, pwd); },
    async logout() { return logout(); },
};
