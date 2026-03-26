import { supabase } from '../supabase.js';

/**
 * API pour la gestion des listes de courses et des articles (Schéma Relationnel)
 */
export const shopping = {
  /**
   * Enregistre une liste complète dans Supabase
   * @param {Object} listData Données de la liste (categories, total_estime, etc.)
   * @param {string} userId ID de l'utilisateur (auto via auth si null)
   * @param {string} familyId ID de la famille optionnel
   */
  async saveActiveList(listData, userId, familyId = null) {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }
    if (!userId) throw new Error('Utilisateur non connecté');

    // 1. Créer la liste de courses
    const { data: list, error: listError } = await supabase
      .from('shopping_lists')
      .insert({
        user_id: userId,
        family_id: familyId,
        title: `Liste du ${new Date().toLocaleDateString('fr-FR')}`,
        total_budget: listData.budget_goal || 150,
        season_month: new Date().getMonth() + 1,
        status: 'active'
      })
      .select()
      .single();

    if (listError) throw listError;

    // 2. Préparer les articles pour insertion en masse
    const items = [];
    listData.categories.forEach(cat => {
      cat.articles.forEach(art => {
        items.push({
          list_id: list.id,
          name: art.nom,
          emoji: cat.emoji,
          category: cat.nom,
          quantity: art.quantite,
          unit_price: Math.round((art.prix_estime || 0) * 100), // En centimes
          is_seasonal: !!art.is_seasonal,
          is_auto_added: true
        });
      });
    });

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('list_items')
        .insert(items);
      if (itemsError) throw itemsError;
    }

    return list;
  },

  /**
   * Récupère la dernière liste active de l'utilisateur avec ses articles
   */
  async getActiveList(userId) {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }
    if (!userId) return null;

    // Récupérer la liste la plus récente
    const { data: list, error: listError } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (listError || !list) return null;

    // Récupérer les articles associés
    const { data: items, error: itemsError } = await supabase
      .from('list_items')
      .select('*')
      .eq('list_id', list.id)
      .order('position', { ascending: true });

    if (itemsError) throw itemsError;

    // Reformater pour le store (format categories)
    const categorized = {};
    items.forEach(item => {
      if (!categorized[item.category]) {
        categorized[item.category] = { nom: item.category, emoji: item.emoji, articles: [] };
      }
      categorized[item.category].articles.push({
        id: item.id,
        nom: item.name,
        quantite: item.quantity,
        prix_estime: item.unit_price / 100,
        done: item.is_checked
      });
    });

    return {
      id: list.id,
      title: list.title,
      total_estime: items.reduce((acc, i) => acc + (i.unit_price / 100), 0),
      categories: Object.values(categorized)
    };
  },

  /**
   * Toggle le statut d'un article
   */
  async toggleItem(itemId, isChecked, userId) {
    const { error } = await supabase
      .from('list_items')
      .update({ 
        is_checked: isChecked,
        checked_by: userId,
        checked_at: isChecked ? new Date().toISOString() : null
      })
      .eq('id', itemId);
    
    if (error) throw error;
  },

  /**
   * Ferme une liste (marqué comme terminée)
   */
  async completeList(listId, actualSpent) {
    const { error } = await supabase
      .from('shopping_lists')
      .update({ 
        status: 'completed',
        actual_spent: Math.round(actualSpent * 100)
      })
      .eq('id', listId);
    
    if (error) throw error;
  },
  /**
   * S'abonne aux changements temps réel d'une liste
   */
  subscribeToList(listId, onUpdate) {
    return supabase
      .channel(`list-items-${listId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'list_items', 
        filter: `list_id=eq.${listId}` 
      }, (payload) => {
        onUpdate(payload);
      })
      .subscribe();
  }
};
