import { supabase } from '../supabase.js';

/**
 * promos.js - API pour gérer les promotions en temps réel.
 */
export const promosApi = {
  /**
   * Récupère les promotions actives.
   * On peut filtrer par ville si besoin.
   */
  async getActivePromos(city = null) {
    let query = supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (city) {
      query = query.eq('city', city);
    }

    const { data, error } = await query.limit(10);
    if (error) {
      console.error("Error fetching promos:", error);
      return [];
    }
    return data;
  },

  /**
   * Ajoute une nouvelle promotion découverte.
   */
  async addPromo(promoData) {
    const { data, error } = await supabase
      .from('promotions')
      .insert([promoData])
      .select();

    if (error) {
      console.error("Error adding promo:", error);
      return null;
    }
    return data[0];
  }
};
