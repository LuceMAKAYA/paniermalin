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
  <h2 class="syne" style="margin-bottom: 8px;">Préparation en cours...</h2>
  <p class="loading-text">L'IA de Panier Malin s'active</p>
  
  <div class="loading-steps">
    <div class="loading-step" data-step="0">
      <span class="loading-step-icon">🔍</span> Analyse de votre profil foyer...
    </div>
    <div class="loading-step" data-step="1">
      <span class="loading-step-icon">🥬</span> Sélection des produits de saison...
    </div>
    <div class="loading-step" data-step="2">
      <span class="loading-step-icon">⚖️</span> Optimisation du budget & quantités...
    </div>
    <div class="loading-step" data-step="3">
      <span class="loading-step-icon">🏠</span> Recherche des commerces locaux...
    </div>
    <div class="loading-step" data-step="4">
      <span class="loading-step-icon">📊</span> Comparaison finale des prix estimés...
    </div>
  </div>
`;

function updateLoadingStep(stepIndex) {
  const steps = loadingEl.querySelectorAll('.loading-step');
  steps.forEach((s, idx) => {
    s.classList.toggle('active', idx === stepIndex);
    s.classList.toggle('done', idx < stepIndex);
    if (idx < stepIndex) s.querySelector('.loading-step-icon').textContent = '✅';
  });
}

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
  updateLoadingStep(0);
}

function showResults(data, storeData) {
  loadingEl.classList.remove('visible');
  const state = getState();
  resultsEl = createResultsView(data, state.budget, showForm, storeData);
  main.appendChild(resultsEl);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Generate handler ──────────────────────────────────────
async function handleGenerate() {
  hideError();
  setGenerateLoading(true);
  showLoading();
  
  try {
    const state = getState();
    
    // Sequence Step 0: Profile
    updateLoadingStep(0);
    await new Promise(r => setTimeout(r, 800));
    
    // Sequence Step 1: Saison
    updateLoadingStep(1);
    await new Promise(r => setTimeout(r, 600));

    // Sequence Step 2: Budget
    updateLoadingStep(2);
    await new Promise(r => setTimeout(r, 600));

    // Sequence Step 3: Stores
    updateLoadingStep(3);
    let storeData = null;
    if (state.ville && state.ville.trim().length > 3) {
      storeData = await fetchNearbyStores(state.ville);
    }
    await new Promise(r => setTimeout(r, 500));

    // Sequence Step 4: AI Logic
    updateLoadingStep(4);
    const prompt = buildPrompt(state, storeData?.promptString || null);
    const data   = await generateShoppingList(prompt);
    
    updateLoadingStep(5);
    await new Promise(r => setTimeout(r, 400));

    setGenerateLoading(false);
    showResults(data, storeData);
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

