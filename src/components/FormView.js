import { CUISINES, REGIMES, EXTRAS } from '../config/options.js';
import { createAnimalsSection } from './AnimalsSection.js';
import {
  toggleCuisine, toggleRegime, toggleExtra,
  setPeople, setBudget, setPlats, setHabitudes, setPeriode,
  setProfilBudget, setVille, getState
} from '../store.js';

export function createFormView(onGenerate) {
  const el = document.createElement('div');
  el.className = 'setup-container';
  el.style.display = 'flex';
  el.style.flexDirection = 'column';
  el.style.height = '100%';

  let currentStep = 0;
  const totalSteps = 5;

  const render = () => {
    const state = getState();
    el.innerHTML = `
      <div class="stepper-header no-print">
        <div class="progress-track">
          <div class="progress-fill" style="width: ${((currentStep + 1) / totalSteps) * 100}%"></div>
        </div>
        <div class="text-3" style="font-size: 11px; font-weight: 600; margin-left: 12px; white-space: nowrap;">
          Étape ${currentStep + 1} sur ${totalSteps}
        </div>
      </div>

      <div class="scroll-area" id="setup-scroll">
        ${renderStepContent(currentStep, state)}
      </div>

      <div class="no-print" style="padding: 16px 20px 24px;">
        <button class="btn-main" id="btn-next-step">
          ${currentStep === totalSteps - 1 ? '🪄 Générer ma liste !' : 'Continuer →'}
        </button>
        <div style="display: flex; gap: 10px; margin-top: 12px;">
          ${currentStep > 0 ? `<button class="btn-ghost" id="btn-prev-step" style="flex: 1; margin: 0;">Précédent</button>` : ''}
          ${currentStep < totalSteps - 1 ? `<button class="btn-ghost" id="btn-skip-step" style="flex: 1; margin: 0; color: var(--text3);">Passer</button>` : ''}
        </div>
      </div>
    `;

    attachEvents();
  };

  const renderStepContent = (step, state) => {
    switch (step) {
      case 0: // LOCALISATION
        return `
          <h2 class="clash mb-20">📍 Votre adresse</h2>
          <p class="text-2 mb-20" style="font-size: 14px;">Pour trouver les meilleurs magasins près de chez vous.</p>
          <p class="field-label" style="font-size: 12px; font-weight: 700; color: var(--text3); margin-bottom: 8px;">ADRESSE COMPLÈTE</p>
          <input class="input-field" id="input-ville" placeholder="Ex: 15 rue du Palais, Auxerre" value="${state.ville || ''}">
          <div class="card" style="background: var(--teals); border-color: rgba(14,232,200,0.2);">
            <p style="font-size: 11px; font-weight: 700; color: var(--teal); margin-bottom: 8px;">🌿 PRODUITS DE SAISON (MARS)</p>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${['🥦 Brocolis', '🍓 Fraises', '🥬 Épinards', '🐟 Cabillaud', '🥕 Carottes'].map(s => `
                <span style="font-size: 12px; color: var(--text2);">${s}</span>
              `).join('')}
            </div>
          </div>
          <div id="autocomplete-results" class="card" style="display:none; position:absolute; z-index:10; width:calc(100% - 40px); top:180px; padding:10px;"></div>
        `;

      case 1: // FOYER
        return `
          <h2 class="clash mb-20">👥 Votre foyer</h2>
          <p class="text-2 mb-20" style="font-size: 14px;">Combien de personnes à nourrir ?</p>
          <p class="field-label" style="font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 12px;">NOMBRE DE PERSONNES</p>
          <div class="num-row">
            ${['1','2','3','4','5','6+'].map(n => `
              <button class="num-btn ${state.personnes === n ? 'on' : ''}" data-val="${n}">${n}</button>
            `).join('')}
          </div>
          <p class="field-label" style="font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 12px; margin-top: 20px;">RÉGIME ALIMENTAIRE</p>
          <div class="chips-wrap">
            ${REGIMES.map(r => `
              <span class="chip ${state.regimes.includes(r.value) ? 'on' : ''}" data-val="${r.value}">${r.value}</span>
            `).join('')}
          </div>
          <div id="animals-section-host"></div>
        `;

      case 2: // CUISINE
        return `
          <h2 class="clash mb-20">🍽️ Vos cuisines</h2>
          <p class="text-2 mb-20" style="font-size: 14px;">Quels types de plats aimez-vous cuisiner ?</p>
          <div class="chips-wrap">
            ${CUISINES.map(c => `
              <span class="chip ${state.cuisines.includes(c.value) ? 'on' : ''}" data-val="${c.value}">${c.emoji} ${c.value}</span>
            `).join('')}
          </div>
          <p class="field-label" style="font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 12px; margin-top: 20px;">CATÉGORIES SUPPLÉMENTAIRES</p>
          <div class="chips-wrap">
            ${EXTRAS.map(e => `
              <span class="chip ${state.extras.includes(e.value) ? 'on' : ''}" data-val="${e.value}">${e.emoji} ${e.value}</span>
            `).join('')}
          </div>
          <p class="field-label" style="font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 12px; margin-top: 20px;">HABITUDES & NOTES</p>
          <textarea class="input-field" id="input-habitudes" rows="3" style="resize:none;" placeholder="Ex: Toujours du lait bio, courses le samedi...">${state.habitudes || ''}</textarea>
        `;

      case 3: // BUDGET
        return `
          <h2 class="clash mb-20">💶 Budget & Fréquence</h2>
          <p class="text-2 mb-20" style="font-size: 14px;">Comment gérez-vous vos courses ?</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
            <div>
              <p class="field-label" style="font-size: 10px; font-weight: 700; color: var(--text3); margin-bottom: 8px;">FRÉQUENCE</p>
              <div style="display: flex; gap: 4px; background: var(--bg2); padding: 4px; border-radius: 10px;">
                <button class="freq-btn ${state.periode.includes('semaine') ? 'on' : ''}" data-val="1 semaine" style="flex:1; border:none; border-radius:8px; font-size:10px; padding:8px 0; background:${state.periode.includes('semaine') ? 'var(--card)' : 'transparent'}; color:white;">SEMAINE</button>
                <button class="freq-btn ${state.periode.includes('mois') ? 'on' : ''}" data-val="1 mois" style="flex:1; border:none; border-radius:8px; font-size:10px; padding:8px 0; background:${state.periode.includes('mois') ? 'var(--card)' : 'transparent'}; color:white;">MOIS</button>
              </div>
            </div>
            <div>
              <p class="field-label" style="font-size: 10px; font-weight: 700; color: var(--text3); margin-bottom: 8px;">STRATÉGIE</p>
              <div style="display: flex; gap: 4px; background: var(--bg2); padding: 4px; border-radius: 10px;">
                <button class="profil-card ${state.profilBudget === 'equilibre' ? 'on' : ''}" data-val="equilibre" style="flex:1; border:none; border-radius:8px; font-size:10px; padding:8px 0; background:${state.profilBudget === 'equilibre' ? 'var(--card)' : 'transparent'}; color:white;">⚖️ ÉQUILIBRE</button>
                <button class="profil-card ${state.profilBudget === 'tres_econome' ? 'on' : ''}" data-val="tres_econome" style="flex:1; border:none; border-radius:8px; font-size:10px; padding:8px 0; background:${state.profilBudget === 'tres_econome' ? 'var(--card)' : 'transparent'}; color:white;">💸 ÉCONOME</button>
              </div>
            </div>
          </div>

          <p class="field-label" style="font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 12px;">BUDGET ESTIMÉ POUR ${state.periode.toUpperCase()}</p>
          <div class="card" style="padding: 24px; background: linear-gradient(135deg, var(--card), rgba(61,127,255,0.05));">
            <input type="range" id="budget-slider" min="20" max="${state.periode.includes('mois') ? 1200 : 400}" step="10" value="${state.budget}" style="width:100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
               <div>
                 <p class="text-3" style="font-size: 11px;">Budget cible :</p>
                 <p class="text-3" style="font-size: 9px; opacity: 0.6;">(Ajustable par l'IA)</p>
               </div>
               <p class="clash" style="font-size: 36px; color: var(--accent);">${state.budget}€</p>
            </div>
          </div>
        `;

      case 4: // RECAP
        return `
          <h2 class="clash mb-20">✅ Tout est prêt !</h2>
          <p class="text-2 mb-20" style="font-size: 14px;">Voici votre profil. On génère votre première liste.</p>
          <div class="card" style="padding: 0;">
            <div style="padding: 16px; border-bottom: 1px solid var(--border);">
              <p class="text-3" style="font-size: 11px; margin-bottom: 4px;">LOCALISATION</p>
              <p style="font-weight: 600;">${state.ville || 'Non précisée'}</p>
            </div>
            <div style="padding: 16px; border-bottom: 1px solid var(--border);">
              <p class="text-3" style="font-size: 11px; margin-bottom: 4px;">FOYER</p>
              <p style="font-weight: 600;">${state.personnes} pers. · ${state.regimes.join(', ') || 'Omnivore'}</p>
            </div>
            <div style="padding: 16px;">
              <p class="text-3" style="font-size: 11px; margin-bottom: 4px;">BUDGET</p>
              <p style="font-weight: 600; color: var(--green);">${state.budget}€ / ${state.periode}</p>
            </div>
          </div>
        `;
    }
  };

  const attachEvents = () => {
    const nextBtn = el.querySelector('#btn-next-step');
    const prevBtn = el.querySelector('#btn-prev-step');
    const skipBtn = el.querySelector('#btn-skip-step');

    if (nextBtn) nextBtn.onclick = () => {
      if (currentStep === totalSteps - 1) onGenerate();
      else { currentStep++; render(); }
    };
    if (prevBtn) prevBtn.onclick = () => {
      if (currentStep > 0) { currentStep--; render(); }
    };
    if (skipBtn) skipBtn.onclick = () => {
      currentStep++;
      render();
    };

    // Step-specific events
    if (currentStep === 0) {
      const input = el.querySelector('#input-ville');
      const resultsBox = el.querySelector('#autocomplete-results');
      let debounceTimer;

      input.oninput = (e) => {
        const query = e.target.value.trim();
        setVille(query);
        clearTimeout(debounceTimer);
        if (query.length < 3) { resultsBox.style.display = 'none'; return; }
        
        debounceTimer = setTimeout(async () => {
          try {
            const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
            const data = await res.json();
            resultsBox.innerHTML = '';
            if (data.features?.length) {
              data.features.forEach(f => {
                const item = document.createElement('div');
                item.style.padding = '10px';
                item.style.borderBottom = '1px solid var(--border)';
                item.style.cursor = 'pointer';
                item.innerHTML = `
                  <p style="font-weight:600; font-size:13px; margin:0;">${f.properties.label}</p>
                  <p style="font-size:10px; color:var(--text3); margin:0;">${f.properties.context}</p>
                `;
                item.onclick = () => {
                  input.value = f.properties.label;
                  setVille(f.properties.label);
                  // Store coordinates for the map
                  window.__userCoords = { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] };
                  resultsBox.style.display = 'none';
                };
                resultsBox.appendChild(item);
              });
              resultsBox.style.display = 'block';
            } else {
              resultsBox.style.display = 'none';
            }
          } catch (err) { console.error(err); }
        }, 300);
      };
    }
    if (currentStep === 1) {
      el.querySelectorAll('.num-btn').forEach(b => b.onclick = () => { setPeople(b.dataset.val); render(); });
      el.querySelectorAll('.chip').forEach(c => c.onclick = () => { toggleRegime(c.dataset.val); render(); });
      el.querySelector('#animals-section-host')?.replaceWith(createAnimalsSection());
    }
    if (currentStep === 2) {
      el.querySelectorAll('.chip[data-val]').forEach(c => c.onclick = () => {
        if (CUISINES.some(i => i.value === c.dataset.val)) toggleCuisine(c.dataset.val);
        else toggleExtra(c.dataset.val);
        render();
      });
      el.querySelector('#input-habitudes').oninput = (e) => setHabitudes(e.target.value);
    }
    if (currentStep === 3) {
      el.querySelectorAll('.freq-btn').forEach(c => c.onclick = () => { 
        setPeriode(c.dataset.val); 
        // Adjust budget defaults
        if (c.dataset.val === '1 mois' && getBudget() < 200) setBudget(450);
        if (c.dataset.val === '1 semaine' && getBudget() > 400) setBudget(120);
        render(); 
      });
      el.querySelectorAll('.profil-card').forEach(c => c.onclick = () => { 
        setProfilBudget(c.dataset.val); 
        render(); 
      });
      const slider = el.querySelector('#budget-slider');
      slider.oninput = (e) => {
        setBudget(e.target.value);
        el.querySelector('.clash[style*="accent"]').textContent = e.target.value + '€';
      };
    }
  };

  render();
  return el;
}
