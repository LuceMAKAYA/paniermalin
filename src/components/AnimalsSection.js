/**
 * AnimalsSection.js – Gestion mobile-first des panneaux animaux.
 */
import { ANIMAL_TYPES, ANIMAL_CONFIG } from '../config/animals.js';
import { addAnimal, removeAnimal, updateAnimal } from '../store.js';

export function createAnimalsSection() {
  const section = document.createElement('div');
  section.className = 'animals-section-root';
  section.innerHTML = `
    <div class="card" style="margin-top: 20px; border-style: dashed; background: transparent;">
      <p class="field-label" style="font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 12px;">AJOUTER UN COMPAGNON 🐾</p>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${ANIMAL_TYPES.map(t => `
          <button class="num-btn add-animal-btn" data-type="${t.key}" style="flex: 1; padding: 10px; font-size: 13px;">
            ${t.emoji} ${t.label}
          </button>`).join('')}
      </div>
      <div id="animals-container" style="margin-top: 20px;"></div>
    </div>
  `;

  section.querySelectorAll('.add-animal-btn').forEach(btn => {
    btn.onclick = () => handleAdd(btn.dataset.type, section);
  });

  return section;
}

function handleAdd(type, section) {
  const cfg = ANIMAL_CONFIG[type];
  const id = addAnimal(type, cfg);
  renderPanel(id, type, cfg, section);
}

function renderPanel(id, type, cfg, section) {
  const container = section.querySelector('#animals-container');
  const panel = document.createElement('div');
  panel.className = 'card';
  panel.style.background = 'var(--bg2)';
  panel.style.padding = '16px';
  panel.id = `animal-${id}`;

  panel.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
      <h3 class="clash" style="font-size: 14px;">${cfg.emoji} ${cfg.label} #${id}</h3>
      <button class="btn-delete" style="background: none; border: none; font-size: 18px; cursor: pointer;">🗑️</button>
    </div>
    
    <input class="input-field" id="an-name-${id}" placeholder="Prénom (Milo, Rex...)" style="margin-bottom: 12px;">
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
       <div>
         <p class="text-3" style="font-size: 10px; margin-bottom: 4px;">NOMBRE</p>
         <input class="input-field" id="an-count-${id}" type="number" value="1" style="margin-bottom: 0;">
       </div>
       <div>
         <p class="text-3" style="font-size: 10px; margin-bottom: 4px;">ÂGE</p>
         <select class="input-field" id="an-age-${id}" style="margin-bottom: 0;">
           ${cfg.ages.map(a => `<option>${a}</option>`).join('')}
         </select>
       </div>
    </div>

    <p class="text-3" style="font-size: 10px; margin-bottom: 8px;">ALIMENTATION</p>
    <div class="chips-wrap" style="margin-bottom: 0;">
      ${cfg.aliments.map(a => `<span class="chip" data-field="alim" data-val="${a}">${a}</span>`).join('')}
    </div>
  `;

  // Events
  panel.querySelector('.btn-delete').onclick = () => {
    removeAnimal(id);
    panel.remove();
  };

  const nameInput = panel.querySelector(`#an-name-${id}`);
  nameInput.oninput = (e) => updateAnimal(id, 'name', e.target.value);

  panel.querySelectorAll('.chip').forEach(c => {
    c.onclick = () => {
      panel.querySelectorAll('.chip').forEach(x => x.classList.remove('on'));
      c.classList.add('on');
      updateAnimal(id, c.dataset.field, c.dataset.val);
    };
  });

  container.appendChild(panel);
}
