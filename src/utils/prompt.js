/**
 * prompt.js – Construit le prompt IA à partir de l'état du formulaire.
 */

/**
 * @param {object} state - snapshot de l'état du store
 * @returns {string}
 */
export function buildPrompt(state) {
  const cuisines  = state.cuisines.size  ? [...state.cuisines].join(', ')  : 'Non spécifié';
  const regimes   = state.regimes.size   ? [...state.regimes].join(', ')   : 'Omnivore';
  const extras    = state.extras.size    ? [...state.extras].join(', ')    : 'Aucune';
  const plats     = state.plats.trim()     || 'Non spécifié (générer une liste standard équilibrée)';
  const habitudes = state.habitudes.trim() || 'Aucune';
  const periode   = state.periode        || '1 semaine';
  const prenom    = state.prenom?.trim()  || null;
  const genre     = state.genre          || null;

  // Personalized greeting for the prompt context
  const identite = prenom
    ? `Utilisateur·trice : ${prenom}${genre && genre !== 'secret' ? `, genre : ${genre}` : ''}`
    : 'Utilisateur anonyme';

  const animauxStr = buildAnimalsStr(state.animals);

  return `Tu es un assistant expert en liste de courses en France, spécialisé dans les cuisines du monde et notamment africaines.
Génère une liste de courses complète et optimisée pour la période demandée.

FOYER :
- Utilisateur : ${identite}
- Personnes : ${state.people}
- Période : ${periode}
- Budget max : ${state.budget}€ pour ${periode}
- Régimes : ${regimes}
- Styles de cuisine : ${cuisines}
- Plats prévus : ${plats}
- Autres catégories : ${extras}
- Habitudes : ${habitudes}

ANIMAUX : ${animauxStr}
→ Inclure aliments avec marque précisée OU recommandation selon âge/race, litière pour chats, quantités pour ${periode}.

RÈGLE IMPORTANTE – PRODUITS DE BASE :
Même si l'utilisateur n'a pas listé de plats précis, inclure TOUJOURS une sélection complète de produits de base (garde-manger) adaptée à ${periode} et ${state.people} personnes :
• Féculents : riz, pâtes, pommes de terre, lentilles, semoule
• Légumes indispensables : oignons, ail, tomates, poivrons, carottes, épinards
• Fruits de saison : bananes, pommes, oranges
• Protéines polyvalentes : œufs, poulet, thon en boîte, sardines
• Produits laitiers : beurre, fromage râpé, yaourts, lait
• Condiments & sauces : huile (tournesol + olive), mayonnaise, moutarde, ketchup, vinaigre
• Épices universelles : sel, poivre, cumin, curry, paprika, herbes de Provence
• Conserves pratiques : tomates pelées, pois chiches, haricots rouges, maïs
• Snacks & petit-déj : pain de mie, céréales, confiture, biscuits
Adapte les quantités à la période (${periode}) et au nombre de personnes (${state.people}).

INGRÉDIENTS CUISINES AFRICAINES (si pertinent) :
riz brisé, attiéké, foutou, plantain, igname, manioc, gombo, feuilles de manioc, ndolé, poisson fumé, huile de palme, soumbara, poivre de Selim, piment séché, cube Maggi/Jumbo, lait de coco, arachides crues, gingembre frais, citron vert.

Réponds UNIQUEMENT en JSON valide sans markdown ni balises code :
{"categories":[{"nom":"...","emoji":"...","articles":[{"nom":"...","quantite":"...","prix_estime":0.00}]}],"total_estime":0.00,"conseil":"..."}

Catégories disponibles : Fruits & Légumes 🥦, Féculents & Céréales 🌾, Viandes & Poissons 🥩, Produits Laitiers 🧀, Épicerie & Conserves 🥫, Cuisine Africaine & du Monde 🌍, Épices & Condiments 🫙, Boulangerie & Snacks 🥐, Surgelés ❄️, Boissons 🥤, Hygiène & Beauté 🧴, Produits Ménagers 🧹, Animaux 🐾, Bébé 👶

Règles : quantités adaptées au nb de personnes ET à la période ${periode} · prix réalistes France 2025 · rester sous ${state.budget}€ si possible · conseil personnalisé 2-3 phrases incluant un tip pour optimiser le budget.`;
}

function buildAnimalsStr(animals) {
  if (!animals.length) return 'Aucun animal';
  return animals.map(a => {
    let s = `${a.cfg.emoji} ${a.cfg.label}${a.name ? ` (${a.name})` : ''} x${a.count}, ${a.age}${a.race ? `, ${a.race}` : ''}, alimentation: ${a.alim}`;
    if (a.marque)     s += `, marque croquettes: ${a.marque}`;
    if (a.litiere)    s += `, litière: ${a.litiere}`;
    if (a.friandises) s += `, friandises: ${a.friandises}`;
    return s;
  }).join('\n');
}
