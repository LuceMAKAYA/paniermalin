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

    // Fix #5: build a fresh snapshot rather than mutating the 'data' argument.
    // onListChange is called only when the user actually modifies the list
    // (deletion / quick-add), not on every render, to avoid infinite re-render loops.
    const pct = Math.min((currentTotal / budget) * 100, 100);

    el.innerHTML = `
      <div class="glass animate-fade-up" style="padding: 24px; border-radius: 0 0 24px 24px; margin: -10px -24px 24px; border-top: none;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
          <div>
            <h2 class="clash" style="font-size: 24px; color: var(--text); line-height: 1.1;">Ma Liste</h2>
            <p class="text-3" style="font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.5px;">Optimisée par l'IA</p>
          </div>
          <div style="text-align: right;">
            <p class="clash" style="font-size: 28px; color: var(--accent); line-height: 1;">${currentTotal.toFixed(2)}€</p>
            <p class="text-3" style="font-size: 10px; font-weight: 600;">budget: ${budget}€</p>
          </div>
        </div>

        <!-- Budget Bar -->
        <div class="budget-bar" style="height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
          <div class="bb-fill" style="width: ${pct}%; height: 100%; background: ${pct > 90 ? 'var(--red)' : 'var(--accent-grad)'}; transition: width 1s ease; box-shadow: 0 0 10px ${pct > 90 ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)'};"></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
             <p class="text-3" style="font-size: 10px; font-weight: 700;">DÉPENSÉ : ${Math.round(pct)}%</p>
             <p style="font-size: 10px; font-weight: 800; color: ${currentTotal <= budget ? 'var(--green)' : 'var(--red)'};">
               ${currentTotal <= budget ? '✓ SOUS BUDGET' : '⚠️ HORS BUDGET'}
             </p>
        </div>
      </div>

      <!-- IA Suggestion Banner (NEW) -->
      ${data.conseil ? `
        <div class="card animate-fade-up" style="background: linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(167, 139, 250, 0.05) 100%); border-color: rgba(167, 139, 250, 0.3); padding: 16px 20px; display: flex; gap: 15px; align-items: center; margin-bottom: 24px;">
          <div style="font-size: 24px; animation: pulse 2s infinite;">✨</div>
          <p style="font-size: 13px; font-weight: 500; color: var(--text); line-height: 1.4;">
            <span style="color: var(--purple); font-weight: 800; font-size: 11px; display: block; margin-bottom: 2px;">L'IA SUGGÈRE</span>
            ${data.conseil}
          </p>
        </div>
      ` : ''}

      <!-- Store Selector -->
      ${storeData?.rawStores?.length ? `
        <div class="no-print" style="margin-bottom: 30px;">
          <p class="field-label" style="font-size: 11px; font-weight: 800; color: var(--accent); margin-bottom: 12px; letter-spacing: 0.5px;">COMPAREZ LES ENSEIGNES</p>
          <div class="h-scroll">
            ${storeData.rawStores.slice(0, 5).map(s => {
              const active = selectedStore?.name === s.name;
              const storePrice = (currentTotal / m * getMultiplier(s.name)).toFixed(2);
              const cat = getStoreCategory(s.name);
              return `
                <div class="card glass store-card ${active ? 'active' : ''}" data-name="${s.name}" style="flex: 0 0 150px; margin-bottom: 0; padding: 16px; cursor: pointer; border-color: ${active ? 'var(--accent)' : 'var(--border)'}; background: ${active ? 'rgba(59,130,246,0.1)' : 'var(--card)'};">
                  <p class="clash" style="font-size: 14px; margin-bottom: 4px; color: ${active ? 'var(--accent)' : 'var(--text)'};">${s.name}</p>
                  <p style="font-weight: 800; font-size: 18px; color: var(--green); margin-bottom: 4px;">${storePrice}€</p>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="text-3" style="font-size: 9px; font-weight: 700;">${s.dist}m</span>
                    <span class="badge" style="font-size: 8px; background: rgba(255,255,255,0.05);">${cat}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Articles List -->
      <div id="articles-list" class="responsive-grid" style="margin-top: 10px; gap: 20px;">
        ${currentCategories.map((cat, catIdx) => `
          <div class="animate-fade-up" style="animation-delay: ${catIdx * 0.1}s;">
            <h3 class="clash" style="font-size: 16px; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between; padding-left: 4px;">
              <span style="display: flex; align-items: center; gap: 10px;">
                <span style="width: 32px; height: 32px; background: var(--bg2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">${cat.emoji}</span>
                ${cat.nom}
              </span>
              <span class="badge" style="background: var(--bg2); color: var(--text2);">${cat.articles.length}</span>
            </h3>
            
            <div class="card" style="padding: 4px; background: rgba(255,255,255,0.01); border-color: var(--border);">
              ${cat.articles.map((a, artIdx) => {
                const done = a.done;
                return `
                  <div class="li-item ${done ? 'done' : ''}" data-cat="${catIdx}" data-art="${artIdx}" style="padding: 14px 16px; border-radius: 12px; margin-bottom: 2px; transition: all 0.2s;">
                    <div class="chk" style="width: 22px; height: 22px; border-radius: 6px; border: 2px solid ${done ? 'var(--green)' : 'var(--border2)'}; background: ${done ? 'var(--green)' : 'transparent'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900;">${done ? '✓' : ''}</div>
                    <div style="flex: 1; margin-left: 14px;">
                      <p style="font-weight: 600; font-size: 14px; color: ${done ? 'var(--text3)' : 'var(--text)'}; text-decoration: ${done ? 'line-through' : 'none'}; transition: all 0.3s;">${a.nom}</p>
                      <p class="text-3" style="font-size: 11px; font-weight: 600;">${a.quantite}</p>
                    </div>
                    <div style="text-align: right; display: flex; align-items: center; gap: 12px;">
                      <p class="clash" style="font-size: 15px; color: ${done ? 'var(--text3)' : 'var(--text)'};">${(a.prix_estime * m).toFixed(2)}€</p>
                      <div class="delete-item-btn no-print" data-cat="${catIdx}" data-art="${artIdx}" style="opacity: 0.3; font-size: 14px; cursor: pointer;">✕</div>
                    </div>
                  </div>
                `;
              }).join('')}
              
              <!-- Quick Add -->
              <div class="add-item-bar no-print" data-cat="${catIdx}" style="padding: 10px 16px; background: transparent; border-top: 1px solid var(--border); margin-top: 4px;">
                <input type="text" placeholder="Ajouter un article..." data-cat="${catIdx}" style="background:transparent; border:none; color:var(--text); font-size:13px; font-weight:500; outline:none; width:100%;">
                <div style="color: var(--accent); font-weight: 900; cursor: pointer; font-size: 20px;" class="do-quick-add" data-cat="${catIdx}">+</div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="no-print" style="margin-top: 40px; display: grid; grid-template-columns: 1fr; gap: 16px; padding-bottom: 20px;">
         <button class="btn-premium" id="btn-save-course">
           ✅ Terminer la course
         </button>
         
         <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <button class="btn-ghost" id="btn-print" style="margin:0;">🖨️ Imprimer</button>
            <button class="btn-ghost" id="btn-share" style="margin:0;">🔗 Partager</button>
         </div>
         
         <button class="btn-ghost" id="btn-re-gen" style="margin-top: 8px; border-style: dashed; opacity: 0.7;" onclick="window.__switchTab('setup')">✏️ Modifier mes préférences</button>
      </div>
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
        // Fix #5: notify parent only on explicit user mutation
        if (onListChange) onListChange({ ...data, categories: currentCategories });
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
          // Fix #5: notify parent only on explicit user mutation
          if (onListChange) onListChange({ ...data, categories: currentCategories });
        }
      };
    });

    // General Actions
    el.querySelector('#btn-print').onclick = () => window.print();

    el.querySelector('#btn-save-course').onclick = async () => {
      const btn = el.querySelector('#btn-save-course');
      const currentUser = auth.getSession();

      if (currentUser?.type === 'guest') {
        showToast('✨ Course terminée (Mode Invité)');
        if (onListChange) onListChange(null);
        window.__switchTab('home');
        return;
      }

      if (!data.id) {
        showToast('⚠️ Liste non sauvegardée en DB');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Archivage...';

      try {
        await shopping.completeList(data.id, currentTotal/m);
        showToast('✅ Course archivée avec succès !');
        if (onListChange) onListChange(null);
        window.__switchTab('home');
      } catch (err) {
        showToast('❌ Erreur lors de l\'archivage');
        console.error(err);
        btn.disabled = false;
        btn.textContent = 'Terminer la course';
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
