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

  form.innerHTML = `
    <!-- 1. Cuisine & Plats -->
    <div class="card">
      <div class="section-title">
        <span class="section-icon">🍽️</span> Cuisine & Plats
      </div>
      <div class="cuisine-grid" id="cuisine-grid">
        ${CUISINES.map(c => `
          <button class="cuisine-btn" data-value="${c.value}">
            <span class="emj">${c.emoji}</span>${c.value}
          </button>`).join('')}
      </div>
      <div class="mt-16">
        <label class="label">Plats prévus (optionnel – midi &amp; soir)</label>
        <textarea id="input-plats" class="textarea" rows="3"
          placeholder="Ex : Riz au gras lundi soir, poulet rôti mardi… (laissez vide pour une liste standard)"></textarea>
      </div>
    </div>

    <!-- 2. Foyer -->
    <div class="card">
      <div class="section-title">
        <span class="section-icon">👨‍👩‍👧‍👦</span> Foyer
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

    <!-- 3. Période & Budget -->
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
            <span class="profil-name">Très économe</span>
            <span class="profil-desc">MDD, 1er prix, promos</span>
          </button>
          <button class="profil-btn" data-value="econome">
            <span class="profil-emoji">🛍️</span>
            <span class="profil-name">Économe</span>
            <span class="profil-desc">Bon rapport qualité/prix</span>
          </button>
          <button class="profil-btn active" data-value="equilibre">
            <span class="profil-emoji">⚖️</span>
            <span class="profil-name">Équilibré</span>
            <span class="profil-desc">Mix marques nationales</span>
          </button>
          <button class="profil-btn" data-value="premium">
            <span class="profil-emoji">✨</span>
            <span class="profil-name">Premium</span>
            <span class="profil-desc">Qualité, bio si possible</span>
          </button>
        </div>
      </div>

      <div class="mt-16 form-grid">
        <div class="form-field full">
          <label class="field-label">Ville / Magasin habituel</label>
          <input id="input-ville" class="input-text" type="text"
            placeholder="Ex : Paris 11e, Lidl Marseille, Carrefour Market Lyon…" />
        </div>
      </div>

      <div class="mt-16">
        <div class="slider-header">
          <span class="slider-label">Budget total (20€ – 800€)</span>
          <span class="slider-value" id="budget-display">150€</span>
        </div>
        <input id="budget-slider" type="range" min="20" max="800" step="5" value="150" />
      </div>
    </div>

    <!-- 4. Animaux (placeholder, remplacé après injection) -->
    <div id="animals-section-host"></div>

    <!-- 5. Extras -->
    <div class="card">
      <div class="section-title">
        <span class="section-icon">🛍️</span> Autres catégories
      </div>
      <div class="extras-grid" id="extras-grid">
        ${EXTRAS.map(e => `
          <button class="extra-btn" data-value="${e.value}">
            <span class="emj">${e.emoji}</span>${e.value}
          </button>`).join('')}
      </div>
    </div>

    <!-- 6. Habitudes -->
    <div class="card">
      <div class="section-title">
        <span class="section-icon">📝</span> Habitudes &amp; préférences
      </div>
      <textarea id="input-habitudes" class="textarea" rows="3"
        placeholder="Ex : Allergique aux noix, je fais mes courses chez Lidl et Carrefour, je prends toujours du lait Lactel…"></textarea>
    </div>

    <!-- Error -->
    <div class="error-box" id="error-box">
      <span>⚠️</span>
      <p id="error-msg"></p>
    </div>

    <!-- CTA -->
    <div class="generate-wrap">
      <button id="btn-generate" class="btn-generate">✨ Générer ma liste de courses</button>
    </div>
  `;

  // ── Inject animals section ──
  const animalsHost = form.querySelector('#animals-section-host');
  animalsHost.replaceWith(createAnimalsSection());

  // ── Cuisine toggles ──
  form.querySelectorAll('.cuisine-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleCuisine(btn.dataset.value);
      btn.classList.toggle('active');
    });
  });

  // ── People selector ──
  form.querySelectorAll('.people-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      form.querySelectorAll('.people-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setPeople(btn.dataset.value);
    });
  });
  setPeople('4'); // default

  // ── Période ──
  const periodeBtns = form.querySelectorAll('.periode-btn');
  periodeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      periodeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setPeriode(btn.dataset.value);
    });
  });
  setPeriode('1 semaine'); // default

  // ── Profil budget ──
  const profilBtns = form.querySelectorAll('.profil-btn');
  profilBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      profilBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setProfilBudget(btn.dataset.value);
    });
  });
  setProfilBudget('equilibre'); // default

  // ── Ville ──
  form.querySelector('#input-ville')?.addEventListener('input', e => setVille(e.target.value));

  // ── Régimes ──
  form.querySelectorAll('.tag').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleRegime(btn.dataset.value);
      btn.classList.toggle('active');
    });
  });

  // ── Budget slider ──
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

  // ── Extras ──
  form.querySelectorAll('.extra-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleExtra(btn.dataset.value);
      btn.classList.toggle('active');
    });
  });

  // ── Textareas ──
  form.querySelector('#input-plats').addEventListener('input', e => setPlats(e.target.value));
  form.querySelector('#input-habitudes').addEventListener('input', e => setHabitudes(e.target.value));

  // ── Generate ──
  form.querySelector('#btn-generate').addEventListener('click', onGenerate);

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
