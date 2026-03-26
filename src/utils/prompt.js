/**
 * prompt.js – Construit le prompt IA à partir de l'état du formulaire.
 */

/**
 * @param {object} state - snapshot de l'état du store
 * @returns {string}
 */
export function buildPrompt(state, localStores = null) {
  const cuisines = state.cuisines.length ? state.cuisines.join(', ') : 'Non spécifié';
  const regimes = state.regimes.length ? state.regimes.join(', ') : 'Omnivore';
  const extras = state.extras.length ? state.extras.join(', ') : 'Aucune';
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
    specialInstructions.push("· PRIORITÉ RIZ : Si une variety spécifique de riz (ex: Thaï, Basmati) est demandée, n'inclure QUE celle-là et AUCUNE autre.");
  }

  if (profil === 'tres_econome' || profil === 'econome' || profil === 'equilibre') {
    specialInstructions.push(`· OPTIMISATION HUILE : Pour le profil ${profil}, privilégier des huiles abordables (Tournesol, Colza).`);
  }

  if (state.extras.length > 0) {
    specialInstructions.push(`· CATÉGORIES OBLIGATOIRES : L'utilisateur a sélectionné : ${extras}. Tu DOIS inclure au moins 3-4 articles pertinents pour CHAQUE catégorie choisie, adaptés à la durée de ${periode}.`);
  }

  const instructionsStr = specialInstructions.length ? `\n\nINSTRUCTIONS CRITIQUES :\n${specialInstructions.join('\n')}` : '';

  return `Tu es un assistant expert en liste de courses en France.
Génère une liste de courses COMPLÈTE et RÉALISTE pour ${state.personnes} personnes pendant ${periode}.

OBJECTIFS PRIORITAIRES :
1. PLATS : Inclure TOUS les ingrédients pour : ${plats}.
2. CATÉGORIES : Inclure obligatoirement des articles (Hygiène, Ménager, etc.) pour les extras sélectionnés : ${extras}.
3. PRIX RÉELS : Utilise les VRAIS prix moyens en France (Benchmarks : Pack eau 6x1.5L = 2.50-4€, Sel = 1.20€, Poivre = 4.50€, Gel douche = 3€, Riz 1kg = 2-3€).

FOYER :
- Personnes : ${state.personnes}
- Période : ${periode}
- Budget max : ${state.budget}€
- Profil : ${profil} (${profil === 'tres_econome' ? 'Bas prix' : 'Standard'})
- Ville : ${ville}
- Régimes : ${regimes}
- Habitudes : ${habitudes}

ANIMAUX : ${animauxStr}

RÈGLE : La liste doit permettre de tenir ${periode} sans retourner au magasin. ${localStoresInstruction}${instructionsStr}

Réponds UNIQUEMENT en JSON valide :
{"categories":[{"nom":"...","emoji":"...","articles":[{"nom":"...","quantite":"...","prix_estime":0.00,"is_seasonal":true}]}],"magasins_recommandes":["...","..."],"total_estime":0.00,"conseil":"..."}

Règles Finales : 
- Ne pas oublier les catégories "Extra" (${extras}).
- Adapter les quantités à ${state.personnes} personnes pour ${periode}.
- Saisonalité : Ajoute "is_seasonal": true pour chaque produit frais (fruits, légumes, viande, poisson) qui est actuellement de saison et idéalement produit localement. Pour l'épicerie sèche ou hors saison, false.
- CONSEIL : Ajoute un conseil d'expert et précise que les prix sont des estimations indicatives.${magasinsRule}`;
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
