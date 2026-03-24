/**
 * ResultsView.js – Panier Malin 3.0 (Mobile PWA)
 */

export function createResultsView(data, budget, onBack, storeData) {
  if (!data || !data.categories) {
    const empty = document.createElement('div');
    empty.style.padding = '40px'; empty.style.textAlign = 'center';
    empty.innerHTML = `<h2 class="clash">Aucune donnée</h2><button class="btn-main" id="btn-empty-back">Retour</button>`;
    setTimeout(() => { empty.querySelector('#btn-empty-back').onclick = onBack; }, 0);
    return empty;
  }
  const el = document.createElement('div');
  el.className = 'results-page';
  el.style.paddingTop = '10px';

  let selectedStore = storeData?.rawStores?.[0] || null;
  let checkedItems = new Set();

  const getStoreCategory = (name) => {
    const n = name.toLowerCase();
    if (n.includes('lidl') || n.includes('aldi') || n.includes('netto') || n.includes('leader price')) return 'discount';
    if (n.includes('monoprix') || n.includes('franprix') || n.includes('naturalia') || n.includes('biocoop') || n.includes('bio')) return 'premium';
    return 'standard';
  };

  const getMultiplier = (name) => {
    const cat = getStoreCategory(name);
    if (cat === 'discount') return 0.88;
    if (cat === 'premium') return 1.25;
    return 1.0;
  };

  const render = () => {
    const m = selectedStore ? getMultiplier(selectedStore.name) : 1;
    const currentTotal = data.total_estime * m;
    const pct = Math.min((currentTotal / budget) * 100, 100);

    el.innerHTML = `
      <!-- Budget Bar -->
      <div class="budget-bar">
        <div class="bb-track">
          <div class="bb-fill" style="width: ${pct}%"></div>
        </div>
        <div style="text-align: right;">
          <p class="bb-amt">${currentTotal.toFixed(2)}€</p>
          <p class="text-3" style="font-size: 10px;">Sur ${budget}€ max</p>
        </div>
      </div>

      <!-- Store Selector -->
      ${storeData?.rawStores?.length ? `
        <div style="margin-bottom: 20px;">
          <p class="field-label" style="font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 12px;">ENSEIGNES À PROXIMITÉ</p>
          <div style="display: flex; overflow-x: auto; gap: 12px; padding-bottom: 10px; scrollbar-width:none;">
            ${storeData.rawStores.slice(0, 5).map(s => {
              const active = selectedStore?.name === s.name;
              const storePrice = (data.total_estime * getMultiplier(s.name)).toFixed(2);
              return `
                <div class="card store-card ${active ? 'active' : ''}" data-name="${s.name}" style="flex: 0 0 160px; margin-bottom: 0; padding: 14px; cursor: pointer;">
                  <p class="clash" style="font-size: 14px; margin-bottom: 2px;">${s.name}</p>
                  <p class="green" style="font-weight: 700; font-size: 16px;">${storePrice}€</p>
                  <p class="text-3" style="font-size: 10px;">${s.dist}m · ${getStoreCategory(s.name)}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Articles List -->
      <div id="articles-list" class="responsive-grid" style="margin-top: 30px;">
        ${(data.categories ?? []).map(cat => `
          <div class="card" style="margin-bottom: 0; background: transparent; padding: 0; border: none;">
            <h3 class="clash" style="font-size: 15px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
              <span>${cat.emoji} ${cat.nom}</span>
              <span class="text-3" style="font-size: 11px;">${cat.articles.length} articles</span>
            </h3>
            ${cat.articles.map(a => {
              const id = `${cat.nom}-${a.nom}`;
              const done = checkedItems.has(id);
              return `
                <div class="li-item ${done ? 'done' : ''}" data-id="${id}">
                  <div class="chk">${done ? '✓' : ''}</div>
                  <div style="flex: 1;">
                    <p style="font-weight: 600; font-size: 14px;">${a.nom}</p>
                    <p class="text-3" style="font-size: 11px;">${a.quantite}</p>
                  </div>
                  <p class="clash" style="font-size: 15px;">${(a.prix_estime * m).toFixed(2)}€</p>
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>

      <div class="no-print" style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
         <button class="btn-ghost" id="btn-copy">📋 Copier</button>
         <button class="btn-ghost" id="btn-share">🔗 Partager</button>
      </div>
      <button class="btn-ghost" id="btn-re-gen" style="margin-top: 12px; border-style: dashed;">✏️ Modifier mes critères</button>
      <div style="height: 40px;"></div>
    `;

    attachEvents();
  };

  const attachEvents = () => {
    el.querySelectorAll('.store-card').forEach(card => {
      card.onclick = () => {
        selectedStore = storeData.rawStores.find(s => s.name === card.dataset.name);
        render();
      };
    });

    el.querySelectorAll('.li-item').forEach(item => {
      item.onclick = () => {
        const id = item.dataset.id;
        if (checkedItems.has(id)) checkedItems.delete(id);
        else checkedItems.add(id);
        render();
      };
    });

    el.querySelector('#btn-re-gen').onclick = onBack;

    el.querySelector('#btn-copy').onclick = () => {
      let text = `Ma liste Panier Malin (${selectedStore?.name || 'Total'}) : ${(data.total_estime * (selectedStore ? getMultiplier(selectedStore.name) : 1)).toFixed(2)}€\n\n`;
      data.categories.forEach(c => {
        text += `[${c.emoji} ${c.nom}]\n`;
        c.articles.forEach(a => text += `- ${a.nom} (${a.quantite})\n`);
        text += `\n`;
      });
      navigator.clipboard.writeText(text);
      alert('Liste copiée !');
    };

    el.querySelector('#btn-share').onclick = () => {
      if (navigator.share) {
        navigator.share({ title: 'Ma liste Panier Malin', text: 'Voici ma liste de courses intelligente !' });
      }
    };
  };

  render();
  return el;
}
