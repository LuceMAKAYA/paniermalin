/**
 * price.js - Utilitaires pour le calcul des prix.
 */

/**
 * Calcule le prix total d'une liste de courses.
 * @param {Array} categories - Les catégories de la liste avec leurs articles.
 * @param {number} multiplier - Le multiplicateur à appliquer (défaut 1.0).
 * @returns {number} - Le prix total calculé.
 */
export function calculateTotal(categories, multiplier = 1.0) {
  if (!categories) return 0;
  return categories.reduce((acc, cat) => 
    acc + cat.articles.reduce((a, art) => a + (art.prix_estime || 0), 0), 0) * multiplier;
}

/**
 * Formate un prix en euros.
 * @param {number} price - Le prix à formater.
 * @returns {string} - Le prix formaté (ex: "24.50€").
 */
export function formatPrice(price) {
  return price.toFixed(2) + '€';
}
