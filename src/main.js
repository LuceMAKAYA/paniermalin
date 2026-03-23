/**
 * main.js – Point d'entrée de l'application Panier Malin.
 * Flux : ProfileStep → FormView → loading → ResultsView
 */
import './style.css';
import { createProfileStep, clearProfile } from './components/ProfileStep.js';
import { createFormView, showError, hideError, setGenerateLoading } from './components/FormView.js';
import { createResultsView } from './components/ResultsView.js';
import { generateShoppingList } from './api/groq.js';
import { fetchNearbyStores } from './api/places.js';
import { buildPrompt } from './utils/prompt.js';
import { getState } from './store.js';

// ── Root element ──────────────────────────────────────────
const app = document.getElementById('app');

// ── Header (monté après le profil) ────────────────────────
let headerEl = null;
function buildHeader(prenom) {
  const greeting = prenom
    ? `Bonjour <strong>${prenom}</strong> 👋`
    : 'Votre liste de courses IA';

  const el = document.createElement('header');
  el.className = 'app-header';
  el.innerHTML = `
    <div class="header-inner">
      <span class="header-icon">🛒</span>
      <div class="header-text">
        <h1>Panier Malin</h1>
        <p>${greeting}</p>
      </div>
      <button class="header-profile-btn" id="btn-reset-profile" title="Changer de profil">⚙️</button>
    </div>
  `;
  el.querySelector('#btn-reset-profile').addEventListener('click', () => {
    if (!confirm('Réinitialiser votre profil ?')) return;
    clearProfile();
    location.reload();
  });
  return el;
}

// ── Main wrapper ──────────────────────────────────────────
const main = document.createElement('main');
main.className = 'app-main';
app.appendChild(main);

// ── Loading view ──────────────────────────────────────────
const loadingEl = document.createElement('div');
loadingEl.className = 'loading-view';
loadingEl.innerHTML = `
  <div class="spinner"></div>
  <p class="loading-text">L'IA prépare votre liste…</p>
`;

// ── Navigation ────────────────────────────────────────────
let formViewEl = null;
let resultsEl  = null;

function showForm() {
  if (resultsEl) { resultsEl.remove(); resultsEl = null; }
  loadingEl.classList.remove('visible');
  if (!formViewEl) {
    formViewEl = createFormView(handleGenerate);
    main.appendChild(formViewEl);
  }
  formViewEl.style.display = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLoading() {
  if (formViewEl) formViewEl.style.display = 'none';
  if (!loadingEl.parentElement) main.appendChild(loadingEl);
  loadingEl.classList.add('visible');
}

function showResults(data) {
  loadingEl.classList.remove('visible');
  const state = getState();
  resultsEl = createResultsView(data, state.budget, showForm);
  main.appendChild(resultsEl);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Generate handler ──────────────────────────────────────
async function handleGenerate() {
  hideError();
  setGenerateLoading(true);
  showLoading();
  try {
    const state  = getState();
    let localStoresStr = null;
    
    // Check real stores near the address if provided
    if (state.ville && state.ville.trim().length > 3) {
      document.querySelector('.loading-text').textContent = '📍 Recherche des commerces à proximité...';
      localStoresStr = await fetchNearbyStores(state.ville);
      document.querySelector('.loading-text').textContent = '🧠 L\'IA prépare votre liste sur mesure...';
    } else {
      document.querySelector('.loading-text').textContent = '🧠 L\'IA prépare votre liste sur mesure...';
    }

    const prompt = buildPrompt(state, localStoresStr);
    const data   = await generateShoppingList(prompt);
    setGenerateLoading(false); // ← BUG FIX: re-enable button before hiding form
    showResults(data);
  } catch (err) {
    if (formViewEl) formViewEl.style.display = '';
    loadingEl.classList.remove('visible');
    setGenerateLoading(false);
    showError(err.message);
  }
}

// ── Boot – ProfileStep first ──────────────────────────────
function boot() {
  const profileEl = createProfileStep((profile) => {
    // Mount personalized header
    headerEl = buildHeader(profile.prenom);
    app.insertBefore(headerEl, main);
    // Show form
    showForm();
  });

  if (profileEl) {
    // Show profile step covering the whole screen
    main.appendChild(profileEl);
  }
  // If profileEl is null, the profile was already saved → onComplete already called
}

boot();

