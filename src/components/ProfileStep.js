/**
 * ProfileStep.js – Écran d'accueil : prénom + genre.
 * Affiché une seule fois, persisté en localStorage.
 */
import { setPrenom, setGenre } from '../store.js';

const LS_KEY = 'pm_profile';

/** Retourne le profil sauvegardé ou null */
export function getSavedProfile() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch { return null; }
}

/**
 * @param {Function} onComplete - callback(profile: {prenom, genre}) appelé après validation
 */
export function createProfileStep(onComplete) {
  const saved = getSavedProfile();
  if (saved?.prenom) {
    // Profil déjà enregistré – restaurer et sauter l'étape
    setPrenom(saved.prenom);
    setGenre(saved.genre || '');
    onComplete(saved);
    return null; // pas de DOM à monter
  }

  const GENRES = [
    { value: 'homme',    emoji: '👨', label: 'Homme' },
    { value: 'femme',    emoji: '👩', label: 'Femme' },
    { value: 'autre',    emoji: '🧑', label: 'Autre' },
    { value: 'secret',   emoji: '🤐', label: 'Préfère ne pas dire' },
  ];

  const el = document.createElement('div');
  el.className = 'profile-step';
  el.innerHTML = `
    <div class="profile-card">
      <div class="profile-header">
        <div class="profile-logo">🛒</div>
        <h1 class="profile-title">Bienvenue sur<br/><span>Panier Malin</span></h1>
        <p class="profile-subtitle">Personnalisez votre expérience en quelques secondes</p>
      </div>

      <div class="profile-body">
        <div class="profile-field">
          <label class="profile-label" for="profile-prenom">Comment vous appelez-vous ? <span class="profile-optional">(optionnel)</span></label>
          <input
            id="profile-prenom"
            class="profile-input"
            type="text"
            placeholder="Ex : Sophie, Marc, Alex…"
            maxlength="30"
            autocomplete="given-name"
          />
        </div>

        <div class="profile-field">
          <label class="profile-label">Genre <span class="profile-optional">(optionnel)</span></label>
          <div class="genre-grid">
            ${GENRES.map(g => `
              <button class="genre-btn" data-value="${g.value}" type="button">
                <span class="genre-emoji">${g.emoji}</span>
                <span class="genre-label">${g.label}</span>
              </button>`).join('')}
          </div>
        </div>

        <button id="profile-submit" class="btn-generate profile-submit">
          Commencer ✨
        </button>
      </div>
    </div>
  `;

  let selectedGenre = '';

  // Genre buttons
  el.querySelectorAll('.genre-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedGenre = btn.dataset.value;
    });
  });

  // Submit
  el.querySelector('#profile-submit').addEventListener('click', () => {
    const prenom = el.querySelector('#profile-prenom').value.trim();
    const profile = { prenom, genre: selectedGenre };
    localStorage.setItem(LS_KEY, JSON.stringify(profile));
    setPrenom(prenom);
    setGenre(selectedGenre);

    // Animate out
    el.style.transition = 'opacity .25s ease, transform .25s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      el.remove();
      onComplete(profile);
    }, 250);
  });

  // Allow pressing Enter to submit
  el.querySelector('#profile-prenom').addEventListener('keydown', e => {
    if (e.key === 'Enter') el.querySelector('#profile-submit').click();
  });

  return el;
}

/** Efface le profil sauvegardé (reset) */
export function clearProfile() {
  localStorage.removeItem(LS_KEY);
}
