import { supabase } from '../supabase.js';

export const auth = {
  /** Get all registered users (Not used in Supabase auth, handled by Supabase) */
  getUsers() { return []; },

  /** Sign up a new user */
  async signup(name, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });
    if (error) throw error;
    
    // Create initial profile
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: name
    });

    return { ...data.user, name: name, type: 'user' };
  },

  /** Log in an existing user */
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;

    // Fetch profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return { 
      ...data.user, 
      name: profile?.full_name || data.user.email, 
      type: 'user',
      listData: profile?.list_data,
      storeData: profile?.store_data,
      ville: profile?.ville
    };
  },

  /** Continue as guest (Keeps local storage for now, or could use Supabase Anonymous) */
  continueAsGuest(name) {
    const guestUser = { id: 'guest-' + Date.now(), name, type: 'guest' };
    localStorage.setItem('panier_malin_session', JSON.stringify(guestUser));
    return guestUser;
  },

  /** Log out */
  async logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('panier_malin_session');
  },

  /** Get current session */
  getSession() {
    // Note: session restoration is better handled via await supabase.auth.getUser() on boot
    // but for the UI transition, we return a cached object or null
    return JSON.parse(localStorage.getItem('panier_malin_session') || 'null');
  },

  /** Helper to save session (Internal Supabase handles its own session in localstorage) */
  saveSession(user) {
    localStorage.setItem('panier_malin_session', JSON.stringify(user));
  },

  /** Update user data in both session and Supabase profile */
  async updateSessionData(data) {
    const session = this.getSession();
    if (!session) return;
    
    const updated = { ...session, ...data };
    this.saveSession(updated);

    if (session.type === 'user') {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.id,
          list_data: data.listData || session.listData,
          store_data: data.storeData || session.storeData,
          ville: data.ville || session.ville,
          updated_at: new Date().toISOString()
        });
      if (error) console.error("Supabase sync error:", error);
    }
  }
};
