import { CUISINES, REGIMES, EXTRAS } from '../config/options.js';
import { createAnimalsSection } from './AnimalsSection.js';
import {
  toggleCuisine, toggleRegime, toggleExtra,
  setPeople, setBudget, getBudget, setPlats, setHabitudes, setPeriode,
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
      <div class="stepper-header no-print" style="padding: 20px 24px; display: flex; align-items: center; gap: 15px;">
        <div class="progress-track" style="height: 6px; flex: 1; background: var(--bg2); border-radius: 10px; overflow: hidden; border: 1px solid var(--border);">
          <div class="progress-fill" style="width: ${((currentStep + 1) / totalSteps) * 100}%; height: 100%; background: var(--accent-grad); transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);"></div>
        </div>
        <div style="font-size: 11px; font-weight: 800; color: var(--accent); letter-spacing: 1px; text-transform: uppercase;">
          ${currentStep + 1} / ${totalSteps}
        </div>
      </div>

      <div class="scroll-area animate-fade-up" id="setup-scroll" style="padding: 0 24px 20px;">
        ${renderStepContent(currentStep, state)}
      </div>

      <div class="no-print" style="padding: 16px 24px 30px; background: linear-gradient(to top, var(--bg), transparent);">
        <button class="btn-premium" id="btn-next-step">
          ${currentStep === totalSteps - 1 ? '🪄 Générer ma liste !' : 'Continuer'}
          <span style="font-size: 18px;">${currentStep === totalSteps - 1 ? '' : '→'}</span>
        </button>
        <div style="display: flex; gap: 12px; margin-top: 15px;">
          ${currentStep > 0 ? `<button class="btn-ghost" id="btn-prev-step" style="flex: 1; margin: 0;">Précédent</button>` : ''}
          ${currentStep < totalSteps - 1 ? `<button class="btn-ghost" id="btn-skip-step" style="flex: 1; margin: 0; color: var(--text3);">Passer l'étape</button>` : ''}
        </div>
      </div>
    `;

    attachEvents();
  };

  const renderStepContent = (step, state) => {
    switch (step) {
      case 0: // LOCALISATION
        return `
          <h2 class="clash mb-20" style="font-size: 28px; line-height: 1.2;">📍 Votre adresse</h2>
          <p class="text-2 mb-20" style="font-size: 14px; opacity: 0.8;">Trouvons les magasins les mieux notés près de chez vous.</p>
          
          <div style="position: relative; margin-bottom: 30px;">
            <p class="field-label" style="font-size: 11px; font-weight: 800; color: var(--accent); margin-bottom: 10px; letter-spacing: 0.5px;">ADRESSE DE LIVRAISON OU COURSE</p>
            <input class="input-field" id="input-ville" placeholder="Ex: 15 rue du Palais, Auxerre" value="${state.ville || ''}" style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px;">
            <div id="autocomplete-results" class="card glass" style="display:none; position:absolute; z-index:100; width:100%; top:75px; padding:0; overflow:hidden; border-color: var(--accent); box-shadow: var(--shadow-lg);"></div>
          </div>

          <div class="card" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%); border-color: rgba(16, 185, 129, 0.2); display: flex; align-items: center; gap: 20px; padding: 20px;">
            <div style="font-size: 32px; filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.3));">🌿</div>
            <div>
              <p style="font-size: 11px; font-weight: 900; color: var(--green); letter-spacing: 1px; margin-bottom: 6px;">PRODUITS DE SAISON • MARS</p>
              <p style="font-size: 12px; color: var(--text); line-height: 1.5; font-weight: 500;">Épinards, Brocolis, Carottes, Cabillaud, Fraises de serre.</p>
            </div>
          </div>
        `;

      case 1: // FOYER
        return `
          <h2 class="clash mb-20" style="font-size: 28px; line-height: 1.2;">👥 Votre foyer</h2>
          <p class="text-2 mb-20" style="font-size: 14px; opacity: 0.8;">Adaptons les quantités pour tout le monde.</p>
          
          <p class="field-label" style="font-size: 11px; font-weight: 800; color: var(--accent); margin-bottom: 12px; letter-spacing: 0.5px;">NOMBRE DE PERSONNES</p>
          <div class="num-row" style="margin-bottom: 24px; display: flex; gap: 8px;">
            ${['1','2','3','4','5','6+'].map(n => `
              <button class="num-btn ${state.personnes === n ? 'on' : ''}" data-val="${n}" style="flex:1; padding: 12px 0; border-radius: 10px; border: 1px solid var(--border); background: var(--bg2); color: var(--text2); font-weight: 700; transition: all 0.2s;">${n}</button>
            `).join('')}
          </div>

          <p class="field-label" style="font-size: 11px; font-weight: 800; color: var(--accent); margin-bottom: 12px; letter-spacing: 0.5px;">RÉGIME ALIMENTAIRE</p>
          <div class="chips-wrap" style="margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 10px;">
            ${REGIMES.map(r => `
              <span class="chip ${state.regimes.includes(r.value) ? 'active' : ''}" data-val="${r.value}" style="font-weight: 600;">${r.value}</span>
            `).join('')}
          </div>
          <div id="animals-section-host"></div>
        `;

      case 2: // CUISINE
        return `
          <h2 class="clash mb-20" style="font-size: 28px; line-height: 1.2;">🍽️ Vos préférences</h2>
          <p class="text-2 mb-20" style="font-size: 14px; opacity: 0.8;">Qu'est-ce qui vous fait envie cette semaine ?</p>
          
          <p class="field-label" style="font-size: 11px; font-weight: 800; color: var(--accent); margin-bottom: 12px; letter-spacing: 0.5px;">CUISINES FAVORITES</p>
          <div class="chips-wrap" style="margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 10px;">
            ${CUISINES.map(c => `
              <span class="chip ${state.cuisines.includes(c.value) ? 'active' : ''}" data-val="${c.value}" style="font-weight: 600;">${c.emoji} ${c.value}</span>
            `).join('')}
          </div>

          <p class="field-label" style="font-size: 11px; font-weight: 800; color: var(--accent); margin-bottom: 12px; letter-spacing: 0.5px;">CATÉGORIES SUPPLÉMENTAIRES</p>
          <div class="chips-wrap" style="margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 10px;">
            ${EXTRAS.map(e => `
              <span class="chip ${state.extras.includes(e.value) ? 'active' : ''}" data-val="${e.value}" style="font-weight: 600;">${e.emoji} ${e.value}</span>
            `).join('')}
          </div>

          <p class="field-label" style="font-size: 11px; font-weight: 800; color: var(--accent); margin-bottom: 12px; letter-spacing: 0.5px;">NOTES PARTICULIÈRES</p>
          <textarea class="input-field" id="input-habitudes" rows="3" style="resize:none; padding:16px; font-size:14px; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--border);" placeholder="Ex: Toujours du lait bio, courses le samedi...">${state.habitudes || ''}</textarea>
        `;

      case 3: // BUDGET
        return `
          <h2 class="clash mb-20" style="font-size: 28px; line-height: 1.2;">💶 Budget & Fréquence</h2>
          <p class="text-2 mb-20" style="font-size: 14px; opacity: 0.8;">Gérez votre portefeuille intelligemment.</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
            <div class="card" style="padding: 16px; background: var(--bg2); margin: 0; border-color: var(--border);">
              <p class="field-label" style="font-size: 10px; font-weight: 800; color: var(--accent); margin-bottom: 10px; letter-spacing: 0.5px;">FRÉQUENCE</p>
              <div style="display: flex; gap: 4px; background: var(--bg); padding: 4px; border-radius: 10px; border: 1px solid var(--border);">
                <button class="freq-btn ${state.periode.includes('semaine') ? 'on' : ''}" data-val="1 semaine" style="flex:1; border:none; border-radius:8px; font-size:10px; padding:10px 0; background:${state.periode.includes('semaine') ? 'var(--accent-grad)' : 'transparent'}; color:white; font-weight:700; transition: all 0.3s;">SEMAINE</button>
                <button class="freq-btn ${state.periode.includes('mois') ? 'on' : ''}" data-val="1 mois" style="flex:1; border:none; border-radius:8px; font-size:10px; padding:10px 0; background:${state.periode.includes('mois') ? 'var(--accent-grad)' : 'transparent'}; color:white; font-weight:700; transition: all 0.3s;">MOIS</button>
              </div>
            </div>
            <div class="card" style="padding: 16px; background: var(--bg2); margin: 0; border-color: var(--border);">
              <p class="field-label" style="font-size: 10px; font-weight: 800; color: var(--accent); margin-bottom: 10px; letter-spacing: 0.5px;">STRATÉGIE</p>
              <div style="display: flex; gap: 4px; background: var(--bg); padding: 4px; border-radius: 10px; border: 1px solid var(--border);">
                <button class="profil-card ${state.profilBudget === 'equilibre' ? 'on' : ''}" data-val="equilibre" style="flex:1; border:none; border-radius:8px; font-size:10px; padding:10px 0; background:${state.profilBudget === 'equilibre' ? 'var(--accent-grad)' : 'transparent'}; color:white; font-weight:700; transition: all 0.3s;">ÉQUILIBRE</button>
                <button class="profil-card ${state.profilBudget === 'tres_econome' ? 'on' : ''}" data-val="tres_econome" style="flex:1; border:none; border-radius:8px; font-size:10px; padding:10px 0; background:${state.profilBudget === 'tres_econome' ? 'var(--accent-grad)' : 'transparent'}; color:white; font-weight:700; transition: all 0.3s;">ÉCONOME</button>
              </div>
            </div>
          </div>

          <p class="field-label" style="font-size: 11px; font-weight: 800; color: var(--accent); margin-bottom: 12px; letter-spacing: 0.5px;">BUDGET CIBLE POUR ${state.periode.toUpperCase()}</p>
          <div class="card glass" style="padding: 30px; border-color: var(--accent);">
            <input type="range" id="budget-slider" min="20" max="${state.periode.includes('mois') ? 1200 : 400}" step="10" value="${state.budget}" style="width:100%; accent-color: var(--accent); margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 25px;">
               <div style="display: flex; align-items: center; gap: 12px;">
                 <div style="width: 46px; height: 46px; border-radius: 23px; background: rgba(59,130,246,0.1); display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 0 20px rgba(59,130,246,0.2);">💶</div>
                 <p class="text-3" style="font-size: 12px; font-weight: 600; color: var(--text2);">Budget total estimé</p>
               </div>
               <p class="clash" style="font-size: 38px; color: var(--accent); text-shadow: 0 0 20px rgba(59,130,246,0.3);">${state.budget}€</p>
            </div>
          </div>
        `;

      case 4: // RECAP
        return `
          <h2 class="clash mb-20" style="font-size: 28px; line-height: 1.2;">✅ Votre profil est prêt !</h2>
          <p class="text-2 mb-20" style="font-size: 14px; opacity: 0.8;">L'IA va maintenant analyser vos choix pour générer votre panier idéal.</p>
          
          <div class="card glass" style="padding: 0; overflow: hidden; border-color: var(--border2);">
            <div style="padding: 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 20px; background: rgba(255,255,255,0.02);">
              <div style="font-size: 28px; width: 50px; height: 50px; background: var(--bg); border-radius: 12px; display: flex; align-items: center; justify-content: center;">📍</div>
              <div>
                <p class="text-3" style="font-size: 10px; font-weight: 800; letter-spacing: 1px; color: var(--accent); margin-bottom: 4px;">LOCALISATION</p>
                <p style="font-weight: 700; font-size: 15px;">${state.ville || 'Zone personnalisée'}</p>
              </div>
            </div>
            <div style="padding: 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 20px; background: rgba(255,255,255,0.01);">
              <div style="font-size: 28px; width: 50px; height: 50px; background: var(--bg); border-radius: 12px; display: flex; align-items: center; justify-content: center;">👥</div>
              <div>
                <p class="text-3" style="font-size: 10px; font-weight: 800; letter-spacing: 1px; color: var(--accent); margin-bottom: 4px;">FOYER & RÉGIME</p>
                <p style="font-weight: 700; font-size: 15px;">${state.personnes} pers. · ${state.regimes.join(', ') || 'Omnivore'}</p>
              </div>
            </div>
            <div style="padding: 24px; display: flex; align-items: center; gap: 20px;">
              <div style="font-size: 28px; width: 50px; height: 50px; background: var(--bg); border-radius: 12px; display: flex; align-items: center; justify-content: center;">💰</div>
              <div>
                <p class="text-3" style="font-size: 10px; font-weight: 800; letter-spacing: 1px; color: var(--accent); margin-bottom: 4px;">STRATÉGIE BUDGET</p>
                <p style="font-weight: 700; font-size: 15px; color: var(--green);">${state.budget}€ / ${state.periode}</p>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; opacity: 0.6; font-size: 12px; font-style: italic;">
            ✨ Analyse de saison et optimisation nutritive incluses
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
        const cb = getBudget();
        if (c.dataset.val === '1 mois' && cb < 200) setBudget(450);
        if (c.dataset.val === '1 semaine' && cb > 400) setBudget(120);
        render(); 
      });
      el.querySelectorAll('.profil-card').forEach(c => c.onclick = () => { 
        setProfilBudget(c.dataset.val); 
        render(); 
      });
      const slider = el.querySelector('#budget-slider');
      if (slider) {
        slider.oninput = (e) => {
          setBudget(e.target.value);
          const valDisplay = el.querySelector('.clash[style*="accent"]');
          if (valDisplay) valDisplay.textContent = e.target.value + '€';
        };
      }
    }
  };

  render();
  return el;
}
