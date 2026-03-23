/**
 * AnimalsSection.js – Gestion dynamique des panneaux animaux.
 */
import { ANIMAL_TYPES, ANIMAL_CONFIG } from '../config/animals.js';
import { addAnimal, removeAnimal, updateAnimal } from '../store.js';

export function createAnimalsSection() {
  const section = document.createElement('div');
  section.innerHTML = `
    <div class="card">
      <div class="section-title">
        <span class="section-icon">🐾</span> Animaux de compagnie
      </div>
      <div class="add-animal-row">
        ${ANIMAL_TYPES.map(t => `
          <button class="add-animal-btn" data-type="${t.key}">
            ${t.emoji} ${t.label}
          </button>`).join('')}
      </div>
      <div id="animals-container"></div>
    </div>
  `;

  section.querySelectorAll('.add-animal-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAdd(btn.dataset.type));
  });

  return section;
}

function handleAdd(type) {
  const cfg = ANIMAL_CONFIG[type];
  const id = addAnimal(type, cfg);
  renderPanel(id, type, cfg);
}

function renderPanel(id, type, cfg) {
  const container = document.getElementById('animals-container');
  const panel = document.createElement('div');
  panel.className = 'animal-panel';
  panel.id = `animal-${id}`;

  const marqueHtml = cfg.marques ? `
    <div class="chips-group form-field full">
      <span class="chips-label">Marque de croquettes</span>
      <div class="chips" id="marques-${id}">
        ${cfg.marques.map(m => `<button class="chip" data-value="${m}">${m}</button>`).join('')}
      </div>
    </div>` : '';

  const litiereHtml = cfg.litiere ? `
    <div class="chips-group form-field full">
      <span class="chips-label">Litière</span>
      <div class="chips" id="litiere-${id}">
        ${cfg.litiere.map(l => `<button class="chip" data-value="${l}">${l}</button>`).join('')}
      </div>
    </div>` : '';

  const friandisesHtml = cfg.friandises ? `
    <div class="chips-group form-field full">
      <span class="chips-label">Friandises</span>
      <div class="chips" id="friandises-${id}">
        ${cfg.friandises.map(f => `<button class="chip" data-value="${f}">${f}</button>`).join('')}
      </div>
    </div>` : '';

  panel.innerHTML = `
    <div class="animal-panel-header">
      <div class="animal-panel-title">${cfg.emoji} ${cfg.label} #${id}</div>
      <button class="btn-delete">🗑️ Supprimer</button>
    </div>
    <div class="form-grid">
      <div class="form-field">
        <label class="field-label">Prénom (optionnel)</label>
        <input class="input-text" id="an-name-${id}" type="text" placeholder="Ex : Milo" />
      </div>
      <div class="form-field">
        <label class="field-label">Nombre</label>
        <select class="input-select" id="an-count-${id}">
          <option>1</option><option>2</option><option>3</option><option>4+</option>
        </select>
      </div>
      <div class="form-field">
        <label class="field-label">Tranche d'âge</label>
        <select class="input-select" id="an-age-${id}">
          ${cfg.ages.map(a => `<option>${a}</option>`).join('')}
        </select>
      </div>
      <div class="form-field">
        <label class="field-label">Race / Gabarit</label>
        <input class="input-text" id="an-race-${id}" type="text" placeholder="Ex : Européen, Grand…" />
      </div>
      <div class="form-field full">
        <label class="field-label">Type d'alimentation</label>
        <select class="input-select" id="an-alim-${id}">
          ${cfg.aliments.map(a => `<option>${a}</option>`).join('')}
        </select>
      </div>
      ${marqueHtml}
      ${litiereHtml}
      ${friandisesHtml}
    </div>`;

  // Delete
  panel.querySelector('.btn-delete').addEventListener('click', () => {
    removeAnimal(id);
    panel.style.transition = 'all .2s';
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(-6px)';
    setTimeout(() => panel.remove(), 200);
  });

  // Text inputs → store
  panel.querySelector(`#an-name-${id}`).addEventListener('input', e => updateAnimal(id, 'name', e.target.value));
  panel.querySelector(`#an-race-${id}`).addEventListener('input', e => updateAnimal(id, 'race', e.target.value));
  panel.querySelector(`#an-count-${id}`).addEventListener('change', e => updateAnimal(id, 'count', e.target.value));
  panel.querySelector(`#an-age-${id}`).addEventListener('change', e => updateAnimal(id, 'age', e.target.value));
  panel.querySelector(`#an-alim-${id}`).addEventListener('change', e => updateAnimal(id, 'alim', e.target.value));

  // Single-select chips
  const attachChips = (containerId, field) => {
    const wrap = panel.querySelector(`#${containerId}`);
    if (!wrap) return;
    wrap.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        wrap.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        updateAnimal(id, field, chip.dataset.value);
      });
    });
  };
  attachChips(`marques-${id}`, 'marque');
  attachChips(`litiere-${id}`, 'litiere');
  attachChips(`friandises-${id}`, 'friandises');

  container.appendChild(panel);
}
