/**
 * FormView.js – Formulaire principal (toutes les sections).
 */
import { CUISINES, REGIMES, EXTRAS } from '../config/options.js';
import { createAnimalsSection } from './AnimalsSection.js';
import {
  toggleCuisine, toggleRegime, toggleExtra,
  setPeople, setBudget, setPlats, setHabitudes, setPeriode,
  setProfilBudget, setVille,
} from '../store.js';

/**
 * @param {Function} onGenerate - Callback déclenché lors du clic sur "Générer"
 */
export function createFormView(onGenerate) {
  const form = document.createElement('div');
  form.id = 'form-view';

  let currentStep = 1;
  const totalSteps = 4;

  form.innerHTML = `
    <!-- Stepper Header -->
    <div class="stepper-header">
      <div class="stepper-progress" id="stepper-progress"></div>
      <div class="step-item active" data-step="1">
        <div class="step-dot">1</div>
        <span class="step-label">Foyer</span>
      </div>
      <div class="step-item" data-step="2">
        <div class="step-dot">2</div>
        <span class="step-label">Cuisine</span>
      </div>
      <div class="step-item" data-step="3">
        <div class="step-dot">3</div>
        <span class="step-label">Budget</span>
      </div>
      <div class="step-item" data-step="4">
        <div class="step-dot">4</div>
        <span class="step-label">Localisation</span>
      </div>
    </div>

    <!-- STEP 1: FOYER -->
    <div class="step-content active" data-step="1">
      <div class="card">
        <div class="section-title">
          <span class="section-icon">👨‍👩‍👧‍👦</span> Votre Foyer
        </div>
        <label class="label">Nombre de personnes</label>
        <div class="people-row" id="people-row">
          ${['1','2','3','4','5','6+'].map(n => `
            <button class="people-btn ${n === '4' ? 'active' : ''}" data-value="${n}">${n}</button>`).join('')}
        </div>
        <div class="mt-16">
          <label class="label">Régime alimentaire</label>
          <div class="tags-row" id="regimes-row">
            ${REGIMES.map(r => `
              <button class="tag" data-value="${r.value}">${r.emoji} ${r.value}</button>`).join('')}
          </div>
        </div>
      </div>
      <div id="animals-section-host"></div>
    </div>

    <!-- STEP 2: CUISINE -->
    <div class="step-content" data-step="2">
      <div class="card">
        <div class="section-title">
          <span class="section-icon">🍽️</span> Vos Envies
        </div>
        <div class="cuisine-grid" id="cuisine-grid">
          ${CUISINES.map(c => `
            <button class="cuisine-btn" data-value="${c.value}">
              <span class="emj">${c.emoji}</span>${c.value}
            </button>`).join('')}
        </div>
        <div class="mt-16">
          <label class="label">Plats prévus (midi &amp; soir)</label>
          <textarea id="input-plats" class="textarea" rows="3"
            placeholder="Ex : Riz au gras lundi soir, poulet rôti mardi…"></textarea>
        </div>
        <div class="mt-16">
          <label class="label">Habitudes &amp; préférences</label>
          <textarea id="input-habitudes" class="textarea" rows="2"
            placeholder="Ex : Allergies, marques préférées, magasins habituels…"></textarea>
        </div>
      </div>
      <div class="card">
        <div class="section-title">
          <span class="section-icon">🛍️</span> Autres besoins
        </div>
        <div class="extras-grid" id="extras-grid">
          ${EXTRAS.map(e => `
            <button class="extra-btn" data-value="${e.value}">
              <span class="emj">${e.emoji}</span>${e.value}
            </button>`).join('')}
        </div>
      </div>
    </div>

    <!-- STEP 3: BUDGET -->
    <div class="step-content" data-step="3">
      <div class="card">
        <div class="section-title">
          <span class="section-icon">📅</span> Période & Budget
        </div>
        <label class="label">Durée des courses</label>
        <div class="periode-row" id="periode-row">
          ${[['1 semaine','7 jours'],['2 semaines','14 jours'],['3 semaines','21 jours'],['1 mois','~30 jours']].map(([val, sub], i) => `
            <button class="periode-btn ${i === 0 ? 'active' : ''}" data-value="${val}">
              <span class="periode-main">${val}</span>
              <span class="periode-sub">${sub}</span>
            </button>`).join('')}
        </div>

        <div class="mt-16">
          <label class="label">Profil budget</label>
          <div class="profil-grid" id="profil-grid">
            <button class="profil-btn" data-value="tres_econome">
              <span class="profil-emoji">💰</span>
              <span class="profil-name">Économe</span>
              <span class="profil-desc">MDD & 1er prix</span>
            </button>
            <button class="profil-btn active" data-value="equilibre">
              <span class="profil-emoji">⚖️</span>
              <span class="profil-name">Équilibré</span>
              <span class="profil-desc">Mix marques</span>
            </button>
            <button class="profil-btn" data-value="premium">
              <span class="profil-emoji">✨</span>
              <span class="profil-name">Premium</span>
              <span class="profil-desc">Qualité & Bio</span>
            </button>
          </div>
        </div>

        <div class="mt-16">
          <div class="slider-header">
            <span class="slider-label">Budget total</span>
            <span class="slider-value" id="budget-display">150€</span>
          </div>
          <input id="budget-slider" type="range" min="20" max="800" step="5" value="150" />
        </div>
      </div>
    </div>

    <!-- STEP 4: LOCALISATION -->
    <div class="step-content" data-step="4">
      <div class="card">
        <div class="section-title">
          <span class="section-icon">📍</span> Où cherchez-vous ?
        </div>
        <p style="font-size: .85rem; color: var(--text-muted); margin-bottom: 16px;">
          Saisissez votre adresse pour trouver les magasins réels les plus proches.
        </p>
        <div class="autocomplete-container">
          <label class="field-label">Adresse complète</label>
          <input id="input-ville" class="input-text" type="text"
            placeholder="Ex : 15 rue de la Paix, Paris…" autocomplete="off" />
          <div id="autocomplete-results" class="autocomplete-results"></div>
        </div>
      </div>
      
      <!-- Error Box moved here for visibility -->
      <div class="error-box" id="error-box">
        <span>⚠️</span>
        <p id="error-msg"></p>
      </div>

      <div class="generate-wrap">
        <button id="btn-generate" class="btn-generate">✨ Générer mon panier malin</button>
      </div>
    </div>

    <!-- Stepper Footer -->
    <div class="stepper-footer">
      <button class="btn-step btn-prev" id="btn-prev" style="visibility: hidden;">Précédent</button>
      <button class="btn-step btn-next" id="btn-next">Suivant</button>
    </div>
  `;

  // --- UI Elements ---
  const stepContents = form.querySelectorAll('.step-content');
  const stepItems    = form.querySelectorAll('.step-item');
  const progressBar  = form.querySelector('#stepper-progress');
  const btnPrev      = form.querySelector('#btn-prev');
  const btnNext      = form.querySelector('#btn-next');
  const btnGenerate  = form.querySelector('#btn-generate');

  const updateStepper = () => {
    stepContents.forEach(c => c.classList.remove('active'));
    form.querySelector(`.step-content[data-step="${currentStep}"]`).classList.add('active');

    stepItems.forEach(item => {
      const s = parseInt(item.dataset.step);
      item.classList.toggle('active', s === currentStep);
      item.classList.toggle('completed', s < currentStep);
    });

    progressBar.style.width = `${((currentStep - 1) / (totalSteps - 1)) * 100}%`;
    
    btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    btnNext.style.display    = currentStep === totalSteps ? 'none' : 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  btnNext.addEventListener('click', () => { if (currentStep < totalSteps) { currentStep++; updateStepper(); } });
  btnPrev.addEventListener('click', () => { if (currentStep > 1) { currentStep--; updateStepper(); } });

  // --- Logic remain the same (attached to new IDs) ---
  const animalsHost = form.querySelector('#animals-section-host');
  animalsHost.replaceWith(createAnimalsSection());

  form.querySelectorAll('.cuisine-btn').forEach(btn => {
    btn.addEventListener('click', () => { toggleCuisine(btn.dataset.value); btn.classList.toggle('active'); });
  });

  form.querySelectorAll('.people-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      form.querySelectorAll('.people-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active'); setPeople(btn.dataset.value);
    });
  });
  setPeople('4');

  form.querySelectorAll('.periode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      form.querySelectorAll('.periode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active'); setPeriode(btn.dataset.value);
    });
  });
  setPeriode('1 semaine');

  form.querySelectorAll('.profil-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      form.querySelectorAll('.profil-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active'); setProfilBudget(btn.dataset.value);
    });
  });
  setProfilBudget('equilibre');

  const villeInput = form.querySelector('#input-ville');
  const resultsBox = form.querySelector('#autocomplete-results');
  let debounceTimer;

  villeInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    setVille(query); window.__googleLocation = null;
    clearTimeout(debounceTimer);
    if (query.length < 3) { resultsBox.classList.remove('visible'); return; }
    debounceTimer = setTimeout(async () => {
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      resultsBox.innerHTML = '';
      if (data.features?.length) {
        data.features.forEach(f => {
          const item = document.createElement('div');
          item.className = 'autocomplete-item';
          item.innerHTML = `<span class="autocomplete-name">${f.properties.label}</span><span class="autocomplete-desc">${f.properties.context}</span>`;
          item.onclick = () => {
            villeInput.value = f.properties.label; setVille(f.properties.label);
            window.__googleLocation = { lat: () => f.geometry.coordinates[1], lng: () => f.geometry.coordinates[0] };
            resultsBox.classList.remove('visible');
          };
          resultsBox.appendChild(item);
        });
        resultsBox.classList.add('visible');
      }
    }, 300);
  });

  form.querySelectorAll('.tag').forEach(btn => {
    btn.addEventListener('click', () => { toggleRegime(btn.dataset.value); btn.classList.toggle('active'); });
  });

  const slider = form.querySelector('#budget-slider');
  const display = form.querySelector('#budget-display');
  const updateSlider = () => {
    const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--pct', pct + '%');
    display.textContent = slider.value + '€';
    setBudget(slider.value);
  };
  slider.addEventListener('input', updateSlider);
  updateSlider();

  form.querySelectorAll('.extra-btn').forEach(btn => {
    btn.addEventListener('click', () => { toggleExtra(btn.dataset.value); btn.classList.toggle('active'); });
  });

  form.querySelector('#input-plats').addEventListener('input', e => setPlats(e.target.value));
  form.querySelector('#input-habitudes').addEventListener('input', e => setHabitudes(e.target.value));

  btnGenerate.addEventListener('click', onGenerate);

  return form;
}


export function showError(msg) {
  const box = document.getElementById('error-box');
  const txt = document.getElementById('error-msg');
  if (box && txt) { txt.textContent = msg; box.classList.add('visible'); }
}
export function hideError() {
  document.getElementById('error-box')?.classList.remove('visible');
}
export function setGenerateLoading(loading) {
  const btn = document.getElementById('btn-generate');
  if (btn) btn.disabled = loading;
}
