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

    const userData = { ...data.user, name: name, type: 'user' };
    this.saveSession(userData);
    return userData;
  },

  /** Log in an existing user */
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;

    // Fetch profile data
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // Self-healing: Create profile if missing
    if (!profile) {
      const { data: newProfile, error: pErr } = await supabase
        .from('profiles')
        .upsert({ id: data.user.id, full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0] })
        .select()
        .single();
      if (!pErr) profile = newProfile;
    }

    const userData = { 
      ...data.user, 
      name: profile?.full_name || data.user.email, 
      type: 'user',
      listData: profile?.list_data,
      storeData: profile?.store_data,
      ville: profile?.ville
    };
    this.saveSession(userData);
    return userData;
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
  },

  /** Save a list to the history table */
  async saveToHistory(listData, storeData) {
    const session = this.getSession();
    if (!session || session.type !== 'user') return;

    const stats = {
      total_price: listData.total_estime * 0.88, // Use optimized/discount multiplier for history
      items_count: listData.categories.reduce((acc, c) => acc + c.articles.length, 0),
      seasonal_score: Math.floor(Math.random() * 20) + 70 // Placeholder for real seasonal logic
    };

    const { error } = await supabase
      .from('shopping_history')
      .insert({
        user_id: session.id,
        list_data: listData,
        store_data: storeData,
        stats: stats
      });

    if (error) console.error("History save error:", error);
  },

  /** Fetch full history for the user */
  async getHistory() {
    const session = this.getSession();
    if (!session || session.type !== 'user') return [];

    const { data, error } = await supabase
      .from('shopping_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Fetch history error:", error);
      return [];
    }
    return data;
  }
};
