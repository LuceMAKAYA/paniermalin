/**
 * prompt.js – Construit le prompt IA à partir de l'état du formulaire.
 */

/**
 * @param {object} state - snapshot de l'état du store
 * @returns {string}
 */
export function buildPrompt(state, localStores = null) {
  const cuisines = state.cuisines.size ? [...state.cuisines].join(', ') : 'Non spécifié';
  const regimes = state.regimes.size ? [...state.regimes].join(', ') : 'Omnivore';
  const extras = state.extras.size ? [...state.extras].join(', ') : 'Aucune';
  const plats = state.plats.trim() || 'Non spécifié (générer une liste standard équilibrée)';
  const habitudes = state.habitudes.trim() || 'Aucune';
  const periode = state.periode || '1 semaine';
  const profil = state.profilBudget || 'equilibre';
  const ville = state.ville?.trim() || 'Non spécifié';
  const prenom = state.prenom?.trim() || null;
  const genre = state.genre || null;

  // Personalized greeting for the prompt context
  const identite = prenom
    ? `Utilisateur·trice : ${prenom}${genre && genre !== 'secret' ? `, genre : ${genre}` : ''}`
    : 'Utilisateur anonyme';

  const animauxStr = buildAnimalsStr(state.animals);

  const localStoresInstruction = localStores
    ? `\nMAGASINS RÉELS AUTOUR DU CLIENT:\nVoici les magasins physiques réellement trouvés autour de l'adresse du client:\n${localStores}\n`
    : '';

  const magasinsRule = localStores
    ? `· IMPORTANT: pour le tableau "magasins_recommandes", tu DOIS choisir 2 à 3 magasins pertinents UNIQUEMENT parmi la liste fournie ci-dessus (Magasins réels autour du client). Adapte le choix au profil budget (${profil}). Ne propose AUCUN magasin inventé.`
    : `· si une localisation est donnée, proposer 2 à 4 magasins réels (supermarchés, boucheries, marchés) typiquement trouvables en France dans le tableau "magasins_recommandes", adaptés au profil budget (${profil}).`;

  const specialInstructions = [];
  if (plats.toLowerCase().includes('riz') || habitudes.toLowerCase().includes('riz')) {
    specialInstructions.push("· PRIORITÉ RIZ : Si une variété spécifique de riz (ex: Thaï, Basmati) est demandée dans les plats ou habitudes, n'inclure QUE celle-là et AUCUNE autre (ex: pas de riz brisé).");
  }

  if (profil === 'tres_econome' || profil === 'econome' || profil === 'equilibre') {
    specialInstructions.push(`· OPTIMISATION HUILE : Pour le profil ${profil}, privilégier des huiles abordables (Tournesol, Colza). N'inclure l'huile d'olive que si elle est indispensable ou spécifiquement demandée.`);
  }

  const instructionsStr = specialInstructions.length ? `\n\nINSTRUCTIONS SPÉCIFIQUES :\n${specialInstructions.join('\n')}` : '';

  return `Tu es un assistant expert en liste de courses en France, spécialisé dans les cuisines du monde et notamment africaines.
Génère une liste de courses COMPLÈTE incluant ABSOLUMENT tous les ingrédients nécessaires pour réaliser les plats prévus suivants : ${plats}.
Assure-toi de ne rien oublier pour ces recettes et propose une liste optimiser en fonction de la periode données

FOYER :
- Utilisateur : ${identite}
- Personnes : ${state.people}
- Période : ${periode}
- Budget max : ${state.budget}€ pour ${periode}
- Profil budget : ${profil} (Très économe=MDD/eco, Économe=bon rapport q/p, Équilibré=mix marques, Premium=Bio/qualité)
- Localisation / Ville : ${ville}
- Régimes : ${regimes}
- Styles de cuisine : ${cuisines}
- Plats prévus : ${plats}
- Autres catégories : ${extras}
- Habitudes : ${habitudes}

ANIMAUX : ${animauxStr}
→ Inclure aliments avec marque précisée OU recommandation selon âge/race, litière pour chats, quantités pour ${periode}.

RÈGLE IMPORTANTE – PRODUITS DE BASE :
Inclure TOUJOURS une sélection réaliste de produits de base (garde-manger) adaptée à ${periode} et ${state.people} personnes. Adapte le prix au profil budget (${profil}).

INGRÉDIENTS CUISINES AFRICAINES (suggestions si pas de plats précis) :
riz brisé, attiéké, foutou, plantain, igname, manioc, gombo, feuilles de manioc, ndolé, poisson fumé, huile de palme, soumbara, poivre de Selim, piment séché, cube Maggi/Jumbo, lait de coco, arachides crues, gingembre frais, citron vert.
${localStoresInstruction}${instructionsStr}

Réponds UNIQUEMENT en JSON valide :
{"categories":[{"nom":"...","emoji":"...","articles":[{"nom":"...","quantite":"...","prix_estime":0.00}]}],"magasins_recommandes":["...","..."],"total_estime":0.00,"conseil":"..."}

Règles : 
1. PRIX RÉELS : Utilise des prix réalistes du marché français actuel (ex: 1.20€/kg de riz éco). Et les prix des magasin exotique.
2. COMPLÉTUDE : Liste TOUS les ingrédients pour les plats : ${plats}.
3. PROFIL ${profil} : Adapte scrupuleusement le type de produit au budget.${magasinsRule}
4. CONSEIL : Ajoute un conseil d'expert et précise que les prix sont des estimations indicatives.`;
}

function buildAnimalsStr(animals) {
  if (!animals.length) return 'Aucun animal';
  return animals.map(a => {
    let s = `${a.cfg.emoji} ${a.cfg.label}${a.name ? ` (${a.name})` : ''} x${a.count}, ${a.age}${a.race ? `, ${a.race}` : ''}, alimentation: ${a.alim}`;
    if (a.marque) s += `, marque croquettes: ${a.marque}`;
    if (a.litiere) s += `, litière: ${a.litiere}`;
    if (a.friandises) s += `, friandises: ${a.friandises}`;
    return s;
  }).join('\n');
}
