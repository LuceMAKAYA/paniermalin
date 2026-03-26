import { supabase } from '../supabase.js';

/**
 * API pour la gestion des familles et membres
 */
export const family = {
  /**
   * Créer une nouvelle famille
   */
  async createFamily(name, userId) {
    // 1. Générer un code d'invitation unique (ex: ABCD-1234)
    const code = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();

    // 2. Insérer la famille
    const { data: fam, error } = await supabase
      .from('families')
      .insert({ name, invite_code: code })
      .select()
      .single();

    if (error) throw error;

    // 3. Ajouter le créateur comme admin
    const { error: memError } = await supabase
      .from('family_members')
      .insert({
        family_id: fam.id,
        user_id: userId,
        role: 'admin'
      });
    
    if (memError) throw memError;

    return fam;
  },

  /**
   * Rejoindre une famille via code d'invitation
   */
  async joinFamily(inviteCode, userId) {
    // 1. Trouver la famille via le code
    const { data: fam, error: famErr } = await supabase
      .from('families')
      .select('id, name')
      .eq('invite_code', inviteCode)
      .single();

    if (famErr || !fam) throw new Error('Code d\'invitation invalide');

    // 2. Ajouter le membre
    const { error: memErr } = await supabase
      .from('family_members')
      .insert({
        family_id: fam.id,
        user_id: userId,
        role: 'member'
      });

    if (memErr) {
      if (memErr.code === '23505') throw new Error('Vous faites déjà partie de cette famille');
      throw memErr;
    }

    return fam;
  },

  /**
   * Récupère la famille de l'utilisateur
   */
  async getUserFamily(userId) {
    const { data, error } = await supabase
      .from('family_members')
      .select(`
        family_id,
        families ( id, name, invite_code )
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.families || null;
  },

  /**
   * Récupère les membres d'une famille
   */
  async getFamilyMembers(familyId) {
    const { data, error } = await supabase
      .from('family_members')
      .select(`
        id, role,
        profiles ( id, full_name, avatar_url )
      `)
      .eq('family_id', familyId);

    if (error) throw error;
    return data.map(m => ({
      id: m.profiles.id,
      name: m.profiles.full_name,
      avatar: m.profiles.avatar_url,
      role: m.role
    }));
  }
};
