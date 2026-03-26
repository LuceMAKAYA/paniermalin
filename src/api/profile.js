import { supabase } from '../supabase.js';

/**
 * API pour la gestion du profil utilisateur et des préférences alimentaires
 */
export const profile = {
  /**
   * Récupère le profil public d'un utilisateur
   */
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Met à jour les informations de base du profil
   */
  async updateProfile(userId, profileData) {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        address: profileData.address,
        city: profileData.city,
        latitude: profileData.latitude,
        longitude: profileData.longitude,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  },

  /**
   * Récupère les préférences alimentaires
   */
  async getFoodPreferences(userId) {
    const { data, error } = await supabase
      .from('food_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Met à jour ou crée les préférences alimentaires
   */
  async updateFoodPreferences(userId, prefs) {
    // On utilise upsert pour créer ou mettre à jour
    const { error } = await supabase
      .from('food_preferences')
      .upsert({
        user_id: userId,
        household_size: prefs.household_size || 2,
        dietary_regime: prefs.dietary_regime || ['omnivore'],
        cuisines: prefs.cuisines || ['francaise'],
        extra_categories: prefs.extra_categories || [],
        pets: prefs.pets || [],
        budget_profile: prefs.budget_profile || 'equilibre',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) throw error;
  }
};
