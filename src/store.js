/**
 * store.js – état réactif centralisé de l'application.
 * Toutes les sections du formulaire lisent/écrivent via ce module.
 */

const state = {
  // Profile
  prenom:         '',
  genre:          '',
  // Formulaire
  cuisines:       new Set(),
  personnes:      '4', // Changed from people to personnes
  regimes:        new Set(),
  budget:         150,
  periode:        '1 semaine',
  profilBudget:   'equilibre',
  ville:          '',
  extras:         new Set(),
  plats:          '',
  habitudes:      '',
  /** @type {Array} */
  animals:        [],
  _animalCounter: 0,
};

// --- Generic getters/setters ---
export const getState = () => ({ 
  ...state, 
  cuisines: Array.from(state.cuisines), 
  regimes: Array.from(state.regimes), 
  extras: Array.from(state.extras), 
  animals: [...state.animals] 
});


export function setBudget(val)   { state.budget = Number(val); }
export function getBudget()      { return state.budget; }

export function setPeople(val)   { state.personnes = val; }
export function getPeople()      { return state.personnes; }

export function setPrenom(val)   { state.prenom = val; }
export function setGenre(val)    { state.genre  = val; }

export function setPeriode(val)       { state.periode = val; }
export function setProfilBudget(val)  { state.profilBudget = val; }
export function setVille(val)         { state.ville = val; }

export function setPlats(val)    { state.plats = val; }
export function setHabitudes(val){ state.habitudes = val; }

// --- Toggle helpers ---
export function toggleCuisine(val)  { _toggle(state.cuisines, val); }
export function toggleRegime(val)   { _toggle(state.regimes, val); }
export function toggleExtra(val)    { _toggle(state.extras, val); }

function _toggle(set, val) {
  if (set.has(val)) set.delete(val); else set.add(val);
}

// --- Animals ---
export function addAnimal(type, cfg) {
  const id = ++state._animalCounter;
  state.animals.push({ id, type, cfg, name: '', count: '1', age: cfg.ages[0], race: '', alim: cfg.aliments[0], marque: null, litiere: null, friandises: null });
  return id;
}

export function removeAnimal(id) {
  state.animals = state.animals.filter(a => a.id !== id);
}

export function updateAnimal(id, field, value) {
  const a = state.animals.find(a => a.id === id);
  if (a) a[field] = value;
}

export function getAnimals() { return state.animals; }

/**
 * Met à jour l'état global en masse (ex: depuis la DB)
 */
export function setState(newData) {
  if (!newData) return;
  // Fix #8: use ?? / != null to allow falsy-but-valid values like 0 or ''
  if (newData.personnes != null) state.personnes = String(newData.personnes);
  if (newData.budget != null)    state.budget = Number(newData.budget);
  if (newData.ville != null)     state.ville = newData.ville;
  if (newData.periode != null)   state.periode = newData.periode;
  if (newData.profilBudget != null) state.profilBudget = newData.profilBudget;
  if (newData.habitudes != null) state.habitudes = newData.habitudes;
  
  if (newData.cuisines) state.cuisines = new Set(newData.cuisines);
  if (newData.regimes)  state.regimes  = new Set(newData.regimes);
  if (newData.extras)   state.extras   = new Set(newData.extras);
  
  if (newData.animals) {
    state.animals = [...newData.animals];
    state._animalCounter = Math.max(0, ...state.animals.map(a => a.id || 0));
  }
}

