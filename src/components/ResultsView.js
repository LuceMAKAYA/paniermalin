/**
 * ResultsView.js – Panier Malin 2.0
 */

/**
 * @param {object} data      - Réponse JSON de l'AI
 * @param {number} budget    - Budget max
 * @param {Function} onBack  - Retour au formulaire
 * @param {object} storeData - { rawStores, userLocation }
 */
export function createResultsView(data, budget, onBack, storeData) {
  const el = document.createElement('div');
  el.className = 'results-view visible';

  // --- 1. Internal State ---
  let selectedStore = null;
  let currentTotal = data.total_estime ?? 0;

  // --- 2. Store Heuristics ---
  const getStoreCategory = (name) => {
    const n = name.toLowerCase();
    if (n.includes('lidl') || n.includes('aldi') || n.includes('netto') || n.includes('leader price')) return 'discount';
    if (n.includes('monoprix') || n.includes('franprix') || n.includes('naturalia') || n.includes('biocoop') || n.includes('bio')) return 'premium';
    return 'standard';
  };

  const getMultiplier = (cat) => {
    if (cat === 'discount') return 0.88;
    if (cat === 'premium') return 1.25;
    return 1.0;
  };

  // --- 3. UI Helpers ---
  const renderStats = () => {
    const diff = budget - currentTotal;
    const isOver = diff < 0;
    const pct = Math.min((currentTotal / budget) * 100, 100);

    return `
      <div class="budget-stats">
        <div class="budget-stat">
          <div class="budget-stat-label">Total estimé</div>
          <div class="budget-stat-value accent">${currentTotal.toFixed(2)}€</div>
        </div>
        <div class="budget-stat">
          <div class="budget-stat-label">Budget</div>
          <div class="budget-stat-value muted">${budget}€</div>
        </div>
        <div class="budget-stat">
          <div class="budget-stat-label">${isOver ? 'Dépassement' : 'Restant'}</div>
          <div class="budget-stat-value ${isOver ? 'red' : 'green'}">${Math.abs(diff).toFixed(2)}€</div>
        </div>
      </div>
      <div class="progress-bg">
        <div class="progress-fill ${isOver ? 'over' : 'ok'}" style="width: ${pct}%"></div>
      </div>
    `;
  };

  const renderComparison = () => {
    if (!storeData?.rawStores?.length) return '';
    
    // Group stores by category to show variety
    const bestOfEach = { discount: null, standard: null, premium: null };
    storeData.rawStores.forEach(s => {
      const cat = getStoreCategory(s.name);
      if (!bestOfEach[cat]) bestOfEach[cat] = s;
    });

    return `
      <div class="comparison-grid">
        ${Object.entries(bestOfEach).filter(([_, s]) => s).map(([cat, s]) => {
          const m = getMultiplier(cat);
          const price = (data.total_estime * m).toFixed(2);
          return `
            <div class="compare-card ${selectedStore?.name === s.name ? 'active' : ''}" data-name="${s.name}" data-mult="${m}">
              <span class="compare-name">${s.name}</span>
              <span class="compare-price ${cat === 'discount' ? 'low' : ''}">${price}€</span>
              <span style="font-size: .65rem; color: var(--text-muted);">${cat.toUpperCase()}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  const renderArticles = () => {
    const m = selectedStore ? getMultiplier(getStoreCategory(selectedStore.name)) : 1;
    return (data.categories ?? []).filter(c => c.articles?.length).map(cat => {
      const catTotal = cat.articles.reduce((s, a) => s + (a.prix_estime * m), 0);
      return `
        <div class="cat-card">
          <div class="cat-card-head">
            <div class="cat-card-title">${cat.emoji ?? ''} ${cat.nom}</div>
            <div class="badge badge-green">${catTotal.toFixed(2)}€</div>
          </div>
          <div class="cat-card-body">
            ${cat.articles.map(a => `
              <div class="article-row">
                <div class="article-check"></div>
                <span class="article-name">${a.nom}</span>
                <span class="article-qty">${a.quantite}</span>
                <span class="article-price">${(a.prix_estime * m).toFixed(2)}€</span>
              </div>`).join('')}
          </div>
        </div>`;
    }).join('');
  };

  // --- 4. Main Template ---
  el.innerHTML = `
    <!-- Leaflet Resources -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    
    <div class="budget-summary no-print" id="budget-summary-box">
      ${renderStats()}
      <p style="font-size: .7rem; color: var(--text-muted); text-align: center; margin-top: 10px;">
        * Les prix s'ajustent selon l'enseigne sélectionnée ci-dessous.
      </p>
    </div>

    <div class="results-actions no-print">
      <button class="btn-action" id="btn-copy">📋 Copier</button>
      <button class="btn-action" id="btn-pdf">📄 PDF</button>
      <button class="btn-action" id="btn-share">🔗 Partager</button>
    </div>

    ${storeData?.rawStores?.length ? `
      <div id="map" class="map-container no-print"></div>
      <div id="comparison-host" class="no-print">${renderComparison()}</div>
    ` : ''}

    ${data.conseil ? `
      <div class="conseil-box">
        <span class="conseil-icon">💡</span>
        <p class="conseil-text">${data.conseil}</p>
      </div>` : ''}

    <div class="categories-grid" id="articles-host">${renderArticles()}</div>

    <button class="btn-back no-print" style="margin-top: 30px;">✏️ Modifier mes préférences</button>
    <div style="height: 40px;" class="no-print"></div>
  `;

  // --- 5. Interactivity ---
  const updateUI = () => {
    const m = selectedStore ? getMultiplier(getStoreCategory(selectedStore.name)) : 1;
    currentTotal = data.total_estime * m;
    
    el.querySelector('#budget-summary-box').innerHTML = renderStats() + 
      '<p style="font-size: .7rem; color: var(--text-muted); text-align: center; margin-top: 10px;">* Les prix s\'ajustent selon l\'enseigne sélectionnée.</p>';
    el.querySelector('#articles-host').innerHTML = renderArticles();
    if (el.querySelector('#comparison-host')) el.querySelector('#comparison-host').innerHTML = renderComparison();
    
    attachEvents();
  };

  const attachEvents = () => {
    el.querySelectorAll('.compare-card').forEach(card => {
      card.onclick = () => {
        const name = card.dataset.name;
        selectedStore = storeData.rawStores.find(s => s.name === name);
        updateUI();
      };
    });

    el.querySelectorAll('.article-row').forEach(row => {
      row.onclick = () => row.classList.toggle('checked');
    });

    el.querySelector('.btn-back').onclick = onBack;

    el.querySelector('#btn-copy').onclick = () => {
      let text = `Ma liste de courses Panier Malin\nTotal estimé : ${currentTotal.toFixed(2)}€\n\n`;
      data.categories.forEach(c => {
        text += `--- ${c.nom} ---\n`;
        c.articles.forEach(a => text += `- ${a.nom} (${a.quantite})\n`);
        text += `\n`;
      });
      navigator.clipboard.writeText(text);
      showToast('Copié dans le presse-papier !');
    };

    el.querySelector('#btn-pdf').onclick = () => window.print();

    el.querySelector('#btn-share').onclick = () => {
      if (navigator.share) {
        navigator.share({ title: 'Ma liste Panier Malin', text: `J'ai généré ma liste pour ${currentTotal.toFixed(2)}€ !` });
      } else {
        showToast('Partage non supporté sur ce navigateur');
      }
    };
  };

  const showToast = (msg) => {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  };

  // --- 6. Map Initialization ---
  if (storeData?.rawStores?.length) {
    // We need to load Leaflet script dynamically if not present
    const loadLeaflet = () => {
      if (window.L) { initMap(); return; }
      const script = document.createElement('script');
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      const mapEl = el.querySelector('#map');
      if (!mapEl) return;
      
      const map = L.map(mapEl).setView([storeData.userLocation.lat, storeData.userLocation.lon], 14);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      // User marker
      L.marker([storeData.userLocation.lat, storeData.userLocation.lon], {
        icon: L.divIcon({ html: '📍', className: 'map-user-icon', iconSize: [30, 30] })
      }).addTo(map).bindPopup("Vous êtes ici");

      // Stores markers
      storeData.rawStores.forEach(s => {
        const marker = L.marker([s.lat, s.lon]).addTo(map);
        marker.bindPopup(`<b>${s.name}</b><br>${s.type}<br>~${s.dist}m`);
        marker.on('click', () => {
          selectedStore = s;
          updateUI();
          map.setView([s.lat, s.lon], 15);
        });
      });
    };

    setTimeout(loadLeaflet, 100);
  }

  attachEvents();
  return el;
}
