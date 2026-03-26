import { calculateTotal } from '../utils/price.js';
import { auth } from '../api/auth.js';
import { shopping } from '../api/shopping.js';
import { showToast } from './toast.js';

export function createResultsView(data, budget, userFamily, storeData, onListChange) {
  if (!data || !data.categories) {
    const empty = document.createElement('div');
    empty.style.padding = '40px'; empty.style.textAlign = 'center';
    empty.innerHTML = `<h2 class="clash">Aucune donnée</h2><button class="btn-main" id="btn-empty-back">Retour</button>`;
    setTimeout(() => { 
      const b = empty.querySelector('#btn-empty-back');
      if (b) b.onclick = () => window.__switchTab('setup'); 
    }, 0);
    return empty;
  }
  const el = document.createElement('div');
  el.className = 'results-page';
  el.style.paddingTop = '10px';

  let selectedStore = null; // Default to standard price (1.0)
  let checkedItems = new Set();
  
  // Local mutable state for editing
  let currentCategories = JSON.parse(JSON.stringify(data.categories));

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
    const currentTotal = calculateTotal(currentCategories, m);
    
    // Sync back to original data if needed for other views (with small tolerance to avoid loops)
    const diff = Math.abs(data.total_estime - currentTotal / m);
    if (diff > 0.01) {
      data.total_estime = currentTotal / m;
      data.categories = currentCategories;
      if (onListChange) onListChange();
    }

    const pct = Math.min((currentTotal / budget) * 100, 100);

    el.innerHTML = `
      <h2 class="clash no-print" style="font-size: 22px; margin-bottom: 20px;">Ma Liste Optimisée</h2>

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
        <div class="no-print" style="margin-bottom: 24px;">
          <p class="field-label" style="font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 12px;">COMPAREZ LES ENSEIGNES</p>
          <div class="h-scroll">
            ${storeData.rawStores.slice(0, 5).map(s => {
              const active = selectedStore?.name === s.name;
              const storePrice = (currentTotal / m * getMultiplier(s.name)).toFixed(2);
              return `
                <div class="card store-card ${active ? 'active' : ''}" data-name="${s.name}" style="flex: 0 0 140px; margin-bottom: 0; padding: 12px; cursor: pointer;">
                  <p class="clash" style="font-size: 13px; margin-bottom: 2px;">${s.name}</p>
                  <p class="green" style="font-weight: 700; font-size: 15px;">${storePrice}€</p>
                  <p class="text-3" style="font-size: 9px;">${s.dist}m · ${getStoreCategory(s.name)}</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Articles List -->
      <div id="articles-list" class="responsive-grid" style="margin-top: 10px;">
        ${currentCategories.map((cat, catIdx) => `
          <div class="card" style="margin-bottom: 0; background: transparent; padding: 0; border: none;">
            <h3 class="clash" style="font-size: 15px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
              <span>${cat.emoji} ${cat.nom}</span>
              <span class="text-3" style="font-size: 11px;">${cat.articles.length} articles</span>
            </h3>
            ${cat.articles.map((a, artIdx) => {
              const done = a.done;
              return `
                <div class="li-item ${done ? 'done' : ''}" data-cat="${catIdx}" data-art="${artIdx}">
                  <div class="chk">${done ? '✓' : ''}</div>
                  <div style="flex: 1;">
                    <p style="font-weight: 600; font-size: 14px;">${a.nom}</p>
                    <p class="text-3" style="font-size: 11px;">${a.quantite}</p>
                  </div>
                  <div style="text-align: right; display: flex; align-items: center; gap: 8px;">
                    <p class="clash" style="font-size: 15px;">${(a.prix_estime * m).toFixed(2)}€</p>
                    <div class="delete-item-btn no-print" data-cat="${catIdx}" data-art="${artIdx}">✕</div>
                  </div>
                </div>
              `;
            }).join('')}
            
            <!-- Quick Add for this category -->
            <div class="add-item-bar no-print" data-cat="${catIdx}">
              <input type="text" placeholder="Ajouter un article..." data-cat="${catIdx}">
              <div style="color: var(--accent); font-weight: 700; cursor: pointer; padding: 0 8px;" class="do-quick-add" data-cat="${catIdx}">+</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="no-print" style="margin-top: 40px; display: grid; grid-template-columns: 1fr; gap: 12px;">
         <button class="btn-main" id="btn-save-course" style="padding: 16px; font-size: 16px;">✅ Enregistrer la course</button>
      </div>

      <div class="no-print" style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
         <button class="btn-ghost" id="btn-print">🖨️ Imprimer</button>
         <button class="btn-ghost" id="btn-share">🔗 Partager</button>
      </div>
      <button class="btn-ghost no-print" id="btn-re-gen" style="margin-top: 12px; border-style: dashed;" onclick="window.__switchTab('setup')">✏️ Modifier mes préférences</button>
      <div style="height: 40px;"></div>
    `;

    attachEvents();
  };

  const attachEvents = () => {
    // Store Selection
    el.querySelectorAll('.store-card').forEach(card => {
      card.onclick = () => {
        selectedStore = storeData.rawStores.find(s => s.name === card.dataset.name);
        render();
      };
    });

    // Checkbox Toggle
    el.querySelectorAll('.li-item').forEach(item => {
      item.onclick = async (e) => {
        if (e.target.classList.contains('delete-item-btn')) return;
        
        const cIdx = parseInt(item.dataset.cat);
        const aIdx = parseInt(item.dataset.art);
        const article = currentCategories[cIdx].articles[aIdx];
        
        const newDone = !article.done;

        // If it's a new unsaved list, just toggle locally
        if (!article.id) {
          article.done = newDone;
          render();
          return;
        }

        try {
          const session = auth.getSession();
          await shopping.toggleItem(article.id, newDone, session?.id);
          article.done = newDone;
          render();
        } catch (err) {
          showToast('❌ Erreur de synchro');
          console.error(err);
        }
      };
    });

    // Delete Item
    el.querySelectorAll('.delete-item-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const cIdx = parseInt(btn.dataset.cat);
        const aIdx = parseInt(btn.dataset.art);
        currentCategories[cIdx].articles.splice(aIdx, 1);
        render();
      };
    });

    // Add Item
    el.querySelectorAll('.add-item-bar input').forEach(input => {
      input.onkeydown = (e) => {
        if (e.key === 'Enter') {
          const cIdx = parseInt(input.dataset.cat);
          const val = input.value.trim();
          if (val) {
            currentCategories[cIdx].articles.push({ nom: val, quantite: '1 unité', prix_estime: 2.50 });
            render();
          }
        }
      };
    });

    el.querySelectorAll('.do-quick-add').forEach(btn => {
      btn.onclick = () => {
        const cIdx = parseInt(btn.dataset.cat);
        const input = el.querySelector(`.add-item-bar input[data-cat="${cIdx}"]`);
        const val = input.value.trim();
        if (val) {
          currentCategories[cIdx].articles.push({ nom: val, quantite: '1 unité', prix_estime: 2.50 });
          render();
        }
      };
    });

    // General Actions
    el.querySelector('#btn-print').onclick = () => window.print();

    el.querySelector('#btn-save-course').onclick = async () => {
      const btn = el.querySelector('#btn-save-course');
      btn.disabled = true;
      btn.textContent = 'Chargement...';
      
      try {
        const session = auth.getSession();
        await shopping.saveActiveList({ 
          ...data, 
          categories: currentCategories,
          total_estime: (currentCategories.reduce((acc, c) => acc + c.articles.reduce((a, b) => a + (b.prix_estime || 0), 0), 0)).toFixed(2)
        }, session?.id, userFamily?.id);
        showToast('✅ Course enregistrée avec succès !');
        btn.textContent = 'Enregistré !';
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = '✅ Enregistrer la course';
        }, 2000);
      } catch (err) {
        showToast('❌ Erreur lors de la sauvegarde');
        console.error(err);
        btn.disabled = false;
        btn.textContent = '✅ Enregistrer la course';
      }
    };

    el.querySelector('#btn-share').onclick = () => {
      let text = `Ma liste Panier Malin :\n\n`;
      currentCategories.forEach(c => {
        text += `[${c.emoji} ${c.nom}]\n`;
        c.articles.forEach(a => text += `- ${a.nom} (${a.quantite})\n`);
        text += `\n`;
      });
      if (navigator.share) {
        navigator.share({ title: 'Ma liste Panier Malin', text });
      } else {
        navigator.clipboard.writeText(text);
        alert('Liste copiée dans le presse-papier !');
      }
    };
  };

  render();
  return el;
}
