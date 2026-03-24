/**
 * auth.js – Simulateur d'authentification utilisant localStorage.
 */

const USERS_KEY = 'panier_malin_users';
const SESSION_KEY = 'panier_malin_session';

export const auth = {
  // --- Core Methods ---
  
  /** Get all registered users */
  getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  /** Sign up a new user */
  signup(name, email, password) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('Cet email est déjà utilisé.');
    }
    const newUser = { id: Date.now(), name, email, password, type: 'user' };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    this.saveSession(newUser);
    return newUser;
  },

  /** Log in an existing user */
  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Email ou mot de passe incorrect.');
    }
    this.saveSession(user);
    return user;
  },

  /** Continue as guest */
  continueAsGuest(name) {
    const guestUser = { id: 'guest-' + Date.now(), name, type: 'guest' };
    this.saveSession(guestUser);
    return guestUser;
  },

  /** Log out */
  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  /** Get current session */
  getSession() {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  },

  /** Helper to save session */
  saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  /** Update user data in both session and user list */
  updateSessionData(data) {
    const session = this.getSession();
    if (!session) return;
    
    const updated = { ...session, ...data };
    this.saveSession(updated);

    if (session.type === 'user') {
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === session.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...data };
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
    }
  }
};
