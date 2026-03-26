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

    if (error) {
      console.error("Signup error details:", error);
      throw error;
    }

    // No manual profiles upsert here to avoid conflicts with triggers
    // The login() function handles self-healing if the profile is missing
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
      const updateData = {
        updated_at: new Date().toISOString()
      };
      if (data.full_name || data.name) updateData.full_name = data.full_name || data.name;
      if (data.city || data.ville) updateData.city = data.city || data.ville;
      if (data.address) updateData.address = data.address;
      if (data.avatar_url) updateData.avatar_url = data.avatar_url;
      if (data.listData) updateData.list_data = data.listData;
      if (data.storeData) updateData.store_data = data.storeData;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.id,
          ...updateData
        });
      if (error) console.error("Supabase sync error:", error);
    }
  }

};
