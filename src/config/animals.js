/** Configuration par espèce animale – marques, âges, litière, friandises. */

export const ANIMAL_TYPES = [
  { key: 'chat',    emoji: '🐱', label: 'Chat' },
  { key: 'chien',   emoji: '🐶', label: 'Chien' },
  { key: 'lapin',   emoji: '🐰', label: 'Lapin' },
  { key: 'oiseau',  emoji: '🦜', label: 'Oiseau' },
  { key: 'poisson', emoji: '🐠', label: 'Poisson' },
];

export const ANIMAL_CONFIG = {
  chat: {
    emoji: '🐱',
    label: 'Chat',
    ages: ['Chaton (< 1 an)', 'Jeune adulte (1-3 ans)', 'Adulte (3-7 ans)', 'Senior (7+ ans)'],
    aliments: ['Croquettes', 'Pâtée', 'Mixte'],
    marques: ['Royal Canin', 'Whiskas', 'Felix', "Hill's", 'Purina ONE', 'Orijen'],
    litiere: ['Catsan', 'Ever Clean', 'Tigerino', 'Ökocat'],
    friandises: null,
  },
  chien: {
    emoji: '🐶',
    label: 'Chien',
    ages: ['Chiot (< 1 an)', 'Jeune adulte (1-3 ans)', 'Adulte (3-8 ans)', 'Senior (8+ ans)'],
    aliments: ['Croquettes', 'Pâtée', 'Mixte', 'BARF'],
    marques: ['Royal Canin', 'Pedigree', 'Eukanuba', "Hill's", 'Purina Pro Plan', 'Orijen'],
    litiere: null,
    friandises: ['Dentastix', 'Milk-Bone', 'Good Boy'],
  },
  lapin: {
    emoji: '🐰',
    label: 'Lapin',
    ages: ['Jeune (< 1 an)', 'Adulte (1-5 ans)', 'Senior (5+ ans)'],
    aliments: ['Granulés', 'Foin', 'Mixte'],
    marques: null,
    litiere: null,
    friandises: null,
  },
  oiseau: {
    emoji: '🦜',
    label: 'Oiseau',
    ages: ['Juvénile', 'Adulte', 'Senior'],
    aliments: ['Graines', 'Pellets', 'Mixte'],
    marques: null,
    litiere: null,
    friandises: null,
  },
  poisson: {
    emoji: '🐠',
    label: 'Poisson',
    ages: ['Juvénile', 'Adulte'],
    aliments: ['Flocons', 'Granulés', 'Surgélés'],
    marques: null,
    litiere: null,
    friandises: null,
  },
};
