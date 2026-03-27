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
        title: listData.title || `Liste du ${new Date().toLocaleDateString('fr-FR')}`,
        total_budget: Number(listData.total_budget || listData.budget_goal || 0),
        season_month: new Date().getMonth() + 1,
        status: 'active',
        store_name: listData.store_name || null,
        store_address: listData.store_address || null
      })
      .select()
      .single();

    if (listError) throw listError;

    // 2. Préparer les articles pour insertion en masse
    const items = [];
    if (listData.categories && Array.isArray(listData.categories)) {
      listData.categories.forEach(cat => {
        if (cat.articles && Array.isArray(cat.articles)) {
          cat.articles.forEach(art => {
            items.push({
              list_id: list.id,
              name: art.nom,
              emoji: cat.emoji || '📦',
              category: cat.nom,
              quantity: art.quantite || '1',
              unit_price: Math.round((art.prix_estime || 0) * 100), // En centimes
              is_seasonal: !!art.is_seasonal,
              is_auto_added: true
            });
          });
        }
      });
    }

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
  async getActiveList(userId, familyId = null) {
    if (!userId && !familyId) return null;

    let query = supabase
      .from('shopping_lists')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (familyId) {
      query = query.eq('family_id', familyId);
    } else {
      // Fix #3: correctly use userId when no family
      if (!userId) return null;
      query = query.eq('user_id', userId);
    }

    const { data: list, error: listError } = await query.maybeSingle();
    if (listError || !list) return null;

    // Récupérer les articles associés
    const { data: items, error: itemsError } = await supabase
      .from('list_items')
      .select('*')
      .eq('list_id', list.id)
      .order('created_at', { ascending: true });

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
        done: item.is_checked,
        is_seasonal: item.is_seasonal
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
   * Récupère une liste spécifique avec tous ses articles (Lecture seule)
   */
  async getListWithItems(listId) {
    const { data: list, error: listError } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('id', listId)
      .single();

    if (listError || !list) return null;

    const { data: items, error: itemsError } = await supabase
      .from('list_items')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: true });

    if (itemsError) throw itemsError;

    // Categoriser
    const categorized = {};
    items.forEach(item => {
      const cat = item.category || 'Autres';
      if (!categorized[cat]) {
        categorized[cat] = { nom: cat, emoji: item.emoji || '📦', articles: [] };
      }
      categorized[cat].articles.push({
        id: item.id,
        nom: item.name,
        quantite: item.quantity,
        prix_estime: item.unit_price / 100,
        done: item.is_checked
      });
    });

    return {
      ...list,
      total_estime: items.reduce((acc, i) => acc + (i.unit_price / 100), 0),
      categories: Object.values(categorized)
    };
  },

  /**
   * Récupère l'historique complet des listes
   */
  async getHistory(userId, familyId = null) {
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }
    if (!userId && !familyId) return [];

    let query = supabase
      .from('shopping_lists')
      .select('*');
    
    if (familyId) {
      query = query.eq('family_id', familyId);
    } else {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Ferme une liste (marqué comme terminée)
   */
  async completeList(listId, actualSpent) {
    // 1. Get the list data to archive it
    const { data: list } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('id', listId)
      .single();

    if (!list) throw new Error('Liste introuvable');

    // 2. Mark as completed
    const { error: updateError } = await supabase
      .from('shopping_lists')
      .update({ 
        status: 'completed',
        actual_spent: Math.round(actualSpent * 100)
      })
      .eq('id', listId);
    
    if (updateError) throw updateError;

    // 3. Calculate seasonal percentage for the archive
    let seasonal_pct = 85;
    if (list.categories) {
      const all = list.categories.flatMap(c => c.articles || []);
      if (all.length > 0) {
        const seasonal = all.filter(a => a.is_seasonal).length;
        seasonal_pct = Math.round((seasonal / all.length) * 100);
      }
    }

    // 4. Archive into weekly_spending (Phase 5 + 9)
    const { error: spendError } = await supabase
      .from('weekly_spending')
      .insert({
        user_id: list.user_id,
        family_id: list.family_id,
        week_start: new Date().toISOString().split('T')[0],
        total_budget: list.total_budget,
        actual_spent: Math.round(actualSpent * 100),
        seasonal_pct,
        store_name: list.store_name,
        store_address: list.store_address
      });

    if (spendError) console.error("Error archiving to weekly_spending:", spendError);
  },
  /**
   * Récupère les stats de dépenses hebdomadaires
   */
  // Fix #2: accept familyId as second param and filter by it when present
  async getWeeklySpending(userId, familyId = null) {
    if (!userId && !familyId) return [];
    
    let query = supabase
      .from('weekly_spending')
      .select('*')
      .order('week_start', { ascending: true })
      .limit(4);

    if (familyId) {
      query = query.eq('family_id', familyId);
    } else {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  /**
   * Récupère les dernières activités de la liste (cochage d'articles)
   */
  async getRecentActivity(listId) {
    if (!listId) return [];
    const { data, error } = await supabase
      .from('list_items')
      .select(`
        id, name, is_checked, updated_at,
        profiles!list_items_checked_by_fkey ( full_name )
      `)
      .eq('list_id', listId)
      .not('checked_by', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data.map(item => ({
      name: item.profiles?.full_name || 'Quelqu\'un',
      text: `${item.is_checked ? 'A coché' : 'A décoché'} : ${item.name}`,
      time: new Date(item.updated_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }));
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
