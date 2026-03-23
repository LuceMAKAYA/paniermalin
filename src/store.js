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
  people:         '4',
  regimes:        new Set(),
  budget:         150,
  periode:        '1 semaine',
  profilBudget:   'equilibre',
  ville:          '',
  extras:         new Set(),
  plats:          '',
  habitudes:      '',
  /** @type {Array<{id:number, type:string, name:string, count:string, age:string, race:string, alim:string, marque:string|null, litiere:string|null, friandises:string|null}>} */
  animals:        [],
  _animalCounter: 0,
};

// --- Generic getters/setters ---
export const getState = () => ({ ...state, cuisines: new Set(state.cuisines), regimes: new Set(state.regimes), extras: new Set(state.extras), animals: [...state.animals] });


export function setBudget(val)   { state.budget = Number(val); }
export function getBudget()      { return state.budget; }

export function setPeople(val)   { state.people = val; }
export function getPeople()      { return state.people; }

export function setPrenom(val)   { state.prenom = val; }
export function setGenre(val)    { state.genre  = val; }
export function getPrenom()      { return state.prenom; }
export function getGenre()       { return state.genre; }

export function setPeriode(val)       { state.periode = val; }
export function getPeriode()          { return state.periode; }

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
